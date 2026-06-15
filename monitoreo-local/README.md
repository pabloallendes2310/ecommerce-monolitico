# Monitoreo local

Stack local de observabilidad para el ecommerce:

- Prometheus: recoleccion de metricas.
- Grafana: dashboards.
- cAdvisor: metricas de contenedores Docker.
- postgres-exporter: metricas de PostgreSQL.
- Backend `/metrics`: metricas propias de Express y Node.js.

## Levantar

El monitoreo esta integrado en el `docker-compose.yml` de la raiz mediante el profile `monitoring`.

Levantar solo la aplicacion:

```bash
docker compose up --build -d
```

Levantar la aplicacion con monitoreo:

```bash
docker compose --profile monitoring up --build -d
```

## URLs

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3000`
- Backend metrics: `http://localhost:3000/metrics`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`
- cAdvisor: `http://localhost:8081`

Credenciales locales de Grafana:

- Usuario: `admin`
- Password: `admin`, o el valor de `GRAFANA_ADMIN_PASSWORD`

Grafana provisiona automaticamente el datasource de Prometheus y el dashboard `Ecommerce overview`.

## Que monitorea

Prometheus recolecta:

- `backend:3000/metrics`: salud de Node.js, memoria, CPU, latencias y cantidad de requests HTTP.
- `cadvisor:8080`: CPU, memoria, red y filesystem por contenedor.
- `postgres-exporter:9187`: metricas internas de PostgreSQL.
- `host.docker.internal:9182`: metricas del host Windows si instalas `windows_exporter`.

## Uso con Terraform, AWS y GCP

Terraform crea las VMs y entrega outputs con endpoints de AWS y GCP. Lo recomendado es:

1. Mantener este stack como monitoreo local/desarrollo.
2. En produccion, levantar un Prometheus/Grafana central en una VM de monitoreo, idealmente privada o restringida por IP.
3. Scrappear ambos ambientes:
   - AWS principal: `http://IP_AWS:3000/metrics`
   - GCP contingencia: `http://IP_GCP:3000/metrics`
4. No exponer Grafana ni Prometheus a internet sin proteccion. Usa security groups/firewall con tu IP, VPN, o un proxy con TLS y autenticacion.
5. Para infraestructura de VM, agrega exporters en cada servidor si necesitas mas detalle: cAdvisor para contenedores, node_exporter para Linux y postgres-exporter para base de datos.

Los outputs `endpoints_monitoreo_aws` y `endpoints_monitoreo_gcp` en Terraform dejan visibles las URLs que Prometheus puede usar como targets.
