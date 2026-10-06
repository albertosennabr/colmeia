import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase, SELECT_POST, type Post } from '../lib/supabase'
import { useColmeia, pilarPorSlug } from '../lib/contexto'
import { haQuanto } from '../lib/formato'
import { IconeVoltar } from '../components/Icones'

type Resposta = { id: number; texto: string; criado_em: string; autora: string; perfis: { nome: string } | null }

export function PaginaPost() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { sessao, perfil, pilares } = useColmeia()
  const [post, setPost] = useState<Post | null>(null)
  const [respostas, setRespostas] = useState<Resposta[]>([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function carregar() {
    const { data } = await supabase.from('posts').select(SELECT_POST).eq('id', Number(id)).single()
    setPost(data as unknown as Post)
    const r = await supabase.from('respostas').select('id, texto, criado_em, autora, perfis(nome)').eq('post_id', Number(id)).order('criado_em')
    setRespostas((r.data as unknown as Resposta[]) ?? [])
  }

  useEffect(() => { carregar() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function responder(e: FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return
    setEnviando(true)
    await supabase.from('respostas').insert({ post_id: Number(id), texto: texto.trim() })
    setEnviando(false)
    setTexto('')
    carregar()
  }

  async function apagarPost() {
    if (!confirm('Apagar esta publicação e as respostas dela?')) return
    await supabase.from('posts').delete().eq('id', Number(id))
    navegar('/comunidade')
  }

  async function apagarResposta(rid: number) {
    if (!confirm('Apagar esta resposta?')) return
    await supabase.from('respostas').delete().eq('id', rid)
    carregar()
  }

  if (!post) return null
  const pilar = pilarPorSlug(pilares, post.pilar_slug)
  const podeApagar = (autora: string) => autora === sessao.user.id || perfil?.admin

  return (
    <div className="secao" style={{ gap: 16, maxWidth: 760 }}>
        <button className="voltar" onClick={() => navegar(-1)} aria-label="Voltar"><IconeVoltar /></button>

        <article className="cartao" style={{ gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar" style={{ background: pilar?.cor ?? 'var(--espresso)', color: pilar?.tinta ?? 'var(--creme)' }}>{(post.perfis?.nome || 'R')[0].toUpperCase()}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <b style={{ fontSize: 15 }}>{post.perfis?.nome}</b>
              <span className="suave" style={{ fontSize: 13 }}>{pilar?.nome ?? 'Conversa geral'} · {haQuanto(post.criado_em)}</span>
            </div>
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.55, whiteSpace: 'pre-line' }}>{post.texto}</p>
          {podeApagar(post.autora) && <button className="botao-texto" style={{ alignSelf: 'flex-start', padding: 0 }} onClick={apagarPost}>Apagar</button>}
        </article>

        <h2>{respostas.length} {respostas.length === 1 ? 'resposta' : 'respostas'}</h2>

        {respostas.map((r) => (
          <div key={r.id} className="cartao" style={{ background: 'transparent' }}>
            <b style={{ fontSize: 14 }}>{r.perfis?.nome} <span className="suave" style={{ fontWeight: 400, fontSize: 13 }}>· {haQuanto(r.criado_em)}</span></b>
            <p style={{ fontSize: 16, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{r.texto}</p>
            {podeApagar(r.autora) && <button className="botao-texto" style={{ alignSelf: 'flex-start', padding: 0, minHeight: 32, fontSize: 14 }} onClick={() => apagarResposta(r.id)}>Apagar</button>}
          </div>
        ))}

        <form onSubmit={responder} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label htmlFor="resposta" style={{ fontWeight: 700, fontSize: 15 }}>Responder</label>
          <textarea id="resposta" className="entrada" value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={4000} />
          <button className="botao" type="submit" disabled={enviando || !texto.trim()}>{enviando ? 'Enviando…' : 'Enviar resposta'}</button>
        </form>
    </div>
  )
}
