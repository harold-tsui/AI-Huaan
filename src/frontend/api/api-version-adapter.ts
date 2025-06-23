/**
 * API Version Adapter
 * 
 * Defines the interface for API version adapters and provides implementations for specific version transitions.
 */

/**
 * API version adapter interface
 */
export interface IApiVersionAdapter {
  adaptRequest(request: any): any;
  adaptResponse(response: any): any;
}

/**
 * v1 to v2 adapter
 */
export class V1ToV2Adapter implements IApiVersionAdapter {
  adaptRequest(request: any): any {
    // Example: Convert v1 request format to v2
    if (request.metadata && request.metadata.tags) {
      request.tags = request.metadata.tags;
      delete request.metadata.tags;
    }
    return request;
  }

  adaptResponse(response: any): any {
    // Example: Convert v2 response format to v1
    if (response.tags) {
      if (!response.metadata) response.metadata = {};
      response.metadata.tags = response.tags;
      delete response.tags;
    }
    return response;
  }
}