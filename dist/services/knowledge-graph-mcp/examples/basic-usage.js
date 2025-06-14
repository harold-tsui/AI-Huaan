"use strict";
/**
 * Knowledge Graph MCP Service Basic Usage Example - 知识图谱MCP服务基本使用示例
 */
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const knowledge_graph_mcp_service_1 = require("../knowledge-graph-mcp-service");
const types_1 = require("../../../shared/knowledge-graph-services/types");
/**
 * 基本使用示例
 */
async function basicUsageExample() {
    console.log('=== 知识图谱MCP服务基本使用示例 ===');
    // 初始化服务
    console.log('\n1. 初始化服务');
    await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.initialize();
    console.log('服务初始化完成');
    try {
        // 创建概念节点
        console.log('\n2. 创建概念节点');
        const createConceptRequest = {
            id: (0, uuid_1.v4)(),
            service: 'KnowledgeGraphService',
            version: '1.0.0',
            action: 'createNode',
            params: {
                input: {
                    type: types_1.NodeType.CONCEPT,
                    label: '构建第二大脑',
                    properties: {
                        description: '构建第二大脑是一种个人知识管理方法',
                        tags: ['PKM', '知识管理', '生产力']
                    }
                }
            },
            metadata: {
                timestamp: new Date(),
                source: 'example'
            }
        };
        const createConceptResponse = await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(createConceptRequest);
        console.log('创建概念节点响应:', JSON.stringify(createConceptResponse.data, null, 2));
        const conceptId = createConceptResponse.data.node.id;
        // 创建笔记节点
        console.log('\n3. 创建笔记节点');
        const createNoteRequest = {
            id: (0, uuid_1.v4)(),
            service: 'KnowledgeGraphService',
            version: '1.0.0',
            action: 'createNode',
            params: {
                input: {
                    type: types_1.NodeType.NOTE,
                    label: 'BASB方法论笔记',
                    properties: {
                        content: '构建第二大脑的核心步骤：捕获、整理、提炼、表达',
                        tags: ['笔记', 'BASB'],
                        created: new Date().toISOString()
                    }
                }
            },
            metadata: {
                timestamp: new Date(),
                source: 'example'
            }
        };
        const createNoteResponse = await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(createNoteRequest);
        console.log('创建笔记节点响应:', JSON.stringify(createNoteResponse.data, null, 2));
        const noteId = createNoteResponse.data.node.id;
        // 创建关系
        console.log('\n4. 创建关系');
        const createRelationshipRequest = {
            id: (0, uuid_1.v4)(),
            service: 'KnowledgeGraphService',
            version: '1.0.0',
            action: 'createRelationship',
            params: {
                input: {
                    type: types_1.RelationshipType.DESCRIBES,
                    sourceNodeId: noteId,
                    targetNodeId: conceptId,
                    properties: {
                        confidence: 0.9,
                        created: new Date().toISOString()
                    }
                }
            },
            metadata: {
                timestamp: new Date(),
                source: 'example'
            }
        };
        const createRelationshipResponse = await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(createRelationshipRequest);
        console.log('创建关系响应:', JSON.stringify(createRelationshipResponse.data, null, 2));
        // 查询节点
        console.log('\n5. 查询节点');
        const queryNodesRequest = {
            id: (0, uuid_1.v4)(),
            service: 'KnowledgeGraphService',
            version: '1.0.0',
            action: 'queryNodes',
            params: {
                options: {
                    types: [types_1.NodeType.CONCEPT, types_1.NodeType.NOTE],
                    properties: {
                        tags: ['BASB']
                    },
                    limit: 10
                }
            },
            metadata: {
                timestamp: new Date(),
                source: 'example'
            }
        };
        const queryNodesResponse = await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(queryNodesRequest);
        console.log('查询节点响应:', JSON.stringify(queryNodesResponse.data, null, 2));
        // 图遍历
        console.log('\n6. 图遍历');
        const traverseGraphRequest = {
            id: (0, uuid_1.v4)(),
            service: 'KnowledgeGraphService',
            version: '1.0.0',
            action: 'traverseGraph',
            params: {
                options: {
                    startNodeId: conceptId,
                    direction: 'INCOMING',
                    relationshipTypes: [types_1.RelationshipType.DESCRIBES],
                    maxDepth: 2
                }
            },
            metadata: {
                timestamp: new Date(),
                source: 'example'
            }
        };
        const traverseGraphResponse = await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(traverseGraphRequest);
        console.log('图遍历响应:', JSON.stringify(traverseGraphResponse.data, null, 2));
        // 获取图统计信息
        console.log('\n7. 获取图统计信息');
        const getGraphStatsRequest = {
            id: (0, uuid_1.v4)(),
            service: 'KnowledgeGraphService',
            version: '1.0.0',
            action: 'getGraphStats',
            params: {},
            metadata: {
                timestamp: new Date(),
                source: 'example'
            }
        };
        const getGraphStatsResponse = await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(getGraphStatsRequest);
        console.log('获取图统计信息响应:', JSON.stringify(getGraphStatsResponse.data, null, 2));
        // 清理数据
        console.log('\n8. 清理数据');
        // 删除关系
        const relationshipId = createRelationshipResponse.data.relationship.id;
        const deleteRelationshipRequest = {
            id: (0, uuid_1.v4)(),
            service: 'KnowledgeGraphService',
            version: '1.0.0',
            action: 'deleteRelationship',
            params: {
                id: relationshipId
            },
            metadata: {
                timestamp: new Date(),
                source: 'example'
            }
        };
        await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(deleteRelationshipRequest);
        // 删除节点
        const deleteNoteRequest = {
            id: (0, uuid_1.v4)(),
            service: 'KnowledgeGraphService',
            version: '1.0.0',
            action: 'deleteNode',
            params: {
                id: noteId
            },
            metadata: {
                timestamp: new Date(),
                source: 'example'
            }
        };
        await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(deleteNoteRequest);
        const deleteConceptRequest = {
            id: (0, uuid_1.v4)(),
            service: 'KnowledgeGraphService',
            version: '1.0.0',
            action: 'deleteNode',
            params: {
                id: conceptId
            },
            metadata: {
                timestamp: new Date(),
                source: 'example'
            }
        };
        await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(deleteConceptRequest);
        console.log('数据清理完成');
    }
    catch (error) {
        console.error('示例运行出错:', error);
    }
    finally {
        // 关闭服务
        console.log('\n9. 关闭服务');
        await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.shutdown();
        console.log('服务已关闭');
    }
    console.log('\n=== 示例完成 ===');
}
// 运行示例
basicUsageExample().catch(error => {
    console.error('示例出错:', error);
});
//# sourceMappingURL=basic-usage.js.map