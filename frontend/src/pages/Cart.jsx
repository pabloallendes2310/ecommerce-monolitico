import { Link } from 'react-router-dom'

import CartItem from '../components/CartItem'
import { useCart } from '../context/useCart'
import { formatCurrency } from '../utils/formatCurrency'
import './Cart.css'

function Cart() {
  const { clearCart, items, shipping, subtotal, total } = useCart()

  if (items.length === 0) {
    return (
      <main className="section app-container empty-state">
        <h1>Tu carrito esta vacio</h1>
        <p>Agrega productos del catalogo para iniciar una compra simulada.</p>
        <Link className="button" to="/catalogo">
          Ir al catalogo
        </Link>
      </main>
    )
  }

  return (
    <main className="cart-page section app-container">
      <div className="section-heading section-heading--row">
        <div>
          <span className="eyebrow">Carrito de compras</span>
          <h1>Revisa tus productos</h1>
        </div>
        <button className="button button--ghost" type="button" onClick={clearCart}>
          Vaciar carrito
        </button>
      </div>

      <div className="cart-page__grid">
        <section className="cart-page__items">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </section>

        <aside className="summary-card">
          <h2>Resumen</h2>
          <div>
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <div>
            <span>Despacho</span>
            <strong>{shipping === 0 ? 'Gratis' : formatCurrency(shipping)}</strong>
          </div>
          <div className="summary-card__total">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <Link className="button" to="/checkout">
            Continuar al checkout
          </Link>
        </aside>
      </div>
    </main>
  )
}

export default Cart
