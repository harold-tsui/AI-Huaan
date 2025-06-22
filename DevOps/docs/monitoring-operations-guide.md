# BASB 系统监控与运维指南

## 目录

1. [概述](#概述)
2. [监控架构](#监控架构)
3. [监控指标](#监控指标)
   - [系统指标](#系统指标)
   - [应用指标](#应用指标)
   - [业务指标](#业务指标)
4. [监控工具配置](#监控工具配置)
   - [Prometheus 配置](#prometheus-配置)
   - [Grafana 仪表板](#grafana-仪表板)
   - [日志聚合](#日志聚合)
5. [告警系统](#告警系统)
   - [告警规则](#告警规则)
   - [告警通知](#告警通知)
   - [告警升级](#告警升级)
6. [日常运维](#日常运维)
   - [健康检查](#健康检查)
   - [性能优化](#性能优化)
   - [容量规划](#容量规划)
7. [故障处理](#故障处理)
   - [故障检测](#故障检测)
   - [故障分析](#故障分析)
   - [故障恢复](#故障恢复)
8. [备份与恢复](#备份与恢复)
9. [安全监控](#安全监控)
10. [运维自动化](#运维自动化)
11. [文档与知识库](#文档与知识库)

## 概述

本文档提供了 BASB (Building a Second Brain) 系统的监控与运维指南，包括监控架构、关键指标、告警配置、日常运维任务以及故障处理流程。通过实施本指南中的最佳实践，可以确保 BASB 系统的高可用性、高性能和高安全性。

## 监控架构

BASB 系统采用多层次的监控架构，覆盖从基础设施到应用层的各个方面：

```
+------------------+    +------------------+    +------------------+
|                  |    |                  |    |                  |
|  基础设施监控     |    |   应用监控       |    |   业务监控       |
|  (服务器、网络)   |    |  (服务、API)     |    | (用户行为、指标)  |
|                  |    |                  |    |                  |
+------------------+    +------------------+    +------------------+
          |                      |                       |
          v                      v                       v
+------------------------------------------------------------------+
|                                                                  |
|                          监控数据收集层                           |
|                     (Prometheus, Fluentd)                        |
|                                                                  |
+------------------------------------------------------------------+
                                 |
                                 v
+------------------------------------------------------------------+
|                                                                  |
|                          监控数据存储层                           |
|                  (Prometheus, Elasticsearch)                     |
|                                                                  |
+------------------------------------------------------------------+
                                 |
                                 v
+------------------+    +------------------+    +------------------+
|                  |    |                  |    |                  |
|    可视化展示     |    |     告警系统     |    |    报表系统      |
|    (Grafana)     |    | (AlertManager)  |    |   (Grafana)     |
|                  |    |                  |    |                  |
+------------------+    +------------------+    +------------------+
```

## 监控指标

### 系统指标

#### 主机指标

| 指标名称 | 描述 | 阈值 | 收集方式 |
|---------|------|------|----------|
| CPU 使用率 | 服务器 CPU 使用百分比 | 警告: >70%<br>严重: >90% | node_exporter |
| 内存使用率 | 服务器内存使用百分比 | 警告: >80%<br>严重: >90% | node_exporter |
| 磁盘使用率 | 服务器磁盘使用百分比 | 警告: >75%<br>严重: >90% | node_exporter |
| 磁盘 I/O | 磁盘读写操作 | 警告: >80%<br>严重: >90% | node_exporter |
| 网络流量 | 网络接口流量 | 警告: >80%<br>严重: >90% | node_exporter |
| 系统负载 | 系统平均负载 | 警告: >CPU核心数<br>严重: >CPU核心数*1.5 | node_exporter |

#### 容器指标

| 指标名称 | 描述 | 阈值 | 收集方式 |
|---------|------|------|----------|
| 容器 CPU 使用率 | 容器 CPU 使用百分比 | 警告: >70%<br>严重: >90% | cAdvisor |
| 容器内存使用率 | 容器内存使用百分比 | 警告: >80%<br>严重: >90% | cAdvisor |
| 容器重启次数 | 容器重启次数 | 警告: >3/小时<br>严重: >10/小时 | cAdvisor |
| 容器网络 I/O | 容器网络流量 | 警告: >80%<br>严重: >90% | cAdvisor |

### 应用指标

#### 服务健康指标

| 指标名称 | 描述 | 阈值 | 收集方式 |
|---------|------|------|----------|
| 服务可用性 | 服务是否可用 | 警告: <99%<br>严重: <95% | Blackbox Exporter |
| 健康检查 | 健康检查接口状态 | 警告: 非200状态码<br>严重: 连续3次失败 | Blackbox Exporter |
| 服务响应时间 | 服务响应时间 | 警告: >500ms<br>严重: >1000ms | Blackbox Exporter |

#### API 指标

| 指标名称 | 描述 | 阈值 | 收集方式 |
|---------|------|------|----------|
| 请求速率 | 每秒请求数 | 警告: >1000/s<br>严重: >2000/s | 应用 Prometheus 客户端 |
| 错误率 | 错误请求百分比 | 警告: >1%<br>严重: >5% | 应用 Prometheus 客户端 |
| 响应时间 | API 响应时间 | 警告: >200ms<br>严重: >500ms | 应用 Prometheus 客户端 |
| 状态码分布 | HTTP 状态码分布 | 警告: 5xx>1%<br>严重: 5xx>5% | 应用 Prometheus 客户端 |

#### 数据库指标

| 指标名称 | 描述 | 阈值 | 收集方式 |
|---------|------|------|----------|
| 连接数 | 数据库连接数 | 警告: >80%<br>严重: >90% | MongoDB Exporter |
| 查询性能 | 查询响应时间 | 警告: >100ms<br>严重: >500ms | MongoDB Exporter |
| 索引使用率 | 索引命中率 | 警告: <90%<br>严重: <70% | MongoDB Exporter |
| 缓存命中率 | 缓存命中率 | 警告: <80%<br>严重: <60% | Redis Exporter |

### 业务指标

| 指标名称 | 描述 | 阈值 | 收集方式 |
|---------|------|------|----------|
| 活跃用户数 | 当前活跃用户数 | 信息性指标 | 应用 Prometheus 客户端 |
| 知识项创建率 | 每小时创建的知识项数量 | 信息性指标 | 应用 Prometheus 客户端 |
| 搜索请求数 | 每分钟搜索请求数 | 信息性指标 | 应用 Prometheus 客户端 |
| AI 处理时间 | AI 服务处理时间 | 警告: >2s<br>严重: >5s | 应用 Prometheus 客户端 |

## 监控工具配置

### Prometheus 配置

以下是 BASB 系统的 Prometheus 配置文件 (`prometheus.yml`)：

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
  - static_configs:
    - targets:
      - alertmanager:9093

rule_files:
  - "alerts.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb-exporter:9216']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'basb-app'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['app:3000']

  - job_name: 'basb-knowledge-graph'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['knowledge-graph:3001']

  - job_name: 'basb-document-processor'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['document-processor:3002']

  - job_name: 'basb-search'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['search:3003']

  - job_name: 'basb-ai'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['ai:3004']

  - job_name: 'blackbox'
    metrics_path: '/probe'
    params:
      module: [http_2xx]
    static_configs:
      - targets:
        - http://app:3000/health
        - http://knowledge-graph:3001/health
        - http://document-processor:3002/health
        - http://search:3003/health
        - http://ai:3004/health
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115
```

### Grafana 仪表板

BASB 系统使用以下 Grafana 仪表板：

1. **系统概览仪表板**：显示所有服务器和容器的关键指标
2. **应用性能仪表板**：显示应用服务的性能指标
3. **数据库性能仪表板**：显示 MongoDB 和 Redis 的性能指标
4. **业务指标仪表板**：显示业务相关的指标
5. **告警概览仪表板**：显示当前和历史告警

以下是系统概览仪表板的 JSON 配置示例：

```json
{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": "-- Grafana --",
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "gnetId": null,
  "graphTooltip": 0,
  "id": 1,
  "links": [],
  "panels": [
    {
      "aliasColors": {},
      "bars": false,
      "dashLength": 10,
      "dashes": false,
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {
          "custom": {}
        },
        "overrides": []
      },
      "fill": 1,
      "fillGradient": 0,
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 0
      },
      "hiddenSeries": false,
      "id": 2,
      "legend": {
        "avg": false,
        "current": false,
        "max": false,
        "min": false,
        "show": true,
        "total": false,
        "values": false
      },
      "lines": true,
      "linewidth": 1,
      "nullPointMode": "null",
      "options": {
        "alertThreshold": true
      },
      "percentage": false,
      "pluginVersion": "7.3.7",
      "pointradius": 2,
      "points": false,
      "renderer": "flot",
      "seriesOverrides": [],
      "spaceLength": 10,
      "stack": false,
      "steppedLine": false,
      "targets": [
        {
          "expr": "100 - (avg by (instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[1m])) * 100)",
          "interval": "",
          "legendFormat": "{{instance}}",
          "refId": "A"
        }
      ],
      "thresholds": [],
      "timeFrom": null,
      "timeRegions": [],
      "timeShift": null,
      "title": "CPU Usage",
      "tooltip": {
        "shared": true,
        "sort": 0,
        "value_type": "individual"
      },
      "type": "graph",
      "xaxis": {
        "buckets": null,
        "mode": "time",
        "name": null,
        "show": true,
        "values": []
      },
      "yaxes": [
        {
          "format": "percent",
          "label": null,
          "logBase": 1,
          "max": "100",
          "min": "0",
          "show": true
        },
        {
          "format": "short",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        }
      ],
      "yaxis": {
        "align": false,
        "alignLevel": null
      }
    },
    {
      "aliasColors": {},
      "bars": false,
      "dashLength": 10,
      "dashes": false,
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {
          "custom": {}
        },
        "overrides": []
      },
      "fill": 1,
      "fillGradient": 0,
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 12,
        "y": 0
      },
      "hiddenSeries": false,
      "id": 3,
      "legend": {
        "avg": false,
        "current": false,
        "max": false,
        "min": false,
        "show": true,
        "total": false,
        "values": false
      },
      "lines": true,
      "linewidth": 1,
      "nullPointMode": "null",
      "options": {
        "alertThreshold": true
      },
      "percentage": false,
      "pluginVersion": "7.3.7",
      "pointradius": 2,
      "points": false,
      "renderer": "flot",
      "seriesOverrides": [],
      "spaceLength": 10,
      "stack": false,
      "steppedLine": false,
      "targets": [
        {
          "expr": "node_memory_MemTotal_bytes - node_memory_MemFree_bytes - node_memory_Buffers_bytes - node_memory_Cached_bytes",
          "interval": "",
          "legendFormat": "{{instance}} - Used",
          "refId": "A"
        },
        {
          "expr": "node_memory_MemTotal_bytes",
          "interval": "",
          "legendFormat": "{{instance}} - Total",
          "refId": "B"
        }
      ],
      "thresholds": [],
      "timeFrom": null,
      "timeRegions": [],
      "timeShift": null,
      "title": "Memory Usage",
      "tooltip": {
        "shared": true,
        "sort": 0,
        "value_type": "individual"
      },
      "type": "graph",
      "xaxis": {
        "buckets": null,
        "mode": "time",
        "name": null,
        "show": true,
        "values": []
      },
      "yaxes": [
        {
          "format": "bytes",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": "0",
          "show": true
        },
        {
          "format": "short",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        }
      ],
      "yaxis": {
        "align": false,
        "alignLevel": null
      }
    }
  ],
  "refresh": "10s",
  "schemaVersion": 26,
  "style": "dark",
  "tags": [],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-6h",
    "to": "now"
  },
  "timepicker": {},
  "timezone": "",
  "title": "BASB System Overview",
  "uid": "basb-system-overview",
  "version": 1
}
```

### 日志聚合

BASB 系统使用 ELK 栈 (Elasticsearch, Logstash, Kibana) 进行日志聚合和分析：

#### Fluentd 配置

```xml
<source>
  @type forward
  port 24224
  bind 0.0.0.0
</source>

<filter **>
  @type parser
  key_name log
  reserve_data true
  <parse>
    @type json
    json_parser json
  </parse>
</filter>

<match **>
  @type elasticsearch
  host elasticsearch
  port 9200
  logstash_format true
  logstash_prefix basb
  <buffer>
    @type file
    path /var/log/fluentd-buffers/basb
    flush_mode interval
    retry_type exponential_backoff
    flush_thread_count 2
    flush_interval 5s
    retry_forever true
    retry_max_interval 30
    chunk_limit_size 2M
    queue_limit_length 8
    overflow_action block
  </buffer>
</match>
```

#### Kibana 仪表板

BASB 系统使用以下 Kibana 仪表板：

1. **应用日志概览**：显示所有应用服务的日志
2. **错误日志分析**：聚焦于错误和警告日志
3. **用户活动日志**：显示用户活动相关的日志
4. **性能日志**：显示性能相关的日志

## 告警系统

### 告警规则

BASB 系统使用以下 Prometheus 告警规则 (`alerts.yml`)：

```yaml
groups:
- name: basb-alerts
  rules:
  # 系统告警
  - alert: HighCPUUsage
    expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage detected (instance {{ $labels.instance }})"
      description: "CPU usage is above 80% for more than 5 minutes\n  VALUE = {{ $value }}\n  LABELS: {{ $labels }}"

  - alert: HighMemoryUsage
    expr: (node_memory_MemTotal_bytes - node_memory_MemFree_bytes - node_memory_Buffers_bytes - node_memory_Cached_bytes) / node_memory_MemTotal_bytes * 100 > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage detected (instance {{ $labels.instance }})"
      description: "Memory usage is above 80% for more than 5 minutes\n  VALUE = {{ $value }}\n  LABELS: {{ $labels }}"

  - alert: HighDiskUsage
    expr: 100 - ((node_filesystem_avail_bytes{mountpoint="/"} * 100) / node_filesystem_size_bytes{mountpoint="/"}) > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High disk usage detected (instance {{ $labels.instance }})"
      description: "Disk usage is above 85% for more than 5 minutes\n  VALUE = {{ $value }}\n  LABELS: {{ $labels }}"

  # 容器告警
  - alert: ContainerHighCPUUsage
    expr: sum(rate(container_cpu_usage_seconds_total{name!=""}[5m])) by (name) * 100 > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Container high CPU usage detected (container {{ $labels.name }})"
      description: "Container CPU usage is above 80% for more than 5 minutes\n  VALUE = {{ $value }}\n  LABELS: {{ $labels }}"

  - alert: ContainerHighMemoryUsage
    expr: sum(container_memory_usage_bytes{name!=""}) by (name) / sum(container_spec_memory_limit_bytes{name!=""}) by (name) * 100 > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Container high memory usage detected (container {{ $labels.name }})"
      description: "Container memory usage is above 80% for more than 5 minutes\n  VALUE = {{ $value }}\n  LABELS: {{ $labels }}"

  - alert: ContainerRestarting
    expr: changes(container_start_time_seconds{name!=""}[15m]) > 3
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Container restarting frequently (container {{ $labels.name }})"
      description: "Container has restarted more than 3 times in the last 15 minutes\n  VALUE = {{ $value }}\n  LABELS: {{ $labels }}"

  # 应用告警
  - alert: ServiceDown
    expr: probe_success == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Service down (instance {{ $labels.instance }})"
      description: "Service is down\n  VALUE = {{ $value }}\n  LABELS: {{ $labels }}"

  - alert: SlowResponseTime
    expr: probe_duration_seconds > 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Slow response time (instance {{ $labels.instance }})"
      description: "Response time is above 1 second for more than 5 minutes\n  VALUE = {{ $value }}\n  LABELS: {{ $labels }}"

  - alert: HighErrorRate
    expr: sum(rate(http_requests_total{status=~"5.."}[5m])) by (service) / sum(rate(http_requests_total[5m])) by (service) > 0.05
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High error rate detected (service {{ $labels.service }})"
      description: "Error rate is above 5% for more than 5 minutes\n  VALUE = {{ $value }}\n  LABELS: {{ $labels }}"

  # 数据库告警
  - alert: MongoDBHighConnections
    expr: mongodb_connections{state="current"} / mongodb_connections{state="available"} * 100 > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "MongoDB high connections (instance {{ $labels.instance }})"
      description: "MongoDB connections are above 80% for more than 5 minutes\n  VALUE = {{ $value }}\n  LABELS: {{ $labels }}"

  - alert: RedisHighMemoryUsage
    expr: redis_memory_used_bytes / redis_memory_max_bytes * 100 > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Redis high memory usage (instance {{ $labels.instance }})"
      description: "Redis memory usage is above 80% for more than 5 minutes\n  VALUE = {{ $value }}\n  LABELS: {{ $labels }}"
```

### 告警通知

BASB 系统使用 Alertmanager 发送告警通知，配置如下 (`alertmanager.yml`)：

```yaml
global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alertmanager@example.com'
  smtp_auth_username: 'alertmanager'
  smtp_auth_password: 'password'

route:
  group_by: ['alertname', 'job']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'team-email'
  routes:
  - match:
      severity: critical
    receiver: 'team-pager'
    continue: true

receivers:
- name: 'team-email'
  email_configs:
  - to: 'team@example.com'
    send_resolved: true

- name: 'team-pager'
  pagerduty_configs:
  - service_key: '<pagerduty-service-key>'
    send_resolved: true
  slack_configs:
  - api_url: '<slack-webhook-url>'
    channel: '#alerts'
    send_resolved: true

inhibit_rules:
- source_match:
    severity: 'critical'
  target_match:
    severity: 'warning'
  equal: ['alertname', 'instance']
```

### 告警升级

BASB 系统使用以下告警升级流程：

1. **第一级响应**：
   - 告警发送到团队邮件和 Slack 频道
   - 值班工程师确认告警并开始调查

2. **第二级响应**（如果 15 分钟内未解决）：
   - 告警升级到团队负责人
   - 通过 PagerDuty 发送短信通知

3. **第三级响应**（如果 30 分钟内未解决）：
   - 告警升级到系统架构师和管理层
   - 启动应急响应流程

## 日常运维

### 健康检查

BASB 系统使用以下健康检查脚本 (`scripts/health-check.sh`)：

```bash
#!/bin/bash

# BASB 系统健康检查脚本

set -e

# 配置
APP_URL="http://localhost:3000"
KNOWLEDGE_GRAPH_URL="http://localhost:3001"
DOCUMENT_PROCESSOR_URL="http://localhost:3002"
SEARCH_URL="http://localhost:3003"
AI_URL="http://localhost:3004"
MONGODB_HOST="localhost"
MONGODB_PORT="27017"
REDIS_HOST="localhost"
REDIS_PORT="6379"

# 颜色定义
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
NC="\033[0m" # No Color

# 显示帮助信息
show_help() {
    echo "BASB 系统故障恢复脚本"
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help              显示此帮助信息"
    echo "  -r, --restart           重启所有服务"
    echo "  -d, --restore-db        恢复数据库"
    echo "  -a, --restore-app       恢复应用"
    echo "  -c, --clean-logs        清理日志"
    echo "  -f, --full-recovery     执行完整恢复"
    echo "  -b, --backup-date DATE  指定备份日期 (格式: YYYYMMDD)"
    echo ""
    echo "示例:"
    echo "  $0 --restart            重启所有服务"
    echo "  $0 --restore-db         恢复数据库"
    echo "  $0 --full-recovery      执行完整恢复"
    echo "  $0 --restore-db --backup-date 20230101  从指定日期的备份恢复数据库"
}

# 重启服务
restart_services() {
    echo "重启服务..."
    
    # 检查 Docker 是否可用
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        echo "使用 Docker Compose 重启服务..."
        
        # 检查 docker-compose.yml 文件
        if [ -f "docker-compose.yml" ]; then
            docker-compose down
            docker-compose up -d
            echo -e "${GREEN}[✓] 服务已通过 Docker Compose 重启${NC}"
        else
            echo -e "${YELLOW}[!] 未找到 docker-compose.yml 文件${NC}"
            
            # 尝试重启单个容器
            echo "尝试重启单个 Docker 容器..."
            docker restart $(docker ps -q --filter "name=basb")
            echo -e "${GREEN}[✓] BASB 相关容器已重启${NC}"
        fi
    else
        echo "Docker 不可用，尝试使用 PM2 重启服务..."
        
        # 检查 PM2 是否可用
        if command -v pm2 &> /dev/null; then
            echo "使用 PM2 重启服务..."
            pm2 restart all
            echo -e "${GREEN}[✓] 服务已通过 PM2 重启${NC}"
        else
            echo -e "${YELLOW}[!] PM2 不可用${NC}"
            
            # 尝试使用系统服务重启
            echo "尝试使用系统服务重启..."
            if command -v systemctl &> /dev/null; then
                systemctl restart basb-app
                systemctl restart basb-knowledge-graph
                systemctl restart basb-document-processor
                systemctl restart basb-search
                systemctl restart basb-ai
                systemctl restart mongodb
                systemctl restart redis
                echo -e "${GREEN}[✓] 服务已通过 systemctl 重启${NC}"
            else
                echo -e "${RED}[✗] 无法重启服务，请手动重启${NC}"
            fi
        fi
    fi
}

# 恢复数据库
restore_database() {
    local backup_date=$1
    
    echo "恢复数据库..."
    
    # 检查备份目录
    if [ ! -d "$BACKUP_DIR" ]; then
        echo -e "${RED}[✗] 备份目录 $BACKUP_DIR 不存在${NC}"
        return 1
    fi
    
    # 确定备份文件
    local backup_file
    if [ -z "$backup_date" ]; then
        # 使用最新的备份
        backup_file=$(ls -t $BACKUP_DIR/mongodb_*.gz | head -1)
    else
        # 使用指定日期的备份
        backup_file="$BACKUP_DIR/mongodb_${backup_date}.gz"
    fi
    
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}[✗] 备份文件 $backup_file 不存在${NC}"
        return 1
    fi
    
    echo "使用备份文件: $backup_file"
    
    # 恢复 MongoDB 数据库
    if command -v mongorestore &> /dev/null; then
        echo "恢复 MongoDB 数据库..."
        
        # 创建临时目录
        local temp_dir=$(mktemp -d)
        
        # 解压备份文件
        gunzip -c $backup_file | tar -xf - -C $temp_dir
        
        # 恢复数据库
        mongorestore --host $MONGODB_HOST --port $MONGODB_PORT --db $MONGODB_DB --drop $temp_dir/$MONGODB_DB
        
        # 清理临时目录
        rm -rf $temp_dir
        
        echo -e "${GREEN}[✓] MongoDB 数据库已恢复${NC}"
    else
        echo -e "${RED}[✗] mongorestore 命令不可用，无法恢复 MongoDB 数据库${NC}"
        return 1
    fi
    
    # 恢复 Redis 数据库
    if command -v redis-cli &> /dev/null; then
        echo "恢复 Redis 数据库..."
        
        # 确定 Redis 备份文件
        local redis_backup_file
        if [ -z "$backup_date" ]; then
            # 使用最新的备份
            redis_backup_file=$(ls -t $BACKUP_DIR/redis_*.rdb | head -1)
        else
            # 使用指定日期的备份
            redis_backup_file="$BACKUP_DIR/redis_${backup_date}.rdb"
        fi
        
        if [ -f "$redis_backup_file" ]; then
            # 停止 Redis 服务
            if command -v systemctl &> /dev/null; then
                systemctl stop redis
            elif command -v docker &> /dev/null; then
                docker stop $(docker ps -q --filter "name=redis")
            fi
            
            # 复制备份文件到 Redis 数据目录
            cp $redis_backup_file /var/lib/redis/dump.rdb
            
            # 设置正确的权限
            chown redis:redis /var/lib/redis/dump.rdb
            
            # 启动 Redis 服务
            if command -v systemctl &> /dev/null; then
                systemctl start redis
            elif command -v docker &> /dev/null; then
                docker start $(docker ps -a -q --filter "name=redis")
            fi
            
            echo -e "${GREEN}[✓] Redis 数据库已恢复${NC}"
        else
            echo -e "${YELLOW}[!] Redis 备份文件不存在，跳过 Redis 恢复${NC}"
        fi
    else
        echo -e "${YELLOW}[!] redis-cli 命令不可用，跳过 Redis 恢复${NC}"
    fi
    
    return 0
}

# 恢复应用
restore_application() {
    local backup_date=$1
    
    echo "恢复应用..."
    
    # 检查备份目录
    if [ ! -d "$BACKUP_DIR" ]; then
        echo -e "${RED}[✗] 备份目录 $BACKUP_DIR 不存在${NC}"
        return 1
    fi
    
    # 确定备份文件
    local app_backup_file
    if [ -z "$backup_date" ]; then
        # 使用最新的备份
        app_backup_file=$(ls -t $BACKUP_DIR/app_*.tar.gz | head -1)
    else
        # 使用指定日期的备份
        app_backup_file="$BACKUP_DIR/app_${backup_date}.tar.gz"
    fi
    
    if [ ! -f "$app_backup_file" ]; then
        echo -e "${RED}[✗] 应用备份文件 $app_backup_file 不存在${NC}"
        return 1
    fi
    
    echo "使用备份文件: $app_backup_file"
    
    # 停止应用服务
    echo "停止应用服务..."
    if command -v docker-compose &> /dev/null && [ -f "docker-compose.yml" ]; then
        docker-compose down
    elif command -v pm2 &> /dev/null; then
        pm2 stop all
    elif command -v systemctl &> /dev/null; then
        systemctl stop basb-app
        systemctl stop basb-knowledge-graph
        systemctl stop basb-document-processor
        systemctl stop basb-search
        systemctl stop basb-ai
    fi
    
    # 备份当前应用目录
    echo "备份当前应用目录..."
    if [ -d "$APP_DIR" ]; then
        mv $APP_DIR ${APP_DIR}_backup_$(date +%Y%m%d%H%M%S)
    fi
    
    # 创建应用目录
    mkdir -p $APP_DIR
    
    # 解压备份文件
    echo "解压备份文件..."
    tar -xzf $app_backup_file -C $APP_DIR
    
    # 设置正确的权限
    chown -R $(whoami):$(whoami) $APP_DIR
    
    # 启动应用服务
    echo "启动应用服务..."
    if command -v docker-compose &> /dev/null && [ -f "$APP_DIR/docker-compose.yml" ]; then
        cd $APP_DIR && docker-compose up -d
    elif command -v pm2 &> /dev/null && [ -f "$APP_DIR/ecosystem.config.js" ]; then
        cd $APP_DIR && pm2 start ecosystem.config.js
    elif command -v systemctl &> /dev/null; then
        systemctl start basb-app
        systemctl start basb-knowledge-graph
        systemctl start basb-document-processor
        systemctl start basb-search
        systemctl start basb-ai
    fi
    
    echo -e "${GREEN}[✓] 应用已恢复${NC}"
    return 0
}

# 清理日志
clean_logs() {
    echo "清理日志..."
    
    # 检查日志目录
    if [ ! -d "$LOG_DIR" ]; then
        echo -e "${YELLOW}[!] 日志目录 $LOG_DIR 不存在${NC}"
        return 1
    fi
    
    # 压缩旧日志
    echo "压缩旧日志..."
    find $LOG_DIR -name "*.log" -type f -mtime +7 -exec gzip {} \;
    
    # 删除超过 30 天的压缩日志
    echo "删除超过 30 天的压缩日志..."
    find $LOG_DIR -name "*.gz" -type f -mtime +30 -delete
    
    # 清理 Docker 日志
    if command -v docker &> /dev/null; then
        echo "清理 Docker 日志..."
        docker system prune -f --volumes
    fi
    
    echo -e "${GREEN}[✓] 日志已清理${NC}"
    return 0
}

# 执行完整恢复
full_recovery() {
    local backup_date=$1
    
    echo "执行完整恢复..."
    
    # 恢复数据库
    restore_database $backup_date
    
    # 恢复应用
    restore_application $backup_date
    
    # 清理日志
    clean_logs
    
    # 重启服务
    restart_services
    
    echo -e "${GREEN}[✓] 完整恢复已完成${NC}"
    return 0
}

# 主函数
main() {
    # 解析命令行参数
    local RESTART=false
    local RESTORE_DB=false
    local RESTORE_APP=false
    local CLEAN_LOGS=false
    local FULL_RECOVERY=false
    local BACKUP_DATE=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -r|--restart)
                RESTART=true
                shift
                ;;
            -d|--restore-db)
                RESTORE_DB=true
                shift
                ;;
            -a|--restore-app)
                RESTORE_APP=true
                shift
                ;;
            -c|--clean-logs)
                CLEAN_LOGS=true
                shift
                ;;
            -f|--full-recovery)
                FULL_RECOVERY=true
                shift
                ;;
            -b|--backup-date)
                BACKUP_DATE=$2
                shift 2
                ;;
            *)
                echo "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 如果没有指定任何选项，显示帮助信息
    if [[ $RESTART == false && $RESTORE_DB == false && $RESTORE_APP == false && $CLEAN_LOGS == false && $FULL_RECOVERY == false ]]; then
        show_help
        exit 0
    fi
    
    echo "=== BASB 系统故障恢复 ($(date)) ==="
    
    # 执行操作
    if [[ $FULL_RECOVERY == true ]]; then
        full_recovery $BACKUP_DATE
    else
        if [[ $RESTORE_DB == true ]]; then
            restore_database $BACKUP_DATE
        fi
        
        if [[ $RESTORE_APP == true ]]; then
            restore_application $BACKUP_DATE
        fi
        
        if [[ $CLEAN_LOGS == true ]]; then
            clean_logs
        fi
        
        if [[ $RESTART == true ]]; then
            restart_services
        fi
    fi
    
    echo "=== 故障恢复完成 ==="
}

# 运行主函数
main "$@"
```

## 备份与恢复

BASB 系统使用以下备份脚本 (`scripts/backup.sh`)：

```bash
#!/bin/bash

# BASB 系统备份脚本

set -e

# 配置
BACKUP_DIR="/var/backups/basb"
MONGODB_HOST="localhost"
MONGODB_PORT="27017"
MONGODB_DB="basb"
REDIS_HOST="localhost"
REDIS_PORT="6379"
APP_DIR="/opt/basb"
RETENTION_DAYS=30
BACKUP_DATE=$(date +%Y%m%d)

# 颜色定义
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
NC="\033[0m" # No Color

# 显示帮助信息
show_help() {
    echo "BASB 系统备份脚本"
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help              显示此帮助信息"
    echo "  -f, --full              执行完整备份"
    echo "  -d, --database          仅备份数据库"
    echo "  -a, --app               仅备份应用"
    echo "  -c, --clean             清理旧备份"
    echo "  -r, --retention DAYS    设置备份保留天数 (默认: $RETENTION_DAYS)"
    echo ""
    echo "示例:"
    echo "  $0 --full               执行完整备份"
    echo "  $0 --database           仅备份数据库"
    echo "  $0 --clean              清理旧备份"
    echo "  $0 --retention 60       设置备份保留 60 天"
}

# 检查并创建备份目录
check_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        echo "创建备份目录: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
}

# 备份 MongoDB 数据库
backup_mongodb() {
    echo "备份 MongoDB 数据库..."
    
    # 检查 mongodump 命令是否可用
    if ! command -v mongodump &> /dev/null; then
        echo -e "${RED}[✗] mongodump 命令不可用，无法备份 MongoDB 数据库${NC}"
        return 1
    fi
    
    # 创建临时目录
    local temp_dir=$(mktemp -d)
    
    # 执行备份
    mongodump --host $MONGODB_HOST --port $MONGODB_PORT --db $MONGODB_DB --out $temp_dir
    
    # 创建压缩文件
    local backup_file="$BACKUP_DIR/mongodb_${BACKUP_DATE}.gz"
    tar -czf $backup_file -C $temp_dir .
    
    # 清理临时目录
    rm -rf $temp_dir
    
    echo -e "${GREEN}[✓] MongoDB 数据库已备份到 $backup_file${NC}"
    return 0
}

# 备份 Redis 数据库
backup_redis() {
    echo "备份 Redis 数据库..."
    
    # 检查 redis-cli 命令是否可用
    if ! command -v redis-cli &> /dev/null; then
        echo -e "${YELLOW}[!] redis-cli 命令不可用，跳过 Redis 备份${NC}"
        return 1
    fi
    
    # 执行备份
    local backup_file="$BACKUP_DIR/redis_${BACKUP_DATE}.rdb"
    
    # 使用 SAVE 命令触发 RDB 持久化
    redis-cli -h $REDIS_HOST -p $REDIS_PORT SAVE
    
    # 复制 RDB 文件
    if [ -f "/var/lib/redis/dump.rdb" ]; then
        cp /var/lib/redis/dump.rdb $backup_file
        echo -e "${GREEN}[✓] Redis 数据库已备份到 $backup_file${NC}"
    elif [ -f "/data/redis/dump.rdb" ]; then
        cp /data/redis/dump.rdb $backup_file
        echo -e "${GREEN}[✓] Redis 数据库已备份到 $backup_file${NC}"
    else
        echo -e "${YELLOW}[!] 无法找到 Redis RDB 文件，跳过 Redis 备份${NC}"
        return 1
    fi
    
    return 0
}

# 备份应用
backup_application() {
    echo "备份应用..."
    
    # 检查应用目录是否存在
    if [ ! -d "$APP_DIR" ]; then
        echo -e "${RED}[✗] 应用目录 $APP_DIR 不存在${NC}"
        return 1
    fi
    
    # 创建压缩文件
    local backup_file="$BACKUP_DIR/app_${BACKUP_DATE}.tar.gz"
    
    # 排除不需要备份的目录
    tar --exclude="$APP_DIR/node_modules" \
        --exclude="$APP_DIR/logs" \
        --exclude="$APP_DIR/tmp" \
        --exclude="$APP_DIR/.git" \
        -czf $backup_file $APP_DIR
    
    echo -e "${GREEN}[✓] 应用已备份到 $backup_file${NC}"
    return 0
}

# 清理旧备份
clean_old_backups() {
    echo "清理旧备份..."
    
    # 删除超过保留天数的备份
    find $BACKUP_DIR -name "mongodb_*.gz" -type f -mtime +$RETENTION_DAYS -delete
    find $BACKUP_DIR -name "redis_*.rdb" -type f -mtime +$RETENTION_DAYS -delete
    find $BACKUP_DIR -name "app_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    echo -e "${GREEN}[✓] 已清理超过 $RETENTION_DAYS 天的旧备份${NC}"
    return 0
}

# 执行完整备份
full_backup() {
    echo "执行完整备份..."
    
    # 备份 MongoDB 数据库
    backup_mongodb
    
    # 备份 Redis 数据库
    backup_redis
    
    # 备份应用
    backup_application
    
    # 清理旧备份
    clean_old_backups
    
    echo -e "${GREEN}[✓] 完整备份已完成${NC}"
    return 0
}

# 主函数
main() {
    # 解析命令行参数
    local FULL=false
    local DATABASE=false
    local APP=false
    local CLEAN=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -f|--full)
                FULL=true
                shift
                ;;
            -d|--database)
                DATABASE=true
                shift
                ;;
            -a|--app)
                APP=true
                shift
                ;;
            -c|--clean)
                CLEAN=true
                shift
                ;;
            -r|--retention)
                RETENTION_DAYS=$2
                shift 2
                ;;
            *)
                echo "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 如果没有指定任何选项，默认执行完整备份
    if [[ $FULL == false && $DATABASE == false && $APP == false && $CLEAN == false ]]; then
        FULL=true
    fi
    
    echo "=== BASB 系统备份 ($(date)) ==="
    
    # 检查并创建备份目录
    check_backup_dir
    
    # 执行操作
    if [[ $FULL == true ]]; then
        full_backup
    else
        if [[ $DATABASE == true ]]; then
            backup_mongodb
            backup_redis
        fi
        
        if [[ $APP == true ]]; then
            backup_application
        fi
        
        if [[ $CLEAN == true ]]; then
            clean_old_backups
        fi
    fi
    
    echo "=== 备份完成 ==="
}

# 运行主函数
main "$@"
```

### 自动备份计划

为了确保系统数据的安全，我们建议设置自动备份计划。以下是使用 crontab 设置的示例：

```bash
# 每天凌晨 2 点执行完整备份
0 2 * * * /opt/basb/scripts/backup.sh --full

# 每 6 小时执行一次数据库备份
0 */6 * * * /opt/basb/scripts/backup.sh --database

# 每周日凌晨 3 点清理旧备份
0 3 * * 0 /opt/basb/scripts/backup.sh --clean
```

### 备份验证

定期验证备份的完整性和可用性是确保灾难恢复能力的关键。以下是备份验证脚本 (`scripts/verify-backup.sh`)：

```bash
#!/bin/bash

# BASB 系统备份验证脚本

set -e

# 配置
BACKUP_DIR="/var/backups/basb"
TEST_DIR="/tmp/basb-backup-test"
MONGODB_HOST="localhost"
MONGODB_PORT="27017"
MONGODB_TEST_DB="basb_test"

# 颜色定义
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
NC="\033[0m" # No Color

# 显示帮助信息
show_help() {
    echo "BASB 系统备份验证脚本"
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help              显示此帮助信息"
    echo "  -d, --date DATE         指定备份日期 (格式: YYYYMMDD)"
    echo "  -m, --mongodb           验证 MongoDB 备份"
    echo "  -r, --redis             验证 Redis 备份"
    echo "  -a, --app               验证应用备份"
    echo "  -f, --full              验证完整备份"
    echo ""
    echo "示例:"
    echo "  $0 --full               验证最新的完整备份"
    echo "  $0 --mongodb --date 20230101  验证指定日期的 MongoDB 备份"
}

# 清理测试目录
cleanup() {
    echo "清理测试目录..."
    rm -rf $TEST_DIR
}

# 验证 MongoDB 备份
verify_mongodb_backup() {
    local backup_date=$1
    
    echo "验证 MongoDB 备份..."
    
    # 确定备份文件
    local backup_file
    if [ -z "$backup_date" ]; then
        # 使用最新的备份
        backup_file=$(ls -t $BACKUP_DIR/mongodb_*.gz | head -1)
    else
        # 使用指定日期的备份
        backup_file="$BACKUP_DIR/mongodb_${backup_date}.gz"
    fi
    
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}[✗] 备份文件 $backup_file 不存在${NC}"
        return 1
    fi
    
    echo "使用备份文件: $backup_file"
    
    # 创建测试目录
    mkdir -p $TEST_DIR
    
    # 解压备份文件
    gunzip -c $backup_file | tar -xf - -C $TEST_DIR
    
    # 检查解压是否成功
    if [ ! -d "$TEST_DIR/$MONGODB_DB" ]; then
        echo -e "${RED}[✗] 备份文件解压失败${NC}"
        return 1
    fi
    
    # 检查是否有集合文件
    local collection_count=$(find $TEST_DIR/$MONGODB_DB -name "*.bson" | wc -l)
    if [ $collection_count -eq 0 ]; then
        echo -e "${RED}[✗] 备份文件中没有集合数据${NC}"
        return 1
    fi
    
    echo -e "${GREEN}[✓] MongoDB 备份验证成功${NC}"
    return 0
}

# 验证 Redis 备份
verify_redis_backup() {
    local backup_date=$1
    
    echo "验证 Redis 备份..."
    
    # 确定备份文件
    local backup_file
    if [ -z "$backup_date" ]; then
        # 使用最新的备份
        backup_file=$(ls -t $BACKUP_DIR/redis_*.rdb | head -1)
    else
        # 使用指定日期的备份
        backup_file="$BACKUP_DIR/redis_${backup_date}.rdb"
    fi
    
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}[✗] 备份文件 $backup_file 不存在${NC}"
        return 1
    fi
    
    echo "使用备份文件: $backup_file"
    
    # 检查文件大小
    local file_size=$(stat -c%s "$backup_file" 2>/dev/null || stat -f%z "$backup_file")
    if [ $file_size -eq 0 ]; then
        echo -e "${RED}[✗] Redis 备份文件大小为 0${NC}"
        return 1
    fi
    
    echo -e "${GREEN}[✓] Redis 备份验证成功${NC}"
    return 0
}

# 验证应用备份
verify_app_backup() {
    local backup_date=$1
    
    echo "验证应用备份..."
    
    # 确定备份文件
    local backup_file
    if [ -z "$backup_date" ]; then
        # 使用最新的备份
        backup_file=$(ls -t $BACKUP_DIR/app_*.tar.gz | head -1)
    else
        # 使用指定日期的备份
        backup_file="$BACKUP_DIR/app_${backup_date}.tar.gz"
    fi
    
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}[✗] 备份文件 $backup_file 不存在${NC}"
        return 1
    fi
    
    echo "使用备份文件: $backup_file"
    
    # 创建测试目录
    mkdir -p $TEST_DIR
    
    # 解压备份文件
    tar -tzf $backup_file > /dev/null
    if [ $? -ne 0 ]; then
        echo -e "${RED}[✗] 应用备份文件损坏${NC}"
        return 1
    fi
    
    # 检查关键文件
    tar -tzf $backup_file | grep -q "package.json"
    if [ $? -ne 0 ]; then
        echo -e "${RED}[✗] 应用备份文件缺少关键文件${NC}"
        return 1
    fi
    
    echo -e "${GREEN}[✓] 应用备份验证成功${NC}"
    return 0
}

# 验证完整备份
verify_full_backup() {
    local backup_date=$1
    
    echo "验证完整备份..."
    
    # 验证 MongoDB 备份
    verify_mongodb_backup $backup_date
    local mongodb_result=$?
    
    # 验证 Redis 备份
    verify_redis_backup $backup_date
    local redis_result=$?
    
    # 验证应用备份
    verify_app_backup $backup_date
    local app_result=$?
    
    # 检查验证结果
    if [ $mongodb_result -eq 0 ] && [ $redis_result -eq 0 ] && [ $app_result -eq 0 ]; then
        echo -e "${GREEN}[✓] 完整备份验证成功${NC}"
        return 0
    else
        echo -e "${RED}[✗] 完整备份验证失败${NC}"
        return 1
    fi
}

# 主函数
main() {
    # 解析命令行参数
    local FULL=false
    local MONGODB=false
    local REDIS=false
    local APP=false
    local BACKUP_DATE=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -f|--full)
                FULL=true
                shift
                ;;
            -m|--mongodb)
                MONGODB=true
                shift
                ;;
            -r|--redis)
                REDIS=true
                shift
                ;;
            -a|--app)
                APP=true
                shift
                ;;
            -d|--date)
                BACKUP_DATE=$2
                shift 2
                ;;
            *)
                echo "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 如果没有指定任何选项，默认验证完整备份
    if [[ $FULL == false && $MONGODB == false && $REDIS == false && $APP == false ]]; then
        FULL=true
    fi
    
    echo "=== BASB 系统备份验证 ($(date)) ==="
    
    # 创建测试目录
    mkdir -p $TEST_DIR
    
    # 执行验证
    local result=0
    if [[ $FULL == true ]]; then
        verify_full_backup $BACKUP_DATE
        result=$?
    else
        if [[ $MONGODB == true ]]; then
            verify_mongodb_backup $BACKUP_DATE
            [ $? -ne 0 ] && result=1
        fi
        
        if [[ $REDIS == true ]]; then
            verify_redis_backup $BACKUP_DATE
            [ $? -ne 0 ] && result=1
        fi
        
        if [[ $APP == true ]]; then
            verify_app_backup $BACKUP_DATE
            [ $? -ne 0 ] && result=1
        fi
    fi
    
    # 清理测试目录
    cleanup
    
    echo "=== 备份验证完成 ==="
    
    exit $result
}

