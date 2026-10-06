import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase, SELECT_POST, type Post } from '../lib/supabase'
import { useColmeia, pilarPorSlug } from '../lib/contexto'
import { haQuanto } from '../lib/formato'
import { Esqueleto } from '../components/Partes'

export function Comunidade() {
  const { pilares, avisar } = useColmeia()
  const [params, setParams] = useSearchParams()
  const filtro = params.get('pilar')
  const pilarFiltro = pilarPorSlug(pilares, filtro)
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [texto, setTexto] = useState('')
  const [pilarNovo, setPilarNovo] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function carregar() {
    let q = supabase.from('posts').select(SELECT_POST).order('criado_em', { ascending: false }).limit(50)
    if (filtro) q = q.eq('pilar_slug', filtro)
    const { data } = await q
    setPosts((data as unknown as Post[]) ?? [])
  }

  useEffect(() => { setPilarNovo(filtro ?? ''); carregar() }, [filtro]) // eslint-disable-line react-hooks/exhaustive-deps

  async function publicar(e: FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return
    setEnviando(true)
    const { error } = await supabase.from('posts').insert({ texto: texto.trim(), pilar_slug: pilarNovo || null })
    setEnviando(false)
    if (error) { avisar('Não foi possível publicar. Tente de novo.'); return }
    setTexto('')
    avisar('Publicado na Colmeia')
    carregar()
  }

  const filtrar = (slug: string | null) => setParams(slug ? { pilar: slug } : {})

  return (
    <>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="rotulo">A comunidade</span>
        <h1>{pilarFiltro ? `Conversa: ${pilarFiltro.nome}` : 'A Colmeia'}</h1>
      </header>

      <div className="grade-lado">
        <div className="secao" style={{ gap: 16 }}>
          <div className="chips so-celular" role="group" aria-label="Filtrar por pilar">
            <button className={`chip ${!filtro ? 'chip-ativo' : ''}`} aria-pressed={!filtro} onClick={() => filtrar(null)}>Todas</button>
            {pilares.map((p) => (
              <button key={p.slug} className={`chip ${filtro === p.slug ? 'chip-ativo' : ''}`} aria-pressed={filtro === p.slug} onClick={() => filtrar(p.slug)}>{p.nome}</button>
            ))}
          </div>

          <form onSubmit={publicar} className="cartao" style={{ gap: 12 }}>
            <label htmlFor="texto" style={{ fontWeight: 700, fontSize: 15 }}>Partilhe com a colmeia</label>
            <textarea id="texto" className="entrada" placeholder="Uma conquista, uma dúvida, um pedido de apoio…" value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={4000} />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <label htmlFor="pilar" className="suave">Em qual conversa?</label>
              <select id="pilar" className="entrada" style={{ width: 'auto', flex: '1 1 180px', minHeight: 42 }} value={pilarNovo} onChange={(e) => setPilarNovo(e.target.value)}>
                <option value="">Conversa geral</option>
                {pilares.map((p) => <option key={p.slug} value={p.slug}>{p.nome}</option>)}
              </select>
              <button className="botao botao-pequeno" type="submit" disabled={enviando || !texto.trim()}>{enviando ? 'Publicando…' : 'Publicar'}</button>
            </div>
          </form>

          {posts === null && <><Esqueleto altura={120} /><Esqueleto altura={120} /></>}
          {posts?.length === 0 && <p className="vazio">Ninguém escreveu aqui ainda. Que tal começar?</p>}

          {posts?.map((p) => {
            const pilar = pilarPorSlug(pilares, p.pilar_slug)
            const nome = p.perfis?.nome || 'Rainha'
            return (
              <Link key={p.id} to={`/post/${p.id}`} className="cartao" style={{ gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="avatar" style={{ background: pilar?.cor ?? 'var(--espresso)', color: pilar?.tinta ?? 'var(--creme)' }}>{nome[0].toUpperCase()}</div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <b style={{ fontSize: 15 }}>{nome}</b>
                    <span className="suave" style={{ fontSize: 13 }}>{pilar?.nome ?? 'Conversa geral'} · {haQuanto(p.criado_em)}</span>
                  </div>
                </div>
                <p style={{ fontSize: 16, lineHeight: 1.55, whiteSpace: 'pre-line' }}>{p.texto.length > 320 ? p.texto.slice(0, 320) + '…' : p.texto}</p>
                <span style={{ fontSize: 14, color: 'var(--ouro-escuro)', fontWeight: 700 }}>
                  {(p.respostas[0]?.count ?? 0) === 0 ? 'Responder' : `${p.respostas[0].count} ${p.respostas[0].count === 1 ? 'resposta' : 'respostas'}`}
                </span>
              </Link>
            )
          })}
        </div>

        <aside className="secao so-desktop" style={{ flexDirection: 'column', gap: 20, position: 'sticky', top: 32 }}>
          <nav className="cartao" aria-label="Conversas por pilar" style={{ gap: 4 }}>
            <span className="rotulo" style={{ paddingBottom: 6 }}>Conversas</span>
            {[null, ...pilares.map((p) => p.slug)].map((slug) => {
              const p = pilarPorSlug(pilares, slug)
              const ativo = filtro === slug
              return (
                <button key={slug ?? 'todas'} onClick={() => filtrar(slug)} aria-pressed={ativo}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 42, padding: '0 10px', borderRadius: 10, border: 'none', textAlign: 'left', background: ativo ? 'var(--areia)' : 'transparent', fontWeight: ativo ? 700 : 500, fontSize: 15 }}>
                  <span className="hex" style={{ width: 16, height: 18, background: p?.cor ?? 'var(--espresso)', flex: 'none' }} />
                  {p?.nome ?? 'Todas as conversas'}
                </button>
              )
            })}
          </nav>
          <div className="cartao cartao-areia" style={{ gap: 6 }}>
            <h3>Combinados da Colmeia</h3>
            <p style={{ fontSize: 14, lineHeight: 1.5 }}>Aqui se acolhe, não se julga. O que é partilhado aqui fica aqui. Nada de vender sem ser convidada.</p>
          </div>
        </aside>
      </div>
    </>
  )
}
