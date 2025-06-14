/**
 * Knowledge Graph MCP Service - 知识图谱MCP服务
 * 
 * 将知识图谱服务包装为MCP服务，提供标准化的MCP接口
 */

// 导出服务类和配置接口
export { 
  KnowledgeGraphMCPService, 
  KnowledgeGraphMCPServiceConfig,
  globalKnowledgeGraphMCPService 
} from './knowledge-graph-mcp-service';

// 服务版本
export const KNOWLEDGE_GRAPH_MCP_SERVICE_VERSION = '1.0.0';

// 从全局服务注册表中获取知识图谱MCP服务
import { globalServiceRegistry } from '../../shared/mcp-core/service-registry';
import { KnowledgeGraphMCPService } from './knowledge-graph-mcp-service';

/**
 * 获取知识图谱MCP服务
 * @returns 知识图谱MCP服务实例
 */
export function getKnowledgeGraphMCPService(): KnowledgeGraphMCPService {
  const service = globalServiceRegistry.getService('KnowledgeGraphService');
  return service as KnowledgeGraphMCPService;
}