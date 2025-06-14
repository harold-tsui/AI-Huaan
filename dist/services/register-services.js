"use strict";
/**
 * Register Services - 注册服务
 *
 * 注册所有MCP服务到服务工厂
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAllServices = registerAllServices;
// 导入服务注册函数
require("./knowledge-graph-mcp/register");
// 导入其他服务注册...
// import './other-service/register';
/**
 * 注册所有服务
 */
function registerAllServices() {
    console.info('All MCP services registered');
}
//# sourceMappingURL=register-services.js.map