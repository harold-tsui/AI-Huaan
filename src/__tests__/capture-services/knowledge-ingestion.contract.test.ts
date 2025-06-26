import axios from 'axios';
import jestOpenAPI from 'jest-openapi';
import { Server } from 'http';
import path from 'path';
import { bootstrap, shutdown } from '../../main';
import { initializeGlobalLogger, LogLevel } from '../../utils/logger';

// Initialize logger first to avoid Winston transport warnings
initializeGlobalLogger({ 
  level: LogLevel.INFO, 
  console: true, 
  file: false 
});

// Load the OpenAPI specification
const apiSpecPath = path.resolve(__dirname, '../../../specifitions/api-documentation/backend/knowledge-ingestion-api.yaml');
jestOpenAPI(apiSpecPath);

// Use a different port for testing to avoid conflicts
const TEST_PORT = 8082;
process.env.PORT = TEST_PORT.toString();

// Configure logger for testing environment
process.env.LOG_CONSOLE = 'true';
process.env.LOG_FILE = 'false';
process.env.LOG_LEVEL = 'info';

const api = axios.create({
  baseURL: `http://127.0.0.1:${TEST_PORT}`,
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Resolve only if the status code is less than 500
  },
});

describe('Knowledge Ingestion API Contract Tests', () => {
  let server: Server;

  beforeAll(async () => {
    server = await bootstrap();
  });

  afterAll(async () => {
    await shutdown(server);
  });

  it('should satisfy the contract for a successful request to POST /capture/note', async () => {
    try {
      const res = await api.post(
        '/api/capture/note',
        {
          title: 'Test Note',
          content: 'This is a test note.',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response status:', res.status);
      console.log('Response data:', res.data);

      expect(res.status).toBe(200);
      expect(res).toSatisfyApiSpec();
    } catch (error: any) {
      console.error('Test failed with error:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  });

  it('should satisfy the contract for an invalid request to POST /capture/note', async () => {
    const res = await api.post(
      '/api/capture/note',
      {
        // Missing required fields
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    expect(res.status).toBe(400);
    expect(res).toSatisfyApiSpec();
  });
});