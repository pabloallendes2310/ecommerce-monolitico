import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import Loading from '../components/Loading'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/useCart'
import { mockProducts } from '../data/mockProducts'
import { getProductById } from '../services/api'
import { formatCurrency } from '../utils/formatCurrency'
import './ProductDetail.css'

function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProductById(id)
      .then(setProduct)
      .finally(() => setLoading(false))
  }, [id])

  const relatedProducts = useMemo(() => {
    if (!product) return []

    return mockProducts
      .filter((item) => item.category === product.category && item.id !== product.id)
      .slice(0, 4)
  }, [product])

  if (loading) {
    return <Loading label="Cargando detalle" />
  }

  if (!product) {
    return (
      <main className="section app-container empty-state">
        <h1>Producto no encontrado</h1>
        <Link className="button" to="/catalogo">
          Volver al catalogo
        </Link>
      </main>
    )
  }

  return (
    <main className="product-detail section app-container">
      <Link className="product-detail__back" to="/catalogo">
        Volver al catalogo
      </Link>

      <section className="product-detail__grid">
        <div className="product-detail__image">
          <img src={product.imageUrl} alt={product.name} />
        </div>

        <div className="product-detail__info">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <strong className="product-detail__price">{formatCurrency(product.price)}</strong>
          <div className="product-detail__availability">
            <span className={product.stock > 0 ? 'is-available' : 'is-empty'}></span>
            {product.stock > 0
              ? `Disponible: ${product.stock} unidades`
              : 'Producto sin stock'}
          </div>
          {product.discountPercentage && (
            <p className="product-detail__discount">
              Oferta activa: {product.discountPercentage}% de descuento.
            </p>
          )}
          <button type="button" onClick={() => addToCart(product)} disabled={product.stock === 0}>
            Agregar al carrito
          </button>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="section">
          <div className="section-heading">
            <span className="eyebrow">Tambien te puede servir</span>
            <h2>Productos relacionados</h2>
          </div>
          <div className="product-grid">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export default ProductDetail
