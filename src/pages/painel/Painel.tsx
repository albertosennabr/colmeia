import { Navigate, useSearchParams } from 'react-router-dom'
import { useColmeia } from '../../lib/contexto'
import { VisaoGeral } from './VisaoGeral'
import { AdminCiclos } from './AdminCiclos'
import { AdminBiblioteca } from './AdminBiblioteca'
import { AdminPilares } from './AdminPilares'
import { AdminMembras } from './AdminMembras'
import { AdminComunidade } from './AdminComunidade'

const ABAS = [
  ['geral', 'Visão geral'],
  ['biblioteca', 'Biblioteca'],
  ['ciclos', 'Ciclos e rodas'],
  ['pilares', 'Pilares'],
  ['membras', 'Membras'],
  ['comunidade', 'Comunidade'],
] as const

type Aba = (typeof ABAS)[number][0]

export function Painel() {
  const { perfil } = useColmeia()
  const [params, setParams] = useSearchParams()
  const aba = (params.get('aba') ?? 'geral') as Aba

  if (perfil && !perfil.admin) return <Navigate to="/" replace />
  if (!perfil) return null

  return (
    <>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="rotulo">Só para quem cuida da casa</span>
        <h1>Painel</h1>
      </header>

      <div className="abas" role="tablist" aria-label="Seções do painel">
        {ABAS.map(([id, nome]) => (
          <button key={id} role="tab" aria-selected={aba === id} onClick={() => setParams({ aba: id })}>{nome}</button>
        ))}
      </div>

      <div role="tabpanel">
        {aba === 'geral' && <VisaoGeral irPara={(a) => setParams({ aba: a })} />}
        {aba === 'biblioteca' && <AdminBiblioteca />}
        {aba === 'ciclos' && <AdminCiclos />}
        {aba === 'pilares' && <AdminPilares />}
        {aba === 'membras' && <AdminMembras />}
        {aba === 'comunidade' && <AdminComunidade />}
      </div>
    </>
  )
}
