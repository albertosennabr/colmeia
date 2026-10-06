import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase, type Post } from '../lib/supabase'
import { useColmeia, pilarPorSlug } from '../lib/contexto'
import { haQuanto } from '../lib/formato'
import { Nav } from '../components/Nav'
import { IconeMais } from '../components/Icones'

export function Comunidade() {
  const { pilares } = useColmeia()
  const [params, setParams] = useSearchParams()
  const filtro = params.get('pilar')
  const [posts, setPosts] = useState<Post[]>([])
  const [escrevendo, setEscrevendo] = useState(false)
  const [texto, setTexto] = useState('')
  const [pilarNovo, setPilarNovo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function carregar() {
    let q = supabase.from('posts').select('id, texto, criado_em, pilar_slug, autora, perfis(nome), respostas(count)').order('criado_em', { ascending: false }).limit(50)
    if (filtro) q = q.eq('pilar_slug', filtro)
    const { data } = await q
    setPosts((data as unknown as Post[]) ?? [])
  }

  useEffect(() => { carregar() }, [filtro]) // eslint-disable-line react-hooks/exhaustive-deps

  async function publicar(e: FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return
    setEnviando(true)
    setErro('')
    const { error } = await supabase.from('posts').insert({ texto: texto.trim(), pilar_slug: pilarNovo || null })
    setEnviando(false)
    if (error) { setErro('Não foi possível publicar. Tente de novo.'); return }
    setTexto('')
    setEscrevendo(false)
    carregar()
  }

  return (
    <>
      <main className="tela tela-com-nav" style={{ gap: 16 }}>
        <div className="linha-titulo" style={{ alignItems: 'center' }}>
          <h1>A Colmeia</h1>
          <button aria-label="Escrever na Colmeia" onClick={() => { setEscrevendo(!escrevendo); setPilarNovo(filtro ?? '') }} style={{ width: 48, height: 48, borderRadius: 24, border: 'none', background: 'var(--terracota)', color: 'var(--branco)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconeMais /></button>
        </div>

        {escrevendo && (
          <form onSubmit={publicar} className="cartao" style={{ gap: 12 }}>
            <div className="campo">
              <label htmlFor="texto">O que você quer partilhar?</label>
              <textarea id="texto" className="entrada" value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={4000} autoFocus />
            </div>
            <div className="campo">
              <label htmlFor="pilar">Em qual pilar?</label>
              <select id="pilar" className="entrada" value={pilarNovo} onChange={(e) => setPilarNovo(e.target.value)}>
                <option value="">Conversa geral</option>
                {pilares.map((p) => <option key={p.slug} value={p.slug}>{p.nome}</option>)}
              </select>
            </div>
            {erro && <p className="erro">{erro}</p>}
            <button className="botao" type="submit" disabled={enviando || !texto.trim()}>{enviando ? 'Publicando…' : 'Publicar'}</button>
          </form>
        )}

        <div className="chips" role="group" aria-label="Filtrar por pilar">
          <button className={`chip ${!filtro ? 'chip-ativo' : ''}`} aria-pressed={!filtro} onClick={() => setParams({})}>Todos</button>
          {pilares.map((p) => (
            <button key={p.slug} className={`chip ${filtro === p.slug ? 'chip-ativo' : ''}`} aria-pressed={filtro === p.slug} onClick={() => setParams({ pilar: p.slug })}>{p.nome}</button>
          ))}
        </div>

        {posts.length === 0 && <p className="suave" style={{ fontSize: 16, textAlign: 'center', padding: '24px 8px' }}>Ninguém escreveu aqui ainda. Que tal começar?</p>}

        {posts.map((p) => {
          const pilar = pilarPorSlug(pilares, p.pilar_slug)
          const nome = p.perfis?.nome || 'Rainha'
          return (
            <Link key={p.id} to={`/post/${p.id}`} className="cartao" style={{ gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="avatar" style={{ background: pilar?.cor ?? 'var(--espresso)', color: pilar?.tinta ?? 'var(--creme)' }}>{nome[0].toUpperCase()}</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <b style={{ fontSize: 15 }}>{nome}</b>
                  <span className="suave" style={{ fontSize: 13 }}>{pilar?.nome ?? 'Conversa geral'} · {haQuanto(p.criado_em)}</span>
                </div>
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{p.texto.length > 280 ? p.texto.slice(0, 280) + '…' : p.texto}</p>
              <span style={{ fontSize: 14, color: 'var(--ouro-escuro)', fontWeight: 700 }}>{p.respostas[0]?.count ?? 0} respostas</span>
            </Link>
          )
        })}
      </main>
      <Nav />
    </>
  )
}
