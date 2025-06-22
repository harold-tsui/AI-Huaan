#!/bin/bash

# BASB 系统部署脚本
# 用于自动化部署 BASB 系统到生产环境

set -e

# 配置
APP_NAME="basb"
APP_DIR="/opt/basb"
CONFIG_DIR="/etc/basb"
LOG_DIR="/var/log/basb"
BACKUP_DIR="/var/backups/basb"
DEPLOY_LOG="$LOG_DIR/deploy_$(date +%Y%m%d%H%M%S).log"
SOURCE_DIR="$(pwd)"
ENV="production"
DOCKER_COMPOSE_FILE="docker-compose.yml"
DOCKER_COMPOSE_DB_FILE="docker-compose.db.yml"

# 颜色定义
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
NC="\033[0m" # No Color

# 显示帮助信息
show_help() {
    echo "BASB 系统部署脚本"
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help              显示此帮助信息"
    echo "  -e, --env ENV           设置部署环境 (默认: production)"
    echo "  -d, --dir DIR           设置部署目录 (默认: /opt/basb)"
    echo "  -b, --backup            部署前备份当前系统"
    echo "  -f, --force             强制部署，忽略警告"
    echo "  -s, --skip-tests        跳过部署前测试"
    echo "  -n, --no-restart        部署后不重启服务"
    echo "  -v, --verbose           显示详细输出"
    echo ""
    echo "示例:"
    echo "  $0 --env staging        部署到测试环境"
    echo "  $0 --backup             部署前备份当前系统"
    echo "  $0 --force              强制部署，忽略警告"
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
    mkdir -p "$(dirname $DEPLOY_LOG)"
    
    # 写入日志文件
    echo "[$level] $timestamp - $message" >> $DEPLOY_LOG
}

# 检查系统要求
check_system_requirements() {
    log "INFO" "检查系统要求..."
    
    # 检查操作系统
    local os=$(uname -s)
    log "INFO" "操作系统: $os"
    
    # 检查 Docker
    if command -v docker &> /dev/null; then
        local docker_version=$(docker --version | awk '{print $3}' | tr -d ',')
        log "INFO" "Docker 版本: $docker_version"
    else
        log "ERROR" "Docker 未安装"
        return 1
    fi
    
    # 检查 Docker Compose
    if command -v docker-compose &> /dev/null; then
        local compose_version=$(docker-compose --version | awk '{print $3}' | tr -d ',')
        log "INFO" "Docker Compose 版本: $compose_version"
    else
        log "ERROR" "Docker Compose 未安装"
        return 1
    fi
    
    # 检查 Node.js（如果需要）
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        log "INFO" "Node.js 版本: $node_version"
    else
        log "WARN" "Node.js 未安装，某些功能可能不可用"
    fi
    
    # 检查磁盘空间
    local disk_space=$(df -h / | awk 'NR==2 {print $4}')
    log "INFO" "可用磁盘空间: $disk_space"
    
    # 检查内存
    local memory=$(free -h | awk '/^Mem:/ {print $4}')
    log "INFO" "可用内存: $memory"
    
    # 检查 CPU
    local cpu_cores=$(nproc)
    log "INFO" "CPU 核心数: $cpu_cores"
    
    return 0
}

# 验证配置文件
validate_config() {
    log "INFO" "验证配置文件..."
    
    # 检查环境配置文件
    local env_file=".env.$ENV"
    if [ ! -f "$env_file" ]; then
        log "ERROR" "环境配置文件 $env_file 不存在"
        return 1
    fi
    log "INFO" "环境配置文件 $env_file 已验证"
    
    # 检查 Docker Compose 文件
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        log "ERROR" "Docker Compose 文件 $DOCKER_COMPOSE_FILE 不存在"
        return 1
    fi
    log "INFO" "Docker Compose 文件 $DOCKER_COMPOSE_FILE 已验证"
    
    # 检查数据库 Docker Compose 文件
    if [ ! -f "$DOCKER_COMPOSE_DB_FILE" ]; then
        log "WARN" "数据库 Docker Compose 文件 $DOCKER_COMPOSE_DB_FILE 不存在，将使用主 Docker Compose 文件"
    else
        log "INFO" "数据库 Docker Compose 文件 $DOCKER_COMPOSE_DB_FILE 已验证"
    fi
    
    # 检查应用配置文件
    if [ -d "config" ]; then
        local config_files=$(find config -type f | wc -l)
        log "INFO" "找到 $config_files 个配置文件"
    else
        log "WARN" "配置目录不存在"
    fi
    
    return 0
}

