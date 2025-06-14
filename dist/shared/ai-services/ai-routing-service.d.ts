/**
 * AI Routing Service - AI服务路由
 *
 * 管理多个AI服务提供商，根据需求选择最佳服务
 */
import { AIModel, AIModelType, AIProvider, ChatOptions, ChatResult, ChatStreamEvent, EmbeddingOptions, EmbeddingResult, IAIRoutingService, IAIService, Message } from './types';
/**
 * AI服务路由实现
 * 同时实现IAIService和IAIRoutingService接口
 */
export declare class AIRoutingService implements IAIRoutingService, IAIService {
    private logger;
    private services;
    private config;
    /**
     * 构造函数
     */
    constructor();
    /**
     * 注册可用的AI服务
     */
    private registerServices;
    /**
     * 根据请求选择最佳提供商
     */
    selectProvider(modelType: AIModelType, options?: {
        preferredProvider?: AIProvider;
        costSensitive?: boolean;
        performanceSensitive?: boolean;
        qualitySensitive?: boolean;
    }): Promise<{
        provider: AIProvider;
        model: string;
    }>;
    /**
     * 获取提供商的默认模型
     */
    private getDefaultModelForProvider;
    /**
     * 获取服务实例
     */
    getService(provider: AIProvider): IAIService;
    /**
     * 创建嵌入（自动路由）
     */
    createEmbedding(text: string, options?: EmbeddingOptions): Promise<EmbeddingResult>;
    /**
     * 聊天完成（自动路由）
     */
    chat(messages: Message[], options?: ChatOptions): Promise<ChatResult>;
    /**
     * 流式聊天完成（自动路由）
     */
    chatStream(messages: Message[], options?: ChatOptions): AsyncGenerator<ChatStreamEvent, void, unknown>;
    /**
     * 获取可用模型
     * 实现IAIService接口
     */
    getAvailableModels(): Promise<AIModel[]>;
    /**
     * 批量创建嵌入
     * 实现IAIService接口
     */
    createEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<EmbeddingResult[]>;
    /**
     * 计算令牌数
     * 实现IAIService接口
     */
    countTokens(text: string, model?: string): Promise<number>;
    /**
     * 计算消息令牌数
     * 实现IAIService接口
     */
    countMessageTokens(messages: Message[], model?: string): Promise<number>;
}
export declare const globalAIRoutingService: AIRoutingService;
