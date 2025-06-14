"use strict";
/**
 * MCP Request Handler - MCP请求处理器
 *
 * 处理MCP协议请求，路由到相应的服务
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalRequestHandler = exports.MCPRequestHandler = void 0;
var types_1 = require("./types");
var service_registry_1 = require("./service-registry");
var logger_1 = require("../../utils/logger");
var MCPRequestHandler = /** @class */ (function () {
    function MCPRequestHandler() {
        this.logger = new logger_1.Logger('MCPRequestHandler');
    }
    /**
     * 处理MCP请求
     * @param request MCP请求对象
     * @returns MCP响应对象
     */
    MCPRequestHandler.prototype.handleRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var service, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.debug('Handling MCP request', { requestId: request.requestId, service: request.service });
                        // 验证协议版本
                        if (request.protocolVersion !== types_1.MCP_PROTOCOL_VERSION) {
                            return [2 /*return*/, this.createErrorResponse(request.requestId, types_1.MCPErrorCode.PROTOCOL_VERSION_MISMATCH, "Protocol version mismatch. Expected ".concat(types_1.MCP_PROTOCOL_VERSION, ", got ").concat(request.protocolVersion))];
                        }
                        service = service_registry_1.globalServiceRegistry.getService(request.service, request.serviceVersion);
                        if (!service) {
                            return [2 /*return*/, this.createErrorResponse(request.requestId, types_1.MCPErrorCode.SERVICE_NOT_FOUND, "Service not found: ".concat(request.service).concat(request.serviceVersion ? "@".concat(request.serviceVersion) : ''))];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.invokeServiceMethod(service, request)];
                    case 2:
                        response = _a.sent();
                        this.logger.debug('Request handled successfully', { requestId: request.requestId });
                        return [2 /*return*/, response];
                    case 3:
                        error_1 = _a.sent();
                        this.logger.error('Error handling request', {
                            requestId: request.requestId,
                            service: request.service,
                            method: request.method,
                            error: error_1.message,
                            stack: error_1.stack
                        });
                        return [2 /*return*/, this.createErrorResponse(request.requestId, types_1.MCPErrorCode.INTERNAL_ERROR, "Internal error: ".concat(error_1.message))];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 调用服务方法
     * @param service 服务实例
     * @param request MCP请求对象
     * @returns MCP响应对象
     */
    MCPRequestHandler.prototype.invokeServiceMethod = function (service, request) {
        return __awaiter(this, void 0, void 0, function () {
            var requestId, method, params, serviceMethod, result, error_2, errorCode, errorMessage, errorCodeValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestId = request.requestId, method = request.method, params = request.params;
                        // 检查服务是否有该方法
                        if (typeof service[method] !== 'function') {
                            return [2 /*return*/, this.createErrorResponse(requestId, types_1.MCPErrorCode.METHOD_NOT_FOUND, "Method not found: ".concat(method))];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        serviceMethod = service[method];
                        return [4 /*yield*/, serviceMethod.call(service, params)];
                    case 2:
                        result = _a.sent();
                        // 创建成功响应
                        return [2 /*return*/, {
                                requestId: requestId,
                                protocolVersion: types_1.MCP_PROTOCOL_VERSION,
                                success: true,
                                result: result
                            }];
                    case 3:
                        error_2 = _a.sent();
                        errorCode = types_1.MCPErrorCode.INTERNAL_ERROR;
                        errorMessage = 'Unknown error';
                        if (error_2) {
                            if (typeof error_2 === 'string') {
                                errorMessage = error_2;
                            }
                            else if (error_2 instanceof Error) {
                                errorMessage = error_2.message || errorMessage;
                            }
                            else if (typeof error_2 === 'object' && error_2 !== null && 'message' in error_2) {
                                errorMessage = String(error_2.message);
                            }
                            else if (typeof error_2.toString === 'function') {
                                errorMessage = error_2.toString();
                            }
                        }
                        // 如果错误对象包含错误码，使用它
                        if (error_2 && typeof error_2 === 'object' && error_2 !== null && 'code' in error_2) {
                            errorCodeValue = error_2.code;
                            if (Object.values(types_1.MCPErrorCode).includes(errorCodeValue)) {
                                errorCode = errorCodeValue;
                            }
                        }
                        return [2 /*return*/, this.createErrorResponse(requestId, errorCode, errorMessage)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建错误响应
     * @param requestId 请求ID
     * @param errorCode 错误码
     * @param errorMessage 错误消息
     * @returns 错误响应对象
     */
    MCPRequestHandler.prototype.createErrorResponse = function (requestId, errorCode, errorMessage) {
        return {
            requestId: requestId,
            protocolVersion: types_1.MCP_PROTOCOL_VERSION,
            success: false,
            error: {
                code: errorCode,
                message: errorMessage
            }
        };
    };
    return MCPRequestHandler;
}());
exports.MCPRequestHandler = MCPRequestHandler;
// 创建全局请求处理器实例
exports.globalRequestHandler = new MCPRequestHandler();
