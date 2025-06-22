import { FileProcessor } from '../../shared/capture-services/processors/file-processor';
import { TextProcessor } from '../../shared/capture-services/processors/text-processor';

import { CaptureItem, CaptureSourceType, CaptureItemProcessingResult, CaptureItemContent, CaptureItemStatus, CaptureItemPriority } from '../../shared/capture-services/types'; // Added CaptureItemStatus and CaptureItemPriority
import { globalAIRoutingService } from '../../shared/ai-services';
import { AIRoutingService } from '../../shared/ai-services/ai-routing-service'; // Added import for AIRoutingService type
import { IPromptManager, PromptTemplate, AIProvider, IAIService } from '../../shared/ai-services/types'; // Added IPromptManager import, AIProvider, IAIService
import { Logger } from '../../utils/logger'; // Added import for Logger
import { globalPromptManager } from '../../shared/ai-services/prompt-manager';

// Attempt to mock ai-services/types to see if it resolves the TextProcessor error
jest.mock('../../shared/ai-services/types', () => ({
  __esModule: true,
  ContentType: { TEXT: 'text', IMAGE_URL: 'image_url', PDF: 'pdf', AUDIO: 'audio', VIDEO: 'video', URL: 'url', DOCUMENT: 'document' }, // Added more enum members based on potential usage
  MessageRole: { USER: 'user', ASSISTANT: 'assistant', SYSTEM: 'system', FUNCTION: 'function' }, // Added FUNCTION based on potential usage
  // Mock other enums/interfaces if they are directly used by file-processor.ts or its direct test code
  // For now, keeping it minimal to see the impact on the core error.
  // AIProvider: { OPENAI: 'openai', AZURE_OPENAI: 'azure_openai', ANTHROPIC: 'anthropic', GEMINI: 'gemini' },
  // Other exports like interfaces (IAIService, IPromptManager, PromptTemplate, etc.) are trickier to mock
  // as they are used as types. jest.mock primarily affects runtime value resolution.
  // If the error persists, we might need to ensure that any code path relying on these types
  // during jest.requireActual is also properly managed.
}));

// Mock capture-services/types to control CaptureSourceType and other potential types
jest.mock('../../shared/capture-services/types', () => ({
  __esModule: true,
  CaptureSourceType: {
    TEXT: 'text',
    IMAGE_URL: 'image_url',
    PDF: 'pdf',
    AUDIO: 'audio',
    VIDEO: 'video',
    URL: 'url',
    DOCUMENT: 'document',
    FILE: 'file',
    SCREENSHOT: 'screenshot', // Added based on common capture types
    VOICE_MEMO: 'voice_memo', // Added based on common capture types
    WEBPAGE: 'webpage', // Added based on common capture types
    NOTE: 'note', // Added based on common capture types
  },
  CaptureItemStatus: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    ARCHIVED: 'archived',
  },
  CaptureItemPriority: {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
  },
  // Mock other enums/interfaces from capture-services/types if they become necessary
  // For example, if CaptureItem or other interfaces are instantiated or their properties checked directly in a way that mocks affect.
}));

// Mock ConfigManager to prevent actual file loading during tests
jest.mock('../../utils/config', () => ({
  __esModule: true, // Add this if config.ts uses ES modules and has default export or named exports like ConfigManager
  ConfigManager: {
    getInstance: jest.fn().mockReturnValue({
      get: jest.fn().mockImplementation((key: string) => {
        // Return minimal mock config values as needed by PromptManager or other services
        if (key === 'ai') {
          return {
            routing: { defaultProvider: 'openai', fallbackProvider: 'openai' },
            openai: { apiKey: 'test-api-key', models: { embedding: 'text-embedding-ada-002', completion: 'gpt-3.5-turbo' } },
            // Add other AI provider configs if PromptManager or related services might access them
          };
        }
        if (key === 'logging') {
          return { level: 'info', console: false, file: false }; // Provide necessary logging config
        }
        // Return a default mock for any other config keys to prevent errors
        return { mockKey: `mockValueFor_${key}` }; 
      }),
      // Mock other methods of ConfigManager if they are used directly or indirectly
      // e.g., initialize: jest.fn(),
    }),
  },
  // If there are other exports from config.ts that are used, mock them too
  // For example, if defaultConfig is exported and used:
  // defaultConfig: { app: { name: 'MockApp' } }, 
}));

