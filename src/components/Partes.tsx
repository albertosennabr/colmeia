import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Ciclo, Pilar, Roda, StatusCiclo } from '../lib/supabase'
import { NOMES_STATUS } from '../lib/supabase'
import { diaRoda, horaRoda, periodoCiclo } from '../lib/formato'
import { pilarPorSlug } from '../lib/contexto'

const CORES_STATUS: Record<StatusCiclo, [string, string]> = {
  em_breve: ['var(--areia)', 'var(--texto-medio)'],
  inscricoes: ['var(--terracota)', 'var(--branco)'],
  em_andamento: ['var(--musgo)', 'var(--branco)'],
  encerrado: ['var(--linha)', 'var(--texto-suave)'],
}

export function EtiquetaStatus({ status }: { status: StatusCiclo }) {
  const [fundo, tinta] = CORES_STATUS[status]
  return <span className="etiqueta" style={{ background: fundo, color: tinta }}>{NOMES_STATUS[status]}</span>
}

export function EtiquetaPilar({ pilar }: { pilar: Pilar | null }) {
  if (!pilar) return null
  return <span className="etiqueta" style={{ background: pilar.cor, color: pilar.tinta }}>{pilar.nome}</span>
}

export function CabecalhoPagina({ rotulo, titulo, children }: { rotulo?: string; titulo: string; children?: ReactNode }) {
  return (
    <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rotulo && <span className="rotulo">{rotulo}</span>}
      <h1>{titulo}</h1>
      {children}
    </header>
  )
}

export function CartaoCiclo({ ciclo, pilares, escuro = false }: { ciclo: Ciclo; pilares: Pilar[]; escuro?: boolean }) {
  return (
    <Link to={`/ciclo/${ciclo.numero}`} className={`cartao ${escuro ? 'cartao-escuro' : ''}`} style={{ gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span className="rotulo" style={{ color: escuro ? 'var(--mel)' : undefined }}>Ciclo {ciclo.numero} · {periodoCiclo(ciclo)}</span>
        <EtiquetaStatus status={ciclo.status} />
      </div>
      <span style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{ciclo.titulo}</span>
      <span style={{ fontSize: 16, lineHeight: 1.5, color: escuro ? 'var(--texto-claro)' : 'var(--texto-medio)' }}>{ciclo.tema}</span>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingTop: 4 }}>
        {ciclo.pilares.map((s) => <EtiquetaPilar key={s} pilar={pilarPorSlug(pilares, s)} />)}
      </div>
    </Link>
  )
}

export function CartaoProximaRoda({ roda, ciclo }: { roda: Roda; ciclo?: Ciclo }) {
  return (
    <Link to={`/ciclo/${ciclo?.numero ?? ''}`} className="cartao cartao-escuro" style={{ gap: 6 }}>
      <span className="rotulo" style={{ color: 'var(--mel)' }}>Próxima roda{ciclo ? ` · ciclo ${ciclo.numero}` : ''}</span>
      <span style={{ fontFamily: 'var(--fonte-titulo)', fontSize: 21, fontWeight: 700, lineHeight: 1.25 }}>{roda.ordem} · {roda.titulo}</span>
      <span style={{ fontSize: 15, color: 'var(--texto-claro)' }}>{diaRoda(roda.data)}</span>
      <span style={{ fontSize: 14, color: 'var(--texto-claro)' }}>{horaRoda(roda.data)}</span>
      {roda.link_ao_vivo && <span style={{ fontWeight: 700, color: 'var(--mel)', paddingTop: 4 }}>Link da roda disponível</span>}
    </Link>
  )
}

export function Esqueleto({ altura = 80 }: { altura?: number }) {
  return <div className="esqueleto" style={{ height: altura }} aria-hidden="true" />
}
