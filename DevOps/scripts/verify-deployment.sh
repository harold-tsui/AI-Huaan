#!/bin/bash

# BASB 系统部署验证脚本
# 用于验证 BASB 系统在生产环境中的部署状态

set -e

# 配置
APP_NAME="basb"
APP_DIR="/opt/basb"
CONFIG_DIR="/etc/basb"
LOG_DIR="/var/log/basb"
MONGODB_HOST="localhost"
MONGODB_PORT="27017"
MONGODB_DB="basb"
REDIS_HOST="localhost"
REDIS_PORT="6379"
API_BASE_URL="http://localhost:3000"
VERIFY_LOG="$LOG_DIR/verify_$(date +%Y%m%d%H%M%S).log"

# 颜色定义
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
NC="\033[0m" # No Color

# 显示帮助信息
show_help() {
    echo "BASB 系统部署验证脚本"
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help              显示此帮助信息"
    echo "  -u, --url URL           设置 API 基础 URL (默认: $API_BASE_URL)"
    echo "  -d, --dir DIR           设置应用目录 (默认: $APP_DIR)"
    echo "  -v, --verbose           显示详细输出"
    echo "  -s, --services          仅验证服务状态"
    echo "  -a, --api               仅验证 API 端点"
    echo "  -db, --database         仅验证数据库连接"
    echo "  -l, --logs              仅验证日志文件"
    echo "  -f, --full              执行完整验证 (默认)"
    echo ""
    echo "示例:"
    echo "  $0 --full               执行完整验证"
    echo "  $0 --services           仅验证服务状态"
    echo "  $0 --url http://basb.example.com  使用自定义 API URL"
}

# 记录日志
log() {
    local level=$1
    local message=$2
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    
    case $level in
        "INFO")
            echo -e "${GREEN}[INFO]${NC} $timestamp - $message"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} $timestamp - $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $timestamp - $message"
            ;;
        *)
            echo "$timestamp - $message"
            ;;
    esac
    
    # 确保日志目录存在
    mkdir -p "$(dirname $VERIFY_LOG)"
    
    # 写入日志文件
    echo "[$level] $timestamp - $message" >> $VERIFY_LOG
}

