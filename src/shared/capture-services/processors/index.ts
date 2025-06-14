/**
 * Capture Processors - 捕获处理器
 * 
 * 导出所有捕获处理器
 */

// 导出处理器类型
export * from '../types';

// 导出文本处理器
export * from './text-processor';

// 导出网页处理器
export * from './web-processor';

// 导出文件处理器
export * from './file-processor';

// 导入处理器
import { globalTextProcessor } from './text-processor';
import { globalWebProcessor } from './web-processor';
import { globalFileProcessor } from './file-processor';
import { CaptureSourceType, ICaptureProcessor } from '../types';

/**
 * 获取所有处理器
 */
export function getAllProcessors(): ICaptureProcessor[] {
  return [
    globalTextProcessor,
    globalWebProcessor,
    globalFileProcessor,
  ];
}

/**
 * 根据源类型获取处理器
 */
export function getProcessorForSourceType(sourceType: CaptureSourceType): ICaptureProcessor | undefined {
  return getAllProcessors().find(processor => 
    processor.getSupportedSourceTypes().includes(sourceType)
  );
}

/**
 * 根据名称获取处理器
 */
export function getProcessorByName(name: string): ICaptureProcessor | undefined {
  return getAllProcessors().find(processor => processor.getName() === name);
}

/**
 * 初始化所有处理器
 */
export function initializeProcessors(): void {
  // 目前处理器不需要特殊初始化
  // 如果将来需要，可以在这里添加初始化代码
  console.log('Initializing capture processors...');
}