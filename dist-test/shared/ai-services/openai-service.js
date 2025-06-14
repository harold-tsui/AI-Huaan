"use strict";
/**
 * OpenAI Service - OpenAI服务实现
 *
 * 提供与OpenAI API的集成
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalOpenAIService = exports.OpenAIService = void 0;
const openai_1 = __importDefault(require("openai"));
const config_1 = require("../../utils/config");
const logger_1 = require("../../utils/logger");
const types_1 = require("./types");
/**
 * OpenAI服务实现
 */
class OpenAIService {
    /**
     * 构造函数
     */
    constructor() {
        this.availableModels = [];
        this.logger = new logger_1.Logger('OpenAIService');
        const config = config_1.ConfigManager.getInstance().getConfig();
        this.apiKey = config.ai?.openai?.apiKey || process.env.OPENAI_API_KEY || '';
        this.organization = config.ai?.openai?.organization || process.env.OPENAI_ORGANIZATION;
        this.baseURL = config.ai?.openai?.baseURL || process.env.OPENAI_BASE_URL;
        if (!this.apiKey) {
            this.logger.error('OpenAI API key is not provided');
            throw new Error('OpenAI API key is required');
        }
        this.client = new openai_1.default({
            apiKey: this.apiKey,
            organization: this.organization,
            baseURL: this.baseURL,
        });
        this.initializeModels();
    }
    /**
     * 初始化模型列表
     */
    async initializeModels() {
        try {
            const response = await this.client.models.list();
            // 转换为标准模型格式
            this.availableModels = response.data.map(model => this.mapToAIModel(model));
            this.logger.info(`Initialized ${this.availableModels.length} OpenAI models`);
        }
        catch (error) {
            this.logger.error('Failed to initialize OpenAI models:', { error: error instanceof Error ? error : String(error) });
            // 设置一些默认模型
            this.availableModels = [
                {
                    id: 'gpt-4-turbo',
                    provider: types_1.AIProvider.OPENAI,
                    type: types_1.AIModelType.CHAT,
                    name: 'GPT-4 Turbo',
                    version: '1.0',
                    contextWindow: 128000,
                    maxTokens: 4096,
                    description: 'Most capable GPT-4 model optimized for speed',
                },
                {
                    id: 'gpt-4',
                    provider: types_1.AIProvider.OPENAI,
                    type: types_1.AIModelType.CHAT,
                    name: 'GPT-4',
                    version: '1.0',
                    contextWindow: 8192,
                    maxTokens: 4096,
                    description: 'Most capable GPT-4 model',
                },
                {
                    id: 'gpt-3.5-turbo',
                    provider: types_1.AIProvider.OPENAI,
                    type: types_1.AIModelType.CHAT,
                    name: 'GPT-3.5 Turbo',
                    version: '1.0',
                    contextWindow: 16385,
                    maxTokens: 4096,
                    description: 'Most capable GPT-3.5 model optimized for chat',
                },
                {
                    id: 'text-embedding-ada-002',
                    provider: types_1.AIProvider.OPENAI,
                    type: types_1.AIModelType.EMBEDDING,
                    name: 'Ada Embedding',
                    version: '002',
                    contextWindow: 8191,
                    maxTokens: 8191,
                    description: 'Text embedding model',
                },
            ];
        }
    }
    /**
     * 将OpenAI模型映射到标准模型格式
     */
    mapToAIModel(model) {
        // 确定模型类型
        let type = types_1.AIModelType.COMPLETION;
        if (model.id.includes('gpt-4') || model.id.includes('gpt-3.5')) {
            type = types_1.AIModelType.CHAT;
        }
        else if (model.id.includes('embedding')) {
            type = types_1.AIModelType.EMBEDDING;
        }
        else if (model.id.includes('dall-e')) {
            type = types_1.AIModelType.IMAGE;
        }
        else if (model.id.includes('whisper')) {
            type = types_1.AIModelType.AUDIO;
        }
        // 确定上下文窗口大小
        let contextWindow = 4096;
        if (model.id.includes('gpt-4-turbo')) {
            contextWindow = 128000;
        }
        else if (model.id.includes('gpt-4-32k')) {
            contextWindow = 32768;
        }
        else if (model.id.includes('gpt-4')) {
            contextWindow = 8192;
        }
        else if (model.id.includes('gpt-3.5-turbo-16k')) {
            contextWindow = 16385;
        }
        else if (model.id.includes('gpt-3.5')) {
            contextWindow = 4096;
        }
        else if (model.id.includes('text-embedding-ada-002')) {
            contextWindow = 8191;
        }
        return {
            id: model.id,
            provider: types_1.AIProvider.OPENAI,
            type,
            name: model.id,
            version: '1.0',
            contextWindow,
            maxTokens: Math.min(4096, contextWindow),
            description: model.id,
        };
    }
    /**
     * 获取可用模型列表
     */
    async getAvailableModels() {
        return this.availableModels;
    }
    /**
     * 创建文本嵌入
     */
    async createEmbedding(text, options) {
        const model = options?.model || 'text-embedding-ada-002';
        try {
            const response = await this.client.embeddings.create({
                model,
                input: text,
                dimensions: options?.dimensions,
            });
            const embedding = response.data[0].embedding;
            const dimensions = embedding.length;
            return {
                embedding,
                model,
                provider: types_1.AIProvider.OPENAI,
                dimensions,
                tokenCount: response.usage.total_tokens,
                truncated: false,
            };
        }
        catch (error) {
            this.logger.error('Failed to create embedding:', { error: error instanceof Error ? error : String(error) });
            throw error;
        }
    }
    /**
     * 批量创建文本嵌入
     */
    async createEmbeddings(texts, options) {
        const model = options?.model || 'text-embedding-ada-002';
        try {
            const response = await this.client.embeddings.create({
                model,
                input: texts,
                dimensions: options?.dimensions,
            });
            // 按输入顺序排序结果
            const sortedData = response.data.sort((a, b) => a.index - b.index);
            return sortedData.map(item => ({
                embedding: item.embedding,
                model,
                provider: types_1.AIProvider.OPENAI,
                dimensions: item.embedding.length,
                tokenCount: Math.floor(response.usage.total_tokens / texts.length), // 平均分配令牌数
                truncated: false,
            }));
        }
        catch (error) {
            this.logger.error('Failed to create embeddings:', { error: error instanceof Error ? error : String(error) });
            throw error;
        }
    }
    /**
     * 将标准消息格式转换为OpenAI消息格式
     */
    convertToOpenAIMessages(messages) {
        return messages.map(message => {
            // 创建基本消息对象
            let openaiMessage = {
                role: message.role,
            };
            // 对于function角色，需要设置name和content属性
            if (message.role === types_1.MessageRole.FUNCTION && message.name) {
                openaiMessage.name = message.name;
                openaiMessage.content = typeof message.content === 'string' ? message.content : '';
            }
            // 处理内容
            if (Array.isArray(message.content)) {
                openaiMessage.content = message.content.map(content => {
                    if (content.type === types_1.ContentType.TEXT) {
                        return { type: 'text', text: content.text || '' };
                    }
                    else if (content.type === types_1.ContentType.IMAGE) {
                        return {
                            type: 'image_url',
                            image_url: {
                                url: content.url || content.data || '',
                                detail: content.metadata?.detail || 'auto',
                            },
                        };
                    }
                    // 其他类型暂不支持
                    return { type: 'text', text: '' };
                });
            }
            else if (message.content.type === types_1.ContentType.TEXT) {
                openaiMessage.content = message.content.text || '';
            }
            else if (message.content.type === types_1.ContentType.IMAGE) {
                openaiMessage.content = [
                    {
                        type: 'image_url',
                        image_url: {
                            url: message.content.url || message.content.data || '',
                            detail: message.content.metadata?.detail || 'auto',
                        },
                    },
                ];
            }
            // 处理函数调用
            if (message.functionCall) {
                openaiMessage.function_call = {
                    name: message.functionCall.name,
                    arguments: message.functionCall.arguments,
                };
            }
            // 处理名称（用于函数调用）
            if (message.name && message.role === types_1.MessageRole.FUNCTION) {
                openaiMessage.name = message.name;
            }
            return openaiMessage;
        });
    }
    /**
     * 将OpenAI函数定义转换为标准格式
     */
    convertToOpenAIFunctions(functions) {
        if (!functions || functions.length === 0) {
            return undefined;
        }
        return functions.map(func => ({
            type: 'function',
            function: {
                name: func.name,
                description: func.description,
                parameters: func.parameters,
            },
        }));
    }
    /**
     * 将OpenAI函数调用控制转换为标准格式
     */
    convertToOpenAIFunctionCall(functionCall) {
        if (!functionCall) {
            return undefined;
        }
        if (functionCall === 'auto') {
            return 'auto';
        }
        if (functionCall === 'none') {
            return 'none';
        }
        return {
            type: 'function',
            function: { name: functionCall.name },
        };
    }
    /**
     * 将OpenAI消息转换为标准消息格式
     */
    convertFromOpenAIMessage(message) {
        const result = {
            role: message.role,
            content: { type: types_1.ContentType.TEXT, text: '' },
        };
        // 处理内容
        if (typeof message.content === 'string') {
            result.content = { type: types_1.ContentType.TEXT, text: message.content };
        }
        else if (Array.isArray(message.content)) {
            const contents = [];
            const contentArray = message.content;
            for (const content of contentArray) {
                if (content.type === 'text') {
                    contents.push({ type: types_1.ContentType.TEXT, text: content.text });
                }
                else if (content.type === 'image_url') {
                    contents.push({
                        type: types_1.ContentType.IMAGE,
                        url: content.image_url.url,
                        metadata: { detail: content.image_url.detail },
                    });
                }
            }
            if (contents.length === 1) {
                result.content = contents[0];
            }
            else if (contents.length > 1) {
                result.content = contents;
            }
        }
        // 处理函数调用
        if (message.function_call) {
            result.functionCall = {
                name: message.function_call.name,
                arguments: message.function_call.arguments,
            };
        }
        else if (message.tool_calls && message.tool_calls.length > 0) {
            const toolCall = message.tool_calls[0];
            if (toolCall.type === 'function') {
                result.functionCall = {
                    name: toolCall.function.name,
                    arguments: toolCall.function.arguments,
                };
            }
        }
        return result;
    }
    /**
     * 聊天完成
     */
    async chat(messages, options) {
        const model = options?.model || 'gpt-3.5-turbo';
        try {
            const openaiMessages = this.convertToOpenAIMessages(messages);
            const tools = this.convertToOpenAIFunctions(options?.functions);
            const toolChoice = this.convertToOpenAIFunctionCall(options?.functionCall);
            const response = await this.client.chat.completions.create({
                model,
                messages: openaiMessages,
                temperature: options?.temperature,
                max_tokens: options?.maxTokens,
                top_p: options?.topP,
                frequency_penalty: options?.frequencyPenalty,
                presence_penalty: options?.presencePenalty,
                stop: options?.stopSequences,
                tools,
                tool_choice: toolChoice,
            });
            const message = this.convertFromOpenAIMessage(response.choices[0].message);
            return {
                message,
                model,
                provider: types_1.AIProvider.OPENAI,
                promptTokens: response.usage?.prompt_tokens || 0,
                completionTokens: response.usage?.completion_tokens || 0,
                totalTokens: response.usage?.total_tokens || 0,
            };
        }
        catch (error) {
            this.logger.error('Failed to chat completion:', { error: error instanceof Error ? error : String(error) });
            throw error;
        }
    }
    /**
     * 流式聊天完成
     */
    async *chatStream(messages, options) {
        const model = options?.model || 'gpt-3.5-turbo';
        try {
            const openaiMessages = this.convertToOpenAIMessages(messages);
            const tools = this.convertToOpenAIFunctions(options?.functions);
            const toolChoice = this.convertToOpenAIFunctionCall(options?.functionCall);
            const stream = await this.client.chat.completions.create({
                model,
                messages: openaiMessages,
                temperature: options?.temperature,
                max_tokens: options?.maxTokens,
                top_p: options?.topP,
                frequency_penalty: options?.frequencyPenalty,
                presence_penalty: options?.presencePenalty,
                stop: options?.stopSequences,
                tools,
                tool_choice: toolChoice,
                stream: true,
            });
            // 发送开始事件
            yield {
                type: types_1.ChatStreamEventType.START,
                model,
                provider: types_1.AIProvider.OPENAI,
            };
            let functionCall;
            let content = '';
            let promptTokens = 0;
            let completionTokens = 0;
            for await (const chunk of stream) {
                const delta = chunk.choices[0].delta;
                // 处理内容
                if (typeof delta.content === 'string' && delta.content) {
                    content += delta.content;
                    completionTokens += this.estimateTokenCount(delta.content);
                    yield {
                        type: types_1.ChatStreamEventType.TOKEN,
                        data: delta.content,
                    };
                }
                // 处理函数调用
                if (delta.function_call) {
                    if (!functionCall) {
                        functionCall = { name: '', arguments: '' };
                        yield {
                            type: types_1.ChatStreamEventType.FUNCTION_CALL,
                            functionCall,
                        };
                    }
                    if (delta.function_call.name) {
                        functionCall.name = (functionCall.name || '') + delta.function_call.name;
                    }
                    if (delta.function_call.arguments) {
                        functionCall.arguments = (functionCall.arguments || '') + delta.function_call.arguments;
                        completionTokens += this.estimateTokenCount(delta.function_call.arguments);
                        yield {
                            type: types_1.ChatStreamEventType.FUNCTION_CALL,
                            functionCall,
                        };
                    }
                }
                else if (delta.tool_calls && delta.tool_calls.length > 0) {
                    const toolCall = delta.tool_calls[0];
                    if (toolCall.type === 'function') {
                        if (!functionCall) {
                            functionCall = { name: '', arguments: '' };
                            yield {
                                type: types_1.ChatStreamEventType.FUNCTION_CALL,
                                functionCall,
                            };
                        }
                        if (toolCall.function?.name) {
                            functionCall.name = (functionCall.name || '') + toolCall.function.name;
                        }
                        if (toolCall.function?.arguments) {
                            functionCall.arguments = (functionCall.arguments || '') + toolCall.function.arguments;
                            completionTokens += this.estimateTokenCount(toolCall.function.arguments);
                            yield {
                                type: types_1.ChatStreamEventType.FUNCTION_CALL,
                                functionCall,
                            };
                        }
                    }
                }
            }
            // 估算提示令牌数
            promptTokens = this.estimateMessageTokenCount(messages, model);
            // 如果有函数调用，发送函数调用结束事件
            if (functionCall) {
                yield {
                    type: types_1.ChatStreamEventType.FUNCTION_CALL_END,
                    functionCall,
                };
            }
            // 发送结束事件
            yield {
                type: types_1.ChatStreamEventType.END,
                model,
                provider: types_1.AIProvider.OPENAI,
                stats: {
                    promptTokens,
                    completionTokens,
                    totalTokens: promptTokens + completionTokens,
                },
            };
        }
        catch (error) {
            this.logger.error('Failed to chat stream:', { error: error instanceof Error ? error : String(error) });
            yield {
                type: types_1.ChatStreamEventType.ERROR,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }
    /**
     * 估算文本的令牌数
     * 注意：这是一个粗略的估计，不如tiktoken准确
     */
    estimateTokenCount(text) {
        // 粗略估计：每4个字符约为1个令牌
        return Math.ceil(text.length / 4);
    }
    /**
     * 估算消息的令牌数
     */
    estimateMessageTokenCount(messages, model) {
        let totalTokens = 0;
        for (const message of messages) {
            // 每条消息有一个基础令牌开销
            totalTokens += 4;
            // 角色名称
            totalTokens += 1;
            // 内容
            if (Array.isArray(message.content)) {
                for (const content of message.content) {
                    if (content.type === types_1.ContentType.TEXT && content.text) {
                        totalTokens += this.estimateTokenCount(content.text);
                    }
                    // 图像令牌计算较复杂，这里简化处理
                    else if (content.type === types_1.ContentType.IMAGE) {
                        totalTokens += 85; // 基础图像令牌
                        if (content.metadata?.detail === 'high') {
                            totalTokens += 130; // 高清图像额外令牌
                        }
                    }
                }
            }
            else if (message.content.type === types_1.ContentType.TEXT && message.content.text) {
                totalTokens += this.estimateTokenCount(message.content.text);
            }
            else if (message.content.type === types_1.ContentType.IMAGE) {
                totalTokens += 85; // 基础图像令牌
                if (message.content.metadata?.detail === 'high') {
                    totalTokens += 130; // 高清图像额外令牌
                }
            }
            // 函数调用
            if (message.functionCall) {
                totalTokens += 4; // 函数调用基础开销
                totalTokens += this.estimateTokenCount(message.functionCall.name);
                totalTokens += this.estimateTokenCount(message.functionCall.arguments);
            }
            // 名称
            if (message.name) {
                totalTokens += this.estimateTokenCount(message.name);
            }
        }
        // 不同模型有不同的开销
        if (model.includes('gpt-4')) {
            totalTokens += 3;
        }
        else {
            totalTokens += 3;
        }
        return totalTokens;
    }
    /**
     * 计算文本的令牌数
     */
    async countTokens(text, model) {
        // 使用估算方法
        return this.estimateTokenCount(text);
    }
    /**
     * 计算消息的令牌数
     */
    async countMessageTokens(messages, model) {
        return this.estimateMessageTokenCount(messages, model || 'gpt-3.5-turbo');
    }
}
exports.OpenAIService = OpenAIService;
// 创建全局OpenAI服务实例
exports.globalOpenAIService = new OpenAIService();
//# sourceMappingURL=openai-service.js.map