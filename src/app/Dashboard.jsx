import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { date, initials, money } from '../lib/format'
import { CustomersPage } from './CustomersPage'
import { ReceivablesPage } from './ReceivablesPage'
import { ProductsPage } from './ProductsPage'
import { OrdersPage } from './OrdersPage'
import { FinancePage } from './FinancePage'
import { ContentPage } from './ContentPage'

const navigation = [
  { id: 'dashboard', label: 'Visão geral', icon: '⌂' },
  { id: 'orders', label: 'Pedidos', icon: '▣' },
  { id: 'customers', label: 'Clientes', icon: '♧' },
  { id: 'receivables', label: 'Cobranças', icon: '◷' },
  { id: 'inventory', label: 'Produtos e estoque', icon: '◇' },
  { id: 'finance', label: 'Financeiro', icon: '◷' },
  { id: 'content', label: 'Conteúdo', icon: '✦' },
]

function emptyMetrics() {
  return { products: null, customers: null, orders: null, receivables: null, balance: null }
}

export function Dashboard({ session }) {
  const [active, setActive] = useState('dashboard')
  const [metrics, setMetrics] = useState(emptyMetrics)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileName, setProfileName] = useState('Master')

  useEffect(() => {
    let mounted = true
    async function load() {
      const results = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('active', true),
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('active', true),
        supabase.from('orders').select('id', { count: 'exact', head: true }).neq('status', 'cancelled'),
        supabase.from('receivable_installment_summary').select('amount,paid_amount,effective_status').in('effective_status', ['pending', 'partially_paid', 'overdue']),
        supabase.from('financial_accounts').select('initial_balance'),
        supabase.from('financial_transactions').select('direction,amount').eq('status', 'paid'),
        supabase.from('profiles').select('full_name').eq('id', session.user.id).maybeSingle(),
      ])
      if (!mounted) return
      const firstError = results.find((result) => result.error)?.error
      if (firstError) setError('Não foi possível carregar todos os dados do painel.')
      setMetrics({
        products: results[0].count,
        customers: results[1].count,
        orders: results[2].count,
        receivables: results[3].data?.reduce((sum, row) => sum + Math.max(0, Number(row.amount) - Number(row.paid_amount || 0)), 0) ?? null,
      })
      const balance = (results[5].data ?? []).reduce((sum, row) => sum + Number(row.initial_balance), 0) + (results[6].data ?? []).reduce((sum, row) => sum + (row.direction === 'in' ? Number(row.amount) : -Number(row.amount)), 0)
      setMetrics((current) => ({ ...current, balance }))
      if (results[4].data?.full_name) setProfileName(results[4].data.full_name)
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [session.user.id])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    return hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  }, [])

  async function logout() {
    await supabase.auth.signOut()
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="logo-lockup"><span className="logo-symbol">F</span><span>finesse</span></div>
        <div className="brand-kicker">silver · gestão</div>
      </div>
      <nav className="main-nav" aria-label="Navegação principal">
        <span className="nav-heading">Menu</span>
        {navigation.map((item) => <button key={item.id} className={active === item.id ? 'nav-item active' : 'nav-item'} onClick={() => setActive(item.id)}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="security-chip"><span>●</span><div><strong>Acesso autorizado</strong><small>Senha e e-mail confirmado</small></div></div>
        <button className="profile-mini" onClick={logout}><span className="avatar">{initials(profileName)}</span><span><strong>{profileName}</strong><small>Sair do sistema</small></span><span className="logout-icon">↗</span></button>
      </div>
    </aside>
    <main className="main-content">
      <header className="topbar">
        <div className="mobile-brand"><span className="logo-symbol">F</span> finesse</div>
        <div className="breadcrumb"><span>Finesse Silver</span><b>/</b><strong>{navigation.find((item) => item.id === active)?.label}</strong></div>
        <div className="topbar-actions"><time>{date.format(new Date())}</time><span className="topbar-divider" /><button className="icon-button" aria-label="Notificações">♢<i /></button><button className="top-avatar">{initials(profileName)}</button></div>
      </header>
      {active === 'dashboard' ? <DashboardHome greeting={greeting} profileName={profileName} metrics={metrics} loading={loading} error={error} setActive={setActive} /> : active === 'customers' ? <CustomersPage /> : active === 'receivables' ? <ReceivablesPage /> : active === 'inventory' ? <ProductsPage /> : active === 'orders' ? <OrdersPage /> : active === 'finance' ? <FinancePage /> : active === 'content' ? <ContentPage session={session} /> : <ComingSoon title={navigation.find((item) => item.id === active)?.label} />}
    </main>
  </div>
}

function DashboardHome({ greeting, profileName, metrics, loading, error, setActive }) {
  return <div className="page-content">
    <div className="page-heading"><div><span className="eyebrow">Visão geral</span><h1>{greeting}, {profileName.split(' ')[0]}.</h1><p>Acompanhe o movimento da sua loja de prata 925.</p></div><button className="secondary-button">Hoje <span>⌄</span></button></div>
    {error && <div className="alert error inline-alert"><strong>Dados incompletos</strong><span>{error}</span></div>}
    <section className="metric-grid">
      <MetricCard label="Saldo disponível" value={metrics.balance == null ? '—' : money(metrics.balance)} detail="Contas financeiras" accent="gold" loading={loading} />
      <MetricCard label="A receber" value={metrics.receivables == null ? '—' : money(metrics.receivables)} detail="Parcelas pendentes" accent="lavender" loading={loading} />
      <MetricCard label="Produtos ativos" value={metrics.products == null ? '—' : metrics.products} detail="Peças cadastradas" accent="blue" loading={loading} />
      <MetricCard label="Pedidos" value={metrics.orders == null ? '—' : metrics.orders} detail="Pedidos não cancelados" accent="peach" loading={loading} />
    </section>
    <section className="dashboard-grid">
      <article className="panel flow-panel"><div className="panel-heading"><div><span className="eyebrow">Movimento</span><h2>Fluxo financeiro</h2></div><span className="muted-label">Últimos 7 dias</span></div><div className="chart-empty"><div className="chart-grid-lines" /><div className="chart-line income" /><div className="chart-line expense" /><div className="chart-empty-copy"><span className="empty-icon">◌</span><strong>Ainda não há movimentações</strong><p>Os lançamentos aparecerão aqui quando houver pagamentos ou despesas registrados.</p></div></div></article>
      <article className="panel attention-panel"><div className="panel-heading"><div><span className="eyebrow">Atenção</span><h2>Próximas cobranças</h2></div><button className="link-button" onClick={() => setActive('receivables')}>Ver todas ↗</button></div><div className="empty-list"><span className="empty-icon">◷</span><strong>Nenhuma cobrança próxima</strong><p>Cadastre um cliente com pagamento parcelado para acompanhar os vencimentos.</p></div></article>
    </section>
    <section className="dashboard-grid lower-grid"><article className="panel"><div className="panel-heading"><div><span className="eyebrow">Operação</span><h2>Pedidos recentes</h2></div><button className="link-button" onClick={() => setActive('orders')}>Ver pedidos ↗</button></div><div className="empty-table"><span className="empty-icon">▣</span><strong>Nenhum pedido cadastrado</strong><p>Os pedidos manuais da loja aparecerão neste espaço.</p></div></article><article className="panel quick-panel"><div className="panel-heading"><div><span className="eyebrow">Atalhos</span><h2>Ações rápidas</h2></div></div><div className="quick-actions"><button onClick={() => setActive('orders')}><span>＋</span><div><strong>Novo pedido</strong><small>Registrar uma venda manual</small></div><b>↗</b></button><button onClick={() => setActive('receivables')}><span>♧</span><div><strong>Nova cobrança</strong><small>Adicionar parcela de cliente</small></div><b>↗</b></button><button onClick={() => setActive('inventory')}><span>◇</span><div><strong>Adicionar produto</strong><small>Cadastrar uma peça</small></div><b>↗</b></button></div></article></section>
  </div>
}

function MetricCard({ label, value, detail, accent, loading }) {
  return <article className={`metric-card ${accent}`}><div className="metric-top"><span>{label}</span><i>↗</i></div><strong>{loading ? '· · ·' : value}</strong><small>{detail}</small></article>
}

function ComingSoon({ title }) {
  return <div className="page-content coming-page"><span className="eyebrow">Próxima etapa</span><h1>{title}</h1><p>Esta tela será construída seguindo as regras de negócio documentadas. Nenhuma operação foi inventada nesta primeira base.</p><div className="coming-card"><span className="empty-icon">✦</span><strong>Estrutura pronta para receber este módulo.</strong><small>Vamos implementar os fluxos um por vez, começando pelo que você definir para esta tela.</small></div></div>
}
