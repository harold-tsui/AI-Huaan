/**
 * Knowledge Graph Services - 知识图谱服务
 *
 * 提供知识图谱管理功能，包括节点和关系的创建、查询、更新和删除，
 * 以及图遍历、路径查找和向量搜索等高级功能。
 */
export * from './types';
export { BaseKnowledgeGraphService } from './base-knowledge-graph-service';
export { MemoryKnowledgeGraphService } from './memory-knowledge-graph-service';
export declare const KNOWLEDGE_GRAPH_SERVICES_VERSION = "1.0.0";
import { IKnowledgeGraphService } from './types';
declare let globalKnowledgeGraphService: IKnowledgeGraphService;
/**
 * 知识图谱服务类型
 */
export declare enum KnowledgeGraphServiceType {
    MEMORY = "memory",
    NEO4J = "neo4j"
}
/**
 * 知识图谱服务配置
 */
export interface KnowledgeGraphServiceConfig {
    type: KnowledgeGraphServiceType;
    enableVectorSearch?: boolean;
    vectorDimension?: number;
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
export declare function initializeKnowledgeGraphService(config: KnowledgeGraphServiceConfig): Promise<IKnowledgeGraphService>;
/**
 * 获取全局知识图谱服务实例
 *
 * @returns 全局知识图谱服务实例
 */
export declare function getKnowledgeGraphService(): IKnowledgeGraphService;
export { globalKnowledgeGraphService };