# 验证服务状态
verify_services() {
    log "INFO" "验证服务状态..."
    local services_ok=true
    
    # 检查 Docker 容器状态
    if command -v docker &> /dev/null; then
        log "INFO" "检查 Docker 容器状态"
        
        # 检查 MongoDB 容器
        if docker ps --filter "name=mongodb" --filter "status=running" | grep -q "mongodb"; then
            log "INFO" "MongoDB 容器正在运行"
        else
            log "ERROR" "MongoDB 容器未运行"
            services_ok=false
        fi
        
        # 检查 Redis 容器
        if docker ps --filter "name=redis" --filter "status=running" | grep -q "redis"; then
            log "INFO" "Redis 容器正在运行"
        else
            log "ERROR" "Redis 容器未运行"
            services_ok=false
        fi
        
        # 检查应用容器
        if docker ps --filter "name=$APP_NAME" --filter "status=running" | grep -q "$APP_NAME"; then
            log "INFO" "应用容器正在运行"
        else
            log "ERROR" "应用容器未运行"
            services_ok=false
        fi
    else
        # 检查系统服务
        if command -v systemctl &> /dev/null; then
            log "INFO" "检查系统服务状态"
            
            # 检查 MongoDB 服务
            if systemctl is-active --quiet mongodb; then
                log "INFO" "MongoDB 服务正在运行"
            else
                log "ERROR" "MongoDB 服务未运行"
                services_ok=false
            fi
            
            # 检查 Redis 服务
            if systemctl is-active --quiet redis; then
                log "INFO" "Redis 服务正在运行"
            else
                log "ERROR" "Redis 服务未运行"
                services_ok=false
            fi
            
            # 检查应用服务
            if systemctl is-active --quiet $APP_NAME; then
                log "INFO" "应用服务正在运行"
            else
                log "ERROR" "应用服务未运行"
                services_ok=false
            fi
        else
            # 检查进程
            log "INFO" "检查进程状态"
            
            # 检查 MongoDB 进程
            if pgrep -f "mongod" > /dev/null; then
                log "INFO" "MongoDB 进程正在运行"
            else
                log "ERROR" "MongoDB 进程未运行"
                services_ok=false
            fi
            
            # 检查 Redis 进程
            if pgrep -f "redis-server" > /dev/null; then
                log "INFO" "Redis 进程正在运行"
            else
                log "ERROR" "Redis 进程未运行"
                services_ok=false
            fi
            
            # 检查 Node.js 进程
            if pgrep -f "node.*$APP_NAME" > /dev/null; then
                log "INFO" "Node.js 进程正在运行"
            else
                log "ERROR" "Node.js 进程未运行"
                services_ok=false
            fi
        fi
    fi
    
    # 检查端口
    log "INFO" "检查端口状态"
    
    # 检查 MongoDB 端口
    if command -v nc &> /dev/null; then
        if nc -z $MONGODB_HOST $MONGODB_PORT; then
            log "INFO" "MongoDB 端口 $MONGODB_PORT 已开放"
        else
            log "ERROR" "MongoDB 端口 $MONGODB_PORT 未开放"
            services_ok=false
        fi
        
        # 检查 Redis 端口
        if nc -z $REDIS_HOST $REDIS_PORT; then
            log "INFO" "Redis 端口 $REDIS_PORT 已开放"
        else
            log "ERROR" "Redis 端口 $REDIS_PORT 未开放"
            services_ok=false
        fi
        
        # 检查 API 端口
        local api_port=$(echo $API_BASE_URL | sed -n 's/.*:\([0-9]*\).*/\1/p')
        if [ -n "$api_port" ]; then
            local api_host=$(echo $API_BASE_URL | sed -n 's/http:\/\/\([^:\/]*\).*/\1/p')
            if nc -z $api_host $api_port; then
                log "INFO" "API 端口 $api_port 已开放"
            else
                log "ERROR" "API 端口 $api_port 未开放"
                services_ok=false
            fi
        fi
    else
        log "WARN" "nc 命令不可用，跳过端口检查"
    fi
    
    if [ "$services_ok" = true ]; then
        log "INFO" "所有服务状态正常"
        return 0
    else
        log "ERROR" "服务状态异常"
        return 1
    fi
}

# 验证 API 端点
verify_api_endpoints() {
    log "INFO" "验证 API 端点..."
    local api_ok=true
    
    # 检查 curl 命令是否可用
    if ! command -v curl &> /dev/null; then
        log "ERROR" "curl 命令不可用，无法验证 API 端点"
        return 1
    fi
    
    # 检查健康端点
    log "INFO" "检查健康端点: $API_BASE_URL/health"
    local health_status=$(curl -s -o /dev/null -w "%{http_code}" $API_BASE_URL/health)
    if [ "$health_status" = "200" ]; then
        log "INFO" "健康端点状态正常"
    else
        log "ERROR" "健康端点状态异常: $health_status"
        api_ok=false
    fi
    
    # 检查 API 版本端点
    log "INFO" "检查 API 版本端点: $API_BASE_URL/api/version"
    local version_status=$(curl -s -o /dev/null -w "%{http_code}" $API_BASE_URL/api/version)
    if [ "$version_status" = "200" ]; then
        log "INFO" "API 版本端点状态正常"
    else
        log "ERROR" "API 版本端点状态异常: $version_status"
        api_ok=false
    fi
    
    # 检查知识图谱服务端点
    log "INFO" "检查知识图谱服务端点: $API_BASE_URL/api/knowledge-graph/status"
    local kg_status=$(curl -s -o /dev/null -w "%{http_code}" $API_BASE_URL/api/knowledge-graph/status)
    if [ "$kg_status" = "200" ]; then
        log "INFO" "知识图谱服务端点状态正常"
    else
        log "ERROR" "知识图谱服务端点状态异常: $kg_status"
        api_ok=false
    fi
    
    # 检查文档处理服务端点
    log "INFO" "检查文档处理服务端点: $API_BASE_URL/api/document-processor/status"
    local doc_status=$(curl -s -o /dev/null -w "%{http_code}" $API_BASE_URL/api/document-processor/status)
    if [ "$doc_status" = "200" ]; then
        log "INFO" "文档处理服务端点状态正常"
    else
        log "ERROR" "文档处理服务端点状态异常: $doc_status"
        api_ok=false
    fi
    
    # 检查搜索服务端点
    log "INFO" "检查搜索服务端点: $API_BASE_URL/api/search/status"
    local search_status=$(curl -s -o /dev/null -w "%{http_code}" $API_BASE_URL/api/search/status)
    if [ "$search_status" = "200" ]; then
        log "INFO" "搜索服务端点状态正常"
    else
        log "ERROR" "搜索服务端点状态异常: $search_status"
        api_ok=false
    fi
    
    # 检查 AI 服务端点
    log "INFO" "检查 AI 服务端点: $API_BASE_URL/api/ai/status"
    local ai_status=$(curl -s -o /dev/null -w "%{http_code}" $API_BASE_URL/api/ai/status)
    if [ "$ai_status" = "200" ]; then
        log "INFO" "AI 服务端点状态正常"
    else
        log "ERROR" "AI 服务端点状态异常: $ai_status"
        api_ok=false
    fi
    
    if [ "$api_ok" = true ]; then
        log "INFO" "所有 API 端点状态正常"
        return 0
    else
        log "ERROR" "API 端点状态异常"
        return 1
    fi
}

