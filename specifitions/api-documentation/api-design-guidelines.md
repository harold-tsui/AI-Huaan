# API Design Guidelines

## Overview

This document provides comprehensive guidelines for designing APIs in the BASB system. It covers best practices, standards, and conventions for both RESTful and GraphQL APIs to ensure consistency, usability, and maintainability across all system interfaces.

## General Principles

### API First Design

- **Definition**: Design APIs before implementing them, using an Interface Definition Language (IDL) like OpenAPI or GraphQL Schema.
- **Benefits**:
  - Enables parallel development of frontend and backend
  - Facilitates early feedback and validation
  - Ensures consistent API design
  - Supports automated code generation and documentation

### Consistency

- Use consistent naming, formatting, and patterns across all APIs
- Follow established conventions for your API style (REST or GraphQL)
- Maintain consistency in error handling, pagination, filtering, and other common patterns

### Simplicity

- Design APIs that are easy to understand and use
- Avoid unnecessary complexity
- Optimize for common use cases
- Follow the principle of least surprise

### Evolution

- Design APIs to evolve over time without breaking existing clients
- Use versioning to manage breaking changes
- Prefer additive, non-breaking changes
- Follow the deprecation process for removing features

### Security

- Implement proper authentication and authorization
- Validate all inputs
- Protect against common security vulnerabilities
- Apply the principle of least privilege

## RESTful API Guidelines

### Resource Naming

#### URL Structure

- Use nouns, not verbs, for resource names
- Use plural nouns for collection resources
- Use kebab-case for multi-word resource names
- Use hierarchical structure for nested resources

**Good Examples**:
```
/users
/users/{userId}
/users/{userId}/knowledge-items
/knowledge-items/{itemId}/tags
```

**Bad Examples**:
```
/getUser
/user
/knowledgeItems
/knowledge_items
```

#### Resource Identification

- Use unique, stable, opaque identifiers for resources
- Prefer UUID or similar globally unique identifiers
- Include resource identifiers in the URL path

### HTTP Methods

- **GET**: Retrieve a resource or collection
- **POST**: Create a new resource or perform a complex operation
- **PUT**: Replace a resource completely
- **PATCH**: Update a resource partially
- **DELETE**: Remove a resource

### HTTP Status Codes

- **2xx**: Success
  - 200 OK: Standard success response
  - 201 Created: Resource created successfully
  - 204 No Content: Success with no response body
- **4xx**: Client Error
  - 400 Bad Request: Invalid request format or parameters
  - 401 Unauthorized: Authentication required
  - 403 Forbidden: Authentication succeeded but insufficient permissions
  - 404 Not Found: Resource not found
  - 409 Conflict: Request conflicts with current state
  - 422 Unprocessable Entity: Validation errors
  - 429 Too Many Requests: Rate limit exceeded
- **5xx**: Server Error
  - 500 Internal Server Error: Unexpected server error
  - 503 Service Unavailable: Service temporarily unavailable

### Request Parameters

#### Path Parameters

- Use for identifying resources
- Always validate and sanitize
- Document constraints and format

#### Query Parameters

- Use for filtering, sorting, pagination, and optional parameters
- Use consistent parameter names across endpoints
- Support multiple values where appropriate

**Common Query Parameters**:
- `filter[field]=value`: Filter by field value
- `sort=field` or `sort=-field`: Sort by field (ascending or descending)
- `page[number]=1&page[size]=20`: Pagination
- `include=relation1,relation2`: Include related resources

#### Request Body

- Use JSON as the primary format
- Validate against a schema
- Use consistent property naming
- Document required vs. optional fields

### Response Format

#### Success Response

```json
{
  "success": true,
  "data": {
    "id": "item123",
    "title": "Example Item",
    "created_at": "2023-06-15T10:30:00Z"
  }
}
```

