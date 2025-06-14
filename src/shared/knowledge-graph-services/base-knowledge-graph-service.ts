/**
 * Base Knowledge Graph Service - 基础知识图谱服务
 * 
 * 提供知识图谱服务的基础实现和通用功能
 */

import {
  IKnowledgeGraphService,
  Node,
  Relationship,
  CreateNodeInput,
  UpdateNodeInput,
  CreateRelationshipInput,
  UpdateRelationshipInput,
  NodeQueryOptions,
  RelationshipQueryOptions,
  VectorSearchOptions,
  VectorSearchResult,
  GraphTraversalOptions,
  GraphTraversalResult,
  GraphPath,
  GraphStats,
  NodeType,
  RelationshipType,
  PropertyMap
} from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * 基础知识图谱服务配置
 */
export interface BaseKnowledgeGraphServiceConfig {
  // 服务名称
  serviceName?: string;
  // 是否启用向量搜索
  enableVectorSearch?: boolean;
  // 向量维度
  vectorDimension?: number;
  // 日志级别
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * 基础知识图谱服务
 * 
 * 提供知识图谱服务的基础实现和通用功能
 */
export abstract class BaseKnowledgeGraphService implements IKnowledgeGraphService {
  protected config: BaseKnowledgeGraphServiceConfig;
  protected initialized: boolean = false;
  
  /**
   * 构造函数
   * @param config 配置
   */
  constructor(config: BaseKnowledgeGraphServiceConfig = {}) {
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
  public getConfig(): BaseKnowledgeGraphServiceConfig {
    return this.config;
  }
  
  /**
   * 初始化知识图谱服务
   */
  public async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }
    
