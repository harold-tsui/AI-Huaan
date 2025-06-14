"use strict";
/**
 * Knowledge Graph Services - 知识图谱服务
 *
 * 提供知识图谱管理功能，包括节点和关系的创建、查询、更新和删除，
 * 以及图遍历、路径查找和向量搜索等高级功能。
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalKnowledgeGraphService = exports.KnowledgeGraphServiceType = exports.KNOWLEDGE_GRAPH_SERVICES_VERSION = exports.MemoryKnowledgeGraphService = exports.BaseKnowledgeGraphService = void 0;
exports.initializeKnowledgeGraphService = initializeKnowledgeGraphService;
exports.getKnowledgeGraphService = getKnowledgeGraphService;
// 导出类型定义
__exportStar(require("./types"), exports);
// 导出基础知识图谱服务
var base_knowledge_graph_service_1 = require("./base-knowledge-graph-service");
Object.defineProperty(exports, "BaseKnowledgeGraphService", { enumerable: true, get: function () { return base_knowledge_graph_service_1.BaseKnowledgeGraphService; } });
// 导出内存知识图谱服务
var memory_knowledge_graph_service_1 = require("./memory-knowledge-graph-service");
Object.defineProperty(exports, "MemoryKnowledgeGraphService", { enumerable: true, get: function () { return memory_knowledge_graph_service_1.MemoryKnowledgeGraphService; } });
// 导出Neo4j知识图谱服务
//export { Neo4jKnowledgeGraphService, globalNeo4jKnowledgeGraphService } from './neo4j-knowledge-graph-service';
// 知识图谱服务版本
exports.KNOWLEDGE_GRAPH_SERVICES_VERSION = '1.0.0';
const memory_knowledge_graph_service_2 = require("./memory-knowledge-graph-service");
const neo4j_knowledge_graph_service_1 = require("./neo4j-knowledge-graph-service");
// 默认使用内存知识图谱服务
let globalKnowledgeGraphService = new memory_knowledge_graph_service_2.MemoryKnowledgeGraphService();
exports.globalKnowledgeGraphService = globalKnowledgeGraphService;
/**
 * 知识图谱服务类型
 */
var KnowledgeGraphServiceType;
(function (KnowledgeGraphServiceType) {
    KnowledgeGraphServiceType["MEMORY"] = "memory";
    KnowledgeGraphServiceType["NEO4J"] = "neo4j";
})(KnowledgeGraphServiceType || (exports.KnowledgeGraphServiceType = KnowledgeGraphServiceType = {}));
/**
 * 初始化知识图谱服务
 *
 * @param config 知识图谱服务配置
 * @returns 初始化后的知识图谱服务实例
 */
async function initializeKnowledgeGraphService(config) {
    // 关闭当前服务（如果已初始化）
    if (globalKnowledgeGraphService.isInitialized()) {
        await globalKnowledgeGraphService.shutdown();
    }
    // 根据配置选择服务类型
    switch (config.type) {
        case KnowledgeGraphServiceType.NEO4J:
            if (!config.neo4j) {
                throw new Error('Neo4j configuration is required for Neo4j knowledge graph service');
            }
            // 创建Neo4j服务实例
            const neo4jService = new neo4j_knowledge_graph_service_1.Neo4jKnowledgeGraphService({
                uri: config.neo4j.uri,
                username: config.neo4j.username,
                password: config.neo4j.password,
                database: config.neo4j.database,
                enableVectorSearch: config.enableVectorSearch !== undefined ? config.enableVectorSearch : true,
                vectorDimension: config.vectorDimension || 1536,
                enableApoc: config.neo4j.enableApoc,
                enableGds: config.neo4j.enableGds,
                logLevel: 'info'
            });
            // 设置为全局服务
            exports.globalKnowledgeGraphService = globalKnowledgeGraphService = neo4jService;
            break;
        case KnowledgeGraphServiceType.MEMORY:
        default:
            // 创建内存服务实例
            const memoryService = new memory_knowledge_graph_service_2.MemoryKnowledgeGraphService({
                enableVectorSearch: config.enableVectorSearch !== undefined ? config.enableVectorSearch : true,
                vectorDimension: config.vectorDimension || 1536,
                logLevel: 'info'
            });
            // 设置为全局服务
            exports.globalKnowledgeGraphService = globalKnowledgeGraphService = memoryService;
            break;
    }
    // 初始化服务
    await globalKnowledgeGraphService.initialize();
    // 使用更安全的方式记录服务初始化
    let serviceName = 'Unknown';
    if (config.type === KnowledgeGraphServiceType.NEO4J) {
        serviceName = 'Neo4jKnowledgeGraphService';
    }
    else {
        serviceName = 'MemoryKnowledgeGraphService';
    }
    console.info(`Initialized knowledge graph service: ${serviceName}`);
    return globalKnowledgeGraphService;
}
/**
 * 获取全局知识图谱服务实例
 *
 * @returns 全局知识图谱服务实例
 */
function getKnowledgeGraphService() {
    return globalKnowledgeGraphService;
}
//# sourceMappingURL=index.js.map