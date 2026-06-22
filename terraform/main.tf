# ==========================================
# INFRAESTRUCTURA EN AWS (NUBE PRINCIPAL)
# ==========================================

resource "aws_vpc" "vpc_ecommerce" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags                 = { Name = "vpc-ecommerce-integrador" }
}

resource "aws_internet_gateway" "igw_ecommerce" {
  vpc_id = aws_vpc.vpc_ecommerce.id
  tags   = { Name = "igw-ecommerce" }
}

resource "aws_route_table" "rt_publica" {
  vpc_id = aws_vpc.vpc_ecommerce.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw_ecommerce.id
  }
}

resource "aws_subnet" "subnet_app" {
  vpc_id                  = aws_vpc.vpc_ecommerce.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags                    = { Name = "subnet-aplicacion" }
}

resource "aws_subnet" "subnet_backup" {
  vpc_id                  = aws_vpc.vpc_ecommerce.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true
  tags                    = { Name = "subnet-backup" }
}

resource "aws_route_table_association" "rta_app" {
  subnet_id      = aws_subnet.subnet_app.id
  route_table_id = aws_route_table.rt_publica.id
}

resource "aws_route_table_association" "rta_backup" {
  subnet_id      = aws_subnet.subnet_backup.id
  route_table_id = aws_route_table.rt_publica.id
}

resource "aws_security_group" "sg_ecommerce" {
  name        = "sg_ecommerce_permitir_web"
  description = "Permitir trafico HTTP, Backend API y SSH"
  vpc_id      = aws_vpc.vpc_ecommerce.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Grafana para monitoreo
  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Prometheus para monitoreo
  ingress {
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_instance" "vm_aplicacion" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.tipo_instancia_aws
  key_name               = var.aws_key_name
  subnet_id              = aws_subnet.subnet_app.id
  vpc_security_group_ids = [aws_security_group.sg_ecommerce.id]

  root_block_device {
    volume_size           = 30
    volume_type           = "gp3"
    delete_on_termination = true
  }

  tags = { Name = "vm-aplicacion-k3s-ecommerce" }

  user_data_replace_on_change = true
  user_data = templatefile("${path.module}/scripts/bootstrap-k3s.sh.tftpl", {
    repository_url       = "https://github.com/pabloallendes2310/ecommerce-monolitico.git"
    db_password_b64      = base64encode(var.db_password)
    jwt_secret_b64       = base64encode(var.jwt_secret)
    grafana_password_b64 = base64encode(var.grafana_admin_password)
    gcp_key_b64          = google_service_account_key.backup.private_key
    gcp_backup_bucket    = google_storage_bucket.bucket_gcp_backup.name
  })

  depends_on = [google_storage_bucket_iam_member.backup_writer]
}

resource "aws_instance" "vm_backup" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.tipo_instancia_backup_aws
  key_name               = var.aws_key_name
  subnet_id              = aws_subnet.subnet_backup.id
  vpc_security_group_ids = [aws_security_group.sg_ecommerce.id]
  tags                   = { Name = "vm-backup-ecommerce" }
}

resource "aws_s3_bucket" "bucket_aws_backup" {
  bucket        = "ecommerce-monolitico-aws-${var.sufijo_equipo}"
  force_destroy = true
}

# ============================================
# INFRAESTRUCTURA EN GCP (NUBE DE RESPALDO)
# ============================================

resource "google_project_service" "required" {
  for_each = toset([
    "compute.googleapis.com",
    "iam.googleapis.com",
    "storage.googleapis.com",
  ])

  service            = each.value
  disable_on_destroy = false
}

resource "google_storage_bucket" "bucket_gcp_backup" {
  name          = "ecommerce-monolitico-gcp-${var.sufijo_equipo}"
  location      = "US"
  force_destroy = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }

  depends_on = [google_project_service.required]
}

resource "google_service_account" "backup" {
  account_id   = "ecommerce-backup"
  display_name = "Ecommerce Kubernetes backup"

  depends_on = [google_project_service.required]
}

resource "google_storage_bucket_iam_member" "backup_writer" {
  bucket = google_storage_bucket.bucket_gcp_backup.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.backup.email}"
}

resource "google_service_account_key" "backup" {
  service_account_id = google_service_account.backup.name
}

resource "google_compute_instance" "vm_contingencia_gcp" {
  name         = "vm-contingencia-ecommerce"
  machine_type = "e2-medium"
  zone         = "${var.gcp_region}-a"

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
    }
  }

  network_interface {
    network = "default"
    access_config {}
  }

  metadata_startup_script = replace(<<-EOF
                            #!/bin/bash
                            # 1. Preparar dependencias base
                            apt-get update -y
                            apt-get install -y ca-certificates curl gnupg git

                            # 2. Configurar repositorio oficial de Docker V2
                            install -m 0755 -d /etc/apt/keyrings
                            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
                            chmod a+r /etc/apt/keyrings/docker.gpg
                            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

                            # 3. Instalar Docker CE y Compose moderno
                            apt-get update -y
                            apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
                            systemctl start docker
                            systemctl enable docker
                            
                            # 4. Clonar el repositorio
                            git clone https://github.com/pabloallendes2310/ecommerce-monolitico.git /home/ubuntu/ecommerce
                            cd /home/ubuntu/ecommerce

                            # 5. Obtener IP publica de GCP y crear variables dinÃ¡micas
                            PUBLIC_IP=$(curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip)

                            cat <<EOT > .env
                            POSTGRES_USER=postgres
                            POSTGRES_PASSWORD=${var.db_password}
                            POSTGRES_DB=ecommerce_db
                            FRONTEND_PORT=80
                            BACKEND_PORT=3000
                            VITE_API_URL=http://$PUBLIC_IP:3000
                            JWT_SECRET=${var.jwt_secret}
                            GRAFANA_ADMIN_PASSWORD=${var.grafana_admin_password}
                            EOT
                            
                            # 6. Levantar aplicaciones y monitoreo
                            sudo docker compose -f docker-compose.prod.yml --profile monitoring up --build -d
                            
                            # 7. Esperar a que la base de datos arranque y sembrar los productos
                            sleep 30
                            sudo docker exec ecommerce-backend-prod npx prisma db seed
                            EOF
  , "\r", "")

  tags = ["http-server", "https-server", "backend-api"]

  depends_on = [google_project_service.required]
}

resource "google_compute_firewall" "allow_http" {
  name    = "allow-http-ecommerce"
  network = "default"

  allow {
    protocol = "tcp"
    # Abrimos puerto 80 (Frontend), 3000 (Backend), 3001 (Grafana) y 9090 (Prometheus)
    ports = ["80", "3000", "3001", "9090"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["http-server", "backend-api"]
}
