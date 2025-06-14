/**
 * Knowledge Graph Services - 知识图谱服务
 * 
 * 提供知识图谱管理功能，包括节点和关系的创建、查询、更新和删除，
 * 以及图遍历、路径查找和向量搜索等高级功能。
 */

// 导出类型定义
export * from './types';

// 导出基础知识图谱服务
export { BaseKnowledgeGraphService } from './base-knowledge-graph-service';

// 导出内存知识图谱服务
export { MemoryKnowledgeGraphService } from './memory-knowledge-graph-service';

// 导出Neo4j知识图谱服务
//export { Neo4jKnowledgeGraphService, globalNeo4jKnowledgeGraphService } from './neo4j-knowledge-graph-service';

// 知识图谱服务版本
export const KNOWLEDGE_GRAPH_SERVICES_VERSION = '1.0.0';

// 全局知识图谱服务实例
import { IKnowledgeGraphService } from './types';
import { MemoryKnowledgeGraphService } from './memory-knowledge-graph-service';
import { Neo4jKnowledgeGraphService } from './neo4j-knowledge-graph-service';

// 默认使用内存知识图谱服务
let globalKnowledgeGraphService: IKnowledgeGraphService = new MemoryKnowledgeGraphService();

/**
 * 知识图谱服务类型
 */
export enum KnowledgeGraphServiceType {
  MEMORY = 'memory',
  NEO4J = 'neo4j'
}

/**
 * 知识图谱服务配置
 */
export interface KnowledgeGraphServiceConfig {
  // 服务类型
  type: KnowledgeGraphServiceType;
  // 是否启用向量搜索
  enableVectorSearch?: boolean;
  // 向量维度
  vectorDimension?: number;
  // Neo4j配置（仅在type为NEO4J时使用）
  neo4j?: {
    uri: string;
    username: string;
    password: string;
    database?: string;
    enableApoc?: boolean;
    enableGds?: boolean;
  };
}

/**
 * 初始化知识图谱服务
 * 
 * @param config 知识图谱服务配置
 * @returns 初始化后的知识图谱服务实例
 */
export async function initializeKnowledgeGraphService(config: KnowledgeGraphServiceConfig): Promise<IKnowledgeGraphService> {
  // 关闭当前服务（如果已初始化）
  if (globalKnowledgeGraphService.isInitialized()) {
    await globalKnowledgeGraphService.shutdown();
  }
  
  // 根据配置选择服务类型
  switch (config.type) {
    case KnowledgeGraphServiceType.NEO4J:
      if (!config.neo4j) {
        throw new Error('Neo4j configuration is required for Neo4j knowledge graph service');
      }
      
      // 创建Neo4j服务实例
      const neo4jService = new Neo4jKnowledgeGraphService({
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
      globalKnowledgeGraphService = neo4jService;
      break;
      
    case KnowledgeGraphServiceType.MEMORY:
    default:
      // 创建内存服务实例
      const memoryService = new MemoryKnowledgeGraphService({
        enableVectorSearch: config.enableVectorSearch !== undefined ? config.enableVectorSearch : true,
        vectorDimension: config.vectorDimension || 1536,
        logLevel: 'info'
      });
      
      // 设置为全局服务
      globalKnowledgeGraphService = memoryService;
      break;
  }
  
  // 初始化服务
  await globalKnowledgeGraphService.initialize();
  // 使用更安全的方式记录服务初始化
  let serviceName = 'Unknown';
  if (config.type === KnowledgeGraphServiceType.NEO4J) {
    serviceName = 'Neo4jKnowledgeGraphService';
  } else {
    serviceName = 'MemoryKnowledgeGraphService';
  }
  console.info(`Initialized knowledge graph service: ${serviceName}`);
  
  return globalKnowledgeGraphService;
}

/**
 * 获取全局知识图谱服务实例
 * 
 * @returns 全局知识图谱服务实例
 */
export function getKnowledgeGraphService(): IKnowledgeGraphService {
  return globalKnowledgeGraphService;
}

// 导出全局知识图谱服务
export { globalKnowledgeGraphService };