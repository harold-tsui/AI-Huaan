# API: User Context API

## Overview
- **ID**: API-001
- **Description**: Manages user context data including preferences, skills, learning context, and behavioral patterns
- **Version**: v1
- **Status**: Active

## RESTful Endpoints

### GET /api/v1/users/{userId}/contexts
- **Description**: Retrieves a list of user contexts for a specific user
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
  - **Query Parameters**:
    - `limit` (integer, optional): Maximum number of contexts to return (default: 10)
    - `offset` (integer, optional): Number of contexts to skip (default: 0)
    - `sort` (string, optional): Sort order, either "asc" or "desc" by creation date (default: "desc")
- **Responses**:
  - **200 OK**:
    ```json
    {
      "success": true,
      "data": [
        {
          "userId": "user123",
          "version": 2,
          "createdAt": "2023-06-15T10:30:00Z",
          "updatedAt": "2023-06-16T14:20:00Z",
          "profile": {
            "name": "John Doe",
            "email": "john@example.com",
            "timezone": "Asia/Shanghai",
            "language": "zh-CN"
          },
          "skills": [...],
          "preferences": {...},
          "learningContext": {...},
          "behavioralPatterns": [...]
        },
        {...}
      ],
      "meta": {
        "total": 5,
        "limit": 10,
        "offset": 0
      }
    }
    ```
  - **404 Not Found**: User not found
  - **500 Internal Server Error**: Server error

### GET /api/v1/users/{userId}/contexts/current
- **Description**: Retrieves the current user context
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
- **Responses**:
  - **200 OK**:
    ```json
    {
      "success": true,
      "data": {
        "userId": "user123",
        "version": 2,
        "createdAt": "2023-06-15T10:30:00Z",
        "updatedAt": "2023-06-16T14:20:00Z",
        "profile": {...},
        "skills": [...],
        "preferences": {...},
        "learningContext": {...},
        "behavioralPatterns": [...]
      }
    }
    ```
  - **404 Not Found**: User or context not found
  - **500 Internal Server Error**: Server error

### POST /api/v1/users/{userId}/contexts
- **Description**: Creates a new user context
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
  - **Request Body**:
    ```json
    {
      "profile": {
        "name": "John Doe",
        "email": "john@example.com",
        "timezone": "Asia/Shanghai",
        "language": "zh-CN"
      },
      "skills": [
        {
          "name": "Python Programming",
          "category": "Programming",
          "level": 8,
          "confidence": 0.9
        }
      ],
      "preferences": {
        "learning": {
          "preferredFormats": ["video", "interactive"],
          "learningStyle": "visual",
          "difficulty": 7,
          "pacePreference": "moderate"
        },
        "content": {
          "preferredTopics": ["AI", "Machine Learning"],
          "contentFormats": ["markdown", "code"],
          "contentLength": "medium",
          "detailLevel": "detailed"
        },
        "interface": {
          "colorTheme": "dark",
          "layoutDensity": "compact",
          "fontPreference": "sans-serif",
          "notificationLevel": "medium"
        }
      }
    }
    ```
- **Responses**:
  - **201 Created**:
    ```json
    {
      "success": true,
      "data": {
        "userId": "user123",
        "version": 1,
        "createdAt": "2023-06-17T09:15:00Z",
        "updatedAt": "2023-06-17T09:15:00Z",
        "profile": {...},
        "skills": [...],
        "preferences": {...},
        "learningContext": {...},
        "behavioralPatterns": [...]
      }
    }
    ```
  - **400 Bad Request**: Invalid request body
  - **404 Not Found**: User not found
  - **500 Internal Server Error**: Server error

### PUT /api/v1/users/{userId}/contexts/current
- **Description**: Updates the current user context
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
  - **Request Body**: Same as POST request body
- **Responses**:
  - **200 OK**:
    ```json
    {
      "success": true,
      "data": {
        "userId": "user123",
        "version": 3,
        "createdAt": "2023-06-15T10:30:00Z",
        "updatedAt": "2023-06-17T11:45:00Z",
        "profile": {...},
        "skills": [...],
        "preferences": {...},
        "learningContext": {...},
        "behavioralPatterns": [...]
      }
    }
    ```
  - **400 Bad Request**: Invalid request body
  - **404 Not Found**: User or context not found
  - **500 Internal Server Error**: Server error

### DELETE /api/v1/users/{userId}/contexts/{version}
- **Description**: Deletes a specific version of user context
- **Request**:
  - **URL Parameters**:
    - `userId` (string, required): The unique identifier of the user
    - `version` (integer, required): The version of the context to delete
- **Responses**:
  - **204 No Content**: Successfully deleted
  - **404 Not Found**: User or context version not found
  - **500 Internal Server Error**: Server error

## GraphQL API

### Schema

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
  """用户基本信息"""
  profile: UserProfile!
  """学习上下文"""
  learningContext: LearningContext!
  """行为模式"""
  behavioralPatterns: [BehavioralPattern!]!
  """创建时间"""
  createdAt: DateTime!
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

### Queries

```graphql
type Query {
  """获取当前用户上下文"""
  userContext(userId: ID!): UserContext
  
  """获取用户上下文历史版本"""
  userContextHistory(userId: ID!, limit: Int = 10, offset: Int = 0): [UserContext!]!
}
```

### Mutations

```graphql
type Mutation {
  """更新用户上下文"""
  updateUserContext(input: UpdateUserContextInput!): UpdateUserContextPayload!
  
  """创建用户上下文"""
  createUserContext(input: CreateUserContextInput!): CreateUserContextPayload!
}

input UpdateUserContextInput {
  userId: ID!
  preferences: UserPreferencesInput
  skills: [SkillInput!]
  profile: UserProfileInput
  trigger: UpdateTriggerType!
}

type UpdateUserContextPayload {
  userContext: UserContext!
  previousVersion: Int!
}

input CreateUserContextInput {
  userId: ID!
  preferences: UserPreferencesInput!
  skills: [SkillInput!]
  profile: UserProfileInput!
}

type CreateUserContextPayload {
  userContext: UserContext!
}
```

## Change History
- **2024-01-15**: Initial API definition
- **2024-02-10**: Added GraphQL schema and operations
- **2024-03-05**: Updated response format for RESTful endpoints