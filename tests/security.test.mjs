import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// Real embedded PostgreSQL. Auth schema is a fixture, not a mock of RLS or SQL.
const db = new PGlite();
const master = '10000000-0000-4000-8000-000000000001';
const other = '10000000-0000-4000-8000-000000000002';
const session = '20000000-0000-4000-8000-000000000001';
await db.exec(`
  create role anon; create role authenticated;
  create schema auth;
  create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}', email_confirmed_at timestamptz, banned_until timestamptz);
  create table auth.sessions(id uuid primary key,user_id uuid references auth.users,created_at timestamptz default now(),not_after timestamptz);
  create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
  create function auth.uid() returns uuid language sql stable as $$select (auth.jwt()->>'sub')::uuid$$;
  grant usage on schema auth,public to anon,authenticated;
`);
const initial = await readFile(new URL('../supabase/migrations/20260918000100_initial_backend.sql',import.meta.url),'utf8');
// PGlite has gen_random_uuid in core; only the unavailable extension declaration is omitted.
await db.exec(initial.replace('create extension if not exists pgcrypto;',''));
await db.exec(await readFile(new URL('../supabase/seed.sql',import.meta.url),'utf8'));
await db.exec(`insert into auth.users(id,email,email_confirmed_at) values
  ('${master}','master@example.test',now()),('${other}','outsider@example.test',now());
  update public.profiles set role='admin';
  insert into auth.sessions(id,user_id) values('${session}','${master}');`);
await db.exec(await readFile(new URL('../supabase/migrations/20260918000200_security.sql',import.meta.url),'utf8'));
await db.exec(await readFile(new URL('../supabase/migrations/20260919000400_remove_mfa_requirement.sql',import.meta.url),'utf8'));
await db.exec(`insert into private.master_access(slot,email,user_id) values(1,'master@example.test','${master}');`);
const account = (await db.query('select id from public.financial_accounts limit 1')).rows[0].id;

async function asUser(id=master, aal='aal2') {
  await db.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({sub:id,aal,session_id:session})]);
  await db.exec('set local role authenticated');
}
async function tx(work) {
  await db.exec('begin');
  try { await work(); } finally { await db.exec('rollback'); }
}
async function denied(sql, params=[]) {
  await db.exec('savepoint denied');
  await assert.rejects(db.query(sql,params));
  await db.exec('rollback to savepoint denied');
}
async function fixture(quantity=1) {
  const p=(await db.query("insert into public.products(name) values('Test') returning id")).rows[0].id;
  await db.query("select public.adjust_stock($1,$2,'in','Initial test',gen_random_uuid())",[p,quantity]);
  const o=(await db.query('insert into public.orders default values returning id')).rows[0].id;
  await db.query("insert into public.order_items(order_id,product_id,product_name_snapshot,quantity,unit_price) values($1,$2,'Test',1,100)",[o,p]);
  return {o,p};
}

