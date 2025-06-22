# BASB 系统测试环境部署指南

## 目录

1. [概述](#概述)
2. [环境要求](#环境要求)
3. [测试环境设置](#测试环境设置)
4. [运行测试](#运行测试)
5. [Docker 容器化测试](#docker-容器化测试)
6. [持续集成](#持续集成)
7. [监控测试环境](#监控测试环境)
8. [清理测试环境](#清理测试环境)
9. [故障排除](#故障排除)
10. [最佳实践](#最佳实践)

## 概述

BASB (Building a Second Brain) 系统测试环境是一个专门用于测试 BASB 系统各个组件和服务的环境。本指南详细说明了如何设置、使用和维护测试环境，以确保测试过程的可靠性和一致性。

## 环境要求

### 软件要求

- **Node.js**: v18.x 或更高版本
- **npm**: v8.x 或更高版本
- **MongoDB**: v6.x（用于测试数据存储）
- **Redis**: v7.x（用于缓存和会话管理）
- **Docker** 和 **Docker Compose**（可选，用于容器化测试）

### 硬件建议

- **CPU**: 4 核或更多
- **内存**: 8GB 或更多
- **磁盘空间**: 10GB 可用空间

## 测试环境设置

### 自动设置

我们提供了一个自动化脚本来设置测试环境：

```bash
./scripts/setup-test-env.sh
```

此脚本将：
1. 检查必要的软件依赖
2. 安装项目依赖
3. 创建必要的目录
4. 设置测试环境配置
5. 运行环境验证测试

### 手动设置

如果您需要手动设置测试环境，请按照以下步骤操作：

1. **克隆代码库**：
   ```bash
   git clone <repository-url>
   cd basb-system
   ```

2. **安装依赖**：
   ```bash
   npm ci
   ```

3. **创建测试环境配置文件**：
   ```bash
   cp .env.example .env.test
   # 编辑 .env.test 文件，设置适当的测试环境变量
   ```

4. **创建必要的目录**：
   ```bash
   mkdir -p test-storage
   mkdir -p test-results
   mkdir -p logs/test
   ```

5. **验证测试环境**：
   ```bash
   npm test -- --testPathPattern=src/__tests__/environment.test.ts
   ```

## 运行测试

### 使用 npm 命令

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- src/__tests__/knowledge-graph-mcp.test.ts

# 监视模式运行测试
npm test -- --watch

# 生成测试覆盖率报告
npm test -- --coverage
```

### 使用测试运行脚本

我们提供了一个便捷的脚本来运行测试：

```bash
# 运行所有测试
./scripts/run-tests.sh

# 运行特定测试文件
./scripts/run-tests.sh src/__tests__/knowledge-graph-mcp.test.ts

# 监视模式运行测试
./scripts/run-tests.sh -w

# 生成测试覆盖率报告
./scripts/run-tests.sh -c

# 显示详细输出
./scripts/run-tests.sh -v
```

运行 `./scripts/run-tests.sh -h` 查看完整的命令选项。

## Docker 容器化测试

### 使用 Docker Compose

我们提供了 Docker Compose 配置来在容器化环境中运行测试：

```bash
# 构建并启动测试容器
docker-compose -f docker-compose.test.yml up --build

# 在后台运行测试容器
docker-compose -f docker-compose.test.yml up -d

# 查看测试日志
docker-compose -f docker-compose.test.yml logs -f

# 停止并删除测试容器
docker-compose -f docker-compose.test.yml down -v
```

### 使用 Dockerfile

您也可以直接使用 Dockerfile.test 构建测试镜像：

```bash
# 构建测试镜像
docker build -t basb-test -f Dockerfile.test .

# 运行测试容器
docker run --rm basb-test
```

## 持续集成

### GitHub Actions

我们配置了 GitHub Actions 工作流来自动运行测试。每当代码推送到 `main` 或 `develop` 分支，或者创建针对这些分支的拉取请求时，测试将自动运行。

工作流配置文件位于 `.github/workflows/test.yml`。

### 本地 CI 模拟

您可以在本地模拟 CI 环境：

```bash
# 安装依赖
npm ci

# 运行测试
NODE_ENV=test npm test
```

## 监控测试环境

我们提供了一个脚本来监控测试环境的状态和资源使用情况：

```bash
# 使用默认设置监控测试环境
./scripts/monitor-test-env.sh

# 设置监控间隔和持续时间
./scripts/monitor-test-env.sh -i 10 -d 1800
```

监控日志将保存在 `logs/monitor/` 目录中。

## 清理测试环境

测试完成后，您可以使用我们提供的脚本清理测试环境：

```bash
# 清理测试环境
./scripts/cleanup-test-env.sh

# 强制清理，不提示确认
./scripts/cleanup-test-env.sh -f

# 清理所有测试相关文件，包括日志和覆盖率报告
./scripts/cleanup-test-env.sh -a
```

## 故障排除

### 常见问题

1. **测试失败但没有明确错误信息**
   - 尝试使用 `--verbose` 选项运行测试以获取更详细的输出
   - 检查 `logs/test/` 目录中的日志文件

2. **无法连接到 MongoDB 或 Redis**
   - 确保服务正在运行
   - 检查 `.env.test` 中的连接配置
   - 如果使用 Docker，确保容器正在运行并且端口映射正确

3. **测试运行缓慢**
   - 使用 `--runInBand` 选项串行运行测试
   - 检查系统资源使用情况
   - 使用监控脚本识别瓶颈

### 日志文件

测试日志位于以下位置：
- 测试日志: `logs/test/`
- 监控日志: `logs/monitor/`

## 最佳实践

1. **保持测试环境隔离**
   - 使用专用的数据库和缓存实例
   - 避免在测试环境中使用生产数据

2. **定期清理测试环境**
   - 测试完成后使用清理脚本
   - 定期检查和清理测试数据和日志

3. **监控资源使用情况**
   - 使用监控脚本跟踪资源使用
   - 注意内存泄漏和性能下降

4. **保持测试环境与生产环境一致**
   - 使用相同版本的依赖
   - 模拟生产环境的配置

5. **自动化测试流程**
   - 利用 CI/CD 管道自动运行测试
   - 将测试结果与代码审查集成