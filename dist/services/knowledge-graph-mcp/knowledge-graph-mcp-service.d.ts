/**
 * Knowledge Graph MCP Service - 知识图谱MCP服务
 *
 * 将知识图谱服务包装为MCP服务，提供标准化的MCP接口
 */
import { BaseService } from '../../shared/mcp-core/base-service';
import { IMCPService, MCPRequest, MCPResponse, ServiceConfig } from '../../shared/mcp-core/types';
import { KnowledgeGraphServiceConfig } from '../../shared/knowledge-graph-services';
/**
 * 知识图谱MCP服务配置
 */
export interface KnowledgeGraphMCPServiceConfig extends ServiceConfig {
    knowledgeGraphConfig?: KnowledgeGraphServiceConfig;
}
/**
 * 知识图谱MCP服务
 *
 * 将知识图谱服务包装为MCP服务，提供标准化的MCP接口
 */
export declare class KnowledgeGraphMCPService extends BaseService implements IMCPService {
    private knowledgeGraphService;
    /**
     * 构造函数
     * @param config 服务配置
     */
    constructor(config?: KnowledgeGraphMCPServiceConfig);
    /**
     * 初始化服务
     */
    initialize(): Promise<boolean>;
    /**
     * 关闭服务
     */
    shutdown(): Promise<boolean>;
    /**
     * 处理MCP请求
     * @param request MCP请求
     * @returns MCP响应
     */
    handleRequest(request: MCPRequest): Promise<MCPResponse>;
    /**
     * 健康检查
     */
    healthCheck(): Promise<boolean>;
    /**
     * 处理创建节点请求
     */
    private handleCreateNode;
    /**
     * 处理获取节点请求
     */
    private handleGetNode;
    /**
     * 处理更新节点请求
     */
    private handleUpdateNode;
    /**
     * 处理删除节点请求
     */
    private handleDeleteNode;
    /**
     * 处理查询节点请求
     */
    private handleQueryNodes;
    /**
     * 处理创建关系请求
     */
    private handleCreateRelationship;
    /**
     * 处理获取关系请求
     */
    private handleGetRelationship;
    /**
     * 处理更新关系请求
     */
    private handleUpdateRelationship;
    /**
     * 处理删除关系请求
     */
    private handleDeleteRelationship;
    /**
     * 处理查询关系请求
     */
    private handleQueryRelationships;
    /**
     * 处理图遍历请求
     */
    private handleTraverseGraph;
    /**
     * 处理最短路径查找请求
     */
    private handleFindShortestPath;
    /**
     * 处理所有路径查找请求
     */
    private handleFindAllPaths;
    /**
     * 处理向量搜索请求
     */
    private handleVectorSearch;
    /**
     * 处理获取图统计信息请求
     */
    private handleGetGraphStats;
    /**
     * 创建成功响应
     */
    private createSuccessResponse;
    /**
     * 创建错误响应
     */
    private createErrorResponse;
}
export declare const globalKnowledgeGraphMCPService: KnowledgeGraphMCPService;
