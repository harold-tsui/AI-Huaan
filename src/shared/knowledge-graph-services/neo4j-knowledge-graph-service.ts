/**
 * Neo4j Knowledge Graph Service - Neo4j知识图谱服务
 * 
 * 基于Neo4j图数据库的知识图谱服务实现，适用于生产环境
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
import neo4j, { Driver, Session, Record, QueryResult } from 'neo4j-driver';

/**
 * Neo4j知识图谱服务配置
 */
export interface Neo4jKnowledgeGraphServiceConfig {
  // Neo4j连接URI
  uri: string;
  // 用户名
  username: string;
  // 密码
  password: string;
  // 数据库名称（默认为neo4j）
  database?: string;
  // 是否启用向量搜索
  enableVectorSearch?: boolean;
  // 向量维度
  vectorDimension?: number;
  // 是否启用APOC插件
  enableApoc?: boolean;
  // 是否启用GDS插件
  enableGds?: boolean;
  // 连接池大小
  maxConnectionPoolSize?: number;
  // 连接获取超时（毫秒）
  connectionAcquisitionTimeout?: number;
  // 连接超时（毫秒）
  connectionTimeout?: number;
  // 最大事务重试时间（毫秒）
  maxTransactionRetryTime?: number;
  // 日志级别
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Neo4j知识图谱服务
 * 
 * 基于Neo4j图数据库的知识图谱服务实现，适用于生产环境
 */
export class Neo4jKnowledgeGraphService extends BaseKnowledgeGraphService {
  private driver: Driver | null = null;
  private neo4jConfig: Neo4jKnowledgeGraphServiceConfig;
  private database: string;
  //protected initialized: boolean = false;
  
  /**
   * 构造函数
   * @param config Neo4j配置
   */
  constructor(config: Neo4jKnowledgeGraphServiceConfig) {
    if (!config) {
      throw new Error('Neo4jKnowledgeGraphServiceConfig is required');
    }
    
    super({
      serviceName: 'Neo4jKnowledgeGraphService',
      enableVectorSearch: config.enableVectorSearch !== undefined ? config.enableVectorSearch : true,
      vectorDimension: config.vectorDimension || 1536,
      logLevel: config.logLevel || 'info'
    });
    
    this.neo4jConfig = config;
    this.database = config.database || 'neo4j';
  }
  
  /**
   * 初始化实现
   */
  protected async initializeImplementation(): Promise<void> {
    try {
      // 创建Neo4j驱动
      if (!this.neo4jConfig.uri || !this.neo4jConfig.username || !this.neo4jConfig.password) {
        throw new Error('Neo4j configuration is incomplete: uri, username, and password are required');
      }
      
      this.driver = neo4j.driver(
        this.neo4jConfig.uri,
        neo4j.auth.basic(this.neo4jConfig.username, this.neo4jConfig.password),
        {
          maxConnectionPoolSize: this.neo4jConfig.maxConnectionPoolSize,
          connectionAcquisitionTimeout: this.neo4jConfig.connectionAcquisitionTimeout,
          connectionTimeout: this.neo4jConfig.connectionTimeout,
          maxTransactionRetryTime: this.neo4jConfig.maxTransactionRetryTime,
        }
      );
      
      // 验证连接
      await this.driver.verifyConnectivity();
      
      // 创建约束和索引
      await this.setupConstraintsAndIndexes();
      
      this.initialized = true;
      console.info(`Connected to Neo4j database at ${this.neo4jConfig.uri}`);
    } catch (error) {
      console.error('Failed to initialize Neo4j knowledge graph service:', error instanceof Error ? error : String(error));
      throw error;
    }
  }
  
  /**
   * 关闭实现
   */
  protected async shutdownImplementation(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
      this.initialized = false;
      console.info('Neo4j knowledge graph service shut down');
    }
  }
  
  /**
   * 创建节点实现
   */
  protected async createNodeImplementation(node: Node): Promise<Node> {
    this.ensureInitialized();
    
    const session = this.getSession();
    try {
      const result = await session.executeWrite(async (tx) => {
        // 准备属性，包括向量
        const properties = { ...node.properties };
        if (node.vector) {
          properties.vector = node.vector;
        }
        
        // 创建节点的Cypher查询
        const query = `
          CREATE (n:${node.type} {id: $id, label: $label, properties: $properties, createdAt: datetime(), updatedAt: datetime()})
          RETURN n
        `;
        
        const params = {
          id: node.id,
          label: node.label,
          properties: properties
        };
        
        const result = await tx.run(query, params);
        return result.records[0].get('n');
      });
      
      // 转换Neo4j节点为应用节点
      return this.convertNeo4jNodeToNode(result);
    } finally {
      await session.close();
    }
  }
  
  /**
   * 批量创建节点实现
   */
  protected async createNodesImplementation(nodes: Node[]): Promise<Node[]> {
    if (nodes.length === 0) {
      return [];
    }
    
    this.ensureInitialized();
    
    const session = this.getSession();
    try {
      const result = await session.executeWrite(async (tx) => {
        // 构建批量创建节点的Cypher查询
        const nodeParams = nodes.map((node, index) => {
          // 准备属性，包括向量
          const properties = { ...node.properties };
          if (node.vector) {
            properties.vector = node.vector;
          }
          
          return {
            id: node.id,
            type: node.type,
            label: node.label,
            properties: properties,
            index: index
          };
        });
        
        // 使用UNWIND进行批量创建
        const query = `
          UNWIND $nodes AS node
          CREATE (n:${nodeParams[0].type} {id: node.id, label: node.label, properties: node.properties, createdAt: datetime(), updatedAt: datetime()})
          RETURN n, node.index AS index
        `;
        
        const result = await tx.run(query, { nodes: nodeParams });
        
        // 按原始顺序排序结果
        const resultMap = new Map<number, Record>();
        result.records.forEach(record => {
          const index = record.get('index');
          resultMap.set(index, record);
        });
        
        return Array.from({ length: nodes.length }, (_, i) => resultMap.get(i)!.get('n'));
      });
      
      // 转换Neo4j节点为应用节点
      return result.map(this.convertNeo4jNodeToNode.bind(this));
    } finally {
      await session.close();
    }
  }
  
