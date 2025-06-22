// src/services/organization/register.ts

import { globalServiceFactory } from '../../shared/mcp-core/service-factory';
import { globalServiceRegistry } from '../../shared/mcp-core/service-registry';
import { OrganizationService } from './organization.service';
import { OrganizationSchedulerManager } from './organization-scheduler-manager';
import { LocalStorageService } from '../../shared/storage-services/local-storage-service';
import { MockLLMService } from '../../shared/ai-services/mock-llm.service';
import { ConfigManagementService } from '../config-management/config-management.service';
import { IStorageService } from '../../shared/storage-services/storage.interface';
import { ILLMService } from '../../shared/ai-services/llm.interface';
import { ServiceConfig, IMCPService, ServiceStatus, ServiceMetadata, ServiceInfo, MCPRequest, MCPResponse } from '../../shared/mcp-core/types';
import { Logger } from '../../utils/logger';
import { MCPService, MCPMessage } from '../../shared/mcp-core/mcp-core.types';

const logger = new Logger('OrganizationServiceRegistration');

// 全局调度管理器实例
let schedulerManager: OrganizationSchedulerManager | null = null;
let organizationServiceInstance: OrganizationService | null = null;

export async function registerOrganizationService(): Promise<void> {
  // Manually instantiate dependencies first
  // In a more complex DI system, these would be resolved by the container
  const storageServiceInstance = new LocalStorageService({ rootDir: '/Users/haroldtsui/ObsidianWorkspace' });
  // We can register storageServiceInstance to the factory if it's meant to be a shared instance,
  // but for now, OrganizationService just needs an instance.
  // globalServiceFactory.registerServiceConstructor('LocalStorageServiceForOrg', () => storageServiceInstance); // Example if needed

  const llmServiceInstance = new MockLLMService();
  // Similarly, register if it's a shared instance.
  // globalServiceFactory.registerServiceConstructor('MockLLMServiceForOrg', () => llmServiceInstance);
  
  const configServiceInstance = new ConfigManagementService();
  
  // 预先创建 OrganizationService 实例
  organizationServiceInstance = new OrganizationService('organization-service', storageServiceInstance as any as IStorageService, llmServiceInstance as ILLMService);
  
  // 预先创建调度管理器实例
  schedulerManager = new OrganizationSchedulerManager(
    organizationServiceInstance,
    storageServiceInstance as any as IStorageService,
    configServiceInstance
  );

  // Adapter class for OrganizationService to match the factory's expected constructor signature
  const AdapterOrganizationService = class implements IMCPService {
    private orgService: OrganizationService;
    
    constructor(config?: ServiceConfig) {
      // 使用预先创建的实例
      if (!organizationServiceInstance) {
        throw new Error('OrganizationService instance not available');
      }
      this.orgService = organizationServiceInstance;
      logger.info(`AdapterOrganizationService instantiated with serviceId: ${this.orgService.getInfo().id}`, config);
    }

    getInfo() {
      return this.orgService.getInfo();
    }

    async handleMessage(message: MCPMessage): Promise<MCPResponse> {
      if (typeof (this.orgService as any).handleMessage === 'function') {
        return (this.orgService as any).handleMessage(message);
      }
      throw new Error('handleMessage not implemented in OrganizationService');
    }

    async healthCheck(): Promise<boolean> {
      if (typeof this.orgService.healthCheck === 'function') {
        return this.orgService.healthCheck();
      }
      return true;
    }

    async handleRequest(request: MCPRequest): Promise<MCPResponse> {
      if (typeof this.orgService.handleRequest === 'function') {
        return this.orgService.handleRequest(request);
      }
      throw new Error('handleRequest not implemented');
    }

    getStatus(): ServiceStatus {
      if (typeof this.orgService.getStatus === 'function') {
        return this.orgService.getStatus();
      }
      return ServiceStatus.ACTIVE;
    }

    getMetadata(): ServiceMetadata {
      if (typeof this.orgService.getMetadata === 'function') {
        return this.orgService.getMetadata();
      }
      return {
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Organization Service',
        capabilities: [],
        dependencies: []
      };
    }

    getConfig(): ServiceConfig {
      if (typeof this.orgService.getConfig === 'function') {
        return this.orgService.getConfig();
      }
      return {};
    }

    updateConfig(config: Partial<ServiceConfig>): void {
      if (typeof this.orgService.updateConfig === 'function') {
        this.orgService.updateConfig(config);
      }
    }

    // Ensure initialize and shutdown methods are present if IMCPService requires them
    // and they are not automatically handled by the base MCPService class (if OrganizationService extends it)
    async initialize(): Promise<boolean> {
      try {
        // Add any specific initialization logic for OrganizationService if needed
        logger.info(`OrganizationService (${this.orgService.getInfo().id}) initialized.`);
        
        if (schedulerManager) {
          await schedulerManager.initialize();
          logger.info('OrganizationSchedulerManager initialized successfully.');
        }
        
        // If OrganizationService extends a base MCPService that has initialize, call super.initialize()
        if (typeof this.orgService.initialize === 'function') {
          return await this.orgService.initialize();
        }
        return true;
      } catch (error) {
        logger.error('Error initializing OrganizationService:', error);
        return false;
      }
    }

    async shutdown(): Promise<boolean> {
      try {
        // Add any specific shutdown logic for OrganizationService if needed
        logger.info(`OrganizationService (${this.orgService.getInfo().id}) shutting down.`);
        
        // 销毁调度管理器
        if (schedulerManager) {
          schedulerManager.destroy();
          schedulerManager = null;
          logger.info('OrganizationSchedulerManager destroyed.');
        }
        
        if (typeof this.orgService.shutdown === 'function') {
          return await this.orgService.shutdown();
        }
        return true;
      } catch (error) {
        logger.error('Error shutting down OrganizationService:', error);
        return false;
      }
    }
  };

  // 创建一个包装类来使 OrganizationSchedulerManager 符合 IMCPService 接口
  class OrganizationSchedulerManagerService extends MCPService {
    private schedulerManager: OrganizationSchedulerManager;

    constructor(schedulerManager: OrganizationSchedulerManager) {
      super('OrganizationSchedulerManager');
      this.schedulerManager = schedulerManager;
    }

    async initialize(): Promise<boolean> {
      // 设置服务状态为活跃
      (this as any).status = ServiceStatus.ACTIVE;
      return true; // 调度管理器已经在 OrganizationService 中初始化
    }

    async shutdown(): Promise<boolean> {
      return true; // 调度管理器将在 OrganizationService 中销毁
    }

    async handleMessage(message: MCPMessage): Promise<MCPResponse> {
      throw new Error('OrganizationSchedulerManagerService does not handle MCP messages directly');
    }

    getSchedulerManager(): OrganizationSchedulerManager {
      return this.schedulerManager;
    }
  }

  // 注册调度管理器服务构造函数
  globalServiceFactory.registerServiceConstructor(
    'OrganizationSchedulerManager',
    () => {
      if (!schedulerManager) {
        throw new Error('Scheduler manager not available.');
      }
      return new OrganizationSchedulerManagerService(schedulerManager);
    }
  );
  
  // 立即创建并注册调度管理器服务实例
  try {
    const schedulerManagerService = new OrganizationSchedulerManagerService(schedulerManager);
    await schedulerManagerService.initialize(); // 初始化服务以设置正确的状态
    globalServiceRegistry.registerService(schedulerManagerService);
    logger.info('OrganizationSchedulerManager service instance created, initialized and registered.');
  } catch (error) {
    logger.error('Failed to create OrganizationSchedulerManager service instance:', error);
  }

  globalServiceFactory.registerServiceConstructor(
    'OrganizationService', // This is the name used to retrieve/create the service via factory
    AdapterOrganizationService as new (config?: ServiceConfig) => IMCPService
  );

  logger.info('Registered OrganizationService constructor to global service factory.');

  // Note: Service instance will be created and initialized when first requested
  // This avoids duplicate initialization during registration phase
  logger.info('OrganizationService registration completed. Instance will be created on demand.');
}