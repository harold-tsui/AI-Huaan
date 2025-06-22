#!/bin/bash

# BASB 系统测试环境状态检查脚本

# 设置颜色
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
NC="\033[0m" # 无颜色

# 显示标题
echo -e "${YELLOW}=== BASB 系统测试环境状态检查 ===${NC}"

# 检查 Node.js 和 npm
echo -e "\n${GREEN}检查 Node.js 和 npm 状态...${NC}"
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  echo -e "Node.js 状态: ${GREEN}正常${NC} (版本: ${NODE_VERSION})"
else
  echo -e "Node.js 状态: ${RED}未安装${NC}"
fi

if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm -v)
  echo -e "npm 状态: ${GREEN}正常${NC} (版本: ${NPM_VERSION})"
else
  echo -e "npm 状态: ${RED}未安装${NC}"
fi

# 检查项目依赖
echo -e "\n${GREEN}检查项目依赖状态...${NC}"
if [ -f "package.json" ]; then
  echo -e "package.json: ${GREEN}存在${NC}"
  
  if [ -d "node_modules" ]; then
    NODE_MODULES_COUNT=$(find node_modules -type d -maxdepth 1 | wc -l)
    echo -e "node_modules: ${GREEN}存在${NC} (包含 $((NODE_MODULES_COUNT-1)) 个包)"
  else
    echo -e "node_modules: ${RED}不存在${NC} (需要运行 npm ci 安装依赖)"
  fi
else
  echo -e "package.json: ${RED}不存在${NC}"
fi

# 检查测试文件
echo -e "\n${GREEN}检查测试文件状态...${NC}"
TEST_FILES_COUNT=$(find src/__tests__ -name "*.test.ts" -o -name "*.spec.ts" 2>/dev/null | wc -l)
if [ "$TEST_FILES_COUNT" -gt 0 ]; then
  echo -e "测试文件: ${GREEN}存在${NC} (共 $TEST_FILES_COUNT 个测试文件)"
  find src/__tests__ -name "*.test.ts" -o -name "*.spec.ts" 2>/dev/null | while read -r file; do
    echo "  - $file"
  done
else
  echo -e "测试文件: ${RED}不存在${NC}"
fi

# 检查测试配置文件
echo -e "\n${GREEN}检查测试配置文件状态...${NC}"
if [ -f "jest.config.js" ]; then
  echo -e "jest.config.js: ${GREEN}存在${NC}"
else
  echo -e "jest.config.js: ${RED}不存在${NC}"
fi

if [ -f "tsconfig.test.json" ]; then
  echo -e "tsconfig.test.json: ${GREEN}存在${NC}"
else
  echo -e "tsconfig.test.json: ${RED}不存在${NC}"
fi

if [ -f ".env.test" ]; then
  echo -e ".env.test: ${GREEN}存在${NC}"
else
  echo -e ".env.test: ${RED}不存在${NC}"
fi

# 检查 Docker 配置
echo -e "\n${GREEN}检查 Docker 配置状态...${NC}"
if [ -f "Dockerfile.test" ]; then
  echo -e "Dockerfile.test: ${GREEN}存在${NC}"
else
  echo -e "Dockerfile.test: ${RED}不存在${NC}"
fi

if [ -f "docker-compose.test.yml" ]; then
  echo -e "docker-compose.test.yml: ${GREEN}存在${NC}"
else
  echo -e "docker-compose.test.yml: ${RED}不存在${NC}"
fi

# 检查测试脚本
echo -e "\n${GREEN}检查测试脚本状态...${NC}"
if [ -f "scripts/run-tests.sh" ] && [ -x "scripts/run-tests.sh" ]; then
  echo -e "run-tests.sh: ${GREEN}存在且可执行${NC}"
else
  if [ -f "scripts/run-tests.sh" ]; then
    echo -e "run-tests.sh: ${YELLOW}存在但不可执行${NC} (需要运行 chmod +x scripts/run-tests.sh)"
  else
    echo -e "run-tests.sh: ${RED}不存在${NC}"
  fi
