/**
 * Services - 服务模块
 * 
 * 导出所有服务模块
 */

export * from '../shared/storage-services/storage.interface';
// export * from './storage/s3-storage.service'; // Example for cloud storage
// export * from './storage/mongodb.service'; // Example for database storage

export * from './organization/organization.interface';
export * from './organization/organization.service';

export * from './knowledge-ingestion/knowledge-ingestion.interface';
export * from './knowledge-ingestion/knowledge-ingestion.service';

export * from './processing/processing.interface';
export * from './processing/processing.service';

export * from './presentation/presentation.interface';
export * from './presentation/presentation.service';

export * from './user-profile/user-profile.interface';
export * from './user-profile/user-profile.service';

// export * from './config-management/config-management.interface';
export * from './config-management/config-management.service';

// export * from './knowledge-graph-mcp/knowledge-graph-mcp.interface';
export * from './knowledge-graph-mcp/knowledge-graph-mcp-service';

// export * from './mcp-obsidian-service/mcp-obsidian.interface';
export * from './mcp-obsidian-service/mcp-obsidian.service';

// export * from './nlp/nlp.interface'; // Example for NLP service integration
// export * from './nlp/basic-nlp.service'; // Example NLP service implementation

export * from '../shared/ai-services/llm.interface';
export * from '../shared/ai-services/mock-llm.service';

export * from './register-services'; // Service registration