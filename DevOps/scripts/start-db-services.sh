#!/bin/bash

# BASB 系统数据库服务启动脚本

# 设置颜色
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
NC="\033[0m" # 无颜色

# 显示标题
echo -e "${YELLOW}=== BASB 系统数据库服务启动 ===${NC}"

# 检查 Docker 和 Docker Compose
if ! command -v docker &> /dev/null; then
  echo -e "${RED}错误: Docker 未安装${NC}"
  echo "请安装 Docker 后再运行此脚本"
  exit 1
fi

if ! docker info &>/dev/null; then
  echo -e "${RED}错误: Docker 服务未运行${NC}"
  echo "请启动 Docker 服务后再运行此脚本"
  exit 1
fi

if ! command -v docker-compose &> /dev/null; then
  echo -e "${YELLOW}警告: Docker Compose 未安装，尝试使用 docker compose 命令${NC}"
  DOCKER_COMPOSE="docker compose"
else
  DOCKER_COMPOSE="docker-compose"
fi

# 解析命令行参数
DETACH=true
RESTART=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--foreground)
      DETACH=false
      shift
      ;;
    -r|--restart)
      RESTART=true
      shift
      ;;
    -h|--help)
      echo -e "${YELLOW}BASB 系统数据库服务启动脚本${NC}"
      echo ""
      echo "用法: ./scripts/start-db-services.sh [选项]"
      echo ""
      echo "选项:"
      echo "  -f, --foreground    在前台运行服务（不分离）"
      echo "  -r, --restart       重启服务（如果已运行）"
      echo "  -h, --help          显示此帮助信息"
      echo ""
      exit 0
      ;;
    *)
      echo -e "${RED}错误: 未知选项 $1${NC}"
      exit 1
      ;;
  esac
done

# 检查服务是否已运行
MONGODB_RUNNING=false
REDIS_RUNNING=false

if docker ps | grep -q "basb-mongodb"; then
  MONGODB_RUNNING=true
fi

if docker ps | grep -q "basb-redis"; then
  REDIS_RUNNING=true
fi

# 如果服务已运行且需要重启
if [ "$RESTART" = true ]; then
  echo -e "\n${GREEN}停止现有服务...${NC}"
  $DOCKER_COMPOSE -f docker-compose.db.yml down
  MONGODB_RUNNING=false
  REDIS_RUNNING=false
fi

# 启动服务
if [ "$MONGODB_RUNNING" = true ] && [ "$REDIS_RUNNING" = true ]; then
  echo -e "\n${GREEN}MongoDB 和 Redis 服务已在运行${NC}"
  echo "MongoDB 运行在端口 27017"
  echo "Redis 运行在端口 6379"
else
  echo -e "\n${GREEN}启动数据库服务...${NC}"
  
  if [ "$DETACH" = true ]; then
    $DOCKER_COMPOSE -f docker-compose.db.yml up -d
    
    # 等待服务启动
    echo -e "\n${GREEN}等待服务启动...${NC}"
    sleep 5
    
    # 检查服务状态
    if docker ps | grep -q "basb-mongodb"; then
      echo -e "MongoDB 服务: ${GREEN}已启动${NC} (端口 27017)"
    else
      echo -e "MongoDB 服务: ${RED}启动失败${NC}"
    fi
    
    if docker ps | grep -q "basb-redis"; then
      echo -e "Redis 服务: ${GREEN}已启动${NC} (端口 6379)"
    else
      echo -e "Redis 服务: ${RED}启动失败${NC}"
    fi
  else
    echo "服务将在前台运行，按 Ctrl+C 停止"
    $DOCKER_COMPOSE -f docker-compose.db.yml up
  fi
fi

# 显示连接信息
if [ "$DETACH" = true ]; then
  echo -e "\n${GREEN}数据库服务连接信息:${NC}"
  echo "MongoDB URI: mongodb://localhost:27017/basb"
  echo "Redis URL: redis://localhost:6379"
  echo -e "\n使用以下命令停止服务:\n  ${YELLOW}docker-compose -f docker-compose.db.yml down${NC}"
fi