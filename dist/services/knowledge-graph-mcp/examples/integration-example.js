"use strict";
/**
 * Knowledge Graph MCP Service Integration Example - 知识图谱MCP服务集成示例
 *
 * 展示如何将知识图谱MCP服务与其他MCP服务集成
 */
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const request_handler_1 = require("../../../shared/mcp-core/request-handler");
const service_factory_1 = require("../../../shared/mcp-core/service-factory");
const types_1 = require("../../../shared/mcp-core/types");
const types_2 = require("../../../shared/knowledge-graph-services/types");
const register_1 = require("../register");
/**
 * 集成示例
 */
async function integrationExample() {
    console.log('=== 知识图谱MCP服务集成示例 ===');
    // 注册知识图谱MCP服务
    console.log('\n1. 注册知识图谱MCP服务');
    (0, register_1.registerKnowledgeGraphMCPService)();
    // 创建并初始化服务
    console.log('\n2. 创建并初始化服务');
    const knowledgeGraphService = await service_factory_1.globalServiceFactory.createAndInitializeService('KnowledgeGraphService');
    console.log('服务创建并初始化完成');
    try {
        // 通过全局请求处理器发送请求
        console.log('\n3. 通过全局请求处理器创建节点');
        // 创建笔记节点
        const createNoteRequest = {
            requestId: (0, uuid_1.v4)(),
            protocolVersion: types_1.MCP_PROTOCOL_VERSION,
            service: 'KnowledgeGraphService',
            serviceVersion: '1.0.0',
            method: 'createNode',
            params: {
                input: {
                    type: types_2.NodeType.NOTE,
                    label: '集成示例笔记',
                    properties: {
                        content: '这是一个通过全局请求处理器创建的笔记节点',
                        tags: ['集成', '示例'],
                        created: new Date().toISOString()
                    }
                }
            }
        };
        const createNoteResponse = await request_handler_1.globalRequestHandler.handleRequest(createNoteRequest);
        console.log('创建笔记节点响应:', JSON.stringify(createNoteResponse.data, null, 2));
        const noteId = createNoteResponse.data.node.id;
        // 创建概念节点
        const createConceptRequest = {
            requestId: (0, uuid_1.v4)(),
            protocolVersion: types_1.MCP_PROTOCOL_VERSION,
            service: 'KnowledgeGraphService',
            serviceVersion: '1.0.0',
            method: 'createNode',
            params: {
                input: {
                    type: types_2.NodeType.CONCEPT,
                    label: '集成示例概念',
                    properties: {
                        description: '这是一个通过全局请求处理器创建的概念节点',
                        tags: ['集成', '示例']
                    }
                }
            }
        };
        const createConceptResponse = await request_handler_1.globalRequestHandler.handleRequest(createConceptRequest);
        console.log('创建概念节点响应:', JSON.stringify(createConceptResponse.data, null, 2));
        const conceptId = createConceptResponse.data.node.id;
        // 创建关系
        console.log('\n4. 通过全局请求处理器创建关系');
        const createRelationshipRequest = {
            requestId: (0, uuid_1.v4)(),
            protocolVersion: types_1.MCP_PROTOCOL_VERSION,
            service: 'KnowledgeGraphService',
            serviceVersion: '1.0.0',
            method: 'createRelationship',
            params: {
                input: {
                    type: types_2.RelationshipType.DESCRIBES,
                    sourceNodeId: noteId,
                    targetNodeId: conceptId,
                    properties: {
                        confidence: 0.9,
                        created: new Date().toISOString()
                    }
                }
            }
        };
        const createRelationshipResponse = await request_handler_1.globalRequestHandler.handleRequest(createRelationshipRequest);
        console.log('创建关系响应:', JSON.stringify(createRelationshipResponse.data, null, 2));
        // 查询节点
        console.log('\n5. 通过全局请求处理器查询节点');
        const queryNodesRequest = {
            requestId: (0, uuid_1.v4)(),
            protocolVersion: types_1.MCP_PROTOCOL_VERSION,
            service: 'KnowledgeGraphService',
            serviceVersion: '1.0.0',
            method: 'queryNodes',
            params: {
                options: {
                    properties: {
                        tags: ['集成']
                    },
                    limit: 10
                }
            }
        };
        const queryNodesResponse = await request_handler_1.globalRequestHandler.handleRequest(queryNodesRequest);
        console.log('查询节点响应:', JSON.stringify(queryNodesResponse.data, null, 2));
        // 模拟与其他MCP服务的集成
        console.log('\n6. 模拟与其他MCP服务的集成');
        // 模拟从捕获服务接收内容并存储到知识图谱
        console.log('从捕获服务接收内容并存储到知识图谱');
        // 模拟捕获服务的输出
        const capturedContent = {
            title: '从捕获服务接收的内容',
            content: '这是从捕获服务接收的内容，将被存储到知识图谱中',
            source: 'web',
            timestamp: new Date().toISOString(),
            tags: ['捕获', '集成']
        };
        // 将捕获的内容存储为笔记节点
        const createCapturedNoteRequest = {
            requestId: (0, uuid_1.v4)(),
            protocolVersion: types_1.MCP_PROTOCOL_VERSION,
            service: 'KnowledgeGraphService',
            serviceVersion: '1.0.0',
            method: 'createNode',
            params: {
                input: {
                    type: types_2.NodeType.NOTE,
                    label: capturedContent.title,
                    properties: {
                        content: capturedContent.content,
                        source: capturedContent.source,
                        created: capturedContent.timestamp,
                        tags: capturedContent.tags
                    }
                }
            }
        };
        const createCapturedNoteResponse = await request_handler_1.globalRequestHandler.handleRequest(createCapturedNoteRequest);
        const capturedNoteId = createCapturedNoteResponse.data.node.id;
        // 模拟与AI服务的集成，提取概念并创建关系
        console.log('与AI服务集成，提取概念并创建关系');
        // 模拟AI服务的输出
        const aiExtractedConcepts = [
            {
                label: '捕获',
                description: '捕获是BASB方法中的第一步，指收集有价值的信息',
                confidence: 0.95
            },
            {
                label: '集成',
                description: '集成是指将不同服务或系统连接起来形成一个整体',
                confidence: 0.85
            }
        ];
        // 为每个提取的概念创建节点并与笔记建立关系
        for (const concept of aiExtractedConcepts) {
            // 创建概念节点
            const createExtractedConceptRequest = {
                requestId: (0, uuid_1.v4)(),
                protocolVersion: types_1.MCP_PROTOCOL_VERSION,
                service: 'KnowledgeGraphService',
                serviceVersion: '1.0.0',
                method: 'createNode',
                params: {
                    input: {
                        type: types_2.NodeType.CONCEPT,
                        label: concept.label,
                        properties: {
                            description: concept.description,
                            aiExtracted: true,
                            confidence: concept.confidence
                        }
                    }
                }
            };
            const createExtractedConceptResponse = await request_handler_1.globalRequestHandler.handleRequest(createExtractedConceptRequest);
            const extractedConceptId = createExtractedConceptResponse.data.node.id;
            // 创建关系
            const createExtractedRelationshipRequest = {
                requestId: (0, uuid_1.v4)(),
                protocolVersion: types_1.MCP_PROTOCOL_VERSION,
                service: 'KnowledgeGraphService',
                serviceVersion: '1.0.0',
                method: 'createRelationship',
                params: {
                    input: {
                        type: types_2.RelationshipType.MENTIONS,
                        sourceNodeId: capturedNoteId,
                        targetNodeId: extractedConceptId,
                        properties: {
                            confidence: concept.confidence,
                            aiExtracted: true
                        }
                    }
                }
            };
            await request_handler_1.globalRequestHandler.handleRequest(createExtractedRelationshipRequest);
        }
        // 获取图统计信息
        console.log('\n7. 获取图统计信息');
        const getGraphStatsRequest = {
            requestId: (0, uuid_1.v4)(),
            protocolVersion: types_1.MCP_PROTOCOL_VERSION,
            service: 'KnowledgeGraphService',
            serviceVersion: '1.0.0',
            method: 'getGraphStats',
            params: {}
        };
        const getGraphStatsResponse = await request_handler_1.globalRequestHandler.handleRequest(getGraphStatsRequest);
        console.log('获取图统计信息响应:', JSON.stringify(getGraphStatsResponse.data, null, 2));
        // 清理数据
        console.log('\n8. 清理数据');
        // 查询所有创建的节点
        const queryAllNodesRequest = {
            requestId: (0, uuid_1.v4)(),
            protocolVersion: types_1.MCP_PROTOCOL_VERSION,
            service: 'KnowledgeGraphService',
            serviceVersion: '1.0.0',
            method: 'queryNodes',
            params: {
                options: {
                    properties: {
                        tags: ['集成']
                    },
                    limit: 100
                }
            }
        };
        const queryAllNodesResponse = await request_handler_1.globalRequestHandler.handleRequest(queryAllNodesRequest);
        const allNodes = queryAllNodesResponse.data.nodes;
        // 删除所有节点
        for (const node of allNodes) {
            const deleteNodeRequest = {
                requestId: (0, uuid_1.v4)(),
                protocolVersion: types_1.MCP_PROTOCOL_VERSION,
                service: 'KnowledgeGraphService',
                serviceVersion: '1.0.0',
                method: 'deleteNode',
                params: {
                    id: node.id
                }
            };
            await request_handler_1.globalRequestHandler.handleRequest(deleteNodeRequest);
        }
        // 删除AI提取的概念节点
        const queryAIConceptsRequest = {
            requestId: (0, uuid_1.v4)(),
            protocolVersion: types_1.MCP_PROTOCOL_VERSION,
            service: 'KnowledgeGraphService',
            serviceVersion: '1.0.0',
            method: 'queryNodes',
            params: {
                options: {
                    properties: {
                        aiExtracted: true
                    },
                    limit: 100
                }
            }
        };
        const queryAIConceptsResponse = await request_handler_1.globalRequestHandler.handleRequest(queryAIConceptsRequest);
        const aiConcepts = queryAIConceptsResponse.data.nodes;
        for (const node of aiConcepts) {
            const deleteNodeRequest = {
                requestId: (0, uuid_1.v4)(),
                protocolVersion: types_1.MCP_PROTOCOL_VERSION,
                service: 'KnowledgeGraphService',
                serviceVersion: '1.0.0',
                method: 'deleteNode',
                params: {
                    id: node.id
                }
            };
            await request_handler_1.globalRequestHandler.handleRequest(deleteNodeRequest);
        }
        console.log('数据清理完成');
    }
    catch (error) {
        console.error('示例运行出错:', error);
    }
    finally {
        // 关闭服务
        console.log('\n9. 关闭服务');
        await knowledgeGraphService.shutdown();
        console.log('服务已关闭');
    }
    console.log('\n=== 示例完成 ===');
}
// 运行示例
integrationExample().catch(error => {
    console.error('示例出错:', error);
});
//# sourceMappingURL=integration-example.js.map