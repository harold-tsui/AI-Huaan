/**
 * Base AI Service - 基础AI服务
 *
 * 提供AI服务的基础实现，包括初始化、关闭、模型管理等通用功能。
 * 具体的AI提供商服务需要继承此类并实现相应的方法。
 */
import { AIModel, AIModelType, ChatOptions, ChatResult, ChatStreamEvent, EmbeddingOptions, EmbeddingResult, IAIService, Message } from './types';
/**
 * 基础AI服务配置
 */
export interface BaseAIServiceConfig {
    serviceName: string;
    apiKey?: string;
    apiBaseUrl?: string;
    organizationId?: string;
    defaultModel?: string;
    timeout?: number;
    maxRetries?: number;
    logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'none';
    proxyUrl?: string;
    [key: string]: any;
}
/**
 * 基础AI服务
 */
export declare abstract class BaseAIService implements IAIService {
    private _initialized;
    private _config;
    protected _models: AIModel[];
    /**
     * 构造函数
     *
     * @param config 服务配置
     */
    constructor(config: BaseAIServiceConfig);
    /**
     * 获取服务配置
     */
    get config(): BaseAIServiceConfig;
    /**
     * 设置服务配置
     */
    set config(config: BaseAIServiceConfig);
    /**
     * 初始化服务
     */
    initialize(): Promise<void>;
    /**
     * 关闭服务
     */
    shutdown(): Promise<void>;
    /**
     * 服务是否已初始化
     */
    isInitialized(): boolean;
    /**
     * 获取可用模型列表
     */
    getAvailableModels(): Promise<AIModel[]>;
    /**
     * 创建嵌入
     *
     * @param text 文本
     * @param options 选项
     */
    abstract createEmbedding(text: string, options?: EmbeddingOptions): Promise<EmbeddingResult>;
    /**
     * 批量创建嵌入
     *
     * @param texts 文本列表
     * @param options 选项
     */
    abstract createEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<EmbeddingResult[]>;
    /**
     * 聊天完成
     *
     * @param messages 消息列表
     * @param options 选项
     */
    abstract chat(messages: Message[], options?: ChatOptions): Promise<ChatResult>;
    /**
     * 流式聊天完成
     *
     * @param messages 消息列表
     * @param options 选项
     */
    abstract chatStream(messages: Message[], options?: ChatOptions): AsyncGenerator<ChatStreamEvent, void, unknown>;
    /**
     * 计算令牌数
     *
     * @param text 文本
     * @param model 模型
     */
    abstract countTokens(text: string, model?: string): Promise<number>;
    /**
     * 计算消息令牌数
     *
     * @param messages 消息列表
     * @param model 模型
     */
    abstract countMessageTokens(messages: Message[], model?: string): Promise<number>;
    /**
     * 子类特定的初始化实现
     */
    protected abstract initializeImpl(): Promise<void>;
    /**
     * 子类特定的关闭实现
     */
    protected abstract shutdownImpl(): Promise<void>;
    /**
     * 加载模型列表
     */
    protected abstract loadModels(): Promise<void>;
    /**
     * 确保服务已初始化
     */
    protected ensureInitialized(): void;
    /**
     * 获取默认模型
     *
     * @param type 模型类型
     */
    protected getDefaultModel(type: AIModelType): string | undefined;
    /**
     * 记录日志
     *
     * @param level 日志级别
     * @param message 日志消息
     */
    protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void;
}
