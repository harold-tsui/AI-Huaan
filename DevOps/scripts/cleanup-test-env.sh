#!/bin/bash

# BASB 系统测试环境清理脚本

# 设置颜色
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
NC="\033[0m" # 无颜色

# 显示标题
echo -e "${YELLOW}=== BASB 系统测试环境清理 ===${NC}"

# 解析命令行参数
FORCE=false
CLEAN_ALL=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--force)
      FORCE=true
      shift
      ;;
    -a|--all)
      CLEAN_ALL=true
      shift
      ;;
    -h|--help)
      echo -e "${YELLOW}BASB 系统测试环境清理脚本${NC}"
      echo ""
      echo "用法: ./scripts/cleanup-test-env.sh [选项]"
      echo ""
      echo "选项:"
      echo "  -f, --force    强制清理，不提示确认"
      echo "  -a, --all      清理所有测试相关文件，包括日志和覆盖率报告"
      echo "  -h, --help     显示此帮助信息"
      echo ""
      exit 0
      ;;
    *)
      echo -e "${RED}错误: 未知选项 $1${NC}"
      exit 1
      ;;
  esac
done

# 确认清理
if [ "$FORCE" = false ]; then
  echo -e "${RED}警告: 此操作将清理测试环境，包括测试数据和容器。${NC}"
  if [ "$CLEAN_ALL" = true ]; then
    echo -e "${RED}警告: 将清理所有测试相关文件，包括日志和覆盖率报告。${NC}"
  fi
  read -p "是否继续? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}操作已取消${NC}"
    exit 0
  fi
fi

# 停止测试容器
echo -e "\n${GREEN}停止测试容器...${NC}"
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
  if [ -f "docker-compose.test.yml" ]; then
    docker-compose -f docker-compose.test.yml down -v
    echo "测试容器已停止并删除"
  else
    echo "未找到 docker-compose.test.yml 文件"
  fi
  
  # 清理测试相关的 Docker 容器
  TEST_CONTAINERS=$(docker ps -a | grep -E 'app-test|mongodb-test|redis-test' | awk '{print $1}')
  if [ -n "$TEST_CONTAINERS" ]; then
    echo "清理测试相关的 Docker 容器..."
    docker rm -f $TEST_CONTAINERS
  fi
  
  # 清理测试相关的 Docker 卷
  TEST_VOLUMES=$(docker volume ls | grep -E 'mongodb-test-data|redis-test-data' | awk '{print $2}')
  if [ -n "$TEST_VOLUMES" ]; then
    echo "清理测试相关的 Docker 卷..."
    docker volume rm $TEST_VOLUMES
  fi
else
  echo "Docker 或 Docker Compose 未安装，跳过容器清理"
fi

# 清理测试数据目录
echo -e "\n${GREEN}清理测试数据目录...${NC}"
if [ -d "test-storage" ]; then
  rm -rf test-storage
  echo "测试存储目录已清理"
fi

if [ -d "test-results" ]; then
  rm -rf test-results
  echo "测试结果目录已清理"
fi

# 清理测试数据库
echo -e "\n${GREEN}清理测试数据库...${NC}"
if command -v mongosh &> /dev/null; then
  echo "尝试清理 MongoDB 测试数据库..."
  mongosh --eval "db.getSiblingDB('basb-test').dropDatabase()" || echo "无法连接到 MongoDB 或清理数据库失败"
fi

if command -v redis-cli &> /dev/null; then
  echo "尝试清理 Redis 测试数据..."
  redis-cli -n 1 flushdb || echo "无法连接到 Redis 或清理数据失败"
fi

# 清理所有测试相关文件
if [ "$CLEAN_ALL" = true ]; then
  echo -e "\n${GREEN}清理所有测试相关文件...${NC}"
  
  # 清理测试日志
  if [ -d "logs/test" ]; then
    rm -rf logs/test
    echo "测试日志已清理"
  fi
  
  if [ -d "logs/monitor" ]; then
    rm -rf logs/monitor
    echo "监控日志已清理"
  fi
  
  # 清理覆盖率报告
  if [ -d "coverage" ]; then
    rm -rf coverage
    echo "测试覆盖率报告已清理"
  fi
  
  # 清理临时文件
  find . -name "*.log" -type f -delete
  find . -name "*.tmp" -type f -delete
  find . -name "*.pid" -type f -delete
  echo "临时文件已清理"
fi

echo -e "\n${GREEN}测试环境清理完成!${NC}"