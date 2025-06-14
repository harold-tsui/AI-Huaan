# API Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for APIs in the Building a Second Brain (BASB) system. It provides guidelines for testing different types of APIs, ensuring their quality, reliability, and conformance to specifications.

## Testing Objectives

The primary objectives of API testing in the BASB system are:

1. **Functionality Verification**: Ensure APIs function as specified
2. **Contract Validation**: Verify APIs conform to their defined contracts
3. **Performance Assessment**: Evaluate API performance under various conditions
4. **Security Validation**: Identify and address security vulnerabilities
5. **Reliability Testing**: Ensure APIs are reliable and stable
6. **Backward Compatibility**: Verify changes don't break existing clients

## Testing Types

### Unit Testing

Unit tests focus on testing individual components of the API implementation in isolation.

**Key Aspects**:
- Test individual functions, methods, and classes
- Mock external dependencies
- Focus on code paths and edge cases
- Run as part of the continuous integration pipeline

**Tools**:
- Jest for JavaScript/TypeScript
- JUnit for Java
- pytest for Python

**Example** (using Jest for TypeScript):

```typescript
describe('KnowledgeService', () => {
  let service: KnowledgeService;
  let mockRepository: MockType<KnowledgeRepository>;
  
  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn()
    };
    
    service = new KnowledgeService(mockRepository as any);
  });
  
  describe('getKnowledgeItem', () => {
    it('should return a knowledge item if it exists', async () => {
      // Arrange
      const mockItem = { id: '123', title: 'Test Item' };
      mockRepository.findById.mockResolvedValue(mockItem);
      
      // Act
      const result = await service.getKnowledgeItem('123');
      
      // Assert
      expect(result).toEqual(mockItem);
      expect(mockRepository.findById).toHaveBeenCalledWith('123');
    });
    
    it('should throw an error if the item does not exist', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(service.getKnowledgeItem('123')).rejects.toThrow('Knowledge item not found');
      expect(mockRepository.findById).toHaveBeenCalledWith('123');
    });
  });
  
  // Additional test cases for other methods
});
```

### Integration Testing

Integration tests verify that different components of the API work together correctly.

**Key Aspects**:
- Test interactions between components
- Use real dependencies when possible
- Focus on integration points and data flow
- Run as part of the continuous integration pipeline

**Tools**:
- Supertest for Node.js
- RestAssured for Java
- pytest with requests for Python

**Example** (using Supertest for Node.js):

```typescript
describe('Knowledge Item API', () => {
  let app: Express;
  let knowledgeRepository: KnowledgeRepository;
  
  beforeAll(async () => {
    // Setup test database
    await setupTestDatabase();
    
    // Create app with real dependencies
    app = createApp();
    knowledgeRepository = app.get(KnowledgeRepository);
  });
  
  afterAll(async () => {
    // Cleanup test database
    await cleanupTestDatabase();
  });
  
  describe('GET /api/v1/knowledge-items/:id', () => {
    it('should return a knowledge item if it exists', async () => {
      // Arrange
      const mockItem = { title: 'Test Item', content: 'Test Content', contentType: 'TEXT' };
      const savedItem = await knowledgeRepository.save(mockItem);
      
      // Act & Assert
      await request(app)
        .get(`/api/v1/knowledge-items/${savedItem.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(savedItem.id);
          expect(res.body.data.title).toBe(mockItem.title);
        });
    });
    
    it('should return 404 if the item does not exist', async () => {
      // Act & Assert
      await request(app)
        .get('/api/v1/knowledge-items/non-existent-id')
        .expect(404)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('not_found');
        });
    });
  });
  
  // Additional test cases for other endpoints
});
```

### Contract Testing

Contract tests verify that APIs conform to their defined contracts (OpenAPI, GraphQL schema).

**Key Aspects**:
- Validate request and response formats
- Ensure API behavior matches documentation
- Focus on API contracts and schemas
- Run as part of the continuous integration pipeline

**Tools**:
- Pact for consumer-driven contract testing
- Dredd for OpenAPI validation
- Apollo GraphQL testing tools for GraphQL

**Example** (using Pact for consumer-driven contract testing):

```typescript
// Consumer side (client)
describe('Knowledge Item API Client', () => {
  let provider;
  
  beforeAll(async () => {
    provider = new Pact({
      consumer: 'knowledge-web-client',
      provider: 'knowledge-api',
      log: path.resolve(process.cwd(), 'logs', 'pact.log'),
      logLevel: 'warn',
      dir: path.resolve(process.cwd(), 'pacts'),
      spec: 2
    });
    
    await provider.setup();
  });
  
  afterAll(async () => {
    await provider.finalize();
  });
  
  describe('getKnowledgeItem', () => {
    beforeEach(() => {
      return provider.addInteraction({
        state: 'a knowledge item with ID 123 exists',
        uponReceiving: 'a request for a knowledge item',
        withRequest: {
          method: 'GET',
          path: '/api/v1/knowledge-items/123'
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            success: true,
            data: {
              id: '123',
              title: Matchers.string('Test Item'),
              content: Matchers.string(),
              contentType: Matchers.term({
                generate: 'TEXT',
                matcher: '^(TEXT|IMAGE|AUDIO|VIDEO|CODE)$'
              }),
              createdAt: Matchers.iso8601DateTime(),
              updatedAt: Matchers.iso8601DateTime()
            }
          }
        }
      });
    });
    
    it('should get a knowledge item', async () => {
      // Act
      const client = new KnowledgeApiClient(provider.mockService.baseUrl);
      const item = await client.getKnowledgeItem('123');
      
      // Assert
      expect(item).toBeDefined();
      expect(item.id).toBe('123');
      expect(item.title).toBe('Test Item');
    });
  });
});