# 运行主函数
main "$@"
```

## 灾难恢复计划

BASB 系统的灾难恢复计划包括以下步骤：

1. **灾难类型识别**：确定灾难类型（硬件故障、软件故障、数据损坏、安全漏洞等）
2. **影响评估**：评估灾难对系统的影响范围和严重程度
3. **恢复策略选择**：根据灾难类型和影响选择适当的恢复策略
4. **恢复执行**：使用备份和恢复脚本执行恢复操作
5. **验证和测试**：验证恢复后的系统功能和数据完整性
6. **文档和报告**：记录灾难恢复过程和结果

### 灾难恢复时间目标 (RTO) 和恢复点目标 (RPO)

- **RTO（恢复时间目标）**：4 小时内恢复系统功能
- **RPO（恢复点目标）**：最多丢失 1 小时的数据

### 灾难恢复测试计划

每季度进行一次灾难恢复演练，测试以下场景：

1. 数据库服务器故障
2. 应用服务器故障
3. 数据损坏
4. 完整系统恢复

# 检查 HTTP 服务
check_http_service() {
    local url=$1
    local name=$2
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" $url/health)
    
    if [ "$status_code" == "200" ]; then
        echo -e "${GREEN}[✓] $name 服务正常 ($url)${NC}"
        return 0
    else
        echo -e "${RED}[✗] $name 服务异常 ($url) - 状态码: $status_code${NC}"
        return 1
    fi
}

# 检查 MongoDB
check_mongodb() {
    if command -v mongosh &> /dev/null; then
        if mongosh --host $MONGODB_HOST --port $MONGODB_PORT --eval "db.adminCommand('ping')" | grep -q '"ok" : 1'; then
            echo -e "${GREEN}[✓] MongoDB 服务正常 ($MONGODB_HOST:$MONGODB_PORT)${NC}"
            return 0
        else
            echo -e "${RED}[✗] MongoDB 服务异常 ($MONGODB_HOST:$MONGODB_PORT)${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}[!] mongosh 命令不可用，无法检查 MongoDB${NC}"
        return 2
    fi
}

# 检查 Redis
check_redis() {
    if command -v redis-cli &> /dev/null; then
        if redis-cli -h $REDIS_HOST -p $REDIS_PORT ping | grep -q 'PONG'; then
            echo -e "${GREEN}[✓] Redis 服务正常 ($REDIS_HOST:$REDIS_PORT)${NC}"
            return 0
        else
            echo -e "${RED}[✗] Redis 服务异常 ($REDIS_HOST:$REDIS_PORT)${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}[!] redis-cli 命令不可用，无法检查 Redis${NC}"
        return 2
    fi
}

# 检查磁盘空间
check_disk_space() {
    local threshold=85
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -lt "$threshold" ]; then
        echo -e "${GREEN}[✓] 磁盘空间充足 (使用率: $disk_usage%)${NC}"
        return 0
    else
        echo -e "${RED}[✗] 磁盘空间不足 (使用率: $disk_usage%)${NC}"
        return 1
    fi
}

# 检查内存使用
check_memory() {
    local threshold=90
    local memory_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    
    if [ "$memory_usage" -lt "$threshold" ]; then
        echo -e "${GREEN}[✓] 内存使用正常 (使用率: $memory_usage%)${NC}"
        return 0
    else
        echo -e "${RED}[✗] 内存使用过高 (使用率: $memory_usage%)${NC}"
        return 1
    fi
}

# 检查 Docker 容器
check_docker_containers() {
    if command -v docker &> /dev/null; then
        local containers=$(docker ps --format "{{.Names}}" | grep basb)
        
        if [ -z "$containers" ]; then
            echo -e "${YELLOW}[!] 未发现 BASB 相关的 Docker 容器${NC}"
            return 2
        fi
        
        local unhealthy_containers=$(docker ps --format "{{.Names}}\t{{.Status}}" | grep -v "Up" | grep basb)
        
        if [ -z "$unhealthy_containers" ]; then
            echo -e "${GREEN}[✓] 所有 BASB Docker 容器运行正常${NC}"
            return 0
        else
            echo -e "${RED}[✗] 发现异常的 BASB Docker 容器:${NC}"
            echo "$unhealthy_containers"
            return 1
        fi
    else
        echo -e "${YELLOW}[!] docker 命令不可用，无法检查容器${NC}"
        return 2
    fi
}

# 运行所有检查
echo "=== BASB 系统健康检查 ($(date)) ==="
echo

echo "=== 服务健康检查 ==="
check_http_service $APP_URL "应用"
check_http_service $KNOWLEDGE_GRAPH_URL "知识图谱"
check_http_service $DOCUMENT_PROCESSOR_URL "文档处理"
check_http_service $SEARCH_URL "搜索"
check_http_service $AI_URL "AI"
echo

echo "=== 数据库健康检查 ==="
check_mongodb
check_redis
echo

echo "=== 系统资源检查 ==="
check_disk_space
check_memory
echo

echo "=== Docker 容器检查 ==="
check_docker_containers
echo

echo "=== 健康检查完成 ==="
```

