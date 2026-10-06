import { Link } from 'react-router-dom'
import type { Pilar } from '../lib/supabase'

type Props = {
  pilares: Pilar[]
  largura?: number          // largura de um favo, em px
  foco?: string[]           // pilares em destaque; os outros ficam esmaecidos
  centro?: { rotulo: string; titulo: string; para: string }
}

// Os seis pilares em volta de um favo central, no sentido horário a partir do alto à esquerda.
export function Hexagono({ pilares, largura = 100, foco, centro }: Props) {
  const w = largura
  const h = w * 1.1547
  const sx = w + 6
  const sy = 0.75 * h + 5
  const cx = sx
  const cy = sy
  const desloc: [number, number][] = [[-sx / 2, -sy], [sx / 2, -sy], [sx, 0], [sx / 2, sy], [-sx / 2, sy], [-sx, 0]]
  const fonte = Math.round(w * 0.13)
  const favo = (x: number, y: number) => ({ position: 'absolute' as const, left: cx + x, top: cy + y, width: w, height: h })
  const c = centro ?? { rotulo: 'A Colmeia', titulo: 'Como funciona', para: '/proposta' }

  return (
    <div style={{ position: 'relative', width: 2 * sx + w, height: h + 2 * sy, alignSelf: 'center', flex: 'none' }}>
      {pilares.slice(0, 6).map((p, i) => {
        const apagado = foco && !foco.includes(p.slug)
        return (
          <Link
            key={p.slug}
            to={`/pilar/${p.slug}`}
            className="hex"
            title={p.nome}
            style={{
              ...favo(desloc[i][0], desloc[i][1]),
              background: p.cor, color: p.tinta, opacity: apagado ? 0.3 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              padding: `0 ${Math.round(w * 0.11)}px`, fontWeight: 600, fontSize: fonte, lineHeight: 1.15,
              textDecoration: 'none', transition: 'transform 0.15s',
            }}
          >
            {p.nome}
          </Link>
        )
      })}
      <Link
        to={c.para}
        className="hex"
        style={{
          ...favo(0, 0), background: 'var(--vinho)', color: 'var(--creme)', textDecoration: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, textAlign: 'center', padding: '0 10px',
        }}
      >
        <span style={{ fontSize: Math.round(w * 0.105), letterSpacing: 1, textTransform: 'uppercase', color: 'var(--mel)', fontWeight: 700 }}>{c.rotulo}</span>
        <span style={{ fontFamily: 'var(--fonte-titulo)', fontSize: Math.round(w * 0.17), fontWeight: 500, lineHeight: 1.1 }}>{c.titulo}</span>
      </Link>
    </div>
  )
}
