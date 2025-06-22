import { KnowledgeItem } from '../types/knowledge-item';

export type KnowledgeItemUpdate = Partial<Omit<KnowledgeItem, 'id' | 'createdAt'>>;

// Basic types for Knowledge Graph entities and relationships
export interface KGEntity {
  id: string;
  type: string; // e.g., 'Person', 'Topic', 'Document'
  properties: Record<string, any>;
}

export interface KGRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: string; // e.g., 'authoredBy', 'mentions', 'relatedTo'
  properties?: Record<string, any>;
}

export interface KGUpdateResult {
  success: boolean;
  updatedEntities?: number;
  updatedRelationships?: number;
  errors?: any[];
}

export interface KGQueryResult {
  entities?: KGEntity[];
  relationships?: KGRelationship[];
  paths?: any[]; // For path queries
}

export interface DocumentStorageResult {
  status: 'success' | 'error';
  storagePath?: string;
  error?: string;
}

export interface VersionHistory {
  versionId: string;
  timestamp: string; // ISO 8601 date-time string
  author?: string; // User who made the change
  summary?: string; // Brief summary of changes
  changes: any; // Detailed changes, could be a diff object or similar
}

export interface IStorageService {
  /**
   * Updates the knowledge graph with new entities and relationships.
   * @param entities An array of KGEntities to add or update.
   * @param relationships An array of KGRelationships to add or update.
   * @returns A Promise resolving to a KGUpdateResult.
   */
  updateKnowledgeGraph(entities: KGEntity[], relationships: KGRelationship[]): Promise<KGUpdateResult>;

  /**
   * Queries the knowledge graph.
   * @param query A graph query (e.g., Cypher, Gremlin, or a custom query language).
   * @param params Optional parameters for the query.
   * @returns A Promise resolving to a KGQueryResult.
   */
  queryKnowledgeGraph(query: string, params?: any): Promise<KGQueryResult>;

  /**
   * Stores a KnowledgeItem document.
   * @param item The KnowledgeItem to store.
   * @param options Optional storage options (e.g., indexing preferences, access control).
   * @returns A Promise resolving to a DocumentStorageResult.
   */
  storeDocument(item: KnowledgeItem): Promise<DocumentStorageResult>;

  /**
   * Retrieves a KnowledgeItem document by its ID.
   * @param documentId The ID of the document to retrieve.
   * @param versionId Optional version ID to retrieve a specific version.
   * @returns A Promise resolving to the KnowledgeItem or null if not found.
   */
  getDocument(id: string): Promise<KnowledgeItem | null>;

  updateDocument(id: string, updates: Partial<KnowledgeItemUpdate>): Promise<DocumentStorageResult>;

  deleteDocument(id: string): Promise<DocumentStorageResult>;

  /**
   * Tracks changes to a document and creates a new version.
   * @param documentId The ID of the document being versioned.
   * @param changes The changes made to the document.
   * @param userId The ID of the user making the changes.
   * @param summary Optional summary of the changes.
   * @returns A Promise resolving to the new VersionHistory entry.
   */
  trackVersion(documentId: string, changes: any, userId: string, summary?: string): Promise<VersionHistory>;

  /**
   * Retrieves the version history for a document.
   * @param documentId The ID of the document.
   * @returns A Promise resolving to an array of VersionHistory entries.
   */
  getVersionHistory(documentId: string): Promise<VersionHistory[]>;

  /**
   * Retrieves all documents from storage.
   * @returns A Promise resolving to an array of KnowledgeItems.
   */
  getAllDocuments(): Promise<KnowledgeItem[]>;

  /**
   * Searches for documents based on criteria.
   * @param criteria Search criteria (e.g., path, tags, etc.)
   * @returns A Promise resolving to an array of matching KnowledgeItems.
   */
  searchItems(criteria: { path?: string; tags?: string[]; [key: string]: any }): Promise<KnowledgeItem[]>;
}
