import { Link } from 'react-router-dom'

import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner app-container">
        <div className="footer__brand">
          <strong>RetailPyme Store</strong>
          <p>
            Tienda regional con productos para el hogar, tecnologia, vestuario y
            deporte, pensada para comprar facil desde cualquier ciudad.
          </p>
        </div>

        <div>
          <h3>Tienda</h3>
          <Link to="/">Inicio</Link>
          <Link to="/catalogo">Catalogo</Link>
          <Link to="/carrito">Carrito</Link>
        </div>

        <div>
          <h3>Ayuda</h3>
          <a href="mailto:soporte@retailpyme.local">Soporte</a>
          <span>Despachos regionales</span>
          <span>Retiro en tienda</span>
        </div>

        <div>
          <h3>RetailPyme</h3>
          <span>Compra segura</span>
          <span>Ofertas de temporada</span>
          <span>Atencion a clientes</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
