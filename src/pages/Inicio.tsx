import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, SELECT_POST, type Conteudo, type Post, type Roda } from '../lib/supabase'
import { cicloAtual, pilarPorSlug, useColmeia } from '../lib/contexto'
import { haQuanto } from '../lib/formato'
import { Hexagono } from '../components/Hexagono'
import { CartaoCiclo, CartaoProximaRoda, Esqueleto } from '../components/Partes'
import { IconePerfil, IconePlay } from '../components/Icones'

function saudacao() {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

export function Inicio() {
  const { perfil, pilares, ciclos } = useColmeia()
  const ciclo = cicloAtual(ciclos)
  const [proxima, setProxima] = useState<Roda | null>(null)
  const [destaque, setDestaque] = useState<Conteudo | null>(null)
  const [posts, setPosts] = useState<Post[] | null>(null)

  useEffect(() => {
    supabase.from('rodas').select('*').gte('data', new Date().toISOString()).order('data').limit(1).then(({ data }) => setProxima(data?.[0] ?? null))
    supabase.from('conteudos').select('*').eq('destaque', true).limit(1).then(({ data }) => setDestaque(data?.[0] ?? null))
    supabase.from('posts').select(SELECT_POST).order('criado_em', { ascending: false }).limit(3).then(({ data }) => setPosts((data as unknown as Post[]) ?? []))
  }, [])

  const cicloDaRoda = proxima ? ciclos.find((c) => c.id === proxima.ciclo_id) : undefined

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="suave" style={{ fontSize: 16 }}>{saudacao()}, {perfil?.nome || 'rainha'}</span>
          <h1>Bem me quero!</h1>
        </div>
        <Link to="/perfil" aria-label="O meu perfil" className="voltar so-celular" style={{ justifyContent: 'center', color: 'var(--espresso)' }}><IconePerfil /></Link>
      </div>

      <div className="grade-2">
        <section className="secao" aria-labelledby="t-pilares" style={{ gap: 16 }}>
          <h2 id="t-pilares">Os seis pilares da Colmeia</h2>
          <p className="texto">
            São a base de tudo o que vivemos aqui, inspirados na colmeia. Cada ciclo escolhe um tema e aprofunda um ou mais pilares.
          </p>
          <div className="so-celular" style={{ justifyContent: 'center' }}><Hexagono pilares={pilares} largura={96} /></div>
          <div className="so-desktop" style={{ justifyContent: 'center', paddingTop: 8 }}><Hexagono pilares={pilares} largura={128} /></div>
          <Link to="/proposta" style={{ fontWeight: 700, alignSelf: 'center' }}>Entender como a Colmeia funciona</Link>
        </section>

        <div className="secao" style={{ gap: 16 }}>
          {proxima && <CartaoProximaRoda roda={proxima} ciclo={cicloDaRoda} />}
          {ciclo && <CartaoCiclo ciclo={ciclo} pilares={pilares} />}

          {destaque && (
            <Link to="/biblioteca" className="cartao" style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <span style={{ flex: 'none', width: 46, height: 46, borderRadius: 23, background: 'var(--terracota)', color: 'var(--branco)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconePlay /></span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="rotulo">Para ouvir esta semana</span>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{destaque.titulo}{destaque.duracao_min ? ` · ${destaque.duracao_min} min` : ''}</span>
              </span>
            </Link>
          )}

          <section className="secao" aria-labelledby="t-conversas">
            <div className="linha-titulo">
              <h2 id="t-conversas">Na Colmeia agora</h2>
              <Link to="/comunidade" style={{ fontWeight: 700, fontSize: 15 }}>Ver tudo</Link>
            </div>
            {posts === null && <Esqueleto altura={90} />}
            {posts?.length === 0 && <p className="vazio">Ainda ninguém escreveu. Que tal ser a primeira?</p>}
            {posts?.map((p) => (
              <Link key={p.id} to={`/post/${p.id}`} className="cartao" style={{ gap: 4 }}>
                <span className="suave" style={{ fontSize: 13 }}><b style={{ color: 'var(--espresso)' }}>{p.perfis?.nome}</b> · {pilarPorSlug(pilares, p.pilar_slug)?.nome ?? 'Conversa geral'} · {haQuanto(p.criado_em)}</span>
                <span style={{ fontSize: 15, lineHeight: 1.45 }}>{p.texto.length > 120 ? p.texto.slice(0, 120) + '…' : p.texto}</span>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </>
  )
}
