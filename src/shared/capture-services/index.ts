/**
 * Capture Services Module - 捕获服务模块
 * 
 * 导出捕获服务相关的所有组件
 */

// 导出类型和接口
export * from './types';

// 导出基础捕获处理器
export * from './base-capture-processor';

// 导出捕获服务
export * from './capture-service';

// 导出具体的捕获处理器
export * from './web-capture-processor';
export * from './text-capture-processor';
export * from './file-capture-processor';

// 定义模块版本
export const CAPTURE_SERVICES_VERSION = '1.0.0';

// 全局捕获服务实例
import { globalCaptureService } from './capture-service';
export { globalCaptureService };

// 导入依赖服务
import { globalKnowledgeGraphService } from '../knowledge-graph-services';
import { globalAIRoutingService } from '../ai-services';
import { IKnowledgeGraphService } from '../knowledge-graph-services/types';
import { IAIService } from '../ai-services/types';

/**
 * 初始化捕获服务模块
 */
export async function initializeCaptureServices(): Promise<boolean> {
  try {
    // 初始化捕获服务
    const initialized = await globalCaptureService.initialize();
    if (!initialized) {
      console.error('Failed to initialize capture service');
      return false;
    }
    
    // 设置依赖服务
    if (globalKnowledgeGraphService) {
      globalCaptureService.setKnowledgeGraphService(globalKnowledgeGraphService as IKnowledgeGraphService);
    }
    
    if (globalAIRoutingService) {
      globalCaptureService.setAIService(globalAIRoutingService as IAIService);
    }
    
    // 注册处理器
    const webCaptureProcessor = new (await import('./web-capture-processor')).WebCaptureProcessor(
      globalAIRoutingService,
      globalKnowledgeGraphService
    );
    globalCaptureService.registerProcessor(webCaptureProcessor);
    
    const textCaptureProcessor = new (await import('./text-capture-processor')).TextCaptureProcessor(
      globalAIRoutingService,
      globalKnowledgeGraphService
    );
    globalCaptureService.registerProcessor(textCaptureProcessor);
    
    const fileCaptureProcessor = new (await import('./file-capture-processor')).FileCaptureProcessor(
      globalAIRoutingService,
      globalKnowledgeGraphService
    );
    globalCaptureService.registerProcessor(fileCaptureProcessor);
    
    console.log(`Capture Services Module v${CAPTURE_SERVICES_VERSION} initialized successfully`);
    return true;
  } catch (error) {
    console.error('Failed to initialize capture services module', error);
    return false;
  }
}