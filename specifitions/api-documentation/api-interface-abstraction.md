# API Interface Abstraction

## Overview

This document outlines the approach to interface abstraction in the Building a Second Brain (BASB) system. Interface abstraction is a critical aspect of API design that promotes reusability, consistency, and maintainability across the system's various services and components.

## Purpose of Interface Abstraction

Interface abstraction in the BASB system serves several key purposes:

1. **Separation of Concerns**: Isolating interface definitions from implementation details
2. **Consistency**: Ensuring consistent API patterns across different services
3. **Reusability**: Enabling code reuse through common interface patterns
4. **Evolvability**: Facilitating API evolution without breaking client code
5. **Testability**: Simplifying testing through well-defined interfaces

## Interface Abstraction Layers

The BASB system implements a layered approach to interface abstraction:

### 1. Core Interface Layer

The Core Interface Layer defines fundamental data structures, common patterns, and base interfaces used throughout the system.

**Key Components**:
- Base entity interfaces (e.g., `IEntity`, `IIdentifiable`)
- Common data structures (e.g., `Pagination`, `SortOrder`)
- Error types and response wrappers
- Base service interfaces

**Example**:

```typescript
// Core entity interface
export interface IEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Pagination interface
export interface IPagination {
  limit: number;
  offset: number;
  total: number;
}

// Response wrapper
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: IApiError;
  meta?: Record<string, any>;
}

// Error interface
export interface IApiError {
  code: string;
  message: string;
  details?: any;
}
```

### 2. Domain Interface Layer

The Domain Interface Layer defines interfaces specific to the business domains within the BASB system.

**Key Components**:
- Domain entity interfaces (e.g., `IKnowledgeItem`, `IUserContext`)
- Domain service interfaces (e.g., `IKnowledgeService`, `IParaService`)
- Domain-specific data structures

**Example**:

```typescript
// Knowledge item interface
export interface IKnowledgeItem extends IEntity {
  title: string;
  content: string;
  contentType: ContentType;
  metadata: IKnowledgeItemMetadata;
}

// Knowledge service interface
export interface IKnowledgeService {
  getKnowledgeItem(id: string): Promise<IKnowledgeItem>;
  listKnowledgeItems(filter: IKnowledgeItemFilter): Promise<IPaginatedResult<IKnowledgeItem>>;
  createKnowledgeItem(item: ICreateKnowledgeItemInput): Promise<IKnowledgeItem>;
  updateKnowledgeItem(id: string, item: IUpdateKnowledgeItemInput): Promise<IKnowledgeItem>;
  deleteKnowledgeItem(id: string): Promise<void>;
}
```

### 3. API Interface Layer

The API Interface Layer defines the external-facing interfaces for RESTful and GraphQL APIs.

**Key Components**:
- REST controller interfaces
- GraphQL resolver interfaces
- Request/response DTOs
- API-specific validation rules

**Example**:

```typescript
// REST controller interface
export interface IKnowledgeController {
  getKnowledgeItem(req: Request, res: Response): Promise<Response>;
  listKnowledgeItems(req: Request, res: Response): Promise<Response>;
  createKnowledgeItem(req: Request, res: Response): Promise<Response>;
  updateKnowledgeItem(req: Request, res: Response): Promise<Response>;
  deleteKnowledgeItem(req: Request, res: Response): Promise<Response>;
}

// GraphQL resolver interface
export interface IKnowledgeResolver {
  knowledgeItem(parent: any, args: { id: string }, context: any): Promise<IKnowledgeItem>;
  knowledgeItems(parent: any, args: IKnowledgeItemsArgs, context: any): Promise<IPaginatedResult<IKnowledgeItem>>;
  createKnowledgeItem(parent: any, args: { input: ICreateKnowledgeItemInput }, context: any): Promise<ICreateKnowledgeItemPayload>;
  updateKnowledgeItem(parent: any, args: { input: IUpdateKnowledgeItemInput }, context: any): Promise<IUpdateKnowledgeItemPayload>;
  deleteKnowledgeItem(parent: any, args: { input: IDeleteKnowledgeItemInput }, context: any): Promise<IDeleteKnowledgeItemPayload>;
}
```

## Interface Abstraction Techniques

### Interface Segregation

Following the Interface Segregation Principle (ISP), interfaces in the BASB system are kept focused and cohesive, with each interface serving a specific purpose.

**Example**:

```typescript
// Instead of a single large interface
export interface IKnowledgeService {
  // CRUD operations
  getKnowledgeItem(id: string): Promise<IKnowledgeItem>;
  createKnowledgeItem(item: ICreateKnowledgeItemInput): Promise<IKnowledgeItem>;
  // ... other CRUD operations
  
  // Search operations
  searchKnowledgeItems(query: string): Promise<IKnowledgeItem[]>;
  semanticSearch(query: string): Promise<IKnowledgeItem[]>;
  
  // Tag operations
  addTagToItem(itemId: string, tagId: string): Promise<void>;
  removeTagFromItem(itemId: string, tagId: string): Promise<void>;
  
  // PARA operations
  associateWithParaNode(itemId: string, nodeId: string): Promise<void>;
  dissociateFromParaNode(itemId: string, nodeId: string): Promise<void>;
}

// We use segregated interfaces
export interface IKnowledgeBasicService {
  getKnowledgeItem(id: string): Promise<IKnowledgeItem>;
  createKnowledgeItem(item: ICreateKnowledgeItemInput): Promise<IKnowledgeItem>;
  // ... other CRUD operations
}

export interface IKnowledgeSearchService {
  searchKnowledgeItems(query: string): Promise<IKnowledgeItem[]>;
  semanticSearch(query: string): Promise<IKnowledgeItem[]>;
}

export interface IKnowledgeTagService {
  addTagToItem(itemId: string, tagId: string): Promise<void>;
  removeTagFromItem(itemId: string, tagId: string): Promise<void>;
}

export interface IKnowledgeParaService {
  associateWithParaNode(itemId: string, nodeId: string): Promise<void>;
  dissociateFromParaNode(itemId: string, nodeId: string): Promise<void>;
}
```

### Generic Interfaces

Generic interfaces are used to define common patterns that can be applied to different entity types.

**Example**:

```typescript
// Generic CRUD service interface
export interface ICrudService<T extends IEntity, CreateInput, UpdateInput> {
  get(id: string): Promise<T>;
  list(filter: any): Promise<IPaginatedResult<T>>;
  create(input: CreateInput): Promise<T>;
  update(id: string, input: UpdateInput): Promise<T>;
  delete(id: string): Promise<void>;
}

// Implementation for knowledge items
export class KnowledgeService implements ICrudService<IKnowledgeItem, ICreateKnowledgeItemInput, IUpdateKnowledgeItemInput> {
  // Implementation details
}

// Implementation for tags
export class TagService implements ICrudService<ITag, ICreateTagInput, IUpdateTagInput> {
  // Implementation details
}
```

### Adapter Pattern

The Adapter Pattern is used to bridge between different interface abstractions, particularly when integrating with external systems or legacy code.

**Example**:

```typescript
// External system interface
export interface IExternalStorageSystem {
  storeFile(fileData: Buffer, metadata: any): Promise<string>;
  retrieveFile(fileId: string): Promise<Buffer>;
  deleteFile(fileId: string): Promise<boolean>;
}

// BASB system interface
export interface IStorageService {
  saveFile(file: IFile): Promise<IFile>;
  getFile(id: string): Promise<IFile>;
  removeFile(id: string): Promise<void>;
}

// Adapter implementation
export class ExternalStorageAdapter implements IStorageService {
  constructor(private externalStorage: IExternalStorageSystem) {}
  
  async saveFile(file: IFile): Promise<IFile> {
    const fileId = await this.externalStorage.storeFile(file.content, {
      name: file.name,
      contentType: file.contentType,
      size: file.size
    });
    return { ...file, id: fileId };
  }
  
  async getFile(id: string): Promise<IFile> {
    const content = await this.externalStorage.retrieveFile(id);
    // Transform to IFile format
    return { id, content, /* other properties */ };
  }
  
  async removeFile(id: string): Promise<void> {
    await this.externalStorage.deleteFile(id);
  }
}
```

## Interface Definition Language (IDL)

The BASB system uses the following Interface Definition Languages:

### OpenAPI for RESTful APIs

OpenAPI (formerly Swagger) is used to define RESTful API interfaces. The OpenAPI specification serves as the single source of truth for RESTful API contracts.

**Example**:

```yaml
openapi: 3.0.0
info:
  title: Knowledge Item API
  version: 1.0.0
  description: API for managing knowledge items in the BASB system
paths:
  /api/v1/knowledge-items:
    get:
      summary: List knowledge items
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/KnowledgeItemListResponse'
    post:
      summary: Create a knowledge item
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateKnowledgeItemRequest'
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/KnowledgeItemResponse'
components:
  schemas:
    KnowledgeItem:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        content:
          type: string
        contentType:
          type: string
          enum: [TEXT, IMAGE, AUDIO, VIDEO, CODE]
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
```

### GraphQL Schema for GraphQL APIs

GraphQL Schema Definition Language (SDL) is used to define GraphQL API interfaces. The GraphQL schema serves as the single source of truth for GraphQL API contracts.

