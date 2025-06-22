import { KnowledgeItem } from '../../shared/types/knowledge-item';

export type SummaryLevel = 'sentence' | 'paragraph' | 'detailed' | 'executive';

export interface Connection {
  sourceItemId: string;
  targetItemId: string;
  relationshipType: string; // e.g., 'cites', 'relatedTo', 'contradicts'
  similarityScore?: number;
  context?: string; // Context of the connection
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  supportingItems: KnowledgeItem[];
  actionableRecommendations?: string[];
  confidenceScore?: number;
  tags?: string[];
}

export interface IProcessingService {
  /**
   * Generates a summary for a given KnowledgeItem.
   * @param item The KnowledgeItem to summarize.
   * @param level The desired level of summary detail.
   * @param language The language of the summary (optional, defaults to item's language).
   * @returns A Promise resolving to the summary text.
   */
  generateSummary(item: KnowledgeItem, level: SummaryLevel, language?: string): Promise<string>;

  /**
   * Finds connections and relationships between a KnowledgeItem and the existing knowledge base.
   * @param item The KnowledgeItem to find connections for.
   * @param knowledgeBase An array of existing KnowledgeItems to search within.
   * @param options Optional parameters for connection discovery (e.g., depth, thresholds).
   * @returns A Promise resolving to an array of Connections.
   */
  findConnections(item: KnowledgeItem, knowledgeBase: KnowledgeItem[], options?: any): Promise<Connection[]>;

  /**
   * Generates insights from a cluster of KnowledgeItems or based on user context.
   * @param items An array of KnowledgeItems to analyze.
   * @param userContext Optional user context to guide insight generation.
   * @param analysisType Optional type of analysis to perform (e.g., 'trend_detection', 'gap_analysis').
   * @returns A Promise resolving to an array of Insights.
   */
  generateInsights(items: KnowledgeItem[], userContext?: any, analysisType?: string): Promise<Insight[]>;
}