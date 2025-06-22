/**
 * AI Services Types - AI服务类型定义
 *
 * 定义AI服务相关的类型和接口
 */
export declare enum AIProvider {
    OPENAI = "openai",
    ANTHROPIC = "anthropic",
    LOCAL = "local",
    CUSTOM = "custom"
}
export declare enum AIModelType {
    EMBEDDING = "embedding",
    COMPLETION = "completion",
    CHAT = "chat",
    IMAGE = "image",
    AUDIO = "audio"
}
export interface AIModel {
    id: string;
    provider: AIProvider;
    type: AIModelType;
    name: string;
    version: string;
    contextWindow: number;
    maxTokens: number;
    description?: string;
    capabilities?: string[];
    costPerToken?: number;
}
export declare enum MessageRole {
    SYSTEM = "system",
    USER = "user",
    ASSISTANT = "assistant",
    FUNCTION = "function"
}
export declare enum ContentType {
    TEXT = "text",
    IMAGE = "image",
    AUDIO = "audio",
    VIDEO = "video",
    FILE = "file"
}
export interface MessageContent {
    type: ContentType;
    text?: string;
    url?: string;
    data?: string;
    metadata?: Record<string, any>;
}
export interface Message {
    role: MessageRole;
    content: MessageContent | MessageContent[];
    name?: string;
    functionCall?: FunctionCall;
}
export interface FunctionDefinition {
    name: string;
    description: string;
    parameters: Record<string, any>;
    required?: string[];
}
export interface FunctionCall {
    name: string;
    arguments: string;
}
export interface EmbeddingOptions {
    model?: string;
    provider?: AIProvider;
    dimensions?: number;
    normalize?: boolean;
}
export interface EmbeddingResult {
    embedding: number[];
    model: string;
    provider: AIProvider;
    dimensions: number;
    tokenCount: number;
    truncated: boolean;
}
export interface ChatOptions {
    model?: string;
    provider?: AIProvider;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
    functions?: FunctionDefinition[];
    functionCall?: 'auto' | 'none' | {
        name: string;
    };
    stream?: boolean;
}
export interface ChatResult {
    message: Message;
    model: string;
    provider: AIProvider;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost?: number;
}
export declare enum ChatStreamEventType {
    START = "start",
    TOKEN = "token",
    FUNCTION_CALL = "function_call",
    FUNCTION_CALL_END = "function_call_end",
    END = "end",
    ERROR = "error"
}
export interface ChatStreamEvent {
    type: ChatStreamEventType;
    data?: string;
    functionCall?: Partial<FunctionCall>;
    error?: Error;
    model?: string;
    provider?: AIProvider;
    stats?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        cost?: number;
    };
}
export interface IAIService {
    getAvailableModels(): Promise<AIModel[]>;
    createEmbedding(text: string, options?: EmbeddingOptions): Promise<EmbeddingResult>;
    createEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<EmbeddingResult[]>;
    chat(messages: Message[], options?: ChatOptions): Promise<ChatResult>;
    chatStream(messages: Message[], options?: ChatOptions): AsyncGenerator<ChatStreamEvent, void, unknown>;
    countTokens(text: string, model?: string): Promise<number>;
    countMessageTokens(messages: Message[], model?: string): Promise<number>;
}
export interface IAIRoutingService {
    selectProvider(modelType: AIModelType, options?: {
        preferredProvider?: AIProvider;
        costSensitive?: boolean;
        performanceSensitive?: boolean;
        qualitySensitive?: boolean;
    }): Promise<{
        provider: AIProvider;
        model: string;
    }>;
    getService(provider: AIProvider): IAIService;
    createEmbedding(text: string, options?: EmbeddingOptions): Promise<EmbeddingResult>;
    chat(messages: Message[], options?: ChatOptions): Promise<ChatResult>;
    chatStream(messages: Message[], options?: ChatOptions): AsyncGenerator<ChatStreamEvent, void, unknown>;
}
/**
 * 提示模板对象
 */
export interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    template: string;
    variables: string[];
    defaultValues?: Record<string, string>;
    tags?: string[];
    category?: string;
    version: string;
    created: string;
    modified: string;
}
/**
 * 提示模板管理器接口
 */
export interface IPromptManager {
    /**
     * 获取指定ID的提示模板
     * @param id 模板ID
     * @returns 模板对象或null（如果未找到）
     */
    getTemplate(id: string): Promise<PromptTemplate | null>;
    /**
     * 创建新的提示模板
     * @param template 模板数据 (不包含id, created, modified)
     * @returns 创建的模板对象
     */
    createTemplate(template: Omit<PromptTemplate, 'id' | 'created' | 'modified'>): Promise<PromptTemplate>;
    /**
     * 更新现有的提示模板
     * @param id 要更新的模板ID
     * @param template 要更新的模板数据 (部分或全部，不包含id, created, modified)
     * @returns 更新后的模板对象或null（如果未找到）
     */
    updateTemplate(id: string, template: Partial<Omit<PromptTemplate, 'id' | 'created' | 'modified'>>): Promise<PromptTemplate | null>;
    /**
     * 删除指定ID的提示模板
     * @param id 模板ID
     * @returns 如果删除成功则为true，否则为false
     */
    deleteTemplate(id: string): Promise<boolean>;
    /**
     * 列出所有提示模板，可选择过滤
     * @param options 可选的过滤条件 (例如，按类别、标签、搜索关键词)
     * @returns 模板对象数组
     */
    listTemplates(options?: {
        category?: string;
        tags?: string[];
        search?: string;
    }): Promise<PromptTemplate[]>;
    /**
     * 渲染指定ID的提示模板
     * @param id 模板ID
     * @param data 用于填充模板变量的数据对象
     * @returns 渲染后的提示字符串或null（如果模板未找到或渲染失败）
     */
    renderTemplate(id: string, data: Record<string, any>): Promise<string | null>;
}