**Example**:

```graphql
type KnowledgeItem {
  id: ID!
  title: String!
  content: String!
  contentType: ContentType!
  createdAt: DateTime!
  updatedAt: DateTime!
  tags: [Tag!]
  paraNodes: [ParaNode!]
}

enum ContentType {
  TEXT
  IMAGE
  AUDIO
  VIDEO
  CODE
}

type Query {
  knowledgeItem(id: ID!): KnowledgeItem
  knowledgeItems(filter: KnowledgeItemFilterInput): KnowledgeItemConnection!
}

type Mutation {
  createKnowledgeItem(input: CreateKnowledgeItemInput!): CreateKnowledgeItemPayload!
  updateKnowledgeItem(input: UpdateKnowledgeItemInput!): UpdateKnowledgeItemPayload!
  deleteKnowledgeItem(input: DeleteKnowledgeItemInput!): DeleteKnowledgeItemPayload!
}

input KnowledgeItemFilterInput {
  title: StringFilterInput
  contentType: ContentType
  tags: [String!]
  createdAt: DateTimeFilterInput
}
```

### TypeScript Interfaces for Internal APIs

TypeScript interfaces are used to define internal API contracts between different components of the system.

**Example**:

```typescript
export interface IKnowledgeItem extends IEntity {
  title: string;
  content: string;
  contentType: ContentType;
  metadata: IKnowledgeItemMetadata;
}

export interface IKnowledgeItemMetadata {
  source: string;
  originalUrl?: string;
  author?: string;
  capturedAt: Date;
}

export enum ContentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  CODE = 'CODE'
}
```

## Interface Abstraction Implementation

### Code Generation

The BASB system uses code generation to create consistent implementations from interface definitions:

1. **OpenAPI Generator**: Generates server stubs and client SDKs from OpenAPI specifications
2. **GraphQL Code Generator**: Generates TypeScript types and resolvers from GraphQL schemas
3. **Custom Code Generators**: Generates boilerplate code for common patterns

### Dependency Injection

Dependency Injection is used to provide implementations for interfaces at runtime, promoting loose coupling and testability.

**Example**:

```typescript
// Service registration
container.register<IKnowledgeService>('KnowledgeService', KnowledgeServiceImpl);
container.register<IParaService>('ParaService', ParaServiceImpl);

// Controller with injected services
export class KnowledgeController implements IKnowledgeController {
  constructor(
    @inject('KnowledgeService') private knowledgeService: IKnowledgeService,
    @inject('ParaService') private paraService: IParaService
  ) {}
  
  async getKnowledgeItem(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const item = await this.knowledgeService.getKnowledgeItem(id);
    return res.json({ success: true, data: item });
  }
  
  // Other controller methods
}
```

## Interface Abstraction Best Practices

### Design Principles

1. **Single Responsibility**: Each interface should have a single responsibility
2. **Interface Segregation**: Prefer many small, focused interfaces over large, monolithic ones
3. **Dependency Inversion**: Depend on abstractions, not concrete implementations
4. **Consistency**: Use consistent naming, patterns, and conventions across interfaces
5. **Evolvability**: Design interfaces to evolve without breaking existing clients

### Naming Conventions

1. **Interface Names**: Prefix with `I` (e.g., `IKnowledgeService`)
2. **Method Names**: Use descriptive verb-noun combinations (e.g., `getKnowledgeItem`, `createUser`)
3. **Parameter Names**: Use descriptive names that reflect their purpose
4. **Return Types**: Be explicit about return types, including Promise wrappers for async methods

### Documentation

1. **Interface Documentation**: Document the purpose, responsibilities, and usage of each interface
2. **Method Documentation**: Document parameters, return values, exceptions, and side effects
3. **Example Usage**: Provide example usage for complex interfaces
4. **Version Information**: Include version information for interfaces that may change

## Interface Conflict Resolution

When conflicts arise between interfaces, the following strategies are employed:

### 1. Interface Harmonization

Reconcile conflicting interfaces by creating a unified interface that satisfies all requirements.

**Example**:

```typescript
// Service A's interface
export interface IServiceA {
  processItem(item: ItemA): Promise<ResultA>;
}

// Service B's interface
export interface IServiceB {
  handleItem(item: ItemB): Promise<ResultB>;
}

// Harmonized interface
export interface IUnifiedItemService {
  processItem(item: UnifiedItem): Promise<UnifiedResult>;
}

// Adapter for Service A
export class ServiceAAdapter implements IUnifiedItemService {
  constructor(private serviceA: IServiceA) {}
  
  async processItem(item: UnifiedItem): Promise<UnifiedResult> {
    const itemA = this.convertToItemA(item);
    const resultA = await this.serviceA.processItem(itemA);
    return this.convertToUnifiedResult(resultA);
  }
  
  // Conversion methods
}

// Adapter for Service B
export class ServiceBAdapter implements IUnifiedItemService {
  constructor(private serviceB: IServiceB) {}
  
  async processItem(item: UnifiedItem): Promise<UnifiedResult> {
    const itemB = this.convertToItemB(item);
    const resultB = await this.serviceB.handleItem(itemB);
    return this.convertToUnifiedResult(resultB);
  }
  
  // Conversion methods
}
```

