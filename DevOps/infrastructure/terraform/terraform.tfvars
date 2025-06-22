# BASB 系统基础设施即代码 - Terraform 变量值
# 用于设置实际的变量值

# 项目基本信息
project_name = "basb"
environment  = "production"
aws_region   = "ap-northeast-1"

# 网络配置
vpc_cidr             = "10.0.0.0/16"
public_subnets_cidr  = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnets_cidr = ["10.0.10.0/24", "10.0.20.0/24"]
availability_zones   = ["ap-northeast-1a", "ap-northeast-1c"]

# 实例配置
app_instance_count = 2
db_instance_count  = 2
app_instance_type  = "t3.medium"
db_instance_type   = "t3.large"
app_volume_size    = 50
db_volume_size     = 100

# 安全配置
# 注意: 在实际部署中，请替换为真实的 SSH 公钥
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD3F6tyPEFEzV0LX3X8BsXdMsQz1x2cEikKDEY0aIj41qgxMCP/iteneqXSIFZBp5vizPvaoIR3Um9xK7PGoW8giupGn+EPuxIA4cDM4vzOqOkiMPhz5XK0whEjkVzTo4+S0puvDZuwIsdiW9mxhJc7tgBNL0cYlWSYVkz4G/fslNfRPW5mYAM49f4fhtxPb5ok4Q2Lg9dPKVHO/Bgeu5woMc7RY0p1ej6D4CKFE6lymSDJpW0YHX/wqE9+cfEauh7xZcG0q9t2ta6F6fmX0agvpFyZo8aFbXeUBr7osSCJNgvavWbM/06niWrOvYX2xwWdhXmXSrbX8ZbabVohBK41 basb@example.com"

# 注意: 在实际部署中，请替换为真实的 SSL 证书 ARN
certificate_arn = "arn:aws:acm:ap-northeast-1:123456789012:certificate/12345678-1234-1234-1234-123456789012"

# 告警配置
alert_email = "admin@example.com"