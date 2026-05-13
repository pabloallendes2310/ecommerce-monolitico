import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'

import Footer from './components/Footer'
import Navbar from './components/Navbar'
import { CartProvider } from './context/CartContext.jsx'
import Cart from './pages/Cart'
import Catalog from './pages/Catalog'
import Checkout from './pages/Checkout'
import Health from './pages/Health'
import Home from './pages/Home'
import OrderSuccess from './pages/OrderSuccess'
import ProductDetail from './pages/ProductDetail'
import './App.css'

function AppLayout() {
  const location = useLocation()
  const isHealthRoute = location.pathname === '/health'

  return (
    <div className="app-shell">
      {!isHealthRoute && <Navbar />}
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<Catalog />} path="/catalogo" />
        <Route element={<ProductDetail />} path="/producto/:id" />
        <Route element={<Cart />} path="/carrito" />
        <Route element={<Checkout />} path="/checkout" />
        <Route element={<OrderSuccess />} path="/orden-confirmada" />
        <Route element={<Health />} path="/health" />
      </Routes>
      {!isHealthRoute && <Footer />}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppLayout />
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
