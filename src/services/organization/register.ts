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


export function registerOrganizationService(): void {
  // Adapter class for OrganizationService to match the factory's expected constructor signature
  const AdapterOrganizationService = class implements IMCPService {
    private orgService: OrganizationService;
    private schedulerManager: OrganizationSchedulerManager;

    constructor(storageService: IStorageService, config?: ServiceConfig) {
      if (!storageService) {
        throw new Error('Failed to resolve dependencies for OrganizationService');
      }

      // Create mock services for dependencies that are not registered
      const llmService = new MockLLMService();
      const configService = new ConfigManagementService();

      this.orgService = new OrganizationService('organization-service', storageService, llmService);
      this.schedulerManager = new OrganizationSchedulerManager(this.orgService, storageService, configService);

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
        logger.info(`OrganizationService (${this.orgService.getInfo().id}) initialized.`);
        await this.schedulerManager.initialize();
        logger.info('OrganizationSchedulerManager initialized successfully.');

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
        logger.info(`OrganizationService (${this.orgService.getInfo().id}) shutting down.`);
        this.schedulerManager.destroy();
        logger.info('OrganizationSchedulerManager destroyed.');

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

  globalServiceFactory.registerServiceConstructor(
    'organization-service', 
    AdapterOrganizationService, 
    'obsidian-storage-service'
  );
  logger.info('Registered OrganizationService constructor to global service factory.');
  
  // The factory will now handle dependency injection when creating the service instance.
  // We no longer need to resolve dependencies manually inside the constructor.
  // Let's adjust the AdapterOrganizationService constructor.

}