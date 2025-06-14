# API: API Gateway

## Overview
- **ID**: API-006
- **Description**: API Gateway for the BASB system, handling authentication, authorization, rate limiting, and request routing
- **Version**: v1
- **Status**: Active

## Authentication & Authorization

### Authentication Methods

#### JWT Authentication
- **Description**: JSON Web Token (JWT) based authentication
- **Token Format**: Bearer token in Authorization header
- **Example**:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Token Lifetime**: 24 hours
- **Refresh Token Lifetime**: 30 days

#### API Key Authentication
- **Description**: API key based authentication for service-to-service communication
- **Key Format**: API key in X-API-Key header
- **Example**:
  ```
  X-API-Key: apk_12345abcdef67890
  ```

### Authentication Endpoints

#### POST /api/v1/auth/login
- **Description**: Authenticates a user and returns JWT tokens
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 86400,
      "token_type": "Bearer",
      "user": {
        "id": "user123",
        "email": "user@example.com",
        "name": "John Doe"
      }
    }
  }
  ```

#### POST /api/v1/auth/refresh
- **Description**: Refreshes an expired JWT access token
- **Request**:
  ```json
  {
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response**: Same as login response

#### POST /api/v1/auth/logout
- **Description**: Invalidates the current JWT tokens
- **Request**: No body required, just valid Authorization header
- **Response**:
  ```json
  {
    "success": true,
    "message": "Successfully logged out"
  }
  ```

#### POST /api/v1/auth/register
- **Description**: Registers a new user
- **Request**:
  ```json
  {
    "email": "newuser@example.com",
    "password": "password123",
    "name": "Jane Doe"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "user456",
        "email": "newuser@example.com",
        "name": "Jane Doe",
        "created_at": "2023-06-19T10:30:00Z"
      },
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 86400,
      "token_type": "Bearer"
    }
  }
  ```

### Authorization

#### Role-Based Access Control (RBAC)
- **Description**: Access control based on user roles
- **Roles**:
  - `admin`: Full system access
  - `user`: Standard user access
  - `service`: Service-to-service communication
  - `readonly`: Read-only access

#### Permission-Based Access Control
- **Description**: Fine-grained access control based on permissions
- **Permission Format**: `resource:action`
- **Examples**:
  - `knowledge_items:read`
  - `knowledge_items:write`
  - `para:manage`
  - `tags:manage`

#### JWT Claims
- **Standard Claims**:
  - `sub`: Subject (user ID)
  - `iss`: Issuer
  - `exp`: Expiration time
  - `iat`: Issued at time
  - `jti`: JWT ID
- **Custom Claims**:
  - `roles`: Array of user roles
  - `permissions`: Array of user permissions
  - `user_id`: User ID
  - `tenant_id`: Tenant ID for multi-tenant deployments

## Rate Limiting

### Rate Limit Configuration
- **Description**: Limits the number of requests a client can make in a given time period
- **Default Limits**:
  - Anonymous: 60 requests per minute
  - Authenticated users: 300 requests per minute
  - Service accounts: 1000 requests per minute

### Rate Limit Headers
- **X-RateLimit-Limit**: Maximum number of requests allowed in the current time window
- **X-RateLimit-Remaining**: Number of requests left in the current time window
- **X-RateLimit-Reset**: Time when the current rate limit window resets (Unix timestamp)

### Rate Limit Exceeded Response
- **Status Code**: 429 Too Many Requests
- **Response Body**:
  ```json
  {
    "success": false,
    "error": {
      "code": "rate_limit_exceeded",
      "message": "Rate limit exceeded. Please try again later.",
      "retry_after": 30
    }
  }
  ```

## Request Routing

### Service Discovery
- **Description**: Automatic discovery and routing of requests to appropriate microservices
- **Implementation**: Based on path prefixes and service registry

### Path-Based Routing
- **Description**: Routes requests based on URL path prefixes
- **Examples**:
  - `/api/v1/users/*` → User Service
  - `/api/v1/items/*` → Knowledge Item Service
  - `/api/v1/para/*` → PARA Organization Service
  - `/api/v1/tags/*` → Tags Management Service
  - `/api/v1/search/*` → Search & Retrieval Service

### Service Registry
- **Description**: Registry of available services and their endpoints
- **Implementation**: Consul or etcd based service registry
- **Health Checks**: Regular health checks to ensure service availability

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes
- **authentication_failed**: Authentication credentials are invalid
- **token_expired**: JWT token has expired
- **invalid_token**: JWT token is invalid
- **permission_denied**: User does not have permission to perform the action
- **resource_not_found**: Requested resource does not exist
- **validation_error**: Request validation failed
- **rate_limit_exceeded**: Rate limit has been exceeded
- **internal_error**: Internal server error

## Versioning

### API Versioning Strategy
- **Description**: Versioning strategy for the API
- **Implementation**: URL path versioning
- **Format**: `/api/v{major_version}/{resource}`
- **Examples**:
  - `/api/v1/users`
  - `/api/v2/users`

### Version Compatibility
- **Description**: Guidelines for maintaining backward compatibility
- **Rules**:
  - Non-breaking changes (adding fields, endpoints) do not require version increment
  - Breaking changes (removing/renaming fields, changing behavior) require version increment
  - Old versions are supported for at least 6 months after a new version is released

## Cross-Origin Resource Sharing (CORS)

### CORS Configuration
- **Description**: Configuration for Cross-Origin Resource Sharing
- **Allowed Origins**:
  - Development: `http://localhost:*`
  - Production: `https://*.basb-system.com`
- **Allowed Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Allowed Headers**: Content-Type, Authorization, X-API-Key, X-Requested-With
- **Exposed Headers**: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- **Max Age**: 86400 seconds (24 hours)
- **Allow Credentials**: true

## Monitoring & Logging

### Request Logging
- **Description**: Logging of API requests for monitoring and debugging
- **Log Format**:
  ```json
  {
    "timestamp": "2023-06-19T12:34:56Z",
    "request_id": "req_abcdef123456",
    "method": "GET",
    "path": "/api/v1/users/user123",
    "query": "include=preferences",
    "status": 200,
    "response_time": 45,
    "user_id": "user123",
    "ip": "192.168.1.1",
    "user_agent": "Mozilla/5.0 ..."
  }
  ```

### Metrics
- **Description**: Metrics collected for monitoring API performance
- **Metrics**:
  - Request count by endpoint
  - Response time by endpoint
  - Error rate by endpoint
  - Rate limit exceeded count
  - Authentication failure count

### Health Check Endpoint
- **Description**: Endpoint for checking API gateway health
- **Endpoint**: GET /api/health
- **Response**:
  ```json
  {
    "status": "ok",
    "version": "1.0.0",
    "uptime": 86400,
    "services": {
      "user_service": "ok",
      "knowledge_item_service": "ok",
      "para_service": "ok",
      "tags_service": "ok",
      "search_service": "ok"
    }
  }
  ```

## GraphQL API Gateway

### GraphQL Endpoint
- **Description**: Single endpoint for GraphQL API
- **Endpoint**: POST /api/v1/graphql
- **Authentication**: Same as REST API (JWT or API Key)

### Schema Stitching
- **Description**: Combining GraphQL schemas from multiple services
- **Implementation**: Apollo Federation or Schema Stitching

### Introspection
- **Description**: GraphQL schema introspection for development and documentation
- **Availability**: Enabled in development, disabled in production (unless explicitly enabled)

### GraphQL Playground
- **Description**: Interactive GraphQL IDE for development and testing
- **Endpoint**: GET /api/v1/graphql/playground
- **Availability**: Development environment only

## WebSocket API

### WebSocket Connection
- **Description**: WebSocket connection for real-time updates
- **Endpoint**: wss://api.basb-system.com/ws
- **Authentication**: JWT token in connection query parameter
  ```
  wss://api.basb-system.com/ws?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

### WebSocket Events
- **Description**: Events that can be sent and received over WebSocket
- **Events**:
  - `knowledge_item.created`: New knowledge item created
  - `knowledge_item.updated`: Knowledge item updated
  - `knowledge_item.deleted`: Knowledge item deleted
  - `para.updated`: PARA structure updated
  - `tag.created`: New tag created
  - `tag.updated`: Tag updated
  - `tag.deleted`: Tag deleted

### WebSocket Message Format
```json
{
  "event": "knowledge_item.created",
  "data": {
    "item_id": "item123",
    "title": "New Knowledge Item",
    "user_id": "user123",
    "created_at": "2023-06-19T14:30:00Z"
  }
}
```

## Change History
- **2024-01-15**: Initial API Gateway definition
- **2024-02-10**: Added authentication and authorization details
- **2024-03-05**: Added rate limiting and CORS configuration
- **2024-04-10**: Added WebSocket API specification