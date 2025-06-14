/**
 * OpenAI Service - OpenAI服务实现
 *
 * 提供与OpenAI API的集成
 */
import { AIModel, ChatOptions, ChatResult, ChatStreamEvent, EmbeddingOptions, EmbeddingResult, IAIService, Message } from './types';
/**
 * OpenAI服务实现
 */
export declare class OpenAIService implements IAIService {
    private client;
    private logger;
    private availableModels;
    private apiKey;
    private organization?;
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
     * 将OpenAI模型映射到标准模型格式
     */
    private mapToAIModel;
    /**
     * 获取可用模型列表
     */
    getAvailableModels(): Promise<AIModel[]>;
    /**
     * 创建文本嵌入
     */
    createEmbedding(text: string, options?: EmbeddingOptions): Promise<EmbeddingResult>;
    /**
     * 批量创建文本嵌入
     */
    createEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<EmbeddingResult[]>;
    /**
     * 将标准消息格式转换为OpenAI消息格式
     */
    private convertToOpenAIMessages;
    /**
     * 将OpenAI函数定义转换为标准格式
     */
    private convertToOpenAIFunctions;
    /**
     * 将OpenAI函数调用控制转换为标准格式
     */
    private convertToOpenAIFunctionCall;
    /**
     * 将OpenAI消息转换为标准消息格式
     */
    private convertFromOpenAIMessage;
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
     * 注意：这是一个粗略的估计，不如tiktoken准确
     */
    private estimateTokenCount;
    /**
     * 估算消息的令牌数
     */
    private estimateMessageTokenCount;
    /**
     * 计算文本的令牌数
     */
    countTokens(text: string, model?: string): Promise<number>;
    /**
     * 计算消息的令牌数
     */
    countMessageTokens(messages: Message[], model?: string): Promise<number>;
}
export declare const globalOpenAIService: OpenAIService;
