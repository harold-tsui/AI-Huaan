/**
 * MCP Service Factory - MCP服务工厂
 * 
 * 用于创建和管理MCP服务实例
 */

import { IMCPService, IMCPServiceFactory, ServiceConfig } from './types';
import { Logger } from '../../utils/logger';
import { globalServiceRegistry } from './service-registry';

export class MCPServiceFactory implements IMCPServiceFactory {
  private serviceConstructors: Map<string, new (config?: ServiceConfig) => IMCPService>;
  private logger: Logger;

  constructor() {
    this.serviceConstructors = new Map();
    this.logger = new Logger('MCPServiceFactory');
  }

  /**
   * 注册服务构造函数
   * @param serviceName 服务名称
   * @param serviceConstructor 服务构造函数
   */
  public registerServiceConstructor(
    serviceName: string,
    serviceConstructor: new (config?: ServiceConfig) => IMCPService
  ): void {
    if (this.serviceConstructors.has(serviceName)) {
      this.logger.warn(`Service constructor for ${serviceName} already registered, overwriting`);
    }
    
    this.serviceConstructors.set(serviceName, serviceConstructor);
    this.logger.info(`Registered service constructor for ${serviceName}`);
  }

  /**
   * 创建服务实例
   * @param serviceName 服务名称
   * @param config 服务配置
   * @returns 服务实例
   */
  public createService(serviceName: string, config?: ServiceConfig): IMCPService {
    const ServiceConstructor = this.serviceConstructors.get(serviceName);
    
    if (!ServiceConstructor) {
      this.logger.error(`No service constructor registered for ${serviceName}`);
      throw new Error(`No service constructor registered for ${serviceName}`);
    }
    
    try {
      const serviceInstance = new ServiceConstructor(config);
      this.logger.info(`Created service instance for ${serviceName}`);
      
      // 自动注册到全局服务注册表
      globalServiceRegistry.registerService(serviceInstance);
      
      return serviceInstance;
    } catch (error) {
      this.logger.error(`Failed to create service instance for ${serviceName}`, { error });
      throw error;
    }
  }

  /**
   * 创建并初始化服务实例
   * @param serviceName 服务名称
   * @param config 服务配置
   * @returns 初始化后的服务实例
   */
  public async createAndInitializeService(serviceName: string, config?: ServiceConfig): Promise<IMCPService> {
    const service = this.createService(serviceName, config);
    
    try {
      await service.initialize();
      this.logger.info(`Initialized service instance for ${serviceName}`);
      return service;
    } catch (error) {
      this.logger.error(`Failed to initialize service instance for ${serviceName}`, { error });
      // 注销服务
      globalServiceRegistry.unregisterService(service.getInfo().id);
      throw error;
    }
  }

  /**
   * 批量创建并初始化服务
   * @param serviceConfigs 服务配置数组
   * @returns 初始化后的服务实例数组
   */
  public async createAndInitializeServices(
    serviceConfigs: Array<{ name: string; config?: ServiceConfig }>
  ): Promise<IMCPService[]> {
    const services: IMCPService[] = [];
    
    for (const { name, config } of serviceConfigs) {
      try {
        const service = await this.createAndInitializeService(name, config);
        services.push(service);
      } catch (error) {
        this.logger.error(`Failed to create and initialize service ${name}`, { error });
        // 关闭已创建的服务
        for (const createdService of services) {
          try {
            await createdService.shutdown();
          } catch (shutdownError) {
            this.logger.error(`Failed to shutdown service ${createdService.getInfo().name}`, { error: shutdownError });
          }
        }
        throw error;
      }
    }
    
    return services;
  }
}

// 创建全局服务工厂实例
export const globalServiceFactory = new MCPServiceFactory();