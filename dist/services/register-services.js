"use strict";
/**
 * Register Services - 注册服务
 *
 * 注册所有MCP服务到服务工厂
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAllServices = registerAllServices;
// 导入服务注册函数
const register_1 = require("./knowledge-graph-mcp/register");
const register_2 = require("./mcp-obsidian-service/register");
const register_3 = require("./organization/register"); // Added OrganizationService registration
const register_4 = require("./knowledge-ingestion/register"); // Added KnowledgeIngestionService registration
const register_5 = require("./presentation/register");
// import { registerLocalStorageService } from './storage/register'; // Example if LocalStorageService needs global registration
// import { registerMockLLMService } from '../shared/ai-services/register-mock-llm'; // Example if MockLLMService needs global registration
// 导入其他服务注册...
// import { registerOtherService } from './other-service/register';
/**
 * 注册所有服务
 */
async function registerAllServices() {
    // It's often good practice to register foundational/dependency services first,
    // though the current factory model doesn't enforce strict order for constructor registration.
    // However, if createAndInitializeService is called within registration, order can matter.
    // Example: Register shared services if they are to be globally accessible via factory by name
    // if (typeof registerLocalStorageService === 'function') registerLocalStorageService();
    // if (typeof registerMockLLMService === 'function') registerMockLLMService();
    (0, register_1.registerKnowledgeGraphMCPService)();
    (0, register_2.registerMCPObsidianService)();
    await (0, register_3.registerOrganizationService)(); // Register the organization service
    (0, register_4.registerKnowledgeIngestionService)(); // Register the knowledge ingestion service
    (0, register_5.registerPresentationService)();
    // registerOtherService(); // 如果有其他服务，也在这里调用
    console.info('All MCP services registered');
}
//# sourceMappingURL=register-services.js.map