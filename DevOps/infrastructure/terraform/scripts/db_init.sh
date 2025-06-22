#!/bin/bash

# BASB 系统数据库服务器初始化脚本
# 用于在 EC2 实例启动时自动配置 MongoDB 和 Redis 数据库环境

# 设置变量
PROJECT_NAME="${project_name}"
ENVIRONMENT="${environment}"
DB_DIR="/opt/$PROJECT_NAME/db"
LOG_DIR="/var/log/$PROJECT_NAME"
CONFIG_DIR="/etc/$PROJECT_NAME"
DATA_DIR="/data/$PROJECT_NAME"
BACKUP_DIR="/backups/$PROJECT_NAME"
MONGODB_VERSION="5.0"
REDIS_VERSION="6.2.6"
MONGODB_PORT="27017"
REDIS_PORT="6379"
MONGODB_USER="basb_user"
MONGODB_PASSWORD="$(openssl rand -base64 12)" # 随机生成密码
REDIS_PASSWORD="$(openssl rand -base64 12)" # 随机生成密码

# 设置日志文件
LOG_FILE="/var/log/db_init.log"

# 记录日志函数
log() {
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo "[$timestamp] $1" | tee -a $LOG_FILE
}

# 开始初始化
log "开始初始化 BASB 数据库服务器 - 环境: $ENVIRONMENT"

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

# 安装 Docker Compose
log "安装 Docker Compose"
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose >> $LOG_FILE 2>&1
chmod +x /usr/local/bin/docker-compose >> $LOG_FILE 2>&1

# 创建必要的目录
log "创建必要的目录"
mkdir -p $DB_DIR $LOG_DIR $CONFIG_DIR $DATA_DIR/mongodb $DATA_DIR/redis $BACKUP_DIR/mongodb $BACKUP_DIR/redis >> $LOG_FILE 2>&1

# 设置系统参数
log "设置系统参数"
cat > /etc/sysctl.d/99-basb-db.conf << EOF
# MongoDB 推荐设置
vm.swappiness = 1
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5

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

sysctl -p /etc/sysctl.d/99-basb-db.conf >> $LOG_FILE 2>&1

# 设置用户限制
log "设置用户限制"
cat > /etc/security/limits.d/99-basb-db.conf << EOF
# MongoDB 和 Redis 需要更高的文件描述符限制
* soft nofile 65535
* hard nofile 65535
* soft nproc 32768
* hard nproc 32768

# MongoDB 需要禁用透明大页面
EOF

# 禁用透明大页面（MongoDB 推荐）
log "禁用透明大页面"
cat > /etc/rc.local << EOF
#!/bin/bash

# 禁用透明大页面
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag

exit 0
EOF

chmod +x /etc/rc.local >> $LOG_FILE 2>&1

