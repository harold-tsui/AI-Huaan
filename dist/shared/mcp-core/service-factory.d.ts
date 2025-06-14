/**
 * MCP Service Factory - MCP服务工厂
 *
 * 用于创建和管理MCP服务实例
 */
import { IMCPService, IMCPServiceFactory, ServiceConfig } from './types';
export declare class MCPServiceFactory implements IMCPServiceFactory {
    private serviceConstructors;
    private logger;
    constructor();
    /**
     * 注册服务构造函数
     * @param serviceName 服务名称
     * @param serviceConstructor 服务构造函数
     */
    registerServiceConstructor(serviceName: string, serviceConstructor: new (config?: ServiceConfig) => IMCPService): void;
    /**
     * 创建服务实例
     * @param serviceName 服务名称
     * @param config 服务配置
     * @returns 服务实例
     */
    createService(serviceName: string, config?: ServiceConfig): IMCPService;
    /**
     * 创建并初始化服务实例
     * @param serviceName 服务名称
     * @param config 服务配置
     * @returns 初始化后的服务实例
     */
    createAndInitializeService(serviceName: string, config?: ServiceConfig): Promise<IMCPService>;
    /**
     * 批量创建并初始化服务
     * @param serviceConfigs 服务配置数组
     * @returns 初始化后的服务实例数组
     */
    createAndInitializeServices(serviceConfigs: Array<{
        name: string;
        config?: ServiceConfig;
    }>): Promise<IMCPService[]>;
}
export declare const globalServiceFactory: MCPServiceFactory;
