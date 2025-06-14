"use strict";
/**
 * AI Services - AI服务模块
 *
 * 导出所有AI服务相关组件
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_SERVICES_VERSION = exports.globalPromptManager = exports.PromptManager = exports.globalAIRoutingService = exports.AIRoutingService = exports.globalAnthropicService = exports.AnthropicService = exports.globalOpenAIService = exports.OpenAIService = void 0;
exports.initializeAIServices = initializeAIServices;
// 导出类型定义
__exportStar(require("./types"), exports);
// 导出OpenAI服务
var openai_service_1 = require("./openai-service");
Object.defineProperty(exports, "OpenAIService", { enumerable: true, get: function () { return openai_service_1.OpenAIService; } });
Object.defineProperty(exports, "globalOpenAIService", { enumerable: true, get: function () { return openai_service_1.globalOpenAIService; } });
// 导出Anthropic服务
var anthropic_service_1 = require("./anthropic-service");
Object.defineProperty(exports, "AnthropicService", { enumerable: true, get: function () { return anthropic_service_1.AnthropicService; } });
Object.defineProperty(exports, "globalAnthropicService", { enumerable: true, get: function () { return anthropic_service_1.globalAnthropicService; } });
// 导出AI路由服务
var ai_routing_service_1 = require("./ai-routing-service");
Object.defineProperty(exports, "AIRoutingService", { enumerable: true, get: function () { return ai_routing_service_1.AIRoutingService; } });
Object.defineProperty(exports, "globalAIRoutingService", { enumerable: true, get: function () { return ai_routing_service_1.globalAIRoutingService; } });
// 导出提示模板管理器
var prompt_manager_1 = require("./prompt-manager");
Object.defineProperty(exports, "PromptManager", { enumerable: true, get: function () { return prompt_manager_1.PromptManager; } });
Object.defineProperty(exports, "globalPromptManager", { enumerable: true, get: function () { return prompt_manager_1.globalPromptManager; } });
// AI服务模块版本
exports.AI_SERVICES_VERSION = '1.0.0';
/**
 * 初始化AI服务模块
 * @returns 初始化状态
 */
async function initializeAIServices() {
    try {
        // 这里不需要显式初始化服务，因为它们在导入时已经自动初始化
        // 但可以在这里添加额外的初始化逻辑
        return true;
    }
    catch (error) {
        console.error('Failed to initialize AI Services:', error);
        return false;
    }
}
//# sourceMappingURL=index.js.map