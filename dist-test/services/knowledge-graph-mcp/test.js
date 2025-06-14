"use strict";
/**
 * Knowledge Graph MCP Service Test - 知识图谱MCP服务测试
 *
 * 测试知识图谱MCP服务的功能
 */
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const knowledge_graph_mcp_service_1 = require("./knowledge-graph-mcp-service");
const types_1 = require("../../shared/knowledge-graph-services/types");
/**
 * 运行测试
 */
async function runTest() {
    console.log('=== 知识图谱MCP服务测试 ===');
    // 初始化服务
    console.log('\n1. 初始化服务');
    await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.initialize();
    console.log('服务初始化完成');
    // 创建测试节点
    console.log('\n2. 创建测试节点');
    const createNodeRequest = {
        id: (0, uuid_1.v4)(),
        service: 'KnowledgeGraphService',
        version: '1.0.0',
        action: 'createNode',
        params: {
            input: {
                type: types_1.NodeType.CONCEPT,
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
    const createNodeResponse = await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(createNodeRequest);
    console.log('创建节点响应:', JSON.stringify(createNodeResponse, null, 2));
    if (createNodeResponse.status !== 'success' || !createNodeResponse.data?.node) {
        console.error('创建节点失败');
        return;
    }
    const nodeId = createNodeResponse.data.node.id;
    // 获取节点
    console.log('\n3. 获取节点');
    const getNodeRequest = {
        id: (0, uuid_1.v4)(),
        service: 'KnowledgeGraphService',
        version: '1.0.0',
        action: 'getNode',
        params: {
            id: nodeId
        },
        metadata: {
            timestamp: new Date(),
            source: 'test'
        }
    };
    const getNodeResponse = await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(getNodeRequest);
    console.log('获取节点响应:', JSON.stringify(getNodeResponse, null, 2));
    // 更新节点
    console.log('\n4. 更新节点');
    const updateNodeRequest = {
        id: (0, uuid_1.v4)(),
        service: 'KnowledgeGraphService',
        version: '1.0.0',
        action: 'updateNode',
        params: {
            id: nodeId,
            input: {
                label: '更新后的测试概念',
                properties: {
                    description: '这是一个更新后的测试概念节点',
                    importance: 'high'
                }
            }
        },
        metadata: {
            timestamp: new Date(),
            source: 'test'
        }
    };
    const updateNodeResponse = await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(updateNodeRequest);
    console.log('更新节点响应:', JSON.stringify(updateNodeResponse, null, 2));
    // 查询节点
    console.log('\n5. 查询节点');
    const queryNodesRequest = {
        id: (0, uuid_1.v4)(),
        service: 'KnowledgeGraphService',
        version: '1.0.0',
        action: 'queryNodes',
        params: {
            options: {
                types: [types_1.NodeType.CONCEPT],
                limit: 10
            }
        },
        metadata: {
            timestamp: new Date(),
            source: 'test'
        }
    };
    const queryNodesResponse = await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(queryNodesRequest);
    console.log('查询节点响应:', JSON.stringify(queryNodesResponse, null, 2));
    // 获取图统计信息
    console.log('\n6. 获取图统计信息');
    const getGraphStatsRequest = {
        id: (0, uuid_1.v4)(),
        service: 'KnowledgeGraphService',
        version: '1.0.0',
        action: 'getGraphStats',
        params: {},
        metadata: {
            timestamp: new Date(),
            source: 'test'
        }
    };
    const getGraphStatsResponse = await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(getGraphStatsRequest);
    console.log('获取图统计信息响应:', JSON.stringify(getGraphStatsResponse, null, 2));
    // 删除节点
    console.log('\n7. 删除节点');
    const deleteNodeRequest = {
        id: (0, uuid_1.v4)(),
        service: 'KnowledgeGraphService',
        version: '1.0.0',
        action: 'deleteNode',
        params: {
            id: nodeId
        },
        metadata: {
            timestamp: new Date(),
            source: 'test'
        }
    };
    const deleteNodeResponse = await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(deleteNodeRequest);
    console.log('删除节点响应:', JSON.stringify(deleteNodeResponse, null, 2));
    // 关闭服务
    console.log('\n8. 关闭服务');
    await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.shutdown();
    console.log('服务已关闭');
    console.log('\n=== 测试完成 ===');
}
// 运行测试
runTest().catch(error => {
    console.error('测试出错:', error);
});
//# sourceMappingURL=test.js.map