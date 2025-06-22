# BASB 系统基础设施即代码 - Terraform 变量定义
# 用于配置基础设施部署的参数

variable "project_name" {
  description = "项目名称"
  type        = string
  default     = "basb"
}

variable "environment" {
  description = "部署环境（development, staging, production）"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS 区域"
  type        = string
  default     = "ap-northeast-1"
}

variable "vpc_cidr" {
  description = "VPC CIDR 块"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnets_cidr" {
  description = "公共子网 CIDR 块列表"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnets_cidr" {
  description = "私有子网 CIDR 块列表"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

variable "availability_zones" {
  description = "可用区列表"
  type        = list(string)
  default     = ["ap-northeast-1a", "ap-northeast-1c"]
}

variable "app_instance_count" {
  description = "应用服务器实例数量"
  type        = number
  default     = 2
}

variable "db_instance_count" {
  description = "数据库服务器实例数量"
  type        = number
  default     = 2
}

variable "app_ami" {
  description = "应用服务器 AMI ID"
  type        = string
  default     = "ami-0d979355d03fa2522" # Amazon Linux 2 AMI
}

variable "db_ami" {
  description = "数据库服务器 AMI ID"
  type        = string
  default     = "ami-0d979355d03fa2522" # Amazon Linux 2 AMI
}

variable "app_instance_type" {
  description = "应用服务器实例类型"
  type        = string
  default     = "t3.medium"
}

variable "db_instance_type" {
  description = "数据库服务器实例类型"
  type        = string
  default     = "t3.large"
}

variable "app_volume_size" {
  description = "应用服务器卷大小（GB）"
  type        = number
  default     = 50
}

variable "db_volume_size" {
  description = "数据库服务器卷大小（GB）"
  type        = number
  default     = 100
}

variable "ssh_public_key" {
  description = "SSH 公钥用于 EC2 实例访问"
  type        = string
  default     = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD3F6tyPEFEzV0LX3X8BsXdMsQz1x2cEikKDEY0aIj41qgxMCP/iteneqXSIFZBp5vizPvaoIR3Um9xK7PGoW8giupGn+EPuxIA4cDM4vzOqOkiMPhz5XK0whEjkVzTo4+S0puvDZuwIsdiW9mxhJc7tgBNL0cYlWSYVkz4G/fslNfRPW5mYAM49f4fhtxPb5ok4Q2Lg9dPKVHO/Bgeu5woMc7RY0p1ej6D4CKFE6lymSDJpW0YHX/wqE9+cfEauh7xZcG0q9t2ta6F6fmX0agvpFyZo8aFbXeUBr7osSCJNgvavWbM/06niWrOvYX2xwWdhXmXSrbX8ZbabVohBK41 email@example.com"
}

variable "certificate_arn" {
  description = "SSL 证书 ARN"
  type        = string
  default     = "arn:aws:acm:ap-northeast-1:123456789012:certificate/12345678-1234-1234-1234-123456789012"
}

variable "alert_email" {
  description = "告警通知邮箱"
  type        = string
  default     = "admin@example.com"
}