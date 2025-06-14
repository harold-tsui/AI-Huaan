/**
 * MCP Core - MCP核心模块
 * 
 * 导出所有MCP核心组件
 */

// 导出类型定义
export * from './types';

// 导出基础服务类
export { BaseService } from './base-service';

// 导出服务注册表
export { MCPServiceRegistry, globalServiceRegistry } from './service-registry';

// 导出服务工厂
export { MCPServiceFactory, globalServiceFactory } from './service-factory';

// 导出请求处理器
export { MCPRequestHandler, globalRequestHandler } from './request-handler';

// MCP核心版本
export const MCP_CORE_VERSION = '1.0.0';

/**
 * 初始化MCP核心模块
 * @returns 初始化状态
 */
export async function initializeMCPCore(): Promise<boolean> {
  try {
    // 这里可以添加核心模块的初始化逻辑
    // 例如加载配置、初始化数据库连接等
    
    return true;
  } catch (error) {
    console.error('Failed to initialize MCP Core:', error);
    return false;
  }
}