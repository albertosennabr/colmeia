import { Link } from 'react-router-dom'
import type { Pilar } from '../lib/supabase'

// Seis pilares em volta de um favo central, no sentido horário a partir do alto à esquerda.
const POSICOES: [number, number][] = [[53, 0], [159, 0], [212, 92], [159, 184], [53, 184], [0, 92]]

export function Hexagono({ pilares, feitos, total }: { pilares: Pilar[]; feitos: number; total: number }) {
  return (
    <div style={{ position: 'relative', width: 312, height: 300, alignSelf: 'center' }}>
      {pilares.slice(0, 6).map((p, i) => (
        <Link
          key={p.slug}
          to={`/pilar/${p.slug}`}
          className="hex"
          style={{
            position: 'absolute', left: POSICOES[i][0], top: POSICOES[i][1], width: 100, height: 116,
            background: p.cor, color: p.tinta, display: 'flex', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '0 11px', fontWeight: 700, fontSize: 13, lineHeight: 1.2,
            textDecoration: 'none', hyphens: 'auto',
          }}
        >
          {p.nome}
        </Link>
      ))}
      <Link
        to="/ciclo"
        className="hex"
        style={{
          position: 'absolute', left: 106, top: 92, width: 100, height: 116, background: 'var(--espresso)', color: 'var(--creme)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, textDecoration: 'none',
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--mel)', fontWeight: 700 }}>Ciclo 1</span>
        <span style={{ fontFamily: 'Petrona, serif', fontSize: 22, fontWeight: 700 }}>{feitos} de {total}</span>
        <span style={{ fontSize: 11, color: '#EADFC8' }}>encontros</span>
      </Link>
    </div>
  )
}
