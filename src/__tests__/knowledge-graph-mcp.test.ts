/**
 * 知识图谱MCP服务测试
 * 
 * 测试知识图谱MCP服务的基本功能
 */

import { v4 as uuidv4 } from 'uuid';

// 模拟MCP请求和响应类型
interface MCPRequest {
  id: string;
  service: string;
  version: string;
  action: string;
  params: any;
  metadata?: any;
}

interface MCPResponse {
  id: string;
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: any;
}

// 模拟知识图谱节点类型
enum NodeType {
  CONCEPT = 'CONCEPT',
  ENTITY = 'ENTITY',
  DOCUMENT = 'DOCUMENT',
  NOTE = 'NOTE'
}

// 模拟知识图谱MCP服务
class MockKnowledgeGraphMCPService {
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    // 简单的请求处理逻辑
    switch (request.action) {
      case 'createNode':
        return {
          id: request.id,
          success: true,
          data: {
            id: uuidv4(),
            ...request.params.input
          },
          metadata: {
            timestamp: new Date()
          }
        };
      default:
        return {
          id: request.id,
          success: false,
          error: {
            code: 'UNSUPPORTED_ACTION',
            message: `Action ${request.action} is not supported`
          },
          metadata: {
            timestamp: new Date()
          }
        };
    }
  }
}

describe('知识图谱MCP服务', () => {
  let service: MockKnowledgeGraphMCPService;

  beforeEach(() => {
    service = new MockKnowledgeGraphMCPService();
  });

  test('应该能够创建节点', async () => {
    // 创建节点请求
    const createNodeRequest: MCPRequest = {
      id: uuidv4(),
      service: 'KnowledgeGraphService',
      version: '1.0.0',
      action: 'createNode',
      params: {
        input: {
          type: NodeType.CONCEPT,
          label: '测试概念',
          properties: {
            description: '这是一个测试概念节点',
            tags: ['测试', 'MCP服务']
          }
        }
      },
      metadata: {
        timestamp: new Date(),
        source: 'test'
      }
    };

    // 处理请求
    const response = await service.handleRequest(createNodeRequest);

    // 验证响应
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data.type).toBe(NodeType.CONCEPT);
    expect(response.data.label).toBe('测试概念');
    expect(response.data.properties.description).toBe('这是一个测试概念节点');
    expect(response.data.properties.tags).toContain('测试');
    expect(response.data.properties.tags).toContain('MCP服务');
  });

  test('应该处理不支持的操作', async () => {
    // 不支持的操作请求
    const unsupportedRequest: MCPRequest = {
      id: uuidv4(),
      service: 'KnowledgeGraphService',
      version: '1.0.0',
      action: 'unsupportedAction',
      params: {},
      metadata: {
        timestamp: new Date(),
        source: 'test'
      }
    };

    // 处理请求
    const response = await service.handleRequest(unsupportedRequest);

    // 验证响应
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    expect(response.error?.code).toBe('UNSUPPORTED_ACTION');
    expect(response.error?.message).toContain('unsupportedAction');
  });
});