"use strict";
/**
 * MCP Core Types - MCP核心类型定义
 *
 * 定义MCP服务相关的类型、接口和枚举
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCP_PROTOCOL_VERSION = exports.MCPErrorCode = exports.ServiceStatus = void 0;
/**
 * 服务状态枚举
 */
var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus["INITIALIZING"] = "initializing";
    ServiceStatus["ACTIVE"] = "active";
    ServiceStatus["DEGRADED"] = "degraded";
    ServiceStatus["INACTIVE"] = "inactive";
    ServiceStatus["ERROR"] = "error";
    ServiceStatus["INITIALIZED"] = "INITIALIZED";
    ServiceStatus["STOPPED"] = "STOPPED";
})(ServiceStatus || (exports.ServiceStatus = ServiceStatus = {}));
/**
 * MCP错误代码枚举
 */
var MCPErrorCode;
(function (MCPErrorCode) {
    MCPErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    MCPErrorCode["AUTHENTICATION_ERROR"] = "AUTHENTICATION_ERROR";
    MCPErrorCode["AUTHORIZATION_ERROR"] = "AUTHORIZATION_ERROR";
    MCPErrorCode["NOT_FOUND"] = "NOT_FOUND";
    MCPErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    MCPErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    MCPErrorCode["TIMEOUT"] = "TIMEOUT";
    MCPErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    MCPErrorCode["INVALID_REQUEST"] = "INVALID_REQUEST";
    MCPErrorCode["DEPENDENCY_ERROR"] = "DEPENDENCY_ERROR";
    MCPErrorCode["METHOD_NOT_FOUND"] = "METHOD_NOT_FOUND";
    MCPErrorCode["PROTOCOL_VERSION_MISMATCH"] = "PROTOCOL_VERSION_MISMATCH";
    MCPErrorCode["SERVICE_NOT_FOUND"] = "SERVICE_NOT_FOUND";
})(MCPErrorCode || (exports.MCPErrorCode = MCPErrorCode = {}));
/**
 * MCP协议版本
 */
exports.MCP_PROTOCOL_VERSION = '2024-11-05';
