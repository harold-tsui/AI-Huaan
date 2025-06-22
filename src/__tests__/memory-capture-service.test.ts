import { MemoryCaptureService } from '../shared/capture-services/memory-capture-service';
import { CaptureItem, CaptureSourceType, WebCaptureOptions } from '../shared/capture-services/types';
import axios from 'axios';
import { ConfigManager } from '../utils/config'; // Import ConfigManager

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock ConfigManager
jest.mock('../utils/config', () => ({
  ConfigManager: {
    getInstance: jest.fn().mockReturnValue({
      getConfig: jest.fn().mockReturnValue({
        captureServices: {
          tempDir: '/tmp/basb-capture-test',
        },
        // Add other necessary mock config properties if needed
      }),
    }),
  },
}));

describe('MemoryCaptureService - Web Capture', () => {
  let captureService: MemoryCaptureService;

  beforeEach(() => {
    // Ensure ConfigManager mock is reset/configured before each test if necessary
    // For this specific case, the module-level mock should suffice for getConfig
    captureService = new MemoryCaptureService();
    // Reset mocks before each test
    mockedAxios.get.mockReset();
  });

  test('should capture content from a web URL successfully', async () => {
    const mockUrl = 'http://example.com/test-page';
    const mockHtmlContent = '<html><head><title>Test Page</title></head><body><h1>Hello World</h1></body></html>';
    const mockWebCaptureOptions: WebCaptureOptions = { url: mockUrl };

    mockedAxios.get.mockResolvedValue({ data: mockHtmlContent, status: 200, statusText: 'OK', headers: {}, config: {} });

    const capturedItem: CaptureItem = await captureService.captureFromWeb(mockWebCaptureOptions, {});

    expect(mockedAxios.get).toHaveBeenCalledWith(mockUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      responseType: 'text',
      timeout: 30000,
    });
    expect(capturedItem).toBeDefined();
    expect(capturedItem.sourceType).toBe(CaptureSourceType.WEB);
    expect(capturedItem.metadata.url).toBe(mockUrl);
    expect(capturedItem.metadata.title).toBe('Test Page'); // Assuming title is extracted
    expect(capturedItem.content.html).toBe(mockHtmlContent);
    expect(capturedItem.content.text).toContain('Hello World'); // Assuming text is extracted
  });

  test('should handle error when fetching web page fails', async () => {
    const mockUrl = 'http://example.com/error-page';
    const mockWebCaptureOptions: WebCaptureOptions = { url: mockUrl };

    mockedAxios.get.mockRejectedValue(new Error('Network Error'));

    await expect(captureService.captureFromWeb(mockWebCaptureOptions, {})).rejects.toThrow('Failed to fetch web page: Network Error');
    expect(mockedAxios.get).toHaveBeenCalledWith(mockUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      responseType: 'text',
      timeout: 30000,
    });
  });

  test('should use custom User-Agent if provided', async () => {
    const mockUrl = 'http://example.com/custom-agent';
    const mockUserAgent = 'Test User Agent';
    const mockHtmlContent = '<html><head><title>Custom Agent Test</title></head><body>Content</body></html>';
    const mockWebCaptureOptions: WebCaptureOptions = { url: mockUrl, userAgent: mockUserAgent };

    mockedAxios.get.mockResolvedValue({ data: mockHtmlContent, status: 200, statusText: 'OK', headers: {}, config: {} });

    await captureService.captureFromWeb(mockWebCaptureOptions, {});

    expect(mockedAxios.get).toHaveBeenCalledWith(mockUrl, {
      headers: {
        'User-Agent': mockUserAgent,
      },
      responseType: 'text',
      timeout: 30000,
    });
  });

  // Add more tests for other scenarios, e.g.:
  // - Different content types
  // - Proxy usage
  // - Timeout scenarios
  // - Correct metadata extraction (description, author, etc.)
  // - Correct content extraction (markdown, text)
});