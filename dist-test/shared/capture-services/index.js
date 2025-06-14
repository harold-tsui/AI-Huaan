"use strict";
/**
 * Capture Services Module - 捕获服务模块
 *
 * 导出捕获服务相关的所有组件
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
exports.globalCaptureService = exports.CAPTURE_SERVICES_VERSION = void 0;
exports.initializeCaptureServices = initializeCaptureServices;
// 导出类型和接口
__exportStar(require("./types"), exports);
// 导出基础捕获处理器
__exportStar(require("./base-capture-processor"), exports);
// 导出捕获服务
__exportStar(require("./capture-service"), exports);
// 导出具体的捕获处理器
__exportStar(require("./web-capture-processor"), exports);
__exportStar(require("./text-capture-processor"), exports);
__exportStar(require("./file-capture-processor"), exports);
// 定义模块版本
exports.CAPTURE_SERVICES_VERSION = '1.0.0';
// 全局捕获服务实例
const capture_service_1 = require("./capture-service");
Object.defineProperty(exports, "globalCaptureService", { enumerable: true, get: function () { return capture_service_1.globalCaptureService; } });
// 导入依赖服务
const knowledge_graph_services_1 = require("../knowledge-graph-services");
const ai_services_1 = require("../ai-services");
/**
 * 初始化捕获服务模块
 */
async function initializeCaptureServices() {
    try {
        // 初始化捕获服务
        const initialized = await capture_service_1.globalCaptureService.initialize();
        if (!initialized) {
            console.error('Failed to initialize capture service');
            return false;
        }
        // 设置依赖服务
        if (knowledge_graph_services_1.globalKnowledgeGraphService) {
            capture_service_1.globalCaptureService.setKnowledgeGraphService(knowledge_graph_services_1.globalKnowledgeGraphService);
        }
        if (ai_services_1.globalAIRoutingService) {
            capture_service_1.globalCaptureService.setAIService(ai_services_1.globalAIRoutingService);
        }
        // 注册处理器
        const webCaptureProcessor = new (await Promise.resolve().then(() => __importStar(require('./web-capture-processor')))).WebCaptureProcessor(ai_services_1.globalAIRoutingService, knowledge_graph_services_1.globalKnowledgeGraphService);
        capture_service_1.globalCaptureService.registerProcessor(webCaptureProcessor);
        const textCaptureProcessor = new (await Promise.resolve().then(() => __importStar(require('./text-capture-processor')))).TextCaptureProcessor(ai_services_1.globalAIRoutingService, knowledge_graph_services_1.globalKnowledgeGraphService);
        capture_service_1.globalCaptureService.registerProcessor(textCaptureProcessor);
        const fileCaptureProcessor = new (await Promise.resolve().then(() => __importStar(require('./file-capture-processor')))).FileCaptureProcessor(ai_services_1.globalAIRoutingService, knowledge_graph_services_1.globalKnowledgeGraphService);
        capture_service_1.globalCaptureService.registerProcessor(fileCaptureProcessor);
        console.log(`Capture Services Module v${exports.CAPTURE_SERVICES_VERSION} initialized successfully`);
        return true;
    }
    catch (error) {
        console.error('Failed to initialize capture services module', error);
        return false;
    }
}
//# sourceMappingURL=index.js.map