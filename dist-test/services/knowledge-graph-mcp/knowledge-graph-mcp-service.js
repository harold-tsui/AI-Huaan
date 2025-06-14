"use strict";
/**
 * Knowledge Graph MCP Service - 知识图谱MCP服务
 *
 * 将知识图谱服务包装为MCP服务，提供标准化的MCP接口
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalKnowledgeGraphMCPService = exports.KnowledgeGraphMCPService = void 0;
const uuid_1 = require("uuid");
const base_service_1 = require("../../shared/mcp-core/base-service");
const types_1 = require("../../shared/mcp-core/types");
const knowledge_graph_services_1 = require("../../shared/knowledge-graph-services");
/**
 * 知识图谱MCP服务
 *
 * 将知识图谱服务包装为MCP服务，提供标准化的MCP接口
 */
class KnowledgeGraphMCPService extends base_service_1.BaseService {
    // 注意：logger已经在BaseService中定义为protected，这里不需要重新定义
    /**
     * 构造函数
     * @param config 服务配置
     */
    constructor(config) {
        super('KnowledgeGraphService', // 服务名称
        '1.0.0', // 服务版本
        config || {});
        this.knowledgeGraphService = (0, knowledge_graph_services_1.getKnowledgeGraphService)();
        // 注册服务能力
        this.registerCapability('node_management', '节点管理（创建、查询、更新、删除）');
        this.registerCapability('relationship_management', '关系管理（创建、查询、更新、删除）');
        this.registerCapability('graph_traversal', '图遍历和路径查找');
        this.registerCapability('vector_search', '向量搜索');
    }
    /**
     * 初始化服务
     */
    async initialize() {
        this.logger.info('Initializing Knowledge Graph MCP Service');
        // 调用父类初始化
        const baseInitialized = await super.initialize();
        if (!baseInitialized) {
            this.status = types_1.ServiceStatus.ERROR;
            this.logger.error('Failed to initialize base service');
            return false;
        }
        // 初始化知识图谱服务
        const config = this.config;
        let initialized = false;
        if (config.knowledgeGraphConfig) {
            this.knowledgeGraphService = await (0, knowledge_graph_services_1.initializeKnowledgeGraphService)(config.knowledgeGraphConfig);
            initialized = this.knowledgeGraphService.isInitialized();
        }
        else if (!this.knowledgeGraphService.isInitialized()) {
            // 使用默认配置初始化
            initialized = await this.knowledgeGraphService.initialize();
        }
        else {
            initialized = true;
        }
        if (initialized) {
            this.status = types_1.ServiceStatus.ACTIVE;
            this.logger.info('Knowledge Graph MCP Service initialized');
        }
        else {
            this.status = types_1.ServiceStatus.ERROR;
            this.logger.error('Failed to initialize Knowledge Graph MCP Service');
        }
        return initialized;
    }
    /**
     * 关闭服务
     */
    async shutdown() {
        this.logger.info('Shutting down Knowledge Graph MCP Service');
        // 关闭知识图谱服务
        if (this.knowledgeGraphService.isInitialized()) {
            await this.knowledgeGraphService.shutdown();
        }
        // 调用父类关闭
        await super.shutdown();
        this.logger.info('Knowledge Graph MCP Service shut down');
        return true;
    }
    /**
     * 处理MCP请求
     * @param request MCP请求
     * @returns MCP响应
     */
    async handleRequest(request) {
        this.logger.debug('Handling request', { action: request.action });
        // 检查服务状态
        if (this.status !== types_1.ServiceStatus.ACTIVE) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.SERVICE_UNAVAILABLE, 'Knowledge Graph Service is not active');
        }
        try {
            // 根据请求的action调用相应的方法
            switch (request.action) {
                // 节点管理
                case 'createNode':
                    return await this.handleCreateNode(request);
                case 'getNode':
                    return await this.handleGetNode(request);
                case 'updateNode':
                    return await this.handleUpdateNode(request);
                case 'deleteNode':
                    return await this.handleDeleteNode(request);
                case 'queryNodes':
                    return await this.handleQueryNodes(request);
                // 关系管理
                case 'createRelationship':
                    return await this.handleCreateRelationship(request);
                case 'getRelationship':
                    return await this.handleGetRelationship(request);
                case 'updateRelationship':
                    return await this.handleUpdateRelationship(request);
                case 'deleteRelationship':
                    return await this.handleDeleteRelationship(request);
                case 'queryRelationships':
                    return await this.handleQueryRelationships(request);
                // 图遍历
                case 'traverseGraph':
                    return await this.handleTraverseGraph(request);
                case 'findShortestPath':
                    return await this.handleFindShortestPath(request);
                case 'findAllPaths':
                    return await this.handleFindAllPaths(request);
                // 向量搜索
                case 'vectorSearch':
                    return await this.handleVectorSearch(request);
                // 统计信息
                case 'getGraphStats':
                    return await this.handleGetGraphStats(request);
                default:
                    return this.createErrorResponse(request, types_1.MCPErrorCode.METHOD_NOT_FOUND, `Action not supported: ${request.action}`);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error('Error handling request', {
                action: request.action,
                error: errorMessage,
                stack: errorStack
            });
            return this.createErrorResponse(request, types_1.MCPErrorCode.INTERNAL_ERROR, `Internal error: ${errorMessage}`);
        }
    }
    /**
     * 健康检查
     */
    async healthCheck() {
        // 检查知识图谱服务是否已初始化
        return this.knowledgeGraphService.isInitialized();
    }
    // 节点管理处理方法
    /**
     * 处理创建节点请求
     */
    async handleCreateNode(request) {
        const { input } = request.params;
        if (!input) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.VALIDATION_ERROR, 'Missing required parameter: input');
        }
        const node = await this.knowledgeGraphService.createNode(input);
        return this.createSuccessResponse(request, { node });
    }
    /**
     * 处理获取节点请求
     */
    async handleGetNode(request) {
        const { id } = request.params;
        if (!id) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.VALIDATION_ERROR, 'Missing required parameter: id');
        }
        const node = await this.knowledgeGraphService.getNode(id);
        if (!node) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.NOT_FOUND, `Node with ID ${id} not found`);
        }
        return this.createSuccessResponse(request, { node });
    }
    /**
     * 处理更新节点请求
     */
    async handleUpdateNode(request) {
        const { id, input } = request.params;
        if (!id || !input) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.VALIDATION_ERROR, 'Missing required parameters: id and input');
        }
        const node = await this.knowledgeGraphService.updateNode(id, input);
        if (!node) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.NOT_FOUND, `Node with ID ${id} not found`);
        }
        return this.createSuccessResponse(request, { node });
    }
    /**
     * 处理删除节点请求
     */
    async handleDeleteNode(request) {
        const { id } = request.params;
        if (!id) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.VALIDATION_ERROR, 'Missing required parameter: id');
        }
        const success = await this.knowledgeGraphService.deleteNode(id);
        if (!success) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.NOT_FOUND, `Node with ID ${id} not found or could not be deleted`);
        }
        return this.createSuccessResponse(request, { success });
    }
    /**
     * 处理查询节点请求
     */
    async handleQueryNodes(request) {
        const { options } = request.params;
        if (!options) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.VALIDATION_ERROR, 'Missing required parameter: options');
        }
        const nodes = await this.knowledgeGraphService.queryNodes(options);
        return this.createSuccessResponse(request, { nodes });
    }
    // 关系管理处理方法
    /**
     * 处理创建关系请求
     */
    async handleCreateRelationship(request) {
        const { input } = request.params;
        if (!input) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.VALIDATION_ERROR, 'Missing required parameter: input');
        }
        try {
            const relationship = await this.knowledgeGraphService.createRelationship(input);
            return this.createSuccessResponse(request, { relationship });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return this.createErrorResponse(request, types_1.MCPErrorCode.VALIDATION_ERROR, errorMessage);
        }
    }
    /**
     * 处理获取关系请求
     */
    async handleGetRelationship(request) {
        const { id } = request.params;
        if (!id) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.VALIDATION_ERROR, 'Missing required parameter: id');
        }
        const relationship = await this.knowledgeGraphService.getRelationship(id);
        if (!relationship) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.NOT_FOUND, `Relationship with ID ${id} not found`);
        }
        return this.createSuccessResponse(request, { relationship });
    }
    /**
     * 处理更新关系请求
     */
    async handleUpdateRelationship(request) {
        const { id, input } = request.params;
        if (!id || !input) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.VALIDATION_ERROR, 'Missing required parameters: id and input');
        }
        const relationship = await this.knowledgeGraphService.updateRelationship(id, input);
        if (!relationship) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.NOT_FOUND, `Relationship with ID ${id} not found`);
        }
        return this.createSuccessResponse(request, { relationship });
    }
    /**
     * 处理删除关系请求
     */
    async handleDeleteRelationship(request) {
        const { id } = request.params;
        if (!id) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.VALIDATION_ERROR, 'Missing required parameter: id');
        }
        const success = await this.knowledgeGraphService.deleteRelationship(id);
        if (!success) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.NOT_FOUND, `Relationship with ID ${id} not found or could not be deleted`);
        }
        return this.createSuccessResponse(request, { success });
    }
    /**
     * 处理查询关系请求
     */
    async handleQueryRelationships(request) {
        const { options } = request.params;
        if (!options) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.VALIDATION_ERROR, 'Missing required parameter: options');
        }
        const relationships = await this.knowledgeGraphService.queryRelationships(options);
        return this.createSuccessResponse(request, { relationships });
    }
    // 图遍历处理方法
    /**
     * 处理图遍历请求
     */
    async handleTraverseGraph(request) {
        const { options } = request.params;
        if (!options) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.VALIDATION_ERROR, 'Missing required parameter: options');
        }
        const result = await this.knowledgeGraphService.traverseGraph(options);
        return this.createSuccessResponse(request, { result });
    }
    /**
     * 处理最短路径查找请求
     */
    async handleFindShortestPath(request) {
        const { startNodeId, endNodeId, relationshipTypes, maxDepth } = request.params;
        if (!startNodeId || !endNodeId) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.VALIDATION_ERROR, 'Missing required parameters: startNodeId and endNodeId');
        }
        const path = await this.knowledgeGraphService.findShortestPath(startNodeId, endNodeId, relationshipTypes, maxDepth);
        return this.createSuccessResponse(request, { path });
    }
    /**
     * 处理所有路径查找请求
     */
    async handleFindAllPaths(request) {
        const { startNodeId, endNodeId, relationshipTypes, maxDepth } = request.params;
        if (!startNodeId || !endNodeId) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.VALIDATION_ERROR, 'Missing required parameters: startNodeId and endNodeId');
        }
        const paths = await this.knowledgeGraphService.findAllPaths(startNodeId, endNodeId, relationshipTypes, maxDepth);
        return this.createSuccessResponse(request, { paths });
    }
    // 向量搜索处理方法
    /**
     * 处理向量搜索请求
     */
    async handleVectorSearch(request) {
        const { options } = request.params;
        if (!options) {
            return this.createErrorResponse(request, types_1.MCPErrorCode.VALIDATION_ERROR, 'Missing required parameter: options');
        }
        const results = await this.knowledgeGraphService.vectorSearch(options);
        return this.createSuccessResponse(request, { results });
    }
    // 统计信息处理方法
    /**
     * 处理获取图统计信息请求
     */
    async handleGetGraphStats(request) {
        const stats = await this.knowledgeGraphService.getGraphStats();
        return this.createSuccessResponse(request, { stats });
    }
    // 辅助方法
    /**
     * 创建成功响应
     */
    createSuccessResponse(request, data) {
        return {
            id: (0, uuid_1.v4)(),
            requestId: request.id,
            service: request.service,
            version: request.version,
            action: request.action,
            status: 'success',
            data,
            metadata: {
                timestamp: new Date(),
            }
        };
    }
    /**
     * 创建错误响应
     */
    createErrorResponse(request, errorCode, errorMessage) {
        return {
            id: (0, uuid_1.v4)(),
            requestId: request.id,
            service: request.service,
            version: request.version,
            action: request.action,
            status: 'error',
            error: {
                code: errorCode,
                message: errorMessage
            },
            metadata: {
                timestamp: new Date(),
            }
        };
    }
}
exports.KnowledgeGraphMCPService = KnowledgeGraphMCPService;
// 创建全局实例
exports.globalKnowledgeGraphMCPService = new KnowledgeGraphMCPService();
//# sourceMappingURL=knowledge-graph-mcp-service.js.map