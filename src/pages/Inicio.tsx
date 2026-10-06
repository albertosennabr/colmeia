import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type Conteudo, type Encontro } from '../lib/supabase'
import { useColmeia } from '../lib/contexto'
import { dataEncontro } from '../lib/formato'
import { Hexagono } from '../components/Hexagono'
import { Nav } from '../components/Nav'
import { IconePerfil, IconePlay } from '../components/Icones'

function saudacao() {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

export function Inicio() {
  const { perfil, pilares } = useColmeia()
  const [encontros, setEncontros] = useState<Encontro[]>([])
  const [destaque, setDestaque] = useState<Conteudo | null>(null)

  useEffect(() => {
    supabase.from('encontros').select('*').eq('ciclo', 1).order('ordem').then(({ data }) => setEncontros(data ?? []))
    supabase.from('conteudos').select('*').eq('destaque', true).limit(1).then(({ data }) => setDestaque(data?.[0] ?? null))
  }, [])

  const agora = Date.now()
  const feitos = encontros.filter((e) => new Date(e.data).getTime() < agora).length
  const proximo = encontros.find((e) => new Date(e.data).getTime() >= agora)

  return (
    <>
      <main className="tela tela-com-nav">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="suave" style={{ fontSize: 15 }}>{saudacao()}, {perfil?.nome || 'rainha'}</span>
            <h1>Bem me quero!</h1>
          </div>
          <Link to="/perfil" aria-label="O meu perfil" className="voltar" style={{ justifyContent: 'center', color: 'var(--espresso)' }}><IconePerfil /></Link>
        </div>

        {proximo && (
          <Link to="/ciclo" className="cartao cartao-escuro">
            <span className="rotulo" style={{ color: 'var(--mel)' }}>Próximo encontro</span>
            <span style={{ fontFamily: 'Petrona, serif', fontSize: 21, fontWeight: 700 }}>{proximo.ordem} · {proximo.titulo}</span>
            <span style={{ fontSize: 15, color: '#EADFC8', textTransform: 'capitalize' }}>{dataEncontro(proximo.data)}</span>
          </Link>
        )}

        <div className="secao">
          <h2>Os seis pilares</h2>
          <Hexagono pilares={pilares} feitos={feitos} total={encontros.length || 8} />
        </div>

        {destaque && (
          <Link to="/biblioteca" className="cartao" style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <span style={{ flex: 'none', width: 46, height: 46, borderRadius: 23, background: 'var(--terracota)', color: 'var(--branco)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconePlay /></span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="rotulo">Áudio da semana</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{destaque.titulo}{destaque.duracao_min ? ` · ${destaque.duracao_min} min` : ''}</span>
            </span>
          </Link>
        )}
      </main>
      <Nav />
    </>
  )
}
