/**
 * MCP Service Factory - MCP服务工厂
 * 
 * 用于创建和管理MCP服务实例
 */

import { IMCPService, IMCPServiceFactory, ServiceConfig } from './types';
import { Logger } from '../../utils/logger';
import { globalServiceRegistry } from './service-registry';

export class MCPServiceFactory implements IMCPServiceFactory {
  private serviceConstructors: Map<string, new (...args: any[]) => IMCPService>;
  private serviceDependencies: Map<string, any[]>;
  private logger: Logger;

  constructor() {
    this.serviceConstructors = new Map();
    this.serviceDependencies = new Map(); // Store dependencies for each service
    this.logger = new Logger('MCPServiceFactory');
  }

  public clear(): void {
    this.serviceConstructors.clear();
    this.serviceDependencies.clear();
    this.logger.info('Service factory cleared.');
  }

  /**
   * 注册服务构造函数
   * @param serviceName 服务名称
   * @param serviceConstructor 服务构造函数
   */
  public registerServiceConstructor(
    serviceName: string,
    constructorOrFactory: ((...args: any[]) => IMCPService) | (new (...args: any[]) => IMCPService),
    ...dependencies: any[]
  ): void {
    if (this.serviceConstructors.has(serviceName)) {
      this.logger.warn(`Service constructor for ${serviceName} already registered. Skipping.`);
      return;
    }
    this.serviceConstructors.set(serviceName, constructorOrFactory as any);
    this.serviceDependencies.set(serviceName, dependencies);
    this.logger.info(`Registered service constructor or factory for ${serviceName}.`);
  }

  /**
   * 创建服务实例
   * @param name 服务名称
   * @param config 服务配置
   * @returns 服务实例
   */
  public createService(name: string, config?: ServiceConfig): IMCPService {
    const constructorOrFactory = this.serviceConstructors.get(name);

    if (!constructorOrFactory) {
      this.logger.error(`No service constructor or factory registered for ${name}`);
      throw new Error(`No service constructor or factory registered for ${name}`);
    }

    try {
      const dependencyNames = this.serviceDependencies.get(name)?.[0] || [];
      const dependencies = dependencyNames.map((depName: string) => {
        const dependencyInstance = this.getServiceInstance(depName);
        if (!dependencyInstance) {
          throw new Error(`Dependency '${depName}' not found for service '${name}'.`);
        }
        return dependencyInstance;
      });

      const args = config ? [...dependencies, config] : dependencies;
      let serviceInstance: IMCPService;

      // Check if it's a class constructor
      if (typeof constructorOrFactory === 'function' && constructorOrFactory.prototype && constructorOrFactory.prototype.constructor === constructorOrFactory) {
        // It's a class, instantiate it with its dependencies
        serviceInstance = new (constructorOrFactory as unknown as new (...args: any[]) => IMCPService)(...args);
      } else {
        // It's a factory function, call it with its dependencies
        serviceInstance = (constructorOrFactory as unknown as (...args: any[]) => IMCPService)(...args);
      }

      this.logger.info(`Created service instance for ${name}`);
      globalServiceRegistry.registerService(serviceInstance);
      return serviceInstance;
    } catch (error) {
      this.logger.error(`Failed to create service instance for ${name}`, { error });
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
   * 获取已注册的服务实例
   * @param serviceNameOrAlias 服务名称或别名
   * @returns 服务实例或undefined
   */
  public getServiceInstance<T extends IMCPService>(serviceNameOrAlias: string): T | undefined {
    const service = globalServiceRegistry.getService(serviceNameOrAlias);
    if (!service) {
      this.logger.warn(`Service with name or alias '${serviceNameOrAlias}' not found in registry.`);
    }
    return service as T | undefined;
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