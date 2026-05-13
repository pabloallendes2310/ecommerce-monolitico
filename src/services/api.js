import { mockProducts } from '../data/mockProducts'

const API_URL = import.meta.env.VITE_API_URL

async function request(path, options = {}) {
  if (!API_URL) {
    throw new Error('VITE_API_URL no configurada')
  }

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Error API ${response.status}`)
  }

  return response.json()
}

export async function getProducts() {
  try {
    return await request('/products')
  } catch (error) {
    console.warn('Usando productos mock:', error.message)
    return mockProducts
  }
}

export async function getProductById(id) {
  try {
    return await request(`/products/${id}`)
  } catch (error) {
    console.warn('Usando detalle mock:', error.message)
    return mockProducts.find((product) => product.id === id) || null
  }
}

export async function createOrder(order) {
  try {
    return await request('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    })
  } catch (error) {
    console.warn('Simulando orden local:', error.message)
    return {
      id: `RP-${Date.now().toString().slice(-6)}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      ...order,
    }
  }
}

export async function getHealth() {
  try {
    return await request('/health')
  } catch (error) {
    console.warn('Usando health local:', error.message)
    return {
      status: 'ok',
      service: 'frontend',
      app: 'RetailPyme Store',
      version: '1.0.0',
    }
  }
}
