"use strict";
/**
 * Capture Processors - 捕获处理器
 *
 * 导出所有捕获处理器
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
exports.getAllProcessors = getAllProcessors;
exports.getProcessorForSourceType = getProcessorForSourceType;
exports.getProcessorByName = getProcessorByName;
exports.initializeProcessors = initializeProcessors;
// 导出处理器类型
__exportStar(require("../types"), exports);
// 导出文本处理器
__exportStar(require("./text-processor"), exports);
// 导出网页处理器
__exportStar(require("./web-processor"), exports);
// 导出文件处理器
__exportStar(require("./file-processor"), exports);
// 导入处理器
const text_processor_1 = require("./text-processor");
const web_processor_1 = require("./web-processor");
const file_processor_1 = require("./file-processor");
/**
 * 获取所有处理器
 */
function getAllProcessors() {
    return [
        text_processor_1.globalTextProcessor,
        web_processor_1.globalWebProcessor,
        file_processor_1.globalFileProcessor,
    ];
}
/**
 * 根据源类型获取处理器
 */
function getProcessorForSourceType(sourceType) {
    return getAllProcessors().find(processor => processor.getSupportedSourceTypes().includes(sourceType));
}
/**
 * 根据名称获取处理器
 */
function getProcessorByName(name) {
    return getAllProcessors().find(processor => processor.getName() === name);
}
/**
 * 初始化所有处理器
 */
function initializeProcessors() {
    // 目前处理器不需要特殊初始化
    // 如果将来需要，可以在这里添加初始化代码
    console.log('Initializing capture processors...');
}
//# sourceMappingURL=index.js.map