import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const labels = { suggestion: 'Sugestão', approved: 'Aprovado', scheduled: 'Agendado', published: 'Publicado', failed: 'Erro' }

export function ContentPage({ session }) {
  const [posts, setPosts] = useState([])
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ product_id: '', caption: '', hashtags: '', scheduled_for: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  async function load() {
    setLoading(true)
    const [postsResult, productsResult] = await Promise.all([
      supabase.from('publicacoes_conteudo').select('id,product_id,caption,hashtags,scheduled_for,status,created_at,produtos(name)').order('created_at', { ascending: false }),
      supabase.from('produtos').select('id,name').eq('active', true).order('name'),
    ])
    const error = [postsResult, productsResult].find((result) => result.error)?.error
    if (error) setFeedback({ type: 'error', message: 'Não foi possível carregar o calendário de conteúdo.' })
    setPosts(postsResult.data ?? [])
    setProducts(productsResult.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function update(event) { const { name, value } = event.target; setForm((current) => ({ ...current, [name]: value })) }

  async function save(event) {
    event.preventDefault(); setSaving(true); setFeedback({ type: '', message: '' })
    const { error } = await supabase.from('publicacoes_conteudo').insert({ product_id: form.product_id || null, caption: form.caption.trim() || null, hashtags: form.hashtags.trim() || null, scheduled_for: form.scheduled_for ? new Date(form.scheduled_for).toISOString() : null })
    if (error) setFeedback({ type: 'error', message: 'Não foi possível criar a sugestão de conteúdo.' })
    else { setShowForm(false); setForm({ product_id: '', caption: '', hashtags: '', scheduled_for: '' }); setFeedback({ type: 'success', message: 'Sugestão adicionada ao calendário.' }); await load() }
    setSaving(false)
  }

  async function updateStatus(post, status) {
    setSaving(true)
    const payload = status === 'approved' ? { status, approved_by: session.user.id } : { status }
    const { error } = await supabase.from('publicacoes_conteudo').update(payload).eq('id', post.id)
    if (error) setFeedback({ type: 'error', message: 'Não foi possível atualizar o status.' })
    else { setFeedback({ type: 'success', message: `Conteúdo marcado como ${labels[status].toLocaleLowerCase('pt-BR')}.` }); await load() }
    setSaving(false)
  }

  return <div className="page-content"><div className="page-heading"><div><span className="eyebrow">Planejamento</span><h1>Conteúdo Instagram</h1><p>Organize sugestões e aprove publicações antes de qualquer integração externa.</p></div><button className="primary-button page-action" onClick={() => setShowForm((visible) => !visible)}>{showForm ? 'Fechar sugestão' : 'Novo conteúdo'} <span>＋</span></button></div>{feedback.message && <div className={`alert ${feedback.type === 'error' ? 'error' : 'success'} inline-alert`}><strong>{feedback.type === 'error' ? 'Atenção' : 'Tudo certo'}</strong><span>{feedback.message}</span></div>}
    {showForm && <form className="panel form-panel" onSubmit={save}><div className="panel-heading"><div><span className="eyebrow">Calendário semanal</span><h2>Nova sugestão</h2></div></div><div className="form-grid"><label>Produto<select name="product_id" value={form.product_id} onChange={update}><option value="">Sem produto específico</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label><label>Data e hora<input type="datetime-local" name="scheduled_for" value={form.scheduled_for} onChange={update} /></label><label>Legenda<textarea name="caption" rows="3" value={form.caption} onChange={update} placeholder="Texto da publicação" /></label><label>Hashtags<textarea name="hashtags" rows="3" value={form.hashtags} onChange={update} placeholder="#finesse #prata925" /></label></div><div className="form-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? 'Salvando…' : 'Adicionar ao calendário'}</button></div></form>}
    <section className="content-board">{loading ? <div className="panel loading-row">Carregando conteúdo…</div> : posts.length === 0 ? <div className="panel empty-table"><span className="empty-icon">✦</span><strong>Nenhuma sugestão criada</strong><p>Adicione produtos e ideias para montar o calendário semanal.</p></div> : posts.map((post) => <article className="panel content-card" key={post.id}><div className="content-card-top"><span className={`status-pill status-${post.status}`}>{labels[post.status] || post.status}</span><small>{post.scheduled_for ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(post.scheduled_for)) : 'Sem data definida'}</small></div><h2>{post.produtos?.name || 'Conteúdo livre'}</h2><p>{post.caption || 'Sem legenda cadastrada.'}</p><small className="content-hashtags">{post.hashtags || 'Sem hashtags'}</small><div className="row-actions">{post.status === 'suggestion' && <button className="secondary-button compact-button" onClick={() => updateStatus(post, 'approved')} disabled={saving}>Aprovar</button>}{post.status === 'approved' && <button className="primary-button compact-button" onClick={() => updateStatus(post, 'scheduled')} disabled={saving}>Agendar</button>}{post.status === 'scheduled' && <button className="secondary-button compact-button" onClick={() => updateStatus(post, 'published')} disabled={saving}>Marcar publicado</button>}</div></article>)}</section>
  </div>
}
