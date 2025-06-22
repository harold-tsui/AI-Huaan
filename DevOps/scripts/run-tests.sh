#!/bin/bash

# BASB 系统测试运行脚本
# 用法: ./scripts/run-tests.sh [测试文件或目录] [选项]

# 设置颜色
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
NC="\033[0m" # 无颜色

# 显示帮助信息
show_help() {
  echo -e "${YELLOW}BASB 系统测试运行脚本${NC}"
  echo ""
  echo "用法: ./scripts/run-tests.sh [测试文件或目录] [选项]"
  echo ""
  echo "选项:"
  echo "  -w, --watch       监视模式运行测试"
  echo "  -c, --coverage    生成测试覆盖率报告"
  echo "  -v, --verbose     显示详细输出"
  echo "  -h, --help        显示此帮助信息"
  echo ""
  echo "示例:"
  echo "  ./scripts/run-tests.sh                     # 运行所有测试"
  echo "  ./scripts/run-tests.sh -w                  # 监视模式运行所有测试"
  echo "  ./scripts/run-tests.sh -c                  # 生成所有测试的覆盖率报告"
  echo "  ./scripts/run-tests.sh src/__tests__/environment.test.ts  # 运行特定测试文件"
  echo "  ./scripts/run-tests.sh src/__tests__/knowledge-graph-mcp.test.ts -v  # 运行特定测试文件并显示详细输出"
}

# 默认值
WATCH=""
COVERAGE=""
VERBOSE=""
TEST_PATH=""

# 解析命令行参数
while [[ $# -gt 0 ]]; do
  case $1 in
    -w|--watch)
      WATCH="--watch"
      shift
      ;;
    -c|--coverage)
      COVERAGE="--coverage"
      shift
      ;;
    -v|--verbose)
      VERBOSE="--verbose"
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    -*)
      echo -e "${RED}错误: 未知选项 $1${NC}"
      show_help
      exit 1
      ;;
    *)
      TEST_PATH="$1"
      shift
      ;;
  esac
done

# 构建命令
COMMAND="npx jest"

# 添加测试路径
if [ -n "$TEST_PATH" ]; then
  COMMAND="$COMMAND $TEST_PATH"
fi

# 添加选项
if [ -n "$WATCH" ]; then
  COMMAND="$COMMAND $WATCH"
fi

if [ -n "$COVERAGE" ]; then
  COMMAND="$COMMAND $COVERAGE"
fi

if [ -n "$VERBOSE" ]; then
  COMMAND="$COMMAND $VERBOSE"
fi

# 运行命令
echo -e "${GREEN}运行测试命令: $COMMAND${NC}"
echo ""
$COMMAND