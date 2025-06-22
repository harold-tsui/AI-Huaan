/**
 * Knowledge Graph MCP Service Registration - 知识图谱MCP服务注册
 * 
 * 将知识图谱MCP服务注册到MCP服务工厂
 */

import { globalServiceFactory } from '../../shared/mcp-core/service-factory';
import { KnowledgeGraphMCPService } from './knowledge-graph-mcp-service';

/**
 * 注册知识图谱MCP服务
 */
export function registerKnowledgeGraphMCPService(): void {
  // 注册服务构造函数到全局服务工厂
  globalServiceFactory.registerServiceConstructor(
    'KnowledgeGraphService',
    KnowledgeGraphMCPService
  );
  
  console.info('Registered Knowledge Graph MCP Service to service factory');
}

// 自动注册服务
// registerKnowledgeGraphMCPService(); // 改为在 register-services.ts 中显式调用