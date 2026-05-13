# RetailPyme Store

Frontend de e-commerce regional para una PyME de retail que migra desde un monolito on-premise hacia una arquitectura cloud/multicloud. La aplicacion esta construida con React + Vite y queda preparada para integrarse con un backend REST mediante variables de entorno.

No incluye Dockerfile, docker-compose, Kubernetes ni backend. Eso queda para etapas posteriores del laboratorio.

## Tecnologias

- React
- Vite
- JavaScript
- React Router DOM
- CSS puro

## Instalacion

```bash
npm install
```

## Ejecucion local

```bash
npm run dev
```

## Build de produccion

```bash
npm run build
```

## Variables de entorno

Crea un archivo `.env` tomando como referencia `.env.example`:

```bash
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=RetailPyme Store
```

Si `VITE_API_URL` no existe o el backend falla, el frontend usa `mockProducts` como fallback para permitir una demo local.

## Rutas

- `/`: pagina de inicio.
- `/catalogo`: catalogo con busqueda, filtros y ordenamiento.
- `/producto/:id`: detalle de producto.
- `/carrito`: carrito de compras.
- `/checkout`: checkout simulado.
- `/orden-confirmada`: confirmacion de orden.
- `/health`: estado simple del frontend.

## Endpoints esperados del backend

- `GET /products`
- `GET /products/:id`
- `POST /orders`
- `GET /health`

## Preparacion cloud

El frontend no contiene URLs hardcodeadas en componentes. La comunicacion con servicios externos se centraliza en `src/services/api.js` usando `VITE_API_URL`. Esto facilita dockerizacion futura, despliegue en Kubernetes y configuracion mediante ConfigMaps/Secrets o variables de entorno del entorno cloud.
