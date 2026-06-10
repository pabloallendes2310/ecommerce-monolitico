output "ip_publica_aws_principal" {
  value       = aws_instance.vm_aplicacion.public_ip
  description = "IP del servidor principal en AWS (Nginx Balanceador)"
}

output "ip_publica_gcp_contingencia" {
  value       = google_compute_instance.vm_contingencia_gcp.network_interface[0].access_config[0].nat_ip
  description = "IP del servidor de contingencia en GCP (Failover)"
}