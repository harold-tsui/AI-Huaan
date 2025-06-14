# AI第二大脑系统开发规范

## 一、开发环境与工具

### 1.1 开发环境

- **操作系统**：跨平台支持（macOS、Windows、Linux）
- **Node.js版本**：>= 18.0.0 LTS
- **包管理器**：npm 或 yarn
- **IDE推荐**：VSCode
- **Docker版本**：>= 20.10.0

### 1.2 开发工具

- **版本控制**：Git
- **代码仓库**：GitHub
- **CI/CD**：GitHub Actions
- **API测试**：Postman/Insomnia
- **文档工具**：Markdown + Docusaurus

### 1.3 推荐VSCode插件

- ESLint
- Prettier
- TypeScript
- Docker
- MongoDB for VS Code
- REST Client
- GitLens

## 二、代码规范

### 2.1 命名规范

#### 2.1.1 文件命名

- **源代码文件**：使用kebab-case（小写字母，单词之间用连字符分隔）
  - 例：`knowledge-processor.ts`, `user-context-service.ts`
- **React组件文件**：使用PascalCase（大驼峰）
  - 例：`KnowledgeCard.tsx`, `UserProfileView.tsx`
- **配置文件**：使用kebab-case
  - 例：`tsconfig.json`, `webpack.config.js`
- **测试文件**：使用原文件名.test.ts/tsx格式
  - 例：`knowledge-processor.test.ts`

#### 2.1.2 变量命名

- **变量**：使用camelCase（小驼峰）
  - 例：`userData`, `contextVersion`
- **常量**：使用UPPER_SNAKE_CASE（大写蛇形）
  - 例：`API_BASE_URL`, `MAX_RETRY_COUNT`
- **类/接口**：使用PascalCase
  - 例：`UserContext`, `KnowledgeProcessor`
- **私有属性**：使用下划线前缀 + camelCase
  - 例：`_privateData`, `_internalState`

#### 2.1.3 函数命名

- **普通函数**：使用动词开头的camelCase
  - 例：`processData()`, `updateUserContext()`
- **布尔返回函数**：使用is/has/can等前缀
  - 例：`isValidUser()`, `hasPermission()`
- **事件处理函数**：使用handle前缀
  - 例：`handleSubmit()`, `handleUserInput()`
- **异步函数**：考虑使用Async后缀（可选）
  - 例：`fetchDataAsync()`, `processUserInputAsync()`

### 2.2 代码组织

#### 2.2.1 目录结构

```
src/
  ├── core/                 # 核心引擎
  │   ├── knowledge/        # 知识处理引擎
  │   ├── context/          # 用户上下文引擎
  │   └── activation/       # 知识激活引擎
  ├── mcp/                  # MCP服务集成
  │   ├── obsidian/         # Obsidian MCP
  │   ├── github/           # GitHub MCP
  │   └── custom/           # 自定义MCP
  ├── api/                  # API接口
  │   ├── routes/           # 路由定义
  │   ├── controllers/      # 控制器
  │   ├── middlewares/      # 中间件
  │   └── validators/       # 请求验证
  ├── services/             # 业务服务
  ├── models/               # 数据模型
  ├── utils/                # 工具函数
  ├── config/               # 配置文件
  └── types/                # 类型定义
```

#### 2.2.2 模块组织

- **单一职责原则**：每个模块只负责一个功能
- **高内聚低耦合**：相关功能放在一起，减少模块间依赖
- **依赖注入**：使用依赖注入管理模块间依赖
- **接口分离**：使用接口定义模块间交互

### 2.3 代码风格

#### 2.3.1 TypeScript规范

- 使用严格模式（`"strict": true`）
- 优先使用接口（Interface）而非类型别名（Type Alias）定义对象类型
- 使用枚举（Enum）定义有限集合的常量
- 使用泛型增强代码复用性和类型安全性
- 避免使用`any`类型，必要时使用`unknown`
- 使用类型守卫（Type Guards）进行类型检查