  /**
   * 获取节点实现
   */
  protected async getNodeImplementation(id: string): Promise<Node | null> {
    this.ensureInitialized();
    
    const session = this.getSession();
    try {
      const result = await session.executeRead(async (tx) => {
        const query = `
          MATCH (n {id: $id})
          RETURN n
        `;
        
        const result = await tx.run(query, { id });
        return result.records.length > 0 ? result.records[0].get('n') : null;
      });
      
      if (!result) {
        return null;
      }
      
      // 转换Neo4j节点为应用节点
      return this.convertNeo4jNodeToNode(result);
    } finally {
      await session.close();
    }
  }
  
  /**
   * 更新节点实现
   */
  protected async updateNodeImplementation(id: string, node: Node): Promise<Node | null> {
    this.ensureInitialized();
    
    const session = this.getSession();
    try {
      const result = await session.executeWrite(async (tx) => {
        // 准备属性，包括向量
        const properties = { ...node.properties };
        if (node.vector) {
          properties.vector = node.vector;
        }
        
        // 更新节点的Cypher查询
        const query = `
          MATCH (n {id: $id})
          SET n.label = $label,
              n.properties = $properties,
              n.updatedAt = datetime()
          RETURN n
        `;
        
        const params = {
          id,
          label: node.label,
          properties: properties
        };
        
        const result = await tx.run(query, params);
        return result.records.length > 0 ? result.records[0].get('n') : null;
      });
      
      if (!result) {
        return null;
      }
      
      // 转换Neo4j节点为应用节点
      return this.convertNeo4jNodeToNode(result);
    } finally {
      await session.close();
    }
  }
  
  /**
   * 删除节点实现
   */
  protected async deleteNodeImplementation(id: string): Promise<boolean> {
    this.ensureInitialized();
    
    const session = this.getSession();
    try {
      const result = await session.executeWrite(async (tx) => {
        // 删除节点及其关系的Cypher查询
        const query = `
          MATCH (n {id: $id})
          DETACH DELETE n
          RETURN count(n) AS count
        `;
        
        const result = await tx.run(query, { id });
        return result.records[0].get('count').toNumber() > 0;
      });
      
      return result;
    } finally {
      await session.close();
    }
  }
  
  /**
   * 查询节点实现
   */
  protected async queryNodesImplementation(options: NodeQueryOptions): Promise<Node[]> {
    this.ensureInitialized();
    
    const session = this.getSession();
    try {
      const result = await session.executeRead(async (tx) => {
        // 构建查询条件
        const conditions: string[] = [];
        const params: { [key: string]: any } = {};
        
        // 按类型过滤
        if (options.types && options.types.length > 0) {
          conditions.push(`n:${options.types.join(' OR n:')}`); // 使用标签过滤
        }
        
        // 按标签过滤
        if (options.labels && options.labels.length > 0) {
          conditions.push('n.label IN $labels');
          params.labels = options.labels;
        }
        
        // 按属性过滤
        if (options.properties) {
          Object.entries(options.properties).forEach(([key, value], index) => {
            conditions.push(`n.properties.${key} = $prop${index}`);
            params[`prop${index}`] = value;
          });
        }
        
        // 构建WHERE子句
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        
        // 构建ORDER BY子句
        let orderByClause = '';
        if (options.orderBy) {
          const direction = options.orderDirection === 'DESC' ? 'DESC' : 'ASC';
          
          // 特殊字段处理
          if (options.orderBy === 'createdAt' || options.orderBy === 'updatedAt') {
            orderByClause = `ORDER BY n.${options.orderBy} ${direction}`;
          } else if (options.orderBy === 'id' || options.orderBy === 'type' || options.orderBy === 'label') {
            orderByClause = `ORDER BY n.${options.orderBy} ${direction}`;
          } else {
            // 属性字段
            orderByClause = `ORDER BY n.properties.${options.orderBy} ${direction}`;
          }
        }
        
        // 构建SKIP和LIMIT子句
        const skipClause = options.offset !== undefined ? `SKIP ${options.offset}` : '';
        const limitClause = options.limit !== undefined ? `LIMIT ${options.limit}` : '';
        
        // 完整查询
        const query = `
          MATCH (n)
          ${whereClause}
          RETURN n
          ${orderByClause}
          ${skipClause}
          ${limitClause}
        `;
        
        const result = await tx.run(query, params);
        return result.records.map(record => record.get('n'));
      });
      
      // 转换Neo4j节点为应用节点
      return result.map(this.convertNeo4jNodeToNode.bind(this));
    } finally {
      await session.close();
    }
  }
  
  /**
   * 创建关系实现
   */
  protected async createRelationshipImplementation(relationship: Relationship): Promise<Relationship> {
    this.ensureInitialized();
    
    const session = this.getSession();
    try {
      const result = await session.executeWrite(async (tx) => {
        // 创建关系的Cypher查询
        const query = `
          MATCH (source {id: $sourceNodeId})
          MATCH (target {id: $targetNodeId})
          CREATE (source)-[r:${relationship.type} {id: $id, label: $label, properties: $properties, createdAt: datetime(), updatedAt: datetime()}]->(target)
          RETURN r, source, target
        `;
        
        const params = {
          id: relationship.id,
          sourceNodeId: relationship.sourceNodeId,
          targetNodeId: relationship.targetNodeId,
          label: relationship.label,
          properties: relationship.properties
        };
        
        const result = await tx.run(query, params);
        return result.records[0];
      });
      
      // 转换Neo4j关系为应用关系
      return this.convertNeo4jRelationshipToRelationship(result);
    } finally {
      await session.close();
    }
  }
  
