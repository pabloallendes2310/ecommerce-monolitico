import { Link } from 'react-router-dom'

import ProductCard from '../components/ProductCard'
import { categories, mockProducts } from '../data/mockProducts'
import './Home.css'

function Home() {
  const featuredProducts = mockProducts.filter((product) => product.featured).slice(0, 4)

  return (
    <main>
      <section className="home-hero">
        <div className="app-container home-hero__grid">
          <div className="home-hero__content">
            <span className="eyebrow">Retail regional</span>
            <h1>Compra productos para tu hogar con despacho rapido en tu region.</h1>
            <p>
              RetailPyme Store conecta tecnologia, hogar, vestuario y deporte en una
              experiencia simple, rapida y pensada para clientes de todo Chile.
            </p>
            <div className="home-hero__actions">
              <Link className="button" to="/catalogo">
                Ver catalogo
              </Link>
              <Link className="button button--ghost" to="/catalogo?categoria=Hogar">
                Ofertas hogar
              </Link>
            </div>
          </div>

          <div className="home-hero__panel" aria-label="Resumen comercial">
            <strong>Cyber regional</strong>
            <p>Hasta 25% en seleccion hogar, tecnologia y belleza.</p>
            <div>
              <span>+12 productos</span>
              <span>Stock en linea</span>
              <span>Despacho o retiro</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section app-container">
        <div className="section-heading">
          <span className="eyebrow">Categorias destacadas</span>
          <h2>Todo lo que una PyME retail necesita mostrar</h2>
        </div>
        <div className="home-categories">
          {categories.map((category) => (
            <Link key={category} to={`/catalogo?categoria=${category}`}>
              <span>{category.slice(0, 2).toUpperCase()}</span>
              <strong>{category}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="section app-container">
        <div className="section-heading section-heading--row">
          <div>
            <span className="eyebrow">Ofertas y destacados</span>
            <h2>Productos listos para campanas de alta demanda</h2>
          </div>
          <Link className="button button--ghost" to="/catalogo">
            Ver todos
          </Link>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="home-benefits section">
        <div className="app-container home-benefits__grid">
          <article>
            <span>01</span>
            <h3>Despacho rapido</h3>
            <p>Preparado para promesas regionales y retiro en tienda.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Compra segura</h3>
            <p>Checkout simulado listo para integrarse con pasarela de pago.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Soporte regional</h3>
            <p>Mensajes y flujos pensados para clientes locales.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Ofertas especiales</h3>
            <p>Campanas de temporada con productos destacados y descuentos.</p>
          </article>
        </div>
      </section>

      <section className="section app-container">
        <div className="home-campaign-banner">
          <div>
            <span className="eyebrow">Alta demanda</span>
            <h2>Campanas Cyber y Navidad con productos destacados.</h2>
          </div>
          <p>
            Encuentra tecnologia, hogar, belleza, deporte y vestuario en una vitrina
            preparada para promociones masivas y compras rapidas.
          </p>
        </div>
      </section>
    </main>
  )
}

export default Home
