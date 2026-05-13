import { Link } from 'react-router-dom'

import { useCart } from '../context/useCart'
import { formatCurrency } from '../utils/formatCurrency'
import './ProductCard.css'

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const hasDiscount = Boolean(product.discountPercentage)

  return (
    <article className="product-card">
      <Link className="product-card__image" to={`/producto/${product.id}`}>
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {hasDiscount && <span>{product.discountPercentage}% dcto</span>}
      </Link>

      <div className="product-card__body">
        <p className="product-card__category">{product.category}</p>
        <h3>
          <Link to={`/producto/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="product-card__stock">
          {product.stock > 0 ? `${product.stock} unidades disponibles` : 'Sin stock'}
        </p>
        <strong>{formatCurrency(product.price)}</strong>
      </div>

      <div className="product-card__actions">
        <Link className="button button--ghost" to={`/producto/${product.id}`}>
          Ver detalle
        </Link>
        <button type="button" onClick={() => addToCart(product)} disabled={product.stock === 0}>
          Agregar
        </button>
      </div>
    </article>
  )
}

export default ProductCard