# 备份当前系统
backup_system() {
    log "INFO" "备份当前系统..."
    
    # 检查备份脚本
    local backup_script="scripts/backup.sh"
    if [ -f "$backup_script" ]; then
        log "INFO" "使用备份脚本 $backup_script"
        bash "$backup_script" --full
        if [ $? -ne 0 ]; then
            log "ERROR" "备份失败"
            return 1
        fi
        log "INFO" "备份完成"
    else
        log "WARN" "备份脚本不存在，跳过备份"
    fi
    
    return 0
}

# 运行部署前测试
run_pre_deploy_tests() {
    log "INFO" "运行部署前测试..."
    
    # 检查测试脚本
    local test_script="scripts/run-tests.sh"
    if [ -f "$test_script" ]; then
        log "INFO" "使用测试脚本 $test_script"
        bash "$test_script"
        if [ $? -ne 0 ]; then
            log "ERROR" "测试失败"
            return 1
        fi
        log "INFO" "测试通过"
    else
        # 尝试使用 npm test
        if command -v npm &> /dev/null && [ -f "package.json" ]; then
            log "INFO" "使用 npm test"
            npm test
            if [ $? -ne 0 ]; then
                log "ERROR" "测试失败"
                return 1
            fi
            log "INFO" "测试通过"
        else
            log "WARN" "测试脚本不存在，跳过测试"
        fi
    fi
    
    return 0
}

# 准备部署目录
prepare_deploy_directory() {
    log "INFO" "准备部署目录..."
    
    # 创建部署目录
    if [ ! -d "$APP_DIR" ]; then
        log "INFO" "创建部署目录 $APP_DIR"
        mkdir -p "$APP_DIR"
    else
        log "INFO" "部署目录 $APP_DIR 已存在"
    fi
    
    # 创建配置目录
    if [ ! -d "$CONFIG_DIR" ]; then
        log "INFO" "创建配置目录 $CONFIG_DIR"
        mkdir -p "$CONFIG_DIR"
    fi
    
    # 创建日志目录
    if [ ! -d "$LOG_DIR" ]; then
        log "INFO" "创建日志目录 $LOG_DIR"
        mkdir -p "$LOG_DIR"
    fi
    
    # 创建备份目录
    if [ ! -d "$BACKUP_DIR" ]; then
        log "INFO" "创建备份目录 $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
    
    return 0
}

# 复制应用文件
copy_application_files() {
    log "INFO" "复制应用文件..."
    
    # 复制源代码
    log "INFO" "复制源代码到 $APP_DIR"
    rsync -av --exclude=".git" --exclude="node_modules" --exclude="logs" --exclude="tmp" "$SOURCE_DIR/" "$APP_DIR/"
    
    # 复制环境配置文件
    log "INFO" "复制环境配置文件 .env.$ENV 到 $APP_DIR/.env"
    cp "$SOURCE_DIR/.env.$ENV" "$APP_DIR/.env"
    
    # 复制配置文件
    if [ -d "$SOURCE_DIR/config" ]; then
        log "INFO" "复制配置文件到 $CONFIG_DIR"
        rsync -av "$SOURCE_DIR/config/" "$CONFIG_DIR/"
    fi
    
    # 设置权限
    log "INFO" "设置权限"
    chown -R $(whoami):$(whoami) "$APP_DIR"
    chown -R $(whoami):$(whoami) "$CONFIG_DIR"
    chown -R $(whoami):$(whoami) "$LOG_DIR"
    
    return 0
}

