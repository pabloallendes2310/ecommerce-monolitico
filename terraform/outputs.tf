output "ip_publica_aws_principal" {
  value       = aws_instance.vm_aplicacion.public_ip
  description = "IP del servidor principal en AWS (Nginx Balanceador)"
}

output "ip_publica_gcp_contingencia" {
  value       = google_compute_instance.vm_contingencia_gcp.network_interface[0].access_config[0].nat_ip
  description = "IP del servidor de contingencia en GCP (Failover)"
}

output "orquestador_aws" {
  value       = "k3s sobre EC2"
  description = "Cluster Kubernetes principal usado para la aplicacion."
}

output "bucket_backups_gcp" {
  value       = google_storage_bucket.bucket_gcp_backup.name
  description = "Bucket secundario que recibe los backups diarios de PostgreSQL."
}

output "endpoints_monitoreo_aws" {
  value = {
    frontend   = "http://${aws_instance.vm_aplicacion.public_ip}"
    backend    = "http://${aws_instance.vm_aplicacion.public_ip}/api"
    health     = "http://${aws_instance.vm_aplicacion.public_ip}/api/health"
    metrics    = "http://${aws_instance.vm_aplicacion.public_ip}/api/metrics"
    grafana    = "http://${aws_instance.vm_aplicacion.public_ip}:3001"
    prometheus = "http://${aws_instance.vm_aplicacion.public_ip}:9090"
  }
  description = "Endpoints base para verificar o monitorear el despliegue principal en AWS."
}

output "endpoints_monitoreo_gcp" {
  value = {
    frontend   = "http://${google_compute_instance.vm_contingencia_gcp.network_interface[0].access_config[0].nat_ip}"
    backend    = "http://${google_compute_instance.vm_contingencia_gcp.network_interface[0].access_config[0].nat_ip}:3000"
    health     = "http://${google_compute_instance.vm_contingencia_gcp.network_interface[0].access_config[0].nat_ip}:3000/health"
    metrics    = "http://${google_compute_instance.vm_contingencia_gcp.network_interface[0].access_config[0].nat_ip}:3000/metrics"
    grafana    = "http://${google_compute_instance.vm_contingencia_gcp.network_interface[0].access_config[0].nat_ip}:3001"
    prometheus = "http://${google_compute_instance.vm_contingencia_gcp.network_interface[0].access_config[0].nat_ip}:9090"
  }
  description = "Endpoints base para verificar o monitorear el despliegue de contingencia en GCP."
}