  /**
   * 批量创建关系实现
   */
  protected async createRelationshipsImplementation(relationships: Relationship[]): Promise<Relationship[]> {
    if (relationships.length === 0) {
      return [];
    }
    
    this.ensureInitialized();
    
    const session = this.getSession();
    try {
      const result = await session.executeWrite(async (tx) => {
        // 构建批量创建关系的Cypher查询
        const relParams = relationships.map((rel, index) => ({
          id: rel.id,
          type: rel.type,
          label: rel.label,
          sourceNodeId: rel.sourceNodeId,
          targetNodeId: rel.targetNodeId,
          properties: rel.properties,
          index: index
        }));
        
        // 使用UNWIND进行批量创建
        const query = `
          UNWIND $relationships AS rel
          MATCH (source {id: rel.sourceNodeId})
          MATCH (target {id: rel.targetNodeId})
          CREATE (source)-[r:${relParams[0].type} {id: rel.id, label: rel.label, properties: rel.properties, createdAt: datetime(), updatedAt: datetime()}]->(target)
          RETURN r, source, target, rel.index AS index
        `;
        
        const result = await tx.run(query, { relationships: relParams });
        
        // 按原始顺序排序结果
        const resultMap = new Map<number, Record>();
        result.records.forEach(record => {
          const index = record.get('index');
          resultMap.set(index, record);
        });
        
        return Array.from({ length: relationships.length }, (_, i) => resultMap.get(i)!);
      });
      
      // 转换Neo4j关系为应用关系
      return result.map(this.convertNeo4jRelationshipToRelationship.bind(this));
    } finally {
      await session.close();
    }
  }
  
  /**
   * 获取关系实现
   */
  protected async getRelationshipImplementation(id: string): Promise<Relationship | null> {
    this.ensureInitialized();
    
    const session = this.getSession();
    try {
      const result = await session.executeRead(async (tx) => {
        const query = `
          MATCH (source)-[r {id: $id}]->(target)
          RETURN r, source, target
        `;
        
        const result = await tx.run(query, { id });
        return result.records.length > 0 ? result.records[0] : null;
      });
      
      if (!result) {
        return null;
      }
      
      // 转换Neo4j关系为应用关系
      return this.convertNeo4jRelationshipToRelationship(result);
    } finally {
      await session.close();
    }
  }
  
  /**
   * 更新关系实现
   */
  protected async updateRelationshipImplementation(id: string, relationship: Relationship): Promise<Relationship | null> {
    this.ensureInitialized();
    
    const session = this.getSession();
    try {
      const result = await session.executeWrite(async (tx) => {
        // 更新关系的Cypher查询
        const query = `
          MATCH (source)-[r {id: $id}]->(target)
          SET r.label = $label,
              r.properties = $properties,
              r.updatedAt = datetime()
          RETURN r, source, target
        `;
        
        const params = {
          id,
          label: relationship.label,
          properties: relationship.properties
        };
        
        const result = await tx.run(query, params);
        return result.records.length > 0 ? result.records[0] : null;
      });
      
      if (!result) {
        return null;
      }
      
      // 转换Neo4j关系为应用关系
      return this.convertNeo4jRelationshipToRelationship(result);
    } finally {
      await session.close();
    }
  }
  
  /**
   * 删除关系实现
   */
  protected async deleteRelationshipImplementation(id: string): Promise<boolean> {
    this.ensureInitialized();
    
    const session = this.getSession();
    try {
      const result = await session.executeWrite(async (tx) => {
        // 删除关系的Cypher查询
        const query = `
          MATCH ()-[r {id: $id}]-()
          DELETE r
          RETURN count(r) AS count
        `;
        
        const result = await tx.run(query, { id });
        return result.records[0].get('count').toNumber() > 0;
      });
      
      return result;
    } finally {
      await session.close();
    }
  }
  
  /**
   * 查询关系实现
   */
  protected async queryRelationshipsImplementation(options: RelationshipQueryOptions): Promise<Relationship[]> {
    this.ensureInitialized();
    
    const session = this.getSession();
    try {
      const result = await session.executeRead(async (tx) => {
        // 构建查询条件
        const conditions: string[] = [];
        const params: { [key: string]: any } = {};
        
        // 按类型过滤
        if (options.types && options.types.length > 0) {
          conditions.push(`type(r) IN $types`);
          params.types = options.types;
        }
        
        // 按标签过滤
        if (options.labels && options.labels.length > 0) {
          conditions.push('r.label IN $labels');
          params.labels = options.labels;
        }
        
        // 按源节点ID过滤
        if (options.sourceNodeIds && options.sourceNodeIds.length > 0) {
          conditions.push('source.id IN $sourceNodeIds');
          params.sourceNodeIds = options.sourceNodeIds;
        }
        
        // 按目标节点ID过滤
        if (options.targetNodeIds && options.targetNodeIds.length > 0) {
          conditions.push('target.id IN $targetNodeIds');
          params.targetNodeIds = options.targetNodeIds;
        }
        
        // 按属性过滤
        if (options.properties) {
          Object.entries(options.properties).forEach(([key, value], index) => {
            conditions.push(`r.properties.${key} = $prop${index}`);
            params[`prop${index}`] = value;
          });
        }
        
        // 构建WHERE子句
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        
        // 构建ORDER BY子句
        let orderByClause = '';
        if (options.orderBy) {
          const direction = options.orderDirection === 'DESC' ? 'DESC' : 'ASC';
          
          // 特殊字段处理
          if (options.orderBy === 'createdAt' || options.orderBy === 'updatedAt') {
            orderByClause = `ORDER BY r.${options.orderBy} ${direction}`;
          } else if (['id', 'type', 'label', 'sourceNodeId', 'targetNodeId'].includes(options.orderBy)) {
            orderByClause = `ORDER BY type(r) ${direction}`;
          } else if (options.orderBy === 'sourceNodeId') {
            orderByClause = `ORDER BY source.id ${direction}`;
          } else if (options.orderBy === 'targetNodeId') {
            orderByClause = `ORDER BY target.id ${direction}`;
          } else {
            orderByClause = `ORDER BY r.${options.orderBy} ${direction}`;
          }
        }
        
        // 构建SKIP和LIMIT子句
        const skipClause = options.offset !== undefined ? `SKIP ${options.offset}` : '';
        const limitClause = options.limit !== undefined ? `LIMIT ${options.limit}` : '';
        
        // 完整查询
        const query = `
          MATCH (source)-[r]->(target)
          ${whereClause}
          RETURN r, source, target
          ${orderByClause}
          ${skipClause}
          ${limitClause}
        `;
        
        const result = await tx.run(query, params);
        return result.records;
      });
      
      // 转换Neo4j关系为应用关系
      return result.map(this.convertNeo4jRelationshipToRelationship.bind(this));
    } finally {
      await session.close();
    }
  }
  