// Provider side (API)
describe('Knowledge API Provider', () => {
  const port = 3000;
  let provider;
  let server;
  
  beforeAll(async () => {
    provider = new Verifier({
      providerBaseUrl: `http://localhost:${port}`,
      pactBrokerUrl: process.env.PACT_BROKER_URL,
      pactBrokerToken: process.env.PACT_BROKER_TOKEN,
      publishVerificationResult: true,
      providerVersion: process.env.VERSION,
      providerVersionTags: ['dev']
    });
    
    server = app.listen(port);
  });
  
  afterAll(() => {
    server.close();
  });
  
  it('should validate the expectations of Knowledge Web Client', () => {
    return provider.verifyProvider();
  });
});
```

### End-to-End Testing

End-to-end tests verify the entire API flow from client to database and back.

**Key Aspects**:
- Test complete user flows
- Use real dependencies and environments
- Focus on business scenarios
- Run in staging environments

**Tools**:
- Cypress for web applications
- Postman for API testing
- Selenium for browser-based testing

**Example** (using Postman collections):

```json
{
  "info": {
    "name": "Knowledge Item API E2E Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Knowledge Item",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 201', function() {",
              "  pm.response.to.have.status(201);",
              "});",
              "pm.test('Response has correct format', function() {",
              "  const response = pm.response.json();",
              "  pm.expect(response.success).to.be.true;",
              "  pm.expect(response.data).to.have.property('id');",
              "  pm.expect(response.data.title).to.eql('E2E Test Item');",
              "  pm.globals.set('itemId', response.data.id);",
              "});"
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"E2E Test Item\",\n  \"content\": \"This is a test item created during E2E testing.\",\n  \"contentType\": \"TEXT\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/v1/knowledge-items",
          "host": ["{{baseUrl}}"],
          "path": ["api", "v1", "knowledge-items"]
        }
      }
    },
    {
      "name": "Get Knowledge Item",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 200', function() {",
              "  pm.response.to.have.status(200);",
              "});",
              "pm.test('Response has correct format', function() {",
              "  const response = pm.response.json();",
              "  pm.expect(response.success).to.be.true;",
              "  pm.expect(response.data.id).to.eql(pm.globals.get('itemId'));",
              "  pm.expect(response.data.title).to.eql('E2E Test Item');",
              "});"
            ],
            "type": "text/javascript"
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{authToken}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/v1/knowledge-items/{{itemId}}",
          "host": ["{{baseUrl}}"],
          "path": ["api", "v1", "knowledge-items", "{{itemId}}"]
        }
      }
    }
  ]
}
```

### Performance Testing

Performance tests evaluate API performance under various conditions.

**Key Aspects**:
- Measure response times
- Test throughput and concurrency
- Identify bottlenecks
- Establish performance baselines
- Run in staging environments

**Tools**:
- k6 for load testing
- JMeter for performance testing
- Gatling for stress testing

**Example** (using k6 for load testing):

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users over 30 seconds
    { duration: '1m', target: 20 },  // Stay at 20 users for 1 minute
    { duration: '30s', target: 0 }   // Ramp down to 0 users over 30 seconds
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete within 500ms
    'http_req_duration{name:get-knowledge-item}': ['p(95)<300'], // 95% of get-knowledge-item requests must complete within 300ms
    'http_req_duration{name:list-knowledge-items}': ['p(95)<400'] // 95% of list-knowledge-items requests must complete within 400ms
  }
};

export default function() {
  const baseUrl = 'https://api.basb-staging.example.com';
  const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Test auth token
  
  // Get a single knowledge item
  const getItemResponse = http.get(`${baseUrl}/api/v1/knowledge-items/item123`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    tags: { name: 'get-knowledge-item' }
  });
  
  check(getItemResponse, {
    'get item status is 200': (r) => r.status === 200,
    'get item response has correct format': (r) => {
      const response = JSON.parse(r.body);
      return response.success === true && response.data.id === 'item123';
    }
  });
  
  sleep(1);
  
  // List knowledge items
  const listItemsResponse = http.get(`${baseUrl}/api/v1/knowledge-items?limit=20&offset=0`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    tags: { name: 'list-knowledge-items' }
  });
  
  check(listItemsResponse, {
    'list items status is 200': (r) => r.status === 200,
    'list items response has correct format': (r) => {
      const response = JSON.parse(r.body);
      return response.success === true && Array.isArray(response.data.items);
    }
  });
  
  sleep(2);
}
```

