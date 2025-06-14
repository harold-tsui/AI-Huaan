"use strict";
/**
 * Storage Services Module - 存储服务模块
 *
 * 提供文件存储服务的统一接口和实现
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalStorageService = exports.STORAGE_SERVICES_VERSION = exports.S3StorageService = exports.LocalStorageService = exports.BaseStorageService = void 0;
exports.initializeStorageService = initializeStorageService;
exports.getStorageService = getStorageService;
// 导出类型定义
__exportStar(require("./types"), exports);
// 导出基础存储服务
var base_storage_service_1 = require("./base-storage-service");
Object.defineProperty(exports, "BaseStorageService", { enumerable: true, get: function () { return base_storage_service_1.BaseStorageService; } });
// 导出本地存储服务
var local_storage_service_1 = require("./local-storage-service");
Object.defineProperty(exports, "LocalStorageService", { enumerable: true, get: function () { return local_storage_service_1.LocalStorageService; } });
// 导出S3存储服务
var s3_storage_service_1 = require("./s3-storage-service");
Object.defineProperty(exports, "S3StorageService", { enumerable: true, get: function () { return s3_storage_service_1.S3StorageService; } });
// 存储服务模块版本
exports.STORAGE_SERVICES_VERSION = '1.0.0';
// 全局存储服务实例
const types_1 = require("./types");
const local_storage_service_2 = require("./local-storage-service");
const s3_storage_service_2 = require("./s3-storage-service");
const path = __importStar(require("path"));
const os = __importStar(require("os"));
// 全局存储服务实例
exports.globalStorageService = null;
/**
 * 初始化存储服务
 * @param type 存储提供者类型
 * @param config 配置
 */
async function initializeStorageService(type = types_1.StorageProviderType.LOCAL, config) {
    // 如果已经初始化，先关闭现有服务
    if (exports.globalStorageService) {
        await exports.globalStorageService.shutdown();
        exports.globalStorageService = null;
    }
    // 根据类型创建存储服务
    switch (type) {
        case types_1.StorageProviderType.LOCAL:
            // 本地存储服务
            const localConfig = config || {
                rootDir: path.join(os.homedir(), '.basb', 'storage'),
                createDirs: true,
            };
            exports.globalStorageService = new local_storage_service_2.LocalStorageService(localConfig);
            break;
        case types_1.StorageProviderType.S3:
        case types_1.StorageProviderType.MINIO:
            // S3兼容存储服务
            if (!config) {
                throw new Error(`Configuration is required for ${type} storage provider`);
            }
            exports.globalStorageService = new s3_storage_service_2.S3StorageService(config);
            break;
        case types_1.StorageProviderType.AZURE:
        case types_1.StorageProviderType.GCP:
        case types_1.StorageProviderType.CUSTOM:
            throw new Error(`Storage provider type ${type} is not implemented yet`);
        default:
            throw new Error(`Unknown storage provider type: ${type}`);
    }
    // 初始化存储服务
    const success = await exports.globalStorageService.initialize();
    if (!success) {
        throw new Error(`Failed to initialize storage service of type ${type}`);
    }
    return exports.globalStorageService;
}
/**
 * 获取全局存储服务实例
 */
function getStorageService() {
    if (!exports.globalStorageService) {
        throw new Error('Storage service is not initialized. Call initializeStorageService first.');
    }
    return exports.globalStorageService;
}
//# sourceMappingURL=index.js.map