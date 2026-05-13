import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useCart } from '../context/useCart'
import { createOrder } from '../services/api'
import { formatCurrency } from '../utils/formatCurrency'
import './Checkout.css'

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  region: '',
  commune: '',
  deliveryMethod: 'Despacho a domicilio',
  paymentMethod: 'Tarjeta',
}

function Checkout() {
  const navigate = useNavigate()
  const { clearCart, items, setLastOrder, shipping, subtotal, total } = useCart()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const validate = () => {
    const nextErrors = {}

    Object.entries(form).forEach(([key, value]) => {
      if (!value.trim()) nextErrors[key] = 'Campo obligatorio'
    })

    if (form.email && !form.email.includes('@')) {
      nextErrors.email = 'Ingresa un correo valido'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    const order = await createOrder({
      customer: form,
      items,
      subtotal,
      shipping,
      total,
    })
    setLastOrder(order)
    clearCart()
    navigate('/orden-confirmada')
  }

  if (items.length === 0) {
    return (
      <main className="section app-container empty-state">
        <h1>No hay productos para pagar</h1>
        <Link className="button" to="/catalogo">
          Volver al catalogo
        </Link>
      </main>
    )
  }

  return (
    <main className="checkout-page section app-container">
      <div className="section-heading">
        <span className="eyebrow">Checkout simulado</span>
        <h1>Completa tus datos de compra</h1>
      </div>

      <div className="checkout-page__grid">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <label>
            Nombre completo
            <input name="fullName" value={form.fullName} onChange={handleChange} />
            {errors.fullName && <span>{errors.fullName}</span>}
          </label>
          <label>
            Correo
            <input name="email" type="email" value={form.email} onChange={handleChange} />
            {errors.email && <span>{errors.email}</span>}
          </label>
          <label>
            Telefono
            <input name="phone" value={form.phone} onChange={handleChange} />
            {errors.phone && <span>{errors.phone}</span>}
          </label>
          <label>
            Direccion
            <input name="address" value={form.address} onChange={handleChange} />
            {errors.address && <span>{errors.address}</span>}
          </label>
          <label>
            Region
            <input name="region" value={form.region} onChange={handleChange} />
            {errors.region && <span>{errors.region}</span>}
          </label>
          <label>
            Comuna
            <input name="commune" value={form.commune} onChange={handleChange} />
            {errors.commune && <span>{errors.commune}</span>}
          </label>
          <label>
            Metodo de despacho
            <select name="deliveryMethod" value={form.deliveryMethod} onChange={handleChange}>
              <option>Despacho a domicilio</option>
              <option>Retiro en tienda</option>
            </select>
          </label>
          <label>
            Metodo de pago
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
              <option>Tarjeta</option>
              <option>Transferencia</option>
              <option>Pago contra entrega</option>
            </select>
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creando orden...' : 'Confirmar compra'}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Resumen del pedido</h2>
          {items.map((item) => (
            <div key={item.id}>
              <span>
                {item.name} x {item.quantity}
              </span>
              <strong>{formatCurrency(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div>
            <span>Despacho</span>
            <strong>{shipping === 0 ? 'Gratis' : formatCurrency(shipping)}</strong>
          </div>
          <div className="checkout-summary__total">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default Checkout