```typescript
// 推荐写法
interface UserContext {
  userId: string;
  preferences: UserPreferences;
  skills: Skill[];
  lastUpdated: Date;
}

enum ContextUpdateTrigger {
  TIME_BASED = 'time_based',
  EVENT_BASED = 'event_based',
  PATTERN_BASED = 'pattern_based',
  FEEDBACK_BASED = 'feedback_based'
}

function isUserContext(obj: unknown): obj is UserContext {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'userId' in obj &&
    'preferences' in obj &&
    'skills' in obj &&
    'lastUpdated' in obj
  );
}
```

#### 2.3.2 注释规范

- **文件头注释**：包含文件描述、作者、创建日期

```typescript
/**
 * @file User context engine implementation
 * @description Manages user profile creation, updates and version control
 * @author AI-Huaan Team
 * @created 2023-06-01
 */
```

- **函数注释**：使用JSDoc风格，包含描述、参数、返回值、异常

```typescript
/**
 * Updates user context based on new data
 * @param userId - The ID of the user
 * @param newData - New data to update the context with
 * @param trigger - What triggered this update
 * @returns Updated user context object
 * @throws {UserNotFoundError} If user doesn't exist
 */
async function updateUserContext(
  userId: string,
  newData: Partial<UserData>,
  trigger: ContextUpdateTrigger
): Promise<UserContext> {
  // Implementation
}
```

- **类/接口注释**：描述类/接口的用途和职责

```typescript
/**
 * Manages the creation and updates of user contexts
 * Handles versioning and provides comparison capabilities
 */
class UserContextManager implements IUserContextManager {
  // Implementation
}
```

- **复杂逻辑注释**：解释复杂算法或业务逻辑

```typescript
// 使用余弦相似度计算两个用户画像的相似度
// 1. 提取两个画像的特征向量
// 2. 计算向量点积
// 3. 除以两个向量的模的乘积
function calculateProfileSimilarity(profile1: UserProfile, profile2: UserProfile): number {
  // Implementation
}
```

#### 2.3.3 错误处理

- 使用自定义错误类继承Error
- 异步函数使用try/catch处理异常
- 使用错误码和错误消息
- 记录错误日志

```typescript
class UserContextError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 500) {
    super(message);
    this.name = 'UserContextError';
  }
}

async function getUserContext(userId: string): Promise<UserContext> {
  try {
    const context = await userContextRepository.findById(userId);
    if (!context) {
      throw new UserContextError('User context not found', 'USER_CONTEXT_NOT_FOUND', 404);
    }
    return context;
  } catch (error) {
    logger.error(`Failed to get user context: ${error.message}`, { userId, error });
    throw error;
  }
}
```

### 2.4 代码质量

#### 2.4.1 代码检查

- 使用ESLint进行代码静态分析
- 使用Prettier进行代码格式化
- 使用TypeScript编译器严格模式
- 使用Husky在提交前运行检查

#### 2.4.2 测试规范

- 单元测试覆盖率目标：>80%
- 使用Jest作为测试框架
- 每个模块编写单元测试
- 关键流程编写集成测试
- 使用Mock隔离外部依赖

```typescript
describe('UserContextManager', () => {
  let manager: UserContextManager;
  let mockRepository: jest.Mocked<IUserContextRepository>;
  
  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      // other methods
    } as any;
    
    manager = new UserContextManager(mockRepository);
  });
  
  test('should update user context with new data', async () => {
    // Arrange
    const userId = 'user-123';
    const existingContext = { /* ... */ };
    const newData = { /* ... */ };
    mockRepository.findById.mockResolvedValue(existingContext);
    mockRepository.save.mockResolvedValue({ ...existingContext, ...newData });
    
    // Act
    const result = await manager.updateContext(userId, newData);
    
    // Assert
    expect(mockRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockRepository.save).toHaveBeenCalled();
    expect(result).toMatchObject(newData);
  });
});
```

## 三、API设计规范

### 3.1 RESTful API设计

#### 3.1.1 URL设计

- 使用名词复数表示资源集合
- 使用嵌套URL表示资源关系
- 使用kebab-case命名URL
- 版本号放在URL中

