/**
 * MCP Service Registry - MCP服务注册表
 * 
 * 管理和发现MCP服务的中央注册表
 */

import { IMCPService, IMCPServiceRegistry, ServiceStatus } from './types';
import { Logger } from '../../utils/logger';

export class MCPServiceRegistry implements IMCPServiceRegistry {
  private services: Map<string, IMCPService>;
  private logger: Logger;

  constructor() {
    this.services = new Map<string, IMCPService>();
    this.logger = new Logger('MCPServiceRegistry');
  }

  /**
   * 注册服务
   * @param service MCP服务实例
   */
  public registerService(service: IMCPService): void {
    const info = service.getInfo();
    const serviceKey = `${info.name}@${info.version}`;
    
    if (this.services.has(info.id)) {
      this.logger.warn(`Service with ID ${info.id} already registered, updating`);
    }
    
    this.services.set(info.id, service);
    this.logger.info(`Registered service: ${serviceKey} with ID ${info.id}`);
  }

  /**
   * 注销服务
   * @param serviceId 服务ID
   */
  public unregisterAll(): void {
    this.services.clear();
    this.logger.info('All services unregistered.');
  }

  public unregisterService(serviceId: string): void {
    if (this.services.has(serviceId)) {
      const service = this.services.get(serviceId);
      const info = service?.getInfo();
      this.services.delete(serviceId);
      this.logger.info(`Unregistered service: ${info?.name}@${info?.version} with ID ${serviceId}`);
    } else {
      this.logger.warn(`Attempted to unregister non-existent service with ID ${serviceId}`);
    }
  }

  /**
   * 获取服务
   * @param serviceName 服务名称
   * @param version 服务版本（可选，默认获取最新版本）
   * @returns 服务实例或null
   */
  public getService(serviceName: string, version?: string): IMCPService | null {
    this.logger.info(`getService called with serviceName: ${serviceName}, version: ${version}`);
    // 如果指定了版本，查找精确匹配
    if (version) {
      for (const service of this.services.values()) {
        const info = service.getInfo();
        this.logger.info(`Checking service: ${info.name}, version: ${info.version}, status: ${info.status}`);
        if (info.name === serviceName && info.version === version && info.status === ServiceStatus.ACTIVE) {
          this.logger.info(`Found exact match for ${serviceName}@${version}`);
          return service;
        }
      }
      this.logger.info(`No exact match found for ${serviceName}@${version}`);
      return null;
    }
    
    // 如果没有指定版本，查找最新版本
    let latestService: IMCPService | null = null;
    let latestVersion = '';
    
    for (const service of this.services.values()) {
      const info = service.getInfo();
      this.logger.info(`Checking service for latest: ${info.name}, version: ${info.version}, status: ${info.status}`);
      this.logger.info(`Name match: ${info.name === serviceName}, Status match: ${info.status === ServiceStatus.ACTIVE}`);
      if (info.name === serviceName && (info.status === ServiceStatus.ACTIVE || info.status === ServiceStatus.INITIALIZED || info.status === ServiceStatus.INITIALIZING)) {
        this.logger.info(`Service ${info.name} matches criteria`);
        if (!latestService || this.compareVersions(info.version, latestVersion) > 0) {
          latestService = service;
          latestVersion = info.version;
          this.logger.info(`Updated latest service to ${info.name}@${info.version}`);
        }
      }
    }
    
    this.logger.info(`Returning latest service: ${latestService ? latestService.getInfo().name : 'null'}`);
    return latestService;
  }

  /**
   * 获取所有服务
   * @returns 所有服务实例数组
   */
  public getAllServices(): IMCPService[] {
    return Array.from(this.services.values());
  }

  /**
   * 根据能力获取服务
   * @param capability 服务能力
   * @returns 具有指定能力的服务实例数组
   */
  public getServicesByCapability(capability: string): IMCPService[] {
    const matchingServices: IMCPService[] = [];
    
    for (const service of this.services.values()) {
      const metadata = service.getMetadata();
      const info = service.getInfo();
      
      if (info.status === ServiceStatus.ACTIVE && 
          metadata.capabilities.some(cap => cap.name === capability)) {
        matchingServices.push(service);
      }
    }
    
    return matchingServices;
  }

  /**
   * 比较版本号
   * @param v1 版本1
   * @param v2 版本2
   * @returns 比较结果：1表示v1>v2，0表示v1=v2，-1表示v1<v2
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = i < parts1.length ? parts1[i] : 0;
      const part2 = i < parts2.length ? parts2[i] : 0;
      
      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }
    
    return 0;
  }
}

// 创建全局服务注册表实例
export const globalServiceRegistry = new MCPServiceRegistry();