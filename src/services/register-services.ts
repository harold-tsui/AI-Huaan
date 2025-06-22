/**
 * Register Services - 注册服务
 * 
 * 注册所有MCP服务到服务工厂
 */

// 导入服务注册函数
import { registerKnowledgeGraphMCPService } from './knowledge-graph-mcp/register';
import { registerMCPObsidianService } from './mcp-obsidian-service/register';
import { registerOrganizationService } from './organization/register'; // Added OrganizationService registration
import { registerKnowledgeIngestionService } from './knowledge-ingestion/register'; // Added KnowledgeIngestionService registration
import { registerPresentationService } from './presentation/register';
// import { registerLocalStorageService } from './storage/register'; // Example if LocalStorageService needs global registration
// import { registerMockLLMService } from '../shared/ai-services/register-mock-llm'; // Example if MockLLMService needs global registration

// 导入其他服务注册...
// import { registerOtherService } from './other-service/register';

/**
 * 注册所有服务
 */
export async function registerAllServices(): Promise<void> {
  // It's often good practice to register foundational/dependency services first,
  // though the current factory model doesn't enforce strict order for constructor registration.
  // However, if createAndInitializeService is called within registration, order can matter.

  // Example: Register shared services if they are to be globally accessible via factory by name
  // if (typeof registerLocalStorageService === 'function') registerLocalStorageService();
  // if (typeof registerMockLLMService === 'function') registerMockLLMService();

  registerKnowledgeGraphMCPService();
  registerMCPObsidianService();
  await registerOrganizationService(); // Register the organization service
  registerKnowledgeIngestionService(); // Register the knowledge ingestion service
  registerPresentationService();
  
  // registerOtherService(); // 如果有其他服务，也在这里调用
  console.info('All MCP services registered');
}