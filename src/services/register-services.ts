/**
 * Register Services - 注册服务
 * 
 * 注册所有MCP服务到服务工厂
 */

// 导入服务注册函数
import './knowledge-graph-mcp/register';

// 导入其他服务注册...
// import './other-service/register';

/**
 * 注册所有服务
 */
export function registerAllServices(): void {
  console.info('All MCP services registered');
}