"use strict";
/**
 * Capture Services Types - 捕获服务类型定义
 *
 * 定义捕获服务相关的类型和接口
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptureItemPriority = exports.CaptureItemStatus = exports.CaptureSourceType = void 0;
// 捕获源类型枚举
var CaptureSourceType;
(function (CaptureSourceType) {
    CaptureSourceType["WEB"] = "web";
    CaptureSourceType["FILE"] = "file";
    CaptureSourceType["TEXT"] = "text";
    CaptureSourceType["IMAGE"] = "image";
    CaptureSourceType["AUDIO"] = "audio";
    CaptureSourceType["VIDEO"] = "video";
    CaptureSourceType["EMAIL"] = "email";
    CaptureSourceType["RSS"] = "rss";
    CaptureSourceType["SOCIAL"] = "social";
    CaptureSourceType["API"] = "api";
    CaptureSourceType["CUSTOM"] = "custom";
})(CaptureSourceType || (exports.CaptureSourceType = CaptureSourceType = {}));
// 捕获项状态枚举
var CaptureItemStatus;
(function (CaptureItemStatus) {
    CaptureItemStatus["PENDING"] = "pending";
    CaptureItemStatus["PROCESSING"] = "processing";
    CaptureItemStatus["COMPLETED"] = "completed";
    CaptureItemStatus["FAILED"] = "failed";
    CaptureItemStatus["ARCHIVED"] = "archived";
})(CaptureItemStatus || (exports.CaptureItemStatus = CaptureItemStatus = {}));
// 捕获项优先级枚举
var CaptureItemPriority;
(function (CaptureItemPriority) {
    CaptureItemPriority["LOW"] = "low";
    CaptureItemPriority["MEDIUM"] = "medium";
    CaptureItemPriority["HIGH"] = "high";
    CaptureItemPriority["URGENT"] = "urgent";
    CaptureItemPriority["NORMAL"] = "NORMAL";
})(CaptureItemPriority || (exports.CaptureItemPriority = CaptureItemPriority = {}));
//# sourceMappingURL=types.js.map