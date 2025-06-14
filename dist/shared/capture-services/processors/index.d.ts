/**
 * Capture Processors - 捕获处理器
 *
 * 导出所有捕获处理器
 */
export * from '../types';
export * from './text-processor';
export * from './web-processor';
export * from './file-processor';
import { CaptureSourceType, ICaptureProcessor } from '../types';
/**
 * 获取所有处理器
 */
export declare function getAllProcessors(): ICaptureProcessor[];
/**
 * 根据源类型获取处理器
 */
export declare function getProcessorForSourceType(sourceType: CaptureSourceType): ICaptureProcessor | undefined;
/**
 * 根据名称获取处理器
 */
export declare function getProcessorByName(name: string): ICaptureProcessor | undefined;
/**
 * 初始化所有处理器
 */
export declare function initializeProcessors(): void;