### 2. Interface Versioning

When harmonization is not possible, create versioned interfaces to support both old and new patterns.

**Example**:

```typescript
// Original interface
export interface IKnowledgeServiceV1 {
  getItem(id: string): Promise<ItemV1>;
  saveItem(item: ItemV1): Promise<ItemV1>;
}

// New interface with breaking changes
export interface IKnowledgeServiceV2 {
  getKnowledgeItem(id: string): Promise<KnowledgeItemV2>;
  createKnowledgeItem(item: CreateKnowledgeItemInput): Promise<KnowledgeItemV2>;
  updateKnowledgeItem(id: string, item: UpdateKnowledgeItemInput): Promise<KnowledgeItemV2>;
}

// Facade that implements both interfaces
export class KnowledgeServiceFacade implements IKnowledgeServiceV1, IKnowledgeServiceV2 {
  constructor(private v2Service: IKnowledgeServiceV2) {}
  
  // V1 methods
  async getItem(id: string): Promise<ItemV1> {
    const v2Item = await this.v2Service.getKnowledgeItem(id);
    return this.convertToV1Item(v2Item);
  }
  
  async saveItem(item: ItemV1): Promise<ItemV1> {
    if (item.id) {
      const updateInput = this.convertToUpdateInput(item);
      const v2Item = await this.v2Service.updateKnowledgeItem(item.id, updateInput);
      return this.convertToV1Item(v2Item);
    } else {
      const createInput = this.convertToCreateInput(item);
      const v2Item = await this.v2Service.createKnowledgeItem(createInput);
      return this.convertToV1Item(v2Item);
    }
  }
  
  // V2 methods (direct pass-through)
  getKnowledgeItem(id: string): Promise<KnowledgeItemV2> {
    return this.v2Service.getKnowledgeItem(id);
  }
  
  createKnowledgeItem(item: CreateKnowledgeItemInput): Promise<KnowledgeItemV2> {
    return this.v2Service.createKnowledgeItem(item);
  }
  
  updateKnowledgeItem(id: string, item: UpdateKnowledgeItemInput): Promise<KnowledgeItemV2> {
    return this.v2Service.updateKnowledgeItem(id, item);
  }
  
  // Conversion methods
}
```

### 3. Deprecation and Migration

When conflicts cannot be resolved through harmonization or versioning, implement a deprecation and migration strategy.

**Example**:

```typescript
// Deprecated interface
export interface ILegacyService {
  /**
   * @deprecated Use INewService.processItem instead. Will be removed in v2.0.0.
   */
  processItem(item: LegacyItem): Promise<LegacyResult>;
}

// New interface
export interface INewService {
  processItem(item: NewItem): Promise<NewResult>;
}

// Implementation with deprecation warnings
export class LegacyServiceImpl implements ILegacyService {
  constructor(private newService: INewService) {}
  
  async processItem(item: LegacyItem): Promise<LegacyResult> {
    console.warn('LegacyService.processItem is deprecated. Use NewService.processItem instead.');
    const newItem = this.convertToNewItem(item);
    const newResult = await this.newService.processItem(newItem);
    return this.convertToLegacyResult(newResult);
  }
  
  // Conversion methods
}
```

## Conclusion

Interface abstraction is a critical aspect of the BASB system architecture, promoting reusability, consistency, and maintainability. By following the principles and practices outlined in this document, the BASB system can evolve while maintaining backward compatibility and providing a clear path for future enhancements.

## Appendix

### Interface Abstraction Checklist

- [ ] Interface has a clear, single responsibility
- [ ] Interface is properly segregated
- [ ] Interface follows naming conventions
- [ ] Interface is properly documented
- [ ] Interface is designed for evolution
- [ ] Interface has appropriate abstraction level
- [ ] Interface is consistent with existing interfaces
- [ ] Interface is testable

### References

- [Interface Segregation Principle](https://en.wikipedia.org/wiki/Interface_segregation_principle)
- [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
- [OpenAPI Specification](https://swagger.io/specification/)
- [GraphQL Schema Definition Language](https://graphql.org/learn/schema/)
- [TypeScript Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html)