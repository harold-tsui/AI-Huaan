// src/services/knowledge-ingestion/register.ts

import { globalServiceFactory } from '../../shared/mcp-core/service-factory';
import { KnowledgeIngestionService } from './knowledge-ingestion.service';
import { Logger } from '../../utils/logger';
import { KNOWLEDGE_INGESTION_SERVICE_ID } from './constants';

export function registerKnowledgeIngestionService(): void {
  const logger = new Logger('KnowledgeIngestionRegister');
  try {
    globalServiceFactory.registerServiceConstructor(
      KNOWLEDGE_INGESTION_SERVICE_ID,
      (orgService, storageService, kgService) => new KnowledgeIngestionService(orgService, storageService, kgService, null),
      'organization-service', 'obsidian-storage-service', 'KnowledgeGraphService'
    );

    // Service alias registration removed as method doesn't exist
    logger.info(`Service registered: ${KNOWLEDGE_INGESTION_SERVICE_ID}`);
  } catch (error) {
    logger.error(`Failed to register ${KNOWLEDGE_INGESTION_SERVICE_ID}:`, error);
    throw error;
  }
}