    try {
      await this.initializeImplementation();
      this.initialized = true;
      return true;
    } catch (error) {
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
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 关闭知识图谱服务
   */
  public async shutdown(): Promise<boolean> {
    if (!this.initialized) {
      return true;
    }
    
    try {
      await this.shutdownImplementation();
      this.initialized = false;
      return true;
    } catch (error) {
      console.error(`Failed to shutdown ${this.config.serviceName}:`, error);
      return false;
    }
  }
  
  /**
   * 创建节点
   * @param input 创建节点输入
   */
  public async createNode(input: CreateNodeInput): Promise<Node> {
    this.ensureInitialized();
    
    const now = new Date();
    const node: Node = {
      id: uuidv4(),
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
  public async createNodes(inputs: CreateNodeInput[]): Promise<Node[]> {
    this.ensureInitialized();
    
    const now = new Date();
    const nodes: Node[] = inputs.map(input => ({
      id: uuidv4(),
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
  public async getNode(id: string): Promise<Node | null> {
    this.ensureInitialized();
    return this.getNodeImplementation(id);
  }
  
  /**
   * 更新节点
   * @param id 节点ID
   * @param input 更新节点输入
   */
  public async updateNode(id: string, input: UpdateNodeInput): Promise<Node | null> {
    this.ensureInitialized();
    
    const node = await this.getNode(id);
    if (!node) {
      return null;
    }
    
    const updatedNode: Node = {
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
  public async deleteNode(id: string): Promise<boolean> {
    this.ensureInitialized();
    return this.deleteNodeImplementation(id);
  }
  
  /**
   * 查询节点
   * @param options 节点查询选项
   */
  public async queryNodes(options: NodeQueryOptions): Promise<Node[]> {
    this.ensureInitialized();
    return this.queryNodesImplementation(options);
  }
  
  /**
   * 创建关系
   * @param input 创建关系输入
   */
  public async createRelationship(input: CreateRelationshipInput): Promise<Relationship> {
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
    const relationship: Relationship = {
      id: uuidv4(),
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
  public async createRelationships(inputs: CreateRelationshipInput[]): Promise<Relationship[]> {
    this.ensureInitialized();
    
    // 收集所有节点ID
    const nodeIds = new Set<string>();
    inputs.forEach(input => {
      nodeIds.add(input.sourceNodeId);
      nodeIds.add(input.targetNodeId);
    });
    
    // 验证所有节点是否存在
    const nodeIdArray = Array.from(nodeIds);
    const existingNodes = await Promise.all(nodeIdArray.map(id => this.getNode(id)));
    const existingNodeIds = new Set<string>();
    
    existingNodes.forEach(node => {
      if (node) {
        existingNodeIds.add(node.id);
      }
    });
    
    // 过滤掉包含不存在节点的关系
    const validInputs = inputs.filter(input => 
      existingNodeIds.has(input.sourceNodeId) && existingNodeIds.has(input.targetNodeId)
    );
    
    if (validInputs.length !== inputs.length) {
      console.warn(`Filtered out ${inputs.length - validInputs.length} relationships with non-existent nodes`);
    }
    
    const now = new Date();
    const relationships: Relationship[] = validInputs.map(input => ({
      id: uuidv4(),
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
  public async getRelationship(id: string): Promise<Relationship | null> {
    this.ensureInitialized();
    return this.getRelationshipImplementation(id);
  }
  
  /**
   * 更新关系
   * @param id 关系ID
   * @param input 更新关系输入
   */
  public async updateRelationship(id: string, input: UpdateRelationshipInput): Promise<Relationship | null> {
    this.ensureInitialized();
    
    const relationship = await this.getRelationship(id);
    if (!relationship) {
      return null;
    }
    
    const updatedRelationship: Relationship = {
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
  public async deleteRelationship(id: string): Promise<boolean> {
    this.ensureInitialized();
    return this.deleteRelationshipImplementation(id);
  }
  
  /**
   * 查询关系
   * @param options 关系查询选项
   */
  public async queryRelationships(options: RelationshipQueryOptions): Promise<Relationship[]> {
    this.ensureInitialized();
    return this.queryRelationshipsImplementation(options);
  }
  
  /**
   * 获取节点的出向关系
   * @param nodeId 节点ID
   * @param types 关系类型过滤（可选）
   */
  public async getOutgoingRelationships(nodeId: string, types?: (RelationshipType | string)[]): Promise<Relationship[]> {
    this.ensureInitialized();
    
    const options: RelationshipQueryOptions = {
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
  public async getIncomingRelationships(nodeId: string, types?: (RelationshipType | string)[]): Promise<Relationship[]> {
    this.ensureInitialized();
    
    const options: RelationshipQueryOptions = {
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
  public async getAllRelationships(nodeId: string, types?: (RelationshipType | string)[]): Promise<Relationship[]> {
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
  public async getRelatedNodes(
    nodeId: string, 
    relationshipTypes?: (RelationshipType | string)[],
    nodeTypes?: (NodeType | string)[],
    direction: 'OUTGOING' | 'INCOMING' | 'BOTH' = 'BOTH'
  ): Promise<Node[]> {
    this.ensureInitialized();
    
    let relationships: Relationship[] = [];
    
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
    const relatedNodeIds = new Set<string>();
    
    relationships.forEach(rel => {
      if (rel.sourceNodeId === nodeId) {
        relatedNodeIds.add(rel.targetNodeId);
      } else if (rel.targetNodeId === nodeId) {
        relatedNodeIds.add(rel.sourceNodeId);
      }
    });
    
    // 获取相关节点
    const relatedNodes = await Promise.all(
      Array.from(relatedNodeIds).map(id => this.getNode(id))
    );
    
    // 过滤掉不存在的节点和不符合类型的节点
    let filteredNodes = relatedNodes.filter(node => node !== null) as Node[];
    
    if (nodeTypes && nodeTypes.length > 0) {
      filteredNodes = filteredNodes.filter(node => nodeTypes.includes(node.type));
    }
    
    return filteredNodes;
  }
  
  /**
   * 向量搜索
   * @param options 向量搜索选项
   */
  public async vectorSearch(options: VectorSearchOptions): Promise<VectorSearchResult[]> {
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
  public async traverseGraph(options: GraphTraversalOptions): Promise<GraphTraversalResult> {
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
  public async findShortestPath(
    startNodeId: string,
    endNodeId: string,
    relationshipTypes?: (RelationshipType | string)[],
    maxDepth: number = 5
  ): Promise<GraphPath | null> {
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
  public async findAllPaths(
    startNodeId: string,
    endNodeId: string,
    relationshipTypes?: (RelationshipType | string)[],
    maxDepth: number = 3
  ): Promise<GraphPath[]> {
    this.ensureInitialized();
    return this.findAllPathsImplementation(startNodeId, endNodeId, relationshipTypes, maxDepth);
  }
  
  /**
   * 获取知识图谱统计信息
   */
  public async getGraphStats(): Promise<GraphStats> {
    this.ensureInitialized();
    return this.getGraphStatsImplementation();
  }
  
  /**
   * 清空知识图谱
   * @param confirm 确认清空
   */
  public async clearGraph(confirm: boolean): Promise<boolean> {
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
  public async exportGraph(format: 'JSON' | 'CSV' | 'GRAPHML', path: string): Promise<boolean> {
    this.ensureInitialized();
    return this.exportGraphImplementation(format, path);
  }
  
  /**
   * 导入知识图谱
   * @param format 导入格式
   * @param path 导入路径
   * @param mergeStrategy 合并策略
   */
  public async importGraph(
    format: 'JSON' | 'CSV' | 'GRAPHML',
    path: string,
    mergeStrategy: 'REPLACE' | 'MERGE' | 'SKIP_DUPLICATES'
  ): Promise<boolean> {
    this.ensureInitialized();
    return this.importGraphImplementation(format, path, mergeStrategy);
  }
  
  /**
   * 确保服务已初始化
   */
  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(`${this.config.serviceName} is not initialized. Call initialize() first.`);
    }
  }
  
  // 抽象方法，需要由具体实现类实现
  
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
  protected abstract findShortestPathImplementation(
    startNodeId: string,
    endNodeId: string,
    relationshipTypes?: (RelationshipType | string)[],
    maxDepth?: number
  ): Promise<GraphPath | null>;
  
  /**
   * 查找所有路径实现
   */
  protected abstract findAllPathsImplementation(
    startNodeId: string,
    endNodeId: string,
    relationshipTypes?: (RelationshipType | string)[],
    maxDepth?: number
  ): Promise<GraphPath[]>;
  
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
  protected abstract importGraphImplementation(
    format: 'JSON' | 'CSV' | 'GRAPHML',
    path: string,
    mergeStrategy: 'REPLACE' | 'MERGE' | 'SKIP_DUPLICATES'
  ): Promise<boolean>;
}