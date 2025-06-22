# BASB 系统基础设施即代码 - Terraform 配置
# 用于定义和管理 BASB 系统的云基础设施资源

# 配置 Terraform 提供商
provider "aws" {
  region = var.aws_region
}

# 定义 VPC
resource "aws_vpc" "basb_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name        = "${var.project_name}-vpc"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 创建公共子网
resource "aws_subnet" "public" {
  count                   = length(var.public_subnets_cidr)
  vpc_id                  = aws_vpc.basb_vpc.id
  cidr_block              = element(var.public_subnets_cidr, count.index)
  availability_zone       = element(var.availability_zones, count.index)
  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.project_name}-public-subnet-${count.index + 1}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 创建私有子网
resource "aws_subnet" "private" {
  count             = length(var.private_subnets_cidr)
  vpc_id            = aws_vpc.basb_vpc.id
  cidr_block        = element(var.private_subnets_cidr, count.index)
  availability_zone = element(var.availability_zones, count.index)

  tags = {
    Name        = "${var.project_name}-private-subnet-${count.index + 1}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 创建互联网网关
resource "aws_internet_gateway" "ig" {
  vpc_id = aws_vpc.basb_vpc.id

  tags = {
    Name        = "${var.project_name}-igw"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 创建弹性 IP 用于 NAT 网关
resource "aws_eip" "nat_eip" {
  count = length(var.public_subnets_cidr)
  vpc   = true

  tags = {
    Name        = "${var.project_name}-nat-eip-${count.index + 1}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 创建 NAT 网关
resource "aws_nat_gateway" "nat" {
  count         = length(var.public_subnets_cidr)
  allocation_id = element(aws_eip.nat_eip.*.id, count.index)
  subnet_id     = element(aws_subnet.public.*.id, count.index)

  tags = {
    Name        = "${var.project_name}-nat-gw-${count.index + 1}"
    Environment = var.environment
    Project     = var.project_name
  }

  depends_on = [aws_internet_gateway.ig]
}

# 创建公共路由表
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.basb_vpc.id

  tags = {
    Name        = "${var.project_name}-public-route-table"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 创建公共路由
resource "aws_route" "public_internet_gateway" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.ig.id
}

# 创建私有路由表
resource "aws_route_table" "private" {
  count  = length(var.private_subnets_cidr)
  vpc_id = aws_vpc.basb_vpc.id

  tags = {
    Name        = "${var.project_name}-private-route-table-${count.index + 1}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 创建私有路由
resource "aws_route" "private_nat_gateway" {
  count                  = length(var.private_subnets_cidr)
  route_table_id         = element(aws_route_table.private.*.id, count.index)
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = element(aws_nat_gateway.nat.*.id, count.index)
}

# 关联公共子网到公共路由表
resource "aws_route_table_association" "public" {
  count          = length(var.public_subnets_cidr)
  subnet_id      = element(aws_subnet.public.*.id, count.index)
  route_table_id = aws_route_table.public.id
}

# 关联私有子网到私有路由表
resource "aws_route_table_association" "private" {
  count          = length(var.private_subnets_cidr)
  subnet_id      = element(aws_subnet.private.*.id, count.index)
  route_table_id = element(aws_route_table.private.*.id, count.index)
}

# 创建安全组 - 负载均衡器
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "ALB Security Group"
  vpc_id      = aws_vpc.basb_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-alb-sg"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 创建安全组 - 应用服务器
resource "aws_security_group" "app" {
  name        = "${var.project_name}-app-sg"
  description = "Application Security Group"
  vpc_id      = aws_vpc.basb_vpc.id

  ingress {
    from_port       = 3000
    to_port         = 3004
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-app-sg"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 创建安全组 - 数据库
resource "aws_security_group" "db" {
  name        = "${var.project_name}-db-sg"
  description = "Database Security Group"
  vpc_id      = aws_vpc.basb_vpc.id

  ingress {
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-db-sg"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 创建 EC2 密钥对
resource "aws_key_pair" "basb_key" {
  key_name   = "${var.project_name}-key"
  public_key = var.ssh_public_key

  tags = {
    Name        = "${var.project_name}-key"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 创建应用服务器 EC2 实例
resource "aws_instance" "app" {
  count                  = var.app_instance_count
  ami                    = var.app_ami
  instance_type          = var.app_instance_type
  key_name               = aws_key_pair.basb_key.key_name
  vpc_security_group_ids = [aws_security_group.app.id]
  subnet_id              = element(aws_subnet.private.*.id, count.index % length(aws_subnet.private.*.id))
  iam_instance_profile   = aws_iam_instance_profile.app_profile.name

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.app_volume_size
    delete_on_termination = true
  }

  user_data = templatefile("${path.module}/scripts/app_init.sh", {
    project_name = var.project_name
    environment  = var.environment
  })

  tags = {
    Name        = "${var.project_name}-app-${count.index + 1}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 创建数据库服务器 EC2 实例
resource "aws_instance" "db" {
  count                  = var.db_instance_count
  ami                    = var.db_ami
  instance_type          = var.db_instance_type
  key_name               = aws_key_pair.basb_key.key_name
  vpc_security_group_ids = [aws_security_group.db.id]
  subnet_id              = element(aws_subnet.private.*.id, count.index % length(aws_subnet.private.*.id))

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.db_volume_size
    delete_on_termination = true
  }

  user_data = templatefile("${path.module}/scripts/db_init.sh", {
    project_name = var.project_name
    environment  = var.environment
  })

  tags = {
    Name        = "${var.project_name}-db-${count.index + 1}"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 创建应用负载均衡器
resource "aws_lb" "app" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public.*.id

  enable_deletion_protection = true

  tags = {
    Name        = "${var.project_name}-alb"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 创建 ALB 目标组
resource "aws_lb_target_group" "app" {
  name     = "${var.project_name}-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.basb_vpc.id

  health_check {
    path                = "/health"
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  tags = {
    Name        = "${var.project_name}-tg"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 将 EC2 实例注册到目标组
resource "aws_lb_target_group_attachment" "app" {
  count            = var.app_instance_count
  target_group_arn = aws_lb_target_group.app.arn
  target_id        = element(aws_instance.app.*.id, count.index)
  port             = 3000
}

# 创建 ALB 监听器 - HTTP
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# 创建 ALB 监听器 - HTTPS
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.app.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# 创建 IAM 角色 - 应用服务器
resource "aws_iam_role" "app_role" {
  name = "${var.project_name}-app-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
    ]
  })

  tags = {
    Name        = "${var.project_name}-app-role"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 创建 IAM 策略 - 应用服务器
resource "aws_iam_policy" "app_policy" {
  name        = "${var.project_name}-app-policy"
  description = "Policy for BASB application servers"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket",
        ]
        Effect = "Allow"
        Resource = [
          "arn:aws:s3:::${var.project_name}-${var.environment}-*",
          "arn:aws:s3:::${var.project_name}-${var.environment}-*/*",
        ]
      },
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams",
        ]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
}

# 附加 IAM 策略到角色
resource "aws_iam_role_policy_attachment" "app_policy_attachment" {
  role       = aws_iam_role.app_role.name
  policy_arn = aws_iam_policy.app_policy.arn
}

# 创建 IAM 实例配置文件
resource "aws_iam_instance_profile" "app_profile" {
  name = "${var.project_name}-app-profile"
  role = aws_iam_role.app_role.name
}

# 创建 S3 存储桶 - 应用数据
resource "aws_s3_bucket" "app_data" {
  bucket = "${var.project_name}-${var.environment}-data"

  tags = {
    Name        = "${var.project_name}-${var.environment}-data"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 配置 S3 存储桶加密
resource "aws_s3_bucket_server_side_encryption_configuration" "app_data" {
  bucket = aws_s3_bucket.app_data.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# 创建 S3 存储桶 - 备份
resource "aws_s3_bucket" "backups" {
  bucket = "${var.project_name}-${var.environment}-backups"

  tags = {
    Name        = "${var.project_name}-${var.environment}-backups"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 配置 S3 备份桶加密
resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# 配置 S3 备份桶生命周期规则
resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id

  rule {
    id     = "backup-lifecycle"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}

# 创建 CloudWatch 告警 - CPU 使用率
resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  count               = var.app_instance_count
  alarm_name          = "${var.project_name}-app-${count.index + 1}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ec2 cpu utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    InstanceId = element(aws_instance.app.*.id, count.index)
  }

  tags = {
    Name        = "${var.project_name}-app-${count.index + 1}-cpu-high"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 创建 SNS 主题 - 告警
resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-alerts"

  tags = {
    Name        = "${var.project_name}-alerts"
    Environment = var.environment
    Project     = var.project_name
  }
}

# 创建 SNS 主题订阅
resource "aws_sns_topic_subscription" "alerts_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# 输出
output "vpc_id" {
  value = aws_vpc.basb_vpc.id
}

output "public_subnets" {
  value = aws_subnet.public.*.id
}

output "private_subnets" {
  value = aws_subnet.private.*.id
}

output "app_security_group_id" {
  value = aws_security_group.app.id
}

output "db_security_group_id" {
  value = aws_security_group.db.id
}

output "alb_dns_name" {
  value = aws_lb.app.dns_name
}

output "app_instance_ids" {
  value = aws_instance.app.*.id
}

output "db_instance_ids" {
  value = aws_instance.db.*.id
}

output "app_data_bucket" {
  value = aws_s3_bucket.app_data.bucket
}

output "backups_bucket" {
  value = aws_s3_bucket.backups.bucket
}