# API Development Plan

## 1. Overview

This document outlines the development plan for all APIs in the BASB system, including both implemented and planned APIs. The plan is divided into frontend and backend components and is structured by quarters to provide a clear roadmap for development.

## 2. API Catalog

A comprehensive catalog of all APIs is maintained in the [API Interface Catalog](./api-documentation/api-interface-catalog.md).

## 4. API Summary Table

This table provides a consolidated view of all APIs, both implemented and planned.

| Category                   | URI                                         | Method  | Component | Description                                                  | Status        |
| -------------------------- | ------------------------------------------- | ------- | --------- | ------------------------------------------------------------ | ------------- |
| Configuration Management   | /api/config/core-platform                   | GET     | Backend   | Get core platform configuration.                             | Implemented   |
| Configuration Management   | /api/config/core-platform                   | POST    | Backend   | Save core platform configuration.                            | Implemented   |
| Configuration Management   | /api/config/para-organization               | GET     | Backend   | Get PARA organization configuration.                         | Implemented   |
| Configuration Management   | /api/config/para-organization               | POST    | Backend   | Save PARA organization configuration.                        | Implemented   |
| Configuration Management   | /api/config/all                             | GET     | Backend   | Get all configurations.                                      | Implemented   |
| Knowledge Organization     | /api/organization/config                    | GET     | Backend   | Get PARA auto-classification configuration.                  | Implemented   |
| Knowledge Organization     | /api/organization/config                    | POST    | Backend   | Save PARA auto-classification configuration.                 | Implemented   |
| Knowledge Organization     | /api/organization/execute                   | POST    | Backend   | Manually execute PARA auto-classification.                   | Implemented   |
| Knowledge Organization     | /api/organization/status                    | GET     | Backend   | Get the status of the PARA auto-classification scheduler.    | Implemented   |
| Knowledge Organization     | /api/organization/history                   | GET     | Backend   | Get the history of PARA auto-classification executions.      | Implemented   |
| Knowledge Management       | /api/v1/users/{userId}/knowledge-items      | GET     | Backend   | Get a list of knowledge items for a user.                    | Planned       |
| Knowledge Management       | /api/v1/users/{userId}/knowledge-items      | POST    | Backend   | Create a new knowledge item for a user.                      | Planned       |
| Knowledge Management       | /api/v1/users/{userId}/knowledge-items/{id} | GET     | Backend   | Get a specific knowledge item by ID.                         | Planned       |
| Knowledge Management       | /api/v1/users/{userId}/knowledge-items/{id} | PUT     | Backend   | Update a specific knowledge item.                            | Planned       |
| Knowledge Management       | /api/v1/users/{userId}/knowledge-items/{id} | PATCH   | Backend   | Partially update a specific knowledge item.                  | Planned       |
| Knowledge Management       | /api/v1/users/{userId}/knowledge-items/{id} | DELETE  | Backend   | Delete a specific knowledge item.                            | Planned       |
| Knowledge Organization     | /api/v1/users/{userId}/knowledge-items/{id}/relations | GET     | Backend   | Get all relations for a knowledge item.                      | Planned       |
| Knowledge Organization     | /api/v1/users/{userId}/knowledge-items/{id}/relations | POST    | Backend   | Add a new relation to a knowledge item.                      | Planned       |
| Knowledge Organization     | /api/v1/users/{userId}/knowledge-items/{id}/relations/{relationId} | DELETE  | Backend   | Remove a relation from a knowledge item.                     | Planned       |
| Knowledge Organization     | /api/v1/users/{userId}/knowledge-items/{id}/tags | POST    | Backend   | Add a tag or category to a knowledge item.                   | Planned       |
| Knowledge Organization     | /api/v1/users/{userId}/knowledge-items/{id}/tags | DELETE  | Backend   | Remove a tag or category from a knowledge item.              | Planned       |
| Knowledge Ingestion        | /api/v1/ingestion/file                      | POST    | Backend   | Ingest knowledge from a file.                                | Planned       |
| Knowledge Ingestion        | /api/v1/ingestion/text                      | POST    | Backend   | Ingest knowledge from a text snippet.                        | Planned       |
| Knowledge Ingestion        | /api/v1/ingestion/url                       | POST    | Backend   | Ingest knowledge from a URL.                                 | Planned       |
| Search & Retrieval         | /api/v1/search                              | POST    | Backend   | Perform full-text and semantic search.                       | Planned       |
| User Context               | /api/v1/user-context/{userId}               | GET     | Backend   | Get user context profile.                                    | Planned       |
| User Context               | /api/v1/user-context/{userId}               | PUT     | Backend   | Update user context profile.                                 | Planned       |
| Distill & Processing       | /api/v1/processing/summarize                | POST    | Backend   | Summarize a knowledge item.                                  | Planned       |
| Distill & Processing       | /api/v1/processing/extract-concepts         | POST    | Backend   | Extract key concepts from a knowledge item.                  | Planned       |
| Distill & Processing       | /api/v1/processing/discover-relations       | POST    | Backend   | Discover new relations for a knowledge item.                 | Planned       |
| Distill & Processing       | /api/v1/processing/q-and-a                  | POST    | Backend   | Generate Q&A for a knowledge item.                           | Planned       |
| Storage Management         | /api/v1/storage/upload                      | POST    | Backend   | Upload a file to storage.                                    | Planned       |
| Presentation               | /api/v1/presentation/view/{viewType}        | GET     | Backend   | Get a formatted presentation of knowledge.                   | Planned       |
| -                                           | -       | Frontend  | Client for interacting with the backend Knowledge Item API.  | In Progress   |
| -                                           | -       | Frontend  | Client for the admin UI to manage configurations.            | Planned       |
| -                                           | -       | Frontend  | Client for managing user profiles.                           | Planned       |