test('anonymous cannot read customers or execute payment functions',()=>tx(async()=>{
  await db.exec('set local role anon');
  await denied('select * from public.customers');
  await denied('select public.mark_order_sold(gen_random_uuid())');
}));
test('non-master fails closed while master can operate without MFA',()=>tx(async()=>{
  await asUser(master,'aal1');
  assert.equal((await db.query('select public.is_active_staff() ok')).rows[0].ok,true);
  await db.query("insert into public.customers(name) values('Authorized without MFA')");
  await db.exec('reset role'); await asUser(other);
  await denied('select public.mark_order_sold(gen_random_uuid())');
}));
test('third master slot and uninvited signup are rejected',()=>tx(async()=>{
  await denied("insert into private.master_access(slot,email) values(3,'third@example.test')");
  await denied("insert into auth.users(id,email) values(gen_random_uuid(),'stranger@example.test')");
}));
test('disabled profile, revoked master, missing and expired session immediately deny access',()=>tx(async()=>{
  for (const change of [
    `update public.profiles set active=false where id='${master}'`,
    'update private.master_access set enabled=false',
    `delete from auth.sessions where id='${session}'`,
    "update auth.sessions set created_at=now()-interval '9 hours'"
  ]) {
    await db.exec('savepoint state'); await db.exec(change); await asUser();
    assert.equal((await db.query('select public.is_active_staff() ok')).rows[0].ok,false);
    await db.exec('rollback to savepoint state');
  }
}));
test('master cannot promote users, forge audit, write payment or change order status directly',()=>tx(async()=>{
  await asUser();
  await denied("update public.profiles set role='admin'");
  await denied("insert into public.audit_logs(action,entity_type) values('fake','fake')");
  await denied("update public.orders set status='sold'");
  await denied('delete from public.financial_transactions');
  await denied('insert into public.order_payments default values');
  await denied('select * from private.master_access');
}));
test('sale reduces stock once and second order cannot oversell',()=>tx(async()=>{
  await asUser(); const {o,p}=await fixture();
  await db.query('select public.mark_order_sold($1)',[o]);
  await db.query('select public.mark_order_sold($1)',[o]);
  assert.equal((await db.query('select current_stock from public.product_stock where id=$1',[p])).rows[0].current_stock,0);
  const o2=(await db.query('insert into public.orders default values returning id')).rows[0].id;
  await db.query("insert into public.order_items(order_id,product_id,product_name_snapshot,quantity,unit_price) values($1,$2,'Test',1,100)",[o2,p]);
  await denied('select public.mark_order_sold($1)',[o2]);
  await denied('update public.order_items set quantity=2 where order_id=$1',[o]);
}));
test('payment retries have one ledger entry and partial/total payments are correct',()=>tx(async()=>{
  await asUser(); const {o}=await fixture();
  const key='30000000-0000-4000-8000-000000000001';
  const sql="select (public.record_order_payment($1,$2,'pix',$3,$4)).id";
  const args=[o,40,account,key];
  const a=await db.query(sql,args), b=await db.query(sql,args);
  assert.equal(a.rows[0].id,b.rows[0].id);
  assert.equal((await db.query('select payment_status from public.orders where id=$1',[o])).rows[0].payment_status,'partially_paid');
  assert.equal(Number((await db.query('select sum(amount) n from public.financial_transactions')).rows[0].n),40);
  await denied(sql,[o,41,account,key]);
  await denied(sql,[o,61,account,'30000000-0000-4000-8000-000000000002']);
  await db.query(sql,[o,60,account,'30000000-0000-4000-8000-000000000003']);
  assert.equal((await db.query('select payment_status from public.orders where id=$1',[o])).rows[0].payment_status,'paid');
  await denied('update public.order_items set unit_price=200 where order_id=$1',[o]);
}));
test('invalid amounts and dates rejected',()=>tx(async()=>{
  await asUser(); const {o}=await fixture();
  for(const amount of [null,0,-1,'NaN','Infinity','1.001']) {
    await denied("select public.record_order_payment($1,$2,'pix',$3,gen_random_uuid())",[o,amount,account]);
  }
}));
test('installments preserve cents, month end and idempotent settlement',()=>tx(async()=>{
  await asUser();
  const c=(await db.query("insert into public.customers(name) values('Private Name') returning id")).rows[0].id;
  const a=(await db.query("insert into public.receivable_agreements(customer_id,total_amount,installment_count,installment_amount,first_due_date,due_day) values($1,1,6,0.16,'2026-01-31',31) returning id",[c])).rows[0].id;
  const rows=(await db.query('select id,amount,due_date::text d from public.receivable_installments where agreement_id=$1 order by installment_number',[a])).rows;
  assert.equal(rows[1].d,'2026-02-28');
  assert.equal(rows.at(-1).amount,'0.20');
  for(const i of rows) {
    const key=(await db.query('select gen_random_uuid() id')).rows[0].id;
    const sql="select (public.record_installment_payment($1,$2,'pix',$3,$4)).id";
    const args=[i.id,i.amount,account,key];
    assert.equal((await db.query(sql,args)).rows[0].id,(await db.query(sql,args)).rows[0].id);
  }
  assert.equal((await db.query('select status from public.receivable_agreements where id=$1',[a])).rows[0].status,'completed');
  assert.equal(Number((await db.query('select sum(amount) n from public.financial_transactions')).rows[0].n),1);
  const audit=(await db.query('select * from public.audit_logs')).rows;
  assert(audit.some(r=>r.entity_type==='public.customers' && r.user_id===master));
  assert(!JSON.stringify(audit).includes('Private Name'));
}));
after(()=>db.close());
