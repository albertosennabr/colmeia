import { useCallback, useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase, type Ciclo, type Perfil, type Pilar } from './lib/supabase'
import { ContextoColmeia } from './lib/contexto'
import { Layout } from './components/Layout'
import { Entrar } from './pages/Entrar'
import { Inicio } from './pages/Inicio'
import { Proposta } from './pages/Proposta'
import { PaginaPilar } from './pages/Pilar'
import { PaginaCiclo } from './pages/Ciclo'
import { Ciclos } from './pages/Ciclos'
import { Comunidade } from './pages/Comunidade'
import { PaginaPost } from './pages/Post'
import { Biblioteca } from './pages/Biblioteca'
import { PaginaPerfil } from './pages/Perfil'
import { Painel } from './pages/painel/Painel'

export default function App() {
  const [carregando, setCarregando] = useState(true)
  const [sessao, setSessao] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [pilares, setPilares] = useState<Pilar[]>([])
  const [ciclos, setCiclos] = useState<Ciclo[]>([])
  const [aviso, setAviso] = useState('')

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

  const recarregarBase = useCallback(async () => {
    const [p, c] = await Promise.all([
      supabase.from('pilares').select('*').order('ordem'),
      supabase.from('ciclos').select('*').order('numero'),
    ])
    setPilares(p.data ?? [])
    setCiclos(c.data ?? [])
  }, [])

  useEffect(() => {
    if (!usuaria) return
    recarregarPerfil()
    recarregarBase()
  }, [usuaria, recarregarPerfil, recarregarBase])

  const avisar = useCallback((texto: string) => {
    setAviso(texto)
    window.setTimeout(() => setAviso(''), 2600)
  }, [])

  if (carregando) return null
  if (!sessao) return <Entrar />

  return (
    <ContextoColmeia.Provider value={{ sessao, perfil, pilares, ciclos, recarregarPerfil, recarregarBase, avisar }}>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/proposta" element={<Proposta />} />
            <Route path="/pilar/:slug" element={<PaginaPilar />} />
            <Route path="/ciclo" element={<PaginaCiclo />} />
            <Route path="/ciclo/:numero" element={<PaginaCiclo />} />
            <Route path="/ciclos" element={<Ciclos />} />
            <Route path="/comunidade" element={<Comunidade />} />
            <Route path="/post/:id" element={<PaginaPost />} />
            <Route path="/biblioteca" element={<Biblioteca />} />
            <Route path="/perfil" element={<PaginaPerfil />} />
            <Route path="/painel" element={<Painel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
      {aviso && <div className="aviso-flutuante" role="status">{aviso}</div>}
    </ContextoColmeia.Provider>
  )
}