// Mock ai-services/index to break potential circular dependencies - REMOVING jest.requireActual for debugging
jest.mock('../../shared/ai-services/index', () => {
  // const originalAIServicesIndex = jest.requireActual('../../shared/ai-services/index');
  return {
    __esModule: true, // Ensure ES module compatibility
    // ...originalAIServicesIndex, // Temporarily remove spreading original module
    globalPromptManager: jest.fn().mockImplementation(() => ({
      renderTemplate: jest.fn(),
      getTemplate: jest.fn(),
      listTemplates: jest.fn(),
      createTemplate: jest.fn(),
      updateTemplate: jest.fn(),
      deleteTemplate: jest.fn(),
    })),
    globalAIRoutingService: jest.fn().mockImplementation(() => ({
      chat: jest.fn(),
      chatStream: jest.fn(),
      createEmbedding: jest.fn(),
      getAvailableModels: jest.fn().mockResolvedValue([]),
      selectProvider: jest.fn(),
      createEmbeddings: jest.fn(),
      countTokens: jest.fn(),
      countMessageTokens: jest.fn(),
      getService: jest.fn(),
      logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(), verbose: jest.fn(), silly: jest.fn() },
      services: new Map(),
      config: {},
      registerServices: jest.fn(),
      getDefaultModelForProvider: jest.fn(),
    })),
    // Add any other exports from ai-services/index that might be needed, fully mocked
  };
});

// Mock the prompt-manager module - REMOVING jest.requireActual for debugging
jest.mock('../../shared/ai-services/prompt-manager', () => {
  // const OriginalModule = jest.requireActual('../../shared/ai-services/prompt-manager');
  return {
    __esModule: true,
    globalPromptManager: {
      renderTemplate: jest.fn<Promise<string>, [string, Record<string, string>]>(),
      getTemplate: jest.fn<Promise<PromptTemplate | null>, [string]>(),
      listTemplates: jest.fn<Promise<PromptTemplate[]>, [{ category?: string; tags?: string[]; search?: string; }?]>(),
      createTemplate: jest.fn<Promise<PromptTemplate>, [Omit<PromptTemplate, 'id' | 'created' | 'modified'>]>(),
      updateTemplate: jest.fn<Promise<PromptTemplate | null>, [string, Partial<Omit<PromptTemplate, 'id' | 'created' | 'modified'>>]>(),
      deleteTemplate: jest.fn<Promise<boolean>, [string]>(),
    },
    // PromptManager: OriginalModule.PromptManager, // Temporarily remove original class preservation
    // If PromptManager class is instantiated directly in the code under test (not just globalPromptManager used),
    // then a mock constructor might be needed here.
    PromptManager: jest.fn().mockImplementation(() => ({
      renderTemplate: jest.fn(),
      getTemplate: jest.fn(),
      listTemplates: jest.fn(),
      createTemplate: jest.fn(),
      updateTemplate: jest.fn(),
      deleteTemplate: jest.fn(),
      // Mock any other methods of PromptManager class instance
    })),
  };
});

// Mock TextProcessor and AI services
const mockTextProcessorProcess = jest.fn();
import { globalTextProcessor as actualGlobalTextProcessor } from '../../shared/capture-services/processors/text-processor';

// CaptureSourceType is already imported at the top

// jest.mock('../../shared/capture-services/processors/text-processor', () => {
//   // const ActualCaptureSourceType = jest.requireActual('../../shared/capture-services/types').CaptureSourceType;
//   return {
//     __esModule: true,
//     globalTextProcessor: {
//       processCaptureItem: mockTextProcessorProcess,
//       getSupportedSourceTypes: jest.fn().mockReturnValue([CaptureSourceType.TEXT]), // Using actual enum
//       getName: jest.fn().mockReturnValue('mocked-text-processor'),
//       getDescription: jest.fn().mockReturnValue('Mocked Text Processor'),
//       // TextProcessor class is not directly used by file-processor.ts, so we can remove the mock for the class itself
//     },
//   };
// });

// globalTextProcessor will be imported and its methods spied upon in the test suite.

jest.mock('../../shared/ai-services/prompt-manager');

