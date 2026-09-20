-- Dados iniciais seguros para desenvolvimento.
-- Este arquivo não cria usuários nem dados de clientes reais.

insert into public.configuracoes_loja (id, store_name, currency, timezone)
values (true, 'Finesse Silver', 'BRL', 'America/Sao_Paulo')
on conflict (id) do update
set store_name = excluded.store_name,
    currency = excluded.currency,
    timezone = excluded.timezone;

insert into public.categorias (name, description)
select name, description
from (
  values
    ('Anéis', 'Anéis e alianças em prata 925'),
    ('Brincos', 'Brincos em prata 925'),
    ('Colares', 'Colares e correntes em prata 925'),
    ('Pulseiras', 'Pulseiras em prata 925'),
    ('Pingentes', 'Pingentes e charms'),
    ('Acessórios', 'Embalagens e acessórios complementares')
) as defaults(name, description)
where not exists (
  select 1 from public.categorias c where c.name = defaults.name
);

insert into public.categorias_financeiras (name, type)
select name, type::public.financial_category_type
from (
  values
    ('Vendas', 'income'),
    ('Cobranças', 'income'),
    ('Compras de estoque', 'expense'),
    ('Frete', 'expense'),
    ('Marketing', 'expense'),
    ('Despesas operacionais', 'expense')
) as defaults(name, type)
where not exists (
  select 1
  from public.categorias_financeiras fc
  where fc.name = defaults.name
    and fc.type = defaults.type::public.financial_category_type
);

insert into public.contas_financeiras (name, type, institution)
select defaults.name, defaults.type::public.financial_account_type, defaults.institution
from (
  values
    ('Conta principal', 'bank', null),
    ('Pix', 'digital_wallet', null)
) as defaults(name, type, institution)
where not exists (
  select 1 from public.contas_financeiras fa where fa.name = defaults.name
);
