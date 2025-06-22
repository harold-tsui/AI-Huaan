import { KnowledgeItem, KnowledgeItemSource } from '../../shared/types/knowledge-item';

export interface CaptureWebContentOptions {
  includeMetadata?: boolean; // Whether to include full original HTML in source.originalHtml
  extractMainContent?: boolean; // Hint for Readability, though it tries its best by default
  tags?: string[]; // Initial tags to assign to the KnowledgeItem
  category?: string; // Initial category to assign to the KnowledgeItem
  customMetadata?: Record<string, any>; // Any other custom metadata to include
}

export interface ParseDocumentOptions {
  // Define options for document parsing, e.g., OCR for images in PDF
  ocrEnabled?: boolean;
}

export interface ProcessMediaOptions {
  // Define options for media processing, e.g., transcription language
  transcriptionLanguage?: string;
  summarization?: boolean;
}

export interface SyncExternalDataOptions {
  // Define options for syncing external data, e.g., specific repositories or channels
  filter?: string; 
  since?: string; // ISO 8601 date-time string
}

export interface IKnowledgeIngestionService {
  /**
   * Captures content from a given URL.
   * @param url The URL to capture content from.
   * @param options Options for web content capture.
   * @returns A Promise resolving to a KnowledgeItem.
   */
  captureWebContent(url: string, options?: CaptureWebContentOptions): Promise<KnowledgeItem>;

  /**
   * Parses a document file and extracts its content.
   * @param filePath The path to the document file.
   * @param format The format of the document (e.g., 'pdf', 'docx').
   * @param options Options for document parsing.
   * @returns A Promise resolving to a KnowledgeItem.
   */
  parseDocument(filePath: string, format: string, options?: ParseDocumentOptions): Promise<KnowledgeItem>;

  /**
   * Processes a media file (audio, video, image) to extract content.
   * @param filePath The path to the media file.
   * @param type The type of media ('audio', 'video', 'image').
   * @param options Options for media processing.
   * @returns A Promise resolving to a KnowledgeItem.
   */
  processMedia(filePath: string, type: 'audio' | 'video' | 'image', options?: ProcessMediaOptions): Promise<KnowledgeItem>;

  /**
   * Syncs data from an external platform.
   * @param platform The name of the external platform (e.g., 'github', 'obsidian').
   * @param credentials Credentials or API keys for accessing the platform.
   * @param options Options for syncing external data.
   * @returns A Promise resolving to an array of KnowledgeItems.
   */
  syncExternalData(platform: string, credentials: any, options?: SyncExternalDataOptions): Promise<KnowledgeItem[]>;
}