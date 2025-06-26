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
   * 获取已注册的服务名称列表
   */
  public getRegisteredServiceNames(): string[] {
    return Array.from(this.serviceConstructors.keys());
  }

  /**
   * 获取服务依赖关系
   */
  public getServiceDependencies(): Map<string, any[]> {
    return new Map(this.serviceDependencies);
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
   * @param dependencies 预解析的依赖实例
   * @returns 服务实例
   */
  public createService(name: string, config?: ServiceConfig, dependencies?: IMCPService[]): IMCPService {
    const constructorOrFactory = this.serviceConstructors.get(name);

    if (!constructorOrFactory) {
      throw new Error(`Service constructor or factory for ${name} not found.`);
    }

    try {
      let resolvedDependencies: IMCPService[];
      
      if (dependencies) {
        // Use pre-resolved dependencies
        resolvedDependencies = dependencies;
      } else {
        // Fallback to old behavior for backward compatibility
        const dependencyNames = this.serviceDependencies.get(name) || [];
        resolvedDependencies = dependencyNames.map((depName: string) => {
          const dependencyInstance = this.getServiceInstance(depName);
          if (!dependencyInstance) {
            throw new Error(`Dependency '${depName}' not found for service '${name}'.`);
          }
          return dependencyInstance;
        });
      }

      const args = config ? [...resolvedDependencies, config] : resolvedDependencies;
      let serviceInstance: IMCPService;

      this.logger.info(`Creating service ${name} with ${resolvedDependencies.length} dependencies and config: ${!!config}`);
      this.logger.info(`Dependencies: ${resolvedDependencies.map(dep => dep?.getInfo?.()?.id || 'unknown').join(', ')}`);

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
    const createdServices: IMCPService[] = [];
    const configMap = new Map(serviceConfigs.map(config => [config.name, config]));
    const created = new Set<string>();
    
    // Topological sort to handle dependencies
     const createServiceWithDependencies = (serviceName: string): IMCPService => {
       if (created.has(serviceName)) {
         return globalServiceRegistry.getService(serviceName)!;
       }
       
       const dependencies = this.serviceDependencies.get(serviceName) || [];
       
       // First create all dependencies
       for (const depName of dependencies) {
         if (!created.has(depName)) {
           // Check if dependency is in our config list
           if (!configMap.has(depName)) {
             throw new Error(`Dependency '${depName}' for service '${serviceName}' is not in the service configuration list.`);
           }
           createServiceWithDependencies(depName);
         }
       }
       
       // Now create this service
        const serviceConfig = configMap.get(serviceName);
        if (!serviceConfig) {
          throw new Error(`Service configuration for '${serviceName}' not found.`);
        }
        
        // Resolve dependencies
        const dependencyNames = this.serviceDependencies.get(serviceName) || [];
        this.logger.info(`Resolving dependencies for ${serviceName}: [${dependencyNames.join(', ')}]`);
        
        // Debug: List all services in registry
        const allServices = globalServiceRegistry.getAllServices();
        this.logger.info(`Services in registry: [${allServices.map(s => s.getInfo().name).join(', ')}]`);
        
        const resolvedDependencies = dependencyNames.map(depName => {
          this.logger.info(`Looking for dependency service: ${depName}`);
          this.logger.info(`About to call registry.getService('${depName}')`);
          const depService = globalServiceRegistry.getService(depName);
          this.logger.info(`getService result for ${depName}: ${depService ? depService.getInfo().name : 'null'}`);
          this.logger.info(`Finished calling registry.getService('${depName}')`);
          if (!depService) {
            // 添加详细的调试信息
            const allServices = globalServiceRegistry.getAllServices();
            this.logger.info(`Available services in registry: ${allServices.map(s => s.getInfo().name).join(', ')}`);
            this.logger.info(`Service statuses: ${allServices.map(s => `${s.getInfo().name}:${s.getInfo().status}`).join(', ')}`);
            // 直接检查每个服务
            allServices.forEach(service => {
              const info = service.getInfo();
              this.logger.info(`Service ${info.name}: status=${info.status}, version=${info.version}`);
              this.logger.info(`Status comparison: ${info.status} === 'active': ${info.status === 'active'}`);
            });
            throw new Error(`Dependency service '${depName}' not found in registry for service '${serviceName}'`);
          }
          this.logger.info(`Found dependency service: ${depName}`);
          return depService;
        });
        
        this.logger.info(`Creating service: ${serviceName}`);
        const service = this.createService(serviceName, serviceConfig?.config, resolvedDependencies);
        created.add(serviceName);
        services.push(service);
        createdServices.push(service);
        this.logger.info(`Successfully created service: ${serviceName}`);
        return service;
     };
    
    // Create all services in dependency order
    for (const { name } of serviceConfigs) {
      try {
        if (!created.has(name)) {
          createServiceWithDependencies(name);
        }
      } catch (error) {
        this.logger.error(`Failed to create service ${name}`, { error });
        // Clean up any services that were created
        for (const createdService of createdServices) {
          try {
            globalServiceRegistry.unregisterService(createdService.getInfo().id);
          } catch (cleanupError) {
            this.logger.error(`Failed to unregister service ${createdService.getInfo().name}`, { error: cleanupError });
          }
        }
        throw error;
      }
    }
    
    // Initialize all services
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      const { name } = serviceConfigs[i];
      try {
        this.logger.info(`Initializing service: ${name}`);
        await service.initialize();
        this.logger.info(`Successfully initialized service: ${name}`);
      } catch (error) {
        this.logger.error(`Failed to initialize service ${name}`, { error });
        // Clean up all created services
        for (const createdService of createdServices) {
          try {
            await createdService.shutdown();
            globalServiceRegistry.unregisterService(createdService.getInfo().id);
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