```
# 用户上下文API
GET    /api/v1/users/{userId}/contexts           # 获取用户上下文列表
GET    /api/v1/users/{userId}/contexts/current   # 获取当前用户上下文
POST   /api/v1/users/{userId}/contexts           # 创建新的用户上下文
PUT    /api/v1/users/{userId}/contexts/current   # 更新当前用户上下文
DELETE /api/v1/users/{userId}/contexts/{version} # 删除指定版本的用户上下文

# 知识项API
GET    /api/v1/knowledge-items                   # 获取知识项列表
GET    /api/v1/knowledge-items/{itemId}          # 获取单个知识项
POST   /api/v1/knowledge-items                   # 创建新的知识项
PUT    /api/v1/knowledge-items/{itemId}          # 更新知识项
DELETE /api/v1/knowledge-items/{itemId}          # 删除知识项
```

#### 3.1.2 HTTP方法使用

- **GET**：获取资源，不修改数据
- **POST**：创建新资源
- **PUT**：完全替换资源
- **PATCH**：部分更新资源
- **DELETE**：删除资源

#### 3.1.3 状态码使用

- **2xx**：成功
  - 200 OK：请求成功
  - 201 Created：资源创建成功
  - 204 No Content：请求成功但无返回内容
- **4xx**：客户端错误
  - 400 Bad Request：请求参数错误
  - 401 Unauthorized：未认证
  - 403 Forbidden：无权限
  - 404 Not Found：资源不存在
  - 422 Unprocessable Entity：请求格式正确但语义错误
- **5xx**：服务器错误
  - 500 Internal Server Error：服务器内部错误
  - 503 Service Unavailable：服务不可用

#### 3.1.4 请求/响应格式

- 请求体使用JSON格式
- 响应体使用统一的JSON结构

```json
// 成功响应
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

### 3.2 GraphQL API设计

#### 3.2.1 Schema设计

- 使用描述性的类型名称
- 添加字段描述
- 使用接口和联合类型表示多态关系
- 使用枚举表示有限选项

```graphql
"""用户上下文类型"""
type UserContext {
  """上下文唯一标识符"""
  id: ID!
  """用户ID"""
  userId: ID!
  """用户偏好设置"""
  preferences: UserPreferences!
  """用户技能列表"""
  skills: [Skill!]!
  """上下文版本"""
  version: Int!
  """最后更新时间"""
  lastUpdated: DateTime!
}

"""用户偏好设置"""
type UserPreferences {
  """学习偏好"""
  learning: LearningPreferences!
  """内容偏好"""
  content: ContentPreferences!
  """界面偏好"""
  interface: InterfacePreferences!
}

"""更新触发类型"""
enum UpdateTriggerType {
  TIME_BASED
  EVENT_BASED
  PATTERN_BASED
  FEEDBACK_BASED
}
```

#### 3.2.2 查询设计

- 使用有意义的查询名称
- 提供灵活的过滤和排序参数
- 支持分页

```graphql
type Query {
  """获取当前用户上下文"""
  userContext(userId: ID!): UserContext
  
  """获取用户上下文历史版本"""
  userContextHistory(userId: ID!, limit: Int = 10, offset: Int = 0): [UserContext!]!
  
  """搜索知识项"""
  searchKnowledgeItems(
    query: String!, 
    filters: KnowledgeItemFilters, 
    sort: KnowledgeItemSort, 
    limit: Int = 20, 
    offset: Int = 0
  ): KnowledgeItemConnection!
}

