# API: Config Management

## Overview
- **ID**: API-CONFIG-MANAGEMENT
- **Description**: Manages various configurations for the BASB system.
- **Version**: 1.0
- **Status**: Active

## Endpoints

### GET /api/config/core-platform
- **Description**: Retrieves the core platform configuration.
- **Request**:
  - **URL Parameters**: None
  - **Request Body**: None
- **Responses**:
  - **200 OK**: Returns the core platform configuration object.
  - **500 Internal Server Error**: `{"message": "Failed to fetch core platform config"}`

### POST /api/config/core-platform
- **Description**: Saves the core platform configuration.
- **Request**:
  - **URL Parameters**: None
  - **Request Body**: A JSON object representing the core platform configuration.
- **Responses**:
  - **200 OK**: Returns a confirmation of the save operation.
  - **500 Internal Server Error**: `{"message": "Failed to save core platform config"}`

### GET /api/config/para-organization
- **Description**: Retrieves the PARA organization configuration.
- **Request**:
  - **URL Parameters**: None
  - **Request Body**: None
- **Responses**:
  - **200 OK**: Returns the PARA organization configuration object.
  - **500 Internal Server Error**: `{"message": "Failed to fetch PARA organization config"}`

### POST /api/config/para-organization
- **Description**: Saves the PARA organization configuration.
- **Request**:
  - **URL Parameters**: None
  - **Request Body**: A JSON object representing the PARA organization configuration.
- **Responses**:
  - **200 OK**: Returns a confirmation of the save operation.
  - **500 Internal Server Error**: `{"message": "Failed to save PARA organization config"}`

### GET /api/config/all
- **Description**: Retrieves all configurations.
- **Request**:
  - **URL Parameters**: None
  - **Request Body**: None
- **Responses**:
  - **200 OK**: Returns an object containing all configurations.
  - **500 Internal Server Error**: `{"message": "Failed to fetch all configs"}`

## Change History
- **2024-07-29**: Initial documentation created.