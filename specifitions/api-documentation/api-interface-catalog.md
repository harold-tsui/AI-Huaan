# API Interface Catalog

## Overview

This document provides a comprehensive catalog of all API interfaces available in the Building a Second Brain (BASB) system. It serves as a central reference for developers, architects, and API consumers to quickly understand what APIs are available, their purpose, current version status, and where to find detailed documentation.

## API Categories

The BASB system APIs are organized into the following categories:

1. **User Context Management** - APIs for managing user contexts, preferences, and settings
2. **Knowledge Item Management** - APIs for creating, updating, retrieving, and deleting knowledge items
3. **PARA Organization** - APIs for managing the PARA (Projects, Areas, Resources, Archive) structure
4. **Tags Management** - APIs for managing tags and their associations with knowledge items
5. **Search & Retrieval** - APIs for searching and retrieving knowledge items
6. **API Gateway** - APIs for authentication, authorization, and system-level operations

## API Interface Listing

### User Context Management

| API Name | Description | Version | Status | Documentation |
|----------|-------------|---------|--------|---------------|
| User Context API | Manages user contexts, preferences, and settings | v1 | Active | [User Context API Documentation](./user-context-api.md) |

#### Key Endpoints/Operations

- **RESTful**:
  - `GET /api/v1/user-contexts/{userId}` - Get user context
  - `POST /api/v1/user-contexts` - Create user context
  - `PUT /api/v1/user-contexts/{userId}` - Update user context
  - `DELETE /api/v1/user-contexts/{userId}` - Delete user context

- **GraphQL**:
  - `userContext(userId: ID!): UserContext` - Get user context
  - `updateUserContext(input: UpdateUserContextInput!): UpdateUserContextPayload!` - Update user context

### Knowledge Item Management

| API Name | Description | Version | Status | Documentation |
|----------|-------------|---------|--------|---------------|
| Knowledge Item API | Manages knowledge items including creation, retrieval, update, and deletion | v1 | Active | [Knowledge Item API Documentation](./knowledge-item-api.md) |

#### Key Endpoints/Operations

- **RESTful**:
  - `GET /api/v1/knowledge-items` - List knowledge items
  - `GET /api/v1/knowledge-items/{itemId}` - Get knowledge item
  - `POST /api/v1/knowledge-items` - Create knowledge item
  - `PUT /api/v1/knowledge-items/{itemId}` - Update knowledge item
  - `PATCH /api/v1/knowledge-items/{itemId}` - Partially update knowledge item
  - `DELETE /api/v1/knowledge-items/{itemId}` - Delete knowledge item

- **GraphQL**:
  - `knowledgeItem(id: ID!): KnowledgeItem` - Get knowledge item
  - `knowledgeItems(filter: KnowledgeItemFilterInput): KnowledgeItemConnection!` - List knowledge items
  - `createKnowledgeItem(input: CreateKnowledgeItemInput!): CreateKnowledgeItemPayload!` - Create knowledge item
  - `updateKnowledgeItem(input: UpdateKnowledgeItemInput!): UpdateKnowledgeItemPayload!` - Update knowledge item
  - `deleteKnowledgeItem(input: DeleteKnowledgeItemInput!): DeleteKnowledgeItemPayload!` - Delete knowledge item

### PARA Organization

| API Name | Description | Version | Status | Documentation |
|----------|-------------|---------|--------|---------------|
| PARA Organization API | Manages PARA structure and item associations | v1 | Active | [PARA Organization API Documentation](./para-organization-api.md) |

#### Key Endpoints/Operations

- **RESTful**:
  - `GET /api/v1/para/nodes` - List PARA nodes
  - `GET /api/v1/para/nodes/{nodeId}` - Get PARA node
  - `POST /api/v1/para/nodes` - Create PARA node
  - `PUT /api/v1/para/nodes/{nodeId}` - Update PARA node
  - `DELETE /api/v1/para/nodes/{nodeId}` - Delete PARA node
  - `POST /api/v1/para/nodes/{nodeId}/items/{itemId}` - Associate item with PARA node
  - `DELETE /api/v1/para/nodes/{nodeId}/items/{itemId}` - Dissociate item from PARA node
  - `POST /api/v1/para/classify` - Auto-classify items into PARA structure

- **GraphQL**:
  - `paraNode(id: ID!): ParaNode` - Get PARA node
  - `paraNodes(filter: ParaNodeFilterInput): [ParaNode!]!` - List PARA nodes
  - `createParaNode(input: CreateParaNodeInput!): CreateParaNodePayload!` - Create PARA node
  - `updateParaNode(input: UpdateParaNodeInput!): UpdateParaNodePayload!` - Update PARA node
  - `deleteParaNode(input: DeleteParaNodeInput!): DeleteParaNodePayload!` - Delete PARA node
  - `associateItemWithParaNode(input: AssociateItemInput!): AssociateItemPayload!` - Associate item with PARA node
  - `classifyItems(input: ClassifyItemsInput!): ClassifyItemsPayload!` - Auto-classify items

### Tags Management

