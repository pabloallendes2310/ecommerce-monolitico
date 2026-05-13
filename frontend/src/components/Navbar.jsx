import { Link, NavLink } from 'react-router-dom'

import { useCart } from '../context/useCart'
import SearchBar from './SearchBar'
import './Navbar.css'

function Navbar() {
  const { totalItems } = useCart()

  return (
    <header className="navbar">
      <div className="navbar__inner app-container">
        <Link className="navbar__brand" to="/">
          <span className="navbar__brand-mark">RP</span>
          <span>
            RetailPyme
            <small>Store</small>
          </span>
        </Link>

        <div className="navbar__search">
          <SearchBar compact />
        </div>

        <nav className="navbar__links" aria-label="Navegacion principal">
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/catalogo">Catalogo</NavLink>
          <NavLink className="navbar__cart" to="/carrito" aria-label="Ver carrito">
            <span>Carrito</span>
            <strong>{totalItems}</strong>
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
