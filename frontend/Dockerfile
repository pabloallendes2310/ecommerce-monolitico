# syntax=docker/dockerfile:1

## =========================================================
## Stage 1: base
## ---------------------------------------------------------
## Este stage instala dependencias una sola vez para reutilizar
## la misma capa en desarrollo y en build de produccion.
## =========================================================
FROM node:20-alpine AS base

WORKDIR /app

## Copiamos primero solo lo necesario para aprovechar cache.
## package-lock.json hace posible npm ci, que es reproducible.
COPY package*.json ./

## Instalamos dependencias exactas del lockfile.
RUN npm ci


## =========================================================
## Stage 2: build
## ---------------------------------------------------------
## Este stage usa Node solo para compilar la app de Vite.
## La salida final de Vite es un sitio estatico en dist/.
## =========================================================
FROM base AS build

## Vite lee las variables VITE_* en build time.
## Pasamos la URL del backend como argumento para que el bundle
## quede preparado sin depender de variables en runtime.
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=${VITE_API_URL}

## Ahora si copiamos el codigo fuente del frontend.
COPY . .

## Generamos la app optimizada para produccion.
RUN npm run build


## =========================================================
## Stage 3: runtime
## ---------------------------------------------------------
## nginx solo sirve archivos estaticos. No arrastramos Node
## ni dependencias de desarrollo al contenedor final.
## =========================================================
FROM nginx:1.27-alpine AS production

## Reemplazamos la configuracion por defecto para que:
## 1. sirva los archivos de dist/
## 2. haga fallback a /index.html en rutas del SPA
## 3. escuche en el puerto 80, que es el estandar de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

## Copiamos unicamente el artefacto final del build.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

## nginx se inicia en primer plano dentro del contenedor.
CMD ["nginx", "-g", "daemon off;"]