# API Versioning Strategy

## Overview

This document outlines the versioning strategy for APIs in the Building a Second Brain (BASB) system. It provides guidelines for managing API changes, ensuring backward compatibility, and communicating changes to API consumers.

## Versioning Principles

### Semantic Versioning

The BASB system follows semantic versioning (SemVer) principles for API versioning:

- **Major Version (X.y.z)**: Incremented for incompatible API changes that break backward compatibility
- **Minor Version (x.Y.z)**: Incremented for functionality added in a backward-compatible manner
- **Patch Version (x.y.Z)**: Incremented for backward-compatible bug fixes

### API Lifecycle Stages

Each API version goes through the following lifecycle stages:

1. **Alpha**: Early development stage, not for production use
2. **Beta**: Feature complete but may have bugs, limited production use
3. **GA (Generally Available)**: Stable for production use
4. **Deprecated**: Still available but scheduled for removal
5. **Sunset**: No longer available

## Version Identification

### RESTful APIs

RESTful APIs include the major version in the URL path:

```
/api/v1/resource
/api/v2/resource
```

Minor and patch versions are not included in the URL but are documented in the API documentation and can be retrieved via a version endpoint:

```
GET /api/v1/system/version
```

Response:
```json
{
  "success": true,
  "data": {
    "version": "1.2.3",
    "majorVersion": 1,
    "minorVersion": 2,
    "patchVersion": 3,
    "releaseDate": "2023-06-15T00:00:00Z",
    "status": "GA"
  }
}
```

### GraphQL APIs

GraphQL APIs do not include version information in the URL. Instead, they use the following approaches:

1. **Schema Versioning**: The GraphQL schema itself is versioned, and the version is included in the schema metadata.

2. **Type Versioning**: When necessary, new versions of types are created with a version suffix:

```graphql
type UserV2 {
  id: ID!
  name: String!
  email: String!
  preferences: UserPreferencesV2!
}
```

3. **Field Deprecation**: Fields that will be removed in future versions are marked as deprecated:

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  preferences: UserPreferences!
  legacySettings: String @deprecated(reason: "Use preferences instead. Will be removed in v2.")
}
```

## Backward Compatibility

### Backward Compatible Changes

The following changes are considered backward compatible and can be made without incrementing the major version:

- Adding new API endpoints
- Adding new optional parameters to existing endpoints
- Adding new properties to response objects
- Adding new enum values
- Relaxing validation rules
- Adding new GraphQL types, fields, queries, or mutations
- Deprecating fields or endpoints (but not removing them)

### Breaking Changes

The following changes are considered breaking changes and require incrementing the major version:

- Removing or renaming API endpoints
- Removing or renaming required parameters
- Removing or renaming properties from response objects
- Changing the type of a parameter or response property
- Adding new required parameters
- Changing the URL structure
- Changing the authentication mechanism
- Removing enum values
- Removing GraphQL types, fields, queries, or mutations

## Version Support Policy

### Support Duration

- **Major Versions**: Each major version is supported for a minimum of 12 months after the release of the next major version.
- **Minor Versions**: Only the latest minor version of each major version is actively supported.
- **Patch Versions**: Only the latest patch version of each minor version is supported.

### Deprecation Process

1. **Announcement**: When a feature is deprecated, an announcement is made in the API documentation, release notes, and developer communications.
2. **Deprecation Period**: Deprecated features remain available for a minimum of 6 months before removal.
3. **Warnings**: Deprecated features return warnings in the response headers or body.
4. **Removal**: After the deprecation period, the feature is removed in the next major version.

## Version Management Strategies

### URI Versioning (RESTful APIs)

URI versioning is the primary versioning strategy for RESTful APIs in the BASB system:

```
/api/v1/resource
/api/v2/resource
```

Advantages:
- Simple and explicit
- Easy to understand and use
- Supports multiple versions in parallel

Disadvantages:
- Requires clients to update URLs when moving to a new version
- Can lead to code duplication on the server side

### Header Versioning (Alternative for RESTful APIs)

Header versioning can be used as an alternative for specific clients:

```
Accept: application/json; version=1.2.3
```

Advantages:
- Keeps URLs clean and consistent
- Allows for more granular version specification

Disadvantages:
- Less visible and harder to discover
- More complex to implement and test

### Schema Versioning (GraphQL APIs)

GraphQL APIs use schema versioning with field deprecation:

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  legacyField: String @deprecated(reason: "Use newField instead. Will be removed in v2.")
  newField: String
}
```

Advantages:
- Allows for gradual evolution of the schema
- Provides clear deprecation notices to clients
- Maintains backward compatibility

Disadvantages:
- Can lead to a cluttered schema over time
- Requires careful management of deprecated fields

## Implementation Guidelines

### Version Headers

All API responses include version information in the headers:

```
X-API-Version: 1.2.3
X-API-Deprecated: false
X-API-Sunset-Date: null
```

For deprecated APIs:

```
X-API-Version: 1.2.3
X-API-Deprecated: true
X-API-Sunset-Date: 2024-06-15T00:00:00Z
X-API-Deprecation-Reason: "This version will be removed in favor of v2. Please migrate to /api/v2/resource."
```

### Version Documentation

Each API version has its own documentation, clearly indicating:

