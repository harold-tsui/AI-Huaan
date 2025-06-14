/**
 * Base Knowledge Graph Service - 基础知识图谱服务
 *
 * 提供知识图谱服务的基础实现和通用功能
 */
import { IKnowledgeGraphService, Node, Relationship, CreateNodeInput, UpdateNodeInput, CreateRelationshipInput, UpdateRelationshipInput, NodeQueryOptions, RelationshipQueryOptions, VectorSearchOptions, VectorSearchResult, GraphTraversalOptions, GraphTraversalResult, GraphPath, GraphStats, NodeType, RelationshipType } from './types';
/**
 * 基础知识图谱服务配置
 */
export interface BaseKnowledgeGraphServiceConfig {
    serviceName?: string;
    enableVectorSearch?: boolean;
    vectorDimension?: number;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
/**
 * 基础知识图谱服务
 *
 * 提供知识图谱服务的基础实现和通用功能
 */
export declare abstract class BaseKnowledgeGraphService implements IKnowledgeGraphService {
    protected config: BaseKnowledgeGraphServiceConfig;
    protected initialized: boolean;
    /**
     * 构造函数
     * @param config 配置
     */
    constructor(config?: BaseKnowledgeGraphServiceConfig);
    /**
     * 获取服务配置
     */
    getConfig(): BaseKnowledgeGraphServiceConfig;
    /**
     * 初始化知识图谱服务
     */
    initialize(): Promise<boolean>;
    /**
     * 关闭知识图谱服务
     */
    /**
     * 检查服务是否已初始化
     */
    isInitialized(): boolean;
    /**
     * 关闭知识图谱服务
     */
    shutdown(): Promise<boolean>;
    /**
     * 创建节点
     * @param input 创建节点输入
     */
    createNode(input: CreateNodeInput): Promise<Node>;
    /**
     * 批量创建节点
     * @param inputs 创建节点输入数组
     */
    createNodes(inputs: CreateNodeInput[]): Promise<Node[]>;
    /**
     * 获取节点
     * @param id 节点ID
     */
    getNode(id: string): Promise<Node | null>;
    /**
     * 更新节点
     * @param id 节点ID
     * @param input 更新节点输入
     */
    updateNode(id: string, input: UpdateNodeInput): Promise<Node | null>;
    /**
     * 删除节点
     * @param id 节点ID
     */
    deleteNode(id: string): Promise<boolean>;
    /**
     * 查询节点
     * @param options 节点查询选项
     */
    queryNodes(options: NodeQueryOptions): Promise<Node[]>;
    /**
     * 创建关系
     * @param input 创建关系输入
     */
    createRelationship(input: CreateRelationshipInput): Promise<Relationship>;
    /**
     * 批量创建关系
     * @param inputs 创建关系输入数组
     */
    createRelationships(inputs: CreateRelationshipInput[]): Promise<Relationship[]>;
    /**
     * 获取关系
     * @param id 关系ID
     */
    getRelationship(id: string): Promise<Relationship | null>;
    /**
     * 更新关系
     * @param id 关系ID
     * @param input 更新关系输入
     */
    updateRelationship(id: string, input: UpdateRelationshipInput): Promise<Relationship | null>;
    /**
     * 删除关系
     * @param id 关系ID
     */
    deleteRelationship(id: string): Promise<boolean>;
    /**
     * 查询关系
     * @param options 关系查询选项
     */
    queryRelationships(options: RelationshipQueryOptions): Promise<Relationship[]>;
    /**
     * 获取节点的出向关系
     * @param nodeId 节点ID
     * @param types 关系类型过滤（可选）
     */
    getOutgoingRelationships(nodeId: string, types?: (RelationshipType | string)[]): Promise<Relationship[]>;
    /**
     * 获取节点的入向关系
     * @param nodeId 节点ID
     * @param types 关系类型过滤（可选）
     */
    getIncomingRelationships(nodeId: string, types?: (RelationshipType | string)[]): Promise<Relationship[]>;
    /**
     * 获取节点的所有关系
     * @param nodeId 节点ID
     * @param types 关系类型过滤（可选）
     */
    getAllRelationships(nodeId: string, types?: (RelationshipType | string)[]): Promise<Relationship[]>;
    /**
     * 获取与节点相关的节点
     * @param nodeId 节点ID
     * @param relationshipTypes 关系类型过滤（可选）
     * @param nodeTypes 节点类型过滤（可选）
     * @param direction 关系方向（可选）
     */
    getRelatedNodes(nodeId: string, relationshipTypes?: (RelationshipType | string)[], nodeTypes?: (NodeType | string)[], direction?: 'OUTGOING' | 'INCOMING' | 'BOTH'): Promise<Node[]>;
    /**
     * 向量搜索
     * @param options 向量搜索选项
     */
    vectorSearch(options: VectorSearchOptions): Promise<VectorSearchResult[]>;
    /**
     * 图遍历
     * @param options 图遍历选项
     */
    traverseGraph(options: GraphTraversalOptions): Promise<GraphTraversalResult>;
    /**
     * 查找两个节点之间的最短路径
     * @param startNodeId 起始节点ID
     * @param endNodeId 结束节点ID
     * @param relationshipTypes 关系类型过滤（可选）
     * @param maxDepth 最大深度（可选）
     */
    findShortestPath(startNodeId: string, endNodeId: string, relationshipTypes?: (RelationshipType | string)[], maxDepth?: number): Promise<GraphPath | null>;
    /**
     * 查找所有路径
     * @param startNodeId 起始节点ID
     * @param endNodeId 结束节点ID
     * @param relationshipTypes 关系类型过滤（可选）
     * @param maxDepth 最大深度（可选）
     */
    findAllPaths(startNodeId: string, endNodeId: string, relationshipTypes?: (RelationshipType | string)[], maxDepth?: number): Promise<GraphPath[]>;
    /**
     * 获取知识图谱统计信息
     */
    getGraphStats(): Promise<GraphStats>;
    /**
     * 清空知识图谱
     * @param confirm 确认清空
     */
    clearGraph(confirm: boolean): Promise<boolean>;
    /**
     * 导出知识图谱
     * @param format 导出格式
     * @param path 导出路径
     */
    exportGraph(format: 'JSON' | 'CSV' | 'GRAPHML', path: string): Promise<boolean>;
    /**
     * 导入知识图谱
     * @param format 导入格式
     * @param path 导入路径
     * @param mergeStrategy 合并策略
     */
    importGraph(format: 'JSON' | 'CSV' | 'GRAPHML', path: string, mergeStrategy: 'REPLACE' | 'MERGE' | 'SKIP_DUPLICATES'): Promise<boolean>;
    /**
     * 确保服务已初始化
     */
    protected ensureInitialized(): void;
    /**
     * 初始化实现
     */
    protected abstract initializeImplementation(): Promise<void>;
    /**
     * 关闭实现
     */
    protected abstract shutdownImplementation(): Promise<void>;
    /**
     * 创建节点实现
     */
    protected abstract createNodeImplementation(node: Node): Promise<Node>;
    /**
     * 批量创建节点实现
     */
    protected abstract createNodesImplementation(nodes: Node[]): Promise<Node[]>;
    /**
     * 获取节点实现
     */
    protected abstract getNodeImplementation(id: string): Promise<Node | null>;
    /**
     * 更新节点实现
     */
    protected abstract updateNodeImplementation(id: string, node: Node): Promise<Node | null>;
    /**
     * 删除节点实现
     */
    protected abstract deleteNodeImplementation(id: string): Promise<boolean>;
    /**
     * 查询节点实现
     */
    protected abstract queryNodesImplementation(options: NodeQueryOptions): Promise<Node[]>;
    /**
     * 创建关系实现
     */
    protected abstract createRelationshipImplementation(relationship: Relationship): Promise<Relationship>;
    /**
     * 批量创建关系实现
     */
    protected abstract createRelationshipsImplementation(relationships: Relationship[]): Promise<Relationship[]>;
    /**
     * 获取关系实现
     */
    protected abstract getRelationshipImplementation(id: string): Promise<Relationship | null>;
    /**
     * 更新关系实现
     */
    protected abstract updateRelationshipImplementation(id: string, relationship: Relationship): Promise<Relationship | null>;
    /**
     * 删除关系实现
     */
    protected abstract deleteRelationshipImplementation(id: string): Promise<boolean>;
    /**
     * 查询关系实现
     */
    protected abstract queryRelationshipsImplementation(options: RelationshipQueryOptions): Promise<Relationship[]>;
    /**
     * 向量搜索实现
     */
    protected abstract vectorSearchImplementation(options: VectorSearchOptions): Promise<VectorSearchResult[]>;
    /**
     * 图遍历实现
     */
    protected abstract traverseGraphImplementation(options: GraphTraversalOptions): Promise<GraphTraversalResult>;
    /**
     * 查找最短路径实现
     */
    protected abstract findShortestPathImplementation(startNodeId: string, endNodeId: string, relationshipTypes?: (RelationshipType | string)[], maxDepth?: number): Promise<GraphPath | null>;
    /**
     * 查找所有路径实现
     */
    protected abstract findAllPathsImplementation(startNodeId: string, endNodeId: string, relationshipTypes?: (RelationshipType | string)[], maxDepth?: number): Promise<GraphPath[]>;
    /**
     * 获取图谱统计信息实现
     */
    protected abstract getGraphStatsImplementation(): Promise<GraphStats>;
    /**
     * 清空图谱实现
     */
    protected abstract clearGraphImplementation(): Promise<boolean>;
    /**
     * 导出图谱实现
     */
    protected abstract exportGraphImplementation(format: 'JSON' | 'CSV' | 'GRAPHML', path: string): Promise<boolean>;
    /**
     * 导入图谱实现
     */
    protected abstract importGraphImplementation(format: 'JSON' | 'CSV' | 'GRAPHML', path: string, mergeStrategy: 'REPLACE' | 'MERGE' | 'SKIP_DUPLICATES'): Promise<boolean>;
}