### 性能优化

BASB 系统使用以下性能优化脚本 (`scripts/performance-tuning.sh`)：

```bash
#!/bin/bash

# BASB 系统性能优化脚本

set -e

# 配置
MONGODB_HOST="localhost"
MONGODB_PORT="27017"
MONGODB_DB="basb"
REDIS_HOST="localhost"
REDIS_PORT="6379"
NODE_ENV="production"

# 颜色定义
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
NC="\033[0m" # No Color

echo "=== BASB 系统性能优化 ($(date)) ==="

# 优化 MongoDB 索引
optimize_mongodb_indexes() {
    echo "正在优化 MongoDB 索引..."
    
    if command -v mongosh &> /dev/null; then
        # 创建或更新索引
        mongosh --host $MONGODB_HOST --port $MONGODB_PORT $MONGODB_DB --eval "
            db.knowledge_items.createIndex({ 'title': 'text', 'content': 'text' });
            db.knowledge_items.createIndex({ 'tags': 1 });
            db.knowledge_items.createIndex({ 'created_at': 1 });
            db.knowledge_items.createIndex({ 'updated_at': 1 });
            db.users.createIndex({ 'email': 1 }, { unique: true });
            db.users.createIndex({ 'username': 1 }, { unique: true });
            print('MongoDB 索引优化完成');
        "
        
        # 运行索引统计
        echo "索引使用情况统计:"
        mongosh --host $MONGODB_HOST --port $MONGODB_PORT $MONGODB_DB --eval "
            db.knowledge_items.aggregate([ { \$indexStats: { } } ]);
        "
    else
        echo -e "${YELLOW}[!] mongosh 命令不可用，无法优化 MongoDB 索引${NC}"
    fi
}

# 优化 Redis 配置
optimize_redis() {
    echo "正在优化 Redis 配置..."
    
    if command -v redis-cli &> /dev/null; then
        # 设置 Redis 最大内存和淘汰策略
        redis-cli -h $REDIS_HOST -p $REDIS_PORT CONFIG SET maxmemory "2gb"
        redis-cli -h $REDIS_HOST -p $REDIS_PORT CONFIG SET maxmemory-policy "allkeys-lru"
        
        # 启用 Redis 持久化
        redis-cli -h $REDIS_HOST -p $REDIS_PORT CONFIG SET appendonly "yes"
        redis-cli -h $REDIS_HOST -p $REDIS_PORT CONFIG SET appendfsync "everysec"
        
        # 保存配置
        redis-cli -h $REDIS_HOST -p $REDIS_PORT CONFIG REWRITE
        
        echo -e "${GREEN}[✓] Redis 配置优化完成${NC}"
    else
        echo -e "${YELLOW}[!] redis-cli 命令不可用，无法优化 Redis 配置${NC}"
    fi
}

# 优化 Node.js 应用
optimize_nodejs() {
    echo "正在优化 Node.js 应用..."
    
    # 设置环境变量
    export NODE_ENV=$NODE_ENV
    
    # 更新 PM2 配置
    if command -v pm2 &> /dev/null; then
        echo "更新 PM2 配置..."
        
        # 创建优化的 PM2 配置文件
        cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'basb-app',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF
        
        # 重启应用以应用新配置
        pm2 reload ecosystem.config.js
        
        echo -e "${GREEN}[✓] Node.js 应用优化完成${NC}"
    else
        echo -e "${YELLOW}[!] pm2 命令不可用，无法优化 Node.js 应用${NC}"
    fi
}

# 优化 Docker 容器
optimize_docker() {
    echo "正在优化 Docker 容器..."
    
    if command -v docker &> /dev/null; then
        # 清理未使用的镜像和容器
        docker system prune -f
        
        # 更新 Docker Compose 配置
        if [ -f "docker-compose.production.yml" ]; then
            echo "更新 Docker Compose 配置..."
            
            # 备份原配置
            cp docker-compose.production.yml docker-compose.production.yml.bak
            
            # 应用优化配置
            cat > docker-compose.production.yml << EOF
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
      resources:
        limits:
          cpus: '1'
          memory: 1G
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
    command: --wiredTigerCacheSizeGB 1
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  redis:
    image: redis:7
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --maxmemory 1gb --maxmemory-policy allkeys-lru
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

volumes:
  mongodb_data:
  redis_data:
EOF
            
            # 重启容器以应用新配置
            docker-compose -f docker-compose.production.yml up -d
            
            echo -e "${GREEN}[✓] Docker 容器优化完成${NC}"
        else
            echo -e "${YELLOW}[!] docker-compose.production.yml 文件不存在，无法优化 Docker 容器${NC}"
        fi
    else
        echo -e "${YELLOW}[!] docker 命令不可用，无法优化 Docker 容器${NC}"
    fi
}

# 运行优化
optimize_mongodb_indexes
echo

optimize_redis
echo

optimize_nodejs
echo

optimize_docker
echo

echo "=== 性能优化完成 ==="
```

