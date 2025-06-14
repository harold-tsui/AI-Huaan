/**
 * Knowledge Graph MCP Service - 知识图谱MCP服务
 * 
 * 将知识图谱服务包装为MCP服务，提供标准化的MCP接口
 */

import { v4 as uuidv4 } from 'uuid';
import { BaseService } from '../../shared/mcp-core/base-service';
import { IMCPService, MCPRequest, MCPResponse, MCPErrorCode, ServiceConfig, ServiceStatus } from '../../shared/mcp-core/types';
import { IKnowledgeGraphService, getKnowledgeGraphService, initializeKnowledgeGraphService, KnowledgeGraphServiceType, KnowledgeGraphServiceConfig } from '../../shared/knowledge-graph-services';
import { Logger } from '../../utils/logger';

/**
 * 知识图谱MCP服务配置
 */
export interface KnowledgeGraphMCPServiceConfig extends ServiceConfig {
  // 知识图谱服务配置
  knowledgeGraphConfig?: KnowledgeGraphServiceConfig;
}

/**
 * 知识图谱MCP服务
 * 
 * 将知识图谱服务包装为MCP服务，提供标准化的MCP接口
 */
export class KnowledgeGraphMCPService extends BaseService implements IMCPService {
  private knowledgeGraphService: IKnowledgeGraphService;
  // 注意：logger已经在BaseService中定义为protected，这里不需要重新定义

  /**
   * 构造函数
   * @param config 服务配置
   */
  constructor(config?: KnowledgeGraphMCPServiceConfig) {
    super(
      'KnowledgeGraphService', // 服务名称
      '1.0.0', // 服务版本
      config || {}
    );
    
    this.knowledgeGraphService = getKnowledgeGraphService();
    
    // 注册服务能力
    this.registerCapability('node_management', '节点管理（创建、查询、更新、删除）');
    this.registerCapability('relationship_management', '关系管理（创建、查询、更新、删除）');
    this.registerCapability('graph_traversal', '图遍历和路径查找');
    this.registerCapability('vector_search', '向量搜索');
  }

  /**
   * 初始化服务
   */
  public async initialize(): Promise<boolean> {
    this.logger.info('Initializing Knowledge Graph MCP Service');
    
    // 调用父类初始化
    const baseInitialized = await super.initialize();
    if (!baseInitialized) {
      this.status = ServiceStatus.ERROR;
      this.logger.error('Failed to initialize base service');
      return false;
    }
    
    // 初始化知识图谱服务
    const config = this.config as KnowledgeGraphMCPServiceConfig;
    let initialized = false;
    
    if (config.knowledgeGraphConfig) {
      this.knowledgeGraphService = await initializeKnowledgeGraphService(config.knowledgeGraphConfig);
      initialized = this.knowledgeGraphService.isInitialized();
    } else if (!this.knowledgeGraphService.isInitialized()) {
      // 使用默认配置初始化
      initialized = await this.knowledgeGraphService.initialize();
    } else {
      initialized = true;
    }
    
    if (initialized) {
      this.status = ServiceStatus.ACTIVE;
      this.logger.info('Knowledge Graph MCP Service initialized');
    } else {
      this.status = ServiceStatus.ERROR;
      this.logger.error('Failed to initialize Knowledge Graph MCP Service');
    }
    
    return initialized;
  }

  /**
   * 关闭服务
   */
  public async shutdown(): Promise<boolean> {
    this.logger.info('Shutting down Knowledge Graph MCP Service');
    
    // 关闭知识图谱服务
    if (this.knowledgeGraphService.isInitialized()) {
      await this.knowledgeGraphService.shutdown();
    }
    
    // 调用父类关闭
    await super.shutdown();
    
    this.logger.info('Knowledge Graph MCP Service shut down');
    return true;
  }

  /**
   * 处理MCP请求
   * @param request MCP请求
   * @returns MCP响应
   */
  public async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    this.logger.debug('Handling request', { action: request.action });
    
