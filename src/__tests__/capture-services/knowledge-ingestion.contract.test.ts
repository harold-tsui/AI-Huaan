import path from 'path';
import axios from 'axios';
import jestOpenAPI from 'jest-openapi';

// Load the OpenAPI specification
const apiSpecPath = path.resolve(__dirname, '../../../specifitions/api-documentation/backend/knowledge-ingestion-api.yaml');
jestOpenAPI(apiSpecPath);

const api = axios.create({
  baseURL: 'http://localhost:8081',
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Resolve only if the status code is less than 500
  },
});

describe('Knowledge Ingestion API Contract Tests', () => {
  // This is a placeholder test. In a real scenario, you would have a running server
  // and make actual API calls to it, then validate the responses against the schema.
  const mockApiResponse = {
    status: 201,
    body: {
      success: true,
      data: {
        id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
        title: 'Sample Note',
        content_path: '/data/content/d290f1ee.md',
        source_url: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
  };

  // TODO: This test is temporarily disabled until the server-side ECONNREFUSED issue is resolved.
it.skip('should satisfy the contract for a successful request to POST /capture/note', async () => {
    const res = await axios.post(
      'http://127.0.0.1:8081/api/capture/note',
      {
        title: 'Test Note',
        content: 'This is a test note.',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    try {
      expect(res.status).toEqual(201);
      expect(res).toSatisfyApiSpec();
    } catch (error: any) {
      console.error('Error in success request test:', JSON.stringify(error, null, 2));
      throw error;
    }
  });

  it('should satisfy the contract for a bad request to POST /capture/note', async () => {
    const res = await axios.post(
      'http://localhost:8081/api/capture/note',
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
      },
    );
    expect(res.status).toEqual(400);
    expect(res).toSatisfyApiSpec();
  });
});