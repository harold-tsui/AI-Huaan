/**
 * Memory Knowledge Graph Service - 内存知识图谱服务
 * 
 * 基于内存的知识图谱服务实现，适用于开发和测试环境
 */

import {
  Node,
  Relationship,
  NodeQueryOptions,
  RelationshipQueryOptions,
  VectorSearchOptions,
  VectorSearchResult,
  GraphTraversalOptions,
  GraphTraversalResult,
  GraphPath,
  GraphStats,
  NodeType,
  RelationshipType
} from './types';
import { BaseKnowledgeGraphService } from './base-knowledge-graph-service';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
// 导入 NodeJS 类型定义

// 向量相似度计算函数
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * 内存知识图谱服务配置
 */
export interface MemoryKnowledgeGraphServiceConfig {
  // 是否持久化到文件
  persistToFile?: boolean;
  // 持久化文件路径
  persistFilePath?: string;
  // 自动保存间隔（毫秒）
  autoSaveInterval?: number;
  // 是否启用向量搜索
  enableVectorSearch?: boolean;
  // 向量维度
  vectorDimension?: number;
  // 日志级别
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * 内存知识图谱服务
 * 
 * 基于内存的知识图谱服务实现，适用于开发和测试环境
 */
export class MemoryKnowledgeGraphService extends BaseKnowledgeGraphService {
  private nodes: Map<string, Node> = new Map();
  private relationships: Map<string, Relationship> = new Map();
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private memoryConfig: MemoryKnowledgeGraphServiceConfig;
  
  /**
   * 构造函数
   * @param config 配置
   */
  constructor(config: MemoryKnowledgeGraphServiceConfig = {}) {
    super({
      serviceName: 'MemoryKnowledgeGraphService',
      enableVectorSearch: config.enableVectorSearch !== undefined ? config.enableVectorSearch : true,
      vectorDimension: config.vectorDimension || 1536,
      logLevel: config.logLevel || 'info'
    });
    
    this.memoryConfig = {
      persistToFile: config.persistToFile !== undefined ? config.persistToFile : false,
      persistFilePath: config.persistFilePath || path.join(process.cwd(), 'knowledge-graph.json'),
      autoSaveInterval: config.autoSaveInterval || 60000, // 默认1分钟
      ...config
    };
  }
  
  /**
   * 初始化实现
   */
  protected async initializeImplementation(): Promise<void> {
    // 如果启用了持久化，尝试从文件加载
    if (this.memoryConfig.persistToFile) {
      try {
        await this.loadFromFile();
      } catch (error) {
        console.warn('Failed to load knowledge graph from file:', error instanceof Error ? error : String(error));
        console.info('Starting with an empty knowledge graph');
      }
      
      // 设置自动保存定时器
      if (this.memoryConfig.autoSaveInterval && this.memoryConfig.autoSaveInterval > 0) {
        // 确保在设置新的定时器前清除旧的定时器
        if (this.autoSaveTimer) {
          clearInterval(this.autoSaveTimer);
          this.autoSaveTimer = null;
        }
        
        this.autoSaveTimer = setInterval(() => {
          this.saveToFile().catch(error => {
            console.error('Failed to auto-save knowledge graph:', error instanceof Error ? error : String(error));
          });
        }, this.memoryConfig.autoSaveInterval);
      }
    }
  }
  
  /**
   * 关闭实现
   */
  protected async shutdownImplementation(): Promise<void> {
    // 如果启用了持久化，保存到文件
    if (this.memoryConfig.persistToFile) {
      try {
        await this.saveToFile();
      } catch (error) {
        console.error('Failed to save knowledge graph to file during shutdown:', error instanceof Error ? error : String(error));
      }
      
      // 清除自动保存定时器
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer);
        this.autoSaveTimer = null;
      }
    }
    
