// src/services/knowledge-ingestion/knowledge-ingestion.service.ts

import { 
    IKnowledgeIngestionService, 
    CaptureWebContentOptions, 
    NoteCaptureOptions,
    ParseDocumentOptions, 
    ProcessMediaOptions, 
    SyncExternalDataOptions 
} from './knowledge-ingestion.interface';
import { KnowledgeItem, KnowledgeItemContentType, KnowledgeItemProcessing, KnowledgeItemSource, KnowledgeItemMetadata, PARACategory } from '../../shared/types/knowledge-item';
import { IStorageService, DocumentStorageResult } from '../../shared/storage-services/storage.interface';
import { IOrganizationService, ClassificationResult } from '../organization/organization.interface';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { MCPService, MCPMessage, MCPResponse } from '../../shared/mcp-core/mcp-core.types';
import { Logger } from '../../utils/logger';
import { WebCaptureProcessor } from '../../shared/capture-services/web-capture-processor';
import { CaptureItem, CaptureItemStatus, CaptureItemPriority, CaptureSourceType, CaptureItemMetadata as CaptureMetadata } from '../../shared/capture-services/types';
import { IKnowledgeGraphService } from '../../shared/knowledge-graph-services';
import { IAIService } from '../../shared/ai-services';
import { globalServiceFactory } from '../../shared/mcp-core/service-factory';
import { IMCPService } from '../../shared/mcp-core/types';


export class KnowledgeIngestionService extends MCPService implements IKnowledgeIngestionService, IMCPService {
  name = 'knowledge-ingestion';
  version = '1.0.0';
  
  private storageService: IStorageService;
  private organizationService: IOrganizationService;
  private webCaptureProcessor: WebCaptureProcessor;
  private knowledgeGraphService: IKnowledgeGraphService;
  private aiService: IAIService | null;

  constructor(
    organizationService: IOrganizationService,
    storageService: IStorageService,
    knowledgeGraphService: IKnowledgeGraphService,
    aiService: IAIService | null = null
  ) {
    super('knowledge-ingestion-service');
    this.organizationService = organizationService;
    this.storageService = storageService;
    this.knowledgeGraphService = knowledgeGraphService;
    this.aiService = aiService;
    this.webCaptureProcessor = new WebCaptureProcessor(aiService || null, knowledgeGraphService);
    this.logger.info('KnowledgeIngestionService initialized with injected dependencies.');
  }

