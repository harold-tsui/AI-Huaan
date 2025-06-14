/**
 * Capture Services Module - 捕获服务模块
 *
 * 导出捕获服务相关的所有组件
 */
export * from './types';
export * from './base-capture-processor';
export * from './capture-service';
export * from './web-capture-processor';
export * from './text-capture-processor';
export * from './file-capture-processor';
export declare const CAPTURE_SERVICES_VERSION = "1.0.0";
import { globalCaptureService } from './capture-service';
export { globalCaptureService };
/**
 * 初始化捕获服务模块
 */
export declare function initializeCaptureServices(): Promise<boolean>;
