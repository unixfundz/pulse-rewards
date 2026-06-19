terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    # Configure via CLI or environment:
    # terraform init -backend-config="bucket=my-tfstate" ...
    key    = "pulse-rewards/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "pulse-rewards"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# ── VPC ──────────────────────────────────────────────────────
module "vpc" {
  source = "./modules/vpc"

  name        = "pulse-${var.environment}"
  cidr        = var.vpc_cidr
  environment = var.environment
}

# ── RDS (PostgreSQL) ─────────────────────────────────────────
module "rds" {
  source = "./modules/rds"

  identifier     = "pulse-${var.environment}"
  instance_class = var.db_instance_class
  db_name        = "pulse_rewards"
  username       = var.db_username
  password       = var.db_password
  subnet_ids     = module.vpc.private_subnet_ids
  vpc_id         = module.vpc.vpc_id
  environment    = var.environment
}

# ── ElastiCache (Redis) ───────────────────────────────────────
module "elasticache" {
  source = "./modules/elasticache"

  cluster_id   = "pulse-${var.environment}"
  node_type    = var.redis_node_type
  subnet_ids   = module.vpc.private_subnet_ids
  vpc_id       = module.vpc.vpc_id
  environment  = var.environment
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = module.rds.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = module.elasticache.endpoint
  sensitive   = true
}
