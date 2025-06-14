"use strict";
/**
 * Base Knowledge Graph Service - 基础知识图谱服务
 *
 * 提供知识图谱服务的基础实现和通用功能
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseKnowledgeGraphService = void 0;
const uuid_1 = require("uuid");
/**
 * 基础知识图谱服务
 *
 * 提供知识图谱服务的基础实现和通用功能
 */
class BaseKnowledgeGraphService {
    /**
     * 构造函数
     * @param config 配置
     */
    constructor(config = {}) {
        this.initialized = false;
        this.config = {
            serviceName: 'BaseKnowledgeGraphService',
            enableVectorSearch: true,
            vectorDimension: 1536, // 默认OpenAI向量维度
            logLevel: 'info',
            ...config
        };
    }
    /**
     * 获取服务配置
     */
    getConfig() {
        return this.config;
    }
    /**
     * 初始化知识图谱服务
     */
    async initialize() {
        if (this.initialized) {
            return true;
        }
        try {
            await this.initializeImplementation();
            this.initialized = true;
            return true;
        }
        catch (error) {
            console.error(`Failed to initialize ${this.config.serviceName}:`, error);
            return false;
        }
    }
    /**
     * 关闭知识图谱服务
     */
    /**
     * 检查服务是否已初始化
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * 关闭知识图谱服务
     */
    async shutdown() {
        if (!this.initialized) {
            return true;
        }
        try {
            await this.shutdownImplementation();
            this.initialized = false;
            return true;
        }
        catch (error) {
            console.error(`Failed to shutdown ${this.config.serviceName}:`, error);
            return false;
        }
    }
    /**
     * 创建节点
     * @param input 创建节点输入
     */
    async createNode(input) {
        this.ensureInitialized();
        const now = new Date();
        const node = {
            id: (0, uuid_1.v4)(),
            type: input.type,
            label: input.label,
            properties: input.properties || {},
            createdAt: now,
            updatedAt: now,
            vector: input.vector
        };
        return this.createNodeImplementation(node);
    }
    /**
     * 批量创建节点
     * @param inputs 创建节点输入数组
     */
    async createNodes(inputs) {
        this.ensureInitialized();
        const now = new Date();
        const nodes = inputs.map(input => ({
            id: (0, uuid_1.v4)(),
            type: input.type,
            label: input.label,
            properties: input.properties || {},
            createdAt: now,
            updatedAt: now,
            vector: input.vector
        }));
        return this.createNodesImplementation(nodes);
    }
    /**
     * 获取节点
     * @param id 节点ID
     */
    async getNode(id) {
        this.ensureInitialized();
        return this.getNodeImplementation(id);
    }
    /**
     * 更新节点
     * @param id 节点ID
     * @param input 更新节点输入
     */
    async updateNode(id, input) {
        this.ensureInitialized();
        const node = await this.getNode(id);
        if (!node) {
            return null;
        }
        const updatedNode = {
            ...node,
            label: input.label !== undefined ? input.label : node.label,
            properties: input.properties !== undefined ? { ...node.properties, ...input.properties } : node.properties,
            vector: input.vector !== undefined ? input.vector : node.vector,
            updatedAt: new Date()
        };
        return this.updateNodeImplementation(id, updatedNode);
    }
    /**
     * 删除节点
     * @param id 节点ID
     */
    async deleteNode(id) {
        this.ensureInitialized();
        return this.deleteNodeImplementation(id);
    }
    /**
     * 查询节点
     * @param options 节点查询选项
     */
    async queryNodes(options) {
        this.ensureInitialized();
        return this.queryNodesImplementation(options);
    }
    /**
     * 创建关系
     * @param input 创建关系输入
     */
    async createRelationship(input) {
        this.ensureInitialized();
        // 验证源节点和目标节点是否存在
        const sourceNode = await this.getNode(input.sourceNodeId);
        const targetNode = await this.getNode(input.targetNodeId);
        if (!sourceNode) {
            throw new Error(`Source node with ID ${input.sourceNodeId} does not exist`);
        }
        if (!targetNode) {
            throw new Error(`Target node with ID ${input.targetNodeId} does not exist`);
        }
        const now = new Date();
        const relationship = {
            id: (0, uuid_1.v4)(),
            type: input.type,
            label: input.label,
            properties: input.properties || {},
            sourceNodeId: input.sourceNodeId,
            targetNodeId: input.targetNodeId,
            createdAt: now,
            updatedAt: now
        };
        return this.createRelationshipImplementation(relationship);
    }
    /**
     * 批量创建关系
     * @param inputs 创建关系输入数组
     */
    async createRelationships(inputs) {
        this.ensureInitialized();
        // 收集所有节点ID
        const nodeIds = new Set();
        inputs.forEach(input => {
            nodeIds.add(input.sourceNodeId);
            nodeIds.add(input.targetNodeId);
        });
        // 验证所有节点是否存在
        const nodeIdArray = Array.from(nodeIds);
        const existingNodes = await Promise.all(nodeIdArray.map(id => this.getNode(id)));
        const existingNodeIds = new Set();
        existingNodes.forEach(node => {
            if (node) {
                existingNodeIds.add(node.id);
            }
        });
        // 过滤掉包含不存在节点的关系
        const validInputs = inputs.filter(input => existingNodeIds.has(input.sourceNodeId) && existingNodeIds.has(input.targetNodeId));
        if (validInputs.length !== inputs.length) {
            console.warn(`Filtered out ${inputs.length - validInputs.length} relationships with non-existent nodes`);
        }
        const now = new Date();
        const relationships = validInputs.map(input => ({
            id: (0, uuid_1.v4)(),
            type: input.type,
            label: input.label,
            properties: input.properties || {},
            sourceNodeId: input.sourceNodeId,
            targetNodeId: input.targetNodeId,
            createdAt: now,
            updatedAt: now
        }));
        return this.createRelationshipsImplementation(relationships);
    }
    /**
     * 获取关系
     * @param id 关系ID
     */
    async getRelationship(id) {
        this.ensureInitialized();
        return this.getRelationshipImplementation(id);
    }
    /**
     * 更新关系
     * @param id 关系ID
     * @param input 更新关系输入
     */
    async updateRelationship(id, input) {
        this.ensureInitialized();
        const relationship = await this.getRelationship(id);
        if (!relationship) {
            return null;
        }
        const updatedRelationship = {
            ...relationship,
            label: input.label !== undefined ? input.label : relationship.label,
            properties: input.properties !== undefined ? { ...relationship.properties, ...input.properties } : relationship.properties,
            updatedAt: new Date()
        };
        return this.updateRelationshipImplementation(id, updatedRelationship);
    }
    /**
     * 删除关系
     * @param id 关系ID
     */
    async deleteRelationship(id) {
        this.ensureInitialized();
        return this.deleteRelationshipImplementation(id);
    }
    /**
     * 查询关系
     * @param options 关系查询选项
     */
    async queryRelationships(options) {
        this.ensureInitialized();
        return this.queryRelationshipsImplementation(options);
    }
    /**
     * 获取节点的出向关系
     * @param nodeId 节点ID
     * @param types 关系类型过滤（可选）
     */
    async getOutgoingRelationships(nodeId, types) {
        this.ensureInitialized();
        const options = {
            sourceNodeIds: [nodeId]
        };
        if (types && types.length > 0) {
            options.types = types;
        }
        return this.queryRelationships(options);
    }
    /**
     * 获取节点的入向关系
     * @param nodeId 节点ID
     * @param types 关系类型过滤（可选）
     */
    async getIncomingRelationships(nodeId, types) {
        this.ensureInitialized();
        const options = {
            targetNodeIds: [nodeId]
        };
        if (types && types.length > 0) {
            options.types = types;
        }
        return this.queryRelationships(options);
    }
    /**
     * 获取节点的所有关系
     * @param nodeId 节点ID
     * @param types 关系类型过滤（可选）
     */
    async getAllRelationships(nodeId, types) {
        this.ensureInitialized();
        const outgoing = await this.getOutgoingRelationships(nodeId, types);
        const incoming = await this.getIncomingRelationships(nodeId, types);
        return [...outgoing, ...incoming];
    }
    /**
     * 获取与节点相关的节点
     * @param nodeId 节点ID
     * @param relationshipTypes 关系类型过滤（可选）
     * @param nodeTypes 节点类型过滤（可选）
     * @param direction 关系方向（可选）
     */
    async getRelatedNodes(nodeId, relationshipTypes, nodeTypes, direction = 'BOTH') {
        this.ensureInitialized();
        let relationships = [];
        // 根据方向获取关系
        if (direction === 'OUTGOING' || direction === 'BOTH') {
            const outgoing = await this.getOutgoingRelationships(nodeId, relationshipTypes);
            relationships = relationships.concat(outgoing);
        }
        if (direction === 'INCOMING' || direction === 'BOTH') {
            const incoming = await this.getIncomingRelationships(nodeId, relationshipTypes);
            relationships = relationships.concat(incoming);
        }
        if (relationships.length === 0) {
            return [];
        }
        // 收集相关节点ID
        const relatedNodeIds = new Set();
        relationships.forEach(rel => {
            if (rel.sourceNodeId === nodeId) {
                relatedNodeIds.add(rel.targetNodeId);
            }
            else if (rel.targetNodeId === nodeId) {
                relatedNodeIds.add(rel.sourceNodeId);
            }
        });
        // 获取相关节点
        const relatedNodes = await Promise.all(Array.from(relatedNodeIds).map(id => this.getNode(id)));
        // 过滤掉不存在的节点和不符合类型的节点
        let filteredNodes = relatedNodes.filter(node => node !== null);
        if (nodeTypes && nodeTypes.length > 0) {
            filteredNodes = filteredNodes.filter(node => nodeTypes.includes(node.type));
        }
        return filteredNodes;
    }
    /**
     * 向量搜索
     * @param options 向量搜索选项
     */
    async vectorSearch(options) {
        this.ensureInitialized();
        if (!this.config.enableVectorSearch) {
            throw new Error('Vector search is not enabled for this service');
        }
        return this.vectorSearchImplementation(options);
    }
    /**
     * 图遍历
     * @param options 图遍历选项
     */
    async traverseGraph(options) {
        this.ensureInitialized();
        return this.traverseGraphImplementation(options);
    }
    /**
     * 查找两个节点之间的最短路径
     * @param startNodeId 起始节点ID
     * @param endNodeId 结束节点ID
     * @param relationshipTypes 关系类型过滤（可选）
     * @param maxDepth 最大深度（可选）
     */
    async findShortestPath(startNodeId, endNodeId, relationshipTypes, maxDepth = 5) {
        this.ensureInitialized();
        return this.findShortestPathImplementation(startNodeId, endNodeId, relationshipTypes, maxDepth);
    }
    /**
     * 查找所有路径
     * @param startNodeId 起始节点ID
     * @param endNodeId 结束节点ID
     * @param relationshipTypes 关系类型过滤（可选）
     * @param maxDepth 最大深度（可选）
     */
    async findAllPaths(startNodeId, endNodeId, relationshipTypes, maxDepth = 3) {
        this.ensureInitialized();
        return this.findAllPathsImplementation(startNodeId, endNodeId, relationshipTypes, maxDepth);
    }
    /**
     * 获取知识图谱统计信息
     */
    async getGraphStats() {
        this.ensureInitialized();
        return this.getGraphStatsImplementation();
    }
    /**
     * 清空知识图谱
     * @param confirm 确认清空
     */
    async clearGraph(confirm) {
        this.ensureInitialized();
        if (!confirm) {
            throw new Error('Confirmation is required to clear the graph');
        }
        return this.clearGraphImplementation();
    }
    /**
     * 导出知识图谱
     * @param format 导出格式
     * @param path 导出路径
     */
    async exportGraph(format, path) {
        this.ensureInitialized();
        return this.exportGraphImplementation(format, path);
    }
    /**
     * 导入知识图谱
     * @param format 导入格式
     * @param path 导入路径
     * @param mergeStrategy 合并策略
     */
    async importGraph(format, path, mergeStrategy) {
        this.ensureInitialized();
        return this.importGraphImplementation(format, path, mergeStrategy);
    }
    /**
     * 确保服务已初始化
     */
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error(`${this.config.serviceName} is not initialized. Call initialize() first.`);
        }
    }
}
exports.BaseKnowledgeGraphService = BaseKnowledgeGraphService;
//# sourceMappingURL=base-knowledge-graph-service.js.map