import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Perfil, Pilar } from './supabase'

export type Contexto = {
  sessao: Session
  perfil: Perfil | null
  pilares: Pilar[]
  recarregarPerfil: () => Promise<void>
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
