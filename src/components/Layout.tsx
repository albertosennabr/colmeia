import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useColmeia } from '../lib/contexto'
import { IconeBiblioteca, IconeCiclo, IconeColmeia, IconeInicio, IconePainel, IconePerfil, IconeProposta } from './Icones'

const BASE = import.meta.env.BASE_URL

// Símbolo da Colmeia (Júlio Archanjo): o "C" de favo com a abelha-losango.
// Em fundo vinho, o losango vira rosa para não sumir.
export function Simbolo({ tamanho, fundoEscuro = false }: { tamanho: number; fundoEscuro?: boolean }) {
  return <img src={`${BASE}marca/${fundoEscuro ? 'simbolo-fundo-escuro' : 'simbolo'}.png`} alt="" width={tamanho} height={Math.round(tamanho * 1.106)} style={{ display: 'block', flex: 'none' }} />
}

export function Marca({ claro = true, link = true }: { claro?: boolean; link?: boolean }) {
  const conteudo = (
    <>
      <Simbolo tamanho={34} fundoEscuro={claro} />
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className="marca-palavra" style={{ fontSize: 20, lineHeight: 1 }}>Colmeia</span>
        <span className="marca-lema" style={{ fontSize: 11, color: claro ? 'var(--texto-claro)' : 'var(--texto-suave)' }}>autonomia feminina</span>
      </span>
    </>
  )
  const estilo = { display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: claro ? 'var(--creme)' : 'var(--espresso)' }
  return link ? <Link to="/" aria-label="Colmeia, início" style={estilo}>{conteudo}</Link> : <div style={estilo}>{conteudo}</div>
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
