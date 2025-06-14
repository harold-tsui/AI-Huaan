"use strict";
/**
 * MCP Request Handler - MCP请求处理器
 *
 * 处理MCP协议请求，路由到相应的服务
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalRequestHandler = exports.MCPRequestHandler = void 0;
const types_1 = require("./types");
const service_registry_1 = require("./service-registry");
const logger_1 = require("../../utils/logger");
class MCPRequestHandler {
    constructor() {
        this.logger = new logger_1.Logger('MCPRequestHandler');
    }
    /**
     * 处理MCP请求
     * @param request MCP请求对象
     * @returns MCP响应对象
     */
    async handleRequest(request) {
        this.logger.debug('Handling MCP request', { requestId: request.requestId, service: request.service });
        // 验证协议版本
        if (request.protocolVersion !== types_1.MCP_PROTOCOL_VERSION) {
            return this.createErrorResponse(request.requestId, types_1.MCPErrorCode.PROTOCOL_VERSION_MISMATCH, `Protocol version mismatch. Expected ${types_1.MCP_PROTOCOL_VERSION}, got ${request.protocolVersion}`);
        }
        // 查找服务
        const service = service_registry_1.globalServiceRegistry.getService(request.service, request.serviceVersion);
        if (!service) {
            return this.createErrorResponse(request.requestId, types_1.MCPErrorCode.SERVICE_NOT_FOUND, `Service not found: ${request.service}${request.serviceVersion ? `@${request.serviceVersion}` : ''}`);
        }
        try {
            // 调用服务处理请求
            const response = await this.invokeServiceMethod(service, request);
            this.logger.debug('Request handled successfully', { requestId: request.requestId });
            return response;
        }
        catch (error) {
            this.logger.error('Error handling request', {
                requestId: request.requestId,
                service: request.service,
                method: request.method,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            return this.createErrorResponse(request.requestId, types_1.MCPErrorCode.INTERNAL_ERROR, `Internal error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 调用服务方法
     * @param service 服务实例
     * @param request MCP请求对象
     * @returns MCP响应对象
     */
    async invokeServiceMethod(service, request) {
        const { requestId, method, params } = request;
        // 检查服务是否有该方法
        if (typeof service === 'object' && service !== null && !(method in service) || typeof service === 'object' && service !== null && method in service && typeof service[method] !== 'function') {
            return this.createErrorResponse(requestId, types_1.MCPErrorCode.METHOD_NOT_FOUND, `Method not found: ${method}`);
        }
        try {
            // 调用服务方法
            // 使用更安全的方式调用方法，确保方法存在
            const serviceMethod = service[method];
            const result = await serviceMethod.call(service, params);
            // 创建成功响应
            return {
                requestId,
                protocolVersion: types_1.MCP_PROTOCOL_VERSION,
                success: true,
                result
            };
        }
        catch (error) {
            // 处理服务方法抛出的错误
            let errorCode = types_1.MCPErrorCode.INTERNAL_ERROR;
            // 安全地获取错误消息，处理各种可能的错误对象类型
            let errorMessage = 'Unknown error';
            if (error) {
                if (typeof error === 'string') {
                    errorMessage = error;
                }
                else if (error instanceof Error) {
                    errorMessage = error.message || errorMessage;
                }
                else if (typeof error === 'object' && error !== null && 'message' in error) {
                    errorMessage = String(error.message);
                }
                else if (typeof error.toString === 'function') {
                    errorMessage = error.toString();
                }
            }
            // 如果错误对象包含错误码，使用它
            if (error && typeof error === 'object' && error !== null && 'code' in error) {
                const errorCodeValue = error.code;
                if (Object.values(types_1.MCPErrorCode).includes(errorCodeValue)) {
                    errorCode = errorCodeValue;
                }
            }
            return this.createErrorResponse(requestId, errorCode, errorMessage);
        }
    }
    /**
     * 创建错误响应
     * @param requestId 请求ID
     * @param errorCode 错误码
     * @param errorMessage 错误消息
     * @returns 错误响应对象
     */
    createErrorResponse(requestId, errorCode, errorMessage) {
        return {
            requestId,
            protocolVersion: types_1.MCP_PROTOCOL_VERSION,
            success: false,
            error: {
                code: errorCode,
                message: errorMessage
            }
        };
    }
}
exports.MCPRequestHandler = MCPRequestHandler;
// 创建全局请求处理器实例
exports.globalRequestHandler = new MCPRequestHandler();
//# sourceMappingURL=request-handler.js.map