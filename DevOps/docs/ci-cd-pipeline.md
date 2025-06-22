# BASB 系统 CI/CD 流水线配置指南

## 目录

- [BASB 系统 CI/CD 流水线配置指南](#basb-系统-cicd-流水线配置指南)
  - [目录](#目录)
  - [概述](#概述)
  - [CI/CD 架构](#cicd-架构)
  - [工具链](#工具链)
  - [流水线阶段](#流水线阶段)
  - [配置文件](#配置文件)
    - [GitHub Actions 配置](#github-actions-配置)
    - [Jenkins 配置](#jenkins-配置)
  - [环境配置](#环境配置)
    - [测试环境](#测试环境)
    - [生产环境](#生产环境)
  - [部署策略](#部署策略)
    - [蓝绿部署](#蓝绿部署)
    - [金丝雀部署](#金丝雀部署)
  - [监控与反馈](#监控与反馈)
    - [部署监控](#部署监控)
    - [告警配置](#告警配置)
    - [反馈渠道](#反馈渠道)
  - [回滚策略](#回滚策略)
    - [自动回滚](#自动回滚)
    - [手动回滚](#手动回滚)
  - [安全考虑](#安全考虑)
    - [凭证管理](#凭证管理)
    - [安全扫描](#安全扫描)
  - [最佳实践](#最佳实践)
    - [版本管理](#版本管理)
    - [环境一致性](#环境一致性)
    - [持续改进](#持续改进)

## 概述

本文档详细说明了 BASB (Building a Second Brain) 系统的 CI/CD 流水线配置，包括持续集成、持续测试和持续部署的完整流程。通过自动化的 CI/CD 流程，我们可以确保代码质量、减少手动错误，并加速交付周期。

## CI/CD 架构

BASB 系统的 CI/CD 流水线采用以下架构：

```
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  代码仓库       |---->|  CI 服务器      |---->|  CD 服务器      |
|  (GitHub)      |     |  (GitHub       |     |  (Jenkins/    |
|                |     |   Actions)     |     |   ArgoCD)     |
+----------------+     +----------------+     +----------------+
                              |                      |
                              v                      v
                       +----------------+    +----------------+
                       |                |    |                |
                       |  测试环境       |    |  生产环境       |
                       |                |    |                |
                       +----------------+    +----------------+
```

## 工具链

BASB 系统的 CI/CD 流水线使用以下工具：

- **版本控制**: GitHub
- **CI 工具**: GitHub Actions
- **CD 工具**: Jenkins / ArgoCD
- **容器化**: Docker, Docker Compose
- **测试框架**: Jest
- **代码质量**: ESLint, SonarQube
- **安全扫描**: OWASP Dependency Check, Snyk
- **制品仓库**: Docker Hub / GitHub Container Registry
- **配置管理**: Ansible
- **监控**: Prometheus, Grafana

## 流水线阶段

BASB 系统的 CI/CD 流水线包含以下阶段：

1. **代码提交**
   - 开发人员提交代码到 GitHub 仓库
   - 触发 GitHub Actions 工作流

2. **代码检查**
   - 静态代码分析 (ESLint)
   - 代码格式检查
   - 安全漏洞扫描

3. **构建**
   - 安装依赖
   - 编译代码
   - 构建 Docker 镜像

4. **测试**
   - 单元测试
   - 集成测试
   - 端到端测试

5. **制品发布**
   - 推送 Docker 镜像到制品仓库
   - 生成版本标签

6. **部署到测试环境**
   - 拉取最新镜像
   - 更新测试环境配置
   - 部署到测试环境

7. **测试环境验证**
   - 运行冒烟测试
   - 执行自动化验收测试

8. **部署到生产环境**
   - 拉取已验证的镜像
   - 更新生产环境配置
   - 部署到生产环境

9. **生产环境验证**
   - 运行冒烟测试
   - 监控系统健康状态

## 配置文件

### GitHub Actions 配置

以下是 BASB 系统的 GitHub Actions 工作流配置文件 (`.github/workflows/ci.yml`)：

```yaml
name: BASB CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017
      redis:
        image: redis:7
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint code
        run: npm run lint
      
      - name: Run tests
        run: npm test
        env:
          NODE_ENV: test
          MONGODB_URI: mongodb://localhost:27017/basb_test
          REDIS_URL: redis://localhost:6379
      
      - name: Upload test coverage
        uses: actions/upload-artifact@v3
        with:
          name: coverage
          path: coverage/
  
  build:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            yourusername/basb:${{ github.sha }}
            yourusername/basb:latest
      
      - name: Save image digest
        run: echo "IMAGE_DIGEST=${{ steps.docker_build.outputs.digest }}" >> $GITHUB_ENV
  
  deploy-test:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to test environment
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.TEST_SERVER_HOST }}
          username: ${{ secrets.TEST_SERVER_USERNAME }}
          key: ${{ secrets.TEST_SERVER_SSH_KEY }}
          script: |
            cd /opt/basb
            docker-compose pull
            docker-compose up -d
            docker image prune -f
      
      - name: Run smoke tests
        run: |
          sleep 30  # Wait for services to start
          curl -f http://${{ secrets.TEST_SERVER_HOST }}:3000/health
  
  deploy-prod:
    needs: [build, deploy-test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production environment
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_SERVER_HOST }}
          username: ${{ secrets.PROD_SERVER_USERNAME }}
          key: ${{ secrets.PROD_SERVER_SSH_KEY }}
          script: |
            cd /opt/basb
            docker-compose pull
            docker-compose up -d
            docker image prune -f
      
      - name: Run smoke tests
        run: |
          sleep 30  # Wait for services to start
          curl -f http://${{ secrets.PROD_SERVER_HOST }}:3000/health
```

### Jenkins 配置

以下是 BASB 系统的 Jenkins 流水线配置文件 (`Jenkinsfile`)：

```groovy
pipeline {
    agent {
        docker {
            image 'node:18'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }
    
    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        IMAGE_NAME = 'basb'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    junit 'test-results/*.xml'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
                sh "docker build -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }
        
        stage('Push') {
            steps {
                withCredentials([string(credentialsId: 'docker-registry-token', variable: 'DOCKER_TOKEN')]) {
                    sh "docker login -u username -p ${DOCKER_TOKEN} ${DOCKER_REGISTRY}"
                    sh "docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker tag ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest"
                    sh "docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest"
                }
            }
        }
        
        stage('Deploy to Test') {
            when {
                branch 'develop'
            }
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'test-server-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                    sh '''
                        ssh -i $SSH_KEY user@test-server.com << EOF
                        cd /opt/basb
                        docker-compose pull
                        docker-compose up -d
                        docker image prune -f
                        EOF
                    '''
                }
            }
        }
        
        stage('Integration Tests') {
            when {
                branch 'develop'
            }
            steps {
                sh 'npm run test:integration'
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
                withCredentials([sshUserPrivateKey(credentialsId: 'prod-server-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                    sh '''
                        ssh -i $SSH_KEY user@prod-server.com << EOF
                        cd /opt/basb
                        docker-compose pull
                        docker-compose up -d
                        docker image prune -f
                        EOF
                    '''
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            slackSend(color: 'good', message: "Build Successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}")
        }
        failure {
            slackSend(color: 'danger', message: "Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}")
        }
    }
}
```

## 环境配置

### 测试环境

测试环境配置文件 (`docker-compose.test.yml`)：

```yaml
version: '3.8'

services:
  app:
    image: yourusername/basb:latest
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=test
      - PORT=3000
      - MONGODB_URI=mongodb://mongodb:27017/basb
      - REDIS_URL=redis://redis:6379
      - LOG_LEVEL=info
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:6
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  redis_data:
```

### 生产环境

生产环境配置文件 (`docker-compose.production.yml`)：

```yaml
version: '3.8'

services:
  app:
    image: yourusername/basb:latest
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URI=mongodb://mongodb:27017/basb
      - REDIS_URL=redis://redis:6379
      - LOG_LEVEL=info
    depends_on:
      - mongodb
      - redis
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      restart_policy:
        condition: on-failure
        max_attempts: 3
        window: 120s
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  mongodb:
    image: mongo:6
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    deploy:
      restart_policy:
        condition: on-failure
        max_attempts: 3
        window: 120s

  redis:
    image: redis:7
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    deploy:
      restart_policy:
        condition: on-failure
        max_attempts: 3
        window: 120s

volumes:
  mongodb_data:
  redis_data:
```

## 部署策略

BASB 系统采用以下部署策略：

### 蓝绿部署

蓝绿部署通过维护两个相同的生产环境（蓝色和绿色），实现零停机部署：

1. 当前活动环境为蓝色环境
2. 将新版本部署到绿色环境
3. 运行测试确保绿色环境正常工作
4. 将流量从蓝色环境切换到绿色环境
5. 如果发现问题，可以立即切回蓝色环境

蓝绿部署脚本 (`scripts/blue-green-deploy.sh`)：

```bash
#!/bin/bash

# 蓝绿部署脚本

set -e

# 配置
APP_NAME="basb"
IMAGE_NAME="yourusername/basb"
IMAGE_TAG="$1"
BLUE_PORT=3000
GREEN_PORT=3001
HEALTH_CHECK_PATH="/health"
HEALTH_CHECK_TIMEOUT=60

# 确定当前活动环境
ACTIVE_PORT=$(curl -s http://localhost:8080/active-env)
if [ "$ACTIVE_PORT" == "$BLUE_PORT" ]; then
    ACTIVE_ENV="blue"
    INACTIVE_ENV="green"
    INACTIVE_PORT=$GREEN_PORT
else
    ACTIVE_ENV="green"
    INACTIVE_ENV="blue"
    INACTIVE_PORT=$BLUE_PORT
fi

echo "当前活动环境: $ACTIVE_ENV ($ACTIVE_PORT)"
echo "目标部署环境: $INACTIVE_ENV ($INACTIVE_PORT)"

# 部署到非活动环境
echo "正在部署到 $INACTIVE_ENV 环境..."
docker-compose -f docker-compose.$INACTIVE_ENV.yml down
IMAGE_TAG=$IMAGE_TAG docker-compose -f docker-compose.$INACTIVE_ENV.yml up -d

# 等待服务启动
echo "等待服务启动..."
start_time=$(date +%s)
while true; do
    current_time=$(date +%s)
    elapsed=$((current_time - start_time))
    
    if [ $elapsed -gt $HEALTH_CHECK_TIMEOUT ]; then
        echo "健康检查超时，回滚部署"
        docker-compose -f docker-compose.$INACTIVE_ENV.yml down
        exit 1
    fi
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$INACTIVE_PORT$HEALTH_CHECK_PATH || echo "000")
    
    if [ "$status_code" == "200" ]; then
        echo "服务已启动并通过健康检查"
        break
    fi
    
    echo "等待服务启动... ($elapsed 秒)"
    sleep 5
done

# 切换流量
echo "切换流量到 $INACTIVE_ENV 环境..."
curl -X POST http://localhost:8080/switch-env?env=$INACTIVE_ENV

# 验证切换成功
new_active_port=$(curl -s http://localhost:8080/active-env)
if [ "$new_active_port" != "$INACTIVE_PORT" ]; then
    echo "切换失败，回滚到 $ACTIVE_ENV 环境"
    curl -X POST http://localhost:8080/switch-env?env=$ACTIVE_ENV
    exit 1
fi

echo "部署成功，新的活动环境: $INACTIVE_ENV ($INACTIVE_PORT)"
```

### 金丝雀部署

金丝雀部署通过逐步将流量路由到新版本，实现风险可控的部署：

1. 部署新版本的应用，但不接收流量
2. 将少量流量（如 5%）路由到新版本
3. 监控新版本的性能和错误率
4. 如果一切正常，逐步增加流量比例
5. 最终将所有流量路由到新版本

金丝雀部署配置 (`nginx/canary.conf`)：

```nginx
upstream basb_stable {
    server 127.0.0.1:3000;
}

upstream basb_canary {
    server 127.0.0.1:3001;
}

map $cookie_canary $pool {
    default "stable";
    "true" "canary";
}

server {
    listen 80;
    server_name example.com;

    location / {
        # 5% 的流量路由到金丝雀版本
        if ($request_id ~ "^.{0,2}[0-4].*$") {
            add_header Set-Cookie "canary=true";
            proxy_pass http://basb_canary;
        }
        
        # 根据 cookie 决定路由
        if ($pool = "canary") {
            proxy_pass http://basb_canary;
        }
        
        # 默认路由到稳定版本
        proxy_pass http://basb_stable;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 监控与反馈

### 部署监控

BASB 系统使用 Prometheus 和 Grafana 监控部署过程和应用性能：

1. **部署指标**:
   - 部署频率
   - 部署持续时间
   - 部署成功率
   - 回滚次数

2. **应用指标**:
   - 请求响应时间
   - 错误率
   - 资源使用情况（CPU、内存）
   - 数据库查询性能

### 告警配置

Prometheus 告警配置 (`prometheus/alerts.yml`)：

```yaml
groups:
- name: basb-alerts
  rules:
  - alert: HighErrorRate
    expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: High error rate detected
      description: Error rate is above 5% for more than 1 minute.
  
  - alert: SlowResponseTime
    expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: Slow response time detected
      description: 95th percentile of response time is above 2 seconds for more than 5 minutes.
  
  - alert: HighCPUUsage
    expr: avg(rate(process_cpu_seconds_total[5m]) * 100) > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: High CPU usage detected
      description: CPU usage is above 80% for more than 5 minutes.
  
  - alert: HighMemoryUsage
    expr: process_resident_memory_bytes / process_heap_bytes > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: High memory usage detected
      description: Memory usage is above 80% for more than 5 minutes.
```

### 反馈渠道

BASB 系统使用以下渠道提供部署反馈：

1. **Slack 通知**:
   - 部署开始和完成
   - 测试结果
   - 告警触发

2. **电子邮件通知**:
   - 部署摘要
   - 重大问题

3. **仪表板**:
   - Grafana 仪表板显示实时指标
   - Jenkins/GitHub Actions 构建状态

## 回滚策略

### 自动回滚

在以下情况下，BASB 系统会自动回滚部署：

1. 部署后健康检查失败
2. 错误率突然增加
3. 响应时间显著增加

自动回滚脚本 (`scripts/auto-rollback.sh`)：

```bash
#!/bin/bash

# 自动回滚脚本

set -e

# 配置
APP_NAME="basb"
PREVIOUS_VERSION="$1"
HEALTH_CHECK_PATH="/health"
HEALTH_CHECK_TIMEOUT=60

echo "开始回滚到版本 $PREVIOUS_VERSION..."

# 部署上一个版本
IMAGE_TAG=$PREVIOUS_VERSION docker-compose -f docker-compose.production.yml up -d

# 等待服务启动
echo "等待服务启动..."
start_time=$(date +%s)
while true; do
    current_time=$(date +%s)
    elapsed=$((current_time - start_time))
    
    if [ $elapsed -gt $HEALTH_CHECK_TIMEOUT ]; then
        echo "健康检查超时，回滚失败"
        exit 1
    fi
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000$HEALTH_CHECK_PATH || echo "000")
    
    if [ "$status_code" == "200" ]; then
        echo "服务已启动并通过健康检查"
        break
    fi
    
    echo "等待服务启动... ($elapsed 秒)"
    sleep 5
done

echo "回滚成功，当前版本: $PREVIOUS_VERSION"
```

### 手动回滚

手动回滚流程：

1. 登录到 Jenkins/GitHub Actions
2. 选择上一个成功的构建
3. 点击"重新部署"按钮
4. 确认回滚操作

## 安全考虑

### 凭证管理

BASB 系统使用以下方法管理 CI/CD 流水线中的凭证：

1. **GitHub Secrets**:
   - 存储 Docker Hub 凭证
   - 存储 SSH 密钥
   - 存储 API 密钥

2. **Jenkins Credentials**:
   - 使用 Jenkins Credentials Plugin 管理凭证
   - 凭证仅在需要时注入到构建环境

### 安全扫描

BASB 系统在 CI/CD 流水线中集成以下安全扫描：

1. **依赖扫描**:
   - OWASP Dependency Check
   - Snyk

2. **容器扫描**:
   - Trivy
   - Docker Bench for Security

3. **代码扫描**:
   - SonarQube
   - ESLint 安全规则

## 最佳实践

### 版本管理

BASB 系统使用以下版本管理策略：

1. **语义化版本**:
   - 主版本号：不兼容的 API 变更
   - 次版本号：向后兼容的功能性新增
   - 修订号：向后兼容的问题修正

2. **分支策略**:
   - `main`: 生产环境代码
   - `develop`: 开发环境代码
   - `feature/*`: 新功能开发
   - `bugfix/*`: 错误修复
   - `release/*`: 发布准备

### 环境一致性

确保环境一致性的方法：

1. **容器化**:
   - 使用 Docker 容器确保环境一致性
   - 使用相同的基础镜像

2. **配置管理**:
   - 使用环境变量管理配置
   - 使用配置文件模板

3. **基础设施即代码**:
   - 使用 Terraform 管理云资源
   - 使用 Ansible 配置服务器

### 持续改进

BASB 系统的 CI/CD 流水线持续改进策略：

1. **指标收集**:
   - 部署频率
   - 变更前置时间
   - 平均恢复时间
   - 变更失败率

2. **定期审查**:
   - 每月审查 CI/CD 流水线性能
   - 识别瓶颈和改进机会

3. **自动化扩展**:
   - 逐步增加自动化测试覆盖率
   - 扩展监控和告警范围