# 前端 API 客户端文档

本文档详细说明了BASB系统前端API客户端的使用方法，包括知识项API的接口定义、参数说明和使用示例。

## 目录

- [安装与配置](#安装与配置)
- [API客户端工厂](#api客户端工厂)
- [知识项API客户端](#知识项api客户端)
  - [获取知识项列表](#获取知识项列表)
  - [获取特定知识项](#获取特定知识项)
  - [创建知识项](#创建知识项)
  - [更新知识项](#更新知识项)
  - [部分更新知识项](#部分更新知识项)
  - [删除知识项](#删除知识项)
  - [搜索知识项](#搜索知识项)
- [类型定义](#类型定义)
- [错误处理](#错误处理)
- [最佳实践](#最佳实践)

## 安装与配置

前端API客户端依赖于Axios库，请确保项目中已安装：

```bash
npm install axios
# 或
yarn add axios
```

## API客户端工厂

API客户端工厂采用单例模式，用于统一管理和创建各种API客户端实例。

### 初始化

```typescript
import { ApiClientFactory } from './api/api-client-factory';

// 初始化API客户端工厂
const apiFactory = ApiClientFactory.getInstance({
  baseUrl: 'https://api.example.com',  // API基础URL
  version: 'v1',                       // API版本，默认为'v1'
  timeout: 30000,                      // 请求超时时间（毫秒），默认为30000
  headers: {                           // 自定义请求头
    'X-Custom-Header': 'value'
  }
});
```

### 获取API客户端

```typescript
// 获取知识项API客户端
const knowledgeItemApiClient = apiFactory.getKnowledgeItemApiClient();
```

### 更新配置

```typescript
// 更新API配置
apiFactory.updateConfig({
  timeout: 60000,
  headers: {
    'X-New-Header': 'new-value'
  }
});
```

## 知识项API客户端

知识项API客户端提供了与知识项相关的所有API操作。

### 获取知识项列表

```typescript
import { KnowledgeItemSortField, SortDirection } from './api/types';

// 获取用户的知识项列表
async function fetchKnowledgeItems(userId: string) {
  try {
    const result = await knowledgeItemApiClient.getKnowledgeItems(userId, {
      contentType: ContentType.MARKDOWN,
      tags: ['important', 'work'],
      categories: ['project'],
      createdAt: { min: new Date('2023-01-01').toISOString() },
      importance: { min: 3 },
      sortBy: KnowledgeItemSortField.CREATED_AT,
      sortDirection: SortDirection.DESC,
      limit: 10,
      offset: 0
    });
    
    console.log(`获取到${result.total}条知识项，当前显示${result.items.length}条`);
    return result.items;
  } catch (error) {
    console.error('获取知识项列表失败:', error);
    throw error;
  }
}
```

### 获取特定知识项

```typescript
// 获取特定知识项
async function fetchKnowledgeItem(userId: string, itemId: string) {
  try {
    const item = await knowledgeItemApiClient.getKnowledgeItem(userId, itemId);
    console.log('获取到知识项:', item.title);
    return item;
  } catch (error) {
    console.error('获取知识项失败:', error);
    throw error;
  }
}
```

### 创建知识项

```typescript
import { ContentType, SecurityLevel, SourceType } from './api/types';

// 创建知识项
async function createNewKnowledgeItem(userId: string) {
  try {
    const newItem = await knowledgeItemApiClient.createKnowledgeItem(userId, {
      title: '新的知识项',
      content: '这是一个新的知识项内容，使用Markdown格式。',
      contentType: ContentType.MARKDOWN,
      source: {
        type: SourceType.WEB,
        url: 'https://example.com/article',
        author: 'John Doe'
      },
      metadata: {
        tags: ['新知识', '学习'],
        categories: ['技术'],
        language: 'zh-CN',
        readingTime: 5,
        importance: 4
      },
      securityLevel: SecurityLevel.PRIVATE
    });
    
    console.log('创建知识项成功:', newItem.id);
    return newItem;
  } catch (error) {
    console.error('创建知识项失败:', error);
    throw error;
  }
}
```

### 更新知识项

```typescript
// 更新知识项
async function updateExistingKnowledgeItem(userId: string, itemId: string) {
  try {
    const updatedItem = await knowledgeItemApiClient.updateKnowledgeItem(userId, itemId, {
      title: '更新后的知识项标题',
      content: '更新后的知识项内容',
      metadata: {
        tags: ['更新', '重要'],
        categories: ['技术'],
        language: 'zh-CN',
        importance: 5
      }
    });
    
    console.log('更新知识项成功:', updatedItem.title);
    return updatedItem;
  } catch (error) {
    console.error('更新知识项失败:', error);
    throw error;
  }
}
```

### 部分更新知识项

```typescript
// 部分更新知识项
async function patchKnowledgeItem(userId: string, itemId: string) {
  try {
    const patchedItem = await knowledgeItemApiClient.patchKnowledgeItem(userId, itemId, {
      title: '部分更新的标题',
      metadata: {
        tags: ['部分更新']
      }
    });
    
    console.log('部分更新知识项成功:', patchedItem.title);
    return patchedItem;
  } catch (error) {
    console.error('部分更新知识项失败:', error);
    throw error;
  }
}
```

### 删除知识项

```typescript
// 删除知识项
async function deleteKnowledgeItem(userId: string, itemId: string) {
  try {
    const success = await knowledgeItemApiClient.deleteKnowledgeItem(userId, itemId);
    if (success) {
      console.log('删除知识项成功');
    } else {
      console.warn('删除知识项可能未成功');
    }
    return success;
  } catch (error) {
    console.error('删除知识项失败:', error);
    throw error;
  }
}
```

### 搜索知识项

```typescript
// 搜索知识项
async function searchKnowledgeItems(userId: string, searchQuery: string) {
  try {
    const result = await knowledgeItemApiClient.searchKnowledgeItems(userId, searchQuery, {
      contentType: ContentType.MARKDOWN,
      tags: ['重要'],
      sortBy: KnowledgeItemSortField.IMPORTANCE,
      sortDirection: SortDirection.DESC,
      limit: 20
    });
    
    console.log(`搜索到${result.total}条知识项，当前显示${result.items.length}条`);
    return result.items;
  } catch (error) {
    console.error('搜索知识项失败:', error);
    throw error;
  }
}
```

## 类型定义

所有API相关的类型定义都在 `types.ts` 文件中，包括：

- `ContentType`: 内容类型枚举
- `SourceType`: 来源类型枚举
- `SecurityLevel`: 安全级别枚举

知识项API客户端中定义的接口包括：

- `KnowledgeItem`: 知识项接口
- `Source`: 来源接口
- `Metadata`: 元数据接口
- `KnowledgeItemFilters`: 知识项过滤器接口
- `IntRange`: 整数范围接口
- `KnowledgeItemSortField`: 知识项排序字段枚举
- `SortDirection`: 排序方向枚举
- `CreateKnowledgeItemInput`: 创建知识项输入接口
- `UpdateKnowledgeItemInput`: 更新知识项输入接口
- `PaginatedResult<T>`: 分页结果接口
- `ApiResponse<T>`: API响应接口
- `ApiError`: API错误接口

## 错误处理

API客户端内部已实现基本的错误处理逻辑，包括：

1. 401未授权错误：自动清除token并重定向到登录页
2. 其他HTTP错误：记录错误信息到控制台
3. 网络错误：记录错误信息到控制台

在应用中，建议使用try-catch捕获API调用可能抛出的错误，并根据业务需求进行处理。

## 最佳实践

1. **使用API客户端工厂**：始终通过ApiClientFactory获取API客户端实例，避免直接实例化。

2. **统一错误处理**：在应用中实现统一的错误处理逻辑，例如显示错误提示、记录错误日志等。

   ```typescript
   import { ApiError } from './api/knowledge-item-api-client';
   
   function handleApiError(error: any) {
     if (error.response?.data?.error) {
       const apiError = error.response.data.error as ApiError;
       // 根据错误代码显示不同的错误提示
       switch (apiError.code) {
         case 'VALIDATION_ERROR':
           showErrorMessage('输入数据验证失败，请检查输入');
           break;
         case 'RESOURCE_NOT_FOUND':
           showErrorMessage('请求的资源不存在');
           break;
         default:
           showErrorMessage(`操作失败: ${apiError.message}`);
       }
     } else {
       showErrorMessage('操作失败，请稍后重试');
     }
   }
   ```

3. **请求状态管理**：使用状态管理库（如Redux、MobX或React Query）管理API请求状态。

   ```typescript
   // 使用React Query示例
   import { useQuery, useMutation, useQueryClient } from 'react-query';
   
   // 获取知识项列表
   function useKnowledgeItems(userId: string, filters?: KnowledgeItemFilters) {
     return useQuery(
       ['knowledgeItems', userId, filters],
       () => knowledgeItemApiClient.getKnowledgeItems(userId, filters),
       {
         staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
         onError: handleApiError
       }
     );
   }
   
   // 创建知识项
   function useCreateKnowledgeItem() {
     const queryClient = useQueryClient();
     return useMutation(
       ({ userId, input }: { userId: string; input: CreateKnowledgeItemInput }) =>
         knowledgeItemApiClient.createKnowledgeItem(userId, input),
       {
         onSuccess: () => {
           // 创建成功后，使知识项列表查询失效，触发重新获取
           queryClient.invalidateQueries('knowledgeItems');
         },
         onError: handleApiError
       }
     );
   }
   ```

4. **类型安全**：充分利用TypeScript的类型系统，确保API调用的类型安全。

5. **环境配置**：根据不同环境（开发、测试、生产）配置不同的API基础URL。

   ```typescript
   // 环境配置示例
   const API_BASE_URL = process.env.NODE_ENV === 'production'
     ? 'https://api.example.com'
     : 'https://dev-api.example.com';
   
   const apiFactory = ApiClientFactory.getInstance({
     baseUrl: API_BASE_URL
   });
   ```

6. **请求缓存**：对于频繁请求但不常变化的数据，实现适当的缓存策略。

7. **请求取消**：对于可能被用户取消的长时间运行的请求，实现请求取消逻辑。

   ```typescript
   import { CancelToken } from 'axios';
   
   // 创建取消令牌源
   const source = CancelToken.source();
   
   // 使用取消令牌发起请求
   const apiFactory = ApiClientFactory.getInstance({
     baseUrl: API_BASE_URL
   });
   const knowledgeItemApiClient = apiFactory.getKnowledgeItemApiClient();
   
   // 在请求配置中添加取消令牌
   knowledgeItemApiClient.apiClient.get('/some-endpoint', {
     cancelToken: source.token
   });
   
   // 在需要时取消请求
   source.cancel('用户取消了操作');
   ```

8. **请求节流和防抖**：对于用户输入触发的请求（如搜索），实现节流或防抖逻辑，避免过多请求。

   ```typescript
   import { debounce } from 'lodash';
   
   // 防抖搜索函数
   const debouncedSearch = debounce((query: string) => {
     knowledgeItemApiClient.searchKnowledgeItems(userId, query)
       .then(handleSearchResults)
       .catch(handleApiError);
   }, 300); // 300ms防抖
   
   // 在输入框onChange事件中调用
   function handleSearchInputChange(e: React.ChangeEvent<HTMLInputElement>) {
     debouncedSearch(e.target.value);
   }
   ```