  async captureWebContent(url: string, options?: CaptureWebContentOptions): Promise<KnowledgeItem> {
    this.logger.info(`Attempting to capture web content from: ${url}`, options);

    const captureTimestamp = new Date().toISOString();
    // Create a CaptureItem to pass to WebCaptureProcessor
    const captureItem: CaptureItem = {
      id: uuidv4(), // Temporary ID for processing, final KnowledgeItem will have its own
      userId: 'default-user', // Default user ID
      sourceType: CaptureSourceType.WEB,
      content: { fileUrl: url }, // WebCaptureProcessor expects url in content.fileUrl or metadata.url
      metadata: {
        url: url,
        capturedDate: captureTimestamp,
        ...(options?.customMetadata || {}), // Spread custom metadata from options
      },
      status: CaptureItemStatus.PENDING,
      priority: CaptureItemPriority.MEDIUM,
      created: captureTimestamp,
      updated: captureTimestamp,
    };

    try {
      const processingResult = await this.webCaptureProcessor.process(captureItem);

      if (!processingResult.success || !processingResult.updatedContent || !processingResult.updatedContent.markdown) {
        this.logger.error(`WebCaptureProcessor failed to process ${url}: ${processingResult.message}`, processingResult);
        throw new Error(`Failed to process web content from ${url}: ${processingResult.message}`);
      }

      this.logger.info(`WebCaptureProcessor successfully processed ${url}. Title: ${processingResult.extractedMetadata?.title}`);

      const newItem: KnowledgeItem = {
        id: uuidv4(), // Generate a new ID for the KnowledgeItem
        title: processingResult.extractedMetadata?.title || 'Untitled Web Content',
        content: processingResult.updatedContent.markdown, // content is a string
        contentType: 'markdown' as KnowledgeItemContentType,
        source: {
          platform: 'web',
          url: url,
          author: processingResult.extractedMetadata?.author,
          timestamp: captureTimestamp,
        } as KnowledgeItemSource,
        metadata: {
          tags: options?.tags || processingResult.suggestedTags || [],
          category: (options?.category || 'Resources') as PARACategory,
          custom: {
            ...(options?.customMetadata || {}),
            originalHtml: options?.includeMetadata && processingResult.updatedContent.html ? processingResult.updatedContent.html : undefined,
            extractedText: processingResult.updatedContent.text,
            siteName: processingResult.extractedMetadata?.siteName,
            favicon: processingResult.extractedMetadata?.favicon,
          },
          language: processingResult.extractedMetadata?.lang,
        } as KnowledgeItemMetadata,
        processing: {
          summary: processingResult.summary,
        } as KnowledgeItemProcessing,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.logger.info('Created new KnowledgeItem from WebCaptureProcessor result:', { id: newItem.id, title: newItem.title });

      const storageResult = await this.storageService.storeDocument(newItem);
      if (storageResult.status === 'success') {
        this.logger.info(`Web content from ${url} stored successfully. Storage Path: ${storageResult.storagePath}, Item ID: ${newItem.id}`);
        // Optionally, trigger organization after successful storage
        // await this.organizationService.classifyContent(newItem.id, newItem.content, newItem.title);
        return newItem;
      } else {
        this.logger.error(`Failed to store web content from ${url}: ${storageResult.error}`, { itemId: newItem.id });
        throw new Error(`Failed to store web content from ${url}: ${storageResult.error}`);
      }
    } catch (error: any) {
      this.logger.error(`Error during web content capture or storage for ${url}: ${error.message}`, { error });
      throw new Error(`Error during web content capture or storage for ${url}: ${error.message}`);
    }
  }

  async parseDocument(filePath: string, format: string, options?: ParseDocumentOptions): Promise<KnowledgeItem> {
    console.log('Attempting to parse document:', filePath, format, options);
    // 1. Read file content if filePathOrBuffer is string, or use buffer directly
    // 2. Use libraries like Tika, Mammoth (for .docx), pdf-parse (for .pdf) to extract text and metadata
    // 3. Convert to KnowledgeItem format
    // 4. Store and organize

    // --- Placeholder Implementation --- 
    const content = `Parsed content from document. Options: ${JSON.stringify(options)}`;
    const newItem: KnowledgeItem = {
      id: uuidv4(),
      title: 'Parsed Document', // Default title, options.title is not in ParseDocumentOptions
      content: content,
      contentType: 'text' as KnowledgeItemContentType, // Or 'markdown' if converted
      source: {
        platform: 'file',
        url: filePath,
        timestamp: new Date().toISOString(),
      } as KnowledgeItemSource,
      metadata: {
        tags: [],
        category: 'Resources' as PARACategory,
        custom: {},
      } as KnowledgeItemMetadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const storageResult = await this.storageService.storeDocument(newItem);
    if (storageResult.status === 'success') {
      // newItem.metadata.path = storageResult.storagePath;
      console.log(`Document stored successfully at ${storageResult.storagePath}`);
      return newItem;
    } else {
      console.error(`Failed to store document: ${storageResult.error}`);
      throw new Error(`Failed to store document: ${storageResult.error}`);
    }
    // --- End Placeholder --- 
  }

  async captureNote(title: string, content: string, format: 'markdown' | 'plaintext' = 'markdown', options?: Omit<NoteCaptureOptions, 'contentType'>): Promise<KnowledgeItem> {
    this.logger.info(`Attempting to capture note: "${title}"`, { format, ...options });

    const newItem: KnowledgeItem = {
      id: uuidv4(),
      title,
      content,
      contentType: format === 'plaintext' ? 'text' : format,
      source: {
        platform: 'note',
        timestamp: new Date().toISOString(),
      } as KnowledgeItemSource,
      metadata: {
        tags: options?.tags || [],
        category: (options?.category || 'Notes') as PARACategory,
        custom: options?.customMetadata || {},
      } as KnowledgeItemMetadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const storageResult = await this.storageService.storeDocument(newItem);
    if (storageResult.status === 'success') {
      newItem.contentPath = storageResult.storagePath;
      this.logger.info(`Note "${title}" stored successfully. Storage Path: ${storageResult.storagePath}, Item ID: ${newItem.id}`);
      return newItem;
    } else {
      this.logger.error(`Failed to store note "${title}": ${storageResult.error}`, { itemId: newItem.id });
      throw new Error(`Failed to store note "${title}": ${storageResult.error}`);
    }
  }

  async processMedia(filePath: string, type: string, options?: ProcessMediaOptions): Promise<KnowledgeItem> {
    console.log('Attempting to process media:', filePath, type, options);
    // 1. Load media file
    // 2. For images: OCR, metadata extraction. For audio/video: transcription, metadata.
    // 2. Convert to KnowledgeItem (e.g., transcript as content, link to media)
    // 3. Store and organize

    // --- Placeholder Implementation --- 
    const content = `Processed media content (e.g., transcript or description). Options: ${JSON.stringify(options)}`;
    const newItem: KnowledgeItem = {
      id: uuidv4(),
      title: 'Processed Media', // Default title, options.title is not in ProcessMediaOptions
      content: content,
      contentType: 'text' as KnowledgeItemContentType, // Or specific media type if storing metadata primarily
      source: {
        platform: 'media_file',
        url: filePath,
        timestamp: new Date().toISOString(),
      } as KnowledgeItemSource,
      metadata: {
        tags: [],
        category: 'Resources' as PARACategory,
        custom: {},
      } as KnowledgeItemMetadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const storageResult = await this.storageService.storeDocument(newItem);
    if (storageResult.status === 'success') {
      // newItem.metadata.path = storageResult.storagePath;
      console.log(`Media item stored successfully at ${storageResult.storagePath}`);
      return newItem;
    } else {
      console.error(`Failed to store media item: ${storageResult.error}`);
      throw new Error(`Failed to store media item: ${storageResult.error}`);
    }
    // --- End Placeholder --- 
  }

  async syncExternalData(serviceName: string, credentials: any, options?: SyncExternalDataOptions): Promise<KnowledgeItem[]> {
    console.log(`Attempting to sync external data from ${serviceName}:`, options);
    // 1. Connect to the external service (e.g., Readwise, Pocket, Obsidian)
    // 2. Fetch new/updated items
    // 3. Convert each to KnowledgeItem format
    // 4. Store and organize each item
    // 5. Handle pagination, rate limits, etc.

    // --- Placeholder Implementation --- 
    console.warn(`syncExternalData for ${serviceName} is a placeholder and not fully implemented.`);
    // Simulate fetching one item
    const dummyItem: KnowledgeItem = {
      id: uuidv4(),
      title: `Synced Item from ${serviceName}`, // Default title, options.title is not in SyncExternalDataOptions
      content: `Content from ${serviceName}. Options: ${JSON.stringify(options)}`,
      contentType: 'text' as KnowledgeItemContentType,
      source: {
        platform: serviceName,
        timestamp: new Date().toISOString(),
      } as KnowledgeItemSource,
      metadata: {
        tags: [],
        category: 'Resources' as PARACategory,
        custom: {},
      } as KnowledgeItemMetadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const storageResult = await this.storageService.storeDocument(dummyItem);
    if (storageResult.status === 'success') {
      // dummyItem.metadata.path = storageResult.storagePath;
      return [dummyItem];
    }
    // Returning empty array on failure, as per original logic, but consider throwing error for consistency
    // throw new Error(`Failed to sync external data for ${serviceName}: ${storageResult.error}`);
    return []; 
    // --- End Placeholder --- 
  }

  // IMCPService implementation
  async initialize(): Promise<boolean> {
    return true;
  }

  async shutdown(): Promise<boolean> {
    return true;
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  async handleRequest(request: any): Promise<any> {
    // Not used in this service
    return {};
  }

  getStatus(): any {
    // Assuming getStatus from MCPService is sufficient, returning empty object as placeholder if override is needed.
    return super.getStatus();
  }

  getMetadata(): any {
    return {};
  }

  getConfig(): any {
    return {};
  }

  updateConfig(config: any): void {}

  getInfo() {
    return {
      id: this.name,
      name: this.name,
      version: this.version,
      status: this.getStatus(),
      description: 'Knowledge ingestion service for capturing and processing content'
    };
  }
}