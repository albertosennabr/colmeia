import { NavLink } from 'react-router-dom'
import { IconeBiblioteca, IconeCiclo, IconeColmeia, IconeInicio } from './Icones'

export function Nav() {
  return (
    <nav className="nav" aria-label="Menu principal">
      <NavLink to="/" end><IconeInicio />Início</NavLink>
      <NavLink to="/ciclo"><IconeCiclo />Ciclo</NavLink>
      <NavLink to="/comunidade"><IconeColmeia />Colmeia</NavLink>
      <NavLink to="/biblioteca"><IconeBiblioteca />Biblioteca</NavLink>
    </nav>
  )
}
