// src/services/mcp-obsidian-service/mcp-obsidian.service.ts

import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { IStorageService, DocumentStorageResult, KGEntity, KGRelationship, KGUpdateResult, KGQueryResult, VersionHistory } from '../../shared/storage-services/storage.interface';
import matter from 'gray-matter';
import { KnowledgeItem } from '../../shared/types/knowledge-item';
import { MCPService, MCPMessage, MCPResponse } from '../../shared/mcp-core/mcp-core.types';
import { IMCPService, ServiceStatus, ServiceMetadata, ServiceConfig, ServiceInfo } from '../../shared/mcp-core/types';



export interface ObsidianServiceConfig {
  obsidianApiUrl: string;
  obsidianApiKey: string;
  defaultVaultName: string;
  configFilePath?: string; // Optional: path to a JSON config file
}

export class MCPObsidianService extends MCPService implements IStorageService {
  name: string;
  version: string;
  private config: ObsidianServiceConfig;
  private httpClient: AxiosInstance;

  constructor(config: ObsidianServiceConfig) {
    super('obsidian-storage-service');
    this.name = 'obsidian-storage';
    this.version = '1.0.0';
    this.config = this.loadConfig(config);
    this.httpClient = axios.create({
      baseURL: this.config.obsidianApiUrl,
      headers: {
        'Authorization': `Bearer ${this.config.obsidianApiKey}`,
      }
    });
    this.registerRoutes();
    this.logger.info(`MCPObsidianService initialized for vault: ${this.config.defaultVaultName}`);
  }

  private loadConfig(config: ObsidianServiceConfig): ObsidianServiceConfig {
    const envConfig: Partial<ObsidianServiceConfig> = {
      obsidianApiUrl: process.env.OBSIDIAN_API_URL,
      obsidianApiKey: process.env.OBSIDIAN_API_KEY,
      defaultVaultName: process.env.OBSIDIAN_VAULT_NAME,
    };

    // Filter out undefined values from envConfig
    const cleanEnvConfig = Object.fromEntries(Object.entries(envConfig).filter(([_, v]) => v !== undefined));

    // Priority: provided config > environment variables
    const finalConfig = { ...cleanEnvConfig, ...config };

    if (!finalConfig.obsidianApiUrl || !finalConfig.obsidianApiKey || !finalConfig.defaultVaultName) {
      this.logger.error('Obsidian service is not fully configured. Please provide API URL, API key, and vault name.');
      throw new Error('Obsidian service configuration is incomplete.');
    }

    return finalConfig as ObsidianServiceConfig;
  }

  private registerRoutes(): void {
    this.on('obsidian:createNote', this.handleCreateNoteRequest.bind(this));
    this.on('obsidian:getNoteContent', this.handleGetNoteContentRequest.bind(this));
    this.on('obsidian:listNotes', this.handleListNotesRequest.bind(this)); // Added for listing notes
    console.log('MCPObsidianService routes registered: createNote, getNoteContent, listNotes');
  }

  // --- IStorageService Implementation ---

