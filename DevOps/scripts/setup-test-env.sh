#!/bin/bash

# BASB 系统测试环境设置脚本

# 设置颜色
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
NC="\033[0m" # 无颜色

# 显示标题
echo -e "${YELLOW}=== BASB 系统测试环境设置 ===${NC}"

# 检查 Node.js 和 npm
echo -e "\n${GREEN}检查 Node.js 和 npm...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}错误: Node.js 未安装${NC}"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo -e "${RED}错误: npm 未安装${NC}"
  exit 1
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo -e "Node.js 版本: ${NODE_VERSION}"
echo -e "npm 版本: ${NPM_VERSION}"

# 安装依赖
echo -e "\n${GREEN}安装项目依赖...${NC}"
npm ci

# 检查 MongoDB
echo -e "\n${GREEN}检查 MongoDB...${NC}"
if command -v mongosh &> /dev/null; then
  echo "MongoDB 客户端已安装"
else
  echo -e "${YELLOW}警告: MongoDB 客户端未安装${NC}"
  echo "测试将使用 Docker 中的 MongoDB 或连接到远程 MongoDB"
fi

# 检查 Redis
echo -e "\n${GREEN}检查 Redis...${NC}"
if command -v redis-cli &> /dev/null; then
  echo "Redis 客户端已安装"
else
  echo -e "${YELLOW}警告: Redis 客户端未安装${NC}"
  echo "测试将使用 Docker 中的 Redis 或连接到远程 Redis"
fi

# 检查 Docker
echo -e "\n${GREEN}检查 Docker...${NC}"
if command -v docker &> /dev/null; then
  DOCKER_VERSION=$(docker --version)
  echo "Docker 已安装: ${DOCKER_VERSION}"
  
  if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION=$(docker-compose --version)
    echo "Docker Compose 已安装: ${DOCKER_COMPOSE_VERSION}"
  else
    echo -e "${YELLOW}警告: Docker Compose 未安装${NC}"
    echo "如果需要使用 Docker Compose 运行测试环境，请安装 Docker Compose"
  fi
else
  echo -e "${YELLOW}警告: Docker 未安装${NC}"
  echo "如果需要使用 Docker 运行测试环境，请安装 Docker"
fi

# 创建测试数据目录
echo -e "\n${GREEN}创建测试数据目录...${NC}"
mkdir -p test-storage
mkdir -p test-results

# 复制测试环境配置文件
echo -e "\n${GREEN}设置测试环境配置...${NC}"
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

if [ -f "${SCRIPT_DIR}/../.env.test" ]; then
  echo "测试环境配置文件 ${SCRIPT_DIR}/../.env.test 已存在"
else
  echo -e "${RED}错误: 测试环境配置文件 ${SCRIPT_DIR}/../.env.test 不存在${NC}"
  exit 1
fi

# 运行简单测试以验证环境
echo -e "\n${GREEN}运行环境验证测试...${NC}"
npm test -- --testPathPattern=src/__tests__/environment.test.ts

echo -e "\n${GREEN}测试环境设置完成!${NC}"
echo -e "使用以下命令运行测试:"
echo -e "  ${YELLOW}npm test${NC}                # 运行所有测试"
echo -e "  ${YELLOW}./scripts/run-tests.sh${NC}  # 使用测试运行脚本"
echo -e "  ${YELLOW}docker-compose -f docker-compose.test.yml up${NC}  # 使用 Docker Compose 运行测试"