# E-Commerce Monolítico Multi-Cloud

Proyecto académico desarrollado para la asignatura **Infraestructura en Servicios Cloud**.

La aplicación implementa una plataforma de comercio electrónico monolítica desplegada mediante una arquitectura Multi-Cloud, utilizando:

- AWS como infraestructura principal.
- Google Cloud Platform (GCP) como infraestructura de contingencia.
- Docker y Docker Compose para la contenerización.
- Terraform para el aprovisionamiento de infraestructura.
- Prometheus y Grafana para monitoreo.

## Funcionalidades

- Catálogo de productos
- Carrito de compras
- Simulación de proceso de compra
- Gestión de usuarios y órdenes
- Monitoreo de la aplicación y contenedores

> **Nota:** El sistema tiene fines académicos. No procesa pagos reales ni almacena información bancaria sensible.

---

## Stack tecnológico

### Infraestructura
- AWS
- Google Cloud Platform (GCP)
- Terraform
- Docker
- Docker Compose

### Frontend
- React 19
- Vite 8
- Nginx

### Backend
- Node.js
- Express 5
- TypeScript
- Prisma ORM
- JWT

### Base de datos
- PostgreSQL 15

### Monitoreo
- Prometheus
- Grafana
- cAdvisor
- PostgreSQL Exporter

---

## Requisitos

- Git
- Docker Desktop (con Docker Compose v2)
- Terraform >= 1.5
- Cuenta de AWS
- Cuenta de Google Cloud

---

## Estructura principal

- `frontend/`: aplicación React y configuración de Nginx
- `backend/`: API Express, Prisma y lógica de negocio
- `terraform/`: infraestructura en AWS y GCP
- `monitoreo-local/`: configuración de Prometheus y Grafana
- `docker-compose.yml`: entorno de desarrollo
- `docker-compose.prod.yml`: entorno de producción local

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto.

Valores por defecto:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=monolito
POSTGRES_DB=ecommerce_db
POSTGRES_PORT=5432

BACKEND_PORT=3000
FRONTEND_PORT=8080

JWT_SECRET=tu-secreto-cambiar

VITE_API_URL=http://localhost:3000

GRAFANA_ADMIN_PASSWORD=admin
```

---

## Levantar la aplicación

### Desarrollo

```bash
docker compose up --build
```

En segundo plano:

```bash
docker compose up -d
```

Detener:

```bash
docker compose down
```

### Producción

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Detener:

```bash
docker compose -f docker-compose.prod.yml down
```

---

## Servicios y puertos

| Servicio | Puerto |
|----------|---------|
| Frontend | 8080 |
| Backend | 3000 |
| PostgreSQL | 5432 |
| Grafana | 3001 |
| Prometheus | 9090 |
| cAdvisor | 8081 |
| PostgreSQL Exporter | 9187 |

---

## Accesos

### Frontend

```text
http://localhost:8080
```

### Backend

```text
http://localhost:3000
```

### Grafana

```text
http://localhost:3001
```

Credenciales iniciales:

```text
Usuario: admin
Contraseña: admin
```

En el primer inicio de sesión se solicitará el cambio de contraseña.

### Prometheus

```text
http://localhost:9090
```

### cAdvisor

```text
http://localhost:8081
```

---

## Verificación

Verificar contenedores:

```bash
docker ps
```

Ver logs:

```bash
docker compose logs
```

Ver logs de un servicio:

```bash
docker compose logs backend
docker compose logs frontend
docker compose logs db
```

Ingresar a PostgreSQL:

```bash
docker exec -it ecommerce-db psql -U postgres -d ecommerce_db
```

Listar tablas:

```sql
\dt
```

Ingresar al backend:

```bash
docker exec -it ecommerce-backend sh
```

Verificar estado de Prisma:

```bash
npx prisma migrate status
```

---

## Despliegue de infraestructura

Inicializar Terraform:

```bash
terraform init
```

Planificar cambios:

```bash
terraform plan
```

Aplicar infraestructura:

```bash
terraform apply
```

Ver outputs:

```bash
terraform output
```

Destruir infraestructura:

```bash
terraform destroy
```

---

## Integrantes

- Pablo Allendes
- Benjamin Muñoz
- Javier Rojas
- Gabriel Hidalgo
- Matias Soto
- Hans Osses