variable "aws_region" {
  description = "Región por defecto para AWS"
  type        = string
  default     = "us-east-1"
}

variable "gcp_region" {
  description = "Región por defecto para Google Cloud"
  type        = string
  default     = "us-central1"
}

variable "gcp_project_id" {
  description = "ID del proyecto en Google Cloud"
  type        = string
  default     = "e-commerce-498913"
}

variable "sufijo_equipo" {
  description = "Sufijo único para evitar choque de nombres en los buckets"
  type        = string
  default     = "hmpjgb"
}

variable "tipo_instancia_aws" {
  description = "Tipo de máquina en AWS compatible con Free Tier moderno"
  type        = string
  default     = "t3.micro"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}