# 立即禁用透明大页面
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag

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
            "file_path": "$LOG_DIR/mongodb.log",
            "log_group_name": "$PROJECT_NAME-$ENVIRONMENT-mongodb",
            "log_stream_name": "{instance_id}",
            "retention_in_days": 14
          },
          {
            "file_path": "$LOG_DIR/redis.log",
            "log_group_name": "$PROJECT_NAME-$ENVIRONMENT-redis",
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
          "$DATA_DIR/mongodb",
          "$DATA_DIR/redis",
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

# 创建 MongoDB 配置文件
log "创建 MongoDB 配置文件"
mkdir -p $CONFIG_DIR/mongodb >> $LOG_FILE 2>&1
cat > $CONFIG_DIR/mongodb/mongod.conf << EOF
# MongoDB 配置文件
storage:
  dbPath: /data/db
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1

systemLog:
  destination: file
  path: /var/log/mongodb/mongod.log
  logAppend: true

net:
  port: $MONGODB_PORT
  bindIp: 0.0.0.0

security:
  authorization: enabled

processManagement:
  timeZoneInfo: /usr/share/zoneinfo
EOF

# 创建 Redis 配置文件
log "创建 Redis 配置文件"
mkdir -p $CONFIG_DIR/redis >> $LOG_FILE 2>&1
cat > $CONFIG_DIR/redis/redis.conf << EOF
# Redis 配置文件
port $REDIS_PORT
bind 0.0.0.0
protected-mode yes
requirepass $REDIS_PASSWORD

# 持久化配置
dir /data
dbfilename dump.rdb
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec

# 内存配置
maxmemory 1gb
maxmemory-policy allkeys-lru

# 日志配置
logfile /var/log/redis/redis.log
loglevel notice

# 安全配置
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command DEBUG ""
EOF

# 创建 Docker Compose 文件
log "创建 Docker Compose 文件"
cat > $DB_DIR/docker-compose.yml << EOF
version: '3.8'

services:
  mongodb:
    image: mongo:$MONGODB_VERSION
    container_name: basb-mongodb
    restart: always
    ports:
      - "$MONGODB_PORT:27017"
    volumes:
      - $DATA_DIR/mongodb:/data/db
      - $CONFIG_DIR/mongodb:/etc/mongo
      - $LOG_DIR:/var/log/mongodb
    environment:
      - MONGO_INITDB_ROOT_USERNAME=$MONGODB_USER
      - MONGO_INITDB_ROOT_PASSWORD=$MONGODB_PASSWORD
    command: ["--config", "/etc/mongo/mongod.conf"]
    healthcheck:
      test: ["CMD", "mongo", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - basb-db-network

  redis:
    image: redis:$REDIS_VERSION
    container_name: basb-redis
    restart: always
    ports:
      - "$REDIS_PORT:6379"
    volumes:
      - $DATA_DIR/redis:/data
      - $CONFIG_DIR/redis:/usr/local/etc/redis
      - $LOG_DIR:/var/log/redis
    command: ["redis-server", "/usr/local/etc/redis/redis.conf"]
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "$REDIS_PASSWORD", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - basb-db-network

networks:
  basb-db-network:
    driver: bridge
EOF

# 保存数据库凭证
log "保存数据库凭证"
cat > $CONFIG_DIR/db_credentials.env << EOF
# BASB 数据库凭证
# 生成时间: $(date)
# 环境: $ENVIRONMENT

# MongoDB
MONGODB_USER=$MONGODB_USER
MONGODB_PASSWORD=$MONGODB_PASSWORD
MONGODB_HOST=localhost
MONGODB_PORT=$MONGODB_PORT
MONGODB_URI=mongodb://$MONGODB_USER:$MONGODB_PASSWORD@localhost:$MONGODB_PORT/basb?authSource=admin

# Redis
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_HOST=localhost
REDIS_PORT=$REDIS_PORT
REDIS_URI=redis://:$REDIS_PASSWORD@localhost:$REDIS_PORT/0
EOF

chmod 600 $CONFIG_DIR/db_credentials.env >> $LOG_FILE 2>&1

# 创建启动脚本
log "创建启动脚本"
cat > $DB_DIR/start.sh << EOF
#!/bin/bash

# BASB 数据库启动脚本

cd \$(dirname \$0)

# 创建日志目录
mkdir -p $LOG_DIR

# 启动数据库服务
docker-compose up -d

# 检查服务状态
docker-compose ps
EOF

chmod +x $DB_DIR/start.sh >> $LOG_FILE 2>&1

# 创建停止脚本
log "创建停止脚本"
cat > $DB_DIR/stop.sh << EOF
#!/bin/bash

# BASB 数据库停止脚本

cd \$(dirname \$0)

# 停止数据库服务
docker-compose down
EOF

chmod +x $DB_DIR/stop.sh >> $LOG_FILE 2>&1

# 创建重启脚本
log "创建重启脚本"
cat > $DB_DIR/restart.sh << EOF
#!/bin/bash

# BASB 数据库重启脚本

cd \$(dirname \$0)

# 停止服务
./stop.sh

# 启动服务
./start.sh
EOF

chmod +x $DB_DIR/restart.sh >> $LOG_FILE 2>&1

# 创建日志查看脚本
log "创建日志查看脚本"
cat > $DB_DIR/logs.sh << EOF
#!/bin/bash

# BASB 数据库日志查看脚本

cd \$(dirname \$0)

# 查看服务日志
if [ -z "\$1" ]; then
  echo "用法: ./logs.sh <服务名>"
  echo "可用服务: mongodb, redis"
  exit 1
fi

docker-compose logs -f --tail=100 \$1
EOF

chmod +x $DB_DIR/logs.sh >> $LOG_FILE 2>&1

# 创建备份脚本
log "创建备份脚本"
cat > $DB_DIR/backup.sh << EOF
#!/bin/bash

# BASB 数据库备份脚本

BACKUP_DIR="$BACKUP_DIR"
TIMESTAMP=\$(date +"%Y%m%d%H%M%S")
MONGODB_BACKUP_FILE="\$BACKUP_DIR/mongodb/mongodb_backup_\$TIMESTAMP"
REDIS_BACKUP_FILE="\$BACKUP_DIR/redis/redis_backup_\$TIMESTAMP.rdb"

# 加载数据库凭证
source $CONFIG_DIR/db_credentials.env

# 创建备份目录
mkdir -p \$BACKUP_DIR/mongodb \$BACKUP_DIR/redis

# 备份 MongoDB
echo "开始备份 MongoDB..."
docker exec basb-mongodb mongodump --host localhost --port 27017 -u \$MONGODB_USER -p \$MONGODB_PASSWORD --authenticationDatabase admin --out \$MONGODB_BACKUP_FILE

# 压缩 MongoDB 备份
tar -czf "\$MONGODB_BACKUP_FILE.tar.gz" -C \$BACKUP_DIR/mongodb "\$(basename \$MONGODB_BACKUP_FILE)"
rm -rf "\$MONGODB_BACKUP_FILE"

# 备份 Redis
echo "开始备份 Redis..."
docker exec basb-redis redis-cli -a \$REDIS_PASSWORD SAVE
docker cp basb-redis:/data/dump.rdb \$REDIS_BACKUP_FILE

# 上传备份到 S3
if command -v aws &> /dev/null; then
  echo "上传备份到 S3..."
  aws s3 cp "\$MONGODB_BACKUP_FILE.tar.gz" s3://$PROJECT_NAME-$ENVIRONMENT-backups/mongodb/
  aws s3 cp "\$REDIS_BACKUP_FILE" s3://$PROJECT_NAME-$ENVIRONMENT-backups/redis/
fi

# 清理旧备份（保留最近 7 天）
find \$BACKUP_DIR/mongodb -name "mongodb_backup_*.tar.gz" -type f -mtime +7 -delete
find \$BACKUP_DIR/redis -name "redis_backup_*.rdb" -type f -mtime +7 -delete

echo "备份完成:"
echo "MongoDB: \$MONGODB_BACKUP_FILE.tar.gz"
echo "Redis: \$REDIS_BACKUP_FILE"
EOF

chmod +x $DB_DIR/backup.sh >> $LOG_FILE 2>&1

# 创建恢复脚本
log "创建恢复脚本"
cat > $DB_DIR/restore.sh << EOF
#!/bin/bash

# BASB 数据库恢复脚本

# 加载数据库凭证
source $CONFIG_DIR/db_credentials.env

# 检查参数
if [ \$# -lt 2 ]; then
  echo "用法: ./restore.sh <数据库类型> <备份文件>"
  echo "数据库类型: mongodb, redis"
  echo "示例: ./restore.sh mongodb /backups/basb/mongodb/mongodb_backup_20230101000000.tar.gz"
  echo "示例: ./restore.sh redis /backups/basb/redis/redis_backup_20230101000000.rdb"
  exit 1
fi

DB_TYPE=\$1
BACKUP_FILE=\$2

if [ ! -f "\$BACKUP_FILE" ]; then
  echo "错误: 备份文件 \$BACKUP_FILE 不存在"
  exit 1
fi

case \$DB_TYPE in
  mongodb)
    echo "开始恢复 MongoDB..."
    # 解压备份文件
    TEMP_DIR=\$(mktemp -d)
    tar -xzf "\$BACKUP_FILE" -C \$TEMP_DIR
    
    # 恢复数据库
    docker exec -i basb-mongodb mongorestore --host localhost --port 27017 -u \$MONGODB_USER -p \$MONGODB_PASSWORD --authenticationDatabase admin \$TEMP_DIR
    
    # 清理临时目录
    rm -rf \$TEMP_DIR
    ;;
  redis)
    echo "开始恢复 Redis..."
    # 停止 Redis
    docker-compose stop redis
    
    # 复制备份文件
    cp "\$BACKUP_FILE" $DATA_DIR/redis/dump.rdb
    
    # 启动 Redis
    docker-compose start redis
    ;;
  *)
    echo "错误: 未知的数据库类型 \$DB_TYPE"
    exit 1
    ;;
