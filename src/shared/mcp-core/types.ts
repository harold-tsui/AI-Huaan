/**
 * MCP Core Types - MCP核心类型定义
 * 
 * 定义MCP服务相关的类型、接口和枚举
 */

/**
 * 服务状态枚举
 */
export enum ServiceStatus {
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  DEGRADED = 'degraded',
  INACTIVE = 'inactive',
  ERROR = 'error',
  INITIALIZED = "INITIALIZED",
  STOPPED = "STOPPED",
}

/**
 * 服务能力接口
 */
export interface ServiceCapability {
  name: string;
  description: string;
  registeredAt: Date;
}

/**
 * 服务依赖接口
 */
export interface ServiceDependency {
  name: string;
  version: string;
  required: boolean;
  registeredAt: Date;
}

/**
 * 服务元数据接口
 */
export interface ServiceMetadata {
  createdAt: Date;
  updatedAt: Date;
  description: string;
  capabilities: ServiceCapability[];
  dependencies: ServiceDependency[];
}

/**
 * 服务配置接口
 */
export interface ServiceConfig {
  logLevel?: string;
  timeout?: number;
  maxRetries?: number;
  cacheTTL?: number;
  [key: string]: any;
}

/**
 * MCP请求接口
 */
export interface MCPRequest {
  id: string;
  service: string;
  version: string;
  action: string;
  params: Record<string, any>;
  metadata?: {
    timestamp: Date;
    source?: string;
    priority?: 'low' | 'normal' | 'high';
    timeout?: number;
    [key: string]: any;
  };
}

/**
 * MCP响应接口
 */
export interface MCPResponse {
  id: string;
  requestId: string;
  service: string;
  version: string;
  action: string;
  status: 'success' | 'error' | 'partial';
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: Date;
    processingTime?: number;
    [key: string]: any;
  };
}

/**
 * MCP错误代码枚举
 */
export enum MCPErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
  METHOD_NOT_FOUND = 'METHOD_NOT_FOUND',
  PROTOCOL_VERSION_MISMATCH = "PROTOCOL_VERSION_MISMATCH",
  SERVICE_NOT_FOUND = "SERVICE_NOT_FOUND",
}

/**
 * 服务信息接口
 */
export interface ServiceInfo {
  id: string;
  name: string;
  version: string;
  status: ServiceStatus;
  description?: string;
}

/**
 * MCP服务接口
 * 所有MCP服务必须实现此接口
 */
export interface IMCPService {
  initialize(): Promise<boolean>;
  shutdown(): Promise<boolean>;
  healthCheck(): Promise<boolean>;
  handleRequest(request: MCPRequest): Promise<MCPResponse>;
  getStatus(): ServiceStatus;
  getMetadata(): ServiceMetadata;
  getConfig(): ServiceConfig;
  updateConfig(config: Partial<ServiceConfig>): void;
  getInfo(): ServiceInfo;
}

/**
 * MCP服务注册表接口
 */
export interface IMCPServiceRegistry {
  registerService(service: IMCPService): void;
  unregisterService(serviceId: string): void;
  getService(serviceName: string, version?: string): IMCPService | null;
  getAllServices(): IMCPService[];
  getServicesByCapability(capability: string): IMCPService[];
}

/**
 * MCP服务工厂接口
 */
export interface IMCPServiceFactory {
  createService(name: string, config?: ServiceConfig): IMCPService;
  createAndInitializeService(serviceName: string, config?: ServiceConfig): Promise<IMCPService>;
  createAndInitializeServices(serviceConfigs: Array<{ name: string; config?: ServiceConfig }>): Promise<IMCPService[]>;
}

/**
 * MCP协议版本
 */
export const MCP_PROTOCOL_VERSION = '2024-11-05';