# Kubernetes en AWS

La nube principal usa un cluster k3s autogestionado sobre la EC2 creada por Terraform.
Docker Compose se mantiene para desarrollo local y para la VM de contingencia en GCP.

## Recursos

- `Namespace`: aislamiento en `ecommerce`.
- `ConfigMap`: configuracion no sensible de app y PostgreSQL.
- `Secrets`: passwords de PostgreSQL/Grafana, JWT y credencial de backup GCP.
- `StatefulSet` + `PVC`: PostgreSQL con 10 GiB persistentes.
- `Deployments`: dos replicas de frontend y backend.
- `Services`: frontend/Grafana/Prometheus como `LoadBalancer`; backend y datos internos.
- `Job`: migraciones Prisma antes del backend.
- `CronJob`: backup diario de PostgreSQL hacia Google Cloud Storage.
- `DaemonSet`: cAdvisor por nodo.

## Flujo automatizado

Terraform entrega `terraform/scripts/bootstrap-k3s.sh.tftpl` como `user_data` de EC2. El script:

1. Instala Docker y k3s.
2. Clona el repositorio.
3. Construye frontend/backend e importa las imagenes al runtime de k3s.
4. Crea ConfigMaps y Secrets sin guardar passwords en los manifiestos.
5. Levanta PostgreSQL y espera que este listo.
6. Ejecuta las migraciones Prisma.
7. Despliega aplicacion y monitoreo.
8. Ejecuta el seed inicial.

El frontend usa `/api`; nginx envia esas solicitudes al Service interno `backend`.

## Backup

El CronJob `postgres-backup-gcp` corre todos los dias a las 03:00 UTC. Genera un `pg_dump` comprimido y lo sube a:

```text
gs://BUCKET_GCP/postgres/ecommerce-YYYYMMDD-HHMMSS.sql.gz
```

El bucket tiene versionado y elimina objetos de mas de 30 dias mediante lifecycle policy.

Backup manual:

```bash
kubectl -n ecommerce create job --from=cronjob/postgres-backup-gcp backup-manual
kubectl -n ecommerce logs job/backup-manual -c upload-gcp
```

## Diagnostico

En la EC2 principal:

```bash
sudo tail -f /var/log/ecommerce-bootstrap.log
kubectl -n ecommerce get pods,services,pvc,cronjobs
kubectl -n ecommerce get events --sort-by=.lastTimestamp
kubectl -n ecommerce logs deployment/backend
```

No apliques `secret.example.yaml` con valores reales versionados. Terraform crea los Secrets durante el bootstrap.