  /**
   * 向量搜索实现
   */
  protected async vectorSearchImplementation(options: VectorSearchOptions): Promise<VectorSearchResult[]> {
    if (!this.config.enableVectorSearch) {
      throw new Error('Vector search is not enabled for this service');
    }
    
    this.ensureInitialized();
    
    const session = this.getSession();
    try {
      const result = await session.executeRead(async (tx) => {
        // 构建查询条件
        let nodeTypeFilter = '';
        if (options.nodeTypes && options.nodeTypes.length > 0) {
          nodeTypeFilter = `WHERE n:${options.nodeTypes.join(' OR n:')}`;
        }
        
        // 使用向量相似度计算
        // 注意：这里假设Neo4j已安装APOC插件，并且节点的vector属性存储在properties.vector中
        const query = `
          MATCH (n)
          ${nodeTypeFilter}
          WHERE n.properties.vector IS NOT NULL
          WITH n, apoc.algo.cosineSimilarity(n.properties.vector, $vector) AS similarity
          ${options.minSimilarity !== undefined ? `WHERE similarity >= ${options.minSimilarity}` : ''}
          RETURN n, similarity
          ORDER BY similarity DESC
          ${options.limit !== undefined ? `LIMIT ${options.limit}` : ''}
        `;
        
        const result = await tx.run(query, { vector: options.vector });
        return result.records;
      });
      
      // 转换结果
      return result.map(record => ({
        node: this.convertNeo4jNodeToNode(record.get('n')),
        similarity: record.get('similarity')
      }));
    } finally {
      await session.close();
    }
  }
  
  /**
   * 图遍历实现
   */
  protected async traverseGraphImplementation(options: GraphTraversalOptions): Promise<GraphTraversalResult> {
    this.ensureInitialized();
    
    const session = this.getSession();
    try {
      const result = await session.executeRead(async (tx) => {
        // 构建关系类型过滤
        let relTypeFilter = '';
        if (options.relationshipTypes && options.relationshipTypes.length > 0) {
          relTypeFilter = `WHERE type(r) IN $relationshipTypes`;
        }
        
        // 构建节点类型过滤
        let nodeTypeFilter = '';
        if (options.nodeTypes && options.nodeTypes.length > 0) {
          const nodeTypes = options.nodeTypes.map(type => `:${type}`).join(' OR ');
          nodeTypeFilter = `AND (end${nodeTypes})`;
        }
        
        // 构建方向过滤
        let directionFilter = '';
        if (options.direction === 'OUTGOING') {
          directionFilter = '-[r]->';
        } else if (options.direction === 'INCOMING') {
          directionFilter = '<-[r]-';
        } else {
          directionFilter = '-[r]-';
        }
        
        // 使用Neo4j的路径查找功能
        const query = `
          MATCH path = (start {id: $startNodeId})${directionFilter}(end)
          ${relTypeFilter}
          ${nodeTypeFilter}
          WHERE length(path) <= $maxDepth
          RETURN path
          LIMIT $limit
        `;
        
        const params = {
          startNodeId: options.startNodeId,
          relationshipTypes: options.relationshipTypes || [],
          maxDepth: options.maxDepth !== undefined ? options.maxDepth : 3,
          limit: options.limit !== undefined ? options.limit : 100
        };
        
        const result = await tx.run(query, params);
        return result.records;
      });
      
      // 处理结果
      const nodes = new Map<string, Node>();
      const relationships = new Map<string, Relationship>();
      const paths: GraphPath[] = [];
      
      // 处理每条路径
      for (const record of result) {
        const path = record.get('path');
        const pathSegments = path.segments;
        
        // 创建路径对象
        const graphPath: GraphPath = {
          nodes: [],
          relationships: [],
          length: pathSegments.length
        };
        
        // 添加起始节点
        const startNode = this.convertNeo4jNodeToNode(path.start);
        nodes.set(startNode.id, startNode);
        graphPath.nodes.push(startNode);
        
        // 处理路径段
        for (const segment of pathSegments) {
          // 添加关系
          const relationship = this.convertNeo4jRelationshipToRelationship({
            get: (key: string) => {
              if (key === 'r') return segment.relationship;
              if (key === 'source') return segment.start;
              if (key === 'target') return segment.end;
              return null;
            }
          } as Record);
          
          relationships.set(relationship.id, relationship);
          graphPath.relationships.push(relationship);
          
          // 添加目标节点
          const endNode = this.convertNeo4jNodeToNode(segment.end);
          if (!nodes.has(endNode.id)) {
            nodes.set(endNode.id, endNode);
          }
          graphPath.nodes.push(endNode);
        }
        
        paths.push(graphPath);
      }
      
      return {
        nodes: Array.from(nodes.values()),
        relationships: Array.from(relationships.values()),
        paths
      };
    } finally {
      await session.close();
    }
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
    this.ensureInitialized();
    
    // 如果起始节点和结束节点相同，返回只包含该节点的路径
    if (startNodeId === endNodeId) {
      const node = await this.getNode(startNodeId);
      if (!node) {
        throw new Error(`Node with ID ${startNodeId} does not exist`);
      }
      
      return {
        nodes: [node],
        relationships: [],
        length: 0
      };
    }
    
    const session = this.getSession();
    try {
      const result = await session.executeRead(async (tx) => {
        // 构建关系类型过滤
        let relTypeFilter = '';
        if (relationshipTypes && relationshipTypes.length > 0) {
          relTypeFilter = `WHERE type(r) IN $relationshipTypes`;
        }
        
        // 使用Neo4j的最短路径算法
        const query = `
          MATCH (start {id: $startNodeId}), (end {id: $endNodeId})
          CALL apoc.algo.dijkstra(start, end, 'r', 'cost', $maxDepth) YIELD path, weight
          ${relTypeFilter}
          RETURN path
          LIMIT 1
        `;
        
        const params = {
          startNodeId,
          endNodeId,
          relationshipTypes: relationshipTypes || [],
          maxDepth
        };
        
        try {
          const result = await tx.run(query, params);
          return result.records.length > 0 ? result.records[0] : null;
        } catch (error) {
          // 如果APOC不可用，回退到标准最短路径
          console.warn('APOC not available, falling back to standard shortest path:', error);
          
          const fallbackQuery = `
            MATCH (start {id: $startNodeId}), (end {id: $endNodeId})
            MATCH path = shortestPath((start)-[r*..${maxDepth}]-(end))
            ${relTypeFilter}
            RETURN path
            LIMIT 1
          `;
          
          const result = await tx.run(fallbackQuery, params);
          return result.records.length > 0 ? result.records[0] : null;
        }
      });
      
      if (!result) {
        return null;
      }
      
      // 处理结果
      const path = result.get('path');
      const pathSegments = path.segments;
      
      // 创建路径对象
      const graphPath: GraphPath = {
        nodes: [],
        relationships: [],
        length: pathSegments.length
      };
      
      // 添加起始节点
      const startNode = this.convertNeo4jNodeToNode(path.start);
      graphPath.nodes.push(startNode);
      
      // 处理路径段
      for (const segment of pathSegments) {
        // 添加关系
        const relationship = this.convertNeo4jRelationshipToRelationship({
          get: (key: string) => {
            if (key === 'r') return segment.relationship;
            if (key === 'source') return segment.start;
            if (key === 'target') return segment.end;
            return null;
          }
        } as Record);
        
        graphPath.relationships.push(relationship);
        
        // 添加目标节点
        const endNode = this.convertNeo4jNodeToNode(segment.end);
        graphPath.nodes.push(endNode);
      }
      
      return graphPath;
    } finally {
      await session.close();
    }
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
    this.ensureInitialized();
    
    // 如果起始节点和结束节点相同，返回只包含该节点的路径
    if (startNodeId === endNodeId) {
      const node = await this.getNode(startNodeId);
      if (!node) {
        throw new Error(`Node with ID ${startNodeId} does not exist`);
      }
      
      return [{
        nodes: [node],
        relationships: [],
        length: 0
      }];
    }
    
    const session = this.getSession();
    try {
      const result = await session.executeRead(async (tx) => {
        // 构建关系类型过滤
        let relTypeFilter = '';
        if (relationshipTypes && relationshipTypes.length > 0) {
          relTypeFilter = `WHERE type(r) IN $relationshipTypes`;
        }
        
        // 使用Neo4j的路径查找算法
        const query = `
          MATCH (start {id: $startNodeId}), (end {id: $endNodeId})
          MATCH path = (start)-[r*..${maxDepth}]-(end)
          ${relTypeFilter}
          RETURN path
          ORDER BY length(path)
        `;
        
        const params = {
          startNodeId,
          endNodeId,
          relationshipTypes: relationshipTypes || []
        };
        
        const result = await tx.run(query, params);
        return result.records;
      });
      
      // 处理结果
      const paths: GraphPath[] = [];
      
      // 处理每条路径
      for (const record of result) {
        const path = record.get('path');
        const pathSegments = path.segments;
        
        // 创建路径对象
        const graphPath: GraphPath = {
          nodes: [],
          relationships: [],
          length: pathSegments.length
        };
        
        // 添加起始节点
        const startNode = this.convertNeo4jNodeToNode(path.start);
        graphPath.nodes.push(startNode);
        
        // 处理路径段
        for (const segment of pathSegments) {
          // 添加关系
          const relationship = this.convertNeo4jRelationshipToRelationship({
            get: (key: string) => {
              if (key === 'r') return segment.relationship;
              if (key === 'source') return segment.start;
              if (key === 'target') return segment.end;
              return null;
            }
          } as Record);
          
          graphPath.relationships.push(relationship);
          
          // 添加目标节点
          const endNode = this.convertNeo4jNodeToNode(segment.end);
          graphPath.nodes.push(endNode);
        }
        
        paths.push(graphPath);
      }
      
      return paths;
    } finally {
      await session.close();
    }
  }
  