fi

if [ -f "scripts/setup-test-env.sh" ] && [ -x "scripts/setup-test-env.sh" ]; then
  echo -e "setup-test-env.sh: ${GREEN}存在且可执行${NC}"
else
  if [ -f "scripts/setup-test-env.sh" ]; then
    echo -e "setup-test-env.sh: ${YELLOW}存在但不可执行${NC} (需要运行 chmod +x scripts/setup-test-env.sh)"
  else
    echo -e "setup-test-env.sh: ${RED}不存在${NC}"
  fi
fi

if [ -f "scripts/cleanup-test-env.sh" ] && [ -x "scripts/cleanup-test-env.sh" ]; then
  echo -e "cleanup-test-env.sh: ${GREEN}存在且可执行${NC}"
else
  if [ -f "scripts/cleanup-test-env.sh" ]; then
    echo -e "cleanup-test-env.sh: ${YELLOW}存在但不可执行${NC} (需要运行 chmod +x scripts/cleanup-test-env.sh)"
  else
    echo -e "cleanup-test-env.sh: ${RED}不存在${NC}"
  fi
fi

if [ -f "scripts/monitor-test-env.sh" ] && [ -x "scripts/monitor-test-env.sh" ]; then
  echo -e "monitor-test-env.sh: ${GREEN}存在且可执行${NC}"
else
  if [ -f "scripts/monitor-test-env.sh" ]; then
    echo -e "monitor-test-env.sh: ${YELLOW}存在但不可执行${NC} (需要运行 chmod +x scripts/monitor-test-env.sh)"
  else
    echo -e "monitor-test-env.sh: ${RED}不存在${NC}"
  fi
fi

# 检查 CI/CD 配置
echo -e "\n${GREEN}检查 CI/CD 配置状态...${NC}"
if [ -f ".github/workflows/test.yml" ]; then
  echo -e "GitHub Actions 配置: ${GREEN}存在${NC}"
else
  echo -e "GitHub Actions 配置: ${RED}不存在${NC}"
fi

# 检查数据库服务
echo -e "\n${GREEN}检查数据库服务状态...${NC}"

# 检查 MongoDB
echo -e "${YELLOW}MongoDB:${NC}"
if command -v mongosh &> /dev/null; then
  echo -e "  MongoDB 客户端: ${GREEN}已安装${NC}"
  if nc -z localhost 27017 2>/dev/null; then
    echo -e "  MongoDB 服务: ${GREEN}正在运行${NC} (端口 27017 可访问)"
  else
    echo -e "  MongoDB 服务: ${RED}未运行${NC} (端口 27017 不可访问)"
  fi
else
  echo -e "  MongoDB 客户端: ${YELLOW}未安装${NC}"
  if nc -z localhost 27017 2>/dev/null; then
    echo -e "  MongoDB 服务: ${GREEN}正在运行${NC} (端口 27017 可访问)"
  else
    echo -e "  MongoDB 服务: ${RED}未运行${NC} (端口 27017 不可访问)"
  fi
fi

# 检查 Redis
echo -e "${YELLOW}Redis:${NC}"
if command -v redis-cli &> /dev/null; then
  echo -e "  Redis 客户端: ${GREEN}已安装${NC}"
  if nc -z localhost 6379 2>/dev/null; then
    echo -e "  Redis 服务: ${GREEN}正在运行${NC} (端口 6379 可访问)"
  else
    echo -e "  Redis 服务: ${RED}未运行${NC} (端口 6379 不可访问)"
  fi
else
  echo -e "  Redis 客户端: ${YELLOW}未安装${NC}"
  if nc -z localhost 6379 2>/dev/null; then
    echo -e "  Redis 服务: ${GREEN}正在运行${NC} (端口 6379 可访问)"
  else
    echo -e "  Redis 服务: ${RED}未运行${NC} (端口 6379 不可访问)"
  fi
fi

