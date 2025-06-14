# API: Search & Retrieval API

## Overview
- **ID**: API-005
- **Description**: Provides search and retrieval capabilities for knowledge items in the BASB system
- **Version**: v1
- **Status**: Active

## RESTful Endpoints

### GET /api/v1/users/{userId}/search
- **Description**: Searches for knowledge items based on various criteria
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
  - **Query Parameters**:
    - `query` (string, optional): Full-text search query
    - `tags` (array of strings, optional): Filter by tags
    - `paraTypes` (array of strings, optional): Filter by PARA types (project, area, resource, archive)
    - `paraIds` (array of strings, optional): Filter by specific PARA nodes
    - `contentTypes` (array of strings, optional): Filter by content types (text, image, audio, video, code, etc.)
    - `dateFrom` (string, optional): Filter by creation date (ISO format)
    - `dateTo` (string, optional): Filter by creation date (ISO format)
    - `sort` (string, optional): Sort order (options: relevance, date_asc, date_desc, title_asc, title_desc)
    - `limit` (integer, optional): Maximum number of items to return (default: 20)
    - `offset` (integer, optional): Offset for pagination (default: 0)
- **Responses**:
  - **200 OK**:
    ```json
    {
      "success": true,
      "data": {
        "items": [
          {
            "item_id": "item123",
            "title": "Introduction to Neural Networks",
            "content_type": "text",
            "snippet": "Neural networks are a set of algorithms, modeled loosely after the human brain, that are designed to recognize patterns...",
            "created_at": "2023-05-15T11:20:00Z",
            "updated_at": "2023-06-10T09:45:00Z",
            "tags": [
              {
                "tag_id": "tag123",
                "name": "AI",
                "color": "#FF5733"
              },
              {
                "tag_id": "tag456",
                "name": "Machine Learning",
                "color": "#33FF57"
              }
            ],
            "para": [
              {
                "para_id": "para234",
                "type": "resource",
                "name": "AI Learning Resources"
              }
            ],
            "relevance_score": 0.92
          },
          {
            "item_id": "item456",
            "title": "Deep Learning Frameworks Comparison",
            "content_type": "text",
            "snippet": "This article compares popular deep learning frameworks including TensorFlow, PyTorch, and Keras...",
            "created_at": "2023-04-20T14:30:00Z",
            "updated_at": "2023-06-05T16:15:00Z",
            "tags": [
              {
                "tag_id": "tag123",
                "name": "AI",
                "color": "#FF5733"
              },
              {
                "tag_id": "tag789",
                "name": "Deep Learning",
                "color": "#3357FF"
              }
            ],
            "para": [
              {
                "para_id": "para234",
                "type": "resource",
                "name": "AI Learning Resources"
              }
            ],
            "relevance_score": 0.85
          }
        ],
        "total": 42,
        "limit": 20,
        "offset": 0
      }
    }
    ```
  - **400 Bad Request**: Invalid query parameters
  - **404 Not Found**: User not found
  - **500 Internal Server Error**: Server error

### GET /api/v1/users/{userId}/semantic-search
- **Description**: Performs semantic search using vector embeddings
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
  - **Query Parameters**:
    - `query` (string, required): The semantic search query
    - `tags` (array of strings, optional): Filter by tags
    - `paraTypes` (array of strings, optional): Filter by PARA types
    - `paraIds` (array of strings, optional): Filter by specific PARA nodes
    - `contentTypes` (array of strings, optional): Filter by content types
    - `dateFrom` (string, optional): Filter by creation date (ISO format)
    - `dateTo` (string, optional): Filter by creation date (ISO format)
    - `threshold` (float, optional): Minimum similarity threshold (default: 0.7)
    - `limit` (integer, optional): Maximum number of items to return (default: 20)
    - `offset` (integer, optional): Offset for pagination (default: 0)
- **Responses**:
  - **200 OK**: Similar to regular search but with semantic similarity scores
  - **400 Bad Request**: Invalid query parameters
  - **404 Not Found**: User not found
  - **500 Internal Server Error**: Server error

### GET /api/v1/users/{userId}/items/{itemId}/similar
- **Description**: Finds knowledge items similar to a specific item
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `itemId` (string, required): The unique identifier of the knowledge item
  - **Query Parameters**:
    - `threshold` (float, optional): Minimum similarity threshold (default: 0.7)
    - `limit` (integer, optional): Maximum number of items to return (default: 10)
    - `offset` (integer, optional): Offset for pagination (default: 0)
