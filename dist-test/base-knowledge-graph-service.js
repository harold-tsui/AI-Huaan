"use strict";
/**
 * Base Knowledge Graph Service - 基础知识图谱服务
 *
 * 提供知识图谱服务的基础实现和通用功能
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseKnowledgeGraphService = void 0;
var uuid_1 = require("uuid");
/**
 * 基础知识图谱服务
 *
 * 提供知识图谱服务的基础实现和通用功能
 */
var BaseKnowledgeGraphService = /** @class */ (function () {
    /**
     * 构造函数
     * @param config 配置
     */
    function BaseKnowledgeGraphService(config) {
        if (config === void 0) { config = {}; }
        this.initialized = false;
        this.config = __assign({ serviceName: 'BaseKnowledgeGraphService', enableVectorSearch: true, vectorDimension: 1536, logLevel: 'info' }, config);
    }
    /**
     * 获取服务配置
     */
    BaseKnowledgeGraphService.prototype.getConfig = function () {
        return this.config;
    };
    /**
     * 初始化知识图谱服务
     */
    BaseKnowledgeGraphService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.initialized) {
                            return [2 /*return*/, true];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.initializeImplementation()];
                    case 2:
                        _a.sent();
                        this.initialized = true;
                        return [2 /*return*/, true];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Failed to initialize ".concat(this.config.serviceName, ":"), error_1);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 关闭知识图谱服务
     */
    /**
     * 检查服务是否已初始化
     */
    BaseKnowledgeGraphService.prototype.isInitialized = function () {
        return this.initialized;
    };
    /**
     * 关闭知识图谱服务
     */
    BaseKnowledgeGraphService.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.initialized) {
                            return [2 /*return*/, true];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.shutdownImplementation()];
                    case 2:
                        _a.sent();
                        this.initialized = false;
                        return [2 /*return*/, true];
                    case 3:
                        error_2 = _a.sent();
                        console.error("Failed to shutdown ".concat(this.config.serviceName, ":"), error_2);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建节点
     * @param input 创建节点输入
     */
    BaseKnowledgeGraphService.prototype.createNode = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var now, node;
            return __generator(this, function (_a) {
                this.ensureInitialized();
                now = new Date();
                node = {
                    id: (0, uuid_1.v4)(),
                    type: input.type,
                    label: input.label,
                    properties: input.properties || {},
                    createdAt: now,
                    updatedAt: now,
                    vector: input.vector
                };
                return [2 /*return*/, this.createNodeImplementation(node)];
            });
        });
    };
    /**
     * 批量创建节点
     * @param inputs 创建节点输入数组
     */
    BaseKnowledgeGraphService.prototype.createNodes = function (inputs) {
        return __awaiter(this, void 0, void 0, function () {
            var now, nodes;
            return __generator(this, function (_a) {
                this.ensureInitialized();
                now = new Date();
                nodes = inputs.map(function (input) { return ({
                    id: (0, uuid_1.v4)(),
                    type: input.type,
                    label: input.label,
                    properties: input.properties || {},
                    createdAt: now,
                    updatedAt: now,
                    vector: input.vector
                }); });
                return [2 /*return*/, this.createNodesImplementation(nodes)];
            });
        });
    };
    /**
     * 获取节点
     * @param id 节点ID
     */
    BaseKnowledgeGraphService.prototype.getNode = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ensureInitialized();
                return [2 /*return*/, this.getNodeImplementation(id)];
            });
        });
    };
    /**
     * 更新节点
     * @param id 节点ID
     * @param input 更新节点输入
     */
    BaseKnowledgeGraphService.prototype.updateNode = function (id, input) {
        return __awaiter(this, void 0, void 0, function () {
            var node, updatedNode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        return [4 /*yield*/, this.getNode(id)];
                    case 1:
                        node = _a.sent();
                        if (!node) {
                            return [2 /*return*/, null];
                        }
                        updatedNode = __assign(__assign({}, node), { label: input.label !== undefined ? input.label : node.label, properties: input.properties !== undefined ? __assign(__assign({}, node.properties), input.properties) : node.properties, vector: input.vector !== undefined ? input.vector : node.vector, updatedAt: new Date() });
                        return [2 /*return*/, this.updateNodeImplementation(id, updatedNode)];
                }
            });
        });
    };
    /**
     * 删除节点
     * @param id 节点ID
     */
    BaseKnowledgeGraphService.prototype.deleteNode = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ensureInitialized();
                return [2 /*return*/, this.deleteNodeImplementation(id)];
            });
        });
    };
    /**
     * 查询节点
     * @param options 节点查询选项
     */
    BaseKnowledgeGraphService.prototype.queryNodes = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ensureInitialized();
                return [2 /*return*/, this.queryNodesImplementation(options)];
            });
        });
    };
    /**
     * 创建关系
     * @param input 创建关系输入
     */
    BaseKnowledgeGraphService.prototype.createRelationship = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var sourceNode, targetNode, now, relationship;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        return [4 /*yield*/, this.getNode(input.sourceNodeId)];
                    case 1:
                        sourceNode = _a.sent();
                        return [4 /*yield*/, this.getNode(input.targetNodeId)];
                    case 2:
                        targetNode = _a.sent();
                        if (!sourceNode) {
                            throw new Error("Source node with ID ".concat(input.sourceNodeId, " does not exist"));
                        }
                        if (!targetNode) {
                            throw new Error("Target node with ID ".concat(input.targetNodeId, " does not exist"));
                        }
                        now = new Date();
                        relationship = {
                            id: (0, uuid_1.v4)(),
                            type: input.type,
                            label: input.label,
                            properties: input.properties || {},
                            sourceNodeId: input.sourceNodeId,
                            targetNodeId: input.targetNodeId,
                            createdAt: now,
                            updatedAt: now
                        };
                        return [2 /*return*/, this.createRelationshipImplementation(relationship)];
                }
            });
        });
    };
    /**
     * 批量创建关系
     * @param inputs 创建关系输入数组
     */
    BaseKnowledgeGraphService.prototype.createRelationships = function (inputs) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeIds, nodeIdArray, existingNodes, existingNodeIds, validInputs, now, relationships;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        nodeIds = new Set();
                        inputs.forEach(function (input) {
                            nodeIds.add(input.sourceNodeId);
                            nodeIds.add(input.targetNodeId);
                        });
                        nodeIdArray = Array.from(nodeIds);
                        return [4 /*yield*/, Promise.all(nodeIdArray.map(function (id) { return _this.getNode(id); }))];
                    case 1:
                        existingNodes = _a.sent();
                        existingNodeIds = new Set();
                        existingNodes.forEach(function (node) {
                            if (node) {
                                existingNodeIds.add(node.id);
                            }
                        });
                        validInputs = inputs.filter(function (input) {
                            return existingNodeIds.has(input.sourceNodeId) && existingNodeIds.has(input.targetNodeId);
                        });
                        if (validInputs.length !== inputs.length) {
                            console.warn("Filtered out ".concat(inputs.length - validInputs.length, " relationships with non-existent nodes"));
                        }
                        now = new Date();
                        relationships = validInputs.map(function (input) { return ({
                            id: (0, uuid_1.v4)(),
                            type: input.type,
                            label: input.label,
                            properties: input.properties || {},
                            sourceNodeId: input.sourceNodeId,
                            targetNodeId: input.targetNodeId,
                            createdAt: now,
                            updatedAt: now
                        }); });
                        return [2 /*return*/, this.createRelationshipsImplementation(relationships)];
                }
            });
        });
    };
    /**
     * 获取关系
     * @param id 关系ID
     */
    BaseKnowledgeGraphService.prototype.getRelationship = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ensureInitialized();
                return [2 /*return*/, this.getRelationshipImplementation(id)];
            });
        });
    };
    /**
     * 更新关系
     * @param id 关系ID
     * @param input 更新关系输入
     */
    BaseKnowledgeGraphService.prototype.updateRelationship = function (id, input) {
        return __awaiter(this, void 0, void 0, function () {
            var relationship, updatedRelationship;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        return [4 /*yield*/, this.getRelationship(id)];
                    case 1:
                        relationship = _a.sent();
                        if (!relationship) {
                            return [2 /*return*/, null];
                        }
                        updatedRelationship = __assign(__assign({}, relationship), { label: input.label !== undefined ? input.label : relationship.label, properties: input.properties !== undefined ? __assign(__assign({}, relationship.properties), input.properties) : relationship.properties, updatedAt: new Date() });
                        return [2 /*return*/, this.updateRelationshipImplementation(id, updatedRelationship)];
                }
            });
        });
    };
    /**
     * 删除关系
     * @param id 关系ID
     */
    BaseKnowledgeGraphService.prototype.deleteRelationship = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ensureInitialized();
                return [2 /*return*/, this.deleteRelationshipImplementation(id)];
            });
        });
    };
    /**
     * 查询关系
     * @param options 关系查询选项
     */
    BaseKnowledgeGraphService.prototype.queryRelationships = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ensureInitialized();
                return [2 /*return*/, this.queryRelationshipsImplementation(options)];
            });
        });
    };
    /**
     * 获取节点的出向关系
     * @param nodeId 节点ID
     * @param types 关系类型过滤（可选）
     */
    BaseKnowledgeGraphService.prototype.getOutgoingRelationships = function (nodeId, types) {
        return __awaiter(this, void 0, void 0, function () {
            var options;
            return __generator(this, function (_a) {
                this.ensureInitialized();
                options = {
                    sourceNodeIds: [nodeId]
                };
                if (types && types.length > 0) {
                    options.types = types;
                }
                return [2 /*return*/, this.queryRelationships(options)];
            });
        });
    };
    /**
     * 获取节点的入向关系
     * @param nodeId 节点ID
     * @param types 关系类型过滤（可选）
     */
    BaseKnowledgeGraphService.prototype.getIncomingRelationships = function (nodeId, types) {
        return __awaiter(this, void 0, void 0, function () {
            var options;
            return __generator(this, function (_a) {
                this.ensureInitialized();
                options = {
                    targetNodeIds: [nodeId]
                };
                if (types && types.length > 0) {
                    options.types = types;
                }
                return [2 /*return*/, this.queryRelationships(options)];
            });
        });
    };
    /**
     * 获取节点的所有关系
     * @param nodeId 节点ID
     * @param types 关系类型过滤（可选）
     */
    BaseKnowledgeGraphService.prototype.getAllRelationships = function (nodeId, types) {
        return __awaiter(this, void 0, void 0, function () {
            var outgoing, incoming;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        return [4 /*yield*/, this.getOutgoingRelationships(nodeId, types)];
                    case 1:
                        outgoing = _a.sent();
                        return [4 /*yield*/, this.getIncomingRelationships(nodeId, types)];
                    case 2:
                        incoming = _a.sent();
                        return [2 /*return*/, __spreadArray(__spreadArray([], __read(outgoing), false), __read(incoming), false)];
                }
            });
        });
    };
    /**
     * 获取与节点相关的节点
     * @param nodeId 节点ID
     * @param relationshipTypes 关系类型过滤（可选）
     * @param nodeTypes 节点类型过滤（可选）
     * @param direction 关系方向（可选）
     */
    BaseKnowledgeGraphService.prototype.getRelatedNodes = function (nodeId_1, relationshipTypes_1, nodeTypes_1) {
        return __awaiter(this, arguments, void 0, function (nodeId, relationshipTypes, nodeTypes, direction) {
            var relationships, outgoing, incoming, relatedNodeIds, relatedNodes, filteredNodes;
            var _this = this;
            if (direction === void 0) { direction = 'BOTH'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        relationships = [];
                        if (!(direction === 'OUTGOING' || direction === 'BOTH')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getOutgoingRelationships(nodeId, relationshipTypes)];
                    case 1:
                        outgoing = _a.sent();
                        relationships = relationships.concat(outgoing);
                        _a.label = 2;
                    case 2:
                        if (!(direction === 'INCOMING' || direction === 'BOTH')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getIncomingRelationships(nodeId, relationshipTypes)];
                    case 3:
                        incoming = _a.sent();
                        relationships = relationships.concat(incoming);
                        _a.label = 4;
                    case 4:
                        if (relationships.length === 0) {
                            return [2 /*return*/, []];
                        }
                        relatedNodeIds = new Set();
                        relationships.forEach(function (rel) {
                            if (rel.sourceNodeId === nodeId) {
                                relatedNodeIds.add(rel.targetNodeId);
                            }
                            else if (rel.targetNodeId === nodeId) {
                                relatedNodeIds.add(rel.sourceNodeId);
                            }
                        });
                        return [4 /*yield*/, Promise.all(Array.from(relatedNodeIds).map(function (id) { return _this.getNode(id); }))];
                    case 5:
                        relatedNodes = _a.sent();
                        filteredNodes = relatedNodes.filter(function (node) { return node !== null; });
                        if (nodeTypes && nodeTypes.length > 0) {
                            filteredNodes = filteredNodes.filter(function (node) { return nodeTypes.includes(node.type); });
                        }
                        return [2 /*return*/, filteredNodes];
                }
            });
        });
    };
    /**
     * 向量搜索
     * @param options 向量搜索选项
     */
    BaseKnowledgeGraphService.prototype.vectorSearch = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ensureInitialized();
                if (!this.config.enableVectorSearch) {
                    throw new Error('Vector search is not enabled for this service');
                }
                return [2 /*return*/, this.vectorSearchImplementation(options)];
            });
        });
    };
    /**
     * 图遍历
     * @param options 图遍历选项
     */
    BaseKnowledgeGraphService.prototype.traverseGraph = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ensureInitialized();
                return [2 /*return*/, this.traverseGraphImplementation(options)];
            });
        });
    };
    /**
     * 查找两个节点之间的最短路径
     * @param startNodeId 起始节点ID
     * @param endNodeId 结束节点ID
     * @param relationshipTypes 关系类型过滤（可选）
     * @param maxDepth 最大深度（可选）
     */
    BaseKnowledgeGraphService.prototype.findShortestPath = function (startNodeId_1, endNodeId_1, relationshipTypes_1) {
        return __awaiter(this, arguments, void 0, function (startNodeId, endNodeId, relationshipTypes, maxDepth) {
            if (maxDepth === void 0) { maxDepth = 5; }
            return __generator(this, function (_a) {
                this.ensureInitialized();
                return [2 /*return*/, this.findShortestPathImplementation(startNodeId, endNodeId, relationshipTypes, maxDepth)];
            });
        });
    };
    /**
     * 查找所有路径
     * @param startNodeId 起始节点ID
     * @param endNodeId 结束节点ID
     * @param relationshipTypes 关系类型过滤（可选）
     * @param maxDepth 最大深度（可选）
     */
    BaseKnowledgeGraphService.prototype.findAllPaths = function (startNodeId_1, endNodeId_1, relationshipTypes_1) {
        return __awaiter(this, arguments, void 0, function (startNodeId, endNodeId, relationshipTypes, maxDepth) {
            if (maxDepth === void 0) { maxDepth = 3; }
            return __generator(this, function (_a) {
                this.ensureInitialized();
                return [2 /*return*/, this.findAllPathsImplementation(startNodeId, endNodeId, relationshipTypes, maxDepth)];
            });
        });
    };
    /**
     * 获取知识图谱统计信息
     */
    BaseKnowledgeGraphService.prototype.getGraphStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ensureInitialized();
                return [2 /*return*/, this.getGraphStatsImplementation()];
            });
        });
    };
    /**
     * 清空知识图谱
     * @param confirm 确认清空
     */
    BaseKnowledgeGraphService.prototype.clearGraph = function (confirm) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ensureInitialized();
                if (!confirm) {
                    throw new Error('Confirmation is required to clear the graph');
                }
                return [2 /*return*/, this.clearGraphImplementation()];
            });
        });
    };
    /**
     * 导出知识图谱
     * @param format 导出格式
     * @param path 导出路径
     */
    BaseKnowledgeGraphService.prototype.exportGraph = function (format, path) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ensureInitialized();
                return [2 /*return*/, this.exportGraphImplementation(format, path)];
            });
        });
    };
    /**
     * 导入知识图谱
     * @param format 导入格式
     * @param path 导入路径
     * @param mergeStrategy 合并策略
     */
    BaseKnowledgeGraphService.prototype.importGraph = function (format, path, mergeStrategy) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ensureInitialized();
                return [2 /*return*/, this.importGraphImplementation(format, path, mergeStrategy)];
            });
        });
    };
    /**
     * 确保服务已初始化
     */
    BaseKnowledgeGraphService.prototype.ensureInitialized = function () {
        if (!this.initialized) {
            throw new Error("".concat(this.config.serviceName, " is not initialized. Call initialize() first."));
        }
    };
    return BaseKnowledgeGraphService;
}());
exports.BaseKnowledgeGraphService = BaseKnowledgeGraphService;
