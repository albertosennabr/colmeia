import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase, SELECT_POST, type Conteudo, type Post, type Roda } from '../lib/supabase'
import { useColmeia, pilarPorSlug } from '../lib/contexto'
import { diaRoda, haQuanto } from '../lib/formato'
import { Player } from '../components/Player'
import { CartaoCiclo } from '../components/Partes'
import { IconeVoltar } from '../components/Icones'

export function PaginaPilar() {
  const { slug = '' } = useParams()
  const { pilares, ciclos } = useColmeia()
  const pilar = pilarPorSlug(pilares, slug)
  const [rodas, setRodas] = useState<Roda[]>([])
  const [conteudos, setConteudos] = useState<Conteudo[]>([])
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    supabase.from('rodas').select('*').eq('pilar_slug', slug).order('data').then(({ data }) => setRodas(data ?? []))
    supabase.from('conteudos').select('*').eq('pilar_slug', slug).order('criado_em').then(({ data }) => setConteudos(data ?? []))
    supabase.from('posts').select(SELECT_POST).eq('pilar_slug', slug).order('criado_em', { ascending: false }).limit(4)
      .then(({ data }) => setPosts((data as unknown as Post[]) ?? []))
  }, [slug])

  if (!pilar) return null
  const ciclosDoPilar = ciclos.filter((c) => c.pilares.includes(pilar.slug))

  return (
    <>
      <header style={{ background: pilar.cor, color: pilar.tinta, padding: '20px 24px 30px', borderRadius: 24, display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', overflow: 'hidden' }}>
        <div className="hex" aria-hidden="true" style={{ position: 'absolute', right: -30, top: 30, width: 160, height: 185, background: 'rgba(255,255,255,0.16)' }} />
        <Link to="/" className="voltar" aria-label="Voltar ao início" style={{ color: pilar.tinta, position: 'relative' }}><IconeVoltar /></Link>
        <span className="rotulo" style={{ color: pilar.tinta, position: 'relative' }}>Pilar {pilar.ordem} de 6</span>
        <h1 style={{ fontWeight: 700, fontSize: 38, position: 'relative' }}>{pilar.nome}</h1>
        <p style={{ fontSize: 17, lineHeight: 1.55, position: 'relative', maxWidth: 640 }}>{pilar.descricao}</p>
      </header>

      {pilar.frase && <p className="citacao" style={{ textAlign: 'center' }}>“{pilar.frase}”</p>}

      <p className="aviso">
        Este é um dos seis pilares que sustentam a Colmeia. Ele aparece ao longo dos ciclos: alguns ciclos o atravessam, outros são inteiros dedicados a ele.
      </p>

      <div className="grade-2">
        <div className="secao" style={{ gap: 24 }}>
          <section className="secao" aria-labelledby="t-ciclos">
            <h2 id="t-ciclos">Ciclos que trabalham este pilar</h2>
            {ciclosDoPilar.length === 0 && <p className="vazio">Nenhum ciclo ainda. Ele vai aparecer num ciclo futuro.</p>}
            {ciclosDoPilar.map((c) => <CartaoCiclo key={c.id} ciclo={c} pilares={pilares} />)}
          </section>

          {rodas.length > 0 && (
            <section className="secao" aria-labelledby="t-rodas">
              <h2 id="t-rodas">Rodas sobre este pilar</h2>
              {rodas.map((r) => {
                const c = ciclos.find((x) => x.id === r.ciclo_id)
                return (
                  <Link key={r.id} to={`/ciclo/${c?.numero ?? ''}`} className="item">
                    <span style={{ display: 'flex', flexDirection: 'column' }}>
                      <b style={{ fontSize: 15 }}>{r.titulo}</b>
                      <span className="suave" style={{ fontSize: 13 }}>Ciclo {c?.numero} · roda {r.ordem} · {diaRoda(r.data)}</span>
                    </span>
                  </Link>
                )
              })}
            </section>
          )}
        </div>

        <div className="secao" style={{ gap: 24 }}>
          {conteudos.length > 0 && (
            <section className="secao" aria-labelledby="t-materiais">
              <h2 id="t-materiais">Para ouvir e praticar</h2>
              {conteudos.map((c) => <Player key={c.id} c={c} />)}
            </section>
          )}

          <section className="secao" aria-labelledby="t-conversa">
            <div className="linha-titulo">
              <h2 id="t-conversa">Conversa do pilar</h2>
              <Link to={`/comunidade?pilar=${pilar.slug}`} style={{ fontWeight: 700, fontSize: 15 }}>Ver tudo</Link>
            </div>
            {posts.length === 0 && <p className="vazio">Ninguém escreveu aqui ainda. Que tal começar?</p>}
            {posts.map((p) => (
              <Link key={p.id} to={`/post/${p.id}`} className="cartao" style={{ gap: 4 }}>
                <b style={{ fontSize: 14 }}>{p.perfis?.nome}</b>
                <span style={{ fontSize: 15, lineHeight: 1.45 }}>{p.texto.length > 160 ? p.texto.slice(0, 160) + '…' : p.texto}</span>
                <span className="suave" style={{ fontSize: 13 }}>{haQuanto(p.criado_em)} · {p.respostas[0]?.count ?? 0} respostas</span>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </>
  )
}
