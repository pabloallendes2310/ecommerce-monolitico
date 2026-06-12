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

  # Abrimos el puerto 3000 para la API del Backend
  ingress {
    from_port   = 3000
    to_port     = 3000
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
  subnet_id              = aws_subnet.subnet_app.id
  vpc_security_group_ids = [aws_security_group.sg_ecommerce.id]

  ebs_block_device {
    device_name = "/dev/sdf"
    volume_size = 10
    volume_type = "gp2"
  }

  tags = { Name = "vm-aplicacion-ecommerce" }

  user_data = <<-EOF
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

              # 5. Obtener IP publica de AWS y crear variables dinámicas
              TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
              PUBLIC_IP=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/public-ipv4)

              cat <<EOT > .env
              POSTGRES_USER=postgres
              POSTGRES_PASSWORD=${var.db_password}
              POSTGRES_DB=ecommerce_db
              FRONTEND_PORT=80
              BACKEND_PORT=3000
              VITE_API_URL=http://$PUBLIC_IP:3000
              JWT_SECRET=${var.jwt_secret}
              EOT
              
              # 6. Levantar todo
              sudo docker compose -f docker-compose.prod.yml up --build -d
              EOF
}

resource "aws_instance" "vm_backup" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.tipo_instancia_aws
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

resource "google_storage_bucket" "bucket_gcp_backup" {
  name          = "ecommerce-monolitico-gcp-${var.sufijo_equipo}"
  location      = "US"
  force_destroy = true
}

resource "google_compute_instance" "vm_contingencia_gcp" {
  name         = "vm-contingencia-ecommerce"
  machine_type = "e2-micro"
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

  metadata_startup_script = <<-EOF
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

                            # 5. Obtener IP publica de GCP y crear variables dinámicas
                            PUBLIC_IP=$(curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip)

                            cat <<EOT > .env
                            POSTGRES_USER=postgres
                            POSTGRES_PASSWORD=${var.db_password}
                            POSTGRES_DB=ecommerce_db
                            FRONTEND_PORT=80
                            BACKEND_PORT=3000
                            VITE_API_URL=http://$PUBLIC_IP:3000
                            JWT_SECRET=${var.jwt_secret}
                            EOT
                            
                            # 6. Levantar todo
                            sudo docker compose -f docker-compose.prod.yml up --build -d
                            EOF

  tags = ["http-server", "https-server", "backend-api"]
}

resource "google_compute_firewall" "allow_http" {
  name    = "allow-http-ecommerce"
  network = "default"

  allow {
    protocol = "tcp"
    # Abrimos puerto 80 (Frontend) y 3000 (Backend)
    ports    = ["80", "3000"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["http-server", "backend-api"]
}