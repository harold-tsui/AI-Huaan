# BASB 系统部署指南

## 目录

1. [概述](#概述)
2. [部署架构](#部署架构)
3. [环境要求](#环境要求)
4. [部署流程](#部署流程)
   - [测试环境部署](#测试环境部署)
   - [生产环境部署](#生产环境部署)
5. [配置管理](#配置管理)
6. [数据库设置](#数据库设置)
7. [服务启动与停止](#服务启动与停止)
8. [监控与日志](#监控与日志)
9. [备份与恢复](#备份与恢复)
10. [故障排除](#故障排除)
11. [安全注意事项](#安全注意事项)
12. [维护计划](#维护计划)

## 概述

本文档提供了 BASB (Building a Second Brain) 系统的完整部署指南，包括测试环境和生产环境的部署步骤、配置管理、监控设置以及维护计划。BASB 系统基于 MCP (Microservice Communication Protocol) 架构，由多个原子服务组成，通过 MCP 协议进行通信。

## 部署架构

### 系统架构概览

BASB 系统采用微服务架构，主要包含以下组件：

- **核心服务**：
  - 知识图谱服务 (Knowledge Graph Service)
  - 文档处理服务 (Document Processor Service)
  - 搜索服务 (Search Service)
  - AI 服务 (AI Service)
  - 存储服务 (Storage Service)

- **基础设施**：
  - MongoDB（数据存储）
  - Redis（缓存和会话管理）
  - Node.js 运行时

- **MCP 通信层**：
  - MCP 协议实现
  - 服务注册与发现
  - 请求路由

### 部署拓扑

#### 测试环境

测试环境采用单机部署模式，所有服务部署在同一台服务器上：

```
+----------------------------------+
|            测试服务器              |
|                                  |
|  +------------+  +------------+  |
|  |  BASB 应用  |  |  MongoDB  |  |
|  +------------+  +------------+  |
|                                  |
|  +------------+  +------------+  |
|  |   Redis    |  |   日志系统  |  |
|  +------------+  +------------+  |
|                                  |
+----------------------------------+
```

#### 生产环境

生产环境采用分布式部署模式，各服务可以部署在不同的服务器上：

```
+------------------+    +------------------+    +------------------+
|   应用服务器 1     |    |   应用服务器 2     |    |   应用服务器 3     |
|                  |    |                  |    |                  |
| +-------------+  |    | +-------------+  |    | +-------------+  |
| | 知识图谱服务   |  |    | | 文档处理服务  |  |    | |  搜索服务    |  |
| +-------------+  |    | +-------------+  |    | +-------------+  |
|                  |    |                  |    |                  |
| +-------------+  |    | +-------------+  |    | +-------------+  |
| |   AI 服务    |  |    | |  存储服务    |  |    | |  MCP 路由   |  |
| +-------------+  |    | +-------------+  |    | +-------------+  |
+------------------+    +------------------+    +------------------+
          |                      |                       |
          |                      |                       |
          v                      v                       v
+------------------+    +------------------+    +------------------+
|   数据库服务器     |    |   缓存服务器      |    |   监控服务器      |
|                  |    |                  |    |                  |
| +-------------+  |    | +-------------+  |    | +-------------+  |
| |   MongoDB   |  |    | |    Redis    |  |    | |  监控系统    |  |
| +-------------+  |    | +-------------+  |    | +-------------+  |
|                  |    |                  |    |                  |
| +-------------+  |    |                  |    | +-------------+  |
| |  数据备份    |  |    |                  |    | |  日志系统    |  |
| +-------------+  |    |                  |    | +-------------+  |
+------------------+    +------------------+    +------------------+
```

## 环境要求

### 硬件要求

#### 测试环境

- **CPU**: 4 核或更多
- **内存**: 8GB 或更多
- **磁盘空间**: 20GB 可用空间
- **网络**: 100Mbps 或更高

#### 生产环境

- **应用服务器**:
  - CPU: 8 核或更多
  - 内存: 16GB 或更多
  - 磁盘空间: 50GB 可用空间
  - 网络: 1Gbps 或更高

- **数据库服务器**:
  - CPU: 8 核或更多
  - 内存: 32GB 或更多
  - 磁盘空间: 100GB 可用空间 (SSD 推荐)
  - 网络: 1Gbps 或更高

- **缓存服务器**:
  - CPU: 4 核或更多
  - 内存: 16GB 或更多
  - 磁盘空间: 20GB 可用空间
  - 网络: 1Gbps 或更高

### 软件要求

- **操作系统**: Ubuntu 20.04 LTS 或更高版本，CentOS 8 或更高版本
- **Node.js**: v18.x 或更高版本
- **npm**: v8.x 或更高版本
- **Docker**: 20.10.x 或更高版本
- **Docker Compose**: v2.x 或更高版本
- **MongoDB**: v6.x
- **Redis**: v7.x
- **Nginx**: v1.18.x 或更高版本 (生产环境)

## 部署流程

### 测试环境部署

#### 1. 准备工作

1. **安装基础软件**:
   ```bash
   # 安装 Node.js 和 npm
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # 安装 Docker 和 Docker Compose
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose
   sudo systemctl enable docker
   sudo systemctl start docker
   sudo usermod -aG docker $USER
   ```

2. **克隆代码库**:
   ```bash
   git clone <repository-url>
   cd basb-system
   ```

#### 2. 配置测试环境

1. **设置环境变量**:
   ```bash
   cp .env.example .env.test
   # 编辑 .env.test 文件，设置适当的测试环境变量
   ```

2. **安装依赖**:
   ```bash
   npm ci
   ```

3. **运行测试环境设置脚本**:
   ```bash
   ./scripts/setup-test-env.sh
   ```

#### 3. 启动数据库服务

```bash
# 启动 MongoDB 和 Redis
./scripts/start-db-services.sh
```

#### 4. 构建和启动应用

```bash
# 构建应用
npm run build

# 启动应用（测试模式）
NODE_ENV=test npm start
```

#### 5. 验证部署

```bash
# 运行测试以验证部署
npm test

# 检查服务状态
./scripts/check-test-env-status.sh
```

### 生产环境部署

#### 1. 准备工作

1. **设置服务器**:
   - 配置防火墙
   - 设置 SSH 密钥认证
   - 更新系统软件包

2. **安装基础软件**:
   ```bash
   # 安装 Node.js 和 npm
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # 安装 Docker 和 Docker Compose
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose
   sudo systemctl enable docker
   sudo systemctl start docker
   
   # 安装 Nginx
   sudo apt-get install -y nginx
   sudo systemctl enable nginx
   sudo systemctl start nginx
   ```

#### 2. 部署应用

1. **克隆代码库**:
   ```bash
   git clone <repository-url>
   cd basb-system
   git checkout v1.0.0  # 使用特定版本
   ```

2. **配置生产环境**:
   ```bash
   cp .env.example .env.production
   # 编辑 .env.production 文件，设置适当的生产环境变量
   ```

3. **安装依赖并构建**:
   ```bash
   npm ci --production
   npm run build
   ```

#### 3. 使用 Docker Compose 部署

1. **创建 Docker Compose 配置**:
   ```bash
   cp docker-compose.example.yml docker-compose.production.yml
   # 编辑 docker-compose.production.yml 文件，设置适当的配置
   ```

2. **启动服务**:
   ```bash
   docker-compose -f docker-compose.production.yml up -d
   ```

#### 4. 配置 Nginx 反向代理

1. **创建 Nginx 配置文件**:
   ```bash
   sudo nano /etc/nginx/sites-available/basb
   ```

2. **添加以下配置**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **启用站点并重启 Nginx**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/basb /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

#### 5. 设置 SSL 证书 (推荐)

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com
```

#### 6. 验证部署

```bash
# 检查服务状态
docker-compose -f docker-compose.production.yml ps

# 检查应用日志
docker-compose -f docker-compose.production.yml logs -f app
```

## 5. 配置管理

BASB 系统的配置主要通过环境变量进行管理。在部署之前，请确保已正确设置以下环境变量：

### Obsidian 配置

Obsidian 作为核心的知识图谱基础层，需要以下环境变量进行配置：

- `OBSIDIAN_VAULT_PATH`: 指定 Obsidian Vault 在文件系统中的绝对路径。
- `OBSIDIAN_API_KEY`: (可选) 如果您的 Obsidian 设置了需要 API 密钥的插件（例如 Local REST API 插件），请在此处提供密钥。
- `OBSIDIAN_API_URL`: (可选) 如果 Obsidian 通过插件（如 Local REST API）暴露了本地 API 服务，请指定其 URL，例如 `http://localhost:27123`。
- `OBSIDIAN_VAULT_NAME`: 指定您的 Obsidian Vault 的名称，用于在系统中标识和引用。

### 其他核心服务配置 (示例)

```

## 数据库设置

### MongoDB 设置

#### 创建数据库和用户

```javascript
// 连接到 MongoDB
use basb

// 创建管理员用户
db.createUser({
  user: "basb_admin",
  pwd: "your-secure-password",
  roles: [{ role: "dbOwner", db: "basb" }]
})

// 创建只读用户（用于报表和监控）
db.createUser({
  user: "basb_readonly",
  pwd: "your-readonly-password",
  roles: [{ role: "read", db: "basb" }]
})
```

#### 索引创建

```javascript
// 创建索引
db.knowledge_items.createIndex({ "title": "text", "content": "text" })
db.knowledge_items.createIndex({ "tags": 1 })
db.knowledge_items.createIndex({ "created_at": 1 })
db.knowledge_items.createIndex({ "updated_at": 1 })
```

### Redis 设置

#### 配置 Redis 持久化

编辑 Redis 配置文件 (`redis.conf`)：

```
# 启用 AOF 持久化
appendonly yes
appendfsync everysec

# 设置最大内存和淘汰策略
maxmemory 2gb
maxmemory-policy allkeys-lru
```

## 服务启动与停止

### 使用 Docker Compose

```bash
# 启动所有服务
docker-compose -f docker-compose.production.yml up -d

# 停止所有服务
docker-compose -f docker-compose.production.yml down

# 重启特定服务
docker-compose -f docker-compose.production.yml restart app

# 查看服务日志
docker-compose -f docker-compose.production.yml logs -f
```

### 使用 PM2 (直接部署方式)

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js --env production

# 停止应用
pm2 stop ecosystem.config.js

# 重启应用
pm2 restart ecosystem.config.js

# 查看日志
pm2 logs
```

## 监控与日志

### 日志管理

BASB 系统使用 Winston 进行日志记录，日志文件位于 `logs/` 目录：

- 应用日志: `logs/app.log`
- 错误日志: `logs/error.log`
- 访问日志: `logs/access.log`

### 监控设置

#### 使用 Prometheus 和 Grafana

1. **安装 Prometheus**:
   ```bash
   docker run -d --name prometheus -p 9090:9090 -v /path/to/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus
   ```

2. **安装 Grafana**:
   ```bash
   docker run -d --name grafana -p 3000:3000 grafana/grafana
   ```

3. **配置 Prometheus 抓取目标** (`prometheus.yml`):
   ```yaml
   global:
     scrape_interval: 15s
   
   scrape_configs:
     - job_name: 'basb'
       static_configs:
         - targets: ['localhost:3000']
   ```

4. **在 Grafana 中添加 Prometheus 数据源并创建仪表板**

## 备份与恢复

### 数据库备份

#### MongoDB 备份

```bash
# 创建备份脚本
cat > /usr/local/bin/backup-mongodb.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/mongodb"
DATETIME=$(date +%Y%m%d_%H%M%S)
MONGODUMP_PATH=$(which mongodump)
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_DB="basb"

mkdir -p $BACKUP_DIR

$MONGODUMP_PATH --host $MONGO_HOST --port $MONGO_PORT --db $MONGO_DB --out $BACKUP_DIR/$DATETIME

# 压缩备份
tar -zcvf $BACKUP_DIR/mongodb_$DATETIME.tar.gz -C $BACKUP_DIR $DATETIME
rm -rf $BACKUP_DIR/$DATETIME

# 保留最近 7 天的备份
find $BACKUP_DIR -name "mongodb_*.tar.gz" -type f -mtime +7 -delete
EOF

# 设置执行权限
chmod +x /usr/local/bin/backup-mongodb.sh

# 添加到 crontab
echo "0 2 * * * /usr/local/bin/backup-mongodb.sh" | sudo tee -a /etc/crontab
```

#### Redis 备份

```bash
# 创建备份脚本
cat > /usr/local/bin/backup-redis.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/redis"
DATETIME=$(date +%Y%m%d_%H%M%S)
REDIS_CLI_PATH=$(which redis-cli)
REDIS_HOST="localhost"
REDIS_PORT="6379"

mkdir -p $BACKUP_DIR

$REDIS_CLI_PATH -h $REDIS_HOST -p $REDIS_PORT --rdb $BACKUP_DIR/redis_$DATETIME.rdb

# 保留最近 7 天的备份
find $BACKUP_DIR -name "redis_*.rdb" -type f -mtime +7 -delete
EOF

# 设置执行权限
chmod +x /usr/local/bin/backup-redis.sh

# 添加到 crontab
echo "0 2 * * * /usr/local/bin/backup-redis.sh" | sudo tee -a /etc/crontab
```

### 数据恢复

#### MongoDB 恢复

```bash
# 解压备份
tar -zxvf /var/backups/mongodb/mongodb_20230101_020000.tar.gz -C /tmp

# 恢复数据
mongorestore --host localhost --port 27017 --db basb /tmp/20230101_020000/basb
```

#### Redis 恢复

```bash
# 停止 Redis 服务
sudo systemctl stop redis

# 复制 RDB 文件到 Redis 数据目录
sudo cp /var/backups/redis/redis_20230101_020000.rdb /var/lib/redis/dump.rdb
sudo chown redis:redis /var/lib/redis/dump.rdb

# 启动 Redis 服务
sudo systemctl start redis
```

## 故障排除

### 常见问题

#### 应用无法启动

1. **检查环境变量**:
   ```bash
   cat .env.production
   ```

2. **检查日志**:
   ```bash
   tail -n 100 logs/error.log
   ```

3. **检查端口占用**:
   ```bash
   netstat -tulpn | grep 3000
   ```

#### 数据库连接问题

1. **检查 MongoDB 连接**:
   ```bash
   mongo mongodb://localhost:27017/basb
   ```

2. **检查 Redis 连接**:
   ```bash
   redis-cli ping
   ```

#### 性能问题

1. **检查系统资源**:
   ```bash
   top
   df -h
   free -m
   ```

2. **检查应用性能**:
   ```bash
   pm2 monit
   ```

### 日志分析

使用 ELK 栈 (Elasticsearch, Logstash, Kibana) 进行日志分析：

```bash
# 安装 ELK 栈
docker-compose -f elk-stack.yml up -d
```

## 安全注意事项

### 网络安全

1. **配置防火墙**:
   ```bash
   # 允许 SSH、HTTP、HTTPS
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   
   # 启用防火墙
   sudo ufw enable
   ```

2. **设置 HTTPS**:
   使用 Let's Encrypt 获取 SSL 证书，并配置 Nginx 使用 HTTPS。

### 应用安全

1. **保护敏感信息**:
   - 使用环境变量存储敏感信息
   - 不要在代码中硬编码密钥和密码

2. **定期更新依赖**:
   ```bash
   npm audit
   npm update
   ```

3. **限制 API 访问**:
   - 使用 JWT 进行身份验证
   - 实施速率限制
   - 使用 CORS 限制跨域请求

## 维护计划

### 日常维护

1. **监控系统状态**:
   - 检查服务状态
   - 监控资源使用情况
   - 分析日志文件

2. **备份数据**:
   - 每日自动备份数据库
   - 定期验证备份的有效性

### 定期维护

1. **每周维护**:
   - 检查日志文件大小并轮换
   - 更新系统软件包

2. **每月维护**:
   - 更新应用依赖
   - 检查安全漏洞
   - 优化数据库性能

3. **季度维护**:
   - 全面系统审查
   - 性能测试和优化
   - 更新文档