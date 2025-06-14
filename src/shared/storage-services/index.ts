/**
 * Storage Services Module - 存储服务模块
 * 
 * 提供文件存储服务的统一接口和实现
 */

// 导出类型定义
export * from './types';

// 导出基础存储服务
export { BaseStorageService } from './base-storage-service';

// 导出本地存储服务
export { LocalStorageService } from './local-storage-service';

// 导出S3存储服务
export { S3StorageService } from './s3-storage-service';

// 存储服务模块版本
export const STORAGE_SERVICES_VERSION = '1.0.0';

// 全局存储服务实例
import { IStorageService, StorageProviderType } from './types';
import { LocalStorageService } from './local-storage-service';
import { S3StorageService } from './s3-storage-service';
import * as path from 'path';
import * as os from 'os';

// 全局存储服务实例
export let globalStorageService: IStorageService | null = null;

/**
 * 初始化存储服务
 * @param type 存储提供者类型
 * @param config 配置
 */
export async function initializeStorageService(
  type: StorageProviderType = StorageProviderType.LOCAL,
  config?: any
): Promise<IStorageService> {
  // 如果已经初始化，先关闭现有服务
  if (globalStorageService) {
    await globalStorageService.shutdown();
    globalStorageService = null;
  }
  
  // 根据类型创建存储服务
  switch (type) {
    case StorageProviderType.LOCAL:
      // 本地存储服务
      const localConfig = config || {
        rootDir: path.join(os.homedir(), '.basb', 'storage'),
        createDirs: true,
      };
      globalStorageService = new LocalStorageService(localConfig);
      break;
      
    case StorageProviderType.S3:
    case StorageProviderType.MINIO:
      // S3兼容存储服务
      if (!config) {
        throw new Error(`Configuration is required for ${type} storage provider`);
      }
      globalStorageService = new S3StorageService(config);
      break;
      
    case StorageProviderType.AZURE:
    case StorageProviderType.GCP:
    case StorageProviderType.CUSTOM:
      throw new Error(`Storage provider type ${type} is not implemented yet`);
      
    default:
      throw new Error(`Unknown storage provider type: ${type}`);
  }
  
  // 初始化存储服务
  const success = await globalStorageService.initialize();
  if (!success) {
    throw new Error(`Failed to initialize storage service of type ${type}`);
  }
  
  return globalStorageService;
}

/**
 * 获取全局存储服务实例
 */
export function getStorageService(): IStorageService {
  if (!globalStorageService) {
    throw new Error('Storage service is not initialized. Call initializeStorageService first.');
  }
  
  return globalStorageService;
}