# 验证数据库连接
verify_database_connections() {
    log "INFO" "验证数据库连接..."
    local db_ok=true
    
    # 验证 MongoDB 连接
    log "INFO" "验证 MongoDB 连接..."
    if command -v mongo &> /dev/null; then
        if mongo --host $MONGODB_HOST --port $MONGODB_PORT --eval "db.stats()" $MONGODB_DB > /dev/null; then
            log "INFO" "MongoDB 连接正常"
        else
            log "ERROR" "MongoDB 连接失败"
            db_ok=false
        fi
    elif command -v mongosh &> /dev/null; then
        if mongosh --host $MONGODB_HOST --port $MONGODB_PORT --eval "db.stats()" $MONGODB_DB > /dev/null; then
            log "INFO" "MongoDB 连接正常"
        else
            log "ERROR" "MongoDB 连接失败"
            db_ok=false
        fi
    else
        log "WARN" "MongoDB 客户端不可用，跳过 MongoDB 连接验证"
    fi
    
    # 验证 Redis 连接
    log "INFO" "验证 Redis 连接..."
    if command -v redis-cli &> /dev/null; then
        if redis-cli -h $REDIS_HOST -p $REDIS_PORT ping | grep -q "PONG"; then
            log "INFO" "Redis 连接正常"
        else
            log "ERROR" "Redis 连接失败"
            db_ok=false
        fi
    else
        log "WARN" "Redis 客户端不可用，跳过 Redis 连接验证"
    fi
    
    if [ "$db_ok" = true ]; then
        log "INFO" "所有数据库连接正常"
        return 0
    else
        log "ERROR" "数据库连接异常"
        return 1
    fi
}

