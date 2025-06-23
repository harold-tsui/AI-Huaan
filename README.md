# AI第二大脑系统
基于Obsidian的第二大脑（个人知识管理）应用，实现Tiago Forte的Building a Second Brain (BASB)方法论。其后端采用DeepSeek MCP（Model Context Protocol）原子服务架构为系统提供AI增强，而前端则使用 React 和 Vite 构建。为用户提供智能化的知识捕获、组织、提炼和表达能力。

**当前版本**: 0.1.1 (开发中)

## 系统概述

AI第二大脑系统是一个AI驱动的个人知识管理系统，旨在扩展认知能力，实现知识的自动化捕获、智能化处理和主动化应用。系统基于MCP（微服务组件平台）作为原子服务基础，构建了完整的知识处理流程和动态用户上下文管理。

### 核心功能

- **多渠道信息捕获**：网页内容、文档处理、语音转录、图像识别、社交媒体
- **AI内容分析**：主题提取、情感分析、实体识别、关系映射、智能摘要
- **动态知识图谱**：向量化存储、语义相似性、概念关联、知识演化
- **用户上下文管理**：多维度用户画像、动态更新机制、版本管理
- **知识激活应用**：主动推送、上下文感知、定期回顾、AI助手交互

## 项目结构

```
src/
├── core/              # 核心引擎
│   ├── knowledge/     # 知识处理相关
│   ├── context/       # 用户上下文相关
│   └── activation/    # 知识激活相关
├── mcp/               # MCP服务集成
│   ├── obsidian/      # Obsidian MCP
│   ├── github/        # GitHub MCP
│   └── custom/        # 自定义MCP
├── api/               # API接口
├── services/          # 业务服务
├── models/            # 数据模型
├── utils/             # 工具函数
└── config/            # 配置文件
```

## 技术栈

- **后端**：Node.js, Express, TypeScript
- **数据存储**：Pinecone/ChromaDB, MongoDB, Redis
- **AI服务**：OpenAI API, Whisper API, Embedding API
- **系统服务**：Kong, Docker, Kubernetes, RabbitMQ, Prometheus/Grafana
- **前端**：React, Next.js, TypeScript, Chakra UI

## 快速开始

### 环境要求

- Node.js 18+
- Docker & Docker Compose
- MongoDB
- Redis

### 安装步骤

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/ai-second-brain.git
   cd ai-second-brain
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 配置环境变量
   ```bash
   cp .env.example .env
   # 编辑.env文件，填入必要的API密钥和配置
   ```

4. 启动开发服务器
   ```bash
   npm run dev
   ```

## 文档

- [架构设计](./docs/architecture.md)
- [API文档](./docs/api.md)
- [MCP服务开发指南](./docs/mcp-development.md)
- [用户上下文模型](./docs/user-context-model.md)
- [部署指南](./docs/deployment.md)
- [版本信息](./VERSION.md)
- [更新日志](./CHANGELOG.md)

## 贡献指南

请查看[贡献指南](./CONTRIBUTING.md)了解如何参与项目开发。

## 许可证

本项目采用MIT许可证 - 详见[LICENSE](./LICENSE)文件。