// src/shared/mcp-core/mcp-core.types.ts

export interface MCPMessage { 
  type: string; 
  payload: any; 
  correlationId?: string; 
  senderId?: string; 
}

export interface MCPResponse { 
  status: 'success' | 'error'; 
  payload: any; 
  correlationId?: string; 
}

import { IMCPService, MCPRequest, MCPResponse as IMCPResponse, ServiceConfig, ServiceInfo, ServiceMetadata, ServiceStatus } from './types';
import { Logger } from 'winston';
import { getGlobalLogger } from '../../utils/logger'; // Assuming logger is in utils

export class MCPService implements IMCPService {
  protected serviceId: string;
  protected eventHandlers: Map<string, (message: MCPMessage) => Promise<MCPResponse>> = new Map();
  protected logger: Logger;

  constructor(serviceId: string) {
    this.serviceId = serviceId;
    try {
      this.logger = getGlobalLogger(); // Initialize logger
    } catch (error) {
      console.error('Failed to initialize logger in MCPService:', error);
      // Create a fallback logger to prevent service failure
      this.logger = {
        info: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.log,
        verbose: console.log
      } as any;
    }
  }

  protected on(messageType: string, handler: (message: MCPMessage) => Promise<MCPResponse>): void {
    this.eventHandlers.set(messageType, handler);
  }

  // This is a mock processing function. In a real MCP system, this would be more complex.
  async processMessage(message: MCPMessage): Promise<MCPResponse> {
    const handler = this.eventHandlers.get(message.type);
    if (handler) {
      return handler(message);
    }
    console.error(`No handler for message type ${message.type} in service ${this.serviceId}`);
    return {
      status: 'error',
      payload: { message: `No handler for message type ${message.type}` },
      correlationId: message.correlationId,
    };
  }

  public start(): void {
    console.log(`MCP Service ${this.serviceId} started.`);
    // In a real scenario, this would connect to an MCP broker
  }

  public stop(): void {
    console.log(`MCP Service ${this.serviceId} stopped.`);
    // Cleanup resources, disconnect from broker etc.
  }

  // IMCPService interface implementation (add stubs or basic implementations)
  async initialize(): Promise<boolean> {
    console.log(`Service ${this.serviceId} initializing...`);
    // Basic implementation, should be overridden by subclasses
    this.status = ServiceStatus.INITIALIZED;
    return true;
  }

  async shutdown(): Promise<boolean> {
    console.log(`Service ${this.serviceId} shutting down...`);
    this.status = ServiceStatus.STOPPED;
    return true;
  }

  async healthCheck(): Promise<boolean> {
    // Basic implementation, should be overridden by subclasses
    return this.status === ServiceStatus.ACTIVE || this.status === ServiceStatus.INITIALIZED;
  }

  // Note: The original MCPService had a processMessage method which is similar to handleRequest.
  // We'll adapt handleRequest to use the existing eventHandlers logic or require subclasses to implement it fully.
  async handleRequest(request: MCPRequest): Promise<IMCPResponse> {
    const handler = this.eventHandlers.get(request.action); // Assuming request.action maps to message.type
    if (handler) {
      // The handler expects MCPMessage and returns MCPResponse (from mcp-core.types.ts)
      // We need to adapt this to IMCPResponse (from types.ts)
      // This is a simplified adaptation. A more robust solution might involve transforming the request/response objects.
      const coreResponse = await handler({ type: request.action, payload: request.params, correlationId: request.id, senderId: request.metadata?.source });
      return {
        id: request.id + '-response', // Generate a response ID
        requestId: request.id,
        service: this.serviceId,
        version: this.getInfo().version, // Assuming getInfo().version is available
        action: request.action,
        status: coreResponse.status === 'success' ? 'success' : 'error',
        data: coreResponse.payload,
        error: coreResponse.status === 'error' ? { code: 'UNKNOWN_ERROR', message: JSON.stringify(coreResponse.payload) } : undefined,
        metadata: { timestamp: new Date() }
      };
    }
    console.error(`No handler for action ${request.action} in service ${this.serviceId}`);
    return {
      id: request.id + '-response',
      requestId: request.id,
      service: this.serviceId,
      version: this.getInfo().version, // Assuming getInfo().version is available
      action: request.action,
      status: 'error',
      error: { code: 'METHOD_NOT_FOUND', message: `No handler for action ${request.action}` },
      metadata: { timestamp: new Date() }
    };
  }

  private status: ServiceStatus = ServiceStatus.INITIALIZING;
  getStatus(): ServiceStatus {
    return this.status;
  }

  // Basic implementations for other IMCPService methods
  getMetadata(): ServiceMetadata {
    // Placeholder implementation
    return {
      createdAt: new Date(),
      updatedAt: new Date(),
      description: `Metadata for ${this.serviceId}`,
      capabilities: [],
      dependencies: []
    };
  }

  getConfig(): ServiceConfig {
    // Placeholder implementation, subclasses should provide actual config
    return { serviceId: this.serviceId };
  }

  updateConfig(config: Partial<ServiceConfig>): void {
    console.log(`Updating config for ${this.serviceId}`, config);
    // Placeholder implementation
  }

  getInfo(): ServiceInfo {
    // Placeholder implementation
    return {
      id: this.serviceId,
      name: this.serviceId, // Or a more descriptive name
      version: '1.0.0', // Default version
      status: this.getStatus(),
      description: `Information for ${this.serviceId}`
    };
  }
}