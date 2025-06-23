# API 测试策略

本文档定义了 BASB 系统中前端 API 客户端的测试策略和最佳实践，旨在确保前端应用能够正确地与后端 API 交互。

## 目录

- [测试目标](#测试目标)
- [测试类型](#测试类型)
  - [单元测试](#单元测试)
  - [集成测试](#集成测试)
  - [契约测试](#契约测试)
  - [端到端测试](#端到端测试)
- [测试环境](#测试环境)
- [测试工具](#测试工具)
- [测试数据管理](#测试数据管理)
- [测试自动化](#测试自动化)
- [测试覆盖率](#测试覆盖率)
- [测试最佳实践](#测试最佳实践)
- [测试示例](#测试示例)

## 测试目标

1. **功能正确性**：确保 API 客户端能够正确地发送请求和处理响应。
2. **错误处理**：验证 API 客户端能够适当地处理各种错误情况。
3. **性能要求**：确保 API 客户端满足性能要求，如响应时间和吞吐量。
4. **安全性**：验证 API 客户端实现了必要的安全措施，如认证和授权。
5. **兼容性**：确保 API 客户端与不同版本的 API 兼容。
6. **可靠性**：验证 API 客户端在网络不稳定或服务器故障时的行为。

## 测试类型

### 单元测试

单元测试关注 API 客户端的各个组件和方法的独立功能。

#### 测试范围

- API 客户端类的各个方法
- 请求和响应的序列化/反序列化
- 错误处理逻辑
- 认证和授权逻辑

#### 测试工具

- Jest
- Mocha + Chai
- Sinon（用于模拟和存根）

#### 示例

```typescript
// 使用 Jest 测试 KnowledgeItemApiClient 的 getKnowledgeItems 方法
import { KnowledgeItemApiClient } from '../api/knowledge-item-api-client';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('KnowledgeItemApiClient', () => {
  let client: KnowledgeItemApiClient;
  let mockAxios: MockAdapter;
  
  beforeEach(() => {
    // 创建 API 客户端实例
    client = new KnowledgeItemApiClient('https://api.example.com');
    // 创建 axios 模拟适配器
    mockAxios = new MockAdapter(axios);
  });
  
  afterEach(() => {
    mockAxios.restore();
  });
  
  describe('getKnowledgeItems', () => {
    it('should fetch knowledge items successfully', async () => {
      // 模拟 API 响应
      const mockResponse = {
        success: true,
        data: {
          items: [
            { id: '1', title: 'Item 1', /* 其他字段 */ },
            { id: '2', title: 'Item 2', /* 其他字段 */ }
          ],
          total: 2,
          limit: 10,
          offset: 0
        }
      };
      
      // 设置模拟响应
      mockAxios.onGet('/api/v1/users/user-123/knowledge-items').reply(200, mockResponse);
      
      // 调用方法
      const result = await client.getKnowledgeItems('user-123');
      
      // 断言结果
      expect(result.items.length).toBe(2);
      expect(result.total).toBe(2);
      expect(result.items[0].title).toBe('Item 1');
    });
    
    it('should handle API error', async () => {
      // 模拟 API 错误响应
      const mockErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '输入数据验证失败'
        }
      };
      
      // 设置模拟响应
      mockAxios.onGet('/api/v1/users/user-123/knowledge-items').reply(400, mockErrorResponse);
      
      // 断言方法抛出错误
      await expect(client.getKnowledgeItems('user-123')).rejects.toThrow();
    });
  });
});
```

### 集成测试

集成测试验证 API 客户端与其他组件（如状态管理、UI 组件）的交互。

#### 测试范围

- API 客户端与状态管理库的集成
- API 客户端与 UI 组件的集成
- 多个 API 客户端方法的组合使用

#### 测试工具

- Jest
- React Testing Library（对于 React 应用）
- Cypress 组件测试

#### 示例

```typescript
// 使用 Jest 和 React Testing Library 测试 API 客户端与 React 组件的集成
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import KnowledgeItemList from '../components/KnowledgeItemList';
import { ApiClientFactory } from '../api/api-client-factory';

describe('KnowledgeItemList', () => {
  let mockAxios: MockAdapter;
  
  beforeEach(() => {
    // 初始化 API 客户端工厂
    ApiClientFactory.resetInstance({
      baseUrl: 'https://api.example.com'
    });
    
    // 创建 axios 模拟适配器
    mockAxios = new MockAdapter(axios);
  });
  
  afterEach(() => {
    mockAxios.restore();
  });
  
  it('should render knowledge items fetched from API', async () => {
    // 模拟 API 响应
    const mockResponse = {
      success: true,
      data: {
        items: [
          { id: '1', title: 'Item 1', /* 其他字段 */ },
          { id: '2', title: 'Item 2', /* 其他字段 */ }
        ],
        total: 2,
        limit: 10,
        offset: 0
      }
    };
    
    // 设置模拟响应
    mockAxios.onGet('/api/v1/users/user-123/knowledge-items').reply(200, mockResponse);
    
    // 渲染组件
    render(<KnowledgeItemList userId="user-123" />);
    
    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });
  
  it('should handle API error', async () => {
    // 模拟 API 错误响应
    mockAxios.onGet('/api/v1/users/user-123/knowledge-items').reply(500, {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '服务器内部错误'
      }
    });
    
    // 渲染组件
    render(<KnowledgeItemList userId="user-123" />);
    
    // 等待错误消息显示
    await waitFor(() => {
      expect(screen.getByText(/服务器内部错误/)).toBeInTheDocument();
    });
  });
});
```

### 契约测试

契约测试确保前端 API 客户端和后端 API 之间的契约一致性。

#### 测试范围

- API 请求和响应的格式
- API 错误处理
- API 版本兼容性

#### 测试工具

- Pact.js
- Swagger/OpenAPI 验证器

#### 示例

```typescript
// 使用 Pact.js 进行契约测试
import { Pact } from '@pact-foundation/pact';
import { KnowledgeItemApiClient } from '../api/knowledge-item-api-client';
import { ContentType, SecurityLevel, SourceType } from '../api/types';

describe('Knowledge Item API Contract', () => {
  const provider = new Pact({
    consumer: 'frontend',
    provider: 'knowledge-item-api',
    port: 8080,
    log: process.cwd() + '/logs/pact.log',
    dir: process.cwd() + '/pacts',
  });
  
  let client: KnowledgeItemApiClient;
  
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());
  
  beforeEach(() => {
    client = new KnowledgeItemApiClient(`http://localhost:${provider.port}`);
  });
  
  describe('getKnowledgeItems', () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: 'user has knowledge items',
        uponReceiving: 'a request for knowledge items',
        withRequest: {
          method: 'GET',
          path: '/api/v1/users/user-123/knowledge-items',
          headers: {
            Accept: 'application/json',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            data: {
              items: [
                {
                  id: '1',
                  userId: 'user-123',
                  title: 'Item 1',
                  content: 'Content 1',
                  contentType: ContentType.MARKDOWN,
                  source: {
                    type: SourceType.WEB,
                    url: 'https://example.com',
                  },
                  metadata: {
                    tags: ['tag1', 'tag2'],
                    categories: ['category1'],
                    language: 'zh-CN',
                    importance: 3,
                  },
                  securityLevel: SecurityLevel.PRIVATE,
                  createdAt: '2023-01-01T00:00:00Z',
                  updatedAt: '2023-01-01T00:00:00Z',
                },
              ],
              total: 1,
              limit: 10,
              offset: 0,
            },
          },
        },
      });
    });
    
    it('should get knowledge items according to contract', async () => {
      const result = await client.getKnowledgeItems('user-123');
      
      expect(result.items.length).toBe(1);
      expect(result.items[0].title).toBe('Item 1');
      expect(result.items[0].metadata.tags).toEqual(['tag1', 'tag2']);
    });
  });
});
```

### 端到端测试

端到端测试验证整个应用流程，包括前端 UI、API 客户端和后端 API。

#### 测试范围

- 用户流程和场景
- 跨多个 API 的交互
- 真实环境中的行为

#### 测试工具

- Cypress
- Playwright
- Selenium

#### 示例

```typescript
// 使用 Cypress 进行端到端测试
describe('Knowledge Item Management', () => {
  beforeEach(() => {
    // 登录用户
    cy.login('testuser@example.com', 'password');
    
    // 访问知识项列表页面
    cy.visit('/knowledge-items');
  });
  
  it('should display knowledge items', () => {
    // 验证知识项列表是否显示
    cy.get('[data-testid="knowledge-item-list"]').should('be.visible');
    cy.get('[data-testid="knowledge-item-card"]').should('have.length.at.least', 1);
  });
  
  it('should create a new knowledge item', () => {
    // 点击创建按钮
    cy.get('[data-testid="create-knowledge-item-button"]').click();
    
    // 填写表单
    cy.get('[data-testid="title-input"]').type('New Knowledge Item');
    cy.get('[data-testid="content-input"]').type('This is a new knowledge item created during E2E test.');
    cy.get('[data-testid="content-type-select"]').select('MARKDOWN');
    cy.get('[data-testid="source-type-select"]').select('WEB');
    cy.get('[data-testid="source-url-input"]').type('https://example.com');
    cy.get('[data-testid="tags-input"]').type('e2e-test,automation');
    cy.get('[data-testid="security-level-select"]').select('PRIVATE');
    
    // 提交表单
    cy.get('[data-testid="submit-button"]').click();
    
    // 验证成功消息
    cy.get('[data-testid="success-message"]').should('be.visible');
    
    // 验证新创建的知识项是否显示在列表中
    cy.get('[data-testid="knowledge-item-card"]').contains('New Knowledge Item').should('be.visible');
  });
});
```

## 测试环境

### 本地环境

- **目的**：开发和调试 API 客户端
- **配置**：使用模拟服务器或本地后端服务
- **工具**：Mock Service Worker (MSW), json-server

### 开发环境

- **目的**：集成测试和早期验证
- **配置**：连接到开发环境的后端 API
- **特点**：数据可能不稳定，功能可能不完整

### 测试环境

- **目的**：系统测试和验收测试
- **配置**：连接到测试环境的后端 API
- **特点**：稳定的数据和功能，类似生产环境

### 生产环境

- **目的**：监控和性能测试
- **配置**：连接到生产环境的后端 API
- **特点**：真实数据和负载，需要谨慎测试

## 测试工具

### 测试框架

- **Jest**：JavaScript 测试框架，适用于单元测试和集成测试
- **Mocha**：灵活的 JavaScript 测试框架
- **Cypress**：端到端测试框架
- **Playwright**：跨浏览器端到端测试框架

### 模拟工具

- **axios-mock-adapter**：模拟 axios 请求和响应
- **Mock Service Worker (MSW)**：拦截网络请求并模拟响应
- **Sinon**：JavaScript 测试间谍、存根和模拟库

### 断言库

- **Jest 内置断言**：expect 函数和匹配器
- **Chai**：BDD/TDD 断言库
- **Cypress 内置断言**：基于 Chai 的断言

### 契约测试工具

- **Pact**：消费者驱动的契约测试
- **Swagger/OpenAPI 验证器**：基于 OpenAPI 规范验证请求和响应

## 测试数据管理

### 测试数据策略

1. **模拟数据**：使用模拟数据进行单元测试和集成测试
2. **测试数据集**：为不同测试场景准备固定的测试数据集
3. **动态生成数据**：使用工具动态生成测试数据
4. **数据重置**：在测试前后重置测试数据

### 测试数据工具

- **Faker.js**：生成逼真的测试数据
- **JSON Schema Faker**：基于 JSON Schema 生成测试数据
- **Factory.ts**：TypeScript 测试数据工厂

## 测试自动化

### 持续集成

- 在每次代码提交时运行单元测试和集成测试
- 在每次合并到主分支时运行契约测试和端到端测试
- 在发布前运行完整的测试套件

### 测试报告

- 生成测试覆盖率报告
- 生成测试结果报告
- 将测试结果与 CI/CD 流程集成

## 测试覆盖率

### 覆盖率目标

- **单元测试**：代码覆盖率 > 80%
- **集成测试**：关键流程覆盖率 > 70%
- **契约测试**：API 端点覆盖率 > 90%
- **端到端测试**：关键用户场景覆盖率 > 60%

### 覆盖率报告

使用 Jest 或 Istanbul 生成覆盖率报告，包括：

- 语句覆盖率
- 分支覆盖率
- 函数覆盖率
- 行覆盖率

## 测试最佳实践

1. **测试金字塔**：遵循测试金字塔原则，编写更多的单元测试，适量的集成测试和少量的端到端测试。

2. **测试隔离**：确保测试之间相互隔离，不共享状态。

3. **测试可读性**：编写清晰、描述性强的测试，使用 BDD 风格（given-when-then）。

4. **测试维护**：定期维护和更新测试，确保它们与当前代码保持同步。

5. **测试速度**：优化测试执行速度，特别是单元测试和集成测试。

6. **测试稳定性**：避免编写脆弱的测试，减少对时间、随机性和外部服务的依赖。

7. **测试边界条件**：测试边界条件和错误情况，不仅测试正常流程。

8. **测试驱动开发**：考虑采用测试驱动开发（TDD）或行为驱动开发（BDD）方法。

9. **代码审查**：将测试代码纳入代码审查流程，确保测试质量。

10. **持续改进**：根据测试结果和反馈持续改进测试策略和实践。

## 测试示例

### 单元测试示例

```typescript
// knowledge-item-api-client.test.ts
import { KnowledgeItemApiClient } from '../api/knowledge-item-api-client';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ContentType, SecurityLevel, SourceType } from '../api/types';

describe('KnowledgeItemApiClient', () => {
  let client: KnowledgeItemApiClient;
  let mockAxios: MockAdapter;
  
  beforeEach(() => {
    client = new KnowledgeItemApiClient('https://api.example.com');
    mockAxios = new MockAdapter(axios);
  });
  
  afterEach(() => {
    mockAxios.restore();
  });
  
  describe('createKnowledgeItem', () => {
    const userId = 'user-123';
    const newItem = {
      title: '测试知识项',
      content: '这是一个测试知识项',
      contentType: ContentType.MARKDOWN,
      source: {
        type: SourceType.WEB,
        url: 'https://example.com'
      },
      metadata: {
        tags: ['测试', 'API'],
        categories: ['技术'],
        language: 'zh-CN',
        importance: 3
      },
      securityLevel: SecurityLevel.PRIVATE
    };
    
    it('should create a knowledge item successfully', async () => {
      // 模拟 API 响应
      const mockResponse = {
        success: true,
        data: {
          id: 'item-123',
          userId,
          ...newItem,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        }
      };
      
      // 设置模拟响应
      mockAxios.onPost(`/api/v1/users/${userId}/knowledge-items`).reply(201, mockResponse);
      
      // 调用方法
      const result = await client.createKnowledgeItem(userId, newItem);
      
      // 断言结果
      expect(result.id).toBe('item-123');
      expect(result.title).toBe('测试知识项');
      expect(result.metadata.tags).toEqual(['测试', 'API']);
    });
    
    it('should handle validation error', async () => {
      // 模拟 API 错误响应
      const mockErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '标题不能为空',
          details: {
            title: ['标题不能为空']
          }
        }
      };
      
      // 设置模拟响应
      mockAxios.onPost(`/api/v1/users/${userId}/knowledge-items`).reply(400, mockErrorResponse);
      
      // 调用方法并断言错误
      await expect(client.createKnowledgeItem(userId, { ...newItem, title: '' })).rejects.toThrow();
    });
    
    it('should handle network error', async () => {
      // 设置网络错误
      mockAxios.onPost(`/api/v1/users/${userId}/knowledge-items`).networkError();
      
      // 调用方法并断言错误
      await expect(client.createKnowledgeItem(userId, newItem)).rejects.toThrow();
    });
  });
});
```

### 集成测试示例

```typescript
// knowledge-item-store.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { useKnowledgeItemStore } from '../stores/knowledge-item-store';
import { ApiClientFactory } from '../api/api-client-factory';
import { ContentType, SecurityLevel, SourceType } from '../api/types';

describe('Knowledge Item Store', () => {
  let mockAxios: MockAdapter;
  
  beforeEach(() => {
    // 初始化 API 客户端工厂
    ApiClientFactory.resetInstance({
      baseUrl: 'https://api.example.com'
    });
    
    // 创建 axios 模拟适配器
    mockAxios = new MockAdapter(axios);
  });
  
  afterEach(() => {
    mockAxios.restore();
  });
  
  it('should fetch knowledge items and update store', async () => {
    // 模拟 API 响应
    const mockResponse = {
      success: true,
      data: {
        items: [
          {
            id: 'item-1',
            userId: 'user-123',
            title: '知识项 1',
            content: '内容 1',
            contentType: ContentType.MARKDOWN,
            source: {
              type: SourceType.WEB,
              url: 'https://example.com'
            },
            metadata: {
              tags: ['标签1', '标签2'],
              categories: ['分类1'],
              language: 'zh-CN',
              importance: 3
            },
            securityLevel: SecurityLevel.PRIVATE,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          }
        ],
        total: 1,
        limit: 10,
        offset: 0
      }
    };
    
    // 设置模拟响应
    mockAxios.onGet('/api/v1/users/user-123/knowledge-items').reply(200, mockResponse);
    
    // 渲染 hook
    const { result, waitForNextUpdate } = renderHook(() => useKnowledgeItemStore());
    
    // 初始状态
    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    
    // 调用获取知识项方法
    act(() => {
      result.current.fetchItems('user-123');
    });
    
    // 加载状态
    expect(result.current.isLoading).toBe(true);
    
    // 等待更新
    await waitForNextUpdate();
    
    // 验证状态更新
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].title).toBe('知识项 1');
  });
});
```

### 契约测试示例

```typescript
// knowledge-item-api.pact.ts
import { Pact, Matchers } from '@pact-foundation/pact';
import { KnowledgeItemApiClient } from '../api/knowledge-item-api-client';
import { ContentType, SecurityLevel, SourceType } from '../api/types';

