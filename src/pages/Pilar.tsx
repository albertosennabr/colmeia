import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase, type Conteudo, type Encontro, type Post } from '../lib/supabase'
import { useColmeia, pilarPorSlug } from '../lib/contexto'
import { dataEncontro, haQuanto } from '../lib/formato'
import { Nav } from '../components/Nav'
import { Player } from '../components/Player'
import { IconeVoltar } from '../components/Icones'

export function PaginaPilar() {
  const { slug = '' } = useParams()
  const { pilares } = useColmeia()
  const pilar = pilarPorSlug(pilares, slug)
  const [encontro, setEncontro] = useState<Encontro | null>(null)
  const [conteudos, setConteudos] = useState<Conteudo[]>([])
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    supabase.from('encontros').select('*').eq('pilar_slug', slug).limit(1).then(({ data }) => setEncontro(data?.[0] ?? null))
    supabase.from('conteudos').select('*').eq('pilar_slug', slug).order('criado_em').then(({ data }) => setConteudos(data ?? []))
    supabase.from('posts').select('id, texto, criado_em, pilar_slug, autora, perfis(nome), respostas(count)')
      .eq('pilar_slug', slug).order('criado_em', { ascending: false }).limit(3)
      .then(({ data }) => setPosts((data as unknown as Post[]) ?? []))
  }, [slug])

  if (!pilar) return null

  return (
    <>
      <main className="tela-com-nav" style={{ flex: 1 }}>
        <header style={{ background: pilar.cor, color: pilar.tinta, padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', overflow: 'hidden' }}>
          <div className="hex" aria-hidden="true" style={{ position: 'absolute', right: -30, top: 40, width: 130, height: 150, background: 'rgba(255,255,255,0.18)' }} />
          <Link to="/" className="voltar" aria-label="Voltar ao início" style={{ color: pilar.tinta, position: 'relative' }}><IconeVoltar /></Link>
          <span className="rotulo" style={{ color: pilar.tinta, position: 'relative' }}>Pilar {pilar.ordem} de 6</span>
          <h1 style={{ fontWeight: 700, fontSize: 36, position: 'relative' }}>{pilar.nome}</h1>
          <p style={{ fontSize: 16, lineHeight: 1.5, position: 'relative' }}>{pilar.descricao}</p>
        </header>

        <div className="tela" style={{ paddingTop: 22 }}>
          {pilar.frase && <p className="citacao">“{pilar.frase}”</p>}

          {encontro && (
            <div className="secao">
              <h2>O encontro</h2>
              <div className="cartao">
                <b style={{ fontSize: 16 }}>Encontro {encontro.ordem}</b>
                <span className="suave" style={{ textTransform: 'capitalize' }}>{dataEncontro(encontro.data)}</span>
                {encontro.gravacao_url
                  ? <a href={encontro.gravacao_url} target="_blank" rel="noopener" style={{ fontWeight: 700 }}>Ver a gravação</a>
                  : encontro.link_ao_vivo && <a href={encontro.link_ao_vivo} target="_blank" rel="noopener" style={{ fontWeight: 700 }}>Entrar ao vivo</a>}
              </div>
            </div>
          )}

          {conteudos.length > 0 && (
            <div className="secao">
              <h2>Para praticar</h2>
              {conteudos.map((c) => <Player key={c.id} c={c} subtitulo={c.tipo === 'meditacao' ? 'Meditação' : 'Áudio da Paula'} />)}
            </div>
          )}

          <div className="secao">
            <div className="linha-titulo">
              <h2>Conversa do pilar</h2>
              <Link to={`/comunidade?pilar=${pilar.slug}`} style={{ fontWeight: 700, fontSize: 15 }}>Ver tudo</Link>
            </div>
            {posts.length === 0 && <p className="suave" style={{ fontSize: 15 }}>Ninguém escreveu aqui ainda. Que tal começar?</p>}
            {posts.map((p) => (
              <Link key={p.id} to={`/post/${p.id}`} className="cartao">
                <b style={{ fontSize: 14 }}>{p.perfis?.nome}</b>
                <span style={{ fontSize: 15, lineHeight: 1.45 }}>{p.texto.length > 160 ? p.texto.slice(0, 160) + '…' : p.texto}</span>
                <span className="suave" style={{ fontSize: 13 }}>{haQuanto(p.criado_em)} · {p.respostas[0]?.count ?? 0} respostas</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Nav />
    </>
  )
}
