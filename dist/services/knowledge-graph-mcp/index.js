"use strict";
/**
 * Knowledge Graph MCP Service - 知识图谱MCP服务
 *
 * 将知识图谱服务包装为MCP服务，提供标准化的MCP接口
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KNOWLEDGE_GRAPH_MCP_SERVICE_VERSION = exports.globalKnowledgeGraphMCPService = exports.KnowledgeGraphMCPService = void 0;
exports.getKnowledgeGraphMCPService = getKnowledgeGraphMCPService;
// 导出服务类和配置接口
var knowledge_graph_mcp_service_1 = require("./knowledge-graph-mcp-service");
Object.defineProperty(exports, "KnowledgeGraphMCPService", { enumerable: true, get: function () { return knowledge_graph_mcp_service_1.KnowledgeGraphMCPService; } });
Object.defineProperty(exports, "globalKnowledgeGraphMCPService", { enumerable: true, get: function () { return knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService; } });
// 服务版本
exports.KNOWLEDGE_GRAPH_MCP_SERVICE_VERSION = '1.0.0';
// 从全局服务注册表中获取知识图谱MCP服务
const service_registry_1 = require("../../shared/mcp-core/service-registry");
/**
 * 获取知识图谱MCP服务
 * @returns 知识图谱MCP服务实例
 */
function getKnowledgeGraphMCPService() {
    const service = service_registry_1.globalServiceRegistry.getService('KnowledgeGraphService');
    return service;
}
//# sourceMappingURL=index.js.map