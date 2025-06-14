# API: Knowledge Item API

## Overview
- **ID**: API-002
- **Description**: Manages knowledge items including creation, retrieval, update, and organization
- **Version**: v1
- **Status**: Active

## RESTful Endpoints

### GET /api/v1/users/{userId}/knowledge-items
- **Description**: Retrieves a list of knowledge items for a specific user
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
  - **Query Parameters**:
    - `limit` (integer, optional): Maximum number of items to return (default: 20)
    - `offset` (integer, optional): Number of items to skip (default: 0)
    - `sort` (string, optional): Sort order, either "asc" or "desc" by creation date (default: "desc")
    - `tags` (array, optional): Filter by tags
    - `categories` (array, optional): Filter by categories
    - `contentType` (string, optional): Filter by content type
    - `securityLevel` (string, optional): Filter by security level
- **Responses**:
  - **200 OK**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "item123",
          "title": "Introduction to Machine Learning",
          "content": "Machine learning is a subset of artificial intelligence...",
          "contentType": "markdown",
          "source": {
            "type": "article",
            "url": "https://example.com/ml-intro",
            "author": "Jane Smith",
            "capturedAt": "2023-05-10T08:30:00Z"
          },
          "metadata": {
            "tags": ["ML", "AI", "Introduction"],
            "categories": ["Technology", "Education"],
            "language": "en",
            "readingTime": 15,
            "importance": 8
          },
          "processing": {
            "summary": "A beginner-friendly introduction to machine learning concepts...",
            "keyPoints": ["Supervised learning", "Unsupervised learning", "Reinforcement learning"],
            "entities": [...],
            "sentiment": 0.7
          },
          "relations": {
            "relatedItems": ["item456", "item789"],
            "prerequisites": [],
            "extensions": ["item234"]
          },
          "usage": {
            "viewCount": 12,
            "lastViewed": "2023-06-01T14:20:00Z",
            "usageContexts": ["study", "reference"]
          },
          "securityLevel": "public",
          "createdAt": "2023-05-10T09:00:00Z",
          "updatedAt": "2023-05-15T11:30:00Z"
        },
        {...}
      ],
      "meta": {
        "total": 42,
        "limit": 20,
        "offset": 0
      }
    }
    ```
  - **404 Not Found**: User not found
  - **500 Internal Server Error**: Server error

### GET /api/v1/users/{userId}/knowledge-items/{itemId}
- **Description**: Retrieves a specific knowledge item
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `itemId` (string, required): The unique identifier of the knowledge item
- **Responses**:
  - **200 OK**:
    ```json
    {
      "success": true,
      "data": {
        "id": "item123",
        "title": "Introduction to Machine Learning",
        "content": "Machine learning is a subset of artificial intelligence...",
        "contentType": "markdown",
        "source": {...},
        "metadata": {...},
        "processing": {...},
        "relations": {...},
        "usage": {...},
        "securityLevel": "public",
        "createdAt": "2023-05-10T09:00:00Z",
        "updatedAt": "2023-05-15T11:30:00Z"
      }
    }
    ```
  - **404 Not Found**: User or item not found
  - **500 Internal Server Error**: Server error

### POST /api/v1/users/{userId}/knowledge-items
- **Description**: Creates a new knowledge item
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
  - **Request Body**:
    ```json
    {
      "title": "Introduction to Machine Learning",
      "content": "Machine learning is a subset of artificial intelligence...",
      "contentType": "markdown",
      "source": {
        "type": "article",
        "url": "https://example.com/ml-intro",
        "author": "Jane Smith"
      },
      "metadata": {
        "tags": ["ML", "AI", "Introduction"],
        "categories": ["Technology", "Education"],
        "language": "en",
        "readingTime": 15,
        "importance": 8
      },
      "securityLevel": "public"
    }
    ```
- **Responses**:
  - **201 Created**:
    ```json
    {
      "success": true,
      "data": {
        "id": "item123",
        "title": "Introduction to Machine Learning",
        "content": "Machine learning is a subset of artificial intelligence...",
        "contentType": "markdown",
        "source": {...},
        "metadata": {...},
        "processing": {...},
        "relations": {...},
        "usage": {...},
        "securityLevel": "public",
        "createdAt": "2023-06-17T09:15:00Z",
        "updatedAt": "2023-06-17T09:15:00Z"
      }
    }
    ```
  - **400 Bad Request**: Invalid request body
  - **404 Not Found**: User not found
  - **500 Internal Server Error**: Server error

### PUT /api/v1/users/{userId}/knowledge-items/{itemId}
- **Description**: Updates a specific knowledge item
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `itemId` (string, required): The unique identifier of the knowledge item
  - **Request Body**: Same as POST request body
- **Responses**:
  - **200 OK**:
    ```json
    {
      "success": true,
      "data": {
        "id": "item123",
        "title": "Introduction to Machine Learning",
        "content": "Machine learning is a subset of artificial intelligence...",
        "contentType": "markdown",
        "source": {...},
        "metadata": {...},
        "processing": {...},
        "relations": {...},
        "usage": {...},
        "securityLevel": "public",
        "createdAt": "2023-05-10T09:00:00Z",
        "updatedAt": "2023-06-17T11:45:00Z"
      }
    }
    ```
  - **400 Bad Request**: Invalid request body
  - **404 Not Found**: User or item not found
  - **500 Internal Server Error**: Server error

### PATCH /api/v1/users/{userId}/knowledge-items/{itemId}
- **Description**: Partially updates a specific knowledge item
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `itemId` (string, required): The unique identifier of the knowledge item
  - **Request Body**: Partial update with only the fields to be updated
    ```json
    {
      "metadata": {
        "tags": ["ML", "AI", "Introduction", "Beginner"],
        "importance": 9
      }
    }
    ```
- **Responses**:
  - **200 OK**: Same as PUT response
  - **400 Bad Request**: Invalid request body
  - **404 Not Found**: User or item not found
  - **500 Internal Server Error**: Server error

### DELETE /api/v1/users/{userId}/knowledge-items/{itemId}
- **Description**: Deletes a specific knowledge item
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `itemId` (string, required): The unique identifier of the knowledge item
- **Responses**:
  - **204 No Content**: Successfully deleted
  - **404 Not Found**: User or item not found
  - **500 Internal Server Error**: Server error

## GraphQL API

### Schema

```graphql
"""知识项类型"""
type KnowledgeItem {
  """知识项唯一标识符"""
  id: ID!
  """标题"""
  title: String!
  """内容"""
  content: String!
  """内容类型"""
  contentType: ContentType!
  """来源信息"""
  source: Source!
  """元数据"""
  metadata: Metadata!
  """处理结果"""
  processing: Processing
  """关系"""
  relations: Relations!
  """使用情况"""
  usage: Usage!
  """安全级别"""
  securityLevel: SecurityLevel!
  """创建时间"""
  createdAt: DateTime!
  """更新时间"""
  updatedAt: DateTime!
}

