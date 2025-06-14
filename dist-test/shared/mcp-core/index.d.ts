/**
 * MCP Core - MCP核心模块
 *
 * 导出所有MCP核心组件
 */
export * from './types';
export { BaseService } from './base-service';
export { MCPServiceRegistry, globalServiceRegistry } from './service-registry';
export { MCPServiceFactory, globalServiceFactory } from './service-factory';
export { MCPRequestHandler, globalRequestHandler } from './request-handler';
export declare const MCP_CORE_VERSION = "1.0.0";
/**
 * 初始化MCP核心模块
 * @returns 初始化状态
 */
export declare function initializeMCPCore(): Promise<boolean>;