type KnowledgeItemConnection {
  edges: [KnowledgeItemEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type KnowledgeItemEdge {
  node: KnowledgeItem!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

#### 3.2.3 变更设计

- 使用有意义的变更名称
- 返回变更后的数据
- 使用输入类型定义参数

```graphql
type Mutation {
  """更新用户上下文"""
  updateUserContext(input: UpdateUserContextInput!): UpdateUserContextPayload!
  
  """创建知识项"""
  createKnowledgeItem(input: CreateKnowledgeItemInput!): CreateKnowledgeItemPayload!
  
  """更新知识项"""
  updateKnowledgeItem(input: UpdateKnowledgeItemInput!): UpdateKnowledgeItemPayload!
}

input UpdateUserContextInput {
  userId: ID!
  preferences: UserPreferencesInput
  skills: [SkillInput!]
  trigger: UpdateTriggerType!
}

type UpdateUserContextPayload {
  userContext: UserContext!
  previousVersion: Int!
}
```

## 四、数据模型设计

### 4.1 用户上下文模型

```typescript
// src/models/user-context.model.ts

import { Skill, UserPreferences, LearningContext, BehavioralPattern } from './types';

export interface UserContext {
  userId: string;              // 用户唯一标识
  version: number;             // 上下文版本号
  createdAt: Date;             // 创建时间
  updatedAt: Date;             // 更新时间
  
  // 用户基本信息
  profile: {
    name?: string;            // 用户名称
    email?: string;           // 用户邮箱
    avatar?: string;          // 头像URL
    timezone?: string;        // 时区
    language?: string;        // 语言偏好
  };
  
  // 用户技能
  skills: Skill[];            // 用户技能列表
  
  // 用户偏好
  preferences: UserPreferences; // 用户偏好设置
  
  // 学习上下文
  learningContext: LearningContext; // 学习上下文
  
  // 行为模式
  behavioralPatterns: BehavioralPattern[]; // 行为模式列表
  
  // 更新历史
  updateHistory: {
    timestamp: Date;           // 更新时间
    trigger: string;           // 触发原因
    changes: any;              // 变更内容
  }[];
}

// 技能类型定义
export interface Skill {
  name: string;                // 技能名称
  category: string;            // 技能类别
  level: number;               // 技能水平 (1-10)
  confidence: number;          // 置信度 (0-1)
  lastUsed?: Date;             // 最后使用时间
  relatedItems?: string[];     // 相关知识项ID
}

// 用户偏好类型定义
export interface UserPreferences {
  learning: {
    preferredFormats: string[];  // 偏好的学习格式
    learningStyle: string;       // 学习风格
    difficulty: number;          // 偏好难度 (1-10)
    pacePreference: string;      // 学习节奏偏好
  };
  content: {
    preferredTopics: string[];   // 偏好的主题
    contentFormats: string[];     // 偏好的内容格式
    contentLength: string;        // 偏好的内容长度
    detailLevel: string;          // 偏好的细节级别
  };
  interface: {
    colorTheme: string;          // 颜色主题
    layoutDensity: string;        // 布局密度
    fontPreference: string;       // 字体偏好
    notificationLevel: string;    // 通知级别
  };
}
```

### 4.2 知识项模型

```typescript
// src/models/knowledge-item.model.ts

export interface KnowledgeItem {
  id: string;                  // 知识项唯一标识
  title: string;               // 标题
  content: string;             // 内容
  contentType: ContentType;    // 内容类型
  source: {
    type: SourceType;         // 来源类型
    url?: string;             // 来源URL
    author?: string;          // 作者
    capturedAt: Date;         // 捕获时间
  };
  metadata: {
    tags: string[];           // 标签
    categories: string[];      // 分类
    language: string;          // 语言
    readingTime?: number;      // 阅读时间（分钟）
    importance: number;        // 重要性 (1-10)
  };
  processing: {
    summary?: string;          // 摘要
    keyPoints?: string[];      // 要点
    entities?: Entity[];       // 实体
    sentiment?: number;        // 情感 (-1 to 1)
    embedding?: number[];      // 向量嵌入
  };
  relations: {
    relatedItems: string[];    // 相关知识项ID
    prerequisites?: string[];  // 前置知识项ID
    extensions?: string[];     // 扩展知识项ID
  };
  usage: {
    viewCount: number;         // 查看次数
    lastViewed?: Date;         // 最后查看时间
    usageContexts: string[];    // 使用上下文
  };
  securityLevel: SecurityLevel; // 安全级别
  createdAt: Date;             // 创建时间
  updatedAt: Date;             // 更新时间
}

// 内容类型枚举
export enum ContentType {
  TEXT = 'text',
  MARKDOWN = 'markdown',
  HTML = 'html',
  CODE = 'code',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  PDF = 'pdf',
  MIXED = 'mixed'
}

// 来源类型枚举
export enum SourceType {
  WEB = 'web',
  FILE = 'file',
  EMAIL = 'email',
  CHAT = 'chat',
  NOTE = 'note',
  BOOK = 'book',
  ARTICLE = 'article',
  VIDEO = 'video',
  AUDIO = 'audio',
  API = 'api',
  USER_INPUT = 'user_input'
}

// 安全级别枚举
export enum SecurityLevel {
  PUBLIC = 'public',           // 公开层
  WORK = 'work',               // 工作层
  PRIVATE = 'private'          // 隐私层
}

// 实体类型
export interface Entity {
  name: string;                // 实体名称
  type: string;                // 实体类型
  relevance: number;           // 相关性 (0-1)
  mentions: {
    text: string;             // 提及文本
    position: number;          // 位置
  }[];
}
```

## 五、安全规范

### 5.1 认证与授权

- 使用JWT进行API认证
- 实现基于角色的访问控制（RBAC）
- 敏感操作需要二次验证
- 使用HTTPS加密传输

### 5.2 数据安全

- 敏感数据加密存储
- 实现数据分层安全策略
- 定期数据备份
- 实现数据访问审计日志

### 5.3 安全最佳实践

- 防止SQL注入：使用参数化查询
- 防止XSS攻击：输入验证和输出编码
- 防止CSRF攻击：使用CSRF令牌
- 限制请求频率：实现速率限制
- 安全依赖管理：定期更新依赖

## 六、性能优化规范

### 6.1 数据库优化

- 合理设计索引
- 使用查询缓存
- 分页查询大数据集
- 定期数据库维护

### 6.2 API性能优化

- 实现数据缓存
- 压缩API响应
- 使用批量操作
- 异步处理耗时操作

### 6.3 前端性能优化

- 代码分割和懒加载
- 资源压缩和CDN
- 图片优化
- 缓存策略

## 七、文档规范

### 7.1 代码文档

- 使用JSDoc注释
- 生成API文档
- 维护CHANGELOG.md
- 编写README.md

### 7.2 用户文档

- 系统概述
- 安装指南
- 用户手册
- 常见问题解答

### 7.3 开发文档

- 架构设计文档
- 开发环境搭建
- 开发流程
- 贡献指南

## 八、协作规范

### 8.1 Git工作流

- 使用GitHub Flow工作流
- 主分支：main（生产环境）
- 开发分支：develop（开发环境）
- 功能分支：feature/xxx（新功能）
- 修复分支：bugfix/xxx（bug修复）
- 发布分支：release/x.x.x（版本发布）

### 8.2 提交规范

使用Angular提交规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **type**：提交类型
  - feat：新功能
  - fix：修复bug
  - docs：文档更新
  - style：代码风格更改
  - refactor：代码重构
  - perf：性能优化
  - test：测试相关
  - chore：构建过程或辅助工具变动

- **scope**：影响范围
- **subject**：简短描述
- **body**：详细描述
- **footer**：破坏性变更和issue关联

### 8.3 代码审查

- 所有代码必须经过代码审查
- 审查重点：功能性、安全性、性能、可维护性
- 使用Pull Request进行代码审查
- 至少需要一个审查者批准

### 8.4 发布流程

1. 创建release分支
2. 更新版本号和CHANGELOG
3. 运行完整测试套件
4. 创建Pull Request到main分支
5. 代码审查和批准
6. 合并到main分支
7. 创建版本标签
8. 部署到生产环境

## 九、质量保证

### 9.1 测试策略

- **单元测试**：测试独立组件
- **集成测试**：测试组件间交互
- **端到端测试**：测试完整流程
- **性能测试**：测试系统性能
- **安全测试**：测试系统安全性

### 9.2 持续集成

- 每次提交自动运行测试
- 代码质量检查
- 构建验证
- 测试覆盖率报告

### 9.3 监控与日志

- 使用Prometheus收集指标
- 使用Grafana可视化监控数据
- 使用ELK栈收集和分析日志
- 设置告警机制

## 十、总结

AI第二大脑系统开发规范提供了一套全面的指导方针，涵盖了代码规范、API设计、数据模型、安全、性能、文档和协作等方面。遵循这些规范将有助于构建一个高质量、可维护、安全和高性能的系统。

开发团队应该将这些规范作为基础，根据项目的具体需求和进展进行调整和完善。规范不是一成不变的，应该随着项目的发展和技术的进步不断更新和改进。