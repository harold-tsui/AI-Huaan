# API: Organization Config

## Overview
- **ID**: API-ORGANIZATION-CONFIG
- **Description**: Manages the configuration and execution of PARA organization.
- **Version**: 1.0
- **Status**: Active

## Endpoints

### GET /api/organization/config
- **Description**: Retrieves the PARA automatic organization configuration.
- **Request**:
  - **URL Parameters**: None
  - **Request Body**: None
- **Responses**:
  - **200 OK**: Returns the PARA organization configuration object.
  - **500 Internal Server Error**: `{"message": "Failed to fetch PARA organization config"}`

### POST /api/organization/config
- **Description**: Saves the PARA automatic organization configuration.
- **Request**:
  - **URL Parameters**: None
  - **Request Body**: A JSON object representing the PARA organization configuration.
- **Responses**:
  - **200 OK**: Returns a confirmation of the save operation.
  - **500 Internal Server Error**: `{"message": "Failed to save PARA organization config"}`

### POST /api/organization/execute
- **Description**: Manually triggers a one-time PARA organization task.
- **Request**:
  - **URL Parameters**: None
  - **Request Body**: None
- **Responses**:
  - **200 OK**: `{"message": "PARA organization executed successfully"}`
  - **503 Service Unavailable**: `{"message": "Scheduler manager not available"}`
  - **500 Internal Server Error**: `{"message": "Failed to execute PARA organization"}`

### GET /api/organization/status
- **Description**: Retrieves the status of the organization scheduler.
- **Request**:
  - **URL Parameters**: None
  - **Request Body**: None
- **Responses**:
  - **200 OK**: Returns the scheduler status object.
  - **503 Service Unavailable**: `{"message": "Scheduler manager not available"}`
  - **500 Internal Server Error**: `{"message": "Failed to get scheduler status"}`

### GET /api/organization/history
- **Description**: Retrieves the history of organization tasks.
- **Request**:
  - **URL Parameters**: None
  - **Request Body**: None
- **Responses**:
  - **200 OK**: Returns an array of organization history records.
  - **500 Internal Server Error**: `{"message": "Failed to fetch organization history"}`

## Change History
- **2024-07-29**: Initial documentation created.