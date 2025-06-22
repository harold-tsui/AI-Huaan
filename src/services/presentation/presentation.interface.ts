import { KnowledgeItem } from '../../shared/types/knowledge-item';

export type OutputFormat = 
  | 'markdown' 
  | 'pdf' 
  | 'docx' 
  | 'html' 
  | 'latex' 
  | 'pptx' 
  | 'json' 
  | 'csv' 
  | 'xml' 
  | 'yaml';

export interface RenderOptions {
  templateId?: string; // ID of a custom template to use for rendering
  styleOptions?: Record<string, any>; // e.g., font, colors, layout for PDF/PPTX
  includeMetadata?: boolean;
}

export interface SharePermissions {
  canView: boolean;
  canEdit?: boolean;
  canComment?: boolean;
  expiresAt?: string; // ISO 8601 date-time string for temporary links
}

export interface ShareLinkResult {
  url: string;
  accessKey?: string; // Optional access key if needed
  permissions: SharePermissions;
}

export interface PublishSettings {
  platformTarget: string; // e.g., 'blog', 'twitter', 'medium'
  title?: string;
  tags?: string[];
  visibility?: 'public' | 'private' | 'unlisted';
  scheduleAt?: string; // ISO 8601 date-time string for scheduled publishing
  customPlatformOptions?: Record<string, any>;
}

export interface PublishResult {
  status: 'success' | 'pending' | 'failure';
  externalUrl?: string; // URL of the published content on the external platform
  publishId?: string; // ID of the publication on the external platform
  error?: any;
}

export interface IPresentationService {
  /**
   * Renders a KnowledgeItem into a specified output format.
   * @param item The KnowledgeItem to render.
   * @param format The desired output format.
   * @param options Optional rendering options (e.g., template, styling).
   * @returns A Promise resolving to the rendered content (e.g., string, Buffer, or file path).
   */
  renderContent(item: KnowledgeItem, format: OutputFormat, options?: RenderOptions): Promise<string | Buffer>;

  /**
   * Creates a shareable link for a KnowledgeItem.
   * @param itemId The ID of the KnowledgeItem to share.
   * @param permissions The desired permissions for the shared link.
   * @param options Optional sharing options (e.g., password protection).
   * @returns A Promise resolving to a ShareLinkResult.
   */
  createShareLink(itemId: string, permissions: SharePermissions, options?: any): Promise<ShareLinkResult>;

  /**
   * Publishes a KnowledgeItem to an external platform.
   * @param item The KnowledgeItem to publish.
   * @param settings The settings for publishing to the external platform.
   * @returns A Promise resolving to a PublishResult.
   */
  publishToPlatform(item: KnowledgeItem, settings: PublishSettings): Promise<PublishResult>;
}