  /**
   * 获取图谱统计信息实现
   */
  protected async getGraphStatsImplementation(): Promise<GraphStats> {
    this.ensureInitialized();
    
    const session = this.getSession();
    try {
      const result = await session.executeRead(async (tx) => {
        // 获取节点和关系统计信息
        const query = `
          MATCH (n)
          WITH count(n) AS nodeCount
          MATCH ()-[r]-()
          WITH nodeCount, count(r) AS relationshipCount
          RETURN nodeCount, relationshipCount
        `;
        
        const statsResult = await tx.run(query);
        const nodeCount = statsResult.records[0].get('nodeCount').toNumber();
        const relationshipCount = statsResult.records[0].get('relationshipCount').toNumber();
        
        // 获取节点类型统计
        const nodeTypesQuery = `
          CALL db.labels() YIELD label
          MATCH (n:${`label`})
          RETURN label, count(n) AS count
        `;
        
        const nodeTypesResult = await tx.run(nodeTypesQuery);
        const nodeTypeCounts: { [key: string]: number } = {};
        nodeTypesResult.records.forEach(record => {
          nodeTypeCounts[record.get('label')] = record.get('count').toNumber();
        });
        
        // 获取关系类型统计
        const relTypesQuery = `
          CALL db.relationshipTypes() YIELD relationshipType
          MATCH ()-[r:${`relationshipType`}]-()
          RETURN relationshipType, count(r) AS count
        `;
        
        const relTypesResult = await tx.run(relTypesQuery);
        const relationshipTypeCounts: { [key: string]: number } = {};
        relTypesResult.records.forEach(record => {
          relationshipTypeCounts[record.get('relationshipType')] = record.get('count').toNumber();
        });
        
        return {
          nodeCount,
          relationshipCount,
          nodeTypeCounts,
          relationshipTypeCounts
        };
      });
      
      return result;
    } finally {
      await session.close();
    }
  }
  
