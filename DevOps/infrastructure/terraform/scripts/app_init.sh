#!/bin/bash

# BASB 系统应用服务器初始化脚本
# 用于在 EC2 实例启动时自动配置服务器环境

# 设置变量
PROJECT_NAME="${project_name}"
ENVIRONMENT="${environment}"
APP_DIR="/opt/$PROJECT_NAME"
LOG_DIR="/var/log/$PROJECT_NAME"
CONFIG_DIR="/etc/$PROJECT_NAME"
DATA_DIR="/data/$PROJECT_NAME"
BACKUP_DIR="/backups/$PROJECT_NAME"
NODE_VERSION="16.x"
USER="ec2-user"
GROUP="ec2-user"

# 设置日志文件
LOG_FILE="/var/log/app_init.log"

# 记录日志函数
log() {
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo "[$timestamp] $1" | tee -a $LOG_FILE
}

# 开始初始化
log "开始初始化 BASB 应用服务器 - 环境: $ENVIRONMENT"

# 更新系统包
log "更新系统包"
yum update -y >> $LOG_FILE 2>&1

# 安装基本工具
log "安装基本工具"
yum install -y git curl wget unzip vim jq htop net-tools telnet nc >> $LOG_FILE 2>&1

# 安装 Docker
log "安装 Docker"
yum install -y docker >> $LOG_FILE 2>&1
systemctl enable docker >> $LOG_FILE 2>&1
systemctl start docker >> $LOG_FILE 2>&1
usermod -aG docker $USER >> $LOG_FILE 2>&1

# 安装 Docker Compose
log "安装 Docker Compose"
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose >> $LOG_FILE 2>&1
chmod +x /usr/local/bin/docker-compose >> $LOG_FILE 2>&1

# 安装 Node.js
log "安装 Node.js $NODE_VERSION"
curl -sL https://rpm.nodesource.com/setup_$NODE_VERSION | bash - >> $LOG_FILE 2>&1
yum install -y nodejs >> $LOG_FILE 2>&1

# 安装 PM2
log "安装 PM2"
npm install -g pm2 >> $LOG_FILE 2>&1

# 安装 MongoDB 客户端工具
log "安装 MongoDB 客户端工具"
cat > /etc/yum.repos.d/mongodb-org.repo << EOF
[mongodb-org-5.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/5.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-5.0.asc
EOF

yum install -y mongodb-org-shell mongodb-org-tools >> $LOG_FILE 2>&1

# 安装 Redis 客户端工具
log "安装 Redis 客户端工具"
yum install -y redis >> $LOG_FILE 2>&1

# 创建必要的目录
log "创建必要的目录"
mkdir -p $APP_DIR $LOG_DIR $CONFIG_DIR $DATA_DIR $BACKUP_DIR >> $LOG_FILE 2>&1
chown -R $USER:$GROUP $APP_DIR $LOG_DIR $CONFIG_DIR $DATA_DIR $BACKUP_DIR >> $LOG_FILE 2>&1

# 设置系统参数
log "设置系统参数"
cat > /etc/sysctl.d/99-basb.conf << EOF
# 增加文件描述符限制
fs.file-max = 100000

# 增加 TCP 连接参数
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 4096
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 5
net.ipv4.tcp_keepalive_intvl = 15

# 增加本地端口范围
net.ipv4.ip_local_port_range = 1024 65535

# 禁用 IPv6
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
EOF

sysctl -p /etc/sysctl.d/99-basb.conf >> $LOG_FILE 2>&1

# 设置用户限制
log "设置用户限制"
cat > /etc/security/limits.d/99-basb.conf << EOF
$USER soft nofile 65535
$USER hard nofile 65535
$USER soft nproc 32768
$USER hard nproc 32768
EOF

# 设置时区
log "设置时区为 Asia/Shanghai"
timedatectl set-timezone Asia/Shanghai >> $LOG_FILE 2>&1

# 安装 CloudWatch 代理
log "安装 CloudWatch 代理"
yum install -y amazon-cloudwatch-agent >> $LOG_FILE 2>&1

# 配置 CloudWatch 代理
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << EOF
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "root"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "$LOG_DIR/app.log",
            "log_group_name": "$PROJECT_NAME-$ENVIRONMENT-app",
            "log_stream_name": "{instance_id}",
            "retention_in_days": 14
          },
          {
            "file_path": "$LOG_DIR/knowledge-graph.log",
            "log_group_name": "$PROJECT_NAME-$ENVIRONMENT-knowledge-graph",
            "log_stream_name": "{instance_id}",
            "retention_in_days": 14
          },
          {
            "file_path": "$LOG_DIR/document-processor.log",
            "log_group_name": "$PROJECT_NAME-$ENVIRONMENT-document-processor",
            "log_stream_name": "{instance_id}",
            "retention_in_days": 14
          },
          {
            "file_path": "$LOG_DIR/search.log",
            "log_group_name": "$PROJECT_NAME-$ENVIRONMENT-search",
            "log_stream_name": "{instance_id}",
            "retention_in_days": 14
          },
          {
            "file_path": "$LOG_DIR/ai.log",
            "log_group_name": "$PROJECT_NAME-$ENVIRONMENT-ai",
            "log_stream_name": "{instance_id}",
            "retention_in_days": 14
          }
        ]
      }
    }
  },
  "metrics": {
    "metrics_collected": {
      "cpu": {
        "measurement": [
          "cpu_usage_idle",
          "cpu_usage_iowait",
          "cpu_usage_user",
          "cpu_usage_system"
        ],
        "metrics_collection_interval": 60,
        "totalcpu": true
      },
      "disk": {
        "measurement": [
          "used_percent",
          "inodes_free"
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "/",
          "$APP_DIR",
          "$DATA_DIR",
          "$BACKUP_DIR"
        ]
      },
      "diskio": {
        "measurement": [
          "io_time",
          "write_bytes",
          "read_bytes",
          "writes",
          "reads"
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "*"
        ]
      },
      "mem": {
        "measurement": [
          "mem_used_percent",
          "mem_available",
          "mem_available_percent"
        ],
        "metrics_collection_interval": 60
      },
      "netstat": {
        "measurement": [
          "tcp_established",
          "tcp_time_wait"
        ],
        "metrics_collection_interval": 60
      },
      "swap": {
        "measurement": [
          "swap_used_percent"
        ],
        "metrics_collection_interval": 60
      }
    },
    "append_dimensions": {
      "InstanceId": "${aws:InstanceId}",
      "Environment": "$ENVIRONMENT",
      "Project": "$PROJECT_NAME"
    }
  }
}
EOF