  async storeDocument(item: KnowledgeItem): Promise<DocumentStorageResult> {
    const vaultName = this.config.defaultVaultName;
    const safeTitle = (item.title || 'Untitled').replace(/[\/\\:*?"<>|]/g, '_');
    const filePath = `${vaultName}/${safeTitle}.md`;

    const frontmatter = `---
` +
      `id: ${item.id}
` +
      `title: "${item.title}"
` +
      `contentType: ${item.contentType}
` +
      `createdAt: ${item.createdAt}
` +
      `updatedAt: ${item.updatedAt}
` +
      `tags: [${(item.metadata.tags || []).join(', ')}]
` +
      `category: ${item.metadata.category || 'Uncategorized'}
` +
      `sourcePlatform: ${item.source.platform}
` +
      `sourceUrl: ${item.source.url || ''}
` +
      `---

`;

    const content = frontmatter + item.content;

    try {
      const apiPath = filePath.startsWith(vaultName + '/') ? filePath.substring(vaultName.length + 1) : filePath;
      await this.httpClient.put(`/vault/${apiPath}`, content, {
        headers: { 'Content-Type': 'text/markdown' },
      });
      return { status: 'success', storagePath: filePath };
    } catch (error: any) {
      return { status: 'error', error: error.response?.data?.message || error.message };
    }
  }

  async updateItem(id: string, updates: Partial<KnowledgeItem>): Promise<DocumentStorageResult> {
    const item = await this.getItem(id);
    if (!item) {
      return { status: 'error', error: 'Document not found' };
    }
    const updatedItem = { ...item, ...updates, updatedAt: new Date().toISOString() };
    return this.storeDocument(updatedItem);
  }

  async deleteItem(id: string): Promise<DocumentStorageResult> {
    const vaultName = this.config.defaultVaultName;
    const apiPath = id.startsWith(vaultName + '/') ? id.substring(vaultName.length + 1) : id;
    try {
      await this.httpClient.delete(`/vault/${apiPath}`);
      return { status: 'success', storagePath: id };
    } catch (error: any) {
      return { status: 'error', error: error.response?.data?.message || error.message };
    }
  }



  async getItem(documentId: string): Promise<KnowledgeItem | null> {
    // documentId is expected to be the full path including vault name, e.g., "MyVault/Notes/MyNote.md"
    const vaultName = this.config.defaultVaultName;
    const apiPath = documentId.startsWith(vaultName + '/') ? documentId.substring(vaultName.length + 1) : documentId;


    console.log(`Attempting to retrieve document: ${apiPath}`);

    try {
      const response = await this.httpClient.get(`/vault/${apiPath}`);

      if (response.status === 200 && typeof response.data === 'string') {
        const fileContent = response.data;
        const { data: frontmatter, content: body } = matter(fileContent);

        const now = new Date().toISOString();

        return {
          id: frontmatter.id || documentId,
          title: frontmatter.title || (apiPath.split('/').pop()?.replace('.md', '') || 'Untitled'),
          content: body,
          contentType: frontmatter.contentType || 'markdown',
          source: {
            platform: frontmatter.sourcePlatform || 'obsidian',
            url: frontmatter.sourceUrl,
            timestamp: now, // Placeholder, consider storing actual file modification time
          },
          metadata: {
            tags: frontmatter.tags || [],
            category: frontmatter.category,
            custom: {}, // Deprecated: frontmatter is now mapped to specific fields
          },
          processing: {
            summary: frontmatter.summary || '',
          },
          createdAt: frontmatter.createdAt || now,
          updatedAt: frontmatter.updatedAt || now,
        } as KnowledgeItem;
      } else if (response.status === 404) {
        console.log(`Document not found in Obsidian: ${apiPath}`);
        return null;
      }
      console.error(`Obsidian API error retrieving document: ${response.status} ${response.statusText}`);
      throw new Error(`Obsidian API error: ${response.status} ${response.statusText}`);
    } catch (error: any) {
      console.error(`Error retrieving document from Obsidian (${apiPath}):`, error.response?.data || error.message);
      if (error.response?.status === 404) {
        return null;
      }
      return null; // Or throw, depending on desired error handling
    }
  }

  // --- IStorageService methods requiring specific Obsidian plugin integration or advanced features ---
  async updateKnowledgeGraph(entities: KGEntity[], relationships: KGRelationship[]): Promise<KGUpdateResult> {
    // TODO: Implement updateKnowledgeGraph. This would likely require a specific Obsidian plugin 
    // like Dataview or a custom solution to manage structured data within Obsidian.
    // For now, it logs a warning and returns a 'Not Implemented' error.
    this.logger.warn('updateKnowledgeGraph not implemented for MCPObsidianService. Requires Obsidian plugin integration (e.g., Dataview).');
    return { success: false, errors: [{ message: 'Not Implemented. Requires Obsidian plugin integration.' }] };
  }

  async queryKnowledgeGraph(query: string, params?: any): Promise<KGQueryResult> {
    // TODO: Implement queryKnowledgeGraph. Similar to updateKnowledgeGraph, this would depend on 
    // how knowledge graph data is stored and queried in Obsidian (e.g., via Dataview queries).
    this.logger.warn('queryKnowledgeGraph not implemented for MCPObsidianService. Requires Obsidian plugin integration (e.g., Dataview).');
    return { entities: [], relationships: [] };
  }

  async trackVersion(documentId: string, changes: any, userId: string, summary?: string): Promise<VersionHistory> {
    this.logger.warn('trackVersion not implemented for MCPObsidianService.');
    return {
      versionId: 'v_placeholder_123',
      timestamp: new Date().toISOString(),
      author: userId,
      summary: summary || 'Placeholder version entry',
      changes: changes,
    };
  }

  async getVersionHistory(documentId: string): Promise<VersionHistory[]> {
    this.logger.warn('getVersionHistory not implemented for MCPObsidianService.');
    return [];
  }

  async getDocument(id: string): Promise<KnowledgeItem | null> {
    return await this.getItem(id);
  }

  async updateDocument(id: string, updates: Partial<KnowledgeItem>): Promise<DocumentStorageResult> {
    this.logger.warn('updateDocument not implemented for MCPObsidianService.');
    return { status: 'error', error: 'Not Implemented' };
  }

  async deleteDocument(documentId: string): Promise<DocumentStorageResult> {
    this.logger.warn('deleteDocument not implemented for MCPObsidianService.');
    return { status: 'error', error: 'Not Implemented' };
  }

  // --- MCP Message Handlers ---
  async handleCreateNoteRequest(message: MCPMessage): Promise<MCPResponse> {
    const { filePath, content, title, vaultName } = message.payload as { filePath: string; content: string; title?: string; vaultName?: string };
    const targetVault = vaultName || this.config.defaultVaultName;
  // Ensure filePath is relative to the vault for storeDocument
    const relativeFilePath = filePath.startsWith(targetVault + '/') 
                             ? filePath.substring(targetVault.length + 1) 
                             : filePath.replace(/^\/+/, '');

    const itemTitle = title || relativeFilePath.split('/').pop()?.replace(/\.md$/, '') || 'Untitled Note';

    const item: KnowledgeItem = { 
      id: `${targetVault}/${relativeFilePath}`,
      content,
      title: itemTitle,
      contentType: 'markdown',
      source: { platform: 'obsidian', timestamp: new Date().toISOString() },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
      processing: {},
    };
    
    this.logger.info(`Handling createNote request for path: ${targetVault}/${relativeFilePath}`);
    const result = await this.storeDocument(item);
    if (result.status === 'success') {
      return { status: 'success', payload: { message: 'Note created successfully.', path: result.storagePath }, correlationId: message.correlationId };
    } else {
      this.logger.error(`Failed to create note for path: ${targetVault}/${relativeFilePath}`, result.error);
      return { status: 'error', payload: { message: 'Failed to create note.', error: result.error }, correlationId: message.correlationId };
    }
  }

  async handleGetNoteContentRequest(message: MCPMessage): Promise<MCPResponse> {
    const { documentId, vaultName } = message.payload as { documentId: string; vaultName?: string };
    const targetVault = vaultName || this.config.defaultVaultName;
    // Ensure documentId is prefixed with vaultName if not already, for retrieveDocument
    const fullDocumentId = documentId.startsWith(targetVault + '/') ? documentId : `${targetVault}/${documentId.replace(/^\/+/,'')}`;
    
    this.logger.info(`Handling getNoteContent request for documentId: ${fullDocumentId}`);
    const item = await this.getItem(fullDocumentId);

    if (item) {
      return { status: 'success', payload: item, correlationId: message.correlationId };
    } else {
      this.logger.warn(`Note not found for documentId: ${fullDocumentId}`);
      return { status: 'error', payload: { message: 'Note not found.' }, correlationId: message.correlationId };
    }
  }

  async handleListNotesRequest(message: MCPMessage): Promise<MCPResponse> {
    const { vaultName, path = '' } = message.payload as { vaultName?: string; path?: string };
    const targetVault = vaultName || this.config.defaultVaultName;
    // The Obsidian Local REST API has a /vault/ endpoint that lists all files and folders.
    // We can filter this for markdown files in the specified path.
    // Path should be relative to the vault root.
    const apiPath = `/vault/${path.replace(/^\/+/, '')}`;
    this.logger.info(`Handling listNotes request for vault: ${targetVault}, path: ${apiPath}`);

    try {
      const response = await this.httpClient.get(apiPath);
      if (response.status === 200 && Array.isArray(response.data.files)) {
        const markdownFiles = response.data.files
          .filter((f: string) => f.endsWith('.md'))
          .map((f: string) => `${path.replace(/^\/+/, '')}${path ? '/' : ''}${f}`.replace(/^\/+/, '')); // Construct relative path
        
        return { 
          status: 'success', 
          payload: { notes: markdownFiles, count: markdownFiles.length }, 
          correlationId: message.correlationId 
        };
      } else {
        this.logger.error(`Error listing notes from Obsidian API: Status ${response.status}`, response.data);
        return { 
          status: 'error', 
          payload: { message: 'Failed to list notes from Obsidian.', error: response.data?.message || `API Error: ${response.status}` }, 
          correlationId: message.correlationId 
        };
      }
    } catch (error: any) {
      this.logger.error('Exception listing notes from Obsidian:', error.response?.data || error.message);
      return { 
        status: 'error', 
        payload: { message: 'Exception when listing notes.', error: error.response?.data?.message || error.message }, 
        correlationId: message.correlationId 
      };
    }
  }

  // IMCPService interface methods
  async initialize(): Promise<boolean> {
    try {
      this.logger.info(`MCPObsidianService initializing for vault: ${this.config.defaultVaultName}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize MCPObsidianService:', error);
      return false;
    }
  }

  async shutdown(): Promise<boolean> {
    try {
      this.logger.info('MCPObsidianService shutting down');
      return true;
    } catch (error) {
      this.logger.error('Failed to shutdown MCPObsidianService:', error);
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check - verify we can reach the Obsidian API
      const response = await this.httpClient.get('/vault');
      return response.status === 200;
    } catch (error) {
      this.logger.warn('Health check failed:', error);
      return false;
    }
  }

  async handleRequest(request: any): Promise<any> {
    // Handle MCP requests - this is a basic implementation
    try {
      switch (request.action) {
        case 'store':
          return await this.storeDocument(request.params.item);
        case 'retrieve':
          return await this.getDocument(request.params.id);
        default:
          throw new Error(`Unknown action: ${request.action}`);
      }
    } catch (error) {
      return {
        id: request.id,
        requestId: request.id,
        service: this.name,
        version: this.version,
        action: request.action,
        status: 'error' as const,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  getStatus(): ServiceStatus {
    return ServiceStatus.ACTIVE;
  }

  getMetadata(): ServiceMetadata {
    return {
      createdAt: new Date(),
      updatedAt: new Date(),
      description: 'MCP Obsidian storage service for managing notes',
      capabilities: [],
      dependencies: []
    };
  }

  getConfig(): ServiceConfig {
    return this.config;
  }

  updateConfig(config: Partial<ServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  async getAllDocuments(): Promise<KnowledgeItem[]> {
    try {
      // Implementation to get all documents from Obsidian
      const response = await this.httpClient.get(`/vault/${this.config.defaultVaultName}/files`);
      if (response.status === 200) {
        const files = response.data.files || [];
        const documents: KnowledgeItem[] = [];
        
        for (const file of files) {
          if (file.path.endsWith('.md')) {
            const doc = await this.getDocument(file.path);
            if (doc) {
              documents.push(doc);
            }
          }
        }
        
        return documents;
      }
      return [];
    } catch (error) {
      this.logger.error('Error getting all documents:', error);
      return [];
    }
  }

  async searchItems(criteria: { path?: string; tags?: string[]; [key: string]: any }): Promise<KnowledgeItem[]> {
    try {
      const allDocuments = await this.getAllDocuments();
      
      return allDocuments.filter(doc => {
        // Filter by path if specified
        if (criteria.path && !doc.id.includes(criteria.path)) {
          return false;
        }
        
        // Filter by tags if specified
        if (criteria.tags && criteria.tags.length > 0) {
          const docTags = doc.metadata.tags || [];
          const hasMatchingTag = criteria.tags.some(tag => docTags.includes(tag));
          if (!hasMatchingTag) {
            return false;
          }
        }
        
        return true;
      });
    } catch (error) {
      this.logger.error('Error searching items:', error);
      return [];
    }
  }

  getInfo(): ServiceInfo {
    return {
      id: 'mcp-obsidian-service',
      name: 'mcp-obsidian-service',
      version: '1.0.0',
      status: this.getStatus(),
      description: 'MCP Obsidian storage service for managing notes'
    };
  }
}