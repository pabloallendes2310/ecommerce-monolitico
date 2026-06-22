# Guia completa de despliegue multicloud

Esta guia permite desplegar el e-commerce desde un computador nuevo. Terraform
crea la infraestructura principal en AWS, la infraestructura de contingencia y
backups en Google Cloud, y luego instala automaticamente la aplicacion en ambos
proveedores.

## 1. Arquitectura desplegada

Terraform crea los siguientes componentes:

- AWS como nube principal:
  - VPC, Internet Gateway, tabla de rutas y dos subredes publicas.
  - Grupo de seguridad para SSH, frontend, Grafana y Prometheus.
  - EC2 principal `vm-aplicacion-k3s-ecommerce` con Kubernetes K3s.
  - EC2 auxiliar `vm-backup-ecommerce`.
  - Bucket S3 publico para las imagenes de productos.
  - Bucket S3 privado para respaldos.
- Google Cloud como nube secundaria:
  - VM de contingencia con Docker Compose.
  - Bucket versionado para backups de PostgreSQL.
  - Cuenta de servicio usada por el CronJob de backup.
  - Regla de firewall para frontend, backend y monitoreo.
- Kubernetes en la EC2 principal:
  - Frontend, backend, PostgreSQL, Prometheus, Grafana, cAdvisor y
    PostgreSQL Exporter.
  - ConfigMaps, Secrets, Services, Deployments, StatefulSet, PVC, Job de
    migraciones y CronJob de backup.

## 2. Consideraciones antes de comenzar

- El despliegue puede generar cobros en AWS y Google Cloud.
- Una instancia elegible para Free Tier no garantiza costo cero: depende del
  tipo de cuenta, horas consumidas, discos, trafico y otros recursos.
- La cuenta usada en este proyecto rechazo `t3.medium`. Por ello AWS se configura
  con `t3.micro`.
- `t3.micro` tiene aproximadamente 1 GiB de RAM y queda muy ajustada para todo el
  stack. La swap ayuda durante instalaciones y builds, pero Kubernetes no la
  considera memoria disponible para programar pods.
- Antes de aplicar Terraform, los cambios deben estar subidos al repositorio de
  GitHub, porque las VMs clonan el repositorio durante su primer arranque.
- No subir a Git `terraform.tfvars`, `gcp-key.json`, `.env` ni archivos
  `terraform.tfstate`. Contienen secretos.

## 3. Instalar herramientas en Windows

Abrir PowerShell como usuario normal. Se recomienda usar `winget`.

### 3.1 Git

```powershell
winget install --id Git.Git -e
git --version
```

### 3.2 Terraform

```powershell
winget install --id Hashicorp.Terraform -e
terraform version
```

Si PowerShell no encuentra el comando despues de instalarlo, cerrar y abrir una
nueva terminal.

### 3.3 AWS CLI

```powershell
winget install --id Amazon.AWSCLI -e
aws --version
```

### 3.4 Google Cloud CLI

```powershell
winget install --id Google.CloudSDK -e
gcloud version
```

Si el identificador no esta disponible en la version local de `winget`, instalar
Google Cloud CLI mediante el instalador oficial y abrir una terminal nueva.

### 3.5 Docker Desktop para pruebas locales

```powershell
winget install --id Docker.DockerDesktop -e
docker version
docker compose version
```

Docker Desktop no es obligatorio para ejecutar Terraform, pero permite validar
la aplicacion localmente antes del despliegue.

## 4. Obtener el proyecto

```powershell
git clone https://github.com/pabloallendes2310/ecommerce-monolitico.git
cd ecommerce-monolitico
```

Si se realizaron cambios locales, primero confirmarlos y subirlos a GitHub. La
EC2 y la VM de GCP descargan la rama publicada, no los archivos sin commit del PC.

## 5. Configurar AWS

### 5.1 Credenciales permanentes

Para una cuenta IAM con Access Key:

