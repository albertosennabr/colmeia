import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Ciclo, Perfil, Pilar } from './supabase'

export type Contexto = {
  sessao: Session
  perfil: Perfil | null
  pilares: Pilar[]
  ciclos: Ciclo[]
  recarregarPerfil: () => Promise<void>
  recarregarBase: () => Promise<void>
  avisar: (texto: string) => void
}

export const ContextoColmeia = createContext<Contexto | null>(null)

export function useColmeia() {
  const c = useContext(ContextoColmeia)
  if (!c) throw new Error('useColmeia fora do provedor')
  return c
}

export function pilarPorSlug(pilares: Pilar[], slug: string | null) {
  return pilares.find((p) => p.slug === slug) ?? null
}

// O ciclo que a casa está vivendo: o em andamento; senão o de inscrições abertas;
// senão o próximo que vem; senão o último que houve.
export function cicloAtual(ciclos: Ciclo[]) {
  return (
    ciclos.find((c) => c.status === 'em_andamento') ??
    ciclos.find((c) => c.status === 'inscricoes') ??
    ciclos.find((c) => c.status === 'em_breve') ??
    ciclos[ciclos.length - 1] ??
    null
  )
}
