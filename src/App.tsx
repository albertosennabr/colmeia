import { useCallback, useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase, type Perfil, type Pilar } from './lib/supabase'
import { ContextoColmeia } from './lib/contexto'
import { Entrar } from './pages/Entrar'
import { Inicio } from './pages/Inicio'
import { PaginaPilar } from './pages/Pilar'
import { Ciclo } from './pages/Ciclo'
import { Comunidade } from './pages/Comunidade'
import { PaginaPost } from './pages/Post'
import { Biblioteca } from './pages/Biblioteca'
import { PaginaPerfil } from './pages/Perfil'
import { Admin } from './pages/Admin'

export default function App() {
  const [carregando, setCarregando] = useState(true)
  const [sessao, setSessao] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [pilares, setPilares] = useState<Pilar[]>([])

  useEffect(() => {
    // getSession espera o cliente ler o link de acesso que vem no endereço
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session)
      if (window.location.hash.includes('access_token')) {
        history.replaceState(null, '', window.location.pathname + '#/')
      }
      setCarregando(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_evento, s) => setSessao(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const usuaria = sessao?.user.id
  const recarregarPerfil = useCallback(async () => {
    if (!usuaria) return
    const { data } = await supabase.from('perfis').select('id, nome, admin').eq('id', usuaria).single()
    setPerfil(data)
  }, [usuaria])

  useEffect(() => {
    if (!usuaria) return
    recarregarPerfil()
    supabase.from('pilares').select('*').order('ordem').then(({ data }) => setPilares(data ?? []))
  }, [usuaria, recarregarPerfil])

  if (carregando) return null
  if (!sessao) return <Entrar />

  return (
    <ContextoColmeia.Provider value={{ sessao, perfil, pilares, recarregarPerfil }}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/pilar/:slug" element={<PaginaPilar />} />
          <Route path="/ciclo" element={<Ciclo />} />
          <Route path="/comunidade" element={<Comunidade />} />
          <Route path="/post/:id" element={<PaginaPost />} />
          <Route path="/biblioteca" element={<Biblioteca />} />
          <Route path="/perfil" element={<PaginaPerfil />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ContextoColmeia.Provider>
  )
}
