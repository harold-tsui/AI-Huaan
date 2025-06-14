"use strict";
/**
 * MCP Core - MCP核心模块
 *
 * 导出所有MCP核心组件
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
exports.MCP_CORE_VERSION = exports.globalRequestHandler = exports.MCPRequestHandler = exports.globalServiceFactory = exports.MCPServiceFactory = exports.globalServiceRegistry = exports.MCPServiceRegistry = exports.BaseService = void 0;
exports.initializeMCPCore = initializeMCPCore;
// 导出类型定义
__exportStar(require("./types"), exports);
// 导出基础服务类
var base_service_1 = require("./base-service");
Object.defineProperty(exports, "BaseService", { enumerable: true, get: function () { return base_service_1.BaseService; } });
// 导出服务注册表
var service_registry_1 = require("./service-registry");
Object.defineProperty(exports, "MCPServiceRegistry", { enumerable: true, get: function () { return service_registry_1.MCPServiceRegistry; } });
Object.defineProperty(exports, "globalServiceRegistry", { enumerable: true, get: function () { return service_registry_1.globalServiceRegistry; } });
// 导出服务工厂
var service_factory_1 = require("./service-factory");
Object.defineProperty(exports, "MCPServiceFactory", { enumerable: true, get: function () { return service_factory_1.MCPServiceFactory; } });
Object.defineProperty(exports, "globalServiceFactory", { enumerable: true, get: function () { return service_factory_1.globalServiceFactory; } });
// 导出请求处理器
var request_handler_1 = require("./request-handler");
Object.defineProperty(exports, "MCPRequestHandler", { enumerable: true, get: function () { return request_handler_1.MCPRequestHandler; } });
Object.defineProperty(exports, "globalRequestHandler", { enumerable: true, get: function () { return request_handler_1.globalRequestHandler; } });
// MCP核心版本
exports.MCP_CORE_VERSION = '1.0.0';
/**
 * 初始化MCP核心模块
 * @returns 初始化状态
 */
async function initializeMCPCore() {
    try {
        // 这里可以添加核心模块的初始化逻辑
        // 例如加载配置、初始化数据库连接等
        return true;
    }
    catch (error) {
        console.error('Failed to initialize MCP Core:', error);
        return false;
    }
}
//# sourceMappingURL=index.js.map