- **Responses**:
  - **200 OK**:
    ```json
    {
      "success": true,
      "data": {
        "source_item": {
          "item_id": "item123",
          "title": "Introduction to Neural Networks"
        },
        "similar_items": [
          {
            "item_id": "item789",
            "title": "Neural Network Architectures",
            "content_type": "text",
            "snippet": "This article explores various neural network architectures including CNNs, RNNs, and Transformers...",
            "similarity_score": 0.89,
            "common_tags": [
              {
                "tag_id": "tag123",
                "name": "AI"
              },
              {
                "tag_id": "tag789",
                "name": "Deep Learning"
              }
            ]
          },
          {
            "item_id": "item012",
            "title": "Fundamentals of Deep Learning",
            "content_type": "text",
            "snippet": "Deep learning is a subset of machine learning that uses neural networks with multiple layers...",
            "similarity_score": 0.82,
            "common_tags": [
              {
                "tag_id": "tag123",
                "name": "AI"
              }
            ]
          }
        ],
        "total": 15,
        "limit": 10,
        "offset": 0
      }
    }
    ```
  - **404 Not Found**: User or item not found
  - **500 Internal Server Error**: Server error

### GET /api/v1/users/{userId}/recent
- **Description**: Retrieves recently accessed or modified knowledge items
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
  - **Query Parameters**:
    - `type` (string, optional): Type of recency (options: created, updated, accessed)
    - `limit` (integer, optional): Maximum number of items to return (default: 20)
    - `offset` (integer, optional): Offset for pagination (default: 0)
- **Responses**:
  - **200 OK**: Similar to search results but sorted by recency
  - **404 Not Found**: User not found
  - **500 Internal Server Error**: Server error

### POST /api/v1/users/{userId}/search/save
- **Description**: Saves a search query for future use
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
  - **Request Body**:
    ```json
    {
      "name": "AI Research Materials",
      "description": "Search for all AI research materials",
      "query": "neural networks deep learning",
      "filters": {
        "tags": ["AI", "Research"],
        "paraTypes": ["resource"],
        "contentTypes": ["text", "pdf"]
      },
      "sort": "relevance"
    }
    ```
- **Responses**:
  - **201 Created**:
    ```json
    {
      "success": true,
      "data": {
        "saved_search_id": "search123",
        "user_id": "user123",
        "name": "AI Research Materials",
        "description": "Search for all AI research materials",
        "query": "neural networks deep learning",
        "filters": {
          "tags": ["AI", "Research"],
          "paraTypes": ["resource"],
          "contentTypes": ["text", "pdf"]
        },
        "sort": "relevance",
        "created_at": "2023-06-18T18:30:00Z"
      }
    }
    ```
  - **400 Bad Request**: Invalid request body
  - **404 Not Found**: User not found
  - **500 Internal Server Error**: Server error

### GET /api/v1/users/{userId}/search/saved
- **Description**: Retrieves all saved searches for a user
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
- **Responses**:
  - **200 OK**:
    ```json
    {
      "success": true,
      "data": {
        "saved_searches": [
          {
            "saved_search_id": "search123",
            "name": "AI Research Materials",
            "description": "Search for all AI research materials",
            "query": "neural networks deep learning",
            "created_at": "2023-06-18T18:30:00Z"
          },
          {
            "saved_search_id": "search456",
            "name": "Project Documentation",
            "description": "All documentation for current projects",
            "query": "",
            "created_at": "2023-06-10T14:15:00Z"
          }
        ]
      }
    }
    ```
  - **404 Not Found**: User not found
  - **500 Internal Server Error**: Server error

### GET /api/v1/users/{userId}/search/saved/{searchId}
- **Description**: Executes a saved search query
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `searchId` (string, required): The unique identifier of the saved search
  - **Query Parameters**:
    - `limit` (integer, optional): Maximum number of items to return (default: 20)
    - `offset` (integer, optional): Offset for pagination (default: 0)
- **Responses**:
  - **200 OK**: Same format as regular search results
  - **404 Not Found**: User or saved search not found
  - **500 Internal Server Error**: Server error

### DELETE /api/v1/users/{userId}/search/saved/{searchId}
- **Description**: Deletes a saved search
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `searchId` (string, required): The unique identifier of the saved search
- **Responses**:
  - **204 No Content**: Successfully deleted
  - **404 Not Found**: User or saved search not found
  - **500 Internal Server Error**: Server error

## GraphQL API

### Schema

