"use strict";
/**
 * Anthropic Service - Anthropic服务实现
 *
 * 提供与Anthropic API的集成
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalAnthropicService = exports.AnthropicService = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const config_1 = require("../../utils/config");
const logger_1 = require("../../utils/logger");
const types_1 = require("./types");
/**
 * Anthropic服务实现
 */
class AnthropicService {
    /**
     * 构造函数
     */
    constructor() {
        this.availableModels = [];
        this.logger = new logger_1.Logger('AnthropicService');
        const config = config_1.ConfigManager.getInstance().getConfig();
        this.apiKey = config.ai?.anthropic?.apiKey || process.env.ANTHROPIC_API_KEY || '';
        this.baseURL = config.ai?.anthropic?.baseURL || process.env.ANTHROPIC_BASE_URL;
        if (!this.apiKey) {
            this.logger.error('Anthropic API key is not provided');
            throw new Error('Anthropic API key is required');
        }
        this.client = new sdk_1.default({
            apiKey: this.apiKey,
            baseURL: this.baseURL,
        });
        this.initializeModels();
    }
    /**
     * 初始化模型列表
     */
    async initializeModels() {
        // Anthropic API目前不提供模型列表接口，使用硬编码的模型列表
        this.availableModels = [
            {
                id: 'claude-3-opus-20240229',
                provider: types_1.AIProvider.ANTHROPIC,
                type: types_1.AIModelType.CHAT,
                name: 'Claude 3 Opus',
                version: '20240229',
                contextWindow: 200000,
                maxTokens: 4096,
                description: 'Most powerful Claude model for highly complex tasks',
            },
            {
                id: 'claude-3-sonnet-20240229',
                provider: types_1.AIProvider.ANTHROPIC,
                type: types_1.AIModelType.CHAT,
                name: 'Claude 3 Sonnet',
                version: '20240229',
                contextWindow: 200000,
                maxTokens: 4096,
                description: 'Ideal balance of intelligence and speed for enterprise workloads',
            },
            {
                id: 'claude-3-haiku-20240307',
                provider: types_1.AIProvider.ANTHROPIC,
                type: types_1.AIModelType.CHAT,
                name: 'Claude 3 Haiku',
                version: '20240307',
                contextWindow: 200000,
                maxTokens: 4096,
                description: 'Fastest and most compact Claude model',
            },
            {
                id: 'claude-2.1',
                provider: types_1.AIProvider.ANTHROPIC,
                type: types_1.AIModelType.CHAT,
                name: 'Claude 2.1',
                version: '2.1',
                contextWindow: 200000,
                maxTokens: 4096,
                description: 'Improved version of Claude 2',
            },
            {
                id: 'claude-2.0',
                provider: types_1.AIProvider.ANTHROPIC,
                type: types_1.AIModelType.CHAT,
                name: 'Claude 2.0',
                version: '2.0',
                contextWindow: 100000,
                maxTokens: 4096,
                description: 'Older version of Claude 2',
            },
            {
                id: 'claude-instant-1.2',
                provider: types_1.AIProvider.ANTHROPIC,
                type: types_1.AIModelType.CHAT,
                name: 'Claude Instant 1.2',
                version: '1.2',
                contextWindow: 100000,
                maxTokens: 4096,
                description: 'Faster and more affordable version of Claude',
            },
        ];
        this.logger.info(`Initialized ${this.availableModels.length} Anthropic models`);
    }
    /**
     * 获取可用模型列表
     */
    async getAvailableModels() {
        return this.availableModels;
    }
    /**
     * 创建文本嵌入
     * 注意：Anthropic目前不提供嵌入API，这里抛出错误
     */
    async createEmbedding(text, options) {
        this.logger.error('Anthropic does not support embeddings');
        throw new Error('Anthropic does not support embeddings');
    }
    /**
     * 批量创建文本嵌入
     * 注意：Anthropic目前不提供嵌入API，这里抛出错误
     */
    async createEmbeddings(texts, options) {
        this.logger.error('Anthropic does not support embeddings');
        throw new Error('Anthropic does not support embeddings');
    }
    /**
     * 将标准消息格式转换为Anthropic消息格式
     */
    convertToAnthropicMessages(messages) {
        return messages.map(message => {
            // Anthropic只支持user和assistant角色，将system消息转换为user消息
            let role;
            if (message.role === types_1.MessageRole.SYSTEM) {
                role = 'user';
            }
            else if (message.role === types_1.MessageRole.ASSISTANT) {
                role = 'assistant';
            }
            else {
                role = 'user';
            }
            const anthropicMessage = {
                role,
            };
            // 处理内容
            if (Array.isArray(message.content)) {
                anthropicMessage.content = message.content.map(content => {
                    if (content.type === types_1.ContentType.TEXT) {
                        return { type: 'text', text: content.text || '' };
                    }
                    else if (content.type === types_1.ContentType.IMAGE) {
                        return {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: 'image/jpeg', // 假设为JPEG
                                data: content.data || '',
                            },
                        };
                    }
                    // 其他类型暂不支持
                    return { type: 'text', text: '' };
                });
            }
            else {
                // 使用类型断言确保TypeScript知道message.content是MessageContent类型
                const content = message.content;
                if (content.type === types_1.ContentType.TEXT) {
                    anthropicMessage.content = [{ type: 'text', text: content.text || '' }];
                }
                else if (content.type === types_1.ContentType.IMAGE) {
                    anthropicMessage.content = [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: 'image/jpeg', // 假设为JPEG
                                data: content.data || '',
                            },
                        }
                    ];
                }
            }
            return anthropicMessage;
        });
    }
    /**
     * 将Anthropic消息转换为标准消息格式
     */
    convertFromAnthropicMessage(message) {
        const result = {
            role: message.role === 'assistant' ? types_1.MessageRole.ASSISTANT : types_1.MessageRole.USER,
            content: { type: types_1.ContentType.TEXT, text: '' },
        };
        // 处理内容
        if (Array.isArray(message.content)) {
            const contents = [];
            for (const content of message.content) {
                if (content.type === 'text') {
                    contents.push({ type: types_1.ContentType.TEXT, text: content.text });
                }
                else if (content.type === 'image') {
                    // Anthropic响应中通常不会包含图像
                    contents.push({
                        type: types_1.ContentType.IMAGE,
                        data: '',
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
        // 处理工具调用（Claude 3支持）
        if (message.stop_reason === 'tool_use' && message.content && Array.isArray(message.content)) {
            // 尝试从内容中提取工具调用
            const toolUseContent = message.content.find(c => c.type === 'tool_use');
            if (toolUseContent && 'type' in toolUseContent && toolUseContent.type === 'tool_use') {
                result.functionCall = {
                    name: toolUseContent.name,
                    arguments: JSON.stringify(toolUseContent.input),
                };
            }
        }
        return result;
    }
    /**
     * 将标准函数定义转换为Anthropic工具定义
     */
    convertToAnthropicTools(functions) {
        if (!functions || functions.length === 0) {
            return undefined;
        }
        return functions.map(func => ({
            name: func.name,
            description: func.description,
            input_schema: func.parameters,
        }));
    }
    /**
     * 聊天完成
     */
    async chat(messages, options) {
        const model = options?.model || 'claude-3-sonnet-20240229';
        try {
            // 处理系统消息
            let systemPrompt;
            if (messages.length > 0 && messages[0].role === types_1.MessageRole.SYSTEM) {
                const systemMessage = messages[0];
                if (typeof systemMessage.content === 'object' && !Array.isArray(systemMessage.content) && systemMessage.content.type === types_1.ContentType.TEXT) {
                    systemPrompt = systemMessage.content.text;
                }
                else if (Array.isArray(systemMessage.content)) {
                    const textContent = systemMessage.content.find(c => c.type === types_1.ContentType.TEXT);
                    if (textContent) {
                        systemPrompt = textContent.text;
                    }
                }
                // 移除系统消息，因为它将作为系统提示发送
                messages = messages.slice(1);
            }
            const anthropicMessages = this.convertToAnthropicMessages(messages);
            const tools = this.convertToAnthropicTools(options?.functions);
            const response = await this.client.messages.create({
                model,
                messages: anthropicMessages,
                system: systemPrompt,
                temperature: options?.temperature,
                max_tokens: options?.maxTokens,
                top_p: options?.topP,
                stop_sequences: options?.stopSequences,
                tools: tools,
            });
            const message = this.convertFromAnthropicMessage(response);
            return {
                message,
                model,
                provider: types_1.AIProvider.ANTHROPIC,
                promptTokens: response.usage?.input_tokens || 0,
                completionTokens: response.usage?.output_tokens || 0,
                totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
            };
        }
        catch (error) {
            this.logger.error('Failed to chat completion:', error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }
    /**
     * 流式聊天完成
     */
    async *chatStream(messages, options) {
        const model = options?.model || 'claude-3-sonnet-20240229';
        try {
            // 处理系统消息
            let systemPrompt;
            if (messages.length > 0 && messages[0].role === types_1.MessageRole.SYSTEM) {
                const systemMessage = messages[0];
                if (typeof systemMessage.content === 'object' && !Array.isArray(systemMessage.content) && systemMessage.content.type === types_1.ContentType.TEXT) {
                    systemPrompt = systemMessage.content.text;
                }
                else if (Array.isArray(systemMessage.content)) {
                    const textContent = systemMessage.content.find(c => c.type === types_1.ContentType.TEXT);
                    if (textContent) {
                        systemPrompt = textContent.text;
                    }
                }
                // 移除系统消息，因为它将作为系统提示发送
                messages = messages.slice(1);
            }
            const anthropicMessages = this.convertToAnthropicMessages(messages);
            const tools = this.convertToAnthropicTools(options?.functions);
            const stream = await this.client.messages.create({
                model,
                messages: anthropicMessages,
                system: systemPrompt,
                temperature: options?.temperature,
                max_tokens: options?.maxTokens,
                top_p: options?.topP,
                stop_sequences: options?.stopSequences,
                tools: tools,
                stream: true,
            });
            // 发送开始事件
            yield {
                type: types_1.ChatStreamEventType.START,
                model,
                provider: types_1.AIProvider.ANTHROPIC,
            };
            let functionCall;
            let content = '';
            let promptTokens = 0;
            let completionTokens = 0;
            for await (const chunk of stream) {
                if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text') {
                    content += chunk.delta.text;
                    completionTokens += this.estimateTokenCount(chunk.delta.text);
                    yield {
                        type: types_1.ChatStreamEventType.TOKEN,
                        data: chunk.delta.text,
                    };
                }
                else if (chunk.type === 'content_block_start' && chunk.content_block.type === 'tool_use') {
                    // 工具使用开始
                    functionCall = {
                        name: chunk.content_block.name,
                        arguments: JSON.stringify(chunk.content_block.input),
                    };
                    yield {
                        type: types_1.ChatStreamEventType.FUNCTION_CALL,
                        functionCall,
                    };
                }
                else if (chunk.type === 'message_delta' && chunk.usage) {
                    // 更新令牌计数
                    promptTokens = chunk.usage.input_tokens;
                    completionTokens = chunk.usage.output_tokens;
                }
            }
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
                provider: types_1.AIProvider.ANTHROPIC,
                stats: {
                    promptTokens,
                    completionTokens,
                    totalTokens: promptTokens + completionTokens,
                },
            };
        }
        catch (error) {
            this.logger.error('Failed to chat stream:', error instanceof Error ? error : new Error(String(error)));
            yield {
                type: types_1.ChatStreamEventType.ERROR,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }
    /**
     * 估算文本的令牌数
     * 注意：这是一个粗略的估计，不如Claude的tokenizer准确
     */
    estimateTokenCount(text) {
        // Claude的分词器与GPT不同，大约每4个字符为1个令牌
        return Math.ceil(text.length / 4);
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
        let totalTokens = 0;
        // 系统提示
        if (messages.length > 0 && messages[0].role === types_1.MessageRole.SYSTEM) {
            const systemMessage = messages[0];
            if (typeof systemMessage.content === 'object' && !Array.isArray(systemMessage.content) && systemMessage.content.type === types_1.ContentType.TEXT) {
                totalTokens += this.estimateTokenCount(systemMessage.content.text || '');
            }
            else if (Array.isArray(systemMessage.content)) {
                const textContent = systemMessage.content.find(c => c.type === types_1.ContentType.TEXT);
                if (textContent) {
                    totalTokens += this.estimateTokenCount(textContent.text || '');
                }
            }
            // 移除系统消息，因为它已经计算过了
            messages = messages.slice(1);
        }
        // 其他消息
        for (const message of messages) {
            // 每条消息有一个基础令牌开销
            totalTokens += 5;
            // 内容
            if (Array.isArray(message.content)) {
                for (const content of message.content) {
                    if (content.type === types_1.ContentType.TEXT && content.text) {
                        totalTokens += this.estimateTokenCount(content.text);
                    }
                    // 图像令牌计算较复杂，这里简化处理
                    else if (content.type === types_1.ContentType.IMAGE) {
                        totalTokens += 128; // 基础图像令牌
                    }
                }
            }
            else if (message.content.type === types_1.ContentType.TEXT && message.content.text) {
                totalTokens += this.estimateTokenCount(message.content.text);
            }
            else if (message.content.type === types_1.ContentType.IMAGE) {
                totalTokens += 128; // 基础图像令牌
            }
        }
        // Claude模型的额外开销
        totalTokens += 10;
        return totalTokens;
    }
}
exports.AnthropicService = AnthropicService;
// 创建全局Anthropic服务实例
exports.globalAnthropicService = new AnthropicService();
//# sourceMappingURL=anthropic-service.js.map