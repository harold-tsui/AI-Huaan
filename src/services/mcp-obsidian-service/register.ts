/**
 * MCP Obsidian Service Registration - MCP Obsidian 服务注册
 * 
 * 将 MCP Obsidian 服务注册到MCP服务工厂
 */

import { globalServiceFactory } from '../../shared/mcp-core/service-factory';
import { MCPObsidianService, ObsidianServiceConfig } from './mcp-obsidian.service';
import { IMCPService, ServiceConfig } from '../../shared/mcp-core/types';

/**
 * 注册 MCP Obsidian 服务
 */
export function registerMCPObsidianService(): void {
  // Adapter class to match the constructor signature expected by the service factory
  const AdapterObsidianService = class extends MCPObsidianService {
    constructor(config?: ServiceConfig) {
      // The factory now expects a full ObsidianServiceConfig, but for registration,
      // we might not have it. We pass a minimal or empty object and expect
      // the actual configuration to be provided when the service is instantiated.
      // This is a workaround for the service factory's current design.
      super((config as ObsidianServiceConfig) || {} as ObsidianServiceConfig);
    }
  };

  // 注册服务构造函数到全局服务工厂
  globalServiceFactory.registerServiceConstructor(
    'ObsidianService',
    AdapterObsidianService as new (config?: ServiceConfig) => IMCPService // Cast to the expected constructor type
  );
  
  console.info('Registered MCP Obsidian Service to service factory');
}