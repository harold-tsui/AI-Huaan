/**
 * Memory Knowledge Graph Service - 内存知识图谱服务
 *
 * 基于内存的知识图谱服务实现，适用于开发和测试环境
 */
import { Node, Relationship, NodeQueryOptions, RelationshipQueryOptions, VectorSearchOptions, VectorSearchResult, GraphTraversalOptions, GraphTraversalResult, GraphPath, GraphStats, RelationshipType } from './types';
import { BaseKnowledgeGraphService } from './base-knowledge-graph-service';
/**
 * 内存知识图谱服务配置
 */
export interface MemoryKnowledgeGraphServiceConfig {
    persistToFile?: boolean;
    persistFilePath?: string;
    autoSaveInterval?: number;
    enableVectorSearch?: boolean;
    vectorDimension?: number;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
/**
 * 内存知识图谱服务
 *
 * 基于内存的知识图谱服务实现，适用于开发和测试环境
 */
export declare class MemoryKnowledgeGraphService extends BaseKnowledgeGraphService {
    private nodes;
    private relationships;
    private autoSaveTimer;
    private memoryConfig;
    /**
     * 构造函数
     * @param config 配置
     */
    constructor(config?: MemoryKnowledgeGraphServiceConfig);
    /**
     * 初始化实现
     */
    protected initializeImplementation(): Promise<void>;
    /**
     * 关闭实现
     */
    protected shutdownImplementation(): Promise<void>;
    /**
     * 创建节点实现
     */
    protected createNodeImplementation(node: Node): Promise<Node>;
    /**
     * 批量创建节点实现
     */
    protected createNodesImplementation(nodes: Node[]): Promise<Node[]>;
    /**
     * 获取节点实现
     */
    protected getNodeImplementation(id: string): Promise<Node | null>;
    /**
     * 更新节点实现
     */
    protected updateNodeImplementation(id: string, node: Node): Promise<Node | null>;
    /**
     * 删除节点实现
     */
    protected deleteNodeImplementation(id: string): Promise<boolean>;
    /**
     * 查询节点实现
     */
    protected queryNodesImplementation(options: NodeQueryOptions): Promise<Node[]>;
    /**
     * 创建关系实现
     */
    protected createRelationshipImplementation(relationship: Relationship): Promise<Relationship>;
    /**
     * 批量创建关系实现
     */
    protected createRelationshipsImplementation(relationships: Relationship[]): Promise<Relationship[]>;
    /**
     * 获取关系实现
     */
    protected getRelationshipImplementation(id: string): Promise<Relationship | null>;
    /**
     * 更新关系实现
     */
    protected updateRelationshipImplementation(id: string, relationship: Relationship): Promise<Relationship | null>;
    /**
     * 删除关系实现
     */
    protected deleteRelationshipImplementation(id: string): Promise<boolean>;
    /**
     * 查询关系实现
     */
    protected queryRelationshipsImplementation(options: RelationshipQueryOptions): Promise<Relationship[]>;
    /**
     * 向量搜索实现
     */
    protected vectorSearchImplementation(options: VectorSearchOptions): Promise<VectorSearchResult[]>;
    /**
     * 图遍历实现
     */
    protected traverseGraphImplementation(options: GraphTraversalOptions): Promise<GraphTraversalResult>;
    /**
     * 查找最短路径实现
     */
    protected findShortestPathImplementation(startNodeId: string, endNodeId: string, relationshipTypes?: (RelationshipType | string)[], maxDepth?: number): Promise<GraphPath | null>;
    /**
     * 查找所有路径实现
     */
    protected findAllPathsImplementation(startNodeId: string, endNodeId: string, relationshipTypes?: (RelationshipType | string)[], maxDepth?: number): Promise<GraphPath[]>;
    /**
     * 获取图谱统计信息实现
     */
    protected getGraphStatsImplementation(): Promise<GraphStats>;
    /**
     * 清空图谱实现
     */
    protected clearGraphImplementation(): Promise<boolean>;
    /**
     * 导出图谱实现
     */
    protected exportGraphImplementation(format: 'JSON' | 'CSV' | 'GRAPHML', path: string): Promise<boolean>;
    /**
     * 导入图谱实现
     */
    protected importGraphImplementation(format: 'JSON' | 'CSV' | 'GRAPHML', path: string, mergeStrategy: 'REPLACE' | 'MERGE' | 'SKIP_DUPLICATES'): Promise<boolean>;
    /**
     * 从文件加载知识图谱
     */
    private loadFromFile;
    /**
     * 保存知识图谱到文件
     */
    private saveToFile;
    /**
     * 导出为JSON格式
     */
    private exportToJson;
    /**
     * 导出为CSV格式
     */
    private exportToCsv;
    /**
     * 导出为GraphML格式
     */
    private exportToGraphML;
    /**
     * 从JSON导入
     */
    private importFromJson;
    /**
     * 从CSV导入
     */
    private importFromCsv;
    /**
     * 从GraphML导入
     */
    private importFromGraphML;
}
/**
 * 全局内存知识图谱服务实例
 */
export declare const globalMemoryKnowledgeGraphService: MemoryKnowledgeGraphService;
