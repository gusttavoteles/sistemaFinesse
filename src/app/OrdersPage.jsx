import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { money } from '../lib/format'

const paymentMethods = { cash: 'Dinheiro', pix: 'Pix', debit_card: 'Débito', credit_card: 'Crédito', transfer: 'Transferência', other: 'Outro' }
const orderLabels = { pending: 'Pendente', sold: 'Vendido', shipped: 'Enviado', completed: 'Concluído', canceled: 'Cancelado', partially_returned: 'Devolução parcial', returned: 'Devolvido' }

export function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [accounts, setAccounts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ customer_id: '', shipping_amount: '', discount_amount: '', notes: '' })
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState({ product_id: '', quantity: '1' })
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  async function load() {
    setLoading(true)
    const [ordersResult, customersResult, productsResult, stockResult, accountsResult] = await Promise.all([
      supabase.from('pedidos').select('id,order_number,customer_id,status,payment_status,subtotal,shipping_amount,discount_amount,total_amount,notes,created_at,cliente:clientes(name),itens_pedidos(product_name_snapshot,quantity,unit_price,total_amount)').order('created_at', { ascending: false }),
      supabase.from('clientes').select('id,name').eq('active', true).order('name'),
      supabase.from('produtos').select('id,name,sku,cost_price,sale_price,promotional_price').eq('active', true).order('name'),
      supabase.from('estoque_produtos').select('id,current_stock'),
      supabase.from('contas_financeiras').select('id,name').eq('active', true).order('name'),
    ])
    const error = [ordersResult, customersResult, productsResult, stockResult, accountsResult].find((result) => result.error)?.error
    if (error) setFeedback({ type: 'error', message: 'Não foi possível carregar os pedidos.' })
    const stocks = new Map((stockResult.data ?? []).map((row) => [row.id, Number(row.current_stock)]))
    setOrders(ordersResult.data ?? [])
    setCustomers(customersResult.data ?? [])
    setProducts((productsResult.data ?? []).map((product) => ({ ...product, current_stock: stocks.get(product.id) ?? 0 })))
    setAccounts(accountsResult.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (Number(item.unit_price) * Number(item.quantity)), 0), [items])
  const total = Math.max(0, subtotal + Number(form.shipping_amount || 0) - Number(form.discount_amount || 0))

  function updateForm(event) { const { name, value } = event.target; setForm((current) => ({ ...current, [name]: value })) }

  function chooseProduct(event) {
    const product = products.find((item) => item.id === event.target.value)
    setNewItem({ product_id: product?.id || '', quantity: '1' })
  }

  function addItem() {
    const product = products.find((item) => item.id === newItem.product_id)
    if (!product) return
    const quantity = Math.max(1, Number(newItem.quantity || 1))
    setItems((current) => {
      const existing = current.find((item) => item.product_id === product.id)
      if (existing) return current.map((item) => item.product_id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
      return [...current, { product_id: product.id, name: product.name, sku: product.sku, cost_price: product.cost_price, unit_price: product.promotional_price || product.sale_price, quantity }]
    })
    setNewItem({ product_id: '', quantity: '1' })
  }

  function removeItem(productId) { setItems((current) => current.filter((item) => item.product_id !== productId)) }

  async function saveOrder(event) {
    event.preventDefault()
    if (items.length === 0) { setFeedback({ type: 'error', message: 'Adicione pelo menos uma peça ao pedido.' }); return }
    setSaving(true)
    setFeedback({ type: '', message: '' })
    const orderInsert = await supabase.from('pedidos').insert({ customer_id: form.customer_id || null, source: 'manual', notes: form.notes.trim() || null, shipping_amount: Number(form.shipping_amount || 0) }).select('id').single()
    if (orderInsert.error) { setFeedback({ type: 'error', message: 'Não foi possível criar o pedido.' }); setSaving(false); return }
    const orderId = orderInsert.data.id
    if (Number(form.discount_amount || 0) > 0) await supabase.from('pedidos').update({ discount_amount: Number(form.discount_amount) }).eq('id', orderId)
    const { error } = await supabase.from('itens_pedidos').insert(items.map((item) => ({ order_id: orderId, product_id: item.product_id, product_name_snapshot: item.name, sku_snapshot: item.sku || null, quantity: item.quantity, unit_price: Number(item.unit_price), unit_cost_snapshot: Number(item.cost_price || 0), discount_amount: 0 })))
    if (error) setFeedback({ type: 'error', message: 'O pedido foi criado, mas os itens não puderam ser salvos. Revise o pedido antes de vendê-lo.' })
    else { setShowForm(false); setItems([]); setForm({ customer_id: '', shipping_amount: '', discount_amount: '', notes: '' }); setFeedback({ type: 'success', message: 'Pedido manual criado.' }); await load() }
    setSaving(false)
  }

  async function markSold(order) {
    setSaving(true)
    const { error } = await supabase.rpc('mark_order_sold', { p_order_id: order.id })
    if (error) setFeedback({ type: 'error', message: 'Não foi possível vender o pedido. Verifique o estoque disponível.' })
    else { setFeedback({ type: 'success', message: 'Pedido vendido e estoque baixado por peça.' }); await load() }
    setSaving(false)
  }

  async function recordPayment(event) {
    event.preventDefault()
    setSaving(true)
    const data = new FormData(event.currentTarget)
    const { error } = await supabase.rpc('record_order_payment', { p_order_id: payment.id, p_amount: Number(data.get('amount')), p_payment_method: data.get('method'), p_financial_account_id: data.get('account'), p_request_id: crypto.randomUUID(), p_installments: Number(data.get('installments') || 1), p_paid_at: new Date().toISOString(), p_notes: String(data.get('notes') || '').trim() || null })
    if (error) setFeedback({ type: 'error', message: 'Não foi possível registrar o pagamento. Confira o valor pendente.' })
    else { setPayment(null); setFeedback({ type: 'success', message: 'Pagamento registrado no financeiro.' }); await load() }
    setSaving(false)
  }

  return <div className="page-content"><div className="page-heading"><div><span className="eyebrow">Operação online</span><h1>Pedidos</h1><p>Registre vendas manuais, pagamentos e baixa de estoque.</p></div><button className="primary-button page-action" onClick={() => setShowForm((visible) => !visible)}>{showForm ? 'Fechar pedido' : 'Novo pedido'} <span>＋</span></button></div>{feedback.message && <div className={`alert ${feedback.type === 'error' ? 'error' : 'success'} inline-alert`}><strong>{feedback.type === 'error' ? 'Atenção' : 'Tudo certo'}</strong><span>{feedback.message}</span></div>}
    {showForm && <form className="panel form-panel" onSubmit={saveOrder}><div className="panel-heading"><div><span className="eyebrow">Venda manual</span><h2>Adicionar pedido</h2></div></div><div className="form-grid"><label>Cliente<select name="customer_id" value={form.customer_id} onChange={updateForm}><option value="">Sem cliente</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label><label>Frete<input type="number" min="0" step="0.01" name="shipping_amount" value={form.shipping_amount} onChange={updateForm} placeholder="0,00" /></label><label>Desconto<input type="number" min="0" step="0.01" name="discount_amount" value={form.discount_amount} onChange={updateForm} placeholder="0,00" /></label><label>Observações<textarea name="notes" rows="2" value={form.notes} onChange={updateForm} /></label></div><div className="order-item-adder"><select value={newItem.product_id} onChange={chooseProduct}><option value="">Selecione uma peça</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · estoque {product.current_stock}</option>)}</select><input type="number" min="1" step="1" value={newItem.quantity} onChange={(event) => setNewItem((current) => ({ ...current, quantity: event.target.value }))} /><button type="button" className="secondary-button" onClick={addItem}>Adicionar peça</button></div>{items.length > 0 && <div className="order-items">{items.map((item) => <div className="order-item" key={item.product_id}><span><strong>{item.name}</strong><small>{item.quantity} × {money(item.unit_price)}</small></span><b>{money(item.quantity * item.unit_price)}</b><button type="button" onClick={() => removeItem(item.product_id)} aria-label={`Remover ${item.name}`}>×</button></div>)}</div>}<div className="order-total"><span>Total do pedido</span><strong>{money(total)}</strong></div><div className="form-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? 'Salvando…' : 'Criar pedido'}</button></div></form>}
    <section className="panel list-panel"><div className="panel-heading"><div><span className="eyebrow">Histórico</span><h2>{orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}</h2></div></div>{loading ? <div className="loading-row">Carregando pedidos…</div> : orders.length === 0 ? <div className="empty-table"><span className="empty-icon">▣</span><strong>Nenhum pedido cadastrado</strong><p>Os pedidos manuais aparecerão aqui.</p></div> : <div className="orders-list">{orders.map((order) => <article className="order-card" key={order.id}><div><div className="product-title"><strong>Pedido #{order.order_number}</strong><span>{order.cliente?.name || 'Cliente não informado'}</span></div><p>{order.itens_pedidos?.length || 0} item(ns) · criado em {new Intl.DateTimeFormat('pt-BR').format(new Date(order.created_at))}</p><div className="order-card-items">{order.itens_pedidos?.map((item, index) => <span key={`${order.id}-${index}`}>{item.quantity}× {item.product_name_snapshot}</span>)}</div></div><div className="order-card-value"><span className={`status-pill status-${order.status}`}>{orderLabels[order.status] || order.status}</span><strong>{money(order.total_amount)}</strong><small>{order.payment_status === 'paid' ? 'Pagamento completo' : order.payment_status === 'partially_paid' ? 'Pagamento parcial' : 'Pagamento pendente'}</small></div><div className="row-actions">{order.status === 'pending' && <button className="primary-button compact-button" onClick={() => markSold(order)} disabled={saving}>Marcar vendido</button>}{order.status !== 'canceled' && order.payment_status !== 'paid' && <button className="secondary-button compact-button" onClick={() => setPayment(order)}>Registrar pagamento</button>}</div></article>)}</div>}</section>
    {payment && <div className="dialog-backdrop"><div className="dialog-card"><button className="dialog-close" onClick={() => setPayment(null)} aria-label="Fechar">×</button><span className="eyebrow">Entrada financeira</span><h2>Pagamento do pedido #{payment.order_number}</h2><p className="auth-help">Total do pedido: {money(payment.total_amount)}.</p><form className="auth-form" onSubmit={recordPayment}><label>Valor recebido<input name="amount" type="number" min="0.01" max={payment.total_amount} step="0.01" defaultValue={payment.total_amount} required /></label><label>Forma de pagamento<select name="method" defaultValue="pix">{Object.entries(paymentMethods).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Conta de entrada<select name="account" required><option value="">Selecione a conta</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label><label>Parcelas do cartão<input name="installments" type="number" min="1" step="1" defaultValue="1" /></label><label>Observações<input name="notes" /></label><button className="primary-button" disabled={saving}>Confirmar pagamento</button></form></div></div>}
  </div>
}
