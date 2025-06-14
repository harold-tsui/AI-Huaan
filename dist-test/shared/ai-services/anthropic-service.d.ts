/**
 * Anthropic Service - Anthropic服务实现
 *
 * 提供与Anthropic API的集成
 */
import { AIModel, ChatOptions, ChatResult, ChatStreamEvent, EmbeddingOptions, EmbeddingResult, IAIService, Message } from './types';
/**
 * Anthropic服务实现
 */
export declare class AnthropicService implements IAIService {
    private client;
    private logger;
    private availableModels;
    private apiKey;
    private baseURL?;
    /**
     * 构造函数
     */
    constructor();
    /**
     * 初始化模型列表
     */
    private initializeModels;
    /**
     * 获取可用模型列表
     */
    getAvailableModels(): Promise<AIModel[]>;
    /**
     * 创建文本嵌入
     * 注意：Anthropic目前不提供嵌入API，这里抛出错误
     */
    createEmbedding(text: string, options?: EmbeddingOptions): Promise<EmbeddingResult>;
    /**
     * 批量创建文本嵌入
     * 注意：Anthropic目前不提供嵌入API，这里抛出错误
     */
    createEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<EmbeddingResult[]>;
    /**
     * 将标准消息格式转换为Anthropic消息格式
     */
    private convertToAnthropicMessages;
    /**
     * 将Anthropic消息转换为标准消息格式
     */
    private convertFromAnthropicMessage;
    /**
     * 将标准函数定义转换为Anthropic工具定义
     */
    private convertToAnthropicTools;
    /**
     * 聊天完成
     */
    chat(messages: Message[], options?: ChatOptions): Promise<ChatResult>;
    /**
     * 流式聊天完成
     */
    chatStream(messages: Message[], options?: ChatOptions): AsyncGenerator<ChatStreamEvent, void, unknown>;
    /**
     * 估算文本的令牌数
     * 注意：这是一个粗略的估计，不如Claude的tokenizer准确
     */
    private estimateTokenCount;
    /**
     * 计算文本的令牌数
     */
    countTokens(text: string, model?: string): Promise<number>;
    /**
     * 计算消息的令牌数
     */
    countMessageTokens(messages: Message[], model?: string): Promise<number>;
}
export declare const globalAnthropicService: AnthropicService;