    // 清空内存
    this.nodes.clear();
    this.relationships.clear();
  }
  
  /**
   * 创建节点实现
   */
  protected async createNodeImplementation(node: Node): Promise<Node> {
    this.nodes.set(node.id, node);
    return node;
  }
  
  /**
   * 批量创建节点实现
   */
  protected async createNodesImplementation(nodes: Node[]): Promise<Node[]> {
    for (const node of nodes) {
      this.nodes.set(node.id, node);
    }
    return nodes;
  }
  
  /**
   * 获取节点实现
   */
  protected async getNodeImplementation(id: string): Promise<Node | null> {
    return this.nodes.get(id) || null;
  }
  
  /**
   * 更新节点实现
   */
  protected async updateNodeImplementation(id: string, node: Node): Promise<Node | null> {
    if (!this.nodes.has(id)) {
      return null;
    }
    
    this.nodes.set(id, node);
    return node;
  }
  
  /**
   * 删除节点实现
   */
  protected async deleteNodeImplementation(id: string): Promise<boolean> {
    if (!this.nodes.has(id)) {
      return false;
    }
    
    // 删除节点
    this.nodes.delete(id);
    
    // 删除与该节点相关的所有关系
    const relationshipsToDelete: string[] = [];
    
    // 使用 Array.from 转换 Map.entries() 为数组，避免 MapIterator 类型错误
    for (const [relationshipId, relationship] of Array.from(this.relationships.entries())) {
      if (relationship.sourceNodeId === id || relationship.targetNodeId === id) {
        relationshipsToDelete.push(relationshipId);
      }
    }
    
    for (const relationshipId of relationshipsToDelete) {
      this.relationships.delete(relationshipId);
    }
    
    return true;
  }
  
  /**
   * 查询节点实现
   */
  protected async queryNodesImplementation(options: NodeQueryOptions): Promise<Node[]> {
    let result = Array.from(this.nodes.values());
    
    // 按类型过滤
    if (options.types && options.types.length > 0) {
      result = result.filter(node => options.types!.includes(node.type));
    }
    
    // 按标签过滤
    if (options.labels && options.labels.length > 0) {
      result = result.filter(node => options.labels!.includes(node.label));
    }
    
    // 按属性过滤
    if (options.properties) {
      result = result.filter(node => {
        for (const [key, value] of Object.entries(options.properties!)) {
          // 如果节点没有该属性或属性值不匹配
          if (node.properties[key] === undefined || node.properties[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // 排序
    if (options.orderBy) {
      const orderDirection = options.orderDirection || 'ASC';
      const orderMultiplier = orderDirection === 'ASC' ? 1 : -1;
      
      result.sort((a, b) => {
        let valueA: unknown;
        let valueB: unknown;
        
        // 特殊字段处理
        if (options.orderBy && (options.orderBy === 'createdAt' || options.orderBy === 'updatedAt')) {
          const dateA = a[options.orderBy as keyof typeof a];
          const dateB = b[options.orderBy as keyof typeof b];
          valueA = dateA instanceof Date ? dateA.getTime() : 0;
          valueB = dateB instanceof Date ? dateB.getTime() : 0;
        } else if (options.orderBy === 'id' || options.orderBy === 'type' || options.orderBy === 'label') {
          valueA = a[options.orderBy];
          valueB = b[options.orderBy];
        } else {
          // 属性字段
          valueA = options.orderBy ? a.properties[options.orderBy] : undefined;
          valueB = options.orderBy ? b.properties[options.orderBy] : undefined;
        }
        
        // 排序比较
        if (valueA === undefined && valueB === undefined) return 0;
        if (valueA === undefined) return orderMultiplier * -1;
        if (valueB === undefined) return orderMultiplier * 1;
        
        // 使用类型守卫确保类型安全的比较
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return orderMultiplier * (valueA - valueB);
        } else if (typeof valueA === 'string' && typeof valueB === 'string') {
          return orderMultiplier * valueA.localeCompare(valueB);
        } else if (valueA instanceof Date && valueB instanceof Date) {
          return orderMultiplier * (valueA.getTime() - valueB.getTime());
        } else if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
          return orderMultiplier * (valueA === valueB ? 0 : valueA ? 1 : -1);
        } else {
          // 转换为字符串进行比较，确保安全
          const strA = String(valueA);
          const strB = String(valueB);
          return orderMultiplier * strA.localeCompare(strB);
        }
        return 0;
      });
    }
    
    // 分页
    if (options.offset !== undefined || options.limit !== undefined) {
      const offset = options.offset || 0;
      const limit = options.limit !== undefined ? options.limit : result.length;
      
      result = result.slice(offset, offset + limit);
    }
    
    return result;
  }
  
  /**
   * 创建关系实现
   */
  protected async createRelationshipImplementation(relationship: Relationship): Promise<Relationship> {
    this.relationships.set(relationship.id, relationship);
    return relationship;
  }
  
  /**
   * 批量创建关系实现
   */
  protected async createRelationshipsImplementation(relationships: Relationship[]): Promise<Relationship[]> {
    for (const relationship of relationships) {
      this.relationships.set(relationship.id, relationship);
    }
    return relationships;
  }
  
  /**
   * 获取关系实现
   */
  protected async getRelationshipImplementation(id: string): Promise<Relationship | null> {
    return this.relationships.get(id) || null;
  }
  
  /**
   * 更新关系实现
   */
  protected async updateRelationshipImplementation(id: string, relationship: Relationship): Promise<Relationship | null> {
    if (!this.relationships.has(id)) {
      return null;
    }
    
    this.relationships.set(id, relationship);
    return relationship;
  }
  
  /**
   * 删除关系实现
   */
  protected async deleteRelationshipImplementation(id: string): Promise<boolean> {
    return this.relationships.delete(id);
  }
  
  /**
   * 查询关系实现
   */
  protected async queryRelationshipsImplementation(options: RelationshipQueryOptions): Promise<Relationship[]> {
    let result = Array.from(this.relationships.values());
    
    // 按类型过滤
    if (options.types && options.types.length > 0) {
      result = result.filter(rel => options.types!.includes(rel.type));
    }
    
    // 按标签过滤
    if (options.labels && options.labels.length > 0) {
      result = result.filter(rel => options.labels!.includes(rel.label));
    }
    
    // 按源节点ID过滤
    if (options.sourceNodeIds && options.sourceNodeIds.length > 0) {
      result = result.filter(rel => options.sourceNodeIds!.includes(rel.sourceNodeId));
    }
    
    // 按目标节点ID过滤
    if (options.targetNodeIds && options.targetNodeIds.length > 0) {
      result = result.filter(rel => options.targetNodeIds!.includes(rel.targetNodeId));
    }
    
    // 按属性过滤
    if (options.properties) {
      result = result.filter(rel => {
        for (const [key, value] of Object.entries(options.properties!)) {
          // 如果关系没有该属性或属性值不匹配
          if (rel.properties[key] === undefined || rel.properties[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // 排序
    if (options.orderBy) {
      const orderDirection = options.orderDirection || 'ASC';
      const orderMultiplier = orderDirection === 'ASC' ? 1 : -1;
      
      result.sort((a, b) => {
        let valueA: unknown;
        let valueB: unknown;
        
        // 特殊字段处理
        if (options.orderBy === 'createdAt' || options.orderBy === 'updatedAt') {
          valueA = a[options.orderBy].getTime();
          valueB = b[options.orderBy].getTime();
        } else if (options.orderBy && ['id', 'type', 'label', 'sourceNodeId', 'targetNodeId'].includes(options.orderBy)) {
          valueA = a[options.orderBy as keyof typeof a];
          valueB = b[options.orderBy as keyof typeof b];
        } else {
          // 属性字段
          valueA = options.orderBy ? a.properties[options.orderBy] : undefined;
          valueB = options.orderBy ? b.properties[options.orderBy] : undefined;
        }
        
        // 排序比较
        if (valueA === undefined && valueB === undefined) return 0;
        if (valueA === undefined) return orderMultiplier * -1;
        if (valueB === undefined) return orderMultiplier * 1;
        
        // 使用类型守卫确保类型安全的比较
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return orderMultiplier * (valueA - valueB);
        } else if (typeof valueA === 'string' && typeof valueB === 'string') {
          return orderMultiplier * valueA.localeCompare(valueB);
        } else if (valueA instanceof Date && valueB instanceof Date) {
          return orderMultiplier * (valueA.getTime() - valueB.getTime());
        } else if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
          return orderMultiplier * (valueA === valueB ? 0 : valueA ? 1 : -1);
        } else {
          // 转换为字符串进行比较，确保安全
          const strA = String(valueA);
          const strB = String(valueB);
          return orderMultiplier * strA.localeCompare(strB);
        }
        return 0;
      });
    }
    
    // 分页
    if (options.offset !== undefined || options.limit !== undefined) {
      const offset = options.offset || 0;
      const limit = options.limit !== undefined ? options.limit : result.length;
      
      result = result.slice(offset, offset + limit);
    }
    
    return result;
  }
  
  /**
   * 向量搜索实现
   */
  protected async vectorSearchImplementation(options: VectorSearchOptions): Promise<VectorSearchResult[]> {
    if (!this.config.enableVectorSearch) {
      throw new Error('Vector search is not enabled for this service');
    }
    
    // 获取所有有向量的节点
    let nodes = Array.from(this.nodes.values()).filter(node => node.vector !== undefined);
    
    // 按节点类型过滤
    if (options.nodeTypes && options.nodeTypes.length > 0) {
      nodes = nodes.filter(node => options.nodeTypes!.includes(node.type));
    }
    
    // 计算相似度并排序
    const results: VectorSearchResult[] = nodes.map(node => ({
      node,
      similarity: cosineSimilarity(options.vector, node.vector!)
    }));
    
    // 按相似度排序（降序）
    results.sort((a, b) => b.similarity - a.similarity);
    
    // 应用最小相似度过滤
    if (options.minSimilarity !== undefined) {
      return results.filter(result => result.similarity >= options.minSimilarity!);
    }
    
    // 应用结果限制
    if (options.limit !== undefined) {
      return results.slice(0, options.limit);
    }
    
    return results;
  }
  
  /**
   * 图遍历实现
   */
  protected async traverseGraphImplementation(options: GraphTraversalOptions): Promise<GraphTraversalResult> {
    const startNode = await this.getNode(options.startNodeId);
    if (!startNode) {
      throw new Error(`Start node with ID ${options.startNodeId} does not exist`);
    }
    
    const maxDepth = options.maxDepth !== undefined ? options.maxDepth : 3;
    const limit = options.limit !== undefined ? options.limit : 100;
    const direction = options.direction || 'BOTH';
    
    // 结果集
    const visitedNodeIds = new Set<string>([options.startNodeId]);
    const resultNodes: Node[] = [startNode];
    const resultRelationships: Relationship[] = [];
    const resultPaths: GraphPath[] = [];
    
    // 广度优先搜索队列
    interface QueueItem {
      nodeId: string;
      depth: number;
      path: {
        nodes: Node[];
        relationships: Relationship[];
      };
    }
    
    const queue: QueueItem[] = [{
      nodeId: options.startNodeId,
      depth: 0,
      path: {
        nodes: [startNode],
        relationships: []
      }
    }];
    
    while (queue.length > 0 && resultNodes.length < limit) {
      const current = queue.shift()!;
      
      // 如果已达到最大深度，不再继续
      if (current.depth >= maxDepth) {
        continue;
      }
      
      // 获取当前节点的关系
      let relationships: Relationship[] = [];
      
      if (direction === 'OUTGOING' || direction === 'BOTH') {
        const outgoing = Array.from(this.relationships.values())
          .filter(rel => rel.sourceNodeId === current.nodeId);
        relationships = relationships.concat(outgoing);
      }
      
      if (direction === 'INCOMING' || direction === 'BOTH') {
        const incoming = Array.from(this.relationships.values())
          .filter(rel => rel.targetNodeId === current.nodeId);
        relationships = relationships.concat(incoming);
      }
      
      // 按关系类型过滤
      if (options.relationshipTypes && options.relationshipTypes.length > 0) {
        relationships = relationships.filter(rel => 
          options.relationshipTypes!.includes(rel.type)
        );
      }
      
      // 遍历关系
      for (const relationship of relationships) {
        // 确定下一个节点ID
        const nextNodeId = relationship.sourceNodeId === current.nodeId
          ? relationship.targetNodeId
          : relationship.sourceNodeId;
        
        // 如果已访问过该节点，跳过
        if (visitedNodeIds.has(nextNodeId)) {
          continue;
        }
        
        // 获取下一个节点
        const nextNode = await this.getNode(nextNodeId);
        if (!nextNode) {
          continue;
        }
        
        // 按节点类型过滤
        if (options.nodeTypes && options.nodeTypes.length > 0 && !options.nodeTypes.includes(nextNode.type)) {
          continue;
        }
        
        // 添加到结果集
        visitedNodeIds.add(nextNodeId);
        resultNodes.push(nextNode);
        resultRelationships.push(relationship);
        
        // 创建新路径
        const newPath = {
          nodes: [...current.path.nodes, nextNode],
          relationships: [...current.path.relationships, relationship]
        };
        
        // 添加路径到结果集
        resultPaths.push({
          nodes: newPath.nodes,
          relationships: newPath.relationships,
          length: newPath.relationships.length
        });
        
        // 添加到队列继续遍历
        queue.push({
          nodeId: nextNodeId,
          depth: current.depth + 1,
          path: newPath
        });
      }
    }
    
    return {
      nodes: resultNodes,
      relationships: resultRelationships,
      paths: resultPaths
    };
  }
  
  /**
   * 查找最短路径实现
   */
  protected async findShortestPathImplementation(
    startNodeId: string,
    endNodeId: string,
    relationshipTypes?: (RelationshipType | string)[],
    maxDepth: number = 5
  ): Promise<GraphPath | null> {
    // 验证起始节点和结束节点是否存在
    const startNode = await this.getNode(startNodeId);
    const endNode = await this.getNode(endNodeId);
    
    if (!startNode) {
      throw new Error(`Start node with ID ${startNodeId} does not exist`);
    }
    
    if (!endNode) {
      throw new Error(`End node with ID ${endNodeId} does not exist`);
    }
    
    // 如果起始节点和结束节点相同，返回只包含该节点的路径
    if (startNodeId === endNodeId) {
      return {
        nodes: [startNode],
        relationships: [],
        length: 0
      };
    }
    
    // 广度优先搜索
    const visited = new Set<string>([startNodeId]);
    
    interface QueueItem {
      nodeId: string;
      path: {
        nodes: Node[];
        relationships: Relationship[];
      };
    }
    
    const queue: QueueItem[] = [{
      nodeId: startNodeId,
      path: {
        nodes: [startNode],
        relationships: []
      }
    }];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      // 如果已达到最大深度，不再继续
      if (current.path.relationships.length >= maxDepth) {
        continue;
      }
      
      // 获取当前节点的所有关系
      let relationships = Array.from(this.relationships.values())
        .filter(rel => rel.sourceNodeId === current.nodeId || rel.targetNodeId === current.nodeId);
      
      // 按关系类型过滤
      if (relationshipTypes && relationshipTypes.length > 0) {
        relationships = relationships.filter(rel => relationshipTypes.includes(rel.type));
      }
      
      // 遍历关系
      for (const relationship of relationships) {
        // 确定下一个节点ID
        const nextNodeId = relationship.sourceNodeId === current.nodeId
          ? relationship.targetNodeId
          : relationship.sourceNodeId;
        
        // 如果已访问过该节点，跳过
        if (visited.has(nextNodeId)) {
          continue;
        }
        
        // 获取下一个节点
        const nextNode = await this.getNode(nextNodeId);
        if (!nextNode) {
          continue;
        }
        
        // 创建新路径
        const newPath = {
          nodes: [...current.path.nodes, nextNode],
          relationships: [...current.path.relationships, relationship]
        };
        
        // 如果找到结束节点，返回路径
        if (nextNodeId === endNodeId) {
          return {
            nodes: newPath.nodes,
            relationships: newPath.relationships,
            length: newPath.relationships.length
          };
        }
        
        // 标记为已访问
        visited.add(nextNodeId);
        
        // 添加到队列继续搜索
        queue.push({
          nodeId: nextNodeId,
          path: newPath
        });
      }
    }
    
    // 未找到路径
    return null;
  }
  
  /**
   * 查找所有路径实现
   */
  protected async findAllPathsImplementation(
    startNodeId: string,
    endNodeId: string,
    relationshipTypes?: (RelationshipType | string)[],
    maxDepth: number = 3
  ): Promise<GraphPath[]> {
    // 验证起始节点和结束节点是否存在
    const startNode = await this.getNode(startNodeId);
    const endNode = await this.getNode(endNodeId);
    
    if (!startNode) {
      throw new Error(`Start node with ID ${startNodeId} does not exist`);
    }
    
    if (!endNode) {
      throw new Error(`End node with ID ${endNodeId} does not exist`);
    }
    
    // 如果起始节点和结束节点相同，返回只包含该节点的路径
    if (startNodeId === endNodeId) {
      return [{
        nodes: [startNode],
        relationships: [],
        length: 0
      }];
    }
    
    // 结果路径
    const resultPaths: GraphPath[] = [];
    
    // 深度优先搜索
    const dfs = async (
      currentNodeId: string,
      currentPath: {
        nodes: Node[];
        relationships: Relationship[];
      },
      visited: Set<string>
    ) => {
      // 如果已达到最大深度，不再继续
      if (currentPath.relationships.length >= maxDepth) {
        return;
      }
      
      // 获取当前节点的所有关系
      let relationships = Array.from(this.relationships.values())
        .filter(rel => rel.sourceNodeId === currentNodeId || rel.targetNodeId === currentNodeId);
      
      // 按关系类型过滤
      if (relationshipTypes && relationshipTypes.length > 0) {
        relationships = relationships.filter(rel => relationshipTypes.includes(rel.type));
      }
      
      // 遍历关系
      for (const relationship of relationships) {
        // 确定下一个节点ID
        const nextNodeId = relationship.sourceNodeId === currentNodeId
          ? relationship.targetNodeId
          : relationship.sourceNodeId;
        
        // 如果已访问过该节点，跳过
        if (visited.has(nextNodeId)) {
          continue;
        }
        
        // 获取下一个节点
        const nextNode = await this.getNode(nextNodeId);
        if (!nextNode) {
          continue;
        }
        
        // 创建新路径
        const newPath = {
          nodes: [...currentPath.nodes, nextNode],
          relationships: [...currentPath.relationships, relationship]
        };
        
        // 如果找到结束节点，添加到结果路径
        if (nextNodeId === endNodeId) {
          resultPaths.push({
            nodes: newPath.nodes,
            relationships: newPath.relationships,
            length: newPath.relationships.length
          });
          continue; // 不再继续搜索
        }
        
        // 标记为已访问
        const newVisited = new Set(visited);
        newVisited.add(nextNodeId);
        
        // 继续深度搜索
        await dfs(nextNodeId, newPath, newVisited);
      }
    };
    
    // 开始深度优先搜索
    await dfs(startNodeId, { nodes: [startNode], relationships: [] }, new Set([startNodeId]));
    
    // 按路径长度排序
    resultPaths.sort((a, b) => a.length - b.length);
    
    return resultPaths;
  }
  
  /**
   * 获取图谱统计信息实现
   */
  protected async getGraphStatsImplementation(): Promise<GraphStats> {
    const nodeCount = this.nodes.size;
    const relationshipCount = this.relationships.size;
    
    // 统计各类型节点数量
    const nodeTypeCounts: { [key: string]: number } = {};
    for (const node of Array.from(this.nodes.values())) {
      nodeTypeCounts[node.type] = (nodeTypeCounts[node.type] || 0) + 1;
    }
    
    // 统计各类型关系数量
    const relationshipTypeCounts: { [key: string]: number } = {};
    for (const relationship of Array.from(this.relationships.values())) {
      relationshipTypeCounts[relationship.type] = (relationshipTypeCounts[relationship.type] || 0) + 1;
    }
    
    return {
      nodeCount,
      relationshipCount,
      nodeTypeCounts,
      relationshipTypeCounts
    };
  }
  
  /**
   * 清空图谱实现
   */
  protected async clearGraphImplementation(): Promise<boolean> {
    this.nodes.clear();
    this.relationships.clear();
    return true;
  }
  
  /**
   * 导出图谱实现
   */
  protected async exportGraphImplementation(format: 'JSON' | 'CSV' | 'GRAPHML', path: string): Promise<boolean> {
    switch (format) {
      case 'JSON':
        return this.exportToJson(path);
      case 'CSV':
        return this.exportToCsv(path);
      case 'GRAPHML':
        return this.exportToGraphML(path);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
  
  /**
   * 导入图谱实现
   */
  protected async importGraphImplementation(
    format: 'JSON' | 'CSV' | 'GRAPHML',
    path: string,
    mergeStrategy: 'REPLACE' | 'MERGE' | 'SKIP_DUPLICATES'
  ): Promise<boolean> {
    switch (format) {
      case 'JSON':
        return this.importFromJson(path, mergeStrategy);
      case 'CSV':
        return this.importFromCsv(path, mergeStrategy);
      case 'GRAPHML':
        return this.importFromGraphML(path, mergeStrategy);
      default:
        throw new Error(`Unsupported import format: ${format}`);
    }
  }
  
  /**
   * 从文件加载知识图谱
   */
  private async loadFromFile(): Promise<void> {
    const readFile = promisify(fs.readFile);
    
    try {
      // 检查文件是否存在
      if (!fs.existsSync(this.memoryConfig.persistFilePath!)) {
        console.info(`Knowledge graph file does not exist: ${this.memoryConfig.persistFilePath}`);
        return;
      }
      
      // 读取文件
      const data = await readFile(this.memoryConfig.persistFilePath!, 'utf8');
      const { nodes, relationships } = JSON.parse(data);
      
      // 清空当前图谱
      this.nodes.clear();
      this.relationships.clear();
      
      // 加载节点
      for (const node of nodes) {
        // 转换日期字符串为Date对象
        node.createdAt = new Date(node.createdAt);
        node.updatedAt = new Date(node.updatedAt);
        this.nodes.set(node.id, node);
      }
      
      // 加载关系
      for (const relationship of relationships) {
        // 转换日期字符串为Date对象
        relationship.createdAt = new Date(relationship.createdAt);
        relationship.updatedAt = new Date(relationship.updatedAt);
        this.relationships.set(relationship.id, relationship);
      }
      
      console.info(`Loaded knowledge graph from ${this.memoryConfig.persistFilePath}: ${nodes.length} nodes, ${relationships.length} relationships`);
    } catch (error) {
      console.error('Failed to load knowledge graph from file:', error);
      throw error;
    }
  }
  
  /**
   * 保存知识图谱到文件
   */
  private async saveToFile(): Promise<void> {
    const writeFile = promisify(fs.writeFile);
    const mkdir = promisify(fs.mkdir);
    
    try {
      // 确保目录存在
      const dir = path.dirname(this.memoryConfig.persistFilePath!);
      if (!fs.existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      
      // 准备数据
      const data = {
        nodes: Array.from(this.nodes.values()),
        relationships: Array.from(this.relationships.values())
      };
      
      // 写入文件
      await writeFile(this.memoryConfig.persistFilePath!, JSON.stringify(data, null, 2), 'utf8');
      console.info(`Saved knowledge graph to ${this.memoryConfig.persistFilePath}: ${this.nodes.size} nodes, ${this.relationships.size} relationships`);
    } catch (error) {
      console.error('Failed to save knowledge graph to file:', error);
      throw error;
    }
  }
  
  /**
   * 导出为JSON格式
   */
  private async exportToJson(filePath: string): Promise<boolean> {
    const writeFile = promisify(fs.writeFile);
    const mkdir = promisify(fs.mkdir);
    
    try {
      // 确保目录存在
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      
      // 准备数据
      const data = {
        nodes: Array.from(this.nodes.values()),
        relationships: Array.from(this.relationships.values())
      };
      
      // 写入文件
      await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.info(`Exported knowledge graph to JSON: ${filePath}`);
      return true;
    } catch (error) {
      console.error('Failed to export knowledge graph to JSON:', error);
      return false;
    }
  }
  
  /**
   * 导出为CSV格式
   */
  private async exportToCsv(dirPath: string): Promise<boolean> {
    const writeFile = promisify(fs.writeFile);
    const mkdir = promisify(fs.mkdir);
    
    try {
      // 确保目录存在
      if (!fs.existsSync(dirPath)) {
        await mkdir(dirPath, { recursive: true });
      }
      
      // 导出节点
      const nodesPath = path.join(dirPath, 'nodes.csv');
      let nodesContent = 'id,type,label,createdAt,updatedAt,properties\n';
      
      for (const node of Array.from(this.nodes.values())) {
        nodesContent += `"${node.id}","${node.type}","${node.label}","${node.createdAt.toISOString()}","${node.updatedAt.toISOString()}","${JSON.stringify(node.properties).replace(/"/g, '""')}"\n`;
      }
      
      await writeFile(nodesPath, nodesContent, 'utf8');
      
      // 导出关系
      const relationshipsPath = path.join(dirPath, 'relationships.csv');
      let relationshipsContent = 'id,type,label,sourceNodeId,targetNodeId,createdAt,updatedAt,properties\n';
      
      for (const relationship of Array.from(this.relationships.values())) {
        relationshipsContent += `"${relationship.id}","${relationship.type}","${relationship.label}","${relationship.sourceNodeId}","${relationship.targetNodeId}","${relationship.createdAt.toISOString()}","${relationship.updatedAt.toISOString()}","${JSON.stringify(relationship.properties).replace(/"/g, '""')}"\n`;
      }
      
      await writeFile(relationshipsPath, relationshipsContent, 'utf8');
      
      console.info(`Exported knowledge graph to CSV: ${dirPath}`);
      return true;
    } catch (error) {
      console.error('Failed to export knowledge graph to CSV:', error);
      return false;
    }
  }
  
  /**
   * 导出为GraphML格式
   */
  private async exportToGraphML(filePath: string): Promise<boolean> {
    const writeFile = promisify(fs.writeFile);
    const mkdir = promisify(fs.mkdir);
    
    try {
      // 确保目录存在
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      
      // GraphML头部
      let content = '<?xml version="1.0" encoding="UTF-8"?>\n';
      content += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns"\n';
      content += '         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
      content += '         xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns\n';
      content += '         http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">\n';
      
      // 定义属性键
      content += '  <key id="type" for="node" attr.name="type" attr.type="string"/>\n';
      content += '  <key id="label" for="node" attr.name="label" attr.type="string"/>\n';
      content += '  <key id="properties" for="node" attr.name="properties" attr.type="string"/>\n';
      content += '  <key id="createdAt" for="node" attr.name="createdAt" attr.type="string"/>\n';
      content += '  <key id="updatedAt" for="node" attr.name="updatedAt" attr.type="string"/>\n';
      
      content += '  <key id="type" for="edge" attr.name="type" attr.type="string"/>\n';
      content += '  <key id="label" for="edge" attr.name="label" attr.type="string"/>\n';
      content += '  <key id="properties" for="edge" attr.name="properties" attr.type="string"/>\n';
      content += '  <key id="createdAt" for="edge" attr.name="createdAt" attr.type="string"/>\n';
      content += '  <key id="updatedAt" for="edge" attr.name="updatedAt" attr.type="string"/>\n';
      
      // 图定义
      content += '  <graph id="G" edgedefault="directed">\n';
      
      // 节点
      for (const node of Array.from(this.nodes.values())) {
        content += `    <node id="${node.id}">\n`;
        content += `      <data key="type">${node.type}</data>\n`;
        content += `      <data key="label">${node.label}</data>\n`;
        content += `      <data key="properties">${JSON.stringify(node.properties).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</data>\n`;
        content += `      <data key="createdAt">${node.createdAt.toISOString()}</data>\n`;
        content += `      <data key="updatedAt">${node.updatedAt.toISOString()}</data>\n`;
        content += '    </node>\n';
      }
      
      // 关系
      for (const relationship of Array.from(this.relationships.values())) {
        content += `    <edge id="${relationship.id}" source="${relationship.sourceNodeId}" target="${relationship.targetNodeId}">\n`;
        content += `      <data key="type">${relationship.type}</data>\n`;
        content += `      <data key="label">${relationship.label}</data>\n`;
        content += `      <data key="properties">${JSON.stringify(relationship.properties).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</data>\n`;
        content += `      <data key="createdAt">${relationship.createdAt.toISOString()}</data>\n`;
        content += `      <data key="updatedAt">${relationship.updatedAt.toISOString()}</data>\n`;
        content += '    </edge>\n';
      }
      
      // 结束标签
      content += '  </graph>\n';
      content += '</graphml>';
      
      // 写入文件
      await writeFile(filePath, content, 'utf8');
      console.info(`Exported knowledge graph to GraphML: ${filePath}`);
      return true;
    } catch (error) {
      console.error('Failed to export knowledge graph to GraphML:', error);
      return false;
    }
  }
  
  /**
   * 从JSON导入
   */
  private async importFromJson(filePath: string, mergeStrategy: 'REPLACE' | 'MERGE' | 'SKIP_DUPLICATES'): Promise<boolean> {
    const readFile = promisify(fs.readFile);
    
    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${filePath}`);
      }
      
      // 读取文件
      const data = await readFile(filePath, 'utf8');
      const { nodes, relationships } = JSON.parse(data);
      
      // 根据合并策略处理
      if (mergeStrategy === 'REPLACE') {
        // 清空当前图谱
        this.nodes.clear();
        this.relationships.clear();
      }
      
      // 导入节点
      for (const node of nodes) {
        // 转换日期字符串为Date对象
        node.createdAt = new Date(node.createdAt);
        node.updatedAt = new Date(node.updatedAt);
        
        if (mergeStrategy === 'SKIP_DUPLICATES' && this.nodes.has(node.id)) {
          continue;
        }
        
        this.nodes.set(node.id, node);
      }
      
      // 导入关系
      for (const relationship of relationships) {
        // 转换日期字符串为Date对象
        relationship.createdAt = new Date(relationship.createdAt);
        relationship.updatedAt = new Date(relationship.updatedAt);
        
        if (mergeStrategy === 'SKIP_DUPLICATES' && this.relationships.has(relationship.id)) {
          continue;
        }
        
        // 验证源节点和目标节点是否存在
        if (!this.nodes.has(relationship.sourceNodeId) || !this.nodes.has(relationship.targetNodeId)) {
          console.warn(`Skipping relationship ${relationship.id} due to missing source or target node`);
          continue;
        }
        
        this.relationships.set(relationship.id, relationship);
      }
      
      console.info(`Imported knowledge graph from JSON: ${filePath}`);
      return true;
    } catch (error) {
      console.error('Failed to import knowledge graph from JSON:', error);
      return false;
    }
  }
  
  /**
   * 从CSV导入
   */
  private async importFromCsv(dirPath: string, mergeStrategy: 'REPLACE' | 'MERGE' | 'SKIP_DUPLICATES'): Promise<boolean> {
    const readFile = promisify(fs.readFile);
    
    try {
      // 检查目录是否存在
      if (!fs.existsSync(dirPath)) {
        throw new Error(`Directory does not exist: ${dirPath}`);
      }
      
      const nodesPath = path.join(dirPath, 'nodes.csv');
      const relationshipsPath = path.join(dirPath, 'relationships.csv');
      
      // 检查文件是否存在
      if (!fs.existsSync(nodesPath) || !fs.existsSync(relationshipsPath)) {
        throw new Error(`Required CSV files not found in directory: ${dirPath}`);
      }
      
      // 根据合并策略处理
      if (mergeStrategy === 'REPLACE') {
        // 清空当前图谱
        this.nodes.clear();
        this.relationships.clear();
      }
      
      // 读取节点文件
      const nodesData = await readFile(nodesPath, 'utf8');
      const nodesLines = nodesData.split('\n');
      
      // 跳过标题行
      for (let i = 1; i < nodesLines.length; i++) {
        const line = nodesLines[i].trim();
        if (!line) continue;
        
        // 解析CSV行（简化处理，不考虑复杂CSV转义）
        const parts = line.match(/"([^"]*)"|([^,]+)/g);
        if (!parts || parts.length < 6) continue;
        
        const id = parts[0].replace(/"/g, '');
        const type = parts[1].replace(/"/g, '');
        const label = parts[2].replace(/"/g, '');
        const createdAt = new Date(parts[3].replace(/"/g, ''));
        const updatedAt = new Date(parts[4].replace(/"/g, ''));
        const properties = JSON.parse(parts[5].replace(/""/g, '"').replace(/^"|"$/g, ''));
        
        // 创建节点
        const node = {
          id,
          type,
          label,
          properties,
          createdAt,
          updatedAt
        };
        
        if (mergeStrategy === 'SKIP_DUPLICATES' && this.nodes.has(id)) {
          continue;
        }
        
        this.nodes.set(id, node);
      }
      
      // 读取关系文件
      const relationshipsData = await readFile(relationshipsPath, 'utf8');
      const relationshipsLines = relationshipsData.split('\n');
      
      // 跳过标题行
      for (let i = 1; i < relationshipsLines.length; i++) {
        const line = relationshipsLines[i].trim();
        if (!line) continue;
        
        // 解析CSV行
        const parts = line.match(/"([^"]*)"|([^,]+)/g);
        if (!parts || parts.length < 8) continue;
        
        const id = parts[0].replace(/"/g, '');
        const type = parts[1].replace(/"/g, '');
        const label = parts[2].replace(/"/g, '');
        const sourceNodeId = parts[3].replace(/"/g, '');
        const targetNodeId = parts[4].replace(/"/g, '');
        const createdAt = new Date(parts[5].replace(/"/g, ''));
        const updatedAt = new Date(parts[6].replace(/"/g, ''));
        const properties = JSON.parse(parts[7].replace(/""/g, '"').replace(/^"|"$/g, ''));
        
        // 验证源节点和目标节点是否存在
        if (!this.nodes.has(sourceNodeId) || !this.nodes.has(targetNodeId)) {
          console.warn(`Skipping relationship ${id} due to missing source or target node`);
          continue;
        }
        
        // 创建关系
        const relationship = {
          id,
          type,
          label,
          sourceNodeId,
          targetNodeId,
          properties,
          createdAt,
          updatedAt
        };
        
        if (mergeStrategy === 'SKIP_DUPLICATES' && this.relationships.has(id)) {
          continue;
        }
        
        this.relationships.set(id, relationship);
      }
      
      console.info(`Imported knowledge graph from CSV: ${dirPath}`);
      return true;
    } catch (error) {
      console.error('Failed to import knowledge graph from CSV:', error);
      return false;
    }
  }
  
  /**
   * 从GraphML导入
   */
  private async importFromGraphML(filePath: string, mergeStrategy: 'REPLACE' | 'MERGE' | 'SKIP_DUPLICATES'): Promise<boolean> {
    // 由于GraphML解析比较复杂，这里简化实现
    console.warn('GraphML import is not fully implemented. Using a simplified version.');
    
    const readFile = promisify(fs.readFile);
    
    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${filePath}`);
      }
      
      // 读取文件
      const data = await readFile(filePath, 'utf8');
      
      // 简单解析GraphML（实际应该使用XML解析库）
      const nodeRegex = /<node id="([^"]+)">[\s\S]*?<data key="type">([^<]+)<\/data>[\s\S]*?<data key="label">([^<]+)<\/data>[\s\S]*?<data key="properties">([^<]+)<\/data>[\s\S]*?<data key="createdAt">([^<]+)<\/data>[\s\S]*?<data key="updatedAt">([^<]+)<\/data>[\s\S]*?<\/node>/g;
      const edgeRegex = /<edge id="([^"]+)" source="([^"]+)" target="([^"]+)">[\s\S]*?<data key="type">([^<]+)<\/data>[\s\S]*?<data key="label">([^<]+)<\/data>[\s\S]*?<data key="properties">([^<]+)<\/data>[\s\S]*?<data key="createdAt">([^<]+)<\/data>[\s\S]*?<data key="updatedAt">([^<]+)<\/data>[\s\S]*?<\/edge>/g;
      
      // 根据合并策略处理
      if (mergeStrategy === 'REPLACE') {
        // 清空当前图谱
        this.nodes.clear();
        this.relationships.clear();
      }
      
      // 解析节点
      let nodeMatch;
      while ((nodeMatch = nodeRegex.exec(data)) !== null) {
        const id = nodeMatch[1];
        const type = nodeMatch[2];
        const label = nodeMatch[3];
        const properties = JSON.parse(nodeMatch[4].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
        const createdAt = new Date(nodeMatch[5]);
        const updatedAt = new Date(nodeMatch[6]);
        
        // 创建节点
        const node = {
          id,
          type,
          label,
          properties,
          createdAt,
          updatedAt
        };
        
        if (mergeStrategy === 'SKIP_DUPLICATES' && this.nodes.has(id)) {
          continue;
        }
        
        this.nodes.set(id, node);
      }
      
      // 解析关系
      let edgeMatch;
      while ((edgeMatch = edgeRegex.exec(data)) !== null) {
        const id = edgeMatch[1];
        const sourceNodeId = edgeMatch[2];
        const targetNodeId = edgeMatch[3];
        const type = edgeMatch[4];
        const label = edgeMatch[5];
        const properties = JSON.parse(edgeMatch[6].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
        const createdAt = new Date(edgeMatch[7]);
        const updatedAt = new Date(edgeMatch[8]);
        
        // 验证源节点和目标节点是否存在
        if (!this.nodes.has(sourceNodeId) || !this.nodes.has(targetNodeId)) {
          console.warn(`Skipping relationship ${id} due to missing source or target node`);
          continue;
        }
        
        // 创建关系
        const relationship = {
          id,
          type,
          label,
          sourceNodeId,
          targetNodeId,
          properties,
          createdAt,
          updatedAt
        };
        
        if (mergeStrategy === 'SKIP_DUPLICATES' && this.relationships.has(id)) {
          continue;
        }
        
        this.relationships.set(id, relationship);
      }
      
      console.info(`Imported knowledge graph from GraphML: ${filePath}`);
      return true;
    } catch (error) {
      console.error('Failed to import knowledge graph from GraphML:', error);
      return false;
    }
  }
}

/**
 * 全局内存知识图谱服务实例
 */
export const globalMemoryKnowledgeGraphService = new MemoryKnowledgeGraphService({
  persistToFile: process.env.MEMORY_KG_PERSIST_TO_FILE === 'true',
  persistFilePath: process.env.MEMORY_KG_PERSIST_FILE_PATH || 'data/knowledge-graph.json',
  autoSaveInterval: parseInt(process.env.MEMORY_KG_AUTO_SAVE_INTERVAL || '60000', 10),
  enableVectorSearch: process.env.MEMORY_KG_ENABLE_VECTOR_SEARCH !== 'false',
  vectorDimension: parseInt(process.env.MEMORY_KG_VECTOR_DIMENSION || '1536', 10),
  logLevel: (process.env.MEMORY_KG_LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error'
});