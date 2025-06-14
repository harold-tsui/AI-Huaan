"use strict";
/**
 * AI Services Types - AI服务类型定义
 *
 * 定义AI服务相关的类型和接口
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatStreamEventType = exports.ContentType = exports.MessageRole = exports.AIModelType = exports.AIProvider = void 0;
// AI提供商枚举
var AIProvider;
(function (AIProvider) {
    AIProvider["OPENAI"] = "openai";
    AIProvider["ANTHROPIC"] = "anthropic";
    AIProvider["LOCAL"] = "local";
    AIProvider["CUSTOM"] = "custom";
})(AIProvider || (exports.AIProvider = AIProvider = {}));
// AI模型类型枚举
var AIModelType;
(function (AIModelType) {
    AIModelType["EMBEDDING"] = "embedding";
    AIModelType["COMPLETION"] = "completion";
    AIModelType["CHAT"] = "chat";
    AIModelType["IMAGE"] = "image";
    AIModelType["AUDIO"] = "audio";
})(AIModelType || (exports.AIModelType = AIModelType = {}));
// 消息角色枚举
var MessageRole;
(function (MessageRole) {
    MessageRole["SYSTEM"] = "system";
    MessageRole["USER"] = "user";
    MessageRole["ASSISTANT"] = "assistant";
    MessageRole["FUNCTION"] = "function";
})(MessageRole || (exports.MessageRole = MessageRole = {}));
// 消息内容类型枚举
var ContentType;
(function (ContentType) {
    ContentType["TEXT"] = "text";
    ContentType["IMAGE"] = "image";
    ContentType["AUDIO"] = "audio";
    ContentType["VIDEO"] = "video";
    ContentType["FILE"] = "file";
})(ContentType || (exports.ContentType = ContentType = {}));
// 聊天流事件类型
var ChatStreamEventType;
(function (ChatStreamEventType) {
    ChatStreamEventType["START"] = "start";
    ChatStreamEventType["TOKEN"] = "token";
    ChatStreamEventType["FUNCTION_CALL"] = "function_call";
    ChatStreamEventType["FUNCTION_CALL_END"] = "function_call_end";
    ChatStreamEventType["END"] = "end";
    ChatStreamEventType["ERROR"] = "error";
})(ChatStreamEventType || (exports.ChatStreamEventType = ChatStreamEventType = {}));
//# sourceMappingURL=types.js.map