# 启动 CloudWatch 代理
systemctl enable amazon-cloudwatch-agent >> $LOG_FILE 2>&1
systemctl start amazon-cloudwatch-agent >> $LOG_FILE 2>&1

# 创建应用配置目录
log "创建应用配置目录"
mkdir -p $CONFIG_DIR/api $CONFIG_DIR/knowledge-graph $CONFIG_DIR/document-processor $CONFIG_DIR/search $CONFIG_DIR/ai >> $LOG_FILE 2>&1

# 创建基本配置文件
log "创建基本配置文件"
cat > $CONFIG_DIR/app.env << EOF
NODE_ENV=$ENVIRONMENT
LOG_LEVEL=info
MONGODB_URI=mongodb://basb_user:password@mongodb:27017/basb?authSource=admin
REDIS_URI=redis://:password@redis:6379/0
PORT=3000
API_PREFIX=/api
JWT_SECRET=change_this_to_a_secure_secret
JWT_EXPIRES_IN=1d
EOF

# 创建 Docker Compose 文件
log "创建 Docker Compose 文件"
cat > $APP_DIR/docker-compose.yml << EOF
version: '3.8'

services:
  api:
    image: basb/api:latest
    container_name: basb-api
    restart: always
    ports:
      - "3000:3000"
    volumes:
      - $CONFIG_DIR/api:/app/config
      - $LOG_DIR:/app/logs
      - $DATA_DIR:/app/data
    env_file:
      - $CONFIG_DIR/app.env
    environment:
      - NODE_ENV=$ENVIRONMENT
      - SERVICE_NAME=api
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - basb-network

  knowledge-graph:
    image: basb/knowledge-graph:latest
    container_name: basb-knowledge-graph
    restart: always
    ports:
      - "3001:3001"
    volumes:
      - $CONFIG_DIR/knowledge-graph:/app/config
      - $LOG_DIR:/app/logs
      - $DATA_DIR:/app/data
    env_file:
      - $CONFIG_DIR/app.env
    environment:
      - NODE_ENV=$ENVIRONMENT
      - SERVICE_NAME=knowledge-graph
      - PORT=3001
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - basb-network

  document-processor:
    image: basb/document-processor:latest
    container_name: basb-document-processor
    restart: always
    ports:
      - "3002:3002"
    volumes:
      - $CONFIG_DIR/document-processor:/app/config
      - $LOG_DIR:/app/logs
      - $DATA_DIR:/app/data
    env_file:
      - $CONFIG_DIR/app.env
    environment:
      - NODE_ENV=$ENVIRONMENT
      - SERVICE_NAME=document-processor
      - PORT=3002
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3002/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - basb-network

  search:
    image: basb/search:latest
    container_name: basb-search
    restart: always
    ports:
      - "3003:3003"
    volumes:
      - $CONFIG_DIR/search:/app/config
      - $LOG_DIR:/app/logs
      - $DATA_DIR:/app/data
    env_file:
      - $CONFIG_DIR/app.env
    environment:
      - NODE_ENV=$ENVIRONMENT
      - SERVICE_NAME=search
      - PORT=3003
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3003/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - basb-network

  ai:
    image: basb/ai:latest
    container_name: basb-ai
    restart: always
    ports:
      - "3004:3004"
    volumes:
      - $CONFIG_DIR/ai:/app/config
      - $LOG_DIR:/app/logs
      - $DATA_DIR:/app/data
    env_file:
      - $CONFIG_DIR/app.env
    environment:
      - NODE_ENV=$ENVIRONMENT
      - SERVICE_NAME=ai
      - PORT=3004
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3004/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - basb-network

