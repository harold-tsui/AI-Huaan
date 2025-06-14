/**
 * Base Service - 基础服务抽象类
 *
 * 所有MCP原子服务的基础类，提供通用功能和标准化接口
 */
import { Logger } from '../../utils/logger';
import { ServiceConfig, ServiceStatus, ServiceMetadata, MCPRequest, MCPResponse, IMCPService, ServiceInfo } from './types';
export declare abstract class BaseService implements IMCPService {
    protected id: string;
    protected name: string;
    protected version: string;
    protected status: ServiceStatus;
    protected metadata: ServiceMetadata;
    protected logger: Logger;
    protected config: ServiceConfig;
    constructor(name: string, version: string, config: ServiceConfig);
    /**
     * 初始化服务
     * 子类应该重写此方法以实现特定的初始化逻辑
     */
    initialize(): Promise<boolean>;
    /**
     * 关闭服务
     * 子类应该重写此方法以实现特定的关闭逻辑
     */
    shutdown(): Promise<boolean>;
    /**
     * 获取服务状态
     */
    getStatus(): ServiceStatus;
    /**
     * 获取服务元数据
     */
    getMetadata(): ServiceMetadata;
    /**
     * 获取服务配置
     */
    getConfig(): ServiceConfig;
    /**
     * 更新服务配置
     */
    updateConfig(config: Partial<ServiceConfig>): void;
    /**
     * 健康检查
     * 子类应该重写此方法以实现特定的健康检查逻辑
     */
    healthCheck(): Promise<boolean>;
    /**
     * 处理MCP请求
     * 子类必须实现此方法以处理特定的服务请求
     * @param request MCP请求
     */
    abstract handleRequest(request: MCPRequest): Promise<MCPResponse>;
    /**
     * 获取服务信息
     */
    getInfo(): ServiceInfo;
    /**
     * 注册服务能力
     */
    protected registerCapability(capability: string, description: string): void;
    /**
     * 注册服务依赖
     */
    protected registerDependency(serviceName: string, version: string, required: boolean): void;
}
