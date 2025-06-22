# BASB 系统测试环境 Terraform 变量配置
# 文件路径: infrastructure/terraform/staging.tfvars

# 项目基本信息
project_name = "basb"
environment = "staging"
aws_region  = "ap-northeast-1"

# 网络配置
vpc_cidr             = "10.1.0.0/16"
public_subnet_cidrs  = ["10.1.1.0/24", "10.1.2.0/24"]
private_subnet_cidrs = ["10.1.10.0/24", "10.1.11.0/24"]
availability_zones   = ["ap-northeast-1a", "ap-northeast-1c"]

# 实例配置
app_instance_count = 2  # 测试环境使用较少实例
db_instance_count  = 1  # 测试环境只使用单个数据库实例

app_instance_type = "t3.small"  # 测试环境使用较低配置实例
db_instance_type  = "t3.medium" # 测试环境使用较低配置实例

app_ami_id = "ami-0123456789abcdef0"  # 使用经过验证的 AMI
db_ami_id  = "ami-0123456789abcdef0"  # 使用经过验证的 AMI

app_volume_size = 30  # 测试环境使用较小存储空间
db_volume_size  = 50  # 测试环境使用较小存储空间

# 安全配置
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD3F6tyPEFEzV0LX3X8BsXdMsQz1x2cEikKDEY0aIj41qgxMCP/iteneqXSIFZBp5vizPvaoIR3Um9xK7PGoW8giupGn+EPuxIA4cDM4vzOqOkiMPhz5XK0whEjkVzTo4+S0puvDZuwIsdiW9mxhJc7tgBNL0cYlWSYVkz4G/fslNfRPW5mYAM49f4fhtxPb5ok4Q2Lg9dPKVHO/Bgeu5woMc7RY0p1ej6D4CKFE6lymSDJpW0YHX/wqE9+cfEauh7xZcG0q9t2ta6F6fmX0agvpFyZo8aFbXeUBr7osSCJNgvavWbM/06niWrOvYX2xwWdhXmXSrbX8ZbabVohBK41 staging-key"

# SSL 证书 ARN (测试环境使用测试证书)
ssl_certificate_arn = "arn:aws:acm:ap-northeast-1:123456789012:certificate/abcdef12-abcd-abcd-abcd-abcdef123456"

# 告警配置
alarm_email = "dev-team@example.com"

# 部署配置
deployment_strategy = "rolling"  # 测试环境使用滚动部署策略

# 备份配置
backup_retention_days = 7   # 测试环境保留较短时间的备份
backup_schedule       = "0 2 * * *"  # 每天凌晨 2 点进行备份

# 监控配置
monitoring_retention_days = 30  # 测试环境保留较短时间的监控数据

# 自动扩展配置
auto_scaling_min_size     = 1
auto_scaling_max_size     = 4
auto_scaling_desired_size = 2

# 数据库配置
mongodb_version = "5.0"
redis_version   = "6.2"

# 域名配置
domain_name = "staging.basb.example.com"

# 日志配置
log_retention_days = 30  # 测试环境保留较短时间的日志

# 维护窗口配置
maintenance_window = "sat:01:00-sat:03:00"  # 周六凌晨 1 点到 3 点进行维护

# 灾难恢复配置
dr_region = ""           # 测试环境不配置灾难恢复区域
rto_hours = 4            # 恢复时间目标（小时）
rpo_minutes = 60         # 恢复点目标（分钟）