| API Name | Description | Version | Status | Documentation |
|----------|-------------|---------|--------|---------------|
| Tags Management API | Manages tags and their associations with knowledge items | v1 | Active | [Tags Management API Documentation](./tags-management-api.md) |

#### Key Endpoints/Operations

- **RESTful**:
  - `GET /api/v1/tags` - List tags
  - `GET /api/v1/tags/{tagId}` - Get tag
  - `POST /api/v1/tags` - Create tag
  - `PUT /api/v1/tags/{tagId}` - Update tag
  - `DELETE /api/v1/tags/{tagId}` - Delete tag
  - `GET /api/v1/knowledge-items/{itemId}/tags` - Get tags for item
  - `POST /api/v1/knowledge-items/{itemId}/tags` - Add tags to item
  - `DELETE /api/v1/knowledge-items/{itemId}/tags/{tagId}` - Remove tag from item
  - `GET /api/v1/tags/suggest` - Get tag suggestions

- **GraphQL**:
  - `tag(id: ID!): Tag` - Get tag
  - `tags(filter: TagFilterInput): [Tag!]!` - List tags
  - `createTag(input: CreateTagInput!): CreateTagPayload!` - Create tag
  - `updateTag(input: UpdateTagInput!): UpdateTagPayload!` - Update tag
  - `deleteTag(input: DeleteTagInput!): DeleteTagPayload!` - Delete tag
  - `addTagsToItem(input: AddTagsToItemInput!): AddTagsToItemPayload!` - Add tags to item
  - `removeTagFromItem(input: RemoveTagFromItemInput!): RemoveTagFromItemPayload!` - Remove tag from item
  - `suggestTags(input: SuggestTagsInput!): SuggestTagsPayload!` - Get tag suggestions

### Search & Retrieval

| API Name | Description | Version | Status | Documentation |
|----------|-------------|---------|--------|---------------|
| Search & Retrieval API | Provides search and retrieval capabilities for knowledge items | v1 | Active | [Search & Retrieval API Documentation](./search-retrieval-api.md) |

#### Key Endpoints/Operations

- **RESTful**:
  - `GET /api/v1/search` - Search knowledge items
  - `GET /api/v1/search/semantic` - Semantic search
  - `GET /api/v1/knowledge-items/{itemId}/similar` - Find similar items
  - `GET /api/v1/knowledge-items/recent` - Get recently accessed items
  - `POST /api/v1/saved-searches` - Save search
  - `GET /api/v1/saved-searches` - List saved searches
  - `GET /api/v1/saved-searches/{searchId}` - Get saved search
  - `POST /api/v1/saved-searches/{searchId}/execute` - Execute saved search
  - `DELETE /api/v1/saved-searches/{searchId}` - Delete saved search

- **GraphQL**:
  - `search(query: String!, filter: SearchFilterInput): SearchResultConnection!` - Search knowledge items
  - `semanticSearch(query: String!, filter: SearchFilterInput): SearchResultConnection!` - Semantic search
  - `similarItems(itemId: ID!, limit: Int): [KnowledgeItem!]!` - Find similar items
  - `recentItems(limit: Int): [KnowledgeItem!]!` - Get recently accessed items
  - `savedSearches: [SavedSearch!]!` - List saved searches
  - `savedSearch(id: ID!): SavedSearch` - Get saved search
  - `saveSearch(input: SaveSearchInput!): SaveSearchPayload!` - Save search
  - `executeSearch(input: ExecuteSearchInput!): SearchResultConnection!` - Execute saved search
  - `deleteSavedSearch(input: DeleteSavedSearchInput!): DeleteSavedSearchPayload!` - Delete saved search

### API Gateway

| API Name | Description | Version | Status | Documentation |
|----------|-------------|---------|--------|---------------|
| API Gateway | Provides authentication, authorization, and system-level operations | v1 | Active | [API Gateway Documentation](./api-gateway.md) |

#### Key Endpoints/Operations

- **RESTful**:
  - `POST /api/v1/auth/login` - User login
  - `POST /api/v1/auth/refresh` - Refresh token
  - `POST /api/v1/auth/logout` - User logout
  - `POST /api/v1/auth/register` - User registration
  - `GET /api/v1/auth/me` - Get current user
  - `GET /api/v1/system/health` - System health check
  - `GET /api/v1/system/version` - Get system version

- **GraphQL**:
  - `login(input: LoginInput!): LoginPayload!` - User login
  - `refreshToken(input: RefreshTokenInput!): RefreshTokenPayload!` - Refresh token
  - `logout: LogoutPayload!` - User logout
  - `register(input: RegisterInput!): RegisterPayload!` - User registration
  - `me: User` - Get current user
  - `systemHealth: SystemHealth!` - System health check
  - `systemVersion: String!` - Get system version

## API Change Management

For information on the API change management process, including how to request changes, version management, and deprecation process, please refer to the [API Change Management Documentation](./api-change-management.md).

## API Design Guidelines

For information on API design guidelines, including best practices, standards, and conventions for both RESTful and GraphQL APIs, please refer to the [API Design Guidelines](./api-design-guidelines.md).

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0 | 2023-06-15 | Initial catalog creation |