"""内容类型枚举"""
enum ContentType {
  TEXT
  MARKDOWN
  HTML
  CODE
  IMAGE
  AUDIO
  VIDEO
  PDF
  MIXED
}

"""来源类型枚举"""
enum SourceType {
  WEB
  FILE
  EMAIL
  CHAT
  NOTE
  BOOK
  ARTICLE
  VIDEO
  AUDIO
  API
  USER_INPUT
}

"""安全级别枚举"""
enum SecurityLevel {
  PUBLIC
  WORK
  PRIVATE
}

"""来源信息"""
type Source {
  """来源类型"""
  type: SourceType!
  """来源URL"""
  url: String
  """作者"""
  author: String
  """捕获时间"""
  capturedAt: DateTime!
}

"""元数据"""
type Metadata {
  """标签"""
  tags: [String!]!
  """分类"""
  categories: [String!]!
  """语言"""
  language: String!
  """阅读时间（分钟）"""
  readingTime: Int
  """重要性 (1-10)"""
  importance: Int!
}
```

### Queries

```graphql
type Query {
  """获取知识项"""
  knowledgeItem(id: ID!): KnowledgeItem
  
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

input KnowledgeItemFilters {
  tags: [String!]
  categories: [String!]
  contentType: ContentType
  securityLevel: SecurityLevel
  createdAfter: DateTime
  createdBefore: DateTime
  importance: IntRange
}

input IntRange {
  min: Int
  max: Int
}

input KnowledgeItemSort {
  field: KnowledgeItemSortField!
  direction: SortDirection!
}

enum KnowledgeItemSortField {
  CREATED_AT
  UPDATED_AT
  TITLE
  IMPORTANCE
  VIEW_COUNT
}

enum SortDirection {
  ASC
  DESC
}
```

### Mutations

```graphql
type Mutation {
  """创建知识项"""
  createKnowledgeItem(input: CreateKnowledgeItemInput!): CreateKnowledgeItemPayload!
  
  """更新知识项"""
  updateKnowledgeItem(input: UpdateKnowledgeItemInput!): UpdateKnowledgeItemPayload!
  
  """删除知识项"""
  deleteKnowledgeItem(id: ID!): DeleteKnowledgeItemPayload!
}

input CreateKnowledgeItemInput {
  userId: ID!
  title: String!
  content: String!
  contentType: ContentType!
  source: SourceInput!
  metadata: MetadataInput!
  securityLevel: SecurityLevel!
}

input SourceInput {
  type: SourceType!
  url: String
  author: String
}

input MetadataInput {
  tags: [String!]!
  categories: [String!]!
  language: String!
  readingTime: Int
  importance: Int!
}

type CreateKnowledgeItemPayload {
  knowledgeItem: KnowledgeItem!
}

input UpdateKnowledgeItemInput {
  id: ID!
  title: String
  content: String
  contentType: ContentType
  source: SourceInput
  metadata: MetadataInput
  securityLevel: SecurityLevel
}

type UpdateKnowledgeItemPayload {
  knowledgeItem: KnowledgeItem!
}

type DeleteKnowledgeItemPayload {
  id: ID!
  success: Boolean!
}
```

## Change History
- **2024-01-15**: Initial API definition
- **2024-02-10**: Added GraphQL schema and operations
- **2024-03-05**: Updated response format for RESTful endpoints
- **2024-03-20**: Added PATCH endpoint for partial updates