# 检查 Docker 服务
echo -e "\n${GREEN}检查 Docker 服务状态...${NC}"
if command -v docker &> /dev/null; then
  echo -e "Docker: ${GREEN}已安装${NC}"
  if docker info &>/dev/null; then
    echo -e "Docker 服务: ${GREEN}正在运行${NC}"
    
    # 检查测试相关的容器
    TEST_CONTAINERS=$(docker ps | grep -E 'mongodb|redis|app-test' | wc -l)
    if [ "$TEST_CONTAINERS" -gt 0 ]; then
      echo -e "测试容器: ${GREEN}正在运行${NC} (共 $TEST_CONTAINERS 个)"
      docker ps | grep -E 'mongodb|redis|app-test'
    else
      echo -e "测试容器: ${YELLOW}未运行${NC}"
    fi
  else
    echo -e "Docker 服务: ${RED}未运行${NC}"
  fi
else
  echo -e "Docker: ${RED}未安装${NC}"
fi

# 检查测试目录
echo -e "\n${GREEN}检查测试目录状态...${NC}"
if [ -d "test-storage" ]; then
  echo -e "test-storage 目录: ${GREEN}存在${NC}"
else
  echo -e "test-storage 目录: ${YELLOW}不存在${NC} (将在测试时自动创建)"
fi

if [ -d "test-results" ]; then
  echo -e "test-results 目录: ${GREEN}存在${NC}"
else
  echo -e "test-results 目录: ${YELLOW}不存在${NC} (将在测试时自动创建)"
fi

if [ -d "logs/test" ]; then
  echo -e "logs/test 目录: ${GREEN}存在${NC}"
else
  echo -e "logs/test 目录: ${YELLOW}不存在${NC} (将在测试时自动创建)"
fi

# 检查测试文档
echo -e "\n${GREEN}检查测试文档状态...${NC}"
if [ -f "docs/testing-environment.md" ]; then
  echo -e "testing-environment.md: ${GREEN}存在${NC}"
else
  echo -e "testing-environment.md: ${RED}不存在${NC}"
fi

if [ -f "docs/test-environment-deployment-guide.md" ]; then
  echo -e "test-environment-deployment-guide.md: ${GREEN}存在${NC}"
else
  echo -e "test-environment-deployment-guide.md: ${RED}不存在${NC}"
fi

# 总结
echo -e "\n${YELLOW}=== 测试环境状态总结 ===${NC}"
PROBLEMS=0

# 检查关键组件
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
  echo -e "${RED}[问题] Node.js 或 npm 未安装${NC}"
  PROBLEMS=$((PROBLEMS+1))
fi

if [ ! -d "node_modules" ]; then
  echo -e "${RED}[问题] 项目依赖未安装${NC}"
  PROBLEMS=$((PROBLEMS+1))
fi

if [ "$TEST_FILES_COUNT" -eq 0 ]; then
  echo -e "${RED}[问题] 没有测试文件${NC}"
  PROBLEMS=$((PROBLEMS+1))
fi

if [ ! -f "jest.config.js" ] || [ ! -f "tsconfig.test.json" ] || [ ! -f ".env.test" ]; then
  echo -e "${RED}[问题] 缺少测试配置文件${NC}"
  PROBLEMS=$((PROBLEMS+1))
fi

if [ ! -f "scripts/run-tests.sh" ] || [ ! -x "scripts/run-tests.sh" ]; then
  echo -e "${YELLOW}[警告] 测试运行脚本不存在或不可执行${NC}"
fi

# 输出总结
if [ "$PROBLEMS" -eq 0 ]; then
  echo -e "\n${GREEN}测试环境状态良好，可以运行测试。${NC}"
  echo -e "运行以下命令开始测试:\n  ${YELLOW}npm test${NC} 或 ${YELLOW}./scripts/run-tests.sh${NC}"
else
  echo -e "\n${RED}测试环境存在 $PROBLEMS 个问题，需要解决后才能运行测试。${NC}"
  echo -e "运行以下命令设置测试环境:\n  ${YELLOW}./scripts/setup-test-env.sh${NC}"
fi