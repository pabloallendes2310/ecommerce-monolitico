output "ip_publica_aws_principal" {
  value       = aws_instance.vm_aplicacion.public_ip
  description = "IP del servidor principal en AWS (Nginx Balanceador)"
}

output "ip_publica_gcp_contingencia" {
  value       = google_compute_instance.vm_contingencia_gcp.network_interface[0].access_config[0].nat_ip
  description = "IP del servidor de contingencia en GCP (Failover)"
}

output "endpoints_monitoreo_aws" {
  value = {
    frontend   = "http://${aws_instance.vm_aplicacion.public_ip}"
    backend    = "http://${aws_instance.vm_aplicacion.public_ip}:3000"
    health     = "http://${aws_instance.vm_aplicacion.public_ip}:3000/health"
    metrics    = "http://${aws_instance.vm_aplicacion.public_ip}:3000/metrics"
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