// Comprehensive mock for ai-services module
const mockAIRoutingServiceChat = jest.fn();
const mockAIRoutingServiceChatStream = jest.fn();
const mockAIRoutingServiceCreateEmbedding = jest.fn();
const mockAIRoutingServiceGetAvailableModels = jest.fn().mockResolvedValue([]); // Crucial: mock implementation
const mockAIRoutingServiceSelectProvider = jest.fn();
const mockAIRoutingServiceCreateEmbeddings = jest.fn();
const mockAIRoutingServiceCountTokens = jest.fn();
const mockAIRoutingServiceCountMessageTokens = jest.fn();
const mockAIRoutingServiceGetService = jest.fn().mockImplementation((provider: AIProvider) => {
  if (provider === AIProvider.OPENAI) {
    return {
      chat: jest.fn(),
      chatStream: jest.fn(),
      createEmbedding: jest.fn(),
      createEmbeddings: jest.fn(),
      getAvailableModels: jest.fn().mockResolvedValue([]), // Mock for OpenAIService instance
      countTokens: jest.fn(),
      countMessageTokens: jest.fn(),
      getPromptManager: jest.fn().mockReturnValue(globalPromptManager)
    };
  }
  return undefined;
});

jest.mock('../../shared/ai-services', () => {
  // Ensure that when the mocked getService returns a service (e.g., a mocked OpenAIService),
  // and that service's getPromptManager is called, it returns the correctly mocked globalPromptManager.
  const mockedGlobalPromptManager = jest.requireMock('../../shared/ai-services/prompt-manager').globalPromptManager;

  return {
    __esModule: true,
    globalAIRoutingService: {
      chat: jest.fn(),
      chatStream: jest.fn(),
      createEmbedding: jest.fn(),
      getAvailableModels: jest.fn().mockResolvedValue([]), // Inlined
      selectProvider: jest.fn(),
      createEmbeddings: jest.fn(),
      countTokens: jest.fn(),
      countMessageTokens: jest.fn(),
      getService: jest.fn().mockImplementation((provider: AIProvider) => {
        if (provider === AIProvider.OPENAI) {
          return {
            chat: jest.fn(),
            chatStream: jest.fn(),
            createEmbedding: jest.fn(),
            createEmbeddings: jest.fn(),
            getAvailableModels: jest.fn().mockResolvedValue([]),
            countTokens: jest.fn(),
            countMessageTokens: jest.fn(),
            getPromptManager: jest.fn().mockReturnValue(mockedGlobalPromptManager)
          };
        }
        return undefined;
      }),
      logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(), verbose: jest.fn(), silly: jest.fn() } as unknown as Logger,
      services: new Map<AIProvider, IAIService>(),
      config: {},
      registerServices: jest.fn(),
      getDefaultModelForProvider: jest.fn(),
    },
  };
});


const createMockCaptureItem = (
  fileContent: string | Buffer,
  sourceType: CaptureSourceType,
  fileName: string,
  mimeType: string
): CaptureItem => ({
  id: `test-item-${fileName}-${Date.now()}`,
  sourceType: sourceType,
  content: {
    file: {
      fileContent,
      mimeType,
      fileName,
      fileSize: typeof fileContent === 'string' ? fileContent.length : fileContent.byteLength,
    }
  } as CaptureItemContent,
  metadata: {
    title: fileName,
    url: `file://${fileName}`,
    source: sourceType,
    capturedDate: new Date().toISOString(),
    fileType: mimeType, // Changed from mimeType to fileType
  },
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  userId: 'test-user',
  status: CaptureItemStatus.PENDING,
  priority: CaptureItemPriority.NORMAL,
});

import { ConfigManager } from '../../utils/config'; // Added import for ConfigManager