### 容量规划

BASB 系统使用以下容量规划脚本 (`scripts/capacity-planning.sh`)：

```bash
#!/bin/bash

# BASB 系统容量规划脚本

set -e

# 配置
MONGODB_HOST="localhost"
MONGODB_PORT="27017"
MONGODB_DB="basb"
OUTPUT_FILE="capacity_report_$(date +%Y%m%d).txt"

# 颜色定义
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
NC="\033[0m" # No Color

echo "=== BASB 系统容量规划 ($(date)) ===" | tee $OUTPUT_FILE

# 收集系统资源使用情况
collect_system_resources() {
    echo "\n=== 系统资源使用情况 ===" | tee -a $OUTPUT_FILE
    
    # CPU 使用情况
    echo "\n--- CPU 使用情况 ---" | tee -a $OUTPUT_FILE
    top -bn1 | grep "Cpu(s)" | tee -a $OUTPUT_FILE
    
    # 内存使用情况
    echo "\n--- 内存使用情况 ---" | tee -a $OUTPUT_FILE
    free -h | tee -a $OUTPUT_FILE
    
    # 磁盘使用情况
    echo "\n--- 磁盘使用情况 ---" | tee -a $OUTPUT_FILE
    df -h | tee -a $OUTPUT_FILE
    
    # 磁盘 I/O 情况
    echo "\n--- 磁盘 I/O 情况 ---" | tee -a $OUTPUT_FILE
    if command -v iostat &> /dev/null; then
        iostat -x 1 3 | tee -a $OUTPUT_FILE
    else
        echo "iostat 命令不可用，无法收集磁盘 I/O 情况" | tee -a $OUTPUT_FILE
    fi
    
    # 网络使用情况
    echo "\n--- 网络使用情况 ---" | tee -a $OUTPUT_FILE
    if command -v netstat &> /dev/null; then
        netstat -i | tee -a $OUTPUT_FILE
    else
        echo "netstat 命令不可用，无法收集网络使用情况" | tee -a $OUTPUT_FILE
    fi
}

# 收集 MongoDB 数据库大小
collect_mongodb_stats() {
    echo "\n=== MongoDB 数据库统计 ===" | tee -a $OUTPUT_FILE
    
    if command -v mongosh &> /dev/null; then
        # 数据库大小
        echo "\n--- 数据库大小 ---" | tee -a $OUTPUT_FILE
        mongosh --host $MONGODB_HOST --port $MONGODB_PORT $MONGODB_DB --eval "
            db.stats();
        " | tee -a $OUTPUT_FILE
        
        # 集合大小
        echo "\n--- 集合大小 ---" | tee -a $OUTPUT_FILE
        mongosh --host $MONGODB_HOST --port $MONGODB_PORT $MONGODB_DB --eval "
            db.getCollectionNames().forEach(function(collection) {
                print(collection + ': ' + JSON.stringify(db[collection].stats().size / (1024*1024)) + ' MB');
            });
        " | tee -a $OUTPUT_FILE
        
        # 文档数量
        echo "\n--- 文档数量 ---" | tee -a $OUTPUT_FILE
        mongosh --host $MONGODB_HOST --port $MONGODB_PORT $MONGODB_DB --eval "
            db.getCollectionNames().forEach(function(collection) {
                print(collection + ': ' + db[collection].count() + ' documents');
            });
        " | tee -a $OUTPUT_FILE
    else
        echo "mongosh 命令不可用，无法收集 MongoDB 统计信息" | tee -a $OUTPUT_FILE
    fi
}

# 收集应用指标
collect_app_metrics() {
    echo "\n=== 应用指标 ===" | tee -a $OUTPUT_FILE
    
    # 检查 Prometheus 是否可用
    if curl -s http://localhost:9090/api/v1/query?query=up > /dev/null; then
        # 请求速率
        echo "\n--- 请求速率 ---" | tee -a $OUTPUT_FILE
        curl -s "http://localhost:9090/api/v1/query?query=sum(rate(http_requests_total[1h]))" | jq '.data.result[0].value[1]' | tee -a $OUTPUT_FILE
        
        # 响应时间
        echo "\n--- 响应时间 (95th percentile) ---" | tee -a $OUTPUT_FILE
        curl -s "http://localhost:9090/api/v1/query?query=histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[1h])) by (le))" | jq '.data.result[0].value[1]' | tee -a $OUTPUT_FILE
        
        # 错误率
        echo "\n--- 错误率 ---" | tee -a $OUTPUT_FILE
        curl -s "http://localhost:9090/api/v1/query?query=sum(rate(http_requests_total{status=~\"5..\"}[1h])) / sum(rate(http_requests_total[1h]))" | jq '.data.result[0].value[1]' | tee -a $OUTPUT_FILE
    else
        echo "Prometheus 不可用，无法收集应用指标" | tee -a $OUTPUT_FILE
    fi
}

# 生成容量预测
generate_capacity_forecast() {
    echo "\n=== 容量预测 ===" | tee -a $OUTPUT_FILE
    
    # 假设每月增长率
    MONTHLY_GROWTH_RATE=20
    
    # 获取当前数据库大小
    if command -v mongosh &> /dev/null; then
        CURRENT_DB_SIZE=$(mongosh --host $MONGODB_HOST --port $MONGODB_PORT $MONGODB_DB --eval "
            db.stats().dataSize / (1024*1024*1024);
        " --quiet)
        
        echo "当前数据库大小: ${CURRENT_DB_SIZE} GB" | tee -a $OUTPUT_FILE
        
        # 计算未来 6 个月的数据库大小
        echo "\n--- 未来 6 个月的数据库大小预测 ---" | tee -a $OUTPUT_FILE
        echo "假设每月增长率: ${MONTHLY_GROWTH_RATE}%" | tee -a $OUTPUT_FILE
        
        FORECAST_SIZE=$CURRENT_DB_SIZE
        for i in {1..6}; do
            FORECAST_SIZE=$(echo "$FORECAST_SIZE * (1 + $MONTHLY_GROWTH_RATE/100)" | bc -l)
            echo "${i} 个月后: ${FORECAST_SIZE} GB" | tee -a $OUTPUT_FILE
        done
    else
        echo "mongosh 命令不可用，无法生成容量预测" | tee -a $OUTPUT_FILE
    fi
    
    # 生成资源建议
    echo "\n--- 资源建议 ---" | tee -a $OUTPUT_FILE
    echo "根据当前使用情况和预测增长，建议以下资源配置:" | tee -a $OUTPUT_FILE
    echo "1. 数据库服务器:" | tee -a $OUTPUT_FILE
    echo "   - CPU: 8 核心" | tee -a $OUTPUT_FILE
    echo "   - 内存: 32 GB" | tee -a $OUTPUT_FILE
    echo "   - 磁盘: 500 GB SSD" | tee -a $OUTPUT_FILE
    echo "2. 应用服务器:" | tee -a $OUTPUT_FILE
    echo "   - CPU: 4 核心" | tee -a $OUTPUT_FILE
    echo "   - 内存: 16 GB" | tee -a $OUTPUT_FILE
    echo "   - 磁盘: 100 GB SSD" | tee -a $OUTPUT_FILE
    echo "3. 缓存服务器:" | tee -a $OUTPUT_FILE
    echo "   - CPU: 2 核心" | tee -a $OUTPUT_FILE
    echo "   - 内存: 8 GB" | tee -a $OUTPUT_FILE
    echo "   - 磁盘: 20 GB SSD" | tee -a $OUTPUT_FILE
}

# 运行收集和分析
collect_system_resources
collect_mongodb_stats
collect_app_metrics
generate_capacity_forecast

echo "\n=== 容量规划报告已生成: $OUTPUT_FILE ==="
```

