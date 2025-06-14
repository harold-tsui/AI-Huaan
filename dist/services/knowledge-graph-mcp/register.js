"use strict";
/**
 * Knowledge Graph MCP Service Registration - 知识图谱MCP服务注册
 *
 * 将知识图谱MCP服务注册到MCP服务工厂
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerKnowledgeGraphMCPService = registerKnowledgeGraphMCPService;
const service_factory_1 = require("../../shared/mcp-core/service-factory");
const knowledge_graph_mcp_service_1 = require("./knowledge-graph-mcp-service");
/**
 * 注册知识图谱MCP服务
 */
function registerKnowledgeGraphMCPService() {
    // 注册服务构造函数到全局服务工厂
    service_factory_1.globalServiceFactory.registerServiceConstructor('KnowledgeGraphService', knowledge_graph_mcp_service_1.KnowledgeGraphMCPService);
    console.info('Registered Knowledge Graph MCP Service to service factory');
}
// 自动注册服务
registerKnowledgeGraphMCPService();
//# sourceMappingURL=register.js.map