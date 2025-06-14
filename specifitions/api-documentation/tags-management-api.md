# API: Tags Management API

## Overview
- **ID**: API-004
- **Description**: Manages tags for knowledge items in the BASB system
- **Version**: v1
- **Status**: Active

## RESTful Endpoints

### GET /api/v1/users/{userId}/tags
- **Description**: Retrieves all tags for a specific user
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
  - **Query Parameters**:
    - `query` (string, optional): Search query to filter tags by name
    - `sort` (string, optional): Sort order (options: name_asc, name_desc, usage_asc, usage_desc, created_asc, created_desc)
    - `limit` (integer, optional): Maximum number of tags to return (default: 100)
    - `offset` (integer, optional): Offset for pagination (default: 0)
- **Responses**:
  - **200 OK**:
    ```json
    {
      "success": true,
      "data": {
        "tags": [
          {
            "tag_id": "tag123",
            "user_id": "user123",
            "name": "AI",
            "description": "Artificial Intelligence related content",
            "color": "#FF5733",
            "usage_count": 42,
            "created_at": "2023-05-10T08:30:00Z",
            "updated_at": "2023-06-15T14:20:00Z"
          },
          {
            "tag_id": "tag456",
            "user_id": "user123",
            "name": "Machine Learning",
            "description": "Machine learning concepts and applications",
            "color": "#33FF57",
            "usage_count": 28,
            "created_at": "2023-05-12T10:15:00Z",
            "updated_at": "2023-06-14T09:45:00Z"
          }
        ],
        "total": 120,
        "limit": 100,
        "offset": 0
      }
    }
    ```
  - **404 Not Found**: User not found
  - **500 Internal Server Error**: Server error

### GET /api/v1/users/{userId}/tags/{tagId}
- **Description**: Retrieves a specific tag
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `tagId` (string, required): The unique identifier of the tag
  - **Query Parameters**:
    - `includeItems` (boolean, optional): Whether to include associated knowledge items (default: false)
    - `itemsLimit` (integer, optional): Maximum number of items to return (default: 10)
    - `itemsOffset` (integer, optional): Offset for items pagination (default: 0)
- **Responses**:
  - **200 OK**:
    ```json
    {
      "success": true,
      "data": {
        "tag_id": "tag123",
        "user_id": "user123",
        "name": "AI",
        "description": "Artificial Intelligence related content",
        "color": "#FF5733",
        "usage_count": 42,
        "created_at": "2023-05-10T08:30:00Z",
        "updated_at": "2023-06-15T14:20:00Z",
        "items": [
          {
            "item_id": "item789",
            "title": "Introduction to Neural Networks",
            "tagged_at": "2023-05-15T11:20:00Z"
          },
          {
            "item_id": "item012",
            "title": "GPT-4 Technical Overview",
            "tagged_at": "2023-05-20T09:10:00Z"
          }
        ],
        "items_total": 42
      }
    }
    ```
  - **404 Not Found**: User or tag not found
  - **500 Internal Server Error**: Server error

### POST /api/v1/users/{userId}/tags
- **Description**: Creates a new tag
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
  - **Request Body**:
    ```json
    {
      "name": "Deep Learning",
      "description": "Neural networks and deep learning concepts",
      "color": "#3357FF"
    }
    ```
- **Responses**:
  - **201 Created**:
    ```json
    {
      "success": true,
      "data": {
        "tag_id": "tag789",
        "user_id": "user123",
        "name": "Deep Learning",
        "description": "Neural networks and deep learning concepts",
        "color": "#3357FF",
        "usage_count": 0,
        "created_at": "2023-06-18T15:30:00Z",
        "updated_at": "2023-06-18T15:30:00Z"
      }
    }
    ```
  - **400 Bad Request**: Invalid request body
  - **404 Not Found**: User not found
  - **409 Conflict**: Tag with the same name already exists
  - **500 Internal Server Error**: Server error

### PUT /api/v1/users/{userId}/tags/{tagId}
- **Description**: Updates a specific tag
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `tagId` (string, required): The unique identifier of the tag
  - **Request Body**:
    ```json
    {
      "name": "Deep Learning Advanced",
      "description": "Advanced neural networks and deep learning concepts",
      "color": "#2244FF"
    }
    ```