### Security Testing

Security tests identify and address security vulnerabilities in APIs.

**Key Aspects**:
- Test authentication and authorization
- Identify common vulnerabilities (OWASP Top 10)
- Perform penetration testing
- Run in staging environments

**Tools**:
- OWASP ZAP for vulnerability scanning
- Burp Suite for penetration testing
- SonarQube for static code analysis

**Example** (using OWASP ZAP API):

```javascript
const ZapClient = require('zaproxy');

async function runSecurityTests() {
  const zapOptions = {
    apiKey: process.env.ZAP_API_KEY,
    proxy: {
      host: 'localhost',
      port: 8080
    }
  };
  
  const zaproxy = new ZapClient(zapOptions);
  
  // Start a new session
  await zaproxy.core.newSession('BASB API Security Test', true);
  
  // Define the target API
  const target = 'https://api.basb-staging.example.com';
  await zaproxy.core.accessUrl(target);
  
  // Spider the API
  const scanId = await zaproxy.spider.scan(target, 5, 'apikey=test-api-key');
  console.log('Spider scan ID:', scanId);
  
  // Wait for spider to complete
  let spiderProgress = 0;
  while (spiderProgress < 100) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    spiderProgress = parseInt(await zaproxy.spider.status(scanId));
    console.log('Spider progress:', spiderProgress + '%');
  }
  
  // Run active scan
  const activeScanId = await zaproxy.ascan.scan(target, true, true, 'apikey=test-api-key');
  console.log('Active scan ID:', activeScanId);
  
  // Wait for active scan to complete
  let activeScanProgress = 0;
  while (activeScanProgress < 100) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    activeScanProgress = parseInt(await zaproxy.ascan.status(activeScanId));
    console.log('Active scan progress:', activeScanProgress + '%');
  }
  
  // Get the alerts
  const alerts = await zaproxy.core.alerts(target, 0, 100);
  console.log('Alerts:', JSON.stringify(alerts, null, 2));
  
  // Generate report
  const report = await zaproxy.core.htmlreport();
  require('fs').writeFileSync('security-report.html', report);
  console.log('Report saved to security-report.html');
}

runSecurityTests().catch(console.error);
```

## Testing Environments

### Local Development

- **Purpose**: Rapid development and testing
- **Configuration**: Local databases, mocked external services
- **Tests**: Unit tests, basic integration tests

### Continuous Integration

- **Purpose**: Automated testing on code changes
- **Configuration**: Test databases, containerized services
- **Tests**: Unit tests, integration tests, contract tests

### Staging

- **Purpose**: Pre-production validation
- **Configuration**: Production-like environment
- **Tests**: End-to-end tests, performance tests, security tests

### Production

- **Purpose**: Live system monitoring
- **Configuration**: Production environment
- **Tests**: Smoke tests, synthetic monitoring

## Testing Workflow

### Development Phase

1. **Write Tests**: Develop tests alongside code (TDD approach)
2. **Run Local Tests**: Execute unit and integration tests locally
3. **Code Review**: Include test coverage in code reviews

### Continuous Integration Phase

1. **Automated Testing**: Run tests on every pull request
2. **Coverage Analysis**: Ensure adequate test coverage
3. **Quality Gates**: Enforce passing tests before merging

### Release Phase

1. **Regression Testing**: Run full test suite
2. **Performance Testing**: Verify performance meets requirements
3. **Security Testing**: Scan for vulnerabilities

### Production Phase

1. **Smoke Testing**: Verify basic functionality after deployment
2. **Synthetic Monitoring**: Continuously test critical paths
3. **Anomaly Detection**: Monitor for unexpected behavior

## Test Data Management

### Test Data Sources

1. **Generated Data**: Programmatically generated test data
2. **Fixed Test Data**: Predefined test data sets
3. **Anonymized Production Data**: Sanitized copies of production data

### Test Data Strategies

1. **Isolated Test Data**: Each test has its own data
2. **Shared Test Data**: Common data used across tests
3. **Test Data as Code**: Version-controlled test data

