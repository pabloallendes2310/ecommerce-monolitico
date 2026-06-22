# ecommerce-monolitico

Aplicacion e-commerce monolitica con:

- Frontend: React + Vite, servido por nginx en Docker
- Backend: Node.js + Express + Prisma
- Base de datos: PostgreSQL
- Desarrollo local: Docker Compose
- Nube principal: Kubernetes k3s en AWS
- Contingencia y backups: Google Cloud

## Requisitos

- Docker Desktop (con Docker Compose v2)

## Estructura principal

- `frontend/`: app React y Dockerfile de frontend
- `backend/`: API Express, Prisma y Dockerfile de backend
- `docker-compose.yml`: stack completo para desarrollo local
- `docker-compose.prod.yml`: stack completo para produccion local
- `kubernetes/`: Deployments, Services, almacenamiento, monitoreo y backups
- `terraform/`: infraestructura multicloud y bootstrap automatico de k3s
- `.env.example`: variables de entorno base para compose

## Variables de entorno

1. En la raiz, crea `.env` desde `.env.example`.
2. Ajusta valores si necesitas cambiar puertos o credenciales.

Valores por defecto relevantes:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=monolito
POSTGRES_DB=ecommerce_db
POSTGRES_PORT=5432
BACKEND_PORT=3000
FRONTEND_PORT=8080
JWT_SECRET=tu-secreto-cambiar
VITE_API_URL=http://localhost:3000
```

## Levantar la app completa

### Desarrollo local

```bash
docker compose up --build -d
```

### Produccion local

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### Produccion local con monitoreo

```bash
docker compose -f docker-compose.prod.yml --profile monitoring up --build -d
```

La VM de contingencia GCP usa este profile. En AWS, Terraform reemplaza Docker Compose por k3s y aplica los manifiestos de `kubernetes/`.

## Despliegue Kubernetes con Terraform

Antes de aplicar, envia los cambios a GitHub porque la EC2 clona el repositorio durante su arranque.

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

El despliegue crea PostgreSQL persistente, dos replicas de frontend/backend, Prometheus, Grafana y un backup diario hacia Google Cloud Storage. Consulta `terraform/README.md` y `kubernetes/README.md` para operacion y diagnostico.

## URLs por defecto

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- Metricas backend: `http://localhost:3000/metrics`

## Monitoreo local

La carpeta `monitoreo-local/` contiene Prometheus, Grafana, cAdvisor y postgres-exporter.

Levantar solo la aplicacion:

```bash
docker compose up --build -d
```

Levantar la aplicacion con monitoreo:

```bash
docker compose --profile monitoring up --build -d
```

URLs de monitoreo:

- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`
- cAdvisor: `http://localhost:8081`

Mas detalle en `monitoreo-local/README.md`.

## Verificaciones utiles

```bash
docker compose ps
docker compose logs --no-color --tail 80 backend
docker compose logs --no-color --tail 80 frontend
```

Pruebas HTTP rapidas:

- Backend: `GET http://localhost:3000/items`
- Frontend: `GET http://localhost:8080`

## Parar y limpiar

Parar stack:

```bash
docker compose down
```

Parar y eliminar volumenes (incluye datos de DB):

```bash
docker compose down -v
```

## Notas importantes

- El backend aplica migraciones al arrancar en ambos modos Docker.
- El frontend recibe la URL de API por `VITE_API_URL` en build de imagen.
- Si cambias `VITE_API_URL`, reconstruye frontend (`--build`).
