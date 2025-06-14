"use strict";
/**
 * OpenAI Service - OpenAI服务实现
 *
 * 提供与OpenAI API的集成
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalOpenAIService = exports.OpenAIService = void 0;
var openai_1 = require("openai");
var config_1 = require("../../utils/config");
var logger_1 = require("../../utils/logger");
var types_1 = require("./types");
/**
 * OpenAI服务实现
 */
var OpenAIService = /** @class */ (function () {
    /**
     * 构造函数
     */
    function OpenAIService() {
        var _a, _b, _c, _d, _e, _f;
        this.availableModels = [];
        this.logger = new logger_1.Logger('OpenAIService');
        var config = config_1.ConfigManager.getInstance().getConfig();
        this.apiKey = ((_b = (_a = config.ai) === null || _a === void 0 ? void 0 : _a.openai) === null || _b === void 0 ? void 0 : _b.apiKey) || process.env.OPENAI_API_KEY || '';
        this.organization = ((_d = (_c = config.ai) === null || _c === void 0 ? void 0 : _c.openai) === null || _d === void 0 ? void 0 : _d.organization) || process.env.OPENAI_ORGANIZATION;
        this.baseURL = ((_f = (_e = config.ai) === null || _e === void 0 ? void 0 : _e.openai) === null || _f === void 0 ? void 0 : _f.baseURL) || process.env.OPENAI_BASE_URL;
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
    OpenAIService.prototype.initializeModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.models.list()];
                    case 1:
                        response = _a.sent();
                        // 转换为标准模型格式
                        this.availableModels = response.data.map(function (model) { return _this.mapToAIModel(model); });
                        this.logger.info("Initialized ".concat(this.availableModels.length, " OpenAI models"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error('Failed to initialize OpenAI models:', { error: error_1 instanceof Error ? error_1 : String(error_1) });
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
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 将OpenAI模型映射到标准模型格式
     */
    OpenAIService.prototype.mapToAIModel = function (model) {
        // 确定模型类型
        var type = types_1.AIModelType.COMPLETION;
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
        var contextWindow = 4096;
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
            type: type,
            name: model.id,
            version: '1.0',
            contextWindow: contextWindow,
            maxTokens: Math.min(4096, contextWindow),
            description: model.id,
        };
    };
    /**
     * 获取可用模型列表
     */
    OpenAIService.prototype.getAvailableModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.availableModels];
            });
        });
    };
    /**
     * 创建文本嵌入
     */
    OpenAIService.prototype.createEmbedding = function (text, options) {
        return __awaiter(this, void 0, void 0, function () {
            var model, response, embedding, dimensions, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        model = (options === null || options === void 0 ? void 0 : options.model) || 'text-embedding-ada-002';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.embeddings.create({
                                model: model,
                                input: text,
                                dimensions: options === null || options === void 0 ? void 0 : options.dimensions,
                            })];
                    case 2:
                        response = _a.sent();
                        embedding = response.data[0].embedding;
                        dimensions = embedding.length;
                        return [2 /*return*/, {
                                embedding: embedding,
                                model: model,
                                provider: types_1.AIProvider.OPENAI,
                                dimensions: dimensions,
                                tokenCount: response.usage.total_tokens,
                                truncated: false,
                            }];
                    case 3:
                        error_2 = _a.sent();
                        this.logger.error('Failed to create embedding:', { error: error_2 instanceof Error ? error_2 : String(error_2) });
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量创建文本嵌入
     */
    OpenAIService.prototype.createEmbeddings = function (texts, options) {
        return __awaiter(this, void 0, void 0, function () {
            var model, response_1, sortedData, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        model = (options === null || options === void 0 ? void 0 : options.model) || 'text-embedding-ada-002';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.client.embeddings.create({
                                model: model,
                                input: texts,
                                dimensions: options === null || options === void 0 ? void 0 : options.dimensions,
                            })];
                    case 2:
                        response_1 = _a.sent();
                        sortedData = response_1.data.sort(function (a, b) { return a.index - b.index; });
                        return [2 /*return*/, sortedData.map(function (item) { return ({
                                embedding: item.embedding,
                                model: model,
                                provider: types_1.AIProvider.OPENAI,
                                dimensions: item.embedding.length,
                                tokenCount: Math.floor(response_1.usage.total_tokens / texts.length), // 平均分配令牌数
                                truncated: false,
                            }); })];
                    case 3:
                        error_3 = _a.sent();
                        this.logger.error('Failed to create embeddings:', { error: error_3 instanceof Error ? error_3 : String(error_3) });
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 将标准消息格式转换为OpenAI消息格式
     */
    OpenAIService.prototype.convertToOpenAIMessages = function (messages) {
        return messages.map(function (message) {
            var _a;
            // 创建基本消息对象
            var openaiMessage = {
                role: message.role,
            };
            // 对于function角色，需要设置name和content属性
            if (message.role === types_1.MessageRole.FUNCTION && message.name) {
                openaiMessage.name = message.name;
                openaiMessage.content = typeof message.content === 'string' ? message.content : '';
            }
            // 处理内容
            if (Array.isArray(message.content)) {
                openaiMessage.content = message.content.map(function (content) {
                    var _a;
                    if (content.type === types_1.ContentType.TEXT) {
                        return { type: 'text', text: content.text || '' };
                    }
                    else if (content.type === types_1.ContentType.IMAGE) {
                        return {
                            type: 'image_url',
                            image_url: {
                                url: content.url || content.data || '',
                                detail: ((_a = content.metadata) === null || _a === void 0 ? void 0 : _a.detail) || 'auto',
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
                            detail: ((_a = message.content.metadata) === null || _a === void 0 ? void 0 : _a.detail) || 'auto',
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
    };
    /**
     * 将OpenAI函数定义转换为标准格式
     */
    OpenAIService.prototype.convertToOpenAIFunctions = function (functions) {
        if (!functions || functions.length === 0) {
            return undefined;
        }
        return functions.map(function (func) { return ({
            type: 'function',
            function: {
                name: func.name,
                description: func.description,
                parameters: func.parameters,
            },
        }); });
    };
    /**
     * 将OpenAI函数调用控制转换为标准格式
     */
    OpenAIService.prototype.convertToOpenAIFunctionCall = function (functionCall) {
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
    };
    /**
     * 将OpenAI消息转换为标准消息格式
     */
    OpenAIService.prototype.convertFromOpenAIMessage = function (message) {
        var result = {
            role: message.role,
            content: { type: types_1.ContentType.TEXT, text: '' },
        };
        // 处理内容
        if (typeof message.content === 'string') {
            result.content = { type: types_1.ContentType.TEXT, text: message.content };
        }
        else if (Array.isArray(message.content)) {
            var contents = [];
            var contentArray = message.content;
            for (var _i = 0, contentArray_1 = contentArray; _i < contentArray_1.length; _i++) {
                var content = contentArray_1[_i];
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
            var toolCall = message.tool_calls[0];
            if (toolCall.type === 'function') {
                result.functionCall = {
                    name: toolCall.function.name,
                    arguments: toolCall.function.arguments,
                };
            }
        }
        return result;
    };
    /**
     * 聊天完成
     */
    OpenAIService.prototype.chat = function (messages, options) {
        return __awaiter(this, void 0, void 0, function () {
            var model, openaiMessages, tools, toolChoice, response, message, error_4;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        model = (options === null || options === void 0 ? void 0 : options.model) || 'gpt-3.5-turbo';
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        openaiMessages = this.convertToOpenAIMessages(messages);
                        tools = this.convertToOpenAIFunctions(options === null || options === void 0 ? void 0 : options.functions);
                        toolChoice = this.convertToOpenAIFunctionCall(options === null || options === void 0 ? void 0 : options.functionCall);
                        return [4 /*yield*/, this.client.chat.completions.create({
                                model: model,
                                messages: openaiMessages,
                                temperature: options === null || options === void 0 ? void 0 : options.temperature,
                                max_tokens: options === null || options === void 0 ? void 0 : options.maxTokens,
                                top_p: options === null || options === void 0 ? void 0 : options.topP,
                                frequency_penalty: options === null || options === void 0 ? void 0 : options.frequencyPenalty,
                                presence_penalty: options === null || options === void 0 ? void 0 : options.presencePenalty,
                                stop: options === null || options === void 0 ? void 0 : options.stopSequences,
                                tools: tools,
                                tool_choice: toolChoice,
                            })];
                    case 2:
                        response = _d.sent();
                        message = this.convertFromOpenAIMessage(response.choices[0].message);
                        return [2 /*return*/, {
                                message: message,
                                model: model,
                                provider: types_1.AIProvider.OPENAI,
                                promptTokens: ((_a = response.usage) === null || _a === void 0 ? void 0 : _a.prompt_tokens) || 0,
                                completionTokens: ((_b = response.usage) === null || _b === void 0 ? void 0 : _b.completion_tokens) || 0,
                                totalTokens: ((_c = response.usage) === null || _c === void 0 ? void 0 : _c.total_tokens) || 0,
                            }];
                    case 3:
                        error_4 = _d.sent();
                        this.logger.error('Failed to chat completion:', { error: error_4 instanceof Error ? error_4 : String(error_4) });
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 流式聊天完成
     */
    OpenAIService.prototype.chatStream = function (messages, options) {
        return __asyncGenerator(this, arguments, function chatStream_1() {
            var model, openaiMessages, tools, toolChoice, stream, functionCall, content, promptTokens, completionTokens, _a, stream_1, stream_1_1, chunk, delta, toolCall, e_1_1, error_5;
            var _b, e_1, _c, _d;
            var _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        model = (options === null || options === void 0 ? void 0 : options.model) || 'gpt-3.5-turbo';
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 37, , 40]);
                        openaiMessages = this.convertToOpenAIMessages(messages);
                        tools = this.convertToOpenAIFunctions(options === null || options === void 0 ? void 0 : options.functions);
                        toolChoice = this.convertToOpenAIFunctionCall(options === null || options === void 0 ? void 0 : options.functionCall);
                        return [4 /*yield*/, __await(this.client.chat.completions.create({
                                model: model,
                                messages: openaiMessages,
                                temperature: options === null || options === void 0 ? void 0 : options.temperature,
                                max_tokens: options === null || options === void 0 ? void 0 : options.maxTokens,
                                top_p: options === null || options === void 0 ? void 0 : options.topP,
                                frequency_penalty: options === null || options === void 0 ? void 0 : options.frequencyPenalty,
                                presence_penalty: options === null || options === void 0 ? void 0 : options.presencePenalty,
                                stop: options === null || options === void 0 ? void 0 : options.stopSequences,
                                tools: tools,
                                tool_choice: toolChoice,
                                stream: true,
                            }))];
                    case 2:
                        stream = _g.sent();
                        return [4 /*yield*/, __await({
                                type: types_1.ChatStreamEventType.START,
                                model: model,
                                provider: types_1.AIProvider.OPENAI,
                            })];
                    case 3: 
                    // 发送开始事件
                    return [4 /*yield*/, _g.sent()];
                    case 4:
                        // 发送开始事件
                        _g.sent();
                        functionCall = void 0;
                        content = '';
                        promptTokens = 0;
                        completionTokens = 0;
                        _g.label = 5;
                    case 5:
                        _g.trys.push([5, 25, 26, 31]);
                        _a = true, stream_1 = __asyncValues(stream);
                        _g.label = 6;
                    case 6: return [4 /*yield*/, __await(stream_1.next())];
                    case 7:
                        if (!(stream_1_1 = _g.sent(), _b = stream_1_1.done, !_b)) return [3 /*break*/, 24];
                        _d = stream_1_1.value;
                        _a = false;
                        chunk = _d;
                        delta = chunk.choices[0].delta;
                        if (!(typeof delta.content === 'string' && delta.content)) return [3 /*break*/, 10];
                        content += delta.content;
                        completionTokens += this.estimateTokenCount(delta.content);
                        return [4 /*yield*/, __await({
                                type: types_1.ChatStreamEventType.TOKEN,
                                data: delta.content,
                            })];
                    case 8: return [4 /*yield*/, _g.sent()];
                    case 9:
                        _g.sent();
                        _g.label = 10;
                    case 10:
                        if (!delta.function_call) return [3 /*break*/, 17];
                        if (!!functionCall) return [3 /*break*/, 13];
                        functionCall = { name: '', arguments: '' };
                        return [4 /*yield*/, __await({
                                type: types_1.ChatStreamEventType.FUNCTION_CALL,
                                functionCall: functionCall,
                            })];
                    case 11: return [4 /*yield*/, _g.sent()];
                    case 12:
                        _g.sent();
                        _g.label = 13;
                    case 13:
                        if (delta.function_call.name) {
                            functionCall.name = (functionCall.name || '') + delta.function_call.name;
                        }
                        if (!delta.function_call.arguments) return [3 /*break*/, 16];
                        functionCall.arguments = (functionCall.arguments || '') + delta.function_call.arguments;
                        completionTokens += this.estimateTokenCount(delta.function_call.arguments);
                        return [4 /*yield*/, __await({
                                type: types_1.ChatStreamEventType.FUNCTION_CALL,
                                functionCall: functionCall,
                            })];
                    case 14: return [4 /*yield*/, _g.sent()];
                    case 15:
                        _g.sent();
                        _g.label = 16;
                    case 16: return [3 /*break*/, 23];
                    case 17:
                        if (!(delta.tool_calls && delta.tool_calls.length > 0)) return [3 /*break*/, 23];
                        toolCall = delta.tool_calls[0];
                        if (!(toolCall.type === 'function')) return [3 /*break*/, 23];
                        if (!!functionCall) return [3 /*break*/, 20];
                        functionCall = { name: '', arguments: '' };
                        return [4 /*yield*/, __await({
                                type: types_1.ChatStreamEventType.FUNCTION_CALL,
                                functionCall: functionCall,
                            })];
                    case 18: return [4 /*yield*/, _g.sent()];
                    case 19:
                        _g.sent();
                        _g.label = 20;
                    case 20:
                        if ((_e = toolCall.function) === null || _e === void 0 ? void 0 : _e.name) {
                            functionCall.name = (functionCall.name || '') + toolCall.function.name;
                        }
                        if (!((_f = toolCall.function) === null || _f === void 0 ? void 0 : _f.arguments)) return [3 /*break*/, 23];
                        functionCall.arguments = (functionCall.arguments || '') + toolCall.function.arguments;
                        completionTokens += this.estimateTokenCount(toolCall.function.arguments);
                        return [4 /*yield*/, __await({
                                type: types_1.ChatStreamEventType.FUNCTION_CALL,
                                functionCall: functionCall,
                            })];
                    case 21: return [4 /*yield*/, _g.sent()];
                    case 22:
                        _g.sent();
                        _g.label = 23;
                    case 23:
                        _a = true;
                        return [3 /*break*/, 6];
                    case 24: return [3 /*break*/, 31];
                    case 25:
                        e_1_1 = _g.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 31];
                    case 26:
                        _g.trys.push([26, , 29, 30]);
                        if (!(!_a && !_b && (_c = stream_1.return))) return [3 /*break*/, 28];
                        return [4 /*yield*/, __await(_c.call(stream_1))];
                    case 27:
                        _g.sent();
                        _g.label = 28;
                    case 28: return [3 /*break*/, 30];
                    case 29:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 30: return [7 /*endfinally*/];
                    case 31:
                        // 估算提示令牌数
                        promptTokens = this.estimateMessageTokenCount(messages, model);
                        if (!functionCall) return [3 /*break*/, 34];
                        return [4 /*yield*/, __await({
                                type: types_1.ChatStreamEventType.FUNCTION_CALL_END,
                                functionCall: functionCall,
                            })];
                    case 32: return [4 /*yield*/, _g.sent()];
                    case 33:
                        _g.sent();
                        _g.label = 34;
                    case 34: return [4 /*yield*/, __await({
                            type: types_1.ChatStreamEventType.END,
                            model: model,
                            provider: types_1.AIProvider.OPENAI,
                            stats: {
                                promptTokens: promptTokens,
                                completionTokens: completionTokens,
                                totalTokens: promptTokens + completionTokens,
                            },
                        })];
                    case 35: 
                    // 发送结束事件
                    return [4 /*yield*/, _g.sent()];
                    case 36:
                        // 发送结束事件
                        _g.sent();
                        return [3 /*break*/, 40];
                    case 37:
                        error_5 = _g.sent();
                        this.logger.error('Failed to chat stream:', { error: error_5 instanceof Error ? error_5 : String(error_5) });
                        return [4 /*yield*/, __await({
                                type: types_1.ChatStreamEventType.ERROR,
                                error: error_5 instanceof Error ? error_5 : new Error(String(error_5)),
                            })];
                    case 38: return [4 /*yield*/, _g.sent()];
                    case 39:
                        _g.sent();
                        return [3 /*break*/, 40];
                    case 40: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 估算文本的令牌数
     * 注意：这是一个粗略的估计，不如tiktoken准确
     */
    OpenAIService.prototype.estimateTokenCount = function (text) {
        // 粗略估计：每4个字符约为1个令牌
        return Math.ceil(text.length / 4);
    };
    /**
     * 估算消息的令牌数
     */
    OpenAIService.prototype.estimateMessageTokenCount = function (messages, model) {
        var _a, _b;
        var totalTokens = 0;
        for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
            var message = messages_1[_i];
            // 每条消息有一个基础令牌开销
            totalTokens += 4;
            // 角色名称
            totalTokens += 1;
            // 内容
            if (Array.isArray(message.content)) {
                for (var _c = 0, _d = message.content; _c < _d.length; _c++) {
                    var content = _d[_c];
                    if (content.type === types_1.ContentType.TEXT && content.text) {
                        totalTokens += this.estimateTokenCount(content.text);
                    }
                    // 图像令牌计算较复杂，这里简化处理
                    else if (content.type === types_1.ContentType.IMAGE) {
                        totalTokens += 85; // 基础图像令牌
                        if (((_a = content.metadata) === null || _a === void 0 ? void 0 : _a.detail) === 'high') {
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
                if (((_b = message.content.metadata) === null || _b === void 0 ? void 0 : _b.detail) === 'high') {
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
    };
    /**
     * 计算文本的令牌数
     */
    OpenAIService.prototype.countTokens = function (text, model) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 使用估算方法
                return [2 /*return*/, this.estimateTokenCount(text)];
            });
        });
    };
    /**
     * 计算消息的令牌数
     */
    OpenAIService.prototype.countMessageTokens = function (messages, model) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.estimateMessageTokenCount(messages, model || 'gpt-3.5-turbo')];
            });
        });
    };
    return OpenAIService;
}());
exports.OpenAIService = OpenAIService;
// 创建全局OpenAI服务实例
exports.globalOpenAIService = new OpenAIService();
