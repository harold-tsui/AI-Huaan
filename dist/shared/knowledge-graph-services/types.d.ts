/**
 * Knowledge Graph Services Types - 知识图谱服务类型定义
 *
 * 定义知识图谱服务的接口和类型
 */
/**
 * 知识图谱节点类型枚举
 */
export declare enum NodeType {
    NOTE = "NOTE",// 笔记
    TAG = "TAG",// 标签
    CONCEPT = "CONCEPT",// 概念
    ENTITY = "ENTITY",// 实体
    TOPIC = "TOPIC",// 主题
    QUESTION = "QUESTION",// 问题
    ANSWER = "ANSWER",// 回答
    TASK = "TASK",// 任务
    PROJECT = "PROJECT",// 项目
    GOAL = "GOAL",// 目标
    AREA = "AREA",// 领域
    RESOURCE = "RESOURCE",// 资源
    FILE = "FILE",// 文件
    IMAGE = "IMAGE",// 图片
    AUDIO = "AUDIO",// 音频
    VIDEO = "VIDEO",// 视频
    DOCUMENT = "DOCUMENT",// 文档
    WEBPAGE = "WEBPAGE",// 网页
    DATE = "DATE",// 日期
    EVENT = "EVENT",// 事件
    DAILY_NOTE = "DAILY_NOTE",// 日记
    WEEKLY_NOTE = "WEEKLY_NOTE",// 周记
    MONTHLY_NOTE = "MONTHLY_NOTE",// 月记
    CUSTOM = "CUSTOM",
    PERSON = "PERSON",
    LOCATION = "LOCATION",
    ORGANIZATION = "ORGANIZATION"
}
/**
 * 知识图谱关系类型枚举
 */
export declare enum RelationshipType {
    REFERENCES = "REFERENCES",// 引用
    CONTAINS = "CONTAINS",// 包含
    RELATED_TO = "RELATED_TO",// 相关
    SIMILAR_TO = "SIMILAR_TO",// 相似
    PART_OF = "PART_OF",// 部分
    HAS_TAG = "HAS_TAG",// 有标签
    BELONGS_TO = "BELONGS_TO",// 属于
    CREATED_AT = "CREATED_AT",// 创建于
    CREATED_BY = "CREATED_BY",// 创建者
    MODIFIED_AT = "MODIFIED_AT",// 修改于
    MODIFIED_BY = "MODIFIED_BY",// 修改者
    IS_A = "IS_A",// 是一个
    HAS_PROPERTY = "HAS_PROPERTY",// 有属性
    CAUSES = "CAUSES",// 导致
    PRECEDES = "PRECEDES",// 先于
    FOLLOWS = "FOLLOWS",// 后于
    CONTRADICTS = "CONTRADICTS",// 矛盾
    SUPPORTS = "SUPPORTS",// 支持
    ANSWERS = "ANSWERS",// 回答
    QUESTIONS = "QUESTIONS",// 提问
    DEPENDS_ON = "DEPENDS_ON",// 依赖
    BLOCKS = "BLOCKS",// 阻塞
    IMPLEMENTS = "IMPLEMENTS",// 实现
    CUSTOM = "CUSTOM",
    DESCRIBES = "DESCRIBES",
    MENTIONS = "MENTIONS"
}
/**
 * 节点属性类型
 */
export type PropertyValue = string | number | boolean | Date | string[] | number[] | null;
/**
 * 节点属性映射
 */
export interface PropertyMap {
    [key: string]: PropertyValue;
}
/**
 * 节点接口
 */
export interface Node {
    id: string;
    type: NodeType | string;
    label: string;
    properties: PropertyMap;
    createdAt: Date;
    updatedAt: Date;
    vector?: number[];
}
/**
 * 关系接口
 */
export interface Relationship {
    id: string;
    type: RelationshipType | string;
    label: string;
    properties: PropertyMap;
    sourceNodeId: string;
    targetNodeId: string;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * 创建节点输入
 */
export interface CreateNodeInput {
    type: NodeType | string;
    label: string;
    properties?: PropertyMap;
    vector?: number[];
}
/**
 * 更新节点输入
 */
export interface UpdateNodeInput {
    label?: string;
    properties?: PropertyMap;
    vector?: number[];
}
/**
 * 创建关系输入
 */
export interface CreateRelationshipInput {
    type: RelationshipType | string;
    label: string;
    sourceNodeId: string;
    targetNodeId: string;
    properties?: PropertyMap;
}
/**
 * 更新关系输入
 */
export interface UpdateRelationshipInput {
    label?: string;
    properties?: PropertyMap;
}
/**
 * 节点查询选项
 */
export interface NodeQueryOptions {
    types?: (NodeType | string)[];
    properties?: PropertyMap;
    labels?: string[];
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
}
/**
 * 关系查询选项
 */
export interface RelationshipQueryOptions {
    types?: (RelationshipType | string)[];
    properties?: PropertyMap;
    labels?: string[];
    sourceNodeIds?: string[];
    targetNodeIds?: string[];
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
}
/**
 * 向量搜索选项
 */
export interface VectorSearchOptions {
    vector: number[];
    nodeTypes?: (NodeType | string)[];
    limit?: number;
    minSimilarity?: number;
}
/**
 * 向量搜索结果
 */
export interface VectorSearchResult {
    node: Node;
    similarity: number;
}
/**
 * 图遍历选项
 */
export interface GraphTraversalOptions {
    startNodeId: string;
    relationshipTypes?: (RelationshipType | string)[];
    nodeTypes?: (NodeType | string)[];
    direction?: 'OUTGOING' | 'INCOMING' | 'BOTH';
    maxDepth?: number;
    limit?: number;
}
/**
 * 图遍历结果
 */
export interface GraphTraversalResult {
    nodes: Node[];
    relationships: Relationship[];
    paths: GraphPath[];
}
/**
 * 图路径
 */
export interface GraphPath {
    nodes: Node[];
    relationships: Relationship[];
    length: number;
}
/**
 * 知识图谱统计信息
 */
export interface GraphStats {
    nodeCount: number;
    relationshipCount: number;
    nodeTypeCounts: {
        [key: string]: number;
    };
    relationshipTypeCounts: {
        [key: string]: number;
    };
}
/**
 * 知识图谱服务接口
 */
export interface IKnowledgeGraphService {
    isInitialized(): boolean;
    /**
     * 初始化知识图谱服务
     */
    initialize(): Promise<boolean>;
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
}