const { like, eachLike, term, iso8601DateTime } = Matchers;

describe('Knowledge Item API Contract', () => {
  const provider = new Pact({
    consumer: 'frontend',
    provider: 'knowledge-item-api',
    port: 8080,
    log: process.cwd() + '/logs/pact.log',
    dir: process.cwd() + '/pacts',
  });
  
  let client: KnowledgeItemApiClient;
  
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());
  afterEach(() => provider.verify());
  
  beforeEach(() => {
    client = new KnowledgeItemApiClient(`http://localhost:${provider.port}/api/v1`);
  });
  
  describe('createKnowledgeItem', () => {
    const userId = 'user-123';
    const newItem = {
      title: '测试知识项',
      content: '这是一个测试知识项',
      contentType: ContentType.MARKDOWN,
      source: {
        type: SourceType.WEB,
        url: 'https://example.com'
      },
      metadata: {
        tags: ['测试', 'API'],
        categories: ['技术'],
        language: 'zh-CN',
        importance: 3
      },
      securityLevel: SecurityLevel.PRIVATE
    };
    
    beforeEach(() => {
      return provider.addInteraction({
        state: 'user exists',
        uponReceiving: 'a request to create a knowledge item',
        withRequest: {
          method: 'POST',
          path: `/users/${userId}/knowledge-items`,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': term({ generate: 'Bearer token', matcher: 'Bearer \\w+' })
          },
          body: like(newItem)
        },
        willRespondWith: {
          status: 201,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            success: true,
            data: {
              id: term({ generate: 'item-123', matcher: '\\w+(-\\w+)*' }),
              userId: userId,
              title: newItem.title,
              content: newItem.content,
              contentType: newItem.contentType,
              source: like(newItem.source),
              metadata: like(newItem.metadata),
              securityLevel: newItem.securityLevel,
              createdAt: iso8601DateTime(),
              updatedAt: iso8601DateTime()
            }
          }
        }
      });
    });
    
    it('should create a knowledge item according to contract', async () => {
      // 设置认证令牌
      localStorage.setItem('auth_token', 'token');
      
      // 调用 API 客户端方法
      const result = await client.createKnowledgeItem(userId, newItem);
      
      // 验证结果
      expect(result.title).toBe(newItem.title);
      expect(result.content).toBe(newItem.content);
      expect(result.contentType).toBe(newItem.contentType);
    });
  });
});
```

### 端到端测试示例

```typescript
// cypress/integration/knowledge-item.spec.ts
describe('Knowledge Item Management', () => {
  beforeEach(() => {
    // 模拟登录
    cy.intercept('POST', '/api/v1/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          token: 'fake-jwt-token',
          user: {
            id: 'user-123',
            name: 'Test User'
          }
        }
      }
    }).as('login');
    
    // 模拟获取知识项列表
    cy.intercept('GET', '/api/v1/users/user-123/knowledge-items*', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          items: [
            {
              id: 'item-1',
              userId: 'user-123',
              title: '现有知识项',
              content: '这是一个现有的知识项',
              contentType: 'MARKDOWN',
              source: {
                type: 'WEB',
                url: 'https://example.com'
              },
              metadata: {
                tags: ['现有', '测试'],
                categories: ['测试'],
                language: 'zh-CN',
                importance: 3
              },
              securityLevel: 'PRIVATE',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z'
            }
          ],
          total: 1,
          limit: 10,
          offset: 0
        }
      }
    }).as('getKnowledgeItems');
    
    // 模拟创建知识项
    cy.intercept('POST', '/api/v1/users/user-123/knowledge-items', {
      statusCode: 201,
      body: {
        success: true,
        data: {
          id: 'item-2',
          userId: 'user-123',
          title: '新知识项',
          content: '这是一个新创建的知识项',
          contentType: 'MARKDOWN',
          source: {
            type: 'WEB',
            url: 'https://example.com'
          },
          metadata: {
            tags: ['新', 'E2E测试'],
            categories: ['测试'],
            language: 'zh-CN',
            importance: 4
          },
          securityLevel: 'PRIVATE',
          createdAt: '2023-01-02T00:00:00Z',
          updatedAt: '2023-01-02T00:00:00Z'
        }
      }
    }).as('createKnowledgeItem');
    
    // 访问登录页面并登录
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('testuser@example.com');
    cy.get('[data-testid="password-input"]').type('password');
    cy.get('[data-testid="login-button"]').click();
    cy.wait('@login');
    
    // 访问知识项列表页面
    cy.visit('/knowledge-items');
    cy.wait('@getKnowledgeItems');
  });
  
  it('should display existing knowledge items', () => {
    cy.get('[data-testid="knowledge-item-card"]').should('have.length', 1);
    cy.get('[data-testid="knowledge-item-title"]').should('contain', '现有知识项');
  });
  
  it('should create a new knowledge item', () => {
    // 点击创建按钮
    cy.get('[data-testid="create-knowledge-item-button"]').click();
    
    // 填写表单
    cy.get('[data-testid="title-input"]').type('新知识项');
    cy.get('[data-testid="content-input"]').type('这是一个新创建的知识项');
    cy.get('[data-testid="content-type-select"]').select('MARKDOWN');
    cy.get('[data-testid="source-type-select"]').select('WEB');
    cy.get('[data-testid="source-url-input"]').type('https://example.com');
    cy.get('[data-testid="tags-input"]').type('新,E2E测试');
    cy.get('[data-testid="categories-input"]').type('测试');
    cy.get('[data-testid="importance-select"]').select('4');
    cy.get('[data-testid="security-level-select"]').select('PRIVATE');
    
    // 提交表单
    cy.get('[data-testid="submit-button"]').click();
    cy.wait('@createKnowledgeItem');
    
    // 验证成功消息
    cy.get('[data-testid="success-message"]').should('be.visible');
    
    // 验证重定向回列表页面并显示新创建的知识项
    cy.url().should('include', '/knowledge-items');
    cy.get('[data-testid="knowledge-item-card"]').should('have.length', 2);
    cy.get('[data-testid="knowledge-item-title"]').should('contain', '新知识项');
  });
});
```