import { useEffect, useState } from 'react'
import { supabase, type Encontro } from '../lib/supabase'
import { useColmeia, pilarPorSlug } from '../lib/contexto'
import { dataEncontro } from '../lib/formato'
import { Nav } from '../components/Nav'

export function Ciclo() {
  const { pilares } = useColmeia()
  const [encontros, setEncontros] = useState<Encontro[]>([])

  useEffect(() => {
    supabase.from('encontros').select('*').eq('ciclo', 1).order('ordem').then(({ data }) => setEncontros(data ?? []))
  }, [])

  const agora = Date.now()
  const feitos = encontros.filter((e) => new Date(e.data).getTime() < agora).length
  const pct = encontros.length ? Math.round((feitos / encontros.length) * 100) : 0

  return (
    <>
      <main className="tela tela-com-nav" style={{ gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="rotulo">Ciclo 1 · março a junho de 2027</span>
          <h1>Oito encontros, do primeiro voo ao último.</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="suave" style={{ display: 'flex', justifyContent: 'space-between' }}><span>{feitos} de {encontros.length} encontros</span><span>{pct}%</span></div>
          <div style={{ height: 8, borderRadius: 4, background: 'var(--linha)', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: 8, background: 'var(--ouro)' }} />
          </div>
        </div>

        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {encontros.map((e, i) => {
            const pilar = pilarPorSlug(pilares, e.pilar_slug)
            const estado = i < feitos ? 'feito' : i === feitos ? 'proximo' : 'depois'
            const cor = estado === 'depois' ? 'var(--linha)' : pilar?.cor ?? 'var(--espresso)'
            const tinta = estado === 'depois' ? 'var(--texto-suave)' : pilar?.tinta ?? 'var(--creme)'
            const ultimo = i === encontros.length - 1
            return (
              <li key={e.id} style={{ display: 'flex', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 34, flex: 'none' }}>
                  <div className="hex" style={{ width: 34, height: 39, background: cor, color: tinta, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flex: 'none' }}>{e.ordem}</div>
                  {!ultimo && <div style={{ width: 2, flex: 1, minHeight: 8, background: estado === 'feito' ? 'var(--ouro)' : 'var(--linha)' }} />}
                </div>
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 12, padding: '12px 14px', borderRadius: 14,
                  background: estado === 'proximo' ? 'var(--branco)' : 'transparent', border: `2px solid ${estado === 'proximo' ? 'var(--terracota)' : 'transparent'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'Petrona, serif', fontWeight: 700, fontSize: 18 }}>{e.titulo}</span>
                    {estado === 'proximo' && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--branco)', background: 'var(--terracota)', padding: '3px 10px', borderRadius: 10 }}>Próximo</span>}
                  </div>
                  <span className="suave" style={{ textTransform: 'capitalize' }}>{dataEncontro(e.data)}</span>
                  {estado === 'proximo' && e.link_ao_vivo && <a href={e.link_ao_vivo} target="_blank" rel="noopener" style={{ fontWeight: 700, fontSize: 15 }}>Entrar ao vivo</a>}
                  {e.gravacao_url && <a href={e.gravacao_url} target="_blank" rel="noopener" style={{ fontWeight: 700, fontSize: 15, color: 'var(--musgo)' }}>Ver a gravação</a>}
                </div>
              </li>
            )
          })}
        </ol>
      </main>
      <Nav />
    </>
  )
}