networks:
  basb-network:
    driver: bridge
EOF

# 创建启动脚本
log "创建启动脚本"
cat > $APP_DIR/start.sh << EOF
#!/bin/bash

# BASB 系统启动脚本

cd \$(dirname \$0)

# 拉取最新镜像
docker-compose pull

# 启动服务
docker-compose up -d

# 检查服务状态
docker-compose ps
EOF

chmod +x $APP_DIR/start.sh >> $LOG_FILE 2>&1

# 创建停止脚本
log "创建停止脚本"
cat > $APP_DIR/stop.sh << EOF
#!/bin/bash

# BASB 系统停止脚本

cd \$(dirname \$0)

# 停止服务
docker-compose down
EOF

chmod +x $APP_DIR/stop.sh >> $LOG_FILE 2>&1

# 创建重启脚本
log "创建重启脚本"
cat > $APP_DIR/restart.sh << EOF
#!/bin/bash

# BASB 系统重启脚本

cd \$(dirname \$0)

# 停止服务
./stop.sh

# 启动服务
./start.sh
EOF

chmod +x $APP_DIR/restart.sh >> $LOG_FILE 2>&1

# 创建日志查看脚本
log "创建日志查看脚本"
cat > $APP_DIR/logs.sh << EOF
#!/bin/bash

# BASB 系统日志查看脚本

cd \$(dirname \$0)

# 查看服务日志
if [ -z "\$1" ]; then
  echo "用法: ./logs.sh <服务名>"
  echo "可用服务: api, knowledge-graph, document-processor, search, ai"
  exit 1
fi

docker-compose logs -f --tail=100 \$1
EOF

chmod +x $APP_DIR/logs.sh >> $LOG_FILE 2>&1

# 创建备份脚本
log "创建备份脚本"
cat > $APP_DIR/backup.sh << EOF
#!/bin/bash

# BASB 系统备份脚本

BACKUP_DIR="$BACKUP_DIR"
TIMESTAMP=\$(date +"%Y%m%d%H%M%S")
BACKUP_FILE="\$BACKUP_DIR/basb_backup_\$TIMESTAMP.tar.gz"

# 创建备份目录
mkdir -p \$BACKUP_DIR

# 备份配置文件
tar -czf \$BACKUP_FILE -C / etc/$PROJECT_NAME data/$PROJECT_NAME

# 上传备份到 S3
aws s3 cp \$BACKUP_FILE s3://$PROJECT_NAME-$ENVIRONMENT-backups/

# 清理旧备份（保留最近 7 天）
find \$BACKUP_DIR -name "basb_backup_*.tar.gz" -type f -mtime +7 -delete

echo "备份完成: \$BACKUP_FILE"
EOF

chmod +x $APP_DIR/backup.sh >> $LOG_FILE 2>&1

# 创建系统服务
log "创建系统服务"
cat > /etc/systemd/system/basb.service << EOF
[Unit]
Description=BASB System Service
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=$APP_DIR/start.sh
ExecStop=$APP_DIR/stop.sh
User=root
Group=root

[Install]
WantedBy=multi-user.target
EOF

# 启用系统服务
systemctl daemon-reload >> $LOG_FILE 2>&1
systemctl enable basb.service >> $LOG_FILE 2>&1

# 设置定时任务
log "设置定时任务"
cat > /etc/cron.d/basb << EOF
# BASB 系统定时任务

# 每天凌晨 2 点执行备份
0 2 * * * root $APP_DIR/backup.sh >> $LOG_DIR/backup.log 2>&1

# 每 5 分钟检查一次服务健康状态
*/5 * * * * root curl -s http://localhost:3000/health >> $LOG_DIR/health_check.log 2>&1
EOF

# 完成初始化
log "BASB 应用服务器初始化完成"

# 启动应用服务
log "启动 BASB 应用服务"
systemctl start basb.service >> $LOG_FILE 2>&1

# 输出服务状态
log "BASB 服务状态:"
systemctl status basb.service >> $LOG_FILE 2>&1

# 输出完成消息
log "=============================================="
log "BASB 应用服务器初始化完成"
log "应用目录: $APP_DIR"
log "日志目录: $LOG_DIR"
log "配置目录: $CONFIG_DIR"
log "数据目录: $DATA_DIR"
log "备份目录: $BACKUP_DIR"
log "=============================================="