describe('FileProcessor', () => {
  let processCaptureItemSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset mocks before each test
    mockTextProcessorProcess.mockClear();
    // Spy on the actual globalTextProcessor's method
    processCaptureItemSpy = jest.spyOn(actualGlobalTextProcessor, 'processCaptureItem').mockImplementation(mockTextProcessorProcess);
  });

  afterEach(() => {
    // Restore the original implementation after each test
    processCaptureItemSpy.mockRestore();
  });

  let fileProcessor: FileProcessor;

  beforeEach(() => {
    ConfigManager.getInstance(); // Ensure ConfigManager is initialized
    fileProcessor = new FileProcessor();
    mockTextProcessorProcess.mockClear();
    mockAIRoutingServiceChat.mockClear();

    (globalPromptManager.renderTemplate as jest.Mock).mockClear();
    (globalPromptManager.getTemplate as jest.Mock).mockClear();
    (globalPromptManager.listTemplates as jest.Mock).mockClear();
    (globalPromptManager.createTemplate as jest.Mock).mockClear();
    (globalPromptManager.updateTemplate as jest.Mock).mockClear();
    (globalPromptManager.deleteTemplate as jest.Mock).mockClear();
  });

  it('should process a generic file by extracting text content', async () => {
    const mockItem = createMockCaptureItem('dummygenericcontent', CaptureSourceType.FILE, 'test.bin', 'application/octet-stream');
    mockTextProcessorProcess.mockResolvedValue({ success: true });

    const result = await fileProcessor.processCaptureItem(mockItem);

    expect(result.success).toBe(true);
    expect(result.extractedMetadata?.mimeType).toBe('application/octet-stream');
    expect(mockTextProcessorProcess).not.toHaveBeenCalled();
  });

  test('should return error if no file content is provided', async () => {
    const mockItem: CaptureItem = {
      id: 'test-no-file-item',
      sourceType: CaptureSourceType.FILE,
      content: {},
      metadata: { title: 'no-file', url: 'test', source: CaptureSourceType.FILE, capturedDate: new Date().toISOString() },
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      userId: 'test-user',
      status: CaptureItemStatus.PENDING,
      priority: CaptureItemPriority.NORMAL,
    };

    const result = await fileProcessor.processCaptureItem(mockItem);

    expect(result.success).toBe(false);
    expect(result.message).toContain('No file content found in capture item');
  });

  test('should return error if text file content is not a string', async () => {
    const mockItem = createMockCaptureItem(123 as any, CaptureSourceType.FILE, 'invalid.txt', 'text/plain');
    
    const result = await fileProcessor.processCaptureItem(mockItem);

    expect(result.success).toBe(false);
    expect(result.message).toContain('File content is not a string');
  });

  test('should process markdown file and extract structure', async () => {
    const markdownContent = '# Title\n## Subtitle\n- Point 1\n- Point 2';
    const mockItem = createMockCaptureItem(markdownContent, CaptureSourceType.FILE, 'test.md', 'text/markdown');
    const mockTextProcessorResult: CaptureItemProcessingResult = {
      success: true,
      extractedText: markdownContent,
      summary: 'Markdown summary',
    };
    mockTextProcessorProcess.mockResolvedValue(mockTextProcessorResult);

    const originalAnalyzeMarkdownStructure = (FileProcessor.prototype as any).analyzeMarkdownStructure;
    (FileProcessor.prototype as any).analyzeMarkdownStructure = jest.fn().mockResolvedValue({ type: 'document', children: [{ type: 'heading', depth: 1 }] });

    const result = await fileProcessor.processCaptureItem(mockItem);

    expect(result.success).toBe(true);
    expect(result.extractedText).toBe(markdownContent);
    expect(result.extractedMetadata?.structure).toEqual({ type: 'document', children: [{ type: 'heading', depth: 1 }] });
    expect((FileProcessor.prototype as any).analyzeMarkdownStructure).toHaveBeenCalledWith(markdownContent);

    (FileProcessor.prototype as any).analyzeMarkdownStructure = originalAnalyzeMarkdownStructure;
  });

  test('should process JSON file and analyze structure', async () => {
    const jsonContent = '{"key": "value", "nested": {"num": 123}}';
    const mockItem = createMockCaptureItem(jsonContent, CaptureSourceType.FILE, 'test.json', 'application/json');
    const mockTextProcessorResult: CaptureItemProcessingResult = {
      success: true,
      extractedText: jsonContent,
      summary: 'JSON summary',
    };
    mockTextProcessorProcess.mockResolvedValue(mockTextProcessorResult);

    const originalAnalyzeJsonStructure = (FileProcessor.prototype as any).analyzeJsonStructure;
    (FileProcessor.prototype as any).analyzeJsonStructure = jest.fn().mockReturnValue({ type: 'object', properties: ['key', 'nested'] });

    const result = await fileProcessor.processCaptureItem(mockItem);

    expect(result.success).toBe(true);
    expect(result.extractedText).toBe(jsonContent);
    expect(result.extractedMetadata?.jsonStructure).toEqual({ type: 'object', properties: ['key', 'nested'] });
    expect((FileProcessor.prototype as any).analyzeJsonStructure).toHaveBeenCalledWith(JSON.parse(jsonContent));

    (FileProcessor.prototype as any).analyzeJsonStructure = originalAnalyzeJsonStructure;
  });

  // Restored Tests
  test('should process text file correctly', async () => {
    const mockTextFileContent = 'This is a plain text file.';
    const mockItem = createMockCaptureItem(mockTextFileContent, CaptureSourceType.FILE, 'test.txt', 'text/plain');
    const mockTextProcessorResult: CaptureItemProcessingResult = {
      success: true,
      extractedText: mockTextFileContent,
      summary: 'Mock summary',
      keyInsights: ['Mock insight'],
    };
    mockTextProcessorProcess.mockResolvedValue(mockTextProcessorResult);

    const result = await fileProcessor.processCaptureItem(mockItem);

    expect(result.success).toBe(true);
    expect(result.extractedText).toBe(mockTextFileContent);
    expect(result.summary).toBe('Mock summary');
    expect(result.keyInsights).toEqual(['Mock insight']);
    expect(mockTextProcessorProcess).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.objectContaining({ text: mockTextFileContent }),
    }));
  });

  test('should process PDF file by extracting text and calling TextProcessor', async () => {
    const mockPdfTextContent = 'This is text extracted from a PDF.';
    const mockItem = createMockCaptureItem('', CaptureSourceType.FILE, 'test.pdf', 'application/pdf');
    mockItem.content.text = mockPdfTextContent; 

    const mockTextProcessorResult: CaptureItemProcessingResult = {
      success: true,
      extractedText: mockPdfTextContent,
      summary: 'PDF summary',
    };
    mockTextProcessorProcess.mockResolvedValue(mockTextProcessorResult);

    const result = await fileProcessor.processCaptureItem(mockItem);

    expect(result.success).toBe(true);
    expect(result.extractedText).toBe(mockPdfTextContent);
    expect(result.summary).toBe('PDF summary');
    expect(mockTextProcessorProcess).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.objectContaining({ text: mockPdfTextContent }),
    }));
  });

  test('should process DOCX file by extracting text and calling TextProcessor', async () => {
    const mockDocxTextContent = 'This is text extracted from a DOCX file.';
    const mockItem = createMockCaptureItem('', CaptureSourceType.FILE, 'test.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    mockItem.content.text = mockDocxTextContent;

    const mockTextProcessorResult: CaptureItemProcessingResult = {
      success: true,
      extractedText: mockDocxTextContent,
      summary: 'DOCX summary',
    };
    mockTextProcessorProcess.mockResolvedValue(mockTextProcessorResult);

    const result = await fileProcessor.processCaptureItem(mockItem);

    expect(result.success).toBe(true);
    expect(result.extractedText).toBe(mockDocxTextContent);
    expect(result.summary).toBe('DOCX summary');
    expect(mockTextProcessorProcess).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.objectContaining({ text: mockDocxTextContent }),
    }));
  });

  test('should handle image file processing (placeholder)', async () => {
    const mockItem = createMockCaptureItem('dummyimagecontent', CaptureSourceType.FILE, 'test.png', 'image/png');
    mockTextProcessorProcess.mockResolvedValue({ success: true });

    const result = await fileProcessor.processCaptureItem(mockItem);

    expect(result.success).toBe(true);
    expect(result.extractedMetadata?.mimeType).toBe('image/png');
    expect(mockTextProcessorProcess).not.toHaveBeenCalled();
  });
});

