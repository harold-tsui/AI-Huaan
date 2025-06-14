"use strict";
/**
 * Knowledge Graph MCP Service Advanced Usage Example - 知识图谱MCP服务高级使用示例
 */
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const knowledge_graph_mcp_service_1 = require("../knowledge-graph-mcp-service");
const types_1 = require("../../../shared/knowledge-graph-services/types");
/**
 * 高级使用示例
 */
async function advancedUsageExample() {
    console.log('=== 知识图谱MCP服务高级使用示例 ===');
    // 初始化服务（启用向量搜索）
    console.log('\n1. 初始化服务（启用向量搜索）');
    await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.initialize({
        knowledgeGraphConfig: {
            type: 'MEMORY',
            enableVectorSearch: true,
            vectorDimension: 1536
        }
    });
    console.log('服务初始化完成');
    try {
        // 创建多个节点
        console.log('\n2. 创建多个节点');
        // 创建主题节点
        const createTopicRequest = {
            id: (0, uuid_1.v4)(),
            service: 'KnowledgeGraphService',
            version: '1.0.0',
            action: 'createNode',
            params: {
                input: {
                    type: types_1.NodeType.TOPIC,
                    label: '个人知识管理',
                    properties: {
                        description: '个人知识管理（PKM）是一种管理个人信息的方法',
                        tags: ['PKM', '知识管理']
                    }
                }
            },
            metadata: {
                timestamp: new Date(),
                source: 'advanced-example'
            }
        };
        const createTopicResponse = await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(createTopicRequest);
        const topicId = createTopicResponse.data.node.id;
        // 创建多个概念节点
        const concepts = [
            {
                label: 'PARA方法',
                properties: {
                    description: 'PARA是Projects, Areas, Resources, Archives的缩写，是一种组织信息的方法',
                    tags: ['BASB', '组织方法'],
                    vector: Array(1536).fill(0).map(() => Math.random() - 0.5) // 随机向量
                }
            },
            {
                label: 'CODE方法',
                properties: {
                    description: 'CODE是Capture, Organize, Distill, Express的缩写，是构建第二大脑的四个步骤',
                    tags: ['BASB', '方法论'],
                    vector: Array(1536).fill(0).map(() => Math.random() - 0.5) // 随机向量
                }
            },
            {
                label: '渐进式总结',
                properties: {
                    description: '渐进式总结是一种提炼信息的方法，通过多次总结逐步提取信息的精华',
                    tags: ['BASB', '提炼方法'],
                    vector: Array(1536).fill(0).map(() => Math.random() - 0.5) // 随机向量
                }
            }
        ];
        const conceptIds = [];
        for (const concept of concepts) {
            const createConceptRequest = {
                id: (0, uuid_1.v4)(),
                service: 'KnowledgeGraphService',
                version: '1.0.0',
                action: 'createNode',
                params: {
                    input: {
                        type: types_1.NodeType.CONCEPT,
                        label: concept.label,
                        properties: concept.properties
                    }
                },
                metadata: {
                    timestamp: new Date(),
                    source: 'advanced-example'
                }
            };
            const response = await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(createConceptRequest);
            conceptIds.push(response.data.node.id);
        }
        console.log(`创建了1个主题节点和${conceptIds.length}个概念节点`);
        // 创建关系
        console.log('\n3. 创建关系');
        for (const conceptId of conceptIds) {
            const createRelationshipRequest = {
                id: (0, uuid_1.v4)(),
                service: 'KnowledgeGraphService',
                version: '1.0.0',
                action: 'createRelationship',
                params: {
                    input: {
                        type: types_1.RelationshipType.BELONGS_TO,
                        sourceNodeId: conceptId,
                        targetNodeId: topicId,
                        properties: {
                            confidence: 0.9,
                            created: new Date().toISOString()
                        }
                    }
                },
                metadata: {
                    timestamp: new Date(),
                    source: 'advanced-example'
                }
            };
            await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(createRelationshipRequest);
        }
        // 创建概念之间的关系
        const createConceptRelationshipRequest = {
            id: (0, uuid_1.v4)(),
            service: 'KnowledgeGraphService',
            version: '1.0.0',
            action: 'createRelationship',
            params: {
                input: {
                    type: types_1.RelationshipType.RELATED_TO,
                    sourceNodeId: conceptIds[0], // PARA方法
                    targetNodeId: conceptIds[1], // CODE方法
                    properties: {
                        strength: 0.8,
                        description: 'PARA和CODE是BASB方法论中的两个核心概念'
                    }
                }
            },
            metadata: {
                timestamp: new Date(),
                source: 'advanced-example'
            }
        };
        await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(createConceptRelationshipRequest);
        const createConceptRelationship2Request = {
            id: (0, uuid_1.v4)(),
            service: 'KnowledgeGraphService',
            version: '1.0.0',
            action: 'createRelationship',
            params: {
                input: {
                    type: types_1.RelationshipType.PART_OF,
                    sourceNodeId: conceptIds[2], // 渐进式总结
                    targetNodeId: conceptIds[1], // CODE方法
                    properties: {
                        description: '渐进式总结是CODE方法中Distill步骤的一部分'
                    }
                }
            },
            metadata: {
                timestamp: new Date(),
                source: 'advanced-example'
            }
        };
        await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(createConceptRelationship2Request);
        console.log('创建了多个关系');
        // 向量搜索
        console.log('\n4. 向量搜索');
        // 创建一个查询向量（这里使用随机向量作为示例）
        const queryVector = Array(1536).fill(0).map(() => Math.random() - 0.5);
        const vectorSearchRequest = {
            id: (0, uuid_1.v4)(),
            service: 'KnowledgeGraphService',
            version: '1.0.0',
            action: 'vectorSearch',
            params: {
                options: {
                    vector: queryVector,
                    limit: 2,
                    types: [types_1.NodeType.CONCEPT]
                }
            },
            metadata: {
                timestamp: new Date(),
                source: 'advanced-example'
            }
        };
        const vectorSearchResponse = await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(vectorSearchRequest);
        console.log('向量搜索响应:', JSON.stringify(vectorSearchResponse.data, null, 2));
        // 路径查找
        console.log('\n5. 路径查找');
        // 查找最短路径
        const findShortestPathRequest = {
            id: (0, uuid_1.v4)(),
            service: 'KnowledgeGraphService',
            version: '1.0.0',
            action: 'findShortestPath',
            params: {
                startNodeId: conceptIds[2], // 渐进式总结
                endNodeId: conceptIds[0], // PARA方法
                maxDepth: 3
            },
            metadata: {
                timestamp: new Date(),
                source: 'advanced-example'
            }
        };
        const findShortestPathResponse = await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(findShortestPathRequest);
        console.log('最短路径响应:', JSON.stringify(findShortestPathResponse.data, null, 2));
        // 查找所有路径
        const findAllPathsRequest = {
            id: (0, uuid_1.v4)(),
            service: 'KnowledgeGraphService',
            version: '1.0.0',
            action: 'findAllPaths',
            params: {
                startNodeId: conceptIds[2], // 渐进式总结
                endNodeId: topicId, // 个人知识管理
                maxDepth: 3
            },
            metadata: {
                timestamp: new Date(),
                source: 'advanced-example'
            }
        };
        const findAllPathsResponse = await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(findAllPathsRequest);
        console.log('所有路径响应:', JSON.stringify(findAllPathsResponse.data, null, 2));
        // 图遍历
        console.log('\n6. 图遍历');
        const traverseGraphRequest = {
            id: (0, uuid_1.v4)(),
            service: 'KnowledgeGraphService',
            version: '1.0.0',
            action: 'traverseGraph',
            params: {
                options: {
                    startNodeId: topicId,
                    direction: 'INCOMING',
                    maxDepth: 2,
                    includeNodes: true,
                    includeRelationships: true
                }
            },
            metadata: {
                timestamp: new Date(),
                source: 'advanced-example'
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
                source: 'advanced-example'
            }
        };
        const getGraphStatsResponse = await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(getGraphStatsRequest);
        console.log('图统计信息响应:', JSON.stringify(getGraphStatsResponse.data, null, 2));
        // 清理数据
        console.log('\n8. 清理数据');
        // 删除所有创建的节点和关系
        // 注意：删除节点会自动删除与之相关的关系
        // 删除概念节点
        for (const conceptId of conceptIds) {
            const deleteNodeRequest = {
                id: (0, uuid_1.v4)(),
                service: 'KnowledgeGraphService',
                version: '1.0.0',
                action: 'deleteNode',
                params: {
                    id: conceptId
                },
                metadata: {
                    timestamp: new Date(),
                    source: 'advanced-example'
                }
            };
            await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(deleteNodeRequest);
        }
        // 删除主题节点
        const deleteTopicRequest = {
            id: (0, uuid_1.v4)(),
            service: 'KnowledgeGraphService',
            version: '1.0.0',
            action: 'deleteNode',
            params: {
                id: topicId
            },
            metadata: {
                timestamp: new Date(),
                source: 'advanced-example'
            }
        };
        await knowledge_graph_mcp_service_1.globalKnowledgeGraphMCPService.handleRequest(deleteTopicRequest);
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
advancedUsageExample().catch(error => {
    console.error('示例出错:', error);
});
//# sourceMappingURL=advanced-usage.js.map