# 验证日志文件
verify_log_files() {
    log "INFO" "验证日志文件..."
    local logs_ok=true
    
    # 检查日志目录
    if [ ! -d "$LOG_DIR" ]; then
        log "ERROR" "日志目录 $LOG_DIR 不存在"
        return 1
    fi
    
    # 检查应用日志文件
    local app_log="$LOG_DIR/app.log"
    if [ -f "$app_log" ]; then
        log "INFO" "应用日志文件存在: $app_log"
        
        # 检查日志文件大小
        local app_log_size=$(stat -c%s "$app_log" 2>/dev/null || stat -f%z "$app_log")
        log "INFO" "应用日志文件大小: $app_log_size 字节"
        
        # 检查日志文件权限
        local app_log_perms=$(stat -c%a "$app_log" 2>/dev/null || stat -f%p "$app_log" | cut -c4-6)
        log "INFO" "应用日志文件权限: $app_log_perms"
        
        # 检查日志文件内容是否有错误
        if grep -q "ERROR" "$app_log"; then
            log "WARN" "应用日志文件包含错误信息"
            logs_ok=false
        fi
    else
        log "WARN" "应用日志文件不存在: $app_log"
        logs_ok=false
    fi
    
    # 检查知识图谱服务日志文件
    local kg_log="$LOG_DIR/knowledge-graph.log"
    if [ -f "$kg_log" ]; then
        log "INFO" "知识图谱服务日志文件存在: $kg_log"
        
        # 检查日志文件内容是否有错误
        if grep -q "ERROR" "$kg_log"; then
            log "WARN" "知识图谱服务日志文件包含错误信息"
            logs_ok=false
        fi
    else
        log "WARN" "知识图谱服务日志文件不存在: $kg_log"
    fi
    
    # 检查文档处理服务日志文件
    local doc_log="$LOG_DIR/document-processor.log"
    if [ -f "$doc_log" ]; then
        log "INFO" "文档处理服务日志文件存在: $doc_log"
        
        # 检查日志文件内容是否有错误
        if grep -q "ERROR" "$doc_log"; then
            log "WARN" "文档处理服务日志文件包含错误信息"
            logs_ok=false
        fi
    else
        log "WARN" "文档处理服务日志文件不存在: $doc_log"
    fi
    
    # 检查搜索服务日志文件
    local search_log="$LOG_DIR/search.log"
    if [ -f "$search_log" ]; then
        log "INFO" "搜索服务日志文件存在: $search_log"
        
        # 检查日志文件内容是否有错误
        if grep -q "ERROR" "$search_log"; then
            log "WARN" "搜索服务日志文件包含错误信息"
            logs_ok=false
        fi
    else
        log "WARN" "搜索服务日志文件不存在: $search_log"
    fi
    
    # 检查 AI 服务日志文件
    local ai_log="$LOG_DIR/ai.log"
    if [ -f "$ai_log" ]; then
        log "INFO" "AI 服务日志文件存在: $ai_log"
        
        # 检查日志文件内容是否有错误
        if grep -q "ERROR" "$ai_log"; then
            log "WARN" "AI 服务日志文件包含错误信息"
            logs_ok=false
        fi
    else
        log "WARN" "AI 服务日志文件不存在: $ai_log"
    fi
    
    if [ "$logs_ok" = true ]; then
        log "INFO" "所有日志文件状态正常"
        return 0
    else
        log "WARN" "日志文件状态异常"
        return 1
    fi
}

