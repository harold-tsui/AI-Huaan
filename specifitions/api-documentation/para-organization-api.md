# API: PARA Organization API

## Overview
- **ID**: API-003
- **Description**: Manages PARA (Projects, Areas, Resources, Archive) organization structure for knowledge items
- **Version**: v1
- **Status**: Active

## RESTful Endpoints

### GET /api/v1/users/{userId}/para
- **Description**: Retrieves the PARA structure for a specific user
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
  - **Query Parameters**:
    - `type` (string, optional): Filter by PARA type (project, area, resource, archive)
    - `includeItems` (boolean, optional): Whether to include associated knowledge items (default: false)
    - `depth` (integer, optional): Maximum depth of nested structures to return (default: 3)
- **Responses**:
  - **200 OK**:
    ```json
    {
      "success": true,
      "data": [
        {
          "para_id": "para123",
          "user_id": "user123",
          "type": "project",
          "name": "AI Research Project",
          "description": "Research on latest AI developments",
          "parent_id": null,
          "order_index": 1,
          "children": [
            {
              "para_id": "para456",
              "user_id": "user123",
              "type": "project",
              "name": "GPT Models Analysis",
              "description": "Analysis of GPT model capabilities",
              "parent_id": "para123",
              "order_index": 1,
              "children": [],
              "items": [
                {
                  "item_id": "item789",
                  "title": "GPT-4 Technical Report"
                }
              ]
            }
          ],
          "items": [
            {
              "item_id": "item456",
              "title": "AI Research Overview"
            }
          ]
        },
        {
          "para_id": "para234",
          "user_id": "user123",
          "type": "area",
          "name": "Machine Learning",
          "description": "Machine learning knowledge area",
          "parent_id": null,
          "order_index": 2,
          "children": [],
          "items": []
        }
      ]
    }
    ```
  - **404 Not Found**: User not found
  - **500 Internal Server Error**: Server error

### GET /api/v1/users/{userId}/para/{paraId}
- **Description**: Retrieves a specific PARA structure node
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `paraId` (string, required): The unique identifier of the PARA node
  - **Query Parameters**:
    - `includeItems` (boolean, optional): Whether to include associated knowledge items (default: false)
    - `includeChildren` (boolean, optional): Whether to include child nodes (default: true)
    - `depth` (integer, optional): Maximum depth of nested structures to return (default: 3)
- **Responses**:
  - **200 OK**:
    ```json
    {
      "success": true,
      "data": {
        "para_id": "para123",
        "user_id": "user123",
        "type": "project",
        "name": "AI Research Project",
        "description": "Research on latest AI developments",
        "parent_id": null,
        "order_index": 1,
        "children": [...],
        "items": [...]
      }
    }
    ```
  - **404 Not Found**: User or PARA node not found
  - **500 Internal Server Error**: Server error

### POST /api/v1/users/{userId}/para
- **Description**: Creates a new PARA structure node
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
  - **Request Body**:
    ```json
    {
      "type": "project",
      "name": "AI Research Project",
      "description": "Research on latest AI developments",
      "parent_id": null,
      "order_index": 1
    }
    ```
- **Responses**:
  - **201 Created**:
    ```json
    {
      "success": true,
      "data": {
        "para_id": "para123",
        "user_id": "user123",
        "type": "project",
        "name": "AI Research Project",
        "description": "Research on latest AI developments",
        "parent_id": null,
        "order_index": 1,
        "created_at": "2023-06-17T09:15:00Z"
      }
    }
    ```
  - **400 Bad Request**: Invalid request body
  - **404 Not Found**: User not found
  - **500 Internal Server Error**: Server error

### PUT /api/v1/users/{userId}/para/{paraId}
- **Description**: Updates a specific PARA structure node
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `paraId` (string, required): The unique identifier of the PARA node
  - **Request Body**: Same as POST request body
- **Responses**:
  - **200 OK**:
    ```json
    {
      "success": true,
      "data": {
        "para_id": "para123",
        "user_id": "user123",
        "type": "project",
        "name": "AI Research Project Updated",
        "description": "Updated research on latest AI developments",
        "parent_id": null,
        "order_index": 2,
        "updated_at": "2023-06-17T11:45:00Z"
      }
    }
    ```
  - **400 Bad Request**: Invalid request body
  - **404 Not Found**: User or PARA node not found
  - **500 Internal Server Error**: Server error

### DELETE /api/v1/users/{userId}/para/{paraId}
- **Description**: Deletes a specific PARA structure node
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `paraId` (string, required): The unique identifier of the PARA node
  - **Query Parameters**:
    - `recursive` (boolean, optional): Whether to recursively delete child nodes (default: false)
    - `moveItemsToParent` (boolean, optional): Whether to move associated items to parent node (default: true)
- **Responses**:
  - **204 No Content**: Successfully deleted
  - **400 Bad Request**: Invalid request parameters
  - **404 Not Found**: User or PARA node not found
  - **500 Internal Server Error**: Server error

### POST /api/v1/users/{userId}/para/{paraId}/items/{itemId}
- **Description**: Associates a knowledge item with a PARA node
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `paraId` (string, required): The unique identifier of the PARA node
    - `itemId` (string, required): The unique identifier of the knowledge item
- **Responses**:
  - **201 Created**:
    ```json
    {
      "success": true,
      "data": {
        "para_id": "para123",
        "item_id": "item456",
        "assigned_at": "2023-06-17T09:30:00Z"
      }
    }
    ```
  - **400 Bad Request**: Invalid request
  - **404 Not Found**: User, PARA node, or item not found
  - **409 Conflict**: Item already associated with the PARA node
  - **500 Internal Server Error**: Server error

