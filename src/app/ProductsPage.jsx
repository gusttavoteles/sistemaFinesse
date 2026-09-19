import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { money } from '../lib/format'

const blank = { name: '', sku: '', category_id: '', supplier_id: '', material: 'Prata 925', purity: '925', weight_grams: '', cost_price: '', sale_price: '', promotional_price: '', minimum_stock: '0', description: '', care_instructions: '' }

export function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [form, setForm] = useState(blank)
  const [image, setImage] = useState(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [stockProduct, setStockProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const fileInput = useRef(null)

  async function load() {
    setLoading(true)
    const [productResult, stockResult, categoryResult, supplierResult] = await Promise.all([
      supabase.from('products').select('id,name,sku,category_id,supplier_id,material,purity,weight_grams,cost_price,sale_price,promotional_price,minimum_stock,description,care_instructions,active,created_at,product_images(storage_path,is_cover)').eq('active', true).order('name'),
      supabase.from('product_stock').select('id,current_stock'),
      supabase.from('categories').select('id,name').eq('active', true).order('name'),
      supabase.from('suppliers').select('id,name').eq('active', true).order('name'),
    ])
    const error = [productResult, stockResult, categoryResult, supplierResult].find((result) => result.error)?.error
    if (error) setFeedback({ type: 'error', message: 'Não foi possível carregar o catálogo.' })
    const stocks = new Map((stockResult.data ?? []).map((row) => [row.id, Number(row.current_stock)]))
    const mapped = await Promise.all((productResult.data ?? []).map(async (product) => {
      const cover = product.product_images?.find((item) => item.is_cover) ?? product.product_images?.[0]
      let imageUrl = ''
      if (cover?.storage_path) imageUrl = (await supabase.storage.from('product-images').createSignedUrl(cover.storage_path, 3600)).data?.signedUrl || ''
      return { ...product, current_stock: stocks.get(product.id) ?? 0, imageUrl }
    }))
    setProducts(mapped)
    setCategories(categoryResult.data ?? [])
    setSuppliers(supplierResult.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR')
    if (!term) return products
    return products.filter((product) => [product.name, product.sku, product.material].some((value) => value?.toLocaleLowerCase('pt-BR').includes(term)))
  }, [products, search])

  function update(event) { const { name, value } = event.target; setForm((current) => ({ ...current, [name]: value })) }

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setFeedback({ type: '', message: '' })
    const payload = { name: form.name.trim(), sku: form.sku.trim() || null, category_id: form.category_id || null, supplier_id: form.supplier_id || null, material: form.material.trim() || 'Prata 925', purity: form.purity ? Number(form.purity) : null, weight_grams: form.weight_grams ? Number(form.weight_grams) : null, cost_price: Number(form.cost_price || 0), sale_price: Number(form.sale_price || 0), promotional_price: form.promotional_price ? Number(form.promotional_price) : null, minimum_stock: Number(form.minimum_stock || 0), description: form.description.trim() || null, care_instructions: form.care_instructions.trim() || null }
    const { data, error } = await supabase.from('products').insert(payload).select('id').single()
    if (error) {
      setFeedback({ type: 'error', message: 'Não foi possível salvar a peça. Verifique SKU, preços e campos obrigatórios.' })
    } else {
      if (image && data?.id) await uploadImage(data.id, image)
      setForm(blank); setImage(null); setShowForm(false); setFeedback({ type: 'success', message: 'Peça cadastrada com sucesso.' }); await load()
    }
    setSaving(false)
  }

  async function uploadImage(productId, file) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${productId}/${crypto.randomUUID()}.${extension}`
    const upload = await supabase.storage.from('product-images').upload(path, file, { contentType: file.type, upsert: false })
    if (upload.error) { setFeedback({ type: 'error', message: 'A peça foi criada, mas a imagem não pôde ser enviada. Confira o bucket product-images.' }); return }
    const { error } = await supabase.from('product_images').insert({ product_id: productId, storage_path: path, is_cover: true, sort_order: 0 })
    if (error) setFeedback({ type: 'error', message: 'A peça foi criada, mas o registro da imagem não pôde ser salvo.' })
  }

  async function adjustStock(event) {
    event.preventDefault()
    setSaving(true)
    const data = new FormData(event.currentTarget)
    const { error } = await supabase.rpc('adjust_stock', { p_product_id: stockProduct.id, p_quantity: Number(data.get('quantity')), p_direction: data.get('direction'), p_reason: String(data.get('reason')).trim(), p_request_id: crypto.randomUUID() })
    if (error) setFeedback({ type: 'error', message: 'Não foi possível ajustar o estoque. Informe quantidade e motivo.' })
    else { setStockProduct(null); setFeedback({ type: 'success', message: 'Movimentação de estoque registrada.' }); await load() }
    setSaving(false)
  }

  return <div className="page-content"><div className="page-heading"><div><span className="eyebrow">Catálogo</span><h1>Produtos e estoque</h1><p>Cadastre peças, preços, imagens e saldo por quantidade.</p></div><button className="primary-button page-action" onClick={() => setShowForm((visible) => !visible)}>{showForm ? 'Fechar cadastro' : 'Adicionar peça'} <span>＋</span></button></div>{feedback.message && <div className={`alert ${feedback.type === 'error' ? 'error' : 'success'} inline-alert`}><strong>{feedback.type === 'error' ? 'Atenção' : 'Tudo certo'}</strong><span>{feedback.message}</span></div>}
    {showForm && <form className="panel form-panel" onSubmit={save}><div className="panel-heading"><div><span className="eyebrow">Cadastro de peça</span><h2>Nova peça</h2></div></div><div className="form-grid"><label>Nome da peça<input name="name" value={form.name} onChange={update} required placeholder="Ex.: Anel Solitário" /></label><label>SKU<input name="sku" value={form.sku} onChange={update} placeholder="Opcional" /></label><label>Categoria<select name="category_id" value={form.category_id} onChange={update}><option value="">Selecione</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Fornecedor<select name="supplier_id" value={form.supplier_id} onChange={update}><option value="">Selecione</option>{suppliers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Material<input name="material" value={form.material} onChange={update} /></label><label>Pureza<input type="number" name="purity" min="0" max="1000" value={form.purity} onChange={update} /></label><label>Peso (g)<input type="number" name="weight_grams" min="0" step="0.001" value={form.weight_grams} onChange={update} /></label><label>Estoque mínimo<input type="number" name="minimum_stock" min="0" step="1" value={form.minimum_stock} onChange={update} /></label><label>Custo de aquisição<input type="number" name="cost_price" min="0" step="0.01" value={form.cost_price} onChange={update} placeholder="0,00" /></label><label>Preço de venda<input type="number" name="sale_price" min="0" step="0.01" value={form.sale_price} onChange={update} required placeholder="0,00" /></label><label>Preço promocional<input type="number" name="promotional_price" min="0" step="0.01" value={form.promotional_price} onChange={update} placeholder="Opcional" /></label><label>Imagem da peça<input type="file" ref={fileInput} accept="image/png,image/jpeg,image/webp" onChange={(event) => setImage(event.target.files?.[0] ?? null)} /></label><label>Descrição<textarea name="description" rows="2" value={form.description} onChange={update} placeholder="Descrição comercial" /></label><label>Cuidados<textarea name="care_instructions" rows="2" value={form.care_instructions} onChange={update} placeholder="Instruções de cuidado" /></label></div><div className="form-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? 'Salvando…' : 'Cadastrar peça'}</button></div></form>}
    <section className="panel list-panel"><div className="panel-heading"><div><span className="eyebrow">Estoque atual</span><h2>{products.length} {products.length === 1 ? 'peça ativa' : 'peças ativas'}</h2></div><label className="search-field"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar peça ou SKU" /></label></div>{loading ? <div className="loading-row">Carregando catálogo…</div> : filtered.length === 0 ? <div className="empty-table"><span className="empty-icon">◇</span><strong>Nenhuma peça cadastrada</strong><p>Adicione a primeira peça para começar o controle de estoque.</p></div> : <div className="product-grid">{filtered.map((product) => <article className="product-card" key={product.id}>{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <div className="product-placeholder">◇</div>}<div className="product-card-body"><div className="product-title"><strong>{product.name}</strong><span>{product.sku || 'Sem SKU'}</span></div><div className="product-prices"><strong>{money(product.promotional_price || product.sale_price)}</strong><small>Custo {money(product.cost_price)}</small></div><div className={product.current_stock <= product.minimum_stock ? 'stock-low' : 'stock-ok'}>{product.current_stock} peça(s) em estoque <small>mín. {product.minimum_stock}</small></div><button className="secondary-button compact-button" onClick={() => setStockProduct(product)}>Ajustar estoque</button></div></article>)}</div>}</section>
    {stockProduct && <div className="dialog-backdrop"><div className="dialog-card"><button className="dialog-close" onClick={() => setStockProduct(null)} aria-label="Fechar">×</button><span className="eyebrow">Movimentação</span><h2>Ajustar estoque</h2><p className="auth-help">{stockProduct.name} · saldo atual {stockProduct.current_stock} peça(s).</p><form className="auth-form" onSubmit={adjustStock}><label>Operação<select name="direction" defaultValue="in"><option value="in">Entrada</option><option value="out">Saída</option></select></label><label>Quantidade<input name="quantity" type="number" min="1" step="1" required /></label><label>Motivo<input name="reason" minLength="3" required placeholder="Compra, perda, ajuste…" /></label><button className="primary-button" disabled={saving}>{saving ? 'Registrando…' : 'Registrar ajuste'}</button></form></div></div>}
  </div>
}
