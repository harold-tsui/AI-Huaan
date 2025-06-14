/**
 * AI Services - AI服务模块
 * 
 * 导出所有AI服务相关组件
 */

// 导出类型定义
export * from './types';

// 导出OpenAI服务
export { OpenAIService, globalOpenAIService } from './openai-service';

// 导出Anthropic服务
export { AnthropicService, globalAnthropicService } from './anthropic-service';

// 导出AI路由服务
export { AIRoutingService, globalAIRoutingService } from './ai-routing-service';

// 导出提示模板管理器
export { PromptManager, globalPromptManager } from './prompt-manager';

// AI服务模块版本
export const AI_SERVICES_VERSION = '1.0.0';

/**
 * 初始化AI服务模块
 * @returns 初始化状态
 */
export async function initializeAIServices(): Promise<boolean> {
  try {
    // 这里不需要显式初始化服务，因为它们在导入时已经自动初始化
    // 但可以在这里添加额外的初始化逻辑
    
    return true;
  } catch (error) {
    console.error('Failed to initialize AI Services:', error);
    return false;
  }
}