# 安装依赖
install_dependencies() {
    log "INFO" "安装依赖..."
    
    # 检查 package.json
    if [ -f "$APP_DIR/package.json" ]; then
        log "INFO" "安装 Node.js 依赖"
        cd "$APP_DIR"
        npm install --production
        if [ $? -ne 0 ]; then
            log "ERROR" "依赖安装失败"
            return 1
        fi
        log "INFO" "依赖安装完成"
    else
        log "WARN" "package.json 不存在，跳过依赖安装"
    fi
    
    return 0
}

# 启动数据库服务
start_database_services() {
    log "INFO" "启动数据库服务..."
    
    # 检查数据库 Docker Compose 文件
    if [ -f "$APP_DIR/$DOCKER_COMPOSE_DB_FILE" ]; then
        log "INFO" "使用 Docker Compose 启动数据库服务"
        cd "$APP_DIR"
        docker-compose -f "$DOCKER_COMPOSE_DB_FILE" up -d
        if [ $? -ne 0 ]; then
            log "ERROR" "数据库服务启动失败"
            return 1
        fi
        log "INFO" "数据库服务已启动"
    else
        log "WARN" "数据库 Docker Compose 文件不存在，跳过数据库服务启动"
    fi
    
    return 0
}

# 启动应用服务
start_application_services() {
    log "INFO" "启动应用服务..."
    
    # 检查 Docker Compose 文件
    if [ -f "$APP_DIR/$DOCKER_COMPOSE_FILE" ]; then
        log "INFO" "使用 Docker Compose 启动应用服务"
        cd "$APP_DIR"
        docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
        if [ $? -ne 0 ]; then
            log "ERROR" "应用服务启动失败"
            return 1
        fi
        log "INFO" "应用服务已启动"
    else
        # 尝试使用 PM2
        if command -v pm2 &> /dev/null && [ -f "$APP_DIR/ecosystem.config.js" ]; then
            log "INFO" "使用 PM2 启动应用服务"
            cd "$APP_DIR"
            pm2 start ecosystem.config.js --env $ENV
            if [ $? -ne 0 ]; then
                log "ERROR" "应用服务启动失败"
                return 1
            fi
            log "INFO" "应用服务已启动"
        else
            log "ERROR" "无法启动应用服务，缺少 Docker Compose 文件或 PM2 配置"
            return 1
        fi
    fi
    
    return 0
}

# 验证部署
verify_deployment() {
    log "INFO" "验证部署..."
    
    # 等待服务启动
    log "INFO" "等待服务启动..."
    sleep 10
    
    # 检查 Docker 容器状态
    if command -v docker &> /dev/null; then
        log "INFO" "检查 Docker 容器状态"
        docker ps --filter "name=$APP_NAME"
    fi
    
    # 检查应用健康状态
    log "INFO" "检查应用健康状态"
    
    # 检查 HTTP 服务
    local health_endpoint="http://localhost:3000/health"
    if command -v curl &> /dev/null; then
        log "INFO" "检查健康端点: $health_endpoint"
        curl -s $health_endpoint
        if [ $? -ne 0 ]; then
            log "ERROR" "应用健康检查失败"
            return 1
        fi
        log "INFO" "应用健康检查通过"
    else
        log "WARN" "curl 命令不可用，跳过健康检查"
    fi
    
    # 检查日志文件
    log "INFO" "检查日志文件"
    if [ -d "$LOG_DIR" ]; then
        local log_files=$(find $LOG_DIR -name "*.log" -type f | wc -l)
        log "INFO" "找到 $log_files 个日志文件"
    fi
    
    log "INFO" "部署验证完成"
    return 0
}

