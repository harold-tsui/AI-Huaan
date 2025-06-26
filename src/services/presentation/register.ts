// src/services/presentation/register.ts

import { globalServiceFactory } from '../../shared/mcp-core/service-factory';
import { PresentationService } from './presentation.service';
import { IStorageService } from '../../shared/storage-services/storage.interface';
import { MCPObsidianService } from '../mcp-obsidian-service/mcp-obsidian.service';

const PRESENTATION_SERVICE_ID = 'PresentationService';

export function registerPresentationService(): void {
  globalServiceFactory.registerServiceConstructor(
    PRESENTATION_SERVICE_ID,
    PresentationService
    // No dependencies - don't pass empty array
  );
  console.log('PresentationService registered');
}