# 生成验证报告
generate_report() {
    local services_result=$1
    local api_result=$2
    local db_result=$3
    local logs_result=$4
    
    log "INFO" "生成验证报告..."
    
    local report_file="$LOG_DIR/deployment_verification_report_$(date +%Y%m%d).md"
    
    echo "# BASB 系统部署验证报告" > $report_file
    echo "生成时间: $(date)" >> $report_file
    echo "" >> $report_file
    
    echo "## 验证结果摘要" >> $report_file
    echo "" >> $report_file
    echo "| 验证项目 | 状态 |" >> $report_file
    echo "|---------|------|" >> $report_file
    
    if [ $services_result -eq 0 ]; then
        echo "| 服务状态 | ✅ 正常 |" >> $report_file
    else
        echo "| 服务状态 | ❌ 异常 |" >> $report_file
    fi
    
    if [ $api_result -eq 0 ]; then
        echo "| API 端点 | ✅ 正常 |" >> $report_file
    else
        echo "| API 端点 | ❌ 异常 |" >> $report_file
    fi
    
    if [ $db_result -eq 0 ]; then
        echo "| 数据库连接 | ✅ 正常 |" >> $report_file
    else
        echo "| 数据库连接 | ❌ 异常 |" >> $report_file
    fi
    
    if [ $logs_result -eq 0 ]; then
        echo "| 日志文件 | ✅ 正常 |" >> $report_file
    else
        echo "| 日志文件 | ⚠️ 警告 |" >> $report_file
    fi
    
    echo "" >> $report_file
    
    # 添加详细日志
    echo "## 详细验证日志" >> $report_file
    echo "" >> $report_file
    echo '```' >> $report_file
    cat $VERIFY_LOG >> $report_file
    echo '```' >> $report_file
    
    # 添加系统信息
    echo "" >> $report_file
    echo "## 系统信息" >> $report_file
    echo "" >> $report_file
    echo "- 操作系统: $(uname -s) $(uname -r)" >> $report_file
    echo "- 主机名: $(hostname)" >> $report_file
    echo "- 应用目录: $APP_DIR" >> $report_file
    echo "- 配置目录: $CONFIG_DIR" >> $report_file
    echo "- 日志目录: $LOG_DIR" >> $report_file
    echo "- API 基础 URL: $API_BASE_URL" >> $report_file
    
    log "INFO" "验证报告已生成: $report_file"
    
    # 显示报告摘要
    echo ""
    echo "验证报告摘要:"
    echo "-------------"
    if [ $services_result -eq 0 ]; then
        echo -e "${GREEN}[✓] 服务状态: 正常${NC}"
    else
        echo -e "${RED}[✗] 服务状态: 异常${NC}"
    fi
    
    if [ $api_result -eq 0 ]; then
        echo -e "${GREEN}[✓] API 端点: 正常${NC}"
    else
        echo -e "${RED}[✗] API 端点: 异常${NC}"
    fi
    
    if [ $db_result -eq 0 ]; then
        echo -e "${GREEN}[✓] 数据库连接: 正常${NC}"
    else
        echo -e "${RED}[✗] 数据库连接: 异常${NC}"
    fi
    
    if [ $logs_result -eq 0 ]; then
        echo -e "${GREEN}[✓] 日志文件: 正常${NC}"
    else
        echo -e "${YELLOW}[!] 日志文件: 警告${NC}"
    fi
    echo "-------------"
    echo "详细报告: $report_file"
    echo ""
    
    # 计算总体结果
    if [ $services_result -eq 0 ] && [ $api_result -eq 0 ] && [ $db_result -eq 0 ]; then
        log "INFO" "部署验证通过"
        return 0
    else
        log "ERROR" "部署验证失败"
        return 1
    fi
}

# 主函数
main() {
    # 解析命令行参数
    local SERVICES_ONLY=false
    local API_ONLY=false
    local DB_ONLY=false
    local LOGS_ONLY=false
    local FULL=true
    local VERBOSE=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -u|--url)
                API_BASE_URL=$2
                shift 2
                ;;
            -d|--dir)
                APP_DIR=$2
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -s|--services)
                SERVICES_ONLY=true
                FULL=false
                shift
                ;;
            -a|--api)
                API_ONLY=true
                FULL=false
                shift
                ;;
            -db|--database)
                DB_ONLY=true
                FULL=false
                shift
                ;;
            -l|--logs)
                LOGS_ONLY=true
                FULL=false
                shift
                ;;
            -f|--full)
                FULL=true
                shift
                ;;
            *)
                echo "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    log "INFO" "开始验证 BASB 系统部署"
    log "INFO" "应用目录: $APP_DIR"
    log "INFO" "配置目录: $CONFIG_DIR"
    log "INFO" "日志目录: $LOG_DIR"
    log "INFO" "API 基础 URL: $API_BASE_URL"
    
    local services_result=0
    local api_result=0
    local db_result=0
    local logs_result=0
    
    # 执行验证
    if [ $FULL = true ] || [ $SERVICES_ONLY = true ]; then
        verify_services
        services_result=$?
    fi
    
    if [ $FULL = true ] || [ $API_ONLY = true ]; then
        verify_api_endpoints
        api_result=$?
    fi
    
    if [ $FULL = true ] || [ $DB_ONLY = true ]; then
        verify_database_connections
        db_result=$?
    fi
    
    if [ $FULL = true ] || [ $LOGS_ONLY = true ]; then
        verify_log_files
        logs_result=$?
    fi
    
    # 生成报告
    generate_report $services_result $api_result $db_result $logs_result
    local report_result=$?
    
    exit $report_result
}

# 运行主函数
main "$@"