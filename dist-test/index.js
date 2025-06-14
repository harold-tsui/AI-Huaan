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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var memory_knowledge_graph_service_2 = require("./memory-knowledge-graph-service");
var neo4j_knowledge_graph_service_1 = require("./neo4j-knowledge-graph-service");
// 默认使用内存知识图谱服务
var globalKnowledgeGraphService = new memory_knowledge_graph_service_2.MemoryKnowledgeGraphService();
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
function initializeKnowledgeGraphService(config) {
    return __awaiter(this, void 0, void 0, function () {
        var neo4jService, memoryService, serviceName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!globalKnowledgeGraphService.isInitialized()) return [3 /*break*/, 2];
                    return [4 /*yield*/, globalKnowledgeGraphService.shutdown()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    // 根据配置选择服务类型
                    switch (config.type) {
                        case KnowledgeGraphServiceType.NEO4J:
                            if (!config.neo4j) {
                                throw new Error('Neo4j configuration is required for Neo4j knowledge graph service');
                            }
                            neo4jService = new neo4j_knowledge_graph_service_1.Neo4jKnowledgeGraphService({
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
                            memoryService = new memory_knowledge_graph_service_2.MemoryKnowledgeGraphService({
                                enableVectorSearch: config.enableVectorSearch !== undefined ? config.enableVectorSearch : true,
                                vectorDimension: config.vectorDimension || 1536,
                                logLevel: 'info'
                            });
                            // 设置为全局服务
                            exports.globalKnowledgeGraphService = globalKnowledgeGraphService = memoryService;
                            break;
                    }
                    // 初始化服务
                    return [4 /*yield*/, globalKnowledgeGraphService.initialize()];
                case 3:
                    // 初始化服务
                    _a.sent();
                    serviceName = 'Unknown';
                    if (config.type === KnowledgeGraphServiceType.NEO4J) {
                        serviceName = 'Neo4jKnowledgeGraphService';
                    }
                    else {
                        serviceName = 'MemoryKnowledgeGraphService';
                    }
                    console.info("Initialized knowledge graph service: ".concat(serviceName));
                    return [2 /*return*/, globalKnowledgeGraphService];
            }
        });
    });
}
/**
 * 获取全局知识图谱服务实例
 *
 * @returns 全局知识图谱服务实例
 */
function getKnowledgeGraphService() {
    return globalKnowledgeGraphService;
}
