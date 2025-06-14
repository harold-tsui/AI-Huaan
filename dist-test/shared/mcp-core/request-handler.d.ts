/**
 * MCP Request Handler - MCP请求处理器
 *
 * 处理MCP协议请求，路由到相应的服务
 */
import { MCPErrorCode } from './types';
interface LegacyMCPRequest {
    requestId: string;
    protocolVersion: string;
    service: string;
    serviceVersion?: string;
    method: string;
    params: any;
}
interface LegacyMCPResponse {
    requestId: string;
    protocolVersion: string;
    success: boolean;
    result?: any;
    error?: {
        code: MCPErrorCode;
        message: string;
    };
}
export declare class MCPRequestHandler {
    private logger;
    constructor();
    /**
     * 处理MCP请求
     * @param request MCP请求对象
     * @returns MCP响应对象
     */
    handleRequest(request: LegacyMCPRequest): Promise<LegacyMCPResponse>;
    /**
     * 调用服务方法
     * @param service 服务实例
     * @param request MCP请求对象
     * @returns MCP响应对象
     */
    private invokeServiceMethod;
    /**
     * 创建错误响应
     * @param requestId 请求ID
     * @param errorCode 错误码
     * @param errorMessage 错误消息
     * @returns 错误响应对象
     */
    private createErrorResponse;
}
export declare const globalRequestHandler: MCPRequestHandler;
export {};
