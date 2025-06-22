# BASB 系统生产环境 Terraform 变量配置
# 文件路径: infrastructure/terraform/production.tfvars

# 项目基本信息
project_name = "basb"
environment = "production"
aws_region  = "ap-northeast-1"

# 网络配置
vpc_cidr             = "10.0.0.0/16"
public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs = ["10.0.10.0/24", "10.0.11.0/24"]
availability_zones   = ["ap-northeast-1a", "ap-northeast-1c"]

# 实例配置
app_instance_count = 4  # 生产环境使用更多实例
db_instance_count  = 2  # 主从架构

app_instance_type = "t3.medium"  # 生产环境使用更高性能实例
db_instance_type  = "t3.large"   # 生产环境使用更高性能实例

app_ami_id = "ami-0123456789abcdef0"  # 使用经过验证的 AMI
db_ami_id  = "ami-0123456789abcdef0"  # 使用经过验证的 AMI

app_volume_size = 50  # 生产环境使用更大存储空间
db_volume_size  = 100 # 生产环境使用更大存储空间

# 安全配置
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD3F6tyPEFEzV0LX3X8BsXdMsQz1x2cEikKDEY0aIj41qgxMCP/iteneqXSIFZBp5vizPvaoIR3Um9xK7PGoW8giupGn+EPuxIA4cDM4vzOqOkiMPhz5XK0whEjkVzTo4+S0puvDZuwIsdiW9mxhJc7tgBNL0cYlWSYVkz4G/fslNfRPW5mYAM49f4fhtxPb5ok4Q2Lg9dPKVHO/Bgeu5woMc7RY0p1ej6D4CKFE6lymSDJpW0YHX/wqE9+cfEauh7xZcG0q9t2ta6F6fmX0agvpFyZo8aFbXeUBr7osSCJNgvavWbM/06niWrOvYX2xwWdhXmXSrbX8ZbabVohBK41 production-key"

# SSL 证书 ARN (生产环境使用正式证书)
ssl_certificate_arn = "arn:aws:acm:ap-northeast-1:123456789012:certificate/12345678-1234-1234-1234-123456789012"

# 告警配置
alarm_email = "ops-team@example.com"

# 部署配置
deployment_strategy = "blue-green"  # 蓝绿部署策略

# 备份配置
backup_retention_days = 30  # 生产环境保留更长时间的备份
backup_schedule       = "0 1 * * *"  # 每天凌晨 1 点进行备份

# 监控配置
monitoring_retention_days = 90  # 生产环境保留更长时间的监控数据

# 自动扩展配置
auto_scaling_min_size     = 2
auto_scaling_max_size     = 8
auto_scaling_desired_size = 4

# 数据库配置
mongodb_version = "5.0"
redis_version   = "6.2"

# 域名配置
domain_name = "basb.example.com"

# 日志配置
log_retention_days = 90  # 生产环境保留更长时间的日志

# 维护窗口配置
maintenance_window = "sun:01:00-sun:03:00"  # 周日凌晨 1 点到 3 点进行维护

# 灾难恢复配置
dr_region = "ap-southeast-1"  # 灾难恢复区域
rto_hours = 1                 # 恢复时间目标（小时）
rpo_minutes = 15              # 恢复点目标（分钟）