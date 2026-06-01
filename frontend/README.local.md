# RetailPyme Store

Frontend de e-commerce regional para una PyME de retail que migra desde un monolito on-premise hacia una arquitectura cloud/multicloud. La aplicacion esta construida con React + Vite y queda preparada para integrarse con un backend REST mediante variables de entorno.

Ya incluye Dockerfile y configuracion de nginx para servir la SPA en produccion. No incluye docker-compose, Kubernetes ni backend; eso queda para etapas posteriores.

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

## Proceso de levantamiento recomendado

La documentación oficial de Vite y Docker apunta a una idea simple: para desarrollo conviene usar Vite directo en tu máquina, y para producción conviene construir una imagen liviana que solo sirva `dist/`.

### 1. Desarrollo local sin Docker

Este es el camino más directo si solo quieres editar y ver cambios al instante.

```bash
npm install
npm run dev
```

Vite arrancará en `http://localhost:5173`.

### 2. Produccion con nginx

La imagen de produccion usa multi-stage build:

- `base`: instala dependencias con `npm ci`.
- `build`: genera `dist/`.
- `production`: sirve `dist/` con nginx.

```bash
docker build --target production -t ecommerce-frontend .
docker run --rm -p 8080:80 ecommerce-frontend
```

Abre `http://localhost:8080`.

### 3. Por que esta configurado asi

- Vite recomienda que el dev server escuche en `0.0.0.0` cuando corre dentro de un contenedor, pero si desarrollas localmente no hace falta ajustar eso.
- Docker recomienda imágenes oficiales, minimalistas y multi-stage builds para producción.

### 4. Variables y archivos que conviene mantener claros

- [Dockerfile](Dockerfile): define el flujo de producción con nginx.
- [vite.config.js](vite.config.js): mantiene la configuración Vite por defecto para desarrollo local.
- [package.json](package.json): mantiene los scripts `dev`, `build`, `preview`.
- `.env`: contiene `VITE_API_URL` para el build de Vite.
- `.dockerignore`: evita que `node_modules`, `dist` y archivos locales entren al contexto de build.

### 5. Regla práctica para no confundirte

- Si quieres ver cambios instantáneos, usa `npm run dev` directamente en tu máquina.
- Si quieres una imagen lista para servir a usuarios, usa el target `production` y nginx.
- Si algo no refresca en local, revisa primero que Vite esté corriendo y luego la consola del navegador o del terminal.

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