For collections:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item123",
        "title": "Example Item 1"
      },
      {
        "id": "item456",
        "title": "Example Item 2"
      }
    ],
    "total": 42,
    "limit": 20,
    "offset": 0
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "validation_error",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "title",
        "message": "Title is required"
      }
    ]
  }
}
```

### Pagination

#### Offset Pagination

- Query Parameters: `limit` and `offset`
- Response Metadata: `total`, `limit`, `offset`

```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "limit": 20,
    "offset": 40
  }
}
```

#### Cursor Pagination

- Query Parameters: `limit` and `cursor`
- Response Metadata: `next_cursor`, `has_more`

```json
{
  "success": true,
  "data": {
    "items": [...],
    "next_cursor": "Y3Vyc29yXzEyMzQ1",
    "has_more": true
  }
}
```

### Filtering

- Use query parameters for filtering
- Support multiple filters
- Support operators where appropriate

**Examples**:
```
/api/v1/items?filter[title]=Example
/api/v1/items?filter[created_at][gte]=2023-01-01T00:00:00Z
/api/v1/items?filter[tags]=AI&filter[tags]=ML
```

### Sorting

- Use the `sort` query parameter
- Prefix with `-` for descending order
- Support multiple sort fields

**Examples**:
```
/api/v1/items?sort=title
/api/v1/items?sort=-created_at
/api/v1/items?sort=-created_at,title
```

### Field Selection

- Use the `fields` query parameter to select specific fields
- Support dot notation for nested fields

**Examples**:
```
/api/v1/items?fields=id,title,created_at
/api/v1/items?fields=id,title,metadata.author
```

### Relationships

- Use the `include` query parameter to include related resources
- Support dot notation for nested relationships

**Examples**:
```
/api/v1/items?include=tags
/api/v1/items?include=tags,para
/api/v1/users?include=preferences,items.tags
```

### Versioning

- Include version in URL path: `/api/v1/resource`
- Support at least one previous major version
- Document deprecation timeline for old versions

### Bulk Operations

- Use POST for bulk operations
- Accept an array of resources or operations
- Return detailed results for each item

**Example Request**:
```json
POST /api/v1/items/bulk
{
  "operations": [
    {
      "operation": "create",
      "data": {
        "title": "New Item 1",
        "content": "Content for item 1"
      }
    },
    {
      "operation": "update",
      "id": "item123",
      "data": {
        "title": "Updated Title"
      }
    },
    {
      "operation": "delete",
      "id": "item456"
    }
  ]
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "operation": "create",
        "success": true,
        "data": {
          "id": "item789",
          "title": "New Item 1"
        }
      },
      {
        "operation": "update",
        "id": "item123",
        "success": true
      },
      {
        "operation": "delete",
        "id": "item456",
        "success": false,
        "error": {
          "code": "not_found",
          "message": "Item not found"
        }
      }
    ]
  }
}
```

## GraphQL API Guidelines

### Schema Design

#### Type Naming

- Use PascalCase for type names
- Use descriptive, domain-specific names
- Add comments to types and fields

```graphql
"""用户上下文，包含用户的个人信息、偏好和学习状态"""
type UserContext {
  """用户上下文唯一标识符"""
  id: ID!
  """用户ID"""
  userId: ID!
  # Additional fields...
}
```

#### Field Naming

- Use camelCase for field names
- Be consistent with naming patterns
- Use descriptive names that reflect the domain

```graphql
type KnowledgeItem {
  id: ID!
  title: String!
  contentType: ContentType!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

#### Enums

- Use SCREAMING_SNAKE_CASE for enum values
- Provide descriptions for enum types and values

```graphql
"""内容类型枚举"""
enum ContentType {
  """文本内容"""
  TEXT
  """图片内容"""
  IMAGE
  """音频内容"""
  AUDIO
  """视频内容"""
  VIDEO
  """代码内容"""
  CODE
}
```

#### Interfaces and Unions

- Use interfaces for objects that share common fields
- Use unions for fields that can return multiple types

```graphql
interface Node {
  id: ID!
}

type KnowledgeItem implements Node {
  id: ID!
  title: String!
  # Additional fields...
}

type Tag implements Node {
  id: ID!
  name: String!
  # Additional fields...
}

union SearchResult = KnowledgeItem | Tag | ParaNode
```

### Query Design

#### Naming

- Use descriptive names that reflect the operation
- Use consistent naming patterns
- Avoid generic names like `get` or `fetch`

```graphql
type Query {
  knowledgeItem(id: ID!): KnowledgeItem
  searchKnowledgeItems(query: String!, limit: Int): [KnowledgeItem!]!
  userContext(userId: ID!): UserContext
}
```

#### Arguments

- Use descriptive argument names
- Provide default values where appropriate
- Document required vs. optional arguments

```graphql
type Query {
  searchKnowledgeItems(
    """搜索查询字符串"""
    query: String!, 
    """标签过滤器"""
    tags: [String!], 
    """最大返回结果数"""
    limit: Int = 20, 
    """分页偏移量"""
    offset: Int = 0
  ): SearchResult!
}
```

#### Pagination

- Use the Relay connection pattern for pagination
- Support both forward and backward pagination

```graphql
type Query {
  knowledgeItems(first: Int, after: String, last: Int, before: String): KnowledgeItemConnection!
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

#### Filtering

- Use input types for complex filters
- Support multiple filter criteria
- Provide sensible defaults

```graphql
type Query {
  knowledgeItems(filter: KnowledgeItemFilterInput): [KnowledgeItem!]!
}

input KnowledgeItemFilterInput {
  title: StringFilterInput
  contentType: ContentType
  tags: [String!]
  createdAt: DateTimeFilterInput
}

input StringFilterInput {
  eq: String
  contains: String
  startsWith: String
  endsWith: String
}

input DateTimeFilterInput {
  eq: DateTime
  gt: DateTime
  gte: DateTime
  lt: DateTime
  lte: DateTime
}
```

### Mutation Design

#### Naming

- Use verb-noun format (e.g., `createUser`, `updateKnowledgeItem`)
- Be specific about the action being performed
- Use consistent naming patterns

```graphql
type Mutation {
  createKnowledgeItem(input: CreateKnowledgeItemInput!): CreateKnowledgeItemPayload!
  updateKnowledgeItem(input: UpdateKnowledgeItemInput!): UpdateKnowledgeItemPayload!
  deleteKnowledgeItem(input: DeleteKnowledgeItemInput!): DeleteKnowledgeItemPayload!
}
```

#### Input Types

- Use input types for mutation arguments
- Group related fields in a single input type
- Include client mutation ID for optimistic updates

```graphql
input CreateKnowledgeItemInput {
  clientMutationId: ID
  title: String!
  content: String!
  contentType: ContentType!
  tags: [String!]
}
```

#### Payload Types

- Return a payload object with the affected resource
- Include client mutation ID in the response
- Include related objects that might have changed

```graphql
type CreateKnowledgeItemPayload {
  clientMutationId: ID
  knowledgeItem: KnowledgeItem!
  user: User!
}
```

### Error Handling

#### Standard Errors

- Use the standard GraphQL error format
- Include error code, message, and path
- Add custom extensions for additional error details

```json
{
  "errors": [
    {
      "message": "Invalid input",
      "locations": [{"line": 3, "column": 10}],
      "path": ["createKnowledgeItem"],
      "extensions": {
        "code": "VALIDATION_ERROR",
        "details": [
          {
            "field": "title",
            "message": "Title is required"
          }
        ]
      }
    }
  ]
}
```

#### Error Types

- Define a set of standard error codes
- Document error codes and their meaning
- Be consistent in error reporting

**Common Error Codes**:
- `AUTHENTICATION_ERROR`: User is not authenticated
- `AUTHORIZATION_ERROR`: User is not authorized
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Internal server error

### Subscriptions

- Use for real-time updates
- Follow the same naming conventions as queries and mutations
- Define clear subscription events

```graphql
type Subscription {
  knowledgeItemCreated(userId: ID!): KnowledgeItem!
  knowledgeItemUpdated(itemId: ID!): KnowledgeItem!
  tagAdded(itemId: ID!): Tag!
}
```

## API Documentation

### Documentation Requirements

- Every API must be fully documented
- Documentation must be generated from the API definition
- Documentation must be versioned alongside the API
- Documentation must include examples for all operations

### Documentation Content

- Overview and purpose
- Authentication and authorization requirements
- Available endpoints/operations
- Request and response formats
- Error codes and handling
- Rate limits and quotas
- Examples for common use cases
- Changelog and version history

### Documentation Tools

- **RESTful APIs**: OpenAPI/Swagger
- **GraphQL APIs**: GraphQL Schema with descriptions and examples
- **Documentation Generation**: Swagger UI, ReDoc, GraphQL Playground

## API Testing

### Test Types

- **Unit Tests**: Test individual components
- **Integration Tests**: Test API endpoints with mocked dependencies
- **Contract Tests**: Verify API conforms to its specification
- **Performance Tests**: Verify API meets performance requirements
- **Security Tests**: Verify API is secure against common vulnerabilities

### Test Coverage

- All endpoints/operations must have tests
- Tests must cover happy path and error cases
- Tests must verify response format and status codes
- Tests must verify authentication and authorization

### Test Tools

- **RESTful APIs**: Postman, REST Assured, Karate
- **GraphQL APIs**: Apollo Client DevTools, GraphQL Playground
- **Contract Testing**: Pact, Spring Cloud Contract
- **Performance Testing**: JMeter, k6, Gatling
- **Security Testing**: OWASP ZAP, Burp Suite

## API Security

### Authentication

- Use industry-standard authentication mechanisms
- Support multiple authentication methods where appropriate
- Use secure token storage and transmission
- Implement proper token validation and expiration

### Authorization

- Implement role-based or attribute-based access control
- Validate authorization for every request
- Apply the principle of least privilege
- Document authorization requirements for each endpoint/operation

### Input Validation

- Validate all input parameters
- Use schema validation for request bodies
- Sanitize inputs to prevent injection attacks
- Implement proper error handling for invalid inputs

### Rate Limiting

- Implement rate limiting to prevent abuse
- Use appropriate rate limits for different operations
- Return standard rate limit headers
- Document rate limits in API documentation

### Security Headers

- Set appropriate security headers
- Use HTTPS for all API traffic
- Implement proper CORS configuration
- Use secure cookies where appropriate

## API Performance

### Performance Considerations

- Optimize database queries
- Use caching where appropriate
- Implement pagination for large result sets
- Support partial responses to reduce payload size
- Use compression for response bodies

### Performance Monitoring

- Monitor API response times
- Track error rates and types
- Monitor resource utilization
- Set up alerts for performance degradation

### Performance Testing

- Establish performance baselines
- Test with realistic load patterns
- Test with different payload sizes
- Test with different network conditions

## Appendix

### Glossary

- **API**: Application Programming Interface
- **REST**: Representational State Transfer
- **GraphQL**: Query language for APIs
- **Endpoint**: A specific URL in a REST API
- **Operation**: A query, mutation, or subscription in a GraphQL API
- **Resource**: An entity or object in a REST API
- **Type**: A data structure in a GraphQL API
- **Pagination**: Dividing large result sets into smaller chunks
- **Rate Limiting**: Restricting the number of requests a client can make
- **Authentication**: Verifying the identity of a client
- **Authorization**: Verifying the permissions of a client

### References

- [REST API Design Best Practices](https://restfulapi.net/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [GraphQL Specification](https://spec.graphql.org/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)