```graphql
"""搜索结果"""
type SearchResult {
  """知识项列表"""
  items: [SearchResultItem!]!
  """分页信息"""
  pageInfo: PageInfo!
  """总数"""
  totalCount: Int!
}

"""搜索结果项"""
type SearchResultItem {
  """知识项"""
  item: KnowledgeItem!
  """相关性得分"""
  relevanceScore: Float
  """相似度得分（仅用于语义搜索和相似项搜索）"""
  similarityScore: Float
  """匹配的文本片段"""
  snippet: String
  """共同标签（仅用于相似项搜索）"""
  commonTags: [Tag!]
}

"""已保存的搜索"""
type SavedSearch {
  """已保存搜索的唯一标识符"""
  id: ID!
  """用户ID"""
  userId: ID!
  """搜索名称"""
  name: String!
  """搜索描述"""
  description: String
  """搜索查询"""
  query: String
  """搜索过滤器"""
  filters: SearchFilters
  """排序方式"""
  sort: SearchSortInput
  """创建时间"""
  createdAt: DateTime!
  """更新时间"""
  updatedAt: DateTime!
}

"""搜索过滤器"""
type SearchFilters {
  """标签过滤器"""
  tags: [String!]
  """PARA类型过滤器"""
  paraTypes: [ParaType!]
  """PARA节点ID过滤器"""
  paraIds: [ID!]
  """内容类型过滤器"""
  contentTypes: [ContentType!]
  """开始日期"""
  dateFrom: DateTime
  """结束日期"""
  dateTo: DateTime
}

"""搜索排序输入"""
input SearchSortInput {
  """排序字段"""
  field: SearchSortField!
  """排序方向"""
  direction: SortDirection!
}

"""搜索排序字段"""
enum SearchSortField {
  RELEVANCE
  CREATED_AT
  UPDATED_AT
  TITLE
}

"""最近项类型"""
enum RecentItemType {
  CREATED
  UPDATED
  ACCESSED
}
```

### Queries

```graphql
type Query {
  """搜索知识项"""
  search(
    userId: ID!, 
    query: String, 
    tags: [String!], 
    paraTypes: [ParaType!], 
    paraIds: [ID!], 
    contentTypes: [ContentType!], 
    dateFrom: DateTime, 
    dateTo: DateTime, 
    sort: SearchSortInput, 
    limit: Int = 20, 
    offset: Int = 0
  ): SearchResult!
  
  """语义搜索知识项"""
  semanticSearch(
    userId: ID!, 
    query: String!, 
    tags: [String!], 
    paraTypes: [ParaType!], 
    paraIds: [ID!], 
    contentTypes: [ContentType!], 
    dateFrom: DateTime, 
    dateTo: DateTime, 
    threshold: Float = 0.7, 
    limit: Int = 20, 
    offset: Int = 0
  ): SearchResult!
  
  """查找相似知识项"""
  similarItems(
    userId: ID!, 
    itemId: ID!, 
    threshold: Float = 0.7, 
    limit: Int = 10, 
    offset: Int = 0
  ): SearchResult!
  
  """获取最近的知识项"""
  recentItems(
    userId: ID!, 
    type: RecentItemType = ACCESSED, 
    limit: Int = 20, 
    offset: Int = 0
  ): SearchResult!
  
  """获取已保存的搜索"""
  savedSearches(
    userId: ID!
  ): [SavedSearch!]!
  
  """获取特定已保存的搜索"""
  savedSearch(
    id: ID!
  ): SavedSearch
  
  """执行已保存的搜索"""
  executeSavedSearch(
    id: ID!, 
    limit: Int = 20, 
    offset: Int = 0
  ): SearchResult!
}
```

### Mutations

```graphql
type Mutation {
  """保存搜索查询"""
  saveSearch(input: SaveSearchInput!): SaveSearchPayload!
  
  """更新已保存的搜索"""
  updateSavedSearch(input: UpdateSavedSearchInput!): UpdateSavedSearchPayload!
  
  """删除已保存的搜索"""
  deleteSavedSearch(input: DeleteSavedSearchInput!): DeleteSavedSearchPayload!
}

input SaveSearchInput {
  userId: ID!
  name: String!
  description: String
  query: String
  filters: SearchFiltersInput
  sort: SearchSortInput
}

input SearchFiltersInput {
  tags: [String!]
  paraTypes: [ParaType!]
  paraIds: [ID!]
  contentTypes: [ContentType!]
  dateFrom: DateTime
  dateTo: DateTime
}

type SaveSearchPayload {
  savedSearch: SavedSearch!
}

input UpdateSavedSearchInput {
  id: ID!
  name: String
  description: String
  query: String
  filters: SearchFiltersInput
  sort: SearchSortInput
}

type UpdateSavedSearchPayload {
  savedSearch: SavedSearch!
}

input DeleteSavedSearchInput {
  id: ID!
}

type DeleteSavedSearchPayload {
  id: ID!
  success: Boolean!
}
```

## Change History
- **2024-01-30**: Initial API definition
- **2024-02-25**: Added GraphQL schema and operations
- **2024-03-20**: Added semantic search and similar items endpoints
- **2024-04-05**: Added saved searches functionality