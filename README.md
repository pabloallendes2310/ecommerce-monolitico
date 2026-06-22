# E-Commerce Monolítico Multi-Cloud

Proyecto académico desarrollado para la asignatura **Infraestructura en Servicios Cloud**.

- Frontend: React + Vite, servido por nginx en Docker
- Backend: Node.js + Express + Prisma
- Base de datos: PostgreSQL
- Desarrollo local: Docker Compose
- Nube principal: Kubernetes k3s en AWS
- Contingencia y backups: Google Cloud

## Requisitos

- Git
- Docker Desktop (con Docker Compose v2)
- Terraform >= 1.5
- Cuenta de AWS
- Cuenta de Google Cloud

---

## Estructura principal

- `frontend/`: app React y Dockerfile de frontend
- `backend/`: API Express, Prisma y Dockerfile de backend
- `docker-compose.yml`: stack completo para desarrollo local
- `docker-compose.prod.yml`: stack completo para produccion local
- `kubernetes/`: Deployments, Services, almacenamiento, monitoreo y backups
- `terraform/`: infraestructura multicloud y bootstrap automatico de k3s
- `.env.example`: variables de entorno base para compose

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