**Example** (using factory pattern for test data):

```typescript
// Test data factory
class KnowledgeItemFactory {
  static createDefault(): KnowledgeItem {
    return {
      id: uuid(),
      title: 'Test Knowledge Item',
      content: 'This is a test knowledge item.',
      contentType: 'TEXT',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        source: 'test',
        capturedAt: new Date()
      }
    };
  }
  
  static createWithTags(tags: string[]): KnowledgeItem {
    return {
      ...this.createDefault(),
      tags: tags.map(tag => ({ id: uuid(), name: tag }))
    };
  }
  
  static createBatch(count: number): KnowledgeItem[] {
    return Array.from({ length: count }, (_, i) => ({
      ...this.createDefault(),
      title: `Test Knowledge Item ${i + 1}`
    }));
  }
}

// Using the factory in tests
describe('Knowledge Item API', () => {
  it('should list knowledge items', async () => {
    // Arrange
    const items = KnowledgeItemFactory.createBatch(5);
    await knowledgeRepository.saveMany(items);
    
    // Act & Assert
    await request(app)
      .get('/api/v1/knowledge-items')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.items.length).toBe(5);
      });
  });
});
```

## Test Automation

### Continuous Integration

- **Tools**: GitHub Actions, Jenkins, CircleCI
- **Triggers**: Pull requests, scheduled runs
- **Reporting**: Test results, coverage reports

**Example** (GitHub Actions workflow):

```yaml
name: API Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:unit
      - name: Upload coverage
        uses: codecov/codecov-action@v2
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
  
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
  
  contract-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run contract tests
        run: npm run test:contract
      - name: Publish pacts
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: npm run pact:publish
        env:
          PACT_BROKER_URL: ${{ secrets.PACT_BROKER_URL }}
          PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
```

### Test Reporting

- **Formats**: JUnit XML, HTML reports
- **Metrics**: Pass/fail rates, coverage, duration
- **Visualization**: Dashboards, trend analysis

## Testing Best Practices

### General Best Practices

1. **Test Pyramid**: Focus on unit tests, followed by integration tests, with fewer end-to-end tests
2. **Test Independence**: Tests should be independent and not rely on each other
3. **Test Readability**: Tests should be clear and easy to understand
4. **Test Maintainability**: Tests should be easy to maintain and update
5. **Test Coverage**: Aim for high test coverage, especially for critical paths

### API-Specific Best Practices

1. **Test All Endpoints**: Cover all API endpoints and methods
2. **Test Response Formats**: Verify response formats match specifications
3. **Test Error Handling**: Verify proper error responses for invalid inputs
4. **Test Authentication**: Verify authentication and authorization
5. **Test Rate Limiting**: Verify rate limiting behavior
6. **Test Pagination**: Verify pagination works correctly
7. **Test Filtering**: Verify filtering parameters work correctly
8. **Test Sorting**: Verify sorting parameters work correctly

## Testing Challenges and Solutions

### External Dependencies

**Challenge**: Testing APIs that depend on external services

**Solutions**:
1. **Service Virtualization**: Mock external services
2. **Test Doubles**: Use stubs, mocks, and fakes
3. **Contract Testing**: Verify contracts with external services

### Test Data Management

**Challenge**: Managing test data across environments

**Solutions**:
1. **Data as Code**: Version control test data
2. **Data Factories**: Generate test data programmatically
3. **Database Snapshots**: Use database snapshots for consistent starting points

### Test Flakiness

**Challenge**: Dealing with intermittent test failures

**Solutions**:
1. **Retry Mechanisms**: Retry flaky tests
2. **Isolation**: Improve test isolation
3. **Logging**: Enhance logging for better debugging
4. **Root Cause Analysis**: Identify and fix underlying issues

## Conclusion

A comprehensive testing strategy is essential for ensuring the quality, reliability, and security of APIs in the BASB system. By following the guidelines and best practices outlined in this document, the development team can deliver high-quality APIs that meet the needs of users and integrate seamlessly with other components of the system.

## Appendix

### Testing Checklist

- [ ] Unit tests for all components
- [ ] Integration tests for API endpoints
- [ ] Contract tests for API specifications
- [ ] End-to-end tests for critical flows
- [ ] Performance tests for key operations
- [ ] Security tests for vulnerabilities
- [ ] Test automation in CI/CD pipeline
- [ ] Test reporting and monitoring

### References

- [REST API Testing Best Practices](https://restfulapi.net/testing-restful-services/)
- [GraphQL Testing Best Practices](https://graphql.org/learn/best-practices/#testing)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Contract Testing with Pact](https://docs.pact.io/)
- [Performance Testing with k6](https://k6.io/docs/)