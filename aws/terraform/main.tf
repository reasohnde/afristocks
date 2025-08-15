terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-west-1"
}

# Variables
variable "project_name" {
  default = "afristocks"
}

# Le cluster ECS existe déjà, on va juste le référencer
data "aws_ecs_cluster" "existing" {
  cluster_name = "${var.project_name}-cluster"
}

# Créer les repositories ECR s'ils n'existent pas
resource "aws_ecr_repository" "backend" {
  name = "${var.project_name}-backend"
  
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "frontend" {
  name = "${var.project_name}-frontend"
  
  image_scanning_configuration {
    scan_on_push = true
  }
}

# Outputs
output "cluster_name" {
  value = data.aws_ecs_cluster.existing.cluster_name
}

output "ecr_backend_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  value = aws_ecr_repository.frontend.repository_url
}
