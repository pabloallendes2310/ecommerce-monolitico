import { Link } from 'react-router-dom'

import { useCart } from '../context/useCart'
import { formatCurrency } from '../utils/formatCurrency'
import './OrderSuccess.css'

function OrderSuccess() {
  const { lastOrder } = useCart()
  const orderNumber = lastOrder?.id || 'RP-DEMO-001'

  return (
    <main className="order-success section app-container">
      <div className="order-success__card">
        <span className="order-success__check">OK</span>
        <p className="eyebrow">Orden confirmada</p>
        <h1>Gracias por tu compra</h1>
        <p>
          Tu pedido fue creado correctamente. Numero de orden:{' '}
          <strong>{orderNumber}</strong>
        </p>
        {lastOrder && (
          <div className="order-success__summary">
            <span>Total pagado</span>
            <strong>{formatCurrency(lastOrder.total)}</strong>
          </div>
        )}
        <div className="order-success__actions">
          <Link className="button" to="/">
            Volver al inicio
          </Link>
          <Link className="button button--ghost" to="/catalogo">
            Volver al catalogo
          </Link>
        </div>
      </div>
    </main>
  )
}

export default OrderSuccess
