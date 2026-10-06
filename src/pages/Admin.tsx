import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase, type Conteudo, type Encontro } from '../lib/supabase'
import { useColmeia, pilarPorSlug } from '../lib/contexto'
import { dataCurta } from '../lib/formato'
import { Nav } from '../components/Nav'
import { IconeVoltar } from '../components/Icones'

const TIPOS: [Conteudo['tipo'], string][] = [['audio', 'Áudio'], ['meditacao', 'Meditação'], ['video', 'Vídeo'], ['apostila', 'Apostila (PDF)']]

function nomeDeArquivo(nome: string) {
  const limpo = nome.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9.]+/g, '-').toLowerCase()
  return `${Date.now()}-${limpo}`
}

export function Admin() {
  const { perfil, pilares } = useColmeia()
  const [conteudos, setConteudos] = useState<Conteudo[]>([])
  const [encontros, setEncontros] = useState<Encontro[]>([])

  const [tipo, setTipo] = useState<Conteudo['tipo']>('audio')
  const [titulo, setTitulo] = useState('')
  const [pilar, setPilar] = useState('')
  const [duracao, setDuracao] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [msg, setMsg] = useState('')

  async function carregar() {
    const c = await supabase.from('conteudos').select('*').order('criado_em', { ascending: false })
    setConteudos(c.data ?? [])
    const e = await supabase.from('encontros').select('*').eq('ciclo', 1).order('ordem')
    setEncontros(e.data ?? [])
  }
  useEffect(() => { carregar() }, [])

  if (perfil && !perfil.admin) return <Navigate to="/" replace />

  async function enviar(ev: FormEvent) {
    ev.preventDefault()
    setEnviando(true)
    setMsg('')
    let caminho: string | null = null
    if (arquivo) {
      caminho = nomeDeArquivo(arquivo.name)
      const { error } = await supabase.storage.from('biblioteca').upload(caminho, arquivo, { contentType: arquivo.type })
      if (error) { setMsg('O arquivo não subiu: ' + error.message); setEnviando(false); return }
    }
    const { error } = await supabase.from('conteudos').insert({
      tipo, titulo: titulo.trim(), pilar_slug: pilar || null, duracao_min: duracao ? Number(duracao) : null, arquivo: caminho,
    })
    setEnviando(false)
    if (error) { setMsg('Não salvou: ' + error.message); return }
    setTitulo(''); setDuracao(''); setArquivo(null)
    setMsg('Publicado na biblioteca.')
    carregar()
  }

  async function anexar(c: Conteudo, f: File) {
    const caminho = nomeDeArquivo(f.name)
    const { error } = await supabase.storage.from('biblioteca').upload(caminho, f, { contentType: f.type })
    if (error) { alert('O arquivo não subiu: ' + error.message); return }
    if (c.arquivo) await supabase.storage.from('biblioteca').remove([c.arquivo])
    await supabase.from('conteudos').update({ arquivo: caminho }).eq('id', c.id)
    carregar()
  }

  async function destacar(c: Conteudo) {
    await supabase.from('conteudos').update({ destaque: false }).neq('id', c.id)
    await supabase.from('conteudos').update({ destaque: !c.destaque }).eq('id', c.id)
    carregar()
  }

  async function apagar(c: Conteudo) {
    if (!confirm(`Apagar “${c.titulo}” da biblioteca?`)) return
    if (c.arquivo) await supabase.storage.from('biblioteca').remove([c.arquivo])
    await supabase.from('conteudos').delete().eq('id', c.id)
    carregar()
  }

  async function salvarEncontro(e: Encontro, campo: 'link_ao_vivo' | 'gravacao_url', valor: string) {
    await supabase.from('encontros').update({ [campo]: valor.trim() || null }).eq('id', e.id)
    carregar()
  }

  return (
    <>
      <main className="tela tela-com-nav">
        <Link to="/perfil" className="voltar" aria-label="Voltar"><IconeVoltar /></Link>
        <h1>Área da Paula</h1>

        <form onSubmit={enviar} className="cartao" style={{ gap: 14 }}>
          <h2>Publicar na biblioteca</h2>
          <div className="campo">
            <label htmlFor="tipo">Tipo</label>
            <select id="tipo" className="entrada" value={tipo} onChange={(e) => setTipo(e.target.value as Conteudo['tipo'])}>
              {TIPOS.map(([v, n]) => <option key={v} value={v}>{n}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="titulo">Título</label>
            <input id="titulo" className="entrada" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>
          <div className="campo">
            <label htmlFor="pilar">Pilar</label>
            <select id="pilar" className="entrada" value={pilar} onChange={(e) => setPilar(e.target.value)}>
              <option value="">Nenhum</option>
              {pilares.map((p) => <option key={p.slug} value={p.slug}>{p.nome}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="duracao">Duração (minutos)</label>
            <input id="duracao" className="entrada" type="number" min={1} value={duracao} onChange={(e) => setDuracao(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="arquivo">Arquivo</label>
            <input id="arquivo" type="file" accept="audio/*,video/*,application/pdf" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} />
          </div>
          {msg && <p className="suave" style={{ fontSize: 15 }}>{msg}</p>}
          <button className="botao" type="submit" disabled={enviando}>{enviando ? 'Enviando…' : 'Publicar'}</button>
        </form>

        <div className="secao">
          <h2>O que está na biblioteca</h2>
          {conteudos.map((c) => (
            <div key={c.id} className="cartao" style={{ gap: 8 }}>
              <b>{c.titulo}</b>
              <span className="suave">
                {TIPOS.find(([v]) => v === c.tipo)?.[1]}
                {c.pilar_slug ? ` · ${pilarPorSlug(pilares, c.pilar_slug)?.nome}` : ''}
                {c.arquivo ? ' · com arquivo' : ' · sem arquivo'}
                {c.destaque ? ' · áudio da semana' : ''}
              </span>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--ouro-escuro)', textDecoration: 'underline', cursor: 'pointer' }}>
                  {c.arquivo ? 'Trocar arquivo' : 'Enviar arquivo'}
                  <input type="file" accept="audio/*,video/*,application/pdf" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && anexar(c, e.target.files[0])} />
                </label>
                <button className="botao-texto" style={{ minHeight: 32, fontSize: 14, padding: 0 }} onClick={() => destacar(c)}>{c.destaque ? 'Tirar do destaque' : 'Áudio da semana'}</button>
                <button className="botao-texto" style={{ minHeight: 32, fontSize: 14, padding: 0 }} onClick={() => apagar(c)}>Apagar</button>
              </div>
            </div>
          ))}
        </div>

        <div className="secao">
          <h2>Encontros do ciclo 1</h2>
          {encontros.map((e) => (
            <div key={e.id} className="cartao" style={{ gap: 10 }}>
              <b>{e.ordem} · {e.titulo} <span className="suave" style={{ fontWeight: 400 }}>· {dataCurta(e.data)}</span></b>
              <div className="campo">
                <label htmlFor={`vivo-${e.id}`} style={{ fontSize: 14 }}>Link do encontro ao vivo (Zoom, Meet…)</label>
                <input id={`vivo-${e.id}`} className="entrada" type="url" defaultValue={e.link_ao_vivo ?? ''} onBlur={(ev) => salvarEncontro(e, 'link_ao_vivo', ev.target.value)} />
              </div>
              <div className="campo">
                <label htmlFor={`grav-${e.id}`} style={{ fontSize: 14 }}>Link da gravação</label>
                <input id={`grav-${e.id}`} className="entrada" type="url" defaultValue={e.gravacao_url ?? ''} onBlur={(ev) => salvarEncontro(e, 'gravacao_url', ev.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </main>
      <Nav />
    </>
  )
}
