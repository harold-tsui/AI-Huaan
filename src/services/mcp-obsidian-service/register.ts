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
  console.log('Registering MCP Obsidian Service...');
  
  // Adapter class to match the constructor signature expected by the service factory
  const AdapterObsidianService = class extends MCPObsidianService {
    constructor(config?: ServiceConfig) {
      console.log('AdapterObsidianService constructor called with config:', config);
      
      // Convert the generic ServiceConfig to ObsidianServiceConfig
      // In development mode, pass undefined values to let the service handle defaults
      const obsidianConfig: Partial<ObsidianServiceConfig> = {
        obsidianApiUrl: (config as any)?.obsidianApiUrl || process.env.OBSIDIAN_API_URL || undefined,
        obsidianApiKey: (config as any)?.obsidianApiKey || process.env.OBSIDIAN_API_KEY || undefined,
        defaultVaultName: (config as any)?.defaultVaultName || process.env.OBSIDIAN_VAULT_NAME || undefined
      };
      
      // Filter out undefined values to let the service handle defaults properly
      const cleanConfig = Object.fromEntries(
        Object.entries(obsidianConfig).filter(([_, v]) => v !== undefined)
      ) as Partial<ObsidianServiceConfig>;
      
      console.log('Calling super with obsidianConfig:', cleanConfig);
      super(cleanConfig);
    }
  };

  // 注册服务构造函数到全局服务工厂
  globalServiceFactory.registerServiceConstructor(
    'obsidian-storage-service',
    AdapterObsidianService as new (config?: ServiceConfig) => IMCPService // Cast to the expected constructor type
  );
  
  console.info('Registered MCP Obsidian Service to service factory');
}