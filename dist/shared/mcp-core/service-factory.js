"use strict";
/**
 * MCP Service Factory - MCP服务工厂
 *
 * 用于创建和管理MCP服务实例
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalServiceFactory = exports.MCPServiceFactory = void 0;
const logger_1 = require("../../utils/logger");
const service_registry_1 = require("./service-registry");
class MCPServiceFactory {
    constructor() {
        this.serviceConstructors = new Map();
        this.logger = new logger_1.Logger('MCPServiceFactory');
    }
    /**
     * 注册服务构造函数
     * @param serviceName 服务名称
     * @param serviceConstructor 服务构造函数
     */
    registerServiceConstructor(serviceName, serviceConstructor) {
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
    createService(serviceName, config) {
        const ServiceConstructor = this.serviceConstructors.get(serviceName);
        if (!ServiceConstructor) {
            this.logger.error(`No service constructor registered for ${serviceName}`);
            throw new Error(`No service constructor registered for ${serviceName}`);
        }
        try {
            const serviceInstance = new ServiceConstructor(config);
            this.logger.info(`Created service instance for ${serviceName}`);
            // 自动注册到全局服务注册表
            service_registry_1.globalServiceRegistry.registerService(serviceInstance);
            return serviceInstance;
        }
        catch (error) {
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
    async createAndInitializeService(serviceName, config) {
        const service = this.createService(serviceName, config);
        try {
            await service.initialize();
            this.logger.info(`Initialized service instance for ${serviceName}`);
            return service;
        }
        catch (error) {
            this.logger.error(`Failed to initialize service instance for ${serviceName}`, { error });
            // 注销服务
            service_registry_1.globalServiceRegistry.unregisterService(service.getInfo().id);
            throw error;
        }
    }
    /**
     * 批量创建并初始化服务
     * @param serviceConfigs 服务配置数组
     * @returns 初始化后的服务实例数组
     */
    async createAndInitializeServices(serviceConfigs) {
        const services = [];
        for (const { name, config } of serviceConfigs) {
            try {
                const service = await this.createAndInitializeService(name, config);
                services.push(service);
            }
            catch (error) {
                this.logger.error(`Failed to create and initialize service ${name}`, { error });
                // 关闭已创建的服务
                for (const createdService of services) {
                    try {
                        await createdService.shutdown();
                    }
                    catch (shutdownError) {
                        this.logger.error(`Failed to shutdown service ${createdService.getInfo().name}`, { error: shutdownError });
                    }
                }
                throw error;
            }
        }
        return services;
    }
}
exports.MCPServiceFactory = MCPServiceFactory;
// 创建全局服务工厂实例
exports.globalServiceFactory = new MCPServiceFactory();
//# sourceMappingURL=service-factory.js.map