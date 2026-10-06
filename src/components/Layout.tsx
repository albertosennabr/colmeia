import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useColmeia } from '../lib/contexto'
import { IconeBiblioteca, IconeCiclo, IconeColmeia, IconeInicio, IconePainel, IconePerfil, IconeProposta } from './Icones'

export function Marca({ claro = true }: { claro?: boolean }) {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: claro ? 'var(--creme)' : 'var(--espresso)' }}>
      <span className="hex" style={{ width: 26, height: 30, background: 'var(--mel)', flex: 'none' }} />
      <span style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'Petrona, serif', fontWeight: 700, fontSize: 20 }}>Colmeia</span>
        <span style={{ fontSize: 11, color: claro ? 'var(--mel)' : 'var(--ouro-escuro)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Casa de Rainhas</span>
      </span>
    </Link>
  )
}

export function Layout() {
  const { perfil } = useColmeia()
  const { pathname } = useLocation()

  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <div className="moldura">
      <aside className="lateral" aria-label="Menu">
        <div style={{ padding: '0 8px' }}><Marca /></div>
        <nav aria-label="Menu principal">
          <NavLink to="/" end><IconeInicio />Início</NavLink>
          <NavLink to="/ciclo"><IconeCiclo />O ciclo</NavLink>
          <NavLink to="/comunidade"><IconeColmeia />Comunidade</NavLink>
          <NavLink to="/biblioteca"><IconeBiblioteca />Biblioteca</NavLink>
          <NavLink to="/proposta"><IconeProposta />Como funciona</NavLink>
        </nav>
        <div className="rodape-lateral">
          {perfil?.admin && <NavLink to="/painel" className="link-lateral"><IconePainel />Painel</NavLink>}
          <NavLink to="/perfil" className="link-lateral"><IconePerfil />{perfil?.nome || 'O meu perfil'}</NavLink>
        </div>
      </aside>

      <main className="conteudo">
        <Outlet />
      </main>

      <nav className="nav" aria-label="Menu principal">
        <NavLink to="/" end><IconeInicio />Início</NavLink>
        <NavLink to="/ciclo"><IconeCiclo />Ciclo</NavLink>
        <NavLink to="/comunidade"><IconeColmeia />Colmeia</NavLink>
        <NavLink to="/biblioteca"><IconeBiblioteca />Biblioteca</NavLink>
      </nav>
    </div>
  )
}
