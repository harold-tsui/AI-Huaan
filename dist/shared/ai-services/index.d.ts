/**
 * AI Services - AI服务模块
 *
 * 导出所有AI服务相关组件
 */
export * from './types';
export { OpenAIService, globalOpenAIService } from './openai-service';
export { AnthropicService, globalAnthropicService } from './anthropic-service';
export { AIRoutingService, globalAIRoutingService } from './ai-routing-service';
export { PromptManager, globalPromptManager } from './prompt-manager';
export declare const AI_SERVICES_VERSION = "1.0.0";
/**
 * 初始化AI服务模块
 * @returns 初始化状态
 */
export declare function initializeAIServices(): Promise<boolean>;
