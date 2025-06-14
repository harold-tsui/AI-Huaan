/**
 * Capture Services Types - 捕获服务类型定义
 *
 * 定义捕获服务相关的类型和接口
 */
export declare enum CaptureSourceType {
    WEB = "web",
    FILE = "file",
    TEXT = "text",
    IMAGE = "image",
    AUDIO = "audio",
    VIDEO = "video",
    EMAIL = "email",
    RSS = "rss",
    SOCIAL = "social",
    API = "api",
    CUSTOM = "custom"
}
export declare enum CaptureItemStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    ARCHIVED = "archived"
}
export declare enum CaptureItemPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent",
    NORMAL = "NORMAL"
}
export interface CaptureItemMetadata {
    title?: string;
    description?: string;
    author?: string;
    source?: string;
    url?: string;
    publishedDate?: string;
    capturedDate: string;
    fileType?: string;
    fileSize?: number;
    duration?: number;
    dimensions?: {
        width: number;
        height: number;
    };
    location?: {
        latitude: number;
        longitude: number;
        name?: string;
    };
    tags?: string[];
    customFields?: Record<string, any>;
}
export interface CaptureItemContent {
    file?: any;
    text?: string;
    html?: string;
    markdown?: string;
    filePath?: string;
    fileUrl?: string;
    thumbnailUrl?: string;
    previewUrl?: string;
    embeddings?: number[];
}
export interface CaptureItemProcessingResult {
    success?: boolean;
    message?: string;
    processorName?: string;
    updatedContent?: CaptureItemContent;
    extractedText?: string;
    extractedMetadata?: Record<string, any>;
    suggestedTags?: string[];
    suggestedCategories?: string[];
    summary?: string;
    keyInsights?: string[];
    entities?: string[];
    sentiment?: string;
    topics?: string[];
    readingTime?: number;
    complexity?: number;
}
export interface CaptureItem {
    id: string;
    userId: string;
    sourceType: CaptureSourceType;
    status: CaptureItemStatus;
    priority: CaptureItemPriority;
    metadata: CaptureItemMetadata;
    content: CaptureItemContent;
    processingResult?: CaptureItemProcessingResult;
    created: string;
    updated: string;
    processed?: string;
    archived?: string;
}
export interface CreateCaptureItemInput {
    status: CaptureItemStatus;
    userId: string;
    sourceType: CaptureSourceType;
    priority?: CaptureItemPriority;
    metadata: Partial<CaptureItemMetadata>;
    content: Partial<CaptureItemContent>;
    processImmediately?: boolean;
}
export interface UpdateCaptureItemInput {
    status?: CaptureItemStatus;
    priority?: CaptureItemPriority;
    metadata?: Partial<CaptureItemMetadata>;
    content?: Partial<CaptureItemContent>;
    processingResult?: Partial<CaptureItemProcessingResult>;
}
export interface CaptureItemQueryOptions {
    userId?: string;
    sourceType?: CaptureSourceType;
    status?: CaptureItemStatus;
    priority?: CaptureItemPriority;
    tags?: string[];
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}
export interface WebCaptureOptions {
    url: string;
    selector?: string;
    includeImages?: boolean;
    saveScreenshot?: boolean;
    waitForSelector?: string;
    javascript?: string;
    userAgent?: string;
    timeout?: number;
    proxy?: string;
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
}
export interface FileCaptureOptions {
    filePath?: string;
    fileBuffer?: Buffer;
    fileUrl?: string;
    extractText?: boolean;
    extractMetadata?: boolean;
    generateThumbnail?: boolean;
    maxFileSize?: number;
    allowedFileTypes?: string[];
}
export interface ICaptureProcessor {
    processCaptureItem(item: CaptureItem): Promise<CaptureItemProcessingResult>;
    getSupportedSourceTypes(): CaptureSourceType[];
    getName(): string;
    getDescription(): string;
}
export interface ICaptureService {
    createCaptureItem(input: CreateCaptureItemInput): Promise<CaptureItem>;
    getCaptureItem(id: string): Promise<CaptureItem | null>;
    updateCaptureItem(id: string, input: UpdateCaptureItemInput): Promise<CaptureItem | null>;
    deleteCaptureItem(id: string): Promise<boolean>;
    queryCaptureItems(options: CaptureItemQueryOptions): Promise<{
        items: CaptureItem[];
        total: number;
    }>;
    processCaptureItem(id: string): Promise<CaptureItem | null>;
    archiveCaptureItem(id: string): Promise<CaptureItem | null>;
    captureFromWeb(options: WebCaptureOptions, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem>;
    captureFromFile(options: FileCaptureOptions, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem>;
    captureFromText(text: string, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem>;
    captureFromUrl(url: string, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem>;
    registerProcessor(processor: ICaptureProcessor): void;
    getProcessor(name: string): ICaptureProcessor | null;
    getAllProcessors(): ICaptureProcessor[];
}