## 故障处理

### 故障检测

BASB 系统使用以下故障检测脚本 (`scripts/fault-detection.sh`)：

```bash
#!/bin/bash

# BASB 系统故障检测脚本

set -e

# 配置
APP_URL="http://localhost:3000"
KNOWLEDGE_GRAPH_URL="http://localhost:3001"
DOCUMENT_PROCESSOR_URL="http://localhost:3002"
SEARCH_URL="http://localhost:3003"
AI_URL="http://localhost:3004"
MONGODB_HOST="localhost"
MONGODB_PORT="27017"
REDIS_HOST="localhost"
REDIS_PORT="6379"
LOG_DIR="/var/log/basb"
ALERT_EMAIL="admin@example.com"

# 颜色定义
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
NC="\033[0m" # No Color

# 发送告警邮件
send_alert() {
    local subject="$1"
    local message="$2"
    
    echo "$message" | mail -s "[BASB ALERT] $subject" $ALERT_EMAIL
    echo "已发送告警邮件: $subject"
}

# 检查服务健康状态
check_service_health() {
    local url=$1
    local name=$2
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" $url/health)
    
    if [ "$status_code" != "200" ]; then
        echo -e "${RED}[✗] $name 服务异常 ($url) - 状态码: $status_code${NC}"
        send_alert "$name 服务异常" "$name 服务健康检查失败，状态码: $status_code\n\n时间: $(date)"
        return 1
    fi
    
    return 0
}

# 检查数据库连接
check_database_connection() {
    # 检查 MongoDB
    if command -v mongosh &> /dev/null; then
        if ! mongosh --host $MONGODB_HOST --port $MONGODB_PORT --eval "db.adminCommand('ping')" | grep -q '"ok" : 1'; then
            echo -e "${RED}[✗] MongoDB 连接异常${NC}"
            send_alert "MongoDB 连接异常" "无法连接到 MongoDB 服务器 $MONGODB_HOST:$MONGODB_PORT\n\n时间: $(date)"
            return 1
        fi
    fi
    
    # 检查 Redis
    if command -v redis-cli &> /dev/null; then
        if ! redis-cli -h $REDIS_HOST -p $REDIS_PORT ping | grep -q 'PONG'; then
            echo -e "${RED}[✗] Redis 连接异常${NC}"
            send_alert "Redis 连接异常" "无法连接到 Redis 服务器 $REDIS_HOST:$REDIS_PORT\n\n时间: $(date)"
            return 1
        fi
    fi
    
    return 0
}

# 检查日志文件中的错误
check_logs_for_errors() {
    if [ -d "$LOG_DIR" ]; then
        # 检查应用日志中的错误
        local app_errors=$(grep -i "error\|exception\|fatal" $LOG_DIR/app.log | tail -n 50)
        if [ ! -z "$app_errors" ]; then
            echo -e "${RED}[✗] 应用日志中发现错误${NC}"
            send_alert "应用日志中发现错误" "应用日志中发现以下错误:\n\n$app_errors\n\n时间: $(date)"
        fi
        
        # 检查数据库日志中的错误
        local db_errors=$(grep -i "error\|exception\|fatal" $LOG_DIR/mongodb.log | tail -n 50)
        if [ ! -z "$db_errors" ]; then
            echo -e "${RED}[✗] 数据库日志中发现错误${NC}"
            send_alert "数据库日志中发现错误" "数据库日志中发现以下错误:\n\n$db_errors\n\n时间: $(date)"
        fi
    else
        echo -e "${YELLOW}[!] 日志目录 $LOG_DIR 不存在${NC}"
    fi
}

# 检查系统资源
check_system_resources() {
    # 检查 CPU 使用率
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')
    if (( $(echo "$cpu_usage > 90" | bc -l) )); then
        echo -e "${RED}[✗] CPU 使用率过高: ${cpu_usage}%${NC}"
        send_alert "CPU 使用率过高" "CPU 使用率达到 ${cpu_usage}%\n\n时间: $(date)"
    fi
    
    # 检查内存使用率
    local mem_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    if [ "$mem_usage" -gt 90 ]; then
        echo -e "${RED}[✗] 内存使用率过高: ${mem_usage}%${NC}"
        send_alert "内存使用率过高" "内存使用率达到 ${mem_usage}%\n\n时间: $(date)"
    fi
    
    # 检查磁盘使用率
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        echo -e "${RED}[✗] 磁盘使用率过高: ${disk_usage}%${NC}"
        send_alert "磁盘使用率过高" "磁盘使用率达到 ${disk_usage}%\n\n时间: $(date)"
    fi
}

# 主函数
main() {
    echo "=== BASB 系统故障检测 ($(date)) ==="
    
    # 检查服务健康状态
    echo "\n=== 检查服务健康状态 ==="
    check_service_health $APP_URL "应用"
    check_service_health $KNOWLEDGE_GRAPH_URL "知识图谱"
    check_service_health $DOCUMENT_PROCESSOR_URL "文档处理"
    check_service_health $SEARCH_URL "搜索"
    check_service_health $AI_URL "AI"
    
    # 检查数据库连接
    echo "\n=== 检查数据库连接 ==="
    check_database_connection
    
    # 检查日志文件中的错误
    echo "\n=== 检查日志文件中的错误 ==="
    check_logs_for_errors
    
    # 检查系统资源
    echo "\n=== 检查系统资源 ==="
    check_system_resources
    
    echo "\n=== 故障检测完成 ==="
}

# 运行主函数
main
```

