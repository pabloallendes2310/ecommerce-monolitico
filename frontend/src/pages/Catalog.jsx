import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import CategoryFilter from '../components/CategoryFilter'
import Loading from '../components/Loading'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'
import { getProducts } from '../services/api'
import './Catalog.css'

function Catalog() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('buscar') || '')
  const [category, setCategory] = useState(searchParams.get('categoria') || 'Todas')
  const [sort, setSort] = useState('relevance')
  const [onlyOffers, setOnlyOffers] = useState(false)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return products
      .filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(normalizedSearch)
        const matchesCategory = category === 'Todas' || product.category === category
        const matchesOffer = !onlyOffers || product.featured || product.discountPercentage

        return matchesSearch && matchesCategory && matchesOffer
      })
      .sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price
        if (sort === 'price-desc') return b.price - a.price
        return Number(b.featured) - Number(a.featured)
      })
  }, [category, onlyOffers, products, search, sort])

  if (loading) {
    return <Loading />
  }

  return (
    <main className="catalog-page section app-container">
      <div className="catalog-page__heading">
        <div>
          <span className="eyebrow">Catalogo RetailPyme</span>
          <h1>Productos disponibles para venta regional</h1>
        </div>
        <p>{filteredProducts.length} productos encontrados</p>
      </div>

      <div className="catalog-page__toolbar">
        <SearchBar value={search} onChange={setSearch} />
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="relevance">Destacados primero</option>
          <option value="price-asc">Precio menor a mayor</option>
          <option value="price-desc">Precio mayor a menor</option>
        </select>
        <label className="catalog-page__offer">
          <input
            checked={onlyOffers}
            type="checkbox"
            onChange={(event) => setOnlyOffers(event.target.checked)}
          />
          Solo ofertas
        </label>
      </div>

      <CategoryFilter selectedCategory={category} onChange={setCategory} />

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <h2>No encontramos productos</h2>
          <p>Prueba otra busqueda, categoria u ordenamiento.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  )
}

export default Catalog