esac

echo "恢复完成"
EOF

chmod +x $DB_DIR/restore.sh >> $LOG_FILE 2>&1

# 创建系统服务
log "创建系统服务"
cat > /etc/systemd/system/basb-db.service << EOF
[Unit]
Description=BASB Database Service
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$DB_DIR
ExecStart=$DB_DIR/start.sh
ExecStop=$DB_DIR/stop.sh
User=root
Group=root

[Install]
WantedBy=multi-user.target
EOF

# 启用系统服务
systemctl daemon-reload >> $LOG_FILE 2>&1
systemctl enable basb-db.service >> $LOG_FILE 2>&1

# 设置定时任务
log "设置定时任务"
cat > /etc/cron.d/basb-db << EOF
# BASB 数据库定时任务

# 每天凌晨 2 点执行备份
0 2 * * * root $DB_DIR/backup.sh >> $LOG_DIR/db_backup.log 2>&1

# 每 5 分钟检查一次数据库健康状态
*/5 * * * * root docker exec basb-mongodb mongo --eval "db.adminCommand('ping')" >> $LOG_DIR/mongodb_health.log 2>&1
*/5 * * * * root docker exec basb-redis redis-cli -a $REDIS_PASSWORD ping >> $LOG_DIR/redis_health.log 2>&1
EOF

# 完成初始化
log "BASB 数据库服务器初始化完成"

# 启动数据库服务
log "启动 BASB 数据库服务"
systemctl start basb-db.service >> $LOG_FILE 2>&1

# 输出服务状态
log "BASB 数据库服务状态:"
systemctl status basb-db.service >> $LOG_FILE 2>&1

# 输出数据库凭证信息
log "数据库凭证信息:"
log "MongoDB URI: mongodb://$MONGODB_USER:********@localhost:$MONGODB_PORT/basb?authSource=admin"
log "Redis URI: redis://:********@localhost:$REDIS_PORT/0"
log "凭证文件: $CONFIG_DIR/db_credentials.env"

# 输出完成消息
log "=============================================="
log "BASB 数据库服务器初始化完成"
log "数据库目录: $DB_DIR"
log "日志目录: $LOG_DIR"
log "配置目录: $CONFIG_DIR"
log "数据目录: $DATA_DIR"
log "备份目录: $BACKUP_DIR"
log "MongoDB 端口: $MONGODB_PORT"
log "Redis 端口: $REDIS_PORT"
log "=============================================="