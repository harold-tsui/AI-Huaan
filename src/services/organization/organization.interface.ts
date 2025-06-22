import { KnowledgeItem, PARACategory } from '../../shared/types/knowledge-item';

export interface ClassificationResult {
  category: PARACategory;
  confidence: number;
  reasoning?: string; // Optional explanation for the classification
}

export interface Tag {
  name: string;
  weight?: number; // Optional weight or relevance of the tag
  isAutoGen?: boolean; // Flag to indicate if the tag was auto-generated
}

export interface IndexingResult {
  status: 'success' | 'failure';
  indexedItems: number;
  errors?: any[];
}

export interface IOrganizationService {
  /**
   * Classifies a KnowledgeItem based on the PARA method.
   * @param item The KnowledgeItem to classify.
   * @param context Optional context to aid classification (e.g., user preferences, project details).
   * @returns A Promise resolving to a ClassificationResult.
   */
  classifyContent(item: KnowledgeItem, context?: any): Promise<ClassificationResult>;

  /**
   * Generates and manages tags for a KnowledgeItem.
   * @param item The KnowledgeItem to generate tags for.
   * @param existingTags Optional list of existing tags to consider.
   * @returns A Promise resolving to an array of Tags.
   */
  manageTags(item: KnowledgeItem, existingTags?: Tag[]): Promise<Tag[]>;

  /**
   * Builds or updates the search index for a list of KnowledgeItems.
   * @param items An array of KnowledgeItems to index.
   * @returns A Promise resolving to an IndexingResult.
   */
  buildSearchIndex(items: KnowledgeItem[]): Promise<IndexingResult>;

  /**
   * Searches the knowledge base.
   * @param query The search query string.
   * @param options Optional search parameters (e.g., filters, semantic search toggle).
   * @returns A Promise resolving to an array of relevant KnowledgeItems.
   */
  search(query: string, options?: any): Promise<KnowledgeItem[]>;
}