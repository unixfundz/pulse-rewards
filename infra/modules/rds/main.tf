variable "identifier"     { type = string }
variable "instance_class" { type = string }
variable "db_name"        { type = string }
variable "username"       { type = string; sensitive = true }
variable "password"       { type = string; sensitive = true }
variable "subnet_ids"     { type = list(string) }
variable "vpc_id"         { type = string }
variable "environment"    { type = string }

resource "aws_db_subnet_group" "this" {
  name       = "${var.identifier}-subnet-group"
  subnet_ids = var.subnet_ids
}

resource "aws_security_group" "rds" {
  name   = "${var.identifier}-rds-sg"
  vpc_id = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "this" {
  identifier              = var.identifier
  engine                  = "postgres"
  engine_version          = "16.2"
  instance_class          = var.instance_class
  db_name                 = var.db_name
  username                = var.username
  password                = var.password
  db_subnet_group_name    = aws_db_subnet_group.this.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  storage_encrypted       = true
  multi_az                = var.environment == "production"
  skip_final_snapshot     = var.environment != "production"
  deletion_protection     = var.environment == "production"
  backup_retention_period = var.environment == "production" ? 7 : 1
  tags                    = { Name = var.identifier }
}

output "endpoint" { value = aws_db_instance.this.endpoint; sensitive = true }