    // 检查服务状态
    if (this.status !== ServiceStatus.ACTIVE) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.SERVICE_UNAVAILABLE,
        'Knowledge Graph Service is not active'
      );
    }
    
    try {
      // 根据请求的action调用相应的方法
      switch (request.action) {
        // 节点管理
        case 'createNode':
          return await this.handleCreateNode(request);
        case 'getNode':
          return await this.handleGetNode(request);
        case 'updateNode':
          return await this.handleUpdateNode(request);
        case 'deleteNode':
          return await this.handleDeleteNode(request);
        case 'queryNodes':
          return await this.handleQueryNodes(request);
          
        // 关系管理
        case 'createRelationship':
          return await this.handleCreateRelationship(request);
        case 'getRelationship':
          return await this.handleGetRelationship(request);
        case 'updateRelationship':
          return await this.handleUpdateRelationship(request);
        case 'deleteRelationship':
          return await this.handleDeleteRelationship(request);
        case 'queryRelationships':
          return await this.handleQueryRelationships(request);
          
        // 图遍历
        case 'traverseGraph':
          return await this.handleTraverseGraph(request);
        case 'findShortestPath':
          return await this.handleFindShortestPath(request);
        case 'findAllPaths':
          return await this.handleFindAllPaths(request);
          
        // 向量搜索
        case 'vectorSearch':
          return await this.handleVectorSearch(request);
          
        // 统计信息
        case 'getGraphStats':
          return await this.handleGetGraphStats(request);
          
        default:
          return this.createErrorResponse(
            request,
            MCPErrorCode.METHOD_NOT_FOUND,
            `Action not supported: ${request.action}`
          );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      this.logger.error('Error handling request', { 
        action: request.action, 
        error: errorMessage,
        stack: errorStack
      });
      
      return this.createErrorResponse(
        request,
        MCPErrorCode.INTERNAL_ERROR,
        `Internal error: ${errorMessage}`
      );
    }
  }

  /**
   * 健康检查
   */
  public async healthCheck(): Promise<boolean> {
    // 检查知识图谱服务是否已初始化
    return this.knowledgeGraphService.isInitialized();
  }

  // 节点管理处理方法
  
  /**
   * 处理创建节点请求
   */
  private async handleCreateNode(request: MCPRequest): Promise<MCPResponse> {
    const { input } = request.params;
    
    if (!input) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.VALIDATION_ERROR,
        'Missing required parameter: input'
      );
    }
    
    const node = await this.knowledgeGraphService.createNode(input);
    
    return this.createSuccessResponse(request, { node });
  }
  
  /**
   * 处理获取节点请求
   */
  private async handleGetNode(request: MCPRequest): Promise<MCPResponse> {
    const { id } = request.params;
    
    if (!id) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.VALIDATION_ERROR,
        'Missing required parameter: id'
      );
    }
    
    const node = await this.knowledgeGraphService.getNode(id);
    
    if (!node) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.NOT_FOUND,
        `Node with ID ${id} not found`
      );
    }
    
    return this.createSuccessResponse(request, { node });
  }
  
  /**
   * 处理更新节点请求
   */
  private async handleUpdateNode(request: MCPRequest): Promise<MCPResponse> {
    const { id, input } = request.params;
    
    if (!id || !input) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.VALIDATION_ERROR,
        'Missing required parameters: id and input'
      );
    }
    
    const node = await this.knowledgeGraphService.updateNode(id, input);
    
    if (!node) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.NOT_FOUND,
        `Node with ID ${id} not found`
      );
    }
    
    return this.createSuccessResponse(request, { node });
  }
  
  /**
   * 处理删除节点请求
   */
  private async handleDeleteNode(request: MCPRequest): Promise<MCPResponse> {
    const { id } = request.params;
    
    if (!id) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.VALIDATION_ERROR,
        'Missing required parameter: id'
      );
    }
    
    const success = await this.knowledgeGraphService.deleteNode(id);
    
    if (!success) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.NOT_FOUND,
        `Node with ID ${id} not found or could not be deleted`
      );
    }
    
    return this.createSuccessResponse(request, { success });
  }
  
  /**
   * 处理查询节点请求
   */
  private async handleQueryNodes(request: MCPRequest): Promise<MCPResponse> {
    const { options } = request.params;
    
    if (!options) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.VALIDATION_ERROR,
        'Missing required parameter: options'
      );
    }
    
    const nodes = await this.knowledgeGraphService.queryNodes(options);
    
    return this.createSuccessResponse(request, { nodes });
  }
  
  // 关系管理处理方法
  
  /**
   * 处理创建关系请求
   */
  private async handleCreateRelationship(request: MCPRequest): Promise<MCPResponse> {
    const { input } = request.params;
    
    if (!input) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.VALIDATION_ERROR,
        'Missing required parameter: input'
      );
    }
    
    try {
      const relationship = await this.knowledgeGraphService.createRelationship(input);
      return this.createSuccessResponse(request, { relationship });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.createErrorResponse(
        request,
        MCPErrorCode.VALIDATION_ERROR,
        errorMessage
      );
    }
  }
  
  /**
   * 处理获取关系请求
   */
  private async handleGetRelationship(request: MCPRequest): Promise<MCPResponse> {
    const { id } = request.params;
    
    if (!id) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.VALIDATION_ERROR,
        'Missing required parameter: id'
      );
    }
    
    const relationship = await this.knowledgeGraphService.getRelationship(id);
    
    if (!relationship) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.NOT_FOUND,
        `Relationship with ID ${id} not found`
      );
    }
    
    return this.createSuccessResponse(request, { relationship });
  }
  
  /**
   * 处理更新关系请求
   */
  private async handleUpdateRelationship(request: MCPRequest): Promise<MCPResponse> {
    const { id, input } = request.params;
    
    if (!id || !input) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.VALIDATION_ERROR,
        'Missing required parameters: id and input'
      );
    }
    
    const relationship = await this.knowledgeGraphService.updateRelationship(id, input);
    
    if (!relationship) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.NOT_FOUND,
        `Relationship with ID ${id} not found`
      );
    }
    
    return this.createSuccessResponse(request, { relationship });
  }
  
  /**
   * 处理删除关系请求
   */
  private async handleDeleteRelationship(request: MCPRequest): Promise<MCPResponse> {
    const { id } = request.params;
    
    if (!id) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.VALIDATION_ERROR,
        'Missing required parameter: id'
      );
    }
    
    const success = await this.knowledgeGraphService.deleteRelationship(id);
    
    if (!success) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.NOT_FOUND,
        `Relationship with ID ${id} not found or could not be deleted`
      );
    }
    
    return this.createSuccessResponse(request, { success });
  }
  
  /**
   * 处理查询关系请求
   */
  private async handleQueryRelationships(request: MCPRequest): Promise<MCPResponse> {
    const { options } = request.params;
    
    if (!options) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.VALIDATION_ERROR,
        'Missing required parameter: options'
      );
    }
    
    const relationships = await this.knowledgeGraphService.queryRelationships(options);
    
    return this.createSuccessResponse(request, { relationships });
  }
  
  // 图遍历处理方法
  
  /**
   * 处理图遍历请求
   */
  private async handleTraverseGraph(request: MCPRequest): Promise<MCPResponse> {
    const { options } = request.params;
    
    if (!options) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.VALIDATION_ERROR,
        'Missing required parameter: options'
      );
    }
    
    const result = await this.knowledgeGraphService.traverseGraph(options);
    
    return this.createSuccessResponse(request, { result });
  }
  
  /**
   * 处理最短路径查找请求
   */
  private async handleFindShortestPath(request: MCPRequest): Promise<MCPResponse> {
    const { startNodeId, endNodeId, relationshipTypes, maxDepth } = request.params;
    
    if (!startNodeId || !endNodeId) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.VALIDATION_ERROR,
        'Missing required parameters: startNodeId and endNodeId'
      );
    }
    
    const path = await this.knowledgeGraphService.findShortestPath(
      startNodeId,
      endNodeId,
      relationshipTypes,
      maxDepth
    );
    
    return this.createSuccessResponse(request, { path });
  }
  
  /**
   * 处理所有路径查找请求
   */
  private async handleFindAllPaths(request: MCPRequest): Promise<MCPResponse> {
    const { startNodeId, endNodeId, relationshipTypes, maxDepth } = request.params;
    
    if (!startNodeId || !endNodeId) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.VALIDATION_ERROR,
        'Missing required parameters: startNodeId and endNodeId'
      );
    }
    
    const paths = await this.knowledgeGraphService.findAllPaths(
      startNodeId,
      endNodeId,
      relationshipTypes,
      maxDepth
    );
    
    return this.createSuccessResponse(request, { paths });
  }
  
  // 向量搜索处理方法
  
  /**
   * 处理向量搜索请求
   */
  private async handleVectorSearch(request: MCPRequest): Promise<MCPResponse> {
    const { options } = request.params;
    
    if (!options) {
      return this.createErrorResponse(
        request,
        MCPErrorCode.VALIDATION_ERROR,
        'Missing required parameter: options'
      );
    }
    
    const results = await this.knowledgeGraphService.vectorSearch(options);
    
    return this.createSuccessResponse(request, { results });
  }
  
  // 统计信息处理方法
  
  /**
   * 处理获取图统计信息请求
   */
  private async handleGetGraphStats(request: MCPRequest): Promise<MCPResponse> {
    const stats = await this.knowledgeGraphService.getGraphStats();
    
    return this.createSuccessResponse(request, { stats });
  }
  
  // 辅助方法
  
  /**
   * 创建成功响应
   */
  private createSuccessResponse(request: MCPRequest, data: any): MCPResponse {
    return {
      id: uuidv4(),
      requestId: request.id,
      service: request.service,
      version: request.version,
      action: request.action,
      status: 'success',
      data,
      metadata: {
        timestamp: new Date(),
      }
    };
  }
  
  /**
   * 创建错误响应
   */
  private createErrorResponse(request: MCPRequest, errorCode: MCPErrorCode, errorMessage: string): MCPResponse {
    return {
      id: uuidv4(),
      requestId: request.id,
      service: request.service,
      version: request.version,
      action: request.action,
      status: 'error',
      error: {
        code: errorCode,
        message: errorMessage
      },
      metadata: {
        timestamp: new Date(),
      }
    };
  }
}

// 创建全局实例
export const globalKnowledgeGraphMCPService = new KnowledgeGraphMCPService();