# 部署后清理
post_deploy_cleanup() {
    log "INFO" "部署后清理..."
    
    # 清理临时文件
    log "INFO" "清理临时文件"
    if [ -d "$APP_DIR/tmp" ]; then
        rm -rf "$APP_DIR/tmp/*"
    fi
    
    # 清理旧的日志文件
    log "INFO" "清理旧的日志文件"
    find $LOG_DIR -name "*.log" -type f -mtime +30 -delete
    
    # 清理 Docker 缓存
    log "INFO" "清理 Docker 缓存"
    docker system prune -f
    
    log "INFO" "清理完成"
    return 0
}

# 主函数
main() {
    # 解析命令行参数
    local BACKUP=false
    local FORCE=false
    local SKIP_TESTS=false
    local NO_RESTART=false
    local VERBOSE=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -e|--env)
                ENV=$2
                shift 2
                ;;
            -d|--dir)
                APP_DIR=$2
                shift 2
                ;;
            -b|--backup)
                BACKUP=true
                shift
                ;;
            -f|--force)
                FORCE=true
                shift
                ;;
            -s|--skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            -n|--no-restart)
                NO_RESTART=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            *)
                echo "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    log "INFO" "开始部署 BASB 系统到 $ENV 环境"
    log "INFO" "部署目录: $APP_DIR"
    log "INFO" "配置目录: $CONFIG_DIR"
    log "INFO" "日志目录: $LOG_DIR"
    log "INFO" "备份目录: $BACKUP_DIR"
    
    # 检查系统要求
    check_system_requirements
    if [ $? -ne 0 ] && [ $FORCE != true ]; then
        log "ERROR" "系统要求检查失败，使用 --force 选项强制部署"
        exit 1
    fi
    
    # 验证配置文件
    validate_config
    if [ $? -ne 0 ] && [ $FORCE != true ]; then
        log "ERROR" "配置验证失败，使用 --force 选项强制部署"
        exit 1
    fi
    
    # 备份当前系统
    if [ $BACKUP == true ]; then
        backup_system
        if [ $? -ne 0 ] && [ $FORCE != true ]; then
            log "ERROR" "备份失败，使用 --force 选项强制部署"
            exit 1
        fi
    fi
    
    # 运行部署前测试
    if [ $SKIP_TESTS != true ]; then
        run_pre_deploy_tests
        if [ $? -ne 0 ] && [ $FORCE != true ]; then
            log "ERROR" "测试失败，使用 --force 选项强制部署"
            exit 1
        fi
    fi
    
    # 准备部署目录
    prepare_deploy_directory
    if [ $? -ne 0 ]; then
        log "ERROR" "部署目录准备失败"
        exit 1
    fi
    
    # 复制应用文件
    copy_application_files
    if [ $? -ne 0 ]; then
        log "ERROR" "应用文件复制失败"
        exit 1
    fi
    
    # 安装依赖
    install_dependencies
    if [ $? -ne 0 ] && [ $FORCE != true ]; then
        log "ERROR" "依赖安装失败，使用 --force 选项强制部署"
        exit 1
    fi
    
    # 启动服务
    if [ $NO_RESTART != true ]; then
        # 启动数据库服务
        start_database_services
        if [ $? -ne 0 ] && [ $FORCE != true ]; then
            log "ERROR" "数据库服务启动失败，使用 --force 选项强制部署"
            exit 1
        fi
        
        # 启动应用服务
        start_application_services
        if [ $? -ne 0 ]; then
            log "ERROR" "应用服务启动失败"
            exit 1
        fi
    fi
    
    # 验证部署
    if [ $NO_RESTART != true ]; then
        verify_deployment
        if [ $? -ne 0 ] && [ $FORCE != true ]; then
            log "ERROR" "部署验证失败，使用 --force 选项忽略验证失败"
            exit 1
        fi
    fi
    
    # 部署后清理
    post_deploy_cleanup
    
    log "INFO" "BASB 系统部署完成"
    
    return 0
}

# 运行主函数
main "$@"