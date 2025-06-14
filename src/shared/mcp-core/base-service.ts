/**
 * Base Service - 基础服务抽象类
 * 
 * 所有MCP原子服务的基础类，提供通用功能和标准化接口
 */

import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../utils/logger';
import { ServiceConfig, ServiceStatus, ServiceMetadata, MCPRequest, MCPResponse, IMCPService, ServiceInfo } from './types';

export abstract class BaseService implements IMCPService {
  protected id: string;
  protected name: string;
  protected version: string;
  protected status: ServiceStatus;
  protected metadata: ServiceMetadata;
  protected logger: Logger;
  protected config: ServiceConfig;

  constructor(name: string, version: string, config: ServiceConfig) {
    this.id = uuidv4();
    this.name = name;
    this.version = version;
    this.status = ServiceStatus.INITIALIZING;
    this.config = config;
    this.metadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      description: '',
      capabilities: [],
      dependencies: [],
    };
    this.logger = new Logger(`${name}:${version}`);
  }

  /**
   * 初始化服务
   * 子类应该重写此方法以实现特定的初始化逻辑
   */
  public async initialize(): Promise<boolean> {
    this.logger.info(`Initializing service: ${this.name}@${this.version}`);
    this.status = ServiceStatus.ACTIVE;
    this.metadata.updatedAt = new Date();
    return true;
  }

  /**
   * 关闭服务
   * 子类应该重写此方法以实现特定的关闭逻辑
   */
  public async shutdown(): Promise<boolean> {
    try {
      this.logger.info(`Shutting down service: ${this.name}@${this.version}`);
      this.status = ServiceStatus.INACTIVE;
      this.metadata.updatedAt = new Date();
      return true;
    } catch (error) {
      this.logger.error(`Error shutting down service: ${this.name}@${this.version}`, { error: error instanceof Error ? error : String(error) });
      return false;
    }
  }

  /**
   * 获取服务状态
   */
  public getStatus(): ServiceStatus {
    return this.status;
  }

  /**
   * 获取服务元数据
   */
  public getMetadata(): ServiceMetadata {
    return this.metadata;
  }

  /**
   * 获取服务配置
   */
  public getConfig(): ServiceConfig {
    return this.config;
  }

  /**
   * 更新服务配置
   */
  public updateConfig(config: Partial<ServiceConfig>): void {
    this.config = { ...this.config, ...config };
    this.metadata.updatedAt = new Date();
    this.logger.info(`Updated service config: ${this.name}@${this.version}`);
  }

  /**
   * 健康检查
   * 子类应该重写此方法以实现特定的健康检查逻辑
   */
  public async healthCheck(): Promise<boolean> {
    return this.status === ServiceStatus.ACTIVE;
  }

  /**
   * 处理MCP请求
   * 子类必须实现此方法以处理特定的服务请求
   * @param request MCP请求
   */
  public abstract handleRequest(request: MCPRequest): Promise<MCPResponse>;

  /**
   * 获取服务信息
   */
  public getInfo(): ServiceInfo {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      status: this.status,
      description: this.metadata.description,
    };
  }

  /**
   * 注册服务能力
   */
  protected registerCapability(capability: string, description: string): void {
    if (!this.metadata.capabilities.some(cap => cap.name === capability)) {
      this.metadata.capabilities.push({
        name: capability,
        description,
        registeredAt: new Date(),
      });
      this.logger.info(`Registered capability: ${capability}`);
    }
  }

  /**
   * 注册服务依赖
   */
  protected registerDependency(serviceName: string, version: string, required: boolean): void {
    if (!this.metadata.dependencies.some(dep => dep.name === serviceName && dep.version === version)) {
      this.metadata.dependencies.push({
        name: serviceName,
        version,
        required,
        registeredAt: new Date(),
      });
      this.logger.info(`Registered dependency: ${serviceName}@${version}`);
    }
  }
}