## 3. Development Roadmap

### Backend API Development Plan

#### Q3 2024: Core Knowledge Management & Foundation

*   **Knowledge Item API (New)**
    *   **Description**: Core API for managing knowledge items, including CRUD operations, relations, and tags.
    *   **Priority**: High
    *   **Status**: Planned
    *   **Action Items**:
        *   **Phase 1: Core CRUD**
            *   Implement `GET /api/v1/users/{userId}/knowledge-items` and `GET /api/v1/users/{userId}/knowledge-items/{id}`.
            *   Implement `POST /api/v1/users/{userId}/knowledge-items`.
            *   Implement `PUT /api/v1/users/{userId}/knowledge-items/{id}` and `PATCH /api/v1/users/{userId}/knowledge-items/{id}`.
            *   Implement `DELETE /api/v1/users/{userId}/knowledge-items/{id}`.
            *   Define OpenAPI specification for all CRUD endpoints.
            *   Add routes to `routes.ts`.
        *   **Phase 2: Advanced Features**
            *   Implement relation management: `GET`, `POST`, `DELETE /api/v1/users/{userId}/knowledge-items/{id}/relations`.
            *   Implement tag and category management: `POST`, `DELETE /api/v1/users/{userId}/knowledge-items/{id}/tags`.
            *   Update OpenAPI specification to include these new endpoints.
*   **Knowledge Ingestion API (New)**
    *   **Description**: API for ingesting knowledge from various sources (e.g., files, text, web).
    *   **Priority**: High
    *   **Status**: Planned
    *   **Action Items**:
        *   Define OpenAPI specification for `/api/v1/ingestion/...`.
        *   **Phase 1**: Implement initial version for file (`/file`) and text (`/text`) ingestion.
        *   **Phase 2**: Implement web URL ingestion (`/url`).
        *   **Phase 3 (Q4)**: Plan for advanced ingestion from Git repos and other sources.
        *   Add to `routes.ts`.
*   **Search API (New)**
    *   **Description**: API for full-text, semantic, and filtered search across the knowledge base.
    *   **Priority**: High
    *   **Status**: Planned
    *   **Action Items**:
        *   Define OpenAPI specification for `POST /api/v1/search`.
        *   Implement backend service integrating with the chosen search engine (e.g., Tantivy, OpenSearch).
        *   Support text queries, tag/category filters, and date range filters.
        *   Add to `routes.ts`.
*   **Config Management API (Implemented)**
    *   **Description**: Manages core platform and PARA organization configurations.
    *   **Status**: Active
    *   **Action Items**: Continue maintenance and support.
*   **Organization Config API (Implemented)**
    *   **Description**: Manages PARA auto-classification configuration, execution, and status.
    *   **Status**: Active
    *   **Action Items**: Continue maintenance and support.

#### Q4 2024: User Context & Intelligence

*   **User Context API (New)**
    *   **Description**: API for managing the dynamic user context, including profiles, preferences, and behavioral patterns, as detailed in the requirements specification.
    *   **Priority**: High
    *   **Status**: Planned
    *   **Action Items**:
        *   Define OpenAPI specification for `GET, PUT /api/v1/user-context/{userId}`.
        *   **Phase 1**: Implement core profile and preference management.
        *   **Phase 2 (Q1 2025)**: Implement services for behavioral analysis and context updates.
*   **Distill & Processing API (New)**
    *   **Description**: API for AI-powered knowledge distillation (summarization, concept extraction, etc.).
    *   **Priority**: Medium
    *   **Status**: Planned
    *   **Action Items**:
        *   Define OpenAPI specification for `/api/v1/processing/...` endpoints.
        *   Implement summarization service (`/summarize`).
        *   Implement key concept extraction (`/extract-concepts`).
        *   Plan for relation discovery and Q&A services in the next quarter.

#### Q1 2025: Scalability & Advanced Features

*   **Storage API (New)**
    *   **Description**: API for abstracting and managing knowledge storage solutions.
    *   **Priority**: Medium
    *   **Status**: Planned
    *   **Action Items**:
        *   Define OpenAPI specification.
        *   Implement with support for local and S3 storage.
*   **Presentation API (New)**
    *   **Description**: API for formatting and presenting knowledge in various views.
    *   **Priority**: Low
    *   **Status**: Planned
    *   **Action Items**:
        *   Define OpenAPI specification.

### Frontend API Client Development Plan

#### Q3 2024: Core API Integration

*   **Knowledge Item API Client (Partially Implemented)**
    *   **Description**: Frontend client for interacting with the backend Knowledge Item API.
    *   **Status**: In Progress
    *   **Action Items**:
        *   Complete implementation to cover all CRUD operations.
        *   Integrate with the backend once the Knowledge Item API is ready.
*   **Config Management Client (New)**
    *   **Description**: Frontend client for the admin UI to manage configurations.
    *   **Status**: Planned
    *   **Action Items**:
        *   Develop API client for `Config Management API` and `Organization Config API`.

#### Q4 2024: User Profile Integration

*   **User Profile Client (New)**
    *   **Description**: Frontend client for managing user profiles.
    *   **Status**: Planned
    *   **Action Items**:
        *   Develop client to interact with the `User Profile API`.