```powershell
aws configure
```

Ingresar:

```text
AWS Access Key ID: valor-entregado-por-aws
AWS Secret Access Key: valor-entregado-por-aws
Default region name: us-east-1
Default output format: json
```

### 5.2 Credenciales temporales de AWS Academy

AWS Academy entrega tres valores y todos son necesarios:

```powershell
aws configure set aws_access_key_id "ACCESS_KEY"
aws configure set aws_secret_access_key "SECRET_KEY"
aws configure set aws_session_token "SESSION_TOKEN"
aws configure set region "us-east-1"
```

Estas credenciales expiran. Cuando termine la sesion del laboratorio se deben
obtener valores nuevos y repetir los comandos.

No escribir estas credenciales dentro de archivos `.tf` o `terraform.tfvars`.

### 5.3 Verificar AWS

```powershell
aws sts get-caller-identity
aws ec2 describe-instance-types --filters Name=free-tier-eligible,Values=true --query "InstanceTypes[].InstanceType"
```

El primer comando debe mostrar el ID de cuenta y la identidad autenticada. El
segundo permite consultar los tipos de instancia que AWS acepta como Free Tier
para esa cuenta.

### 5.4 Key Pair opcional para SSH

`aws_key_name` no es obligatorio para crear la EC2, pero es recomendable para
diagnosticar el bootstrap.

1. Abrir AWS Console.
2. Ir a EC2, `Key Pairs`, `Create key pair`.
3. Crear la llave en `us-east-1` y guardar el archivo `.pem`.
4. Escribir el nombre exacto, no la ruta del `.pem`, en `terraform.tfvars`.

Si no se usara SSH, dejar:

```hcl
aws_key_name = null
```

## 6. Configurar Google Cloud

Terraform necesita una credencial inicial con permisos para crear Compute
Engine, buckets, cuentas de servicio, llaves y permisos IAM. Esta identidad es
distinta de la cuenta `ecommerce-backup` que Terraform crea posteriormente para
el CronJob.

### 6.1 Seleccionar el proyecto y habilitar facturacion

```powershell
gcloud auth login
gcloud projects list
gcloud config set project ID_DEL_PROYECTO
gcloud auth list
```

El proyecto debe tener facturacion habilitada, incluso si se pretende trabajar
dentro de cuotas gratuitas.

### 6.2 Habilitar APIs requeridas

```powershell
gcloud services enable compute.googleapis.com storage.googleapis.com iam.googleapis.com iamcredentials.googleapis.com serviceusage.googleapis.com cloudresourcemanager.googleapis.com
```

`cloudresourcemanager.googleapis.com` es importante para evitar el error 403 al
asignar permisos IAM al bucket de backups.

La identidad que ejecuta estos comandos debe tener permisos para habilitar
servicios. En laboratorios educativos puede ser necesario habilitar las APIs
desde la consola o solicitar permisos al administrador.

### 6.3 Crear una cuenta de servicio para Terraform

Definir los datos del proyecto:

```powershell
$PROJECT_ID = "ID_DEL_PROYECTO"
$TF_SA = "terraform-deployer@$PROJECT_ID.iam.gserviceaccount.com"
gcloud iam service-accounts create terraform-deployer --display-name="Terraform deployer"
```

Para una demo academica controlada, se puede asignar `roles/owner` temporalmente:

```powershell
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$TF_SA" --role="roles/owner"
```

Esta opcion es sencilla pero demasiado amplia para produccion. En un entorno real
se deben aplicar roles minimos para Compute, Storage, Service Accounts, Service
Account Keys, Service Usage e IAM.

Crear la llave que utiliza el provider de Terraform:

```powershell
gcloud iam service-accounts keys create .\terraform\gcp-key.json --iam-account=$TF_SA
```

Comprobar que existe localmente:

```powershell
Test-Path .\terraform\gcp-key.json
```

Debe devolver `True`. No compartir ni versionar esta llave. Al terminar la demo,
conviene revocarla y eliminarla desde IAM.

## 7. Configurar variables de Terraform

Entrar a la carpeta de infraestructura y crear el archivo local:

```powershell
cd terraform
Copy-Item terraform.tfvars.example terraform.tfvars
```

Editar `terraform.tfvars`:

```hcl
db_password               = "PASSWORD_POSTGRES_SEGURO"
jwt_secret                = "SECRETO_JWT_LARGO_Y_ALEATORIO"
grafana_admin_password    = "PASSWORD_GRAFANA_SEGURO"
aws_key_name              = null
tipo_instancia_aws        = "t3.micro"
tipo_instancia_backup_aws = "t3.micro"

gcp_project_id = "ID_DEL_PROYECTO_GCP"
sufijo_equipo  = "SUFIJO_GLOBAL_UNICO"
```

Notas:

- `sufijo_equipo` debe ser unico globalmente porque los nombres de buckets S3 y
  Cloud Storage no pueden repetirse.
- Si se creo una Key Pair AWS, reemplazar `null` por su nombre exacto.
- No usar `t3.medium` si la cuenta AWS solo permite instancias Free Tier.
- El archivo `gcp-key.json` debe estar dentro de `terraform/`, porque
  `providers.tf` lo carga mediante `file("gcp-key.json")`.

## 8. Gestionar correctamente el state

Terraform usa `terraform.tfstate` para saber que recursos ya existen. El state de
este proyecto es local; por ello no se comparte automaticamente entre PCs.

### Despliegue completamente nuevo

Si no existe infraestructura previa, comenzar sin copiar ningun state antiguo.

### Continuar un despliegue existente desde otro PC

Copiar de forma segura el `terraform.tfstate` correcto al directorio `terraform/`
del nuevo PC. Antes, respaldar cualquier state presente:

```powershell
Rename-Item terraform.tfstate terraform.tfstate.backup-manual
Copy-Item "RUTA_SEGURA\terraform.tfstate" .\terraform.tfstate
terraform state list
```

La lista debe mostrar recursos existentes, por ejemplo:

```text
aws_instance.vm_backup
aws_vpc.vpc_ecommerce
aws_s3_bucket.bucket_aws_assets
google_compute_instance.vm_contingencia_gcp
```

Si `terraform plan` muestra `29 to add` pero los recursos ya existen en las
nubes, detenerse: Terraform esta usando un state vacio o incorrecto. No ejecutar
`apply` hasta recuperar el state correcto o importar los recursos.

El state contiene secretos, incluida una llave de servicio GCP. No enviarlo por
Git, correo publico o chat. Para trabajo colaborativo real se recomienda migrar
a un backend remoto cifrado y con bloqueo.

## 9. Validar y desplegar

Ejecutar desde `ecommerce-monolitico/terraform`:

```powershell
terraform init
terraform fmt -check
terraform validate
terraform plan -out=tfplan
```

Revisar cuidadosamente el resumen. En un despliegue nuevo se agregaran todos los
recursos. En uno existente solo deben aparecer los cambios esperados.

Aplicar el plan revisado:

```powershell
terraform apply tfplan
```

No cerrar la terminal durante el apply. Terraform termina cuando los recursos de
AWS y GCP se crean; los scripts internos de las VMs pueden continuar trabajando
varios minutos despues.

Consultar resultados:

```powershell
terraform output
terraform output endpoints_monitoreo_aws
terraform output endpoints_monitoreo_gcp
```

## 10. Que ocurre automaticamente

### AWS

La EC2 principal recibe `scripts/bootstrap-k3s.sh.tftpl` como `user_data`. Este
script:

1. Instala Docker y K3s.
2. Clona el repositorio desde GitHub.
3. Construye frontend y backend.
4. Importa las imagenes al containerd de K3s.
5. Crea ConfigMaps y Secrets.
6. Despliega PostgreSQL y espera su disponibilidad.
7. Ejecuta migraciones Prisma.
8. Despliega frontend, backend y monitoreo.
9. Ejecuta el seed inicial de cinco productos.
10. Configura el backup diario hacia Google Cloud Storage.

### GCP

La VM de contingencia instala Docker, clona el repositorio, genera `.env`, levanta
`docker-compose.prod.yml` con el profile de monitoreo y ejecuta el seed.

## 11. Swap en la EC2 t3.micro

La swap fue necesaria para reducir fallos por falta de memoria durante builds e
instalaciones. El script actual no la crea automaticamente. Si se necesita
configurar manualmente una swap de 2 GiB, conectarse por SSH y ejecutar:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
swapon --show
```

No ejecutar el bloque una segunda vez si `/swapfile` ya existe. La swap ayuda al
host, pero no aumenta `Allocatable Memory` de Kubernetes. Los pods pueden seguir
en `Pending` si la suma de `resources.requests.memory` supera la RAM disponible.

## 12. Verificar AWS y Kubernetes

Esperar a que la instancia muestre `2/2 status checks passed` en EC2. El primer
arranque puede tardar entre 10 y 20 minutos debido a descargas y builds.

Con una Key Pair configurada:

```bash
ssh -i RUTA/llave.pem ubuntu@IP_PUBLICA_AWS
```

Dentro de la EC2:

```bash
sudo cloud-init status --wait
sudo tail -n 100 /var/log/cloud-init-output.log
sudo tail -n 100 /var/log/ecommerce-bootstrap.log
kubectl get nodes
kubectl -n ecommerce get pods,services,pvc,cronjobs
kubectl -n ecommerce get events --sort-by=.lastTimestamp
```

Que `sudo docker ps` este vacio es normal despues del despliegue: Kubernetes K3s
ejecuta los pods con containerd. Para ver los contenedores:

```bash
sudo k3s crictl ps
```

Estados esperados:

- Frontend, backend, PostgreSQL, Prometheus, Grafana, cAdvisor y exporter:
  `Running`.
- `database-migrations`: `Completed`.
- PVC de PostgreSQL, Prometheus y Grafana: `Bound`.

## 13. Diagnosticar pods Pending

Un pod `Pending` normalmente aun no tiene logs porque nunca fue asignado al nodo.
Revisar primero su descripcion y los eventos:

```bash
kubectl -n ecommerce describe pod NOMBRE_DEL_POD
kubectl -n ecommerce get events --sort-by=.lastTimestamp
kubectl describe node
kubectl -n ecommerce get pvc
```

Mensajes frecuentes:

- `Insufficient memory`: no alcanza la RAM fisica considerada por Kubernetes.
- `pod has unbound immediate PersistentVolumeClaims`: el PVC no fue enlazado.
- `FailedScheduling`: el scheduler no encontro capacidad para el pod.

Para liberar memoria durante una demo en `t3.micro`:

```bash
kubectl -n ecommerce scale deployment backend --replicas=1
kubectl -n ecommerce scale deployment frontend --replicas=1
kubectl -n ecommerce get pods -w
```

Cuando un contenedor si alcanzo a iniciar:

```bash
kubectl -n ecommerce logs NOMBRE_DEL_POD --all-containers
kubectl -n ecommerce logs NOMBRE_DEL_POD --all-containers --previous
```

Grafana usa Prometheus como datasource y PostgreSQL Exporter consulta PostgreSQL,
pero esas dependencias funcionales no provocan `Pending`. `Pending` ocurre antes
de arrancar el contenedor y suele deberse a recursos o almacenamiento.

## 14. Comprobar la demostracion

Obtener las URLs desde el PC:

```powershell
terraform output endpoints_monitoreo_aws
terraform output endpoints_monitoreo_gcp
```

Comprobar en AWS:

1. Abrir el frontend.
2. Confirmar que aparecen los cinco productos y sus imagenes S3.
3. Consultar `/api/health`.
4. Consultar `/api/metrics`.
5. Abrir Prometheus en el puerto `9090` y revisar `Status > Targets`.
6. Abrir Grafana en el puerto `3001` con usuario `admin` y la clave definida en
   `grafana_admin_password`.

Comprobar recursos Kubernetes:

```bash
kubectl -n ecommerce get all
kubectl -n ecommerce get pvc,secrets,configmaps
kubectl -n ecommerce get cronjob postgres-backup-gcp
```

Ejecutar un backup manual:

```bash
kubectl -n ecommerce create job --from=cronjob/postgres-backup-gcp backup-manual
kubectl -n ecommerce logs job/backup-manual -c upload-gcp --follow
```

Despues verificar en Google Cloud Storage que exista un archivo en:

```text
gs://NOMBRE_BUCKET/postgres/ecommerce-YYYYMMDD-HHMMSS.sql.gz
```

## 15. Errores frecuentes

### Terraform no encuentra credenciales AWS

```text
No valid credential sources found
```

Volver a configurar `aws_access_key_id`, `aws_secret_access_key` y, para AWS
Academy, `aws_session_token`. Confirmar con `aws sts get-caller-identity`.

### Tipo de instancia no elegible

```text
InvalidParameterCombination: instance type is not eligible for Free Tier
```

Usar un tipo devuelto por `describe-instance-types`. En este proyecto se utiliza
`t3.micro` porque `t3.medium` fue rechazado por la cuenta.

### Error 403 de APIs GCP

Habilitar la API indicada por el error y confirmar especialmente:

```powershell
gcloud services enable serviceusage.googleapis.com cloudresourcemanager.googleapis.com
```

La EC2 principal depende actualmente del permiso IAM del bucket GCP. Si esa
operacion falla, Terraform no intentara crear `aws_instance.vm_aplicacion` en ese
apply, aunque la VM auxiliar AWS pueda haberse creado.

### Terraform quiere crear todo nuevamente

Ejecutar:

```powershell
terraform state list
```

Si la lista esta vacia pero la infraestructura existe, recuperar el state correcto
antes de aplicar.

### La EC2 parece colgada

Esperar los dos checks de AWS y revisar:

```bash
sudo cloud-init status
sudo tail -f /var/log/cloud-init-output.log
sudo tail -f /var/log/ecommerce-bootstrap.log
```

## 16. Prueba local opcional

Desde la raiz del repositorio:

```powershell
Copy-Item .env.example .env
docker compose --profile monitoring up --build -d
docker compose ps
```

Servicios locales:

| Servicio | URL |
| --- | --- |
| Frontend | `http://localhost:8080` |
| Backend | `http://localhost:3000` |
| Grafana | `http://localhost:3001` |
| Prometheus | `http://localhost:9090` |
| cAdvisor | `http://localhost:8081` |

Detener el entorno:

```powershell
docker compose --profile monitoring down
```

## 17. Destruir la infraestructura

Antes de destruir, conservar cualquier backup necesario. Desde `terraform/`:

```powershell
terraform plan -destroy
terraform destroy
```

Confirmar en ambas consolas que no quedaron EC2, discos, IPs, VMs o buckets no
deseados. Los buckets tienen `force_destroy = true`, por lo que Terraform puede
eliminar tambien sus objetos.

Finalmente, revocar la llave del service account de Terraform si ya no se usara y
eliminar de forma segura las credenciales locales.

## 18. Referencias oficiales

- Terraform: https://developer.hashicorp.com/terraform/install
- AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
- Configuracion AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html
- Google Cloud CLI: https://cloud.google.com/sdk/docs/install
- Llaves de cuentas de servicio GCP:
  https://cloud.google.com/iam/docs/keys-create-delete
