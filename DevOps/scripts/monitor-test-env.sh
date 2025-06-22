#!/bin/bash

# BASB 系统测试环境监控脚本

# 设置颜色
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m" # 无颜色

# 显示标题
echo -e "${YELLOW}=== BASB 系统测试环境监控 ===${NC}"

# 检查参数
INTERVAL=5 # 默认监控间隔（秒）
DURATION=3600 # 默认监控持续时间（秒）

while [[ $# -gt 0 ]]; do
  case $1 in
    -i|--interval)
      INTERVAL="$2"
      shift 2
      ;;
    -d|--duration)
      DURATION="$2"
      shift 2
      ;;
    -h|--help)
      echo -e "${YELLOW}BASB 系统测试环境监控脚本${NC}"
      echo ""
      echo "用法: ./scripts/monitor-test-env.sh [选项]"
      echo ""
      echo "选项:"
      echo "  -i, --interval <秒>   监控间隔（默认: 5秒）"
      echo "  -d, --duration <秒>   监控持续时间（默认: 3600秒）"
      echo "  -h, --help            显示此帮助信息"
      echo ""
      exit 0
      ;;
    *)
      echo -e "${RED}错误: 未知选项 $1${NC}"
      exit 1
      ;;
  esac
done

echo -e "监控间隔: ${INTERVAL}秒"
echo -e "监控持续时间: ${DURATION}秒"

# 创建日志目录
LOG_DIR="./logs/monitor"
mkdir -p "$LOG_DIR"

# 日志文件
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/monitor_$TIMESTAMP.log"

# 监控函数
monitor() {
  # 记录时间戳
  echo -e "\n${BLUE}=== $(date) ===${NC}" | tee -a "$LOG_FILE"
  
  # 检查 Node.js 进程
  echo -e "\n${GREEN}Node.js 进程:${NC}" | tee -a "$LOG_FILE"
  ps aux | grep node | grep -v grep | tee -a "$LOG_FILE"
  
  # 检查系统资源
  echo -e "\n${GREEN}系统资源使用情况:${NC}" | tee -a "$LOG_FILE"
  echo -e "${YELLOW}CPU 使用情况:${NC}" | tee -a "$LOG_FILE"
  top -l 1 | head -n 10 | tee -a "$LOG_FILE"
  
  echo -e "\n${YELLOW}内存使用情况:${NC}" | tee -a "$LOG_FILE"
  vm_stat | tee -a "$LOG_FILE"
  
  echo -e "\n${YELLOW}磁盘使用情况:${NC}" | tee -a "$LOG_FILE"
  df -h | tee -a "$LOG_FILE"
  
  # 检查 Docker 容器（如果有）
  if command -v docker &> /dev/null; then
    echo -e "\n${GREEN}Docker 容器:${NC}" | tee -a "$LOG_FILE"
    docker ps | tee -a "$LOG_FILE"
    
    # 检查测试相关的容器
    TEST_CONTAINERS=$(docker ps | grep -E 'mongodb|redis|app-test' | awk '{print $1}')
    if [ -n "$TEST_CONTAINERS" ]; then
      echo -e "\n${YELLOW}测试容器资源使用情况:${NC}" | tee -a "$LOG_FILE"
      docker stats --no-stream $TEST_CONTAINERS | tee -a "$LOG_FILE"
    fi
  fi
  
  # 检查网络连接
  echo -e "\n${GREEN}网络连接:${NC}" | tee -a "$LOG_FILE"
  netstat -an | grep -E '3001|3002|3003|3004|3005|27017|6379' | tee -a "$LOG_FILE"
  
  # 检查日志文件大小
  echo -e "\n${GREEN}日志文件大小:${NC}" | tee -a "$LOG_FILE"
  find ./logs -type f -name "*.log" -exec ls -lh {} \; | tee -a "$LOG_FILE"
}

# 主循环
echo -e "开始监控，日志保存到: $LOG_FILE"
echo -e "按 Ctrl+C 停止监控\n"

START_TIME=$(date +%s)
END_TIME=$((START_TIME + DURATION))

while [ $(date +%s) -lt $END_TIME ]; do
  monitor
  sleep $INTERVAL
done

echo -e "\n${GREEN}监控完成，日志已保存到: $LOG_FILE${NC}"