### DELETE /api/v1/users/{userId}/para/{paraId}/items/{itemId}
- **Description**: Removes association between a knowledge item and a PARA node
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `paraId` (string, required): The unique identifier of the PARA node
    - `itemId` (string, required): The unique identifier of the knowledge item
- **Responses**:
  - **204 No Content**: Successfully removed association
  - **404 Not Found**: User, PARA node, item, or association not found
  - **500 Internal Server Error**: Server error

### POST /api/v1/users/{userId}/para/classify
- **Description**: Automatically classifies a knowledge item into the PARA structure
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
  - **Request Body**:
    ```json
    {
      "item_id": "item456",
      "content": "Machine learning is a subset of artificial intelligence...",
      "metadata": {
        "tags": ["ML", "AI", "Introduction"],
        "categories": ["Technology", "Education"],
        "importance": 8
      }
    }
    ```
- **Responses**:
  - **200 OK**:
    ```json
    {
      "success": true,
      "data": {
        "classification": {
          "type": "resource",
          "confidence": 0.85,
          "reasoning": "This content appears to be educational material about machine learning, which is best categorized as a resource for future reference."
        },
        "suggestions": [
          {
            "para_id": "para234",
            "name": "Machine Learning",
            "type": "area",
            "score": 0.92
          },
          {
            "para_id": "para345",
            "name": "AI Resources",
            "type": "resource",
            "score": 0.78
          }
        ]
      }
    }
    ```
  - **400 Bad Request**: Invalid request body
  - **404 Not Found**: User not found
  - **500 Internal Server Error**: Server error

## GraphQL API

### Schema

```graphql
"""PARA结构节点"""
type ParaNode {
  """节点唯一标识符"""
  id: ID!
  """用户ID"""
  userId: ID!
  """节点类型"""
  type: ParaType!
  """节点名称"""
  name: String!
  """节点描述"""
  description: String
  """父节点ID"""
  parentId: ID
  """排序索引"""
  orderIndex: Int!
  """子节点"""
  children: [ParaNode!]
  """关联的知识项"""
  items: [KnowledgeItem!]
  """创建时间"""
  createdAt: DateTime!
  """更新时间"""
  updatedAt: DateTime!
}

"""PARA类型枚举"""
enum ParaType {
  PROJECT
  AREA
  RESOURCE
  ARCHIVE
}

"""PARA项目关联"""
type ParaItemAssociation {
  """PARA节点ID"""
  paraId: ID!
  """知识项ID"""
  itemId: ID!
  """关联时间"""
  assignedAt: DateTime!
}
```

### Queries

```graphql
type Query {
  """获取用户的PARA结构"""
  paraStructure(
    userId: ID!, 
    type: ParaType, 
    includeItems: Boolean = false, 
    depth: Int = 3
  ): [ParaNode!]!
  
  """获取特定PARA节点"""
  paraNode(
    id: ID!, 
    includeItems: Boolean = false, 
    includeChildren: Boolean = true, 
    depth: Int = 3
  ): ParaNode
  
  """获取知识项的PARA分类"""
  itemParaAssociations(itemId: ID!): [ParaNode!]!
}
```

### Mutations

```graphql
type Mutation {
  """创建PARA节点"""
  createParaNode(input: CreateParaNodeInput!): CreateParaNodePayload!
  
  """更新PARA节点"""
  updateParaNode(input: UpdateParaNodeInput!): UpdateParaNodePayload!
  
  """删除PARA节点"""
  deleteParaNode(input: DeleteParaNodeInput!): DeleteParaNodePayload!
  
  """关联知识项到PARA节点"""
  associateItemWithPara(input: AssociateItemInput!): AssociateItemPayload!
  
  """移除知识项与PARA节点的关联"""
  dissociateItemFromPara(input: DissociateItemInput!): DissociateItemPayload!
  
  """自动分类知识项"""
  classifyItem(input: ClassifyItemInput!): ClassifyItemPayload!
}

input CreateParaNodeInput {
  userId: ID!
  type: ParaType!
  name: String!
  description: String
  parentId: ID
  orderIndex: Int
}

type CreateParaNodePayload {
  paraNode: ParaNode!
}

input UpdateParaNodeInput {
  id: ID!
  type: ParaType
  name: String
  description: String
  parentId: ID
  orderIndex: Int
}

type UpdateParaNodePayload {
  paraNode: ParaNode!
}

input DeleteParaNodeInput {
  id: ID!
  recursive: Boolean = false
  moveItemsToParent: Boolean = true
}

type DeleteParaNodePayload {
  id: ID!
  success: Boolean!
}

input AssociateItemInput {
  paraId: ID!
  itemId: ID!
}

type AssociateItemPayload {
  association: ParaItemAssociation!
}

input DissociateItemInput {
  paraId: ID!
  itemId: ID!
}

type DissociateItemPayload {
  success: Boolean!
}

input ClassifyItemInput {
  userId: ID!
  itemId: ID!
  content: String!
  metadata: MetadataInput
}

type ClassifyItemPayload {
  classification: {
    type: ParaType!
    confidence: Float!
    reasoning: String!
  }!
  suggestions: [ParaSuggestion!]!
}

type ParaSuggestion {
  paraId: ID!
  name: String!
  type: ParaType!
  score: Float!
}
```

## Change History
- **2024-01-20**: Initial API definition
- **2024-02-15**: Added GraphQL schema and operations
- **2024-03-10**: Added automatic classification endpoint
- **2024-03-25**: Updated response format for RESTful endpoints