import { Link } from 'react-router-dom'

import { useCart } from '../context/useCart'
import { formatCurrency } from '../utils/formatCurrency'
import './CartItem.css'

function CartItem({ item }) {
  const { decreaseQuantity, increaseQuantity, removeFromCart } = useCart()

  return (
    <article className="cart-item">
      <img src={item.imageUrl} alt={item.name} />

      <div className="cart-item__info">
        <Link to={`/producto/${item.id}`}>{item.name}</Link>
        <span>{item.category}</span>
        <strong>{formatCurrency(item.price)}</strong>
      </div>

      <div className="cart-item__quantity" aria-label="Cantidad">
        <button type="button" onClick={() => decreaseQuantity(item.id)}>
          -
        </button>
        <span>{item.quantity}</span>
        <button type="button" onClick={() => increaseQuantity(item.id)}>
          +
        </button>
      </div>

      <div className="cart-item__total">
        <strong>{formatCurrency(item.price * item.quantity)}</strong>
        <button type="button" onClick={() => removeFromCart(item.id)}>
          Eliminar
        </button>
      </div>
    </article>
  )
}

export default CartItem