- Version number
- Release date
- Status (Alpha, Beta, GA, Deprecated, Sunset)
- Changes from previous versions
- Deprecation notices and migration guides

### Version Discovery

Clients can discover available API versions through a version discovery endpoint:

```
GET /api/versions
```

Response:
```json
{
  "success": true,
  "data": {
    "versions": [
      {
        "version": "1.2.3",
        "majorVersion": 1,
        "minorVersion": 2,
        "patchVersion": 3,
        "releaseDate": "2022-06-15T00:00:00Z",
        "status": "GA",
        "deprecated": false,
        "sunsetDate": null
      },
      {
        "version": "2.0.1",
        "majorVersion": 2,
        "minorVersion": 0,
        "patchVersion": 1,
        "releaseDate": "2023-06-15T00:00:00Z",
        "status": "Beta",
        "deprecated": false,
        "sunsetDate": null
      }
    ],
    "latest": {
      "stable": "1.2.3",
      "beta": "2.0.1",
      "alpha": null
    }
  }
}
```

## Migration Strategies

### Client Migration

To facilitate client migration to new API versions, the following strategies are employed:

1. **Deprecation Notices**: Clear notices in API responses and documentation
2. **Migration Guides**: Detailed guides for migrating from one version to another
3. **Coexistence Period**: Supporting both old and new versions in parallel during the transition period
4. **Feature Flags**: Allowing clients to opt-in to new features before they become the default

### Server Implementation

Server-side implementation strategies for managing multiple API versions:

1. **Code Duplication**: Separate code paths for different major versions
2. **Adapter Pattern**: Adapters that transform requests and responses between versions
3. **Feature Toggles**: Conditional logic based on the requested version
4. **Proxy Layer**: A proxy layer that routes requests to the appropriate version handler

## Versioning Examples

### RESTful API Example

#### Version 1

```
GET /api/v1/knowledge-items/123
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "123",
    "title": "Example Item",
    "content": "Example content",
    "createdAt": "2023-06-15T10:30:00Z"
  }
}
```

#### Version 2 (Breaking Change)

```
GET /api/v2/knowledge-items/123
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "123",
    "title": "Example Item",
    "content": "Example content",
    "metadata": {
      "createdAt": "2023-06-15T10:30:00Z",
      "createdBy": "user456",
      "source": "web"
    }
  }
}
```

### GraphQL API Example

#### Version 1

```graphql
type KnowledgeItem {
  id: ID!
  title: String!
  content: String!
  createdAt: DateTime!
}

type Query {
  knowledgeItem(id: ID!): KnowledgeItem
}
```

#### Version 2 (With Deprecation)

```graphql
type KnowledgeItem {
  id: ID!
  title: String!
  content: String!
  createdAt: DateTime! @deprecated(reason: "Use metadata.createdAt instead. Will be removed in v3.")
  metadata: KnowledgeItemMetadata!
}

type KnowledgeItemMetadata {
  createdAt: DateTime!
  createdBy: ID!
  source: String!
}

type Query {
  knowledgeItem(id: ID!): KnowledgeItem
}
```

## Governance

### Version Release Process

1. **Planning**: Define the scope of changes for the new version
2. **Development**: Implement the changes according to the versioning guidelines
3. **Testing**: Test the new version for functionality and backward compatibility
4. **Documentation**: Update the API documentation to reflect the changes
5. **Announcement**: Announce the new version to API consumers
6. **Release**: Deploy the new version to production
7. **Monitoring**: Monitor the adoption and performance of the new version

### Version Decision Authority

The following roles are involved in version decision-making:

- **API Architect**: Responsible for overall API design and versioning strategy
- **Product Manager**: Defines feature requirements and prioritization
- **Development Team**: Implements and tests API changes
- **API Governance Board**: Approves major version changes and deprecation plans

## Conclusion

This versioning strategy ensures that the BASB system can evolve while maintaining backward compatibility and providing a clear migration path for API consumers. By following these guidelines, we can balance the need for innovation with the stability requirements of our API consumers.

## Appendix

### Version Compatibility Matrix

| Client Version | API v1.0.x | API v1.1.x | API v1.2.x | API v2.0.x |
|----------------|------------|------------|------------|------------|
| Client v1.0.x  | ✅         | ✅         | ✅         | ❌         |
| Client v1.1.x  | ❌         | ✅         | ✅         | ❌         |
| Client v1.2.x  | ❌         | ❌         | ✅         | ❌         |
| Client v2.0.x  | ❌         | ❌         | ❌         | ✅         |

### Version Timeline

| Version | Release Date | Deprecation Date | Sunset Date |
|---------|--------------|------------------|-------------|
| v1.0.0  | 2022-01-15   | 2022-07-15       | 2023-01-15  |
| v1.1.0  | 2022-07-15   | 2023-01-15       | 2023-07-15  |
| v1.2.0  | 2023-01-15   | 2024-01-15       | 2024-07-15  |
| v2.0.0  | 2023-06-15   | -                | -           |

### References

- [Semantic Versioning 2.0.0](https://semver.org/)
- [REST API Versioning Best Practices](https://restfulapi.net/versioning/)
- [GraphQL Versioning Strategies](https://graphql.org/learn/best-practices/#versioning)