  /**
   * 清空图谱实现
   */
  protected async clearGraphImplementation(): Promise<boolean> {
    this.ensureInitialized();
    
    const session = this.getSession();
    try {
      await session.executeWrite(async (tx) => {
        // 删除所有节点和关系
        const query = `
          MATCH (n)
          DETACH DELETE n
        `;
        
        await tx.run(query);
      });
      
      return true;
    } catch (error) {
      console.error('Failed to clear graph:', error);
      return false;
    } finally {
      await session.close();
    }
  }
  
  /**
   * 导出图谱实现
   */
  protected async exportGraphImplementation(format: 'JSON' | 'CSV' | 'GRAPHML', path: string): Promise<boolean> {
    this.ensureInitialized();
    
    try {
      // 获取所有节点和关系
      const nodes = await this.queryNodes({});
      const relationships = await this.queryRelationships({});
      
      // 根据格式导出
      switch (format) {
        case 'JSON':
          return this.exportToJson(path, nodes, relationships);
        case 'CSV':
          return this.exportToCsv(path, nodes, relationships);
        case 'GRAPHML':
          return this.exportToGraphML(path, nodes, relationships);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error(`Failed to export graph to ${format}:`, error);
      return false;
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
    this.ensureInitialized();
    
    try {
      // 如果是替换策略，先清空图谱
      if (mergeStrategy === 'REPLACE') {
        await this.clearGraph(true);
      }
      
      // 根据格式导入
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
    } catch (error) {
      console.error(`Failed to import graph from ${format}:`, error);
      return false;
    }
  }
  
  /**
   * 设置约束和索引
   */
  private async setupConstraintsAndIndexes(): Promise<void> {
    const session = this.getSession();
    try {
      await session.executeWrite(async (tx) => {
        // 创建唯一约束
        try {
          await tx.run('CREATE CONSTRAINT node_id_unique IF NOT EXISTS FOR (n) REQUIRE n.id IS UNIQUE');
        } catch (error) {
          // 兼容旧版Neo4j
          console.warn('Failed to create constraint with new syntax, trying legacy syntax:', error);
          try {
            await tx.run('CREATE CONSTRAINT ON (n) ASSERT n.id IS UNIQUE');
          } catch (legacyError) {
            console.error('Failed to create constraint with legacy syntax:', legacyError);
          }
        }
        
        // 创建索引
        try {
          await tx.run('CREATE INDEX node_type_index IF NOT EXISTS FOR (n) ON (n:type)');
          await tx.run('CREATE INDEX node_label_index IF NOT EXISTS FOR (n) ON (n.label)');
          await tx.run('CREATE INDEX relationship_id_index IF NOT EXISTS FOR ()-[r]-() ON (r.id)');
          await tx.run('CREATE INDEX relationship_type_index IF NOT EXISTS FOR ()-[r]-() ON (type(r))');
        } catch (error) {
          // 兼容旧版Neo4j
          console.warn('Failed to create indexes with new syntax, trying legacy syntax:', error);
          try {
            await tx.run('CREATE INDEX ON :type(id)');
            await tx.run('CREATE INDEX ON :type(label)');
          } catch (legacyError) {
            console.error('Failed to create indexes with legacy syntax:', legacyError);
          }
        }
      });
    } finally {
      await session.close();
    }
  }
  
  /**
   * 获取会话
   */
  private getSession(): Session {
    if (!this.driver) {
      throw new Error('Neo4j driver is not initialized');
    }
    
    return this.driver.session({
      database: this.database
    });
  }
  
  /**
   * 确保服务已初始化
   */
  protected ensureInitialized(): void {
    if (!this.initialized || !this.driver) {
      throw new Error('Neo4j knowledge graph service is not initialized');
    }
  }
  
  /**
   * 转换Neo4j节点为应用节点
   */
  private convertNeo4jNodeToNode(neo4jNode: { [key: string]: unknown }): Node {
    const neo4jNodeProps = (neo4jNode as any).properties as { [key: string]: any };
    const properties = neo4jNodeProps.properties || {};
    const vector = properties.vector;
    
    // 如果向量存在，从属性中移除
    if (vector) {
      delete properties.vector;
    }
    
    return {
      id: neo4jNodeProps.id,
      type: Array.from((neo4jNode as any).labels)[0] as string, // 使用第一个标签作为类型
      label: neo4jNodeProps.label,
      properties: properties,
      vector: vector,
      createdAt: neo4jNodeProps.createdAt ? new Date(neo4jNodeProps.createdAt.toString() as string) : new Date(),
            updatedAt: neo4jNodeProps.updatedAt ? new Date(neo4jNodeProps.updatedAt.toString() as string) : new Date()
    };
  }
  
  /**
   * 转换Neo4j关系为应用关系
   */
  private convertNeo4jRelationshipToRelationship(record: { [key: string]: any }): Relationship {
    const neo4jRel = record.get('r') as { [key: string]: any };
    const sourceNode = record.get('source') as { [key: string]: any };
    const targetNode = record.get('target') as { [key: string]: any };
    
    const neo4jRelProps = neo4jRel.properties as { [key: string]: any };
    const sourceNodeProps = sourceNode.properties as { [key: string]: any };
    const targetNodeProps = targetNode.properties as { [key: string]: any };
    
    return {
      id: neo4jRelProps.id,
      type: neo4jRel.type as RelationshipType,
      label: neo4jRelProps.label,
      sourceNodeId: sourceNodeProps.id,
      targetNodeId: targetNodeProps.id,
      properties: neo4jRelProps.properties || {},
      createdAt: neo4jRelProps.createdAt ? new Date(neo4jRelProps.createdAt.toString() as string) : new Date(),
            updatedAt: neo4jRelProps.updatedAt ? new Date(neo4jRelProps.updatedAt.toString() as string) : new Date()
    };
  }
  
  /**
   * 导出为JSON格式
   */
  private async exportToJson(filePath: string, nodes: Node[], relationships: Relationship[]): Promise<boolean> {
    const fs = require('fs');
    const path = require('path');
    const { promisify } = require('util');
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
        nodes,
        relationships
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
  private async exportToCsv(dirPath: string, nodes: Node[], relationships: Relationship[]): Promise<boolean> {
    const fs = require('fs');
    const path = require('path');
    const { promisify } = require('util');
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
      
      for (const node of nodes) {
        nodesContent += `"${node.id}","${node.type}","${node.label}","${node.createdAt.toISOString()}","${node.updatedAt.toISOString()}","${JSON.stringify(node.properties).replace(/"/g, '""')}"\n`;
      }
      
      await writeFile(nodesPath, nodesContent, 'utf8');
      
      // 导出关系
      const relationshipsPath = path.join(dirPath, 'relationships.csv');
      let relationshipsContent = 'id,type,label,sourceNodeId,targetNodeId,createdAt,updatedAt,properties\n';
      
      for (const relationship of relationships) {
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
  private async exportToGraphML(filePath: string, nodes: Node[], relationships: Relationship[]): Promise<boolean> {
    const fs = require('fs');
    const path = require('path');
    const { promisify } = require('util');
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
      for (const node of nodes) {
        content += `    <node id="${node.id}">\n`;
        content += `      <data key="type">${node.type}</data>\n`;
        content += `      <data key="label">${node.label}</data>\n`;
        content += `      <data key="properties">${JSON.stringify(node.properties).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</data>\n`;
        content += `      <data key="createdAt">${node.createdAt.toISOString()}</data>\n`;
        content += `      <data key="updatedAt">${node.updatedAt.toISOString()}</data>\n`;
        content += '    </node>\n';
      }
      
      // 关系
      for (const relationship of relationships) {
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
    const fs = require('fs');
    const { promisify } = require('util');
    const readFile = promisify(fs.readFile);
    
    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${filePath}`);
      }
      
      // 读取文件
      const data = await readFile(filePath, 'utf8');
      const { nodes, relationships } = JSON.parse(data as string);
      
      // 导入节点
      for (const node of nodes) {
        // 转换日期字符串为Date对象
        node.createdAt = new Date(node.createdAt as string | number);
        node.updatedAt = new Date(node.updatedAt as string | number);
        
        // 根据合并策略处理
        if (mergeStrategy === 'SKIP_DUPLICATES') {
          // 检查节点是否存在
          const existingNode = await this.getNode(node.id);
          if (existingNode) {
            continue;
          }
        }
        
        // 创建或更新节点
        if (mergeStrategy === 'MERGE') {
          const existingNode = await this.getNode(node.id);
          if (existingNode) {
            await this.updateNode(node.id, node);
          } else {
            await this.createNode(node);
          }
        } else {
          await this.createNode(node);
        }
      }
      
      // 导入关系
      for (const relationship of relationships) {
        // 转换日期字符串为Date对象
        relationship.createdAt = new Date(relationship.createdAt as string | number);
        relationship.updatedAt = new Date(relationship.updatedAt as string | number);
        
        // 根据合并策略处理
        if (mergeStrategy === 'SKIP_DUPLICATES') {
          // 检查关系是否存在
          const existingRelationship = await this.getRelationship(relationship.id);
          if (existingRelationship) {
            continue;
          }
        }
        
        // 创建或更新关系
        if (mergeStrategy === 'MERGE') {
          const existingRelationship = await this.getRelationship(relationship.id);
          if (existingRelationship) {
            await this.updateRelationship(relationship.id, relationship);
          } else {
            await this.createRelationship(relationship);
          }
        } else {
          await this.createRelationship(relationship);
        }
      }
      
      console.info(`Imported knowledge graph from JSON: ${filePath}`);
      return true;
    } catch (error) {
      console.error('Failed to import knowledge graph from JSON:', error);
      return false;
    }
  }
  
  /**
   * 解析CSV行
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // 处理双引号转义 ("") -> ")
          currentValue += '"';
          i++; // 跳过下一个引号
        } else {
          // 切换引号状态
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // 字段分隔符，添加当前值并重置
        result.push(currentValue);
        currentValue = '';
      } else {
        // 普通字符
        currentValue += char;
      }
    }
    
    // 添加最后一个字段
    result.push(currentValue);
    
    return result;
  }
  
  /**
   * 从CSV导入
   */
  private async importFromCsv(dirPath: string, mergeStrategy: 'REPLACE' | 'MERGE' | 'SKIP_DUPLICATES'): Promise<boolean> {
    const fs = require('fs');
    const path = require('path');
    const { promisify } = require('util');
    const readFile = promisify(fs.readFile);
    
    try {
      // 检查目录是否存在
      if (!fs.existsSync(dirPath)) {
        throw new Error(`Directory does not exist: ${dirPath}`);
      }
      
      // 读取节点文件
      const nodesPath = path.join(dirPath, 'nodes.csv');
      if (!fs.existsSync(nodesPath)) {
        throw new Error(`Nodes file does not exist: ${nodesPath}`);
      }
      
      const nodesData = await readFile(nodesPath, 'utf8');
      const nodesLines = nodesData.split('\n');
      
      // 跳过标题行
      for (let i = 1; i < nodesLines.length; i++) {
        const line = nodesLines[i].trim();
        if (!line) continue;
        
        // 解析CSV行
        const [id, type, label, createdAt, updatedAt, propertiesStr] = this.parseCSVLine(line);
        
        // 创建节点对象
        const node: Node = {
          id,
          type: type as NodeType,
          label,
          properties: JSON.parse(propertiesStr as string),
          createdAt: new Date(createdAt as string | number),
          updatedAt: new Date(updatedAt as string | number)
        };
        
        // 根据合并策略处理
        if (mergeStrategy === 'SKIP_DUPLICATES') {
          // 检查节点是否存在
          const existingNode = await this.getNode(node.id);
          if (existingNode) {
            continue;
          }
        }
        
        // 创建或更新节点
        if (mergeStrategy === 'MERGE') {
          const existingNode = await this.getNode(node.id);
          if (existingNode) {
            await this.updateNode(node.id, node);
          } else {
            await this.createNode(node);
          }
        } else {
          await this.createNode(node);
        }
      }
      
      // 读取关系文件
      const relationshipsPath = path.join(dirPath, 'relationships.csv');
      if (!fs.existsSync(relationshipsPath)) {
        throw new Error(`Relationships file does not exist: ${relationshipsPath}`);
      }
      
      const relationshipsData = await readFile(relationshipsPath, 'utf8');
      const relationshipsLines = relationshipsData.split('\n');
      
      // 跳过标题行
      for (let i = 1; i < relationshipsLines.length; i++) {
        const line = relationshipsLines[i].trim();
        if (!line) continue;
        
        // 解析CSV行
        const [id, type, label, sourceNodeId, targetNodeId, createdAt, updatedAt, propertiesStr] = this.parseCSVLine(line);
        
        // 创建关系对象
        const relationship: Relationship = {
          id,
          type: (type as RelationshipType) || 'RELATED_TO' as RelationshipType,
          label: label || '',
          sourceNodeId,
          targetNodeId,
          properties: JSON.parse(propertiesStr as string),
          createdAt: new Date(createdAt as string | number),
          updatedAt: new Date(updatedAt as string | number)
        };
        
        // 根据合并策略处理
        if (mergeStrategy === 'SKIP_DUPLICATES') {
          // 检查关系是否存在
          const existingRelationship = await this.getRelationship(relationship.id);
          if (existingRelationship) {
            continue;
          }
        }
        
        // 创建或更新关系
        if (mergeStrategy === 'MERGE') {
          const existingRelationship = await this.getRelationship(relationship.id);
          if (existingRelationship) {
            await this.updateRelationship(relationship.id, relationship);
          } else {
            await this.createRelationship(relationship);
          }
        } else {
          await this.createRelationship(relationship);
        }
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
    const fs = require('fs');
    const { promisify } = require('util');
    const readFile = promisify(fs.readFile);
    const { parseStringPromise } = require('xml2js');
    
    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${filePath}`);
      }
      
      // 读取文件
      const data = await readFile(filePath, 'utf8');
      
      // 解析XML
      const result = await parseStringPromise(data);
      const graphml = result.graphml;
      const graph = graphml.graph[0];
      
      // 获取键定义
      const keys: { [key: string]: { id: string, for: string, name: string } } = {};
      if (graphml.key) {
        for (const key of graphml.key) {
          const keyAttrs = key.$;
          keys[keyAttrs.id] = {
            id: keyAttrs.id,
            for: keyAttrs.for,
            name: keyAttrs['attr.name']
          };
        }
      }
      
      // 处理节点
      if (graph.node) {
        for (const nodeXml of graph.node) {
          const nodeId = nodeXml.$.id;
          const nodeData: { [key: string]: unknown } = {};
          
          // 解析节点数据
          if (nodeXml.data) {
            for (const data of nodeXml.data) {
              const keyId = data.$.key;
              const keyName = keys[keyId]?.name || keyId;
              nodeData[keyName] = data._;
            }
          }
          
          // 创建节点对象
          const node: Node = {
            id: nodeId,
            type: nodeData.type as NodeType,
            label: nodeData.label as string,
            properties: nodeData.properties ? JSON.parse(nodeData.properties as string) : {},
            createdAt: nodeData.createdAt ? new Date(nodeData.createdAt as string | number) : new Date(),
            updatedAt: nodeData.updatedAt ? new Date(nodeData.updatedAt as string | number) : new Date()
          };
          
          // 根据合并策略处理
          if (mergeStrategy === 'SKIP_DUPLICATES') {
            // 检查节点是否存在
            const existingNode = await this.getNode(node.id);
            if (existingNode) {
              continue;
            }
          }
          
          // 创建或更新节点
          if (mergeStrategy === 'MERGE') {
            const existingNode = await this.getNode(node.id);
            if (existingNode) {
              await this.updateNode(node.id, node);
            } else {
              await this.createNode(node);
            }
          } else {
            await this.createNode(node);
          }
        }
      }
      
      // 处理关系
      if (graph.edge) {
        for (const edgeXml of graph.edge) {
          const edgeAttrs = edgeXml.$;
          const edgeId = edgeAttrs.id;
          const sourceId = edgeAttrs.source;
          const targetId = edgeAttrs.target;
          const edgeData: { [key: string]: unknown } = {};
          
          // 解析关系数据
          if (edgeXml.data) {
            for (const data of edgeXml.data) {
              const keyId = data.$.key;
              const keyName = keys[keyId]?.name || keyId;
              edgeData[keyName] = data._;
            }
          }
          
          // 创建关系对象
          const relationship: Relationship = {
            id: edgeId,
            type: ('type' in edgeData ? (edgeData.type as RelationshipType) : RelationshipType.RELATED_TO),
            label: 'label' in edgeData ? String(edgeData.label) : '',
            sourceNodeId: sourceId,
            targetNodeId: targetId,
            properties: 'properties' in edgeData && edgeData.properties ? JSON.parse(edgeData.properties as string) : {},
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // 根据合并策略处理
          if (mergeStrategy === 'SKIP_DUPLICATES') {
            // 检查关系是否存在
            const existingRelationship = await this.getRelationship(relationship.id);
            if (existingRelationship) {
              continue;
            }
          }
          
          // 创建或更新关系
          if (mergeStrategy === 'MERGE') {
            const existingRelationship = await this.getRelationship(relationship.id);
            if (existingRelationship) {
              await this.updateRelationship(relationship.id, relationship);
            } else {
              await this.createRelationship(relationship);
            }
          } else {
            await this.createRelationship(relationship);
          }
        }
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
 * 全局Neo4j知识图谱服务实例
 */
export const globalNeo4jKnowledgeGraphService = new Neo4jKnowledgeGraphService({
  uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
  username: process.env.NEO4J_USERNAME || 'neo4j',
  password: process.env.NEO4J_PASSWORD || 'password',
  database: process.env.NEO4J_DATABASE || 'neo4j',
  enableVectorSearch: process.env.NEO4J_ENABLE_VECTOR_SEARCH !== 'false',
  vectorDimension: parseInt(process.env.NEO4J_VECTOR_DIMENSION || '1536', 10),
  enableApoc: process.env.NEO4J_ENABLE_APOC !== 'false',
  enableGds: process.env.NEO4J_ENABLE_GDS !== 'false',
  logLevel: (process.env.NEO4J_LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error'
});