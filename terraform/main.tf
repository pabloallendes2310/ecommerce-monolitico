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
  description = "Permitir trafico HTTP y SSH"
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
              apt-get update -y
              apt-get install -y docker.io docker-compose git
              systemctl start docker
              systemctl enable docker
              
              git clone https://github.com/pabloallendes2310/ecommerce-monolitico.git /home/ubuntu/ecommerce
              cd /home/ubuntu/ecommerce
              docker-compose -f docker-compose.prod.yml up -d
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
                            apt-get update -y
                            apt-get install -y docker.io docker-compose git
                            systemctl start docker
                            systemctl enable docker
                            
                            git clone https://github.com/pabloallendes2310/ecommerce-monolitico.git /home/ubuntu/ecommerce
                            cd /home/ubuntu/ecommerce
                            docker-compose -f docker-compose.prod.yml up -d
                            EOF

  tags = ["http-server", "https-server"]
}

resource "google_compute_firewall" "allow_http" {
  name    = "allow-http-ecommerce"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["http-server"]
}