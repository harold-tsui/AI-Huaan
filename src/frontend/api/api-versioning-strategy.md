# API 版本控制策略

本文档定义了 BASB 系统中 API 版本控制的策略和最佳实践，旨在确保 API 变更能够平滑进行，同时保持前端和后端的兼容性。

## 目录

- [版本控制原则](#版本控制原则)
- [版本号格式](#版本号格式)
- [API 路径版本控制](#api-路径版本控制)
- [请求头版本控制](#请求头版本控制)
- [查询参数版本控制](#查询参数版本控制)
- [内容协商版本控制](#内容协商版本控制)
- [版本兼容性](#版本兼容性)
- [版本生命周期](#版本生命周期)
- [版本迁移策略](#版本迁移策略)
- [客户端适配策略](#客户端适配策略)
- [版本控制最佳实践](#版本控制最佳实践)

## 版本控制原则

1. **显式版本控制**：所有 API 都应该有明确的版本标识。
2. **向后兼容**：新版本应尽可能保持向后兼容，避免破坏现有客户端。
3. **渐进式变更**：重大变更应该分阶段进行，给客户端足够的时间适应。
4. **版本并行**：多个 API 版本可以并行存在，直到旧版本被正式弃用。
5. **明确的弃用策略**：旧版本的弃用应该有明确的时间表和通知机制。

## 版本号格式

BASB 系统采用语义化版本号（Semantic Versioning）格式：`vX.Y.Z`

- **X**：主版本号，当 API 发生不兼容的变更时递增
- **Y**：次版本号，当 API 以向后兼容的方式添加功能时递增
- **Z**：修订版本号，当 API 以向后兼容的方式修复问题时递增

在 API 路径中，通常只使用主版本号，例如：`/api/v1/users`。

## API 路径版本控制

BASB 系统主要采用 API 路径版本控制方式，在 URL 路径中包含版本号。

### 格式

```
/api/v{version}/{resource}
```

### 示例

```
/api/v1/users/{userId}/knowledge-items
/api/v2/users/{userId}/knowledge-items
```

### 优点

- 简单直观，易于理解和使用
- 便于在 API 网关或负载均衡器级别进行路由
- 支持缓存和浏览器书签

### 缺点

- URL 路径变更可能需要客户端代码修改
- 不利于资源的统一表示

## 请求头版本控制

除了路径版本控制外，BASB 系统也支持通过自定义请求头指定 API 版本。

### 格式

```
X-API-Version: v{version}
```

### 示例

```
GET /api/users/{userId}/knowledge-items
X-API-Version: v2
```

### 使用场景

- 当需要在不更改 URL 的情况下切换 API 版本时
- 在 API 路径版本控制之外提供更细粒度的版本控制

## 查询参数版本控制

BASB 系统也支持通过查询参数指定 API 版本，但这不是首选方法。

### 格式

```
/api/{resource}?version=v{version}
```

### 示例

```
/api/users/{userId}/knowledge-items?version=v2
```

### 使用场景

- 临时测试新版本 API
- 向后兼容旧客户端

## 内容协商版本控制

BASB 系统支持通过 Accept 头进行内容协商版本控制。

### 格式

```
Accept: application/json;version=v{version}
```

### 示例

```
GET /api/users/{userId}/knowledge-items
Accept: application/json;version=v2
```

### 使用场景

- 当需要同时支持多种表示格式和版本时
- 在复杂的 API 生态系统中提供更灵活的版本控制

## 版本兼容性

### 向后兼容变更（不需要增加主版本号）

- 添加新的端点或资源
- 添加新的可选请求参数
- 添加新的响应字段
- 放宽验证规则
- 更改错误消息文本（但不更改错误代码）

### 不兼容变更（需要增加主版本号）

- 删除或重命名端点、资源或字段
- 更改字段类型或格式
- 添加新的必需请求参数
- 更改请求或响应的结构
- 更改错误代码
- 更改 API 的行为或业务逻辑

## 版本生命周期

BASB 系统中的 API 版本生命周期包括以下阶段：

1. **开发阶段**：版本处于开发中，可能会有频繁变更，不建议在生产环境使用。
2. **预览阶段**：版本基本稳定，但仍可能有变更，可以在非关键系统中试用。
3. **稳定阶段**：版本正式发布，保证稳定性和兼容性，建议在生产环境使用。
4. **弃用阶段**：版本已被新版本取代，但仍然可用，建议迁移到新版本。
5. **停用阶段**：版本不再可用，所有客户端必须迁移到新版本。

### 版本支持政策

- 主版本至少支持 12 个月
- 弃用通知至少提前 6 个月发出
- 同时最多支持 2 个主版本

## 版本迁移策略

### 渐进式迁移

1. **并行运行**：新旧版本 API 并行运行一段时间
2. **引导迁移**：通过文档、通知和警告引导客户端迁移到新版本
3. **监控使用情况**：监控旧版本 API 的使用情况，确定何时可以安全停用
4. **正式弃用**：在确定大多数客户端已迁移后，正式弃用旧版本

### 迁移辅助工具

- 提供迁移指南和文档
- 开发迁移工具或脚本
- 提供新旧版本之间的映射层

## 客户端适配策略

### 前端适配器模式

BASB 系统前端采用适配器模式处理不同版本的 API：

```typescript
// API 版本适配器接口
interface IApiVersionAdapter {
  adaptRequest(request: any): any;
  adaptResponse(response: any): any;
}

// v1 到 v2 的适配器
class V1ToV2Adapter implements IApiVersionAdapter {
  adaptRequest(request: any): any {
    // 将 v1 请求转换为 v2 请求
    if (request.metadata && request.metadata.tags) {
      request.tags = request.metadata.tags;
      delete request.metadata.tags;
    }
    return request;
  }
  
  adaptResponse(response: any): any {
    // 将 v2 响应转换为 v1 响应
    if (response.tags) {
      if (!response.metadata) response.metadata = {};
      response.metadata.tags = response.tags;
      delete response.tags;
    }
    return response;
  }
}

// API 客户端工厂中使用适配器
class ApiClientFactory {
  // ...
  
  private getVersionAdapter(fromVersion: string, toVersion: string): IApiVersionAdapter | null {
    const adapterKey = `${fromVersion}To${toVersion}`;
    const adapters: Record<string, IApiVersionAdapter> = {
      'v1Tov2': new V1ToV2Adapter(),
      // 其他适配器...
    };
    
    return adapters[adapterKey] || null;
  }
  
  public async request(config: AxiosRequestConfig, apiVersion: string = 'v1'): Promise<any> {
    // 获取当前客户端使用的 API 版本
    const clientVersion = this.config.version || 'v1';
    
    // 如果请求版本与客户端版本不同，使用适配器
    if (apiVersion !== clientVersion) {
      const adapter = this.getVersionAdapter(clientVersion, apiVersion);
      if (adapter) {
        // 适配请求
        if (config.data) {
          config.data = adapter.adaptRequest(config.data);
        }
        
        // 发送请求
        const response = await this.apiClient.request(config);
        
        // 适配响应
        if (response.data) {
          response.data = adapter.adaptResponse(response.data);
        }
        
        return response;
      }
    }
    
    // 版本相同或没有适配器，直接发送请求
    return await this.apiClient.request(config);
  }
}
```

### 特性检测

除了版本适配器外，前端还可以使用特性检测来处理不同版本的 API：

```typescript
async function createKnowledgeItem(userId: string, item: any) {
  // 检查 API 是否支持新的标签结构
  const supportsNewTagsStructure = await checkApiFeature('newTagsStructure');
  
  if (supportsNewTagsStructure) {
    // 使用新版本 API 结构
    item.tags = item.metadata.tags;
    delete item.metadata.tags;
  }
  
  return await api.post(`/users/${userId}/knowledge-items`, item);
}

async function checkApiFeature(featureName: string): Promise<boolean> {
  try {
    const response = await api.get('/api-features');
    return response.data.features.includes(featureName);
  } catch (error) {
    // 如果出错，假设不支持该特性
    return false;
  }
}
```

## 版本控制最佳实践

1. **明确的版本策略**：在项目开始时就制定明确的版本控制策略，并在团队中达成共识。

2. **文档化版本差异**：详细记录不同版本之间的差异，包括新增、修改和删除的功能。

3. **自动化测试**：为每个 API 版本编写自动化测试，确保版本更新不会破坏现有功能。

4. **版本监控**：监控不同版本的使用情况，了解客户端迁移进度。

5. **渐进式弃用**：给客户端足够的时间迁移到新版本，避免突然停用旧版本。

6. **保持简单**：避免同时维护过多的 API 版本，增加维护成本。

7. **一致的错误处理**：在所有版本中保持一致的错误处理机制，便于客户端处理错误。

8. **版本透明度**：确保 API 消费者能够轻松了解当前使用的版本以及可用的版本。

9. **兼容性层**：在服务器端实现兼容性层，减轻客户端适配的负担。

10. **API 变更日志**：维护详细的 API 变更日志，记录每个版本的变更内容。