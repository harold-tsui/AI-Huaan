export type KnowledgeItemContentType = 'text' | 'markdown' | 'code' | 'image' | 'audio';
export type PARACategory = 'Projects' | 'Areas' | 'Resources' | 'Archive';

export interface KnowledgeItemSource {
  platform?: string;
  url?: string;
  author?: string;
  timestamp: string; // ISO 8601 date-time string
}

export interface KnowledgeItemMetadata {
  language?: string;
  tags?: string[];
  category?: PARACategory;
  importance?: number;
  difficulty?: number;
  folder?: string; // Target folder for organization
  classificationReasoning?: string; // AI classification reasoning
  classificationConfidence?: number; // AI classification confidence score
  custom?: Record<string, any>; // For any other metadata
}

export interface KnowledgeItemProcessing {
  summary?: string;
  key_points?: string[];
  entities?: Record<string, any>[]; // Array of objects, structure can be flexible
  connections?: Record<string, any>[]; // Array of objects, structure can be flexible
}

export interface KnowledgeItem {
  id: string; // UUID
  title: string;
  content: string;
  contentType: KnowledgeItemContentType;
  source: KnowledgeItemSource;
  metadata: KnowledgeItemMetadata;
  processing?: KnowledgeItemProcessing; // Optional as per some use cases might not have it initially
  createdAt: string; // ISO 8601 date-time string
  updatedAt: string; // ISO 8601 date-time string
}