- **Responses**:
  - **200 OK**:
    ```json
    {
      "success": true,
      "data": {
        "tag_id": "tag789",
        "user_id": "user123",
        "name": "Deep Learning Advanced",
        "description": "Advanced neural networks and deep learning concepts",
        "color": "#2244FF",
        "usage_count": 0,
        "created_at": "2023-06-18T15:30:00Z",
        "updated_at": "2023-06-18T16:45:00Z"
      }
    }
    ```
  - **400 Bad Request**: Invalid request body
  - **404 Not Found**: User or tag not found
  - **409 Conflict**: Tag with the same name already exists
  - **500 Internal Server Error**: Server error

### DELETE /api/v1/users/{userId}/tags/{tagId}
- **Description**: Deletes a specific tag
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `tagId` (string, required): The unique identifier of the tag
  - **Query Parameters**:
    - `force` (boolean, optional): Whether to force delete even if tag is in use (default: false)
- **Responses**:
  - **204 No Content**: Successfully deleted
  - **400 Bad Request**: Tag is in use and force parameter is not set
  - **404 Not Found**: User or tag not found
  - **500 Internal Server Error**: Server error

### POST /api/v1/users/{userId}/items/{itemId}/tags
- **Description**: Associates a tag with a knowledge item
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `itemId` (string, required): The unique identifier of the knowledge item
  - **Request Body**:
    ```json
    {
      "tag_id": "tag123"
    }
    ```
    OR
    ```json
    {
      "name": "New Tag",
      "color": "#FF00FF"
    }
    ```
- **Responses**:
  - **201 Created**:
    ```json
    {
      "success": true,
      "data": {
        "item_id": "item456",
        "tag": {
          "tag_id": "tag123",
          "name": "AI",
          "color": "#FF5733"
        },
        "tagged_at": "2023-06-18T17:30:00Z"
      }
    }
    ```
  - **400 Bad Request**: Invalid request body
  - **404 Not Found**: User, item, or tag not found
  - **409 Conflict**: Item already tagged with the specified tag
  - **500 Internal Server Error**: Server error

### DELETE /api/v1/users/{userId}/items/{itemId}/tags/{tagId}
- **Description**: Removes association between a tag and a knowledge item
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `itemId` (string, required): The unique identifier of the knowledge item
    - `tagId` (string, required): The unique identifier of the tag
- **Responses**:
  - **204 No Content**: Successfully removed association
  - **404 Not Found**: User, item, tag, or association not found
  - **500 Internal Server Error**: Server error

### POST /api/v1/users/{userId}/items/{itemId}/tags/suggest
- **Description**: Suggests tags for a knowledge item based on its content
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `itemId` (string, required): The unique identifier of the knowledge item
  - **Query Parameters**:
    - `limit` (integer, optional): Maximum number of suggestions to return (default: 10)
    - `minConfidence` (float, optional): Minimum confidence score for suggestions (default: 0.6)
- **Responses**:
  - **200 OK**:
    ```json
    {
      "success": true,
      "data": {
        "suggestions": [
          {
            "tag_id": "tag123",
            "name": "AI",
            "confidence": 0.95,
            "exists": true
          },
          {
            "name": "Transformer Models",
            "confidence": 0.87,
            "exists": false
          },
          {
            "tag_id": "tag456",
            "name": "Machine Learning",
            "confidence": 0.82,
            "exists": true
          }
        ]
      }
    }
    ```
  - **404 Not Found**: User or item not found
  - **500 Internal Server Error**: Server error

## GraphQL API

### Schema

```graphql
"""标签"""
type Tag {
  """标签唯一标识符"""
  id: ID!
  """用户ID"""
  userId: ID!
  """标签名称"""
  name: String!
  """标签描述"""
  description: String
  """标签颜色（十六进制）"""
  color: String
  """使用次数"""
  usageCount: Int!
  """关联的知识项"""
  items(limit: Int = 10, offset: Int = 0): TagItemConnection!
  """创建时间"""
  createdAt: DateTime!
  """更新时间"""
  updatedAt: DateTime!
}

"""标签与知识项的关联"""
type TagItemConnection {
  """关联的知识项列表"""
  edges: [TagItemEdge!]!
  """分页信息"""
  pageInfo: PageInfo!
  """总数"""
  totalCount: Int!
}

"""标签与知识项的关联边"""
type TagItemEdge {
  """知识项"""
  node: KnowledgeItem!
  """标记时间"""
  taggedAt: DateTime!
}

"""分页信息"""
type PageInfo {
  """是否有下一页"""
  hasNextPage: Boolean!
  """是否有上一页"""
  hasPreviousPage: Boolean!
  """起始游标"""
  startCursor: String
  """结束游标"""
  endCursor: String
}

"""标签建议"""
type TagSuggestion {
  """标签ID（如果已存在）"""
  id: ID
  """标签名称"""
  name: String!
  """置信度"""
  confidence: Float!
  """是否已存在"""
  exists: Boolean!
}
```

### Queries

```graphql
type Query {
  """获取用户的所有标签"""
  tags(
    userId: ID!, 
    query: String, 
    sort: TagSortInput, 
    limit: Int = 100, 
    offset: Int = 0
  ): TagConnection!
  
  """获取特定标签"""
  tag(
    id: ID!
  ): Tag
  
  """获取知识项的所有标签"""
  itemTags(
    itemId: ID!
  ): [Tag!]!
  
  """为知识项推荐标签"""
  suggestTags(
    userId: ID!, 
    itemId: ID!, 
    limit: Int = 10, 
    minConfidence: Float = 0.6
  ): [TagSuggestion!]!
}

"""标签连接（用于分页）"""
type TagConnection {
  """标签列表"""
  edges: [TagEdge!]!
  """分页信息"""
  pageInfo: PageInfo!
  """总数"""
  totalCount: Int!
}

"""标签边"""
type TagEdge {
  """标签节点"""
  node: Tag!
  """游标"""
  cursor: String!
}

"""标签排序输入"""
input TagSortInput {
  """排序字段"""
  field: TagSortField!
  """排序方向"""
  direction: SortDirection!
}

"""标签排序字段"""
enum TagSortField {
  NAME
  USAGE_COUNT
  CREATED_AT
  UPDATED_AT
}

"""排序方向"""
enum SortDirection {
  ASC
  DESC
}
```

### Mutations

```graphql
type Mutation {
  """创建标签"""
  createTag(input: CreateTagInput!): CreateTagPayload!
  
  """更新标签"""
  updateTag(input: UpdateTagInput!): UpdateTagPayload!
  
  """删除标签"""
  deleteTag(input: DeleteTagInput!): DeleteTagPayload!
  
  """为知识项添加标签"""
  addTagToItem(input: AddTagToItemInput!): AddTagToItemPayload!
  
  """从知识项移除标签"""
  removeTagFromItem(input: RemoveTagFromItemInput!): RemoveTagFromItemPayload!
  
  """批量添加标签到知识项"""
  batchAddTagsToItem(input: BatchAddTagsToItemInput!): BatchAddTagsToItemPayload!
}

input CreateTagInput {
  userId: ID!
  name: String!
  description: String
  color: String
}

type CreateTagPayload {
  tag: Tag!
}

input UpdateTagInput {
  id: ID!
  name: String
  description: String
  color: String
}

type UpdateTagPayload {
  tag: Tag!
}

input DeleteTagInput {
  id: ID!
  force: Boolean = false
}

type DeleteTagPayload {
  id: ID!
  success: Boolean!
}

input AddTagToItemInput {
  userId: ID!
  itemId: ID!
  tagId: ID
  tagName: String
  tagColor: String
}

type AddTagToItemPayload {
  item: KnowledgeItem!
  tag: Tag!
  taggedAt: DateTime!
}

input RemoveTagFromItemInput {
  itemId: ID!
  tagId: ID!
}

type RemoveTagFromItemPayload {
  itemId: ID!
  tagId: ID!
  success: Boolean!
}

input BatchAddTagsToItemInput {
  userId: ID!
  itemId: ID!
  tags: [TagInput!]!
}

input TagInput {
  id: ID
  name: String
  color: String
}

type BatchAddTagsToItemPayload {
  item: KnowledgeItem!
  addedTags: [Tag!]!
}
```

## Change History
- **2024-01-25**: Initial API definition
- **2024-02-20**: Added GraphQL schema and operations
- **2024-03-15**: Added tag suggestion endpoint
- **2024-04-01**: Updated response format for RESTful endpoints