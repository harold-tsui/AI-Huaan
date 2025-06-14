/**
 * Knowledge Graph MCP Service - 知识图谱MCP服务
 *
 * 将知识图谱服务包装为MCP服务，提供标准化的MCP接口
 */
export { KnowledgeGraphMCPService, KnowledgeGraphMCPServiceConfig, globalKnowledgeGraphMCPService } from './knowledge-graph-mcp-service';
export declare const KNOWLEDGE_GRAPH_MCP_SERVICE_VERSION = "1.0.0";
import { KnowledgeGraphMCPService } from './knowledge-graph-mcp-service';
/**
 * 获取知识图谱MCP服务
 * @returns 知识图谱MCP服务实例
 */
export declare function getKnowledgeGraphMCPService(): KnowledgeGraphMCPService;
