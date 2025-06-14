# 知识图谱MCP服务 (Knowledge Graph MCP Service)

## 概述

知识图谱MCP服务是对知识图谱服务的MCP协议包装，提供标准化的MCP接口，使知识图谱服务能够与其他MCP服务进行互操作。该服务实现了`IMCPService`接口，并使用底层的知识图谱服务实现（如`MemoryKnowledgeGraphService`或`Neo4jKnowledgeGraphService`）来处理实际的知识图谱操作。

## 功能特性

- **节点管理**：创建、查询、更新和删除知识图谱节点
- **关系管理**：创建、查询、更新和删除知识图谱关系
- **图遍历**：遍历图结构，查找路径
- **向量搜索**：基于向量相似度的语义搜索
- **统计信息**：获取知识图谱统计信息

## 使用方法

### 初始化服务

```typescript
import { globalKnowledgeGraphMCPService } from './services/knowledge-graph-mcp';
import { KnowledgeGraphServiceType } from './shared/knowledge-graph-services';

// 使用默认配置初始化
await globalKnowledgeGraphMCPService.initialize();

// 或使用自定义配置初始化
await globalKnowledgeGraphMCPService.initialize({
  knowledgeGraphConfig: {
    type: KnowledgeGraphServiceType.MEMORY,
    enableVectorSearch: true,
    vectorDimension: 1536
  }
});
```

### 发送MCP请求

```typescript
import { v4 as uuidv4 } from 'uuid';
import { MCPRequest } from './shared/mcp-core/types';
import { globalKnowledgeGraphMCPService } from './services/knowledge-graph-mcp';
import { NodeType } from './shared/knowledge-graph-services/types';

// 创建节点请求
const createNodeRequest: MCPRequest = {
  id: uuidv4(),
  service: 'KnowledgeGraphService',
  version: '1.0.0',
  action: 'createNode',
  params: {
    input: {
      type: NodeType.CONCEPT,
      label: '测试概念',
      properties: {
        description: '这是一个测试概念节点',
        tags: ['测试', 'MCP服务']
      }
    }
  },
  metadata: {
    timestamp: new Date(),
    source: 'example'
  }
};

// 处理请求
const response = await globalKnowledgeGraphMCPService.handleRequest(createNodeRequest);
console.log('响应:', response);
```

### 通过MCP请求处理器发送请求

```typescript
import { v4 as uuidv4 } from 'uuid';
import { MCPRequest } from './shared/mcp-core/types';
import { globalRequestHandler } from './shared/mcp-core/request-handler';
import { NodeType } from './shared/knowledge-graph-services/types';

// 创建节点请求
const createNodeRequest: MCPRequest = {
  id: uuidv4(),
  service: 'KnowledgeGraphService',
  version: '1.0.0',
  action: 'createNode',
  params: {
    input: {
      type: NodeType.CONCEPT,
      label: '测试概念',
      properties: {
        description: '这是一个测试概念节点',
        tags: ['测试', 'MCP服务']
      }
    }
  },
  metadata: {
    timestamp: new Date(),
    source: 'example'
  }
};

// 通过全局请求处理器发送请求
const response = await globalRequestHandler.handleRequest(createNodeRequest);
console.log('响应:', response);
```

## 支持的操作

### 节点管理

- `createNode`: 创建节点
- `getNode`: 获取节点
- `updateNode`: 更新节点
- `deleteNode`: 删除节点
- `queryNodes`: 查询节点

### 关系管理

- `createRelationship`: 创建关系
- `getRelationship`: 获取关系
- `updateRelationship`: 更新关系
- `deleteRelationship`: 删除关系
- `queryRelationships`: 查询关系

### 图遍历

- `traverseGraph`: 图遍历
- `findShortestPath`: 查找最短路径
- `findAllPaths`: 查找所有路径

### 向量搜索

- `vectorSearch`: 向量搜索

### 统计信息

- `getGraphStats`: 获取图统计信息

## 配置选项

知识图谱MCP服务支持以下配置选项：

```typescript
export interface KnowledgeGraphMCPServiceConfig extends ServiceConfig {
  // 知识图谱服务配置
  knowledgeGraphConfig?: KnowledgeGraphServiceConfig;
}
```

其中，`KnowledgeGraphServiceConfig`定义如下：

```typescript
export interface KnowledgeGraphServiceConfig {
  // 服务类型
  type: KnowledgeGraphServiceType;
  // 是否启用向量搜索
  enableVectorSearch?: boolean;
  // 向量维度
  vectorDimension?: number;
  // Neo4j配置（仅在type为NEO4J时使用）
  neo4j?: {
    uri: string;
    username: string;
    password: string;
    database?: string;
    enableApoc?: boolean;
    enableGds?: boolean;
  };
}
```

## 测试

可以使用以下命令运行测试：

```bash
ts-node src/services/knowledge-graph-mcp/test.ts
```

## 依赖关系

- `@shared/mcp-core`: MCP核心库
- `@shared/knowledge-graph-services`: 知识图谱服务库
- `uuid`: 用于生成唯一ID