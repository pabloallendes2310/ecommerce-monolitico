# Terraform: despliegue multicloud

## Preparacion

Requisitos:

- Terraform CLI.
- Credenciales AWS configuradas.
- `terraform/gcp-key.json` con permisos para Compute, Storage, IAM y Service Usage.
- Cambios del repositorio enviados a GitHub, porque la EC2 clona el repositorio durante el bootstrap.

Crea las variables locales:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Completa passwords, proyecto GCP, sufijo de buckets y opcionalmente `aws_key_name`.

## Aplicar

```bash
terraform init
terraform fmt -check
terraform validate
terraform plan
terraform apply
```

Terraform crea:

- AWS: red, EC2 principal con k3s, VM auxiliar y bucket S3.
- GCP: APIs requeridas, bucket versionado, cuenta de servicio para backups y VM de contingencia.
- Kubernetes: aplicacion, almacenamiento persistente, monitoreo y backup diario.

El primer arranque tarda porque la EC2 instala paquetes y construye las imagenes. Puedes revisar `/var/log/ecommerce-bootstrap.log` por SSH cuando configures `aws_key_name`.

## Seguridad

- `terraform.tfvars`, `gcp-key.json` y el state no deben versionarse.
- El state contiene material sensible, incluida la key de la cuenta de backup. Usa un backend remoto cifrado para un entorno real.
- Los puertos 3001 y 9090 estan publicos para facilitar la demostracion. Restringelos a la IP del equipo antes de un despliegue real.
- Cambiar el bootstrap reemplaza la EC2 principal por `user_data_replace_on_change = true`.