// The following duplicate definition of createMockCaptureItem will be removed.
// const createMockCaptureItem = (id: string, sourceType: CaptureSourceType, content: CaptureItemContent): CaptureItem => ({
//   id,
//   sourceType, // Parameter name now matches usage
//   content,
//   // sourceApplication: 'test-app', // Removed, assuming this info might go into metadata or is not part of CaptureItem directly
//   // source: 'test-source', // Removed as it's now in metadata
//   // url: 'http://example.com/test.txt', // Removed as it's now in metadata
//   // title: 'Test Item', // Removed as it's now in metadata
//   created: new Date().toISOString(),
//   updated: new Date().toISOString(),
//   // tags: ['test', 'mock'], // Removed as it's now in metadata
//   status: CaptureItemStatus.PENDING,
//   priority: CaptureItemPriority.MEDIUM,
//   userId: 'test-user-id',
//   metadata: {
//     capturedDate: new Date().toISOString(),
//     title: 'Test Item',
//     source: 'test-source',
//     url: 'http://example.com/test.txt',
//     tags: ['test', 'mock'],
//     customFields: { testKey: 'testValue', sourceApplication: 'test-app' }, // Moved sourceApplication to customFields
//   },
//   processingResult: { // Renamed from processingInfo
//     success: true, // Added a default value for success
//     message: 'pending', // Kept message, assuming it maps to a string
//     // attempts: 0, // Removed attempts as it's not in CaptureItemProcessingResult
//   },
//   // aiProcessingInfo: { // Removed aiProcessingInfo as it's not in CaptureItem
//   //   status: 'pending',
//   //   distillations: [],
//   //   organisations: [],
//   // },
//   // relatedItemIds: [], // Removed relatedItemIds as it's not in CaptureItem
//   // version: 1, // Removed version as it's not in CaptureItem
//   // checksum: 'mock-checksum', // Removed checksum as it's not in CaptureItem
// });