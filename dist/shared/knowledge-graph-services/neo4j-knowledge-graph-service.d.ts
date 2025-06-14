/**
 * Neo4j Knowledge Graph Service - Neo4j知识图谱服务
 *
 * 基于Neo4j图数据库的知识图谱服务实现，适用于生产环境
 */
import { Node, Relationship, NodeQueryOptions, RelationshipQueryOptions, VectorSearchOptions, VectorSearchResult, GraphTraversalOptions, GraphTraversalResult, GraphPath, GraphStats, RelationshipType } from './types';
import { BaseKnowledgeGraphService } from './base-knowledge-graph-service';
/**
 * Neo4j知识图谱服务配置
 */
export interface Neo4jKnowledgeGraphServiceConfig {
    uri: string;
    username: string;
    password: string;
    database?: string;
    enableVectorSearch?: boolean;
    vectorDimension?: number;
    enableApoc?: boolean;
    enableGds?: boolean;
    maxConnectionPoolSize?: number;
    connectionAcquisitionTimeout?: number;
    connectionTimeout?: number;
    maxTransactionRetryTime?: number;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
/**
 * Neo4j知识图谱服务
 *
 * 基于Neo4j图数据库的知识图谱服务实现，适用于生产环境
 */
export declare class Neo4jKnowledgeGraphService extends BaseKnowledgeGraphService {
    private driver;
    private neo4jConfig;
    private database;
    /**
     * 构造函数
     * @param config Neo4j配置
     */
    constructor(config: Neo4jKnowledgeGraphServiceConfig);
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
     * 设置约束和索引
     */
    private setupConstraintsAndIndexes;
    /**
     * 获取会话
     */
    private getSession;
    /**
     * 确保服务已初始化
     */
    protected ensureInitialized(): void;
    /**
     * 转换Neo4j节点为应用节点
     */
    private convertNeo4jNodeToNode;
    /**
     * 转换Neo4j关系为应用关系
     */
    private convertNeo4jRelationshipToRelationship;
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
     * 解析CSV行
     */
    private parseCSVLine;
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
 * 全局Neo4j知识图谱服务实例
 */
export declare const globalNeo4jKnowledgeGraphService: Neo4jKnowledgeGraphService;