### 故障分析

BASB 系统使用以下故障分析脚本 (`scripts/fault-analysis.sh`)：

```bash
#!/bin/bash

# BASB 系统故障分析脚本

set -e

# 配置
LOG_DIR="/var/log/basb"
OUTPUT_DIR="/tmp/basb-analysis"
MONGODB_HOST="localhost"
MONGODB_PORT="27017"
MONGODB_DB="basb"

# 颜色定义
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
NC="\033[0m" # No Color

# 创建输出目录
mkdir -p $OUTPUT_DIR

# 收集系统信息
collect_system_info() {
    echo "收集系统信息..."
    
    # 系统基本信息
    echo "=== 系统信息 ===" > $OUTPUT_DIR/system_info.txt
    uname -a >> $OUTPUT_DIR/system_info.txt
    echo "" >> $OUTPUT_DIR/system_info.txt
    
    # CPU 信息
    echo "=== CPU 信息 ===" >> $OUTPUT_DIR/system_info.txt
    cat /proc/cpuinfo | grep "model name" | head -1 >> $OUTPUT_DIR/system_info.txt
    echo "CPU 核心数: $(nproc)" >> $OUTPUT_DIR/system_info.txt
    echo "" >> $OUTPUT_DIR/system_info.txt
    
    # 内存信息
    echo "=== 内存信息 ===" >> $OUTPUT_DIR/system_info.txt
    free -h >> $OUTPUT_DIR/system_info.txt
    echo "" >> $OUTPUT_DIR/system_info.txt
    
    # 磁盘信息
    echo "=== 磁盘信息 ===" >> $OUTPUT_DIR/system_info.txt
    df -h >> $OUTPUT_DIR/system_info.txt
    echo "" >> $OUTPUT_DIR/system_info.txt
    
    # 进程信息
    echo "=== 进程信息 ===" >> $OUTPUT_DIR/system_info.txt
    ps aux | grep -E "node|mongo|redis" >> $OUTPUT_DIR/system_info.txt
    echo "" >> $OUTPUT_DIR/system_info.txt
    
    # 网络信息
    echo "=== 网络信息 ===" >> $OUTPUT_DIR/system_info.txt
    netstat -tuln >> $OUTPUT_DIR/system_info.txt
    echo "" >> $OUTPUT_DIR/system_info.txt
    
    echo "系统信息已保存到 $OUTPUT_DIR/system_info.txt"
}

# 分析日志文件
analyze_logs() {
    echo "分析日志文件..."
    
    if [ -d "$LOG_DIR" ]; then
        # 收集错误日志
        echo "=== 错误日志分析 ===" > $OUTPUT_DIR/log_analysis.txt
        
        # 应用日志分析
        echo "--- 应用日志错误 ---" >> $OUTPUT_DIR/log_analysis.txt
        grep -i "error\|exception\|fatal" $LOG_DIR/app.log | tail -n 100 >> $OUTPUT_DIR/log_analysis.txt
        echo "" >> $OUTPUT_DIR/log_analysis.txt
        
        # 统计错误类型和频率
        echo "--- 错误类型统计 ---" >> $OUTPUT_DIR/log_analysis.txt
        grep -i "error\|exception\|fatal" $LOG_DIR/app.log | awk '{print $NF}' | sort | uniq -c | sort -nr >> $OUTPUT_DIR/log_analysis.txt
        echo "" >> $OUTPUT_DIR/log_analysis.txt
        
        # 数据库日志分析
        echo "--- 数据库日志错误 ---" >> $OUTPUT_DIR/log_analysis.txt
        grep -i "error\|exception\|fatal" $LOG_DIR/mongodb.log | tail -n 100 >> $OUTPUT_DIR/log_analysis.txt
        echo "" >> $OUTPUT_DIR/log_analysis.txt
        
        # 慢查询分析
        echo "--- 慢查询分析 ---" >> $OUTPUT_DIR/log_analysis.txt
        grep -i "slow query" $LOG_DIR/mongodb.log | tail -n 50 >> $OUTPUT_DIR/log_analysis.txt
        echo "" >> $OUTPUT_DIR/log_analysis.txt
        
        echo "日志分析已保存到 $OUTPUT_DIR/log_analysis.txt"
    else
        echo -e "${YELLOW}[!] 日志目录 $LOG_DIR 不存在${NC}"
    fi
}

# 分析数据库状态
analyze_database() {
    echo "分析数据库状态..."
    
    if command -v mongosh &> /dev/null; then
        # 数据库状态
        echo "=== MongoDB 状态分析 ===" > $OUTPUT_DIR/db_analysis.txt
        
        # 服务器状态
        echo "--- 服务器状态 ---" >> $OUTPUT_DIR/db_analysis.txt
        mongosh --host $MONGODB_HOST --port $MONGODB_PORT $MONGODB_DB --eval "
            db.serverStatus();
        " >> $OUTPUT_DIR/db_analysis.txt
        echo "" >> $OUTPUT_DIR/db_analysis.txt
        
        # 连接状态
        echo "--- 连接状态 ---" >> $OUTPUT_DIR/db_analysis.txt
        mongosh --host $MONGODB_HOST --port $MONGODB_PORT $MONGODB_DB --eval "
            db.currentOp();
        " >> $OUTPUT_DIR/db_analysis.txt
        echo "" >> $OUTPUT_DIR/db_analysis.txt
        
        # 索引状态
        echo "--- 索引状态 ---" >> $OUTPUT_DIR/db_analysis.txt
        mongosh --host $MONGODB_HOST --port $MONGODB_PORT $MONGODB_DB --eval "
            db.getCollectionNames().forEach(function(collection) {
                print('Collection: ' + collection);
                print(JSON.stringify(db[collection].getIndexes(), null, 2));
                print('');
            });
        " >> $OUTPUT_DIR/db_analysis.txt
        echo "" >> $OUTPUT_DIR/db_analysis.txt
        
        echo "数据库分析已保存到 $OUTPUT_DIR/db_analysis.txt"
    else
        echo -e "${YELLOW}[!] mongosh 命令不可用，无法分析数据库状态${NC}"
    fi
}

# 生成故障报告
generate_report() {
    echo "生成故障报告..."
    
    # 创建报告文件
    local report_file="$OUTPUT_DIR/fault_report_$(date +%Y%m%d_%H%M%S).txt"
    
    echo "=== BASB 系统故障分析报告 ===" > $report_file
    echo "生成时间: $(date)" >> $report_file
    echo "" >> $report_file
    
    # 添加系统信息摘要
    echo "=== 系统信息摘要 ===" >> $report_file
    echo "操作系统: $(uname -s) $(uname -r)" >> $report_file
    echo "CPU 使用率: $(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')%" >> $report_file
    echo "内存使用率: $(free | grep Mem | awk '{print int($3/$2 * 100)}')%" >> $report_file
    echo "磁盘使用率: $(df -h / | awk 'NR==2 {print $5}')" >> $report_file
    echo "" >> $report_file
    
    # 添加错误日志摘要
    echo "=== 错误日志摘要 ===" >> $report_file
    if [ -f "$OUTPUT_DIR/log_analysis.txt" ]; then
        grep -A 10 "错误类型统计" $OUTPUT_DIR/log_analysis.txt >> $report_file
    else
        echo "未找到日志分析文件" >> $report_file
    fi
    echo "" >> $report_file
    
    # 添加数据库状态摘要
    echo "=== 数据库状态摘要 ===" >> $report_file
    if [ -f "$OUTPUT_DIR/db_analysis.txt" ]; then
        grep -A 10 "连接状态" $OUTPUT_DIR/db_analysis.txt >> $report_file
    else
        echo "未找到数据库分析文件" >> $report_file
    fi
    echo "" >> $report_file
    
    # 添加故障诊断和建议
    echo "=== 故障诊断和建议 ===" >> $report_file
    echo "根据收集的信息，可能的故障原因和建议如下:" >> $report_file
    echo "" >> $report_file
    
    # 检查 CPU 使用率
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        echo "1. CPU 使用率过高 (${cpu_usage}%)" >> $report_file
        echo "   建议: 检查是否有异常进程占用 CPU，考虑增加 CPU 资源或优化应用性能" >> $report_file
        echo "" >> $report_file
    fi
    
    # 检查内存使用率
    local mem_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    if [ "$mem_usage" -gt 80 ]; then
        echo "2. 内存使用率过高 (${mem_usage}%)" >> $report_file
        echo "   建议: 检查内存泄漏问题，考虑增加内存资源或优化应用内存使用" >> $report_file
        echo "" >> $report_file
    fi
    
    # 检查磁盘使用率
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 80 ]; then
        echo "3. 磁盘使用率过高 (${disk_usage}%)" >> $report_file
        echo "   建议: 清理不必要的文件，考虑增加磁盘空间或优化数据存储" >> $report_file
        echo "" >> $report_file
    fi
    
    # 检查日志中的错误
    if [ -f "$OUTPUT_DIR/log_analysis.txt" ] && grep -q "error\|exception\|fatal" $OUTPUT_DIR/log_analysis.txt; then
        echo "4. 应用日志中存在错误" >> $report_file
        echo "   建议: 查看详细错误日志，修复应用代码中的问题" >> $report_file
        echo "" >> $report_file
    fi
    
    # 检查数据库连接问题
    if [ -f "$OUTPUT_DIR/db_analysis.txt" ] && grep -q "连接失败\|无法连接" $OUTPUT_DIR/db_analysis.txt; then
        echo "5. 数据库连接问题" >> $report_file
        echo "   建议: 检查数据库服务是否正常运行，检查网络连接和认证配置" >> $report_file
        echo "" >> $report_file
    fi
    
    echo "故障报告已保存到 $report_file"
    echo "请将此报告提交给系统管理员或开发团队进行进一步分析和处理。"
}

# 主函数
main() {
    echo "=== BASB 系统故障分析 ($(date)) ==="
    
    # 收集系统信息
    collect_system_info
    
    # 分析日志文件
    analyze_logs
    
    # 分析数据库状态
    analyze_database
    
    # 生成故障报告
    generate_report
    
    echo "=== 故障分析完成 ==="
    echo "分析结果保存在 $OUTPUT_DIR 目录中"
}

# 运行主函数
main
```

### 故障恢复

BASB 系统使用以下故障恢复脚本 (`scripts/fault-recovery.sh`)：

```bash
#!/bin/bash

# BASB 系统故障恢复脚本

set -e

# 配置
BACKUP_DIR="/var/backups/basb"
MONGODB_HOST="localhost"
MONGODB_PORT="27017"
MONGODB_DB="basb"
REDIS_HOST="localhost"
REDIS_PORT="6379"
APP_DIR="/opt/basb"
LOG_DIR="/var/log/basb"

# 颜色定义
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
NC="\033[0m" # No Color