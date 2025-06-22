/**
 * MCP Service Registry - MCP服务注册表
 *
 * 管理和发现MCP服务的中央注册表
 */
import { IMCPService, IMCPServiceRegistry } from './types';
export declare class MCPServiceRegistry implements IMCPServiceRegistry {
    private services;
    private logger;
    constructor();
    /**
     * 注册服务
     * @param service MCP服务实例
     */
    registerService(service: IMCPService): void;
    /**
     * 注销服务
     * @param serviceId 服务ID
     */
    unregisterAll(): void;
    unregisterService(serviceId: string): void;
    /**
     * 获取服务
     * @param serviceName 服务名称
     * @param version 服务版本（可选，默认获取最新版本）
     * @returns 服务实例或null
     */
    getService(serviceName: string, version?: string): IMCPService | null;
    /**
     * 获取所有服务
     * @returns 所有服务实例数组
     */
    getAllServices(): IMCPService[];
    /**
     * 根据能力获取服务
     * @param capability 服务能力
     * @returns 具有指定能力的服务实例数组
     */
    getServicesByCapability(capability: string): IMCPService[];
    /**
     * 比较版本号
     * @param v1 版本1
     * @param v2 版本2
     * @returns 比较结果：1表示v1>v2，0表示v1=v2，-1表示v1<v2
     */
    private compareVersions;
}
export declare const globalServiceRegistry: MCPServiceRegistry;
