"use strict";
/**
 * Neo4j Knowledge Graph Service - Neo4j知识图谱服务
 *
 * 基于Neo4j图数据库的知识图谱服务实现，适用于生产环境
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalNeo4jKnowledgeGraphService = exports.Neo4jKnowledgeGraphService = void 0;
var types_1 = require("./types");
var base_knowledge_graph_service_1 = require("./base-knowledge-graph-service");
var neo4j_driver_1 = require("neo4j-driver");
/**
 * Neo4j知识图谱服务
 *
 * 基于Neo4j图数据库的知识图谱服务实现，适用于生产环境
 */
var Neo4jKnowledgeGraphService = /** @class */ (function (_super) {
    __extends(Neo4jKnowledgeGraphService, _super);
    //protected initialized: boolean = false;
    /**
     * 构造函数
     * @param config Neo4j配置
     */
    function Neo4jKnowledgeGraphService(config) {
        var _this = this;
        if (!config) {
            throw new Error('Neo4jKnowledgeGraphServiceConfig is required');
        }
        _this = _super.call(this, {
            serviceName: 'Neo4jKnowledgeGraphService',
            enableVectorSearch: config.enableVectorSearch !== undefined ? config.enableVectorSearch : true,
            vectorDimension: config.vectorDimension || 1536,
            logLevel: config.logLevel || 'info'
        }) || this;
        _this.driver = null;
        _this.neo4jConfig = config;
        _this.database = config.database || 'neo4j';
        return _this;
    }
    /**
     * 初始化实现
     */
    Neo4jKnowledgeGraphService.prototype.initializeImplementation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // 创建Neo4j驱动
                        if (!this.neo4jConfig.uri || !this.neo4jConfig.username || !this.neo4jConfig.password) {
                            throw new Error('Neo4j configuration is incomplete: uri, username, and password are required');
                        }
                        this.driver = neo4j_driver_1.default.driver(this.neo4jConfig.uri, neo4j_driver_1.default.auth.basic(this.neo4jConfig.username, this.neo4jConfig.password), {
                            maxConnectionPoolSize: this.neo4jConfig.maxConnectionPoolSize,
                            connectionAcquisitionTimeout: this.neo4jConfig.connectionAcquisitionTimeout,
                            connectionTimeout: this.neo4jConfig.connectionTimeout,
                            maxTransactionRetryTime: this.neo4jConfig.maxTransactionRetryTime,
                        });
                        // 验证连接
                        return [4 /*yield*/, this.driver.verifyConnectivity()];
                    case 1:
                        // 验证连接
                        _a.sent();
                        // 创建约束和索引
                        return [4 /*yield*/, this.setupConstraintsAndIndexes()];
                    case 2:
                        // 创建约束和索引
                        _a.sent();
                        this.initialized = true;
                        console.info("Connected to Neo4j database at ".concat(this.neo4jConfig.uri));
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Failed to initialize Neo4j knowledge graph service:', error_1 instanceof Error ? error_1 : String(error_1));
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 关闭实现
     */
    Neo4jKnowledgeGraphService.prototype.shutdownImplementation = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.driver) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.driver.close()];
                    case 1:
                        _a.sent();
                        this.driver = null;
                        this.initialized = false;
                        console.info('Neo4j knowledge graph service shut down');
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建节点实现
     */
    Neo4jKnowledgeGraphService.prototype.createNodeImplementation = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            var session, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        session = this.getSession();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 5]);
                        return [4 /*yield*/, session.executeWrite(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var properties, query, params, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            properties = __assign({}, node.properties);
                                            if (node.vector) {
                                                properties.vector = node.vector;
                                            }
                                            query = "\n          CREATE (n:".concat(node.type, " {id: $id, label: $label, properties: $properties, createdAt: datetime(), updatedAt: datetime()})\n          RETURN n\n        ");
                                            params = {
                                                id: node.id,
                                                label: node.label,
                                                properties: properties
                                            };
                                            return [4 /*yield*/, tx.run(query, params)];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result.records[0].get('n')];
                                    }
                                });
                            }); })];
                    case 2:
                        result = _a.sent();
                        // 转换Neo4j节点为应用节点
                        return [2 /*return*/, this.convertNeo4jNodeToNode(result)];
                    case 3: return [4 /*yield*/, session.close()];
                    case 4:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量创建节点实现
     */
    Neo4jKnowledgeGraphService.prototype.createNodesImplementation = function (nodes) {
        return __awaiter(this, void 0, void 0, function () {
            var session, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (nodes.length === 0) {
                            return [2 /*return*/, []];
                        }
                        this.ensureInitialized();
                        session = this.getSession();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 5]);
                        return [4 /*yield*/, session.executeWrite(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var nodeParams, query, result, resultMap;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            nodeParams = nodes.map(function (node, index) {
                                                // 准备属性，包括向量
                                                var properties = __assign({}, node.properties);
                                                if (node.vector) {
                                                    properties.vector = node.vector;
                                                }
                                                return {
                                                    id: node.id,
                                                    type: node.type,
                                                    label: node.label,
                                                    properties: properties,
                                                    index: index
                                                };
                                            });
                                            query = "\n          UNWIND $nodes AS node\n          CREATE (n:".concat(nodeParams[0].type, " {id: node.id, label: node.label, properties: node.properties, createdAt: datetime(), updatedAt: datetime()})\n          RETURN n, node.index AS index\n        ");
                                            return [4 /*yield*/, tx.run(query, { nodes: nodeParams })];
                                        case 1:
                                            result = _a.sent();
                                            resultMap = new Map();
                                            result.records.forEach(function (record) {
                                                var index = record.get('index');
                                                resultMap.set(index, record);
                                            });
                                            return [2 /*return*/, Array.from({ length: nodes.length }, function (_, i) { return resultMap.get(i).get('n'); })];
                                    }
                                });
                            }); })];
                    case 2:
                        result = _a.sent();
                        // 转换Neo4j节点为应用节点
                        return [2 /*return*/, result.map(this.convertNeo4jNodeToNode.bind(this))];
                    case 3: return [4 /*yield*/, session.close()];
                    case 4:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取节点实现
     */
    Neo4jKnowledgeGraphService.prototype.getNodeImplementation = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var session, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        session = this.getSession();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 5]);
                        return [4 /*yield*/, session.executeRead(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var query, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            query = "\n          MATCH (n {id: $id})\n          RETURN n\n        ";
                                            return [4 /*yield*/, tx.run(query, { id: id })];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result.records.length > 0 ? result.records[0].get('n') : null];
                                    }
                                });
                            }); })];
                    case 2:
                        result = _a.sent();
                        if (!result) {
                            return [2 /*return*/, null];
                        }
                        // 转换Neo4j节点为应用节点
                        return [2 /*return*/, this.convertNeo4jNodeToNode(result)];
                    case 3: return [4 /*yield*/, session.close()];
                    case 4:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新节点实现
     */
    Neo4jKnowledgeGraphService.prototype.updateNodeImplementation = function (id, node) {
        return __awaiter(this, void 0, void 0, function () {
            var session, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        session = this.getSession();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 5]);
                        return [4 /*yield*/, session.executeWrite(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var properties, query, params, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            properties = __assign({}, node.properties);
                                            if (node.vector) {
                                                properties.vector = node.vector;
                                            }
                                            query = "\n          MATCH (n {id: $id})\n          SET n.label = $label,\n              n.properties = $properties,\n              n.updatedAt = datetime()\n          RETURN n\n        ";
                                            params = {
                                                id: id,
                                                label: node.label,
                                                properties: properties
                                            };
                                            return [4 /*yield*/, tx.run(query, params)];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result.records.length > 0 ? result.records[0].get('n') : null];
                                    }
                                });
                            }); })];
                    case 2:
                        result = _a.sent();
                        if (!result) {
                            return [2 /*return*/, null];
                        }
                        // 转换Neo4j节点为应用节点
                        return [2 /*return*/, this.convertNeo4jNodeToNode(result)];
                    case 3: return [4 /*yield*/, session.close()];
                    case 4:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除节点实现
     */
    Neo4jKnowledgeGraphService.prototype.deleteNodeImplementation = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var session, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        session = this.getSession();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 5]);
                        return [4 /*yield*/, session.executeWrite(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var query, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            query = "\n          MATCH (n {id: $id})\n          DETACH DELETE n\n          RETURN count(n) AS count\n        ";
                                            return [4 /*yield*/, tx.run(query, { id: id })];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result.records[0].get('count').toNumber() > 0];
                                    }
                                });
                            }); })];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 3: return [4 /*yield*/, session.close()];
                    case 4:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 查询节点实现
     */
    Neo4jKnowledgeGraphService.prototype.queryNodesImplementation = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var session, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        session = this.getSession();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 5]);
                        return [4 /*yield*/, session.executeRead(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var conditions, params, whereClause, orderByClause, direction, skipClause, limitClause, query, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            conditions = [];
                                            params = {};
                                            // 按类型过滤
                                            if (options.types && options.types.length > 0) {
                                                conditions.push("n:".concat(options.types.join(' OR n:'))); // 使用标签过滤
                                            }
                                            // 按标签过滤
                                            if (options.labels && options.labels.length > 0) {
                                                conditions.push('n.label IN $labels');
                                                params.labels = options.labels;
                                            }
                                            // 按属性过滤
                                            if (options.properties) {
                                                Object.entries(options.properties).forEach(function (_a, index) {
                                                    var _b = __read(_a, 2), key = _b[0], value = _b[1];
                                                    conditions.push("n.properties.".concat(key, " = $prop").concat(index));
                                                    params["prop".concat(index)] = value;
                                                });
                                            }
                                            whereClause = conditions.length > 0 ? "WHERE ".concat(conditions.join(' AND ')) : '';
                                            orderByClause = '';
                                            if (options.orderBy) {
                                                direction = options.orderDirection === 'DESC' ? 'DESC' : 'ASC';
                                                // 特殊字段处理
                                                if (options.orderBy === 'createdAt' || options.orderBy === 'updatedAt') {
                                                    orderByClause = "ORDER BY n.".concat(options.orderBy, " ").concat(direction);
                                                }
                                                else if (options.orderBy === 'id' || options.orderBy === 'type' || options.orderBy === 'label') {
                                                    orderByClause = "ORDER BY n.".concat(options.orderBy, " ").concat(direction);
                                                }
                                                else {
                                                    // 属性字段
                                                    orderByClause = "ORDER BY n.properties.".concat(options.orderBy, " ").concat(direction);
                                                }
                                            }
                                            skipClause = options.offset !== undefined ? "SKIP ".concat(options.offset) : '';
                                            limitClause = options.limit !== undefined ? "LIMIT ".concat(options.limit) : '';
                                            query = "\n          MATCH (n)\n          ".concat(whereClause, "\n          RETURN n\n          ").concat(orderByClause, "\n          ").concat(skipClause, "\n          ").concat(limitClause, "\n        ");
                                            return [4 /*yield*/, tx.run(query, params)];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result.records.map(function (record) { return record.get('n'); })];
                                    }
                                });
                            }); })];
                    case 2:
                        result = _a.sent();
                        // 转换Neo4j节点为应用节点
                        return [2 /*return*/, result.map(this.convertNeo4jNodeToNode.bind(this))];
                    case 3: return [4 /*yield*/, session.close()];
                    case 4:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建关系实现
     */
    Neo4jKnowledgeGraphService.prototype.createRelationshipImplementation = function (relationship) {
        return __awaiter(this, void 0, void 0, function () {
            var session, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        session = this.getSession();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 5]);
                        return [4 /*yield*/, session.executeWrite(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var query, params, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            query = "\n          MATCH (source {id: $sourceNodeId})\n          MATCH (target {id: $targetNodeId})\n          CREATE (source)-[r:".concat(relationship.type, " {id: $id, label: $label, properties: $properties, createdAt: datetime(), updatedAt: datetime()}]->(target)\n          RETURN r, source, target\n        ");
                                            params = {
                                                id: relationship.id,
                                                sourceNodeId: relationship.sourceNodeId,
                                                targetNodeId: relationship.targetNodeId,
                                                label: relationship.label,
                                                properties: relationship.properties
                                            };
                                            return [4 /*yield*/, tx.run(query, params)];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result.records[0]];
                                    }
                                });
                            }); })];
                    case 2:
                        result = _a.sent();
                        // 转换Neo4j关系为应用关系
                        return [2 /*return*/, this.convertNeo4jRelationshipToRelationship(result)];
                    case 3: return [4 /*yield*/, session.close()];
                    case 4:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量创建关系实现
     */
    Neo4jKnowledgeGraphService.prototype.createRelationshipsImplementation = function (relationships) {
        return __awaiter(this, void 0, void 0, function () {
            var session, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (relationships.length === 0) {
                            return [2 /*return*/, []];
                        }
                        this.ensureInitialized();
                        session = this.getSession();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 5]);
                        return [4 /*yield*/, session.executeWrite(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var relParams, query, result, resultMap;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            relParams = relationships.map(function (rel, index) { return ({
                                                id: rel.id,
                                                type: rel.type,
                                                label: rel.label,
                                                sourceNodeId: rel.sourceNodeId,
                                                targetNodeId: rel.targetNodeId,
                                                properties: rel.properties,
                                                index: index
                                            }); });
                                            query = "\n          UNWIND $relationships AS rel\n          MATCH (source {id: rel.sourceNodeId})\n          MATCH (target {id: rel.targetNodeId})\n          CREATE (source)-[r:".concat(relParams[0].type, " {id: rel.id, label: rel.label, properties: rel.properties, createdAt: datetime(), updatedAt: datetime()}]->(target)\n          RETURN r, source, target, rel.index AS index\n        ");
                                            return [4 /*yield*/, tx.run(query, { relationships: relParams })];
                                        case 1:
                                            result = _a.sent();
                                            resultMap = new Map();
                                            result.records.forEach(function (record) {
                                                var index = record.get('index');
                                                resultMap.set(index, record);
                                            });
                                            return [2 /*return*/, Array.from({ length: relationships.length }, function (_, i) { return resultMap.get(i); })];
                                    }
                                });
                            }); })];
                    case 2:
                        result = _a.sent();
                        // 转换Neo4j关系为应用关系
                        return [2 /*return*/, result.map(this.convertNeo4jRelationshipToRelationship.bind(this))];
                    case 3: return [4 /*yield*/, session.close()];
                    case 4:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取关系实现
     */
    Neo4jKnowledgeGraphService.prototype.getRelationshipImplementation = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var session, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        session = this.getSession();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 5]);
                        return [4 /*yield*/, session.executeRead(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var query, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            query = "\n          MATCH (source)-[r {id: $id}]->(target)\n          RETURN r, source, target\n        ";
                                            return [4 /*yield*/, tx.run(query, { id: id })];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result.records.length > 0 ? result.records[0] : null];
                                    }
                                });
                            }); })];
                    case 2:
                        result = _a.sent();
                        if (!result) {
                            return [2 /*return*/, null];
                        }
                        // 转换Neo4j关系为应用关系
                        return [2 /*return*/, this.convertNeo4jRelationshipToRelationship(result)];
                    case 3: return [4 /*yield*/, session.close()];
                    case 4:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新关系实现
     */
    Neo4jKnowledgeGraphService.prototype.updateRelationshipImplementation = function (id, relationship) {
        return __awaiter(this, void 0, void 0, function () {
            var session, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        session = this.getSession();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 5]);
                        return [4 /*yield*/, session.executeWrite(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var query, params, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            query = "\n          MATCH (source)-[r {id: $id}]->(target)\n          SET r.label = $label,\n              r.properties = $properties,\n              r.updatedAt = datetime()\n          RETURN r, source, target\n        ";
                                            params = {
                                                id: id,
                                                label: relationship.label,
                                                properties: relationship.properties
                                            };
                                            return [4 /*yield*/, tx.run(query, params)];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result.records.length > 0 ? result.records[0] : null];
                                    }
                                });
                            }); })];
                    case 2:
                        result = _a.sent();
                        if (!result) {
                            return [2 /*return*/, null];
                        }
                        // 转换Neo4j关系为应用关系
                        return [2 /*return*/, this.convertNeo4jRelationshipToRelationship(result)];
                    case 3: return [4 /*yield*/, session.close()];
                    case 4:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除关系实现
     */
    Neo4jKnowledgeGraphService.prototype.deleteRelationshipImplementation = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var session, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        session = this.getSession();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 5]);
                        return [4 /*yield*/, session.executeWrite(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var query, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            query = "\n          MATCH ()-[r {id: $id}]-()\n          DELETE r\n          RETURN count(r) AS count\n        ";
                                            return [4 /*yield*/, tx.run(query, { id: id })];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result.records[0].get('count').toNumber() > 0];
                                    }
                                });
                            }); })];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 3: return [4 /*yield*/, session.close()];
                    case 4:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 查询关系实现
     */
    Neo4jKnowledgeGraphService.prototype.queryRelationshipsImplementation = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var session, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        session = this.getSession();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 5]);
                        return [4 /*yield*/, session.executeRead(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var conditions, params, whereClause, orderByClause, direction, skipClause, limitClause, query, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            conditions = [];
                                            params = {};
                                            // 按类型过滤
                                            if (options.types && options.types.length > 0) {
                                                conditions.push("type(r) IN $types");
                                                params.types = options.types;
                                            }
                                            // 按标签过滤
                                            if (options.labels && options.labels.length > 0) {
                                                conditions.push('r.label IN $labels');
                                                params.labels = options.labels;
                                            }
                                            // 按源节点ID过滤
                                            if (options.sourceNodeIds && options.sourceNodeIds.length > 0) {
                                                conditions.push('source.id IN $sourceNodeIds');
                                                params.sourceNodeIds = options.sourceNodeIds;
                                            }
                                            // 按目标节点ID过滤
                                            if (options.targetNodeIds && options.targetNodeIds.length > 0) {
                                                conditions.push('target.id IN $targetNodeIds');
                                                params.targetNodeIds = options.targetNodeIds;
                                            }
                                            // 按属性过滤
                                            if (options.properties) {
                                                Object.entries(options.properties).forEach(function (_a, index) {
                                                    var _b = __read(_a, 2), key = _b[0], value = _b[1];
                                                    conditions.push("r.properties.".concat(key, " = $prop").concat(index));
                                                    params["prop".concat(index)] = value;
                                                });
                                            }
                                            whereClause = conditions.length > 0 ? "WHERE ".concat(conditions.join(' AND ')) : '';
                                            orderByClause = '';
                                            if (options.orderBy) {
                                                direction = options.orderDirection === 'DESC' ? 'DESC' : 'ASC';
                                                // 特殊字段处理
                                                if (options.orderBy === 'createdAt' || options.orderBy === 'updatedAt') {
                                                    orderByClause = "ORDER BY r.".concat(options.orderBy, " ").concat(direction);
                                                }
                                                else if (['id', 'type', 'label', 'sourceNodeId', 'targetNodeId'].includes(options.orderBy)) {
                                                    orderByClause = "ORDER BY type(r) ".concat(direction);
                                                }
                                                else if (options.orderBy === 'sourceNodeId') {
                                                    orderByClause = "ORDER BY source.id ".concat(direction);
                                                }
                                                else if (options.orderBy === 'targetNodeId') {
                                                    orderByClause = "ORDER BY target.id ".concat(direction);
                                                }
                                                else {
                                                    orderByClause = "ORDER BY r.".concat(options.orderBy, " ").concat(direction);
                                                }
                                            }
                                            skipClause = options.offset !== undefined ? "SKIP ".concat(options.offset) : '';
                                            limitClause = options.limit !== undefined ? "LIMIT ".concat(options.limit) : '';
                                            query = "\n          MATCH (source)-[r]->(target)\n          ".concat(whereClause, "\n          RETURN r, source, target\n          ").concat(orderByClause, "\n          ").concat(skipClause, "\n          ").concat(limitClause, "\n        ");
                                            return [4 /*yield*/, tx.run(query, params)];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result.records];
                                    }
                                });
                            }); })];
                    case 2:
                        result = _a.sent();
                        // 转换Neo4j关系为应用关系
                        return [2 /*return*/, result.map(this.convertNeo4jRelationshipToRelationship.bind(this))];
                    case 3: return [4 /*yield*/, session.close()];
                    case 4:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 向量搜索实现
     */
    Neo4jKnowledgeGraphService.prototype.vectorSearchImplementation = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var session, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.enableVectorSearch) {
                            throw new Error('Vector search is not enabled for this service');
                        }
                        this.ensureInitialized();
                        session = this.getSession();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 5]);
                        return [4 /*yield*/, session.executeRead(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var nodeTypeFilter, query, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            nodeTypeFilter = '';
                                            if (options.nodeTypes && options.nodeTypes.length > 0) {
                                                nodeTypeFilter = "WHERE n:".concat(options.nodeTypes.join(' OR n:'));
                                            }
                                            query = "\n          MATCH (n)\n          ".concat(nodeTypeFilter, "\n          WHERE n.properties.vector IS NOT NULL\n          WITH n, apoc.algo.cosineSimilarity(n.properties.vector, $vector) AS similarity\n          ").concat(options.minSimilarity !== undefined ? "WHERE similarity >= ".concat(options.minSimilarity) : '', "\n          RETURN n, similarity\n          ORDER BY similarity DESC\n          ").concat(options.limit !== undefined ? "LIMIT ".concat(options.limit) : '', "\n        ");
                                            return [4 /*yield*/, tx.run(query, { vector: options.vector })];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result.records];
                                    }
                                });
                            }); })];
                    case 2:
                        result = _a.sent();
                        // 转换结果
                        return [2 /*return*/, result.map(function (record) { return ({
                                node: _this.convertNeo4jNodeToNode(record.get('n')),
                                similarity: record.get('similarity')
                            }); })];
                    case 3: return [4 /*yield*/, session.close()];
                    case 4:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 图遍历实现
     */
    Neo4jKnowledgeGraphService.prototype.traverseGraphImplementation = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var session, result, nodes, relationships, paths, result_1, result_1_1, record, path, pathSegments, graphPath, startNode, _loop_1, this_1, pathSegments_1, pathSegments_1_1, segment;
            var e_1, _a, e_2, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.ensureInitialized();
                        session = this.getSession();
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, , 3, 5]);
                        return [4 /*yield*/, session.executeRead(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var relTypeFilter, nodeTypeFilter, nodeTypes, directionFilter, query, params, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            relTypeFilter = '';
                                            if (options.relationshipTypes && options.relationshipTypes.length > 0) {
                                                relTypeFilter = "WHERE type(r) IN $relationshipTypes";
                                            }
                                            nodeTypeFilter = '';
                                            if (options.nodeTypes && options.nodeTypes.length > 0) {
                                                nodeTypes = options.nodeTypes.map(function (type) { return ":".concat(type); }).join(' OR ');
                                                nodeTypeFilter = "AND (end".concat(nodeTypes, ")");
                                            }
                                            directionFilter = '';
                                            if (options.direction === 'OUTGOING') {
                                                directionFilter = '-[r]->';
                                            }
                                            else if (options.direction === 'INCOMING') {
                                                directionFilter = '<-[r]-';
                                            }
                                            else {
                                                directionFilter = '-[r]-';
                                            }
                                            query = "\n          MATCH path = (start {id: $startNodeId})".concat(directionFilter, "(end)\n          ").concat(relTypeFilter, "\n          ").concat(nodeTypeFilter, "\n          WHERE length(path) <= $maxDepth\n          RETURN path\n          LIMIT $limit\n        ");
                                            params = {
                                                startNodeId: options.startNodeId,
                                                relationshipTypes: options.relationshipTypes || [],
                                                maxDepth: options.maxDepth !== undefined ? options.maxDepth : 3,
                                                limit: options.limit !== undefined ? options.limit : 100
                                            };
                                            return [4 /*yield*/, tx.run(query, params)];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result.records];
                                    }
                                });
                            }); })];
                    case 2:
                        result = _c.sent();
                        nodes = new Map();
                        relationships = new Map();
                        paths = [];
                        try {
                            // 处理每条路径
                            for (result_1 = __values(result), result_1_1 = result_1.next(); !result_1_1.done; result_1_1 = result_1.next()) {
                                record = result_1_1.value;
                                path = record.get('path');
                                pathSegments = path.segments;
                                graphPath = {
                                    nodes: [],
                                    relationships: [],
                                    length: pathSegments.length
                                };
                                startNode = this.convertNeo4jNodeToNode(path.start);
                                nodes.set(startNode.id, startNode);
                                graphPath.nodes.push(startNode);
                                _loop_1 = function (segment) {
                                    // 添加关系
                                    var relationship = this_1.convertNeo4jRelationshipToRelationship({
                                        get: function (key) {
                                            if (key === 'r')
                                                return segment.relationship;
                                            if (key === 'source')
                                                return segment.start;
                                            if (key === 'target')
                                                return segment.end;
                                            return null;
                                        }
                                    });
                                    relationships.set(relationship.id, relationship);
                                    graphPath.relationships.push(relationship);
                                    // 添加目标节点
                                    var endNode = this_1.convertNeo4jNodeToNode(segment.end);
                                    if (!nodes.has(endNode.id)) {
                                        nodes.set(endNode.id, endNode);
                                    }
                                    graphPath.nodes.push(endNode);
                                };
                                this_1 = this;
                                try {
                                    // 处理路径段
                                    for (pathSegments_1 = (e_2 = void 0, __values(pathSegments)), pathSegments_1_1 = pathSegments_1.next(); !pathSegments_1_1.done; pathSegments_1_1 = pathSegments_1.next()) {
                                        segment = pathSegments_1_1.value;
                                        _loop_1(segment);
                                    }
                                }
                                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                finally {
                                    try {
                                        if (pathSegments_1_1 && !pathSegments_1_1.done && (_b = pathSegments_1.return)) _b.call(pathSegments_1);
                                    }
                                    finally { if (e_2) throw e_2.error; }
                                }
                                paths.push(graphPath);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (result_1_1 && !result_1_1.done && (_a = result_1.return)) _a.call(result_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        return [2 /*return*/, {
                                nodes: Array.from(nodes.values()),
                                relationships: Array.from(relationships.values()),
                                paths: paths
                            }];
                    case 3: return [4 /*yield*/, session.close()];
                    case 4:
                        _c.sent();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 查找最短路径实现
     */
    Neo4jKnowledgeGraphService.prototype.findShortestPathImplementation = function (startNodeId_1, endNodeId_1, relationshipTypes_1) {
        return __awaiter(this, arguments, void 0, function (startNodeId, endNodeId, relationshipTypes, maxDepth) {
            var node, session, result, path, pathSegments, graphPath, startNode, _loop_2, this_2, pathSegments_2, pathSegments_2_1, segment;
            var e_3, _a;
            var _this = this;
            if (maxDepth === void 0) { maxDepth = 5; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.ensureInitialized();
                        if (!(startNodeId === endNodeId)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getNode(startNodeId)];
                    case 1:
                        node = _b.sent();
                        if (!node) {
                            throw new Error("Node with ID ".concat(startNodeId, " does not exist"));
                        }
                        return [2 /*return*/, {
                                nodes: [node],
                                relationships: [],
                                length: 0
                            }];
                    case 2:
                        session = this.getSession();
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, , 5, 7]);
                        return [4 /*yield*/, session.executeRead(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var relTypeFilter, query, params, result_2, error_2, fallbackQuery, result_3;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            relTypeFilter = '';
                                            if (relationshipTypes && relationshipTypes.length > 0) {
                                                relTypeFilter = "WHERE type(r) IN $relationshipTypes";
                                            }
                                            query = "\n          MATCH (start {id: $startNodeId}), (end {id: $endNodeId})\n          CALL apoc.algo.dijkstra(start, end, 'r', 'cost', $maxDepth) YIELD path, weight\n          ".concat(relTypeFilter, "\n          RETURN path\n          LIMIT 1\n        ");
                                            params = {
                                                startNodeId: startNodeId,
                                                endNodeId: endNodeId,
                                                relationshipTypes: relationshipTypes || [],
                                                maxDepth: maxDepth
                                            };
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, , 5]);
                                            return [4 /*yield*/, tx.run(query, params)];
                                        case 2:
                                            result_2 = _a.sent();
                                            return [2 /*return*/, result_2.records.length > 0 ? result_2.records[0] : null];
                                        case 3:
                                            error_2 = _a.sent();
                                            // 如果APOC不可用，回退到标准最短路径
                                            console.warn('APOC not available, falling back to standard shortest path:', error_2);
                                            fallbackQuery = "\n            MATCH (start {id: $startNodeId}), (end {id: $endNodeId})\n            MATCH path = shortestPath((start)-[r*..".concat(maxDepth, "]-(end))\n            ").concat(relTypeFilter, "\n            RETURN path\n            LIMIT 1\n          ");
                                            return [4 /*yield*/, tx.run(fallbackQuery, params)];
                                        case 4:
                                            result_3 = _a.sent();
                                            return [2 /*return*/, result_3.records.length > 0 ? result_3.records[0] : null];
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 4:
                        result = _b.sent();
                        if (!result) {
                            return [2 /*return*/, null];
                        }
                        path = result.get('path');
                        pathSegments = path.segments;
                        graphPath = {
                            nodes: [],
                            relationships: [],
                            length: pathSegments.length
                        };
                        startNode = this.convertNeo4jNodeToNode(path.start);
                        graphPath.nodes.push(startNode);
                        _loop_2 = function (segment) {
                            // 添加关系
                            var relationship = this_2.convertNeo4jRelationshipToRelationship({
                                get: function (key) {
                                    if (key === 'r')
                                        return segment.relationship;
                                    if (key === 'source')
                                        return segment.start;
                                    if (key === 'target')
                                        return segment.end;
                                    return null;
                                }
                            });
                            graphPath.relationships.push(relationship);
                            // 添加目标节点
                            var endNode = this_2.convertNeo4jNodeToNode(segment.end);
                            graphPath.nodes.push(endNode);
                        };
                        this_2 = this;
                        try {
                            // 处理路径段
                            for (pathSegments_2 = __values(pathSegments), pathSegments_2_1 = pathSegments_2.next(); !pathSegments_2_1.done; pathSegments_2_1 = pathSegments_2.next()) {
                                segment = pathSegments_2_1.value;
                                _loop_2(segment);
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (pathSegments_2_1 && !pathSegments_2_1.done && (_a = pathSegments_2.return)) _a.call(pathSegments_2);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                        return [2 /*return*/, graphPath];
                    case 5: return [4 /*yield*/, session.close()];
                    case 6:
                        _b.sent();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 查找所有路径实现
     */
    Neo4jKnowledgeGraphService.prototype.findAllPathsImplementation = function (startNodeId_1, endNodeId_1, relationshipTypes_1) {
        return __awaiter(this, arguments, void 0, function (startNodeId, endNodeId, relationshipTypes, maxDepth) {
            var node, session, result, paths, result_4, result_4_1, record, path, pathSegments, graphPath, startNode, _loop_3, this_3, pathSegments_3, pathSegments_3_1, segment;
            var e_4, _a, e_5, _b;
            var _this = this;
            if (maxDepth === void 0) { maxDepth = 3; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.ensureInitialized();
                        if (!(startNodeId === endNodeId)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getNode(startNodeId)];
                    case 1:
                        node = _c.sent();
                        if (!node) {
                            throw new Error("Node with ID ".concat(startNodeId, " does not exist"));
                        }
                        return [2 /*return*/, [{
                                    nodes: [node],
                                    relationships: [],
                                    length: 0
                                }]];
                    case 2:
                        session = this.getSession();
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, , 5, 7]);
                        return [4 /*yield*/, session.executeRead(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var relTypeFilter, query, params, result;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            relTypeFilter = '';
                                            if (relationshipTypes && relationshipTypes.length > 0) {
                                                relTypeFilter = "WHERE type(r) IN $relationshipTypes";
                                            }
                                            query = "\n          MATCH (start {id: $startNodeId}), (end {id: $endNodeId})\n          MATCH path = (start)-[r*..".concat(maxDepth, "]-(end)\n          ").concat(relTypeFilter, "\n          RETURN path\n          ORDER BY length(path)\n        ");
                                            params = {
                                                startNodeId: startNodeId,
                                                endNodeId: endNodeId,
                                                relationshipTypes: relationshipTypes || []
                                            };
                                            return [4 /*yield*/, tx.run(query, params)];
                                        case 1:
                                            result = _a.sent();
                                            return [2 /*return*/, result.records];
                                    }
                                });
                            }); })];
                    case 4:
                        result = _c.sent();
                        paths = [];
                        try {
                            // 处理每条路径
                            for (result_4 = __values(result), result_4_1 = result_4.next(); !result_4_1.done; result_4_1 = result_4.next()) {
                                record = result_4_1.value;
                                path = record.get('path');
                                pathSegments = path.segments;
                                graphPath = {
                                    nodes: [],
                                    relationships: [],
                                    length: pathSegments.length
                                };
                                startNode = this.convertNeo4jNodeToNode(path.start);
                                graphPath.nodes.push(startNode);
                                _loop_3 = function (segment) {
                                    // 添加关系
                                    var relationship = this_3.convertNeo4jRelationshipToRelationship({
                                        get: function (key) {
                                            if (key === 'r')
                                                return segment.relationship;
                                            if (key === 'source')
                                                return segment.start;
                                            if (key === 'target')
                                                return segment.end;
                                            return null;
                                        }
                                    });
                                    graphPath.relationships.push(relationship);
                                    // 添加目标节点
                                    var endNode = this_3.convertNeo4jNodeToNode(segment.end);
                                    graphPath.nodes.push(endNode);
                                };
                                this_3 = this;
                                try {
                                    // 处理路径段
                                    for (pathSegments_3 = (e_5 = void 0, __values(pathSegments)), pathSegments_3_1 = pathSegments_3.next(); !pathSegments_3_1.done; pathSegments_3_1 = pathSegments_3.next()) {
                                        segment = pathSegments_3_1.value;
                                        _loop_3(segment);
                                    }
                                }
                                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                                finally {
                                    try {
                                        if (pathSegments_3_1 && !pathSegments_3_1.done && (_b = pathSegments_3.return)) _b.call(pathSegments_3);
                                    }
                                    finally { if (e_5) throw e_5.error; }
                                }
                                paths.push(graphPath);
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (result_4_1 && !result_4_1.done && (_a = result_4.return)) _a.call(result_4);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                        return [2 /*return*/, paths];
                    case 5: return [4 /*yield*/, session.close()];
                    case 6:
                        _c.sent();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取图谱统计信息实现
     */
    Neo4jKnowledgeGraphService.prototype.getGraphStatsImplementation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var session, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        session = this.getSession();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 5]);
                        return [4 /*yield*/, session.executeRead(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var query, statsResult, nodeCount, relationshipCount, nodeTypesQuery, nodeTypesResult, nodeTypeCounts, relTypesQuery, relTypesResult, relationshipTypeCounts;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            query = "\n          MATCH (n)\n          WITH count(n) AS nodeCount\n          MATCH ()-[r]-()\n          WITH nodeCount, count(r) AS relationshipCount\n          RETURN nodeCount, relationshipCount\n        ";
                                            return [4 /*yield*/, tx.run(query)];
                                        case 1:
                                            statsResult = _a.sent();
                                            nodeCount = statsResult.records[0].get('nodeCount').toNumber();
                                            relationshipCount = statsResult.records[0].get('relationshipCount').toNumber();
                                            nodeTypesQuery = "\n          CALL db.labels() YIELD label\n          MATCH (n:".concat("label", ")\n          RETURN label, count(n) AS count\n        ");
                                            return [4 /*yield*/, tx.run(nodeTypesQuery)];
                                        case 2:
                                            nodeTypesResult = _a.sent();
                                            nodeTypeCounts = {};
                                            nodeTypesResult.records.forEach(function (record) {
                                                nodeTypeCounts[record.get('label')] = record.get('count').toNumber();
                                            });
                                            relTypesQuery = "\n          CALL db.relationshipTypes() YIELD relationshipType\n          MATCH ()-[r:".concat("relationshipType", "]-()\n          RETURN relationshipType, count(r) AS count\n        ");
                                            return [4 /*yield*/, tx.run(relTypesQuery)];
                                        case 3:
                                            relTypesResult = _a.sent();
                                            relationshipTypeCounts = {};
                                            relTypesResult.records.forEach(function (record) {
                                                relationshipTypeCounts[record.get('relationshipType')] = record.get('count').toNumber();
                                            });
                                            return [2 /*return*/, {
                                                    nodeCount: nodeCount,
                                                    relationshipCount: relationshipCount,
                                                    nodeTypeCounts: nodeTypeCounts,
                                                    relationshipTypeCounts: relationshipTypeCounts
                                                }];
                                    }
                                });
                            }); })];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 3: return [4 /*yield*/, session.close()];
                    case 4:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 清空图谱实现
     */
    Neo4jKnowledgeGraphService.prototype.clearGraphImplementation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var session, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        session = this.getSession();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 6]);
                        return [4 /*yield*/, session.executeWrite(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var query;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            query = "\n          MATCH (n)\n          DETACH DELETE n\n        ";
                                            return [4 /*yield*/, tx.run(query)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Failed to clear graph:', error_3);
                        return [2 /*return*/, false];
                    case 4: return [4 /*yield*/, session.close()];
                    case 5:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 导出图谱实现
     */
    Neo4jKnowledgeGraphService.prototype.exportGraphImplementation = function (format, path) {
        return __awaiter(this, void 0, void 0, function () {
            var nodes, relationships, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.queryNodes({})];
                    case 2:
                        nodes = _a.sent();
                        return [4 /*yield*/, this.queryRelationships({})];
                    case 3:
                        relationships = _a.sent();
                        // 根据格式导出
                        switch (format) {
                            case 'JSON':
                                return [2 /*return*/, this.exportToJson(path, nodes, relationships)];
                            case 'CSV':
                                return [2 /*return*/, this.exportToCsv(path, nodes, relationships)];
                            case 'GRAPHML':
                                return [2 /*return*/, this.exportToGraphML(path, nodes, relationships)];
                            default:
                                throw new Error("Unsupported export format: ".concat(format));
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        console.error("Failed to export graph to ".concat(format, ":"), error_4);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 导入图谱实现
     */
    Neo4jKnowledgeGraphService.prototype.importGraphImplementation = function (format, path, mergeStrategy) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureInitialized();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        if (!(mergeStrategy === 'REPLACE')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.clearGraph(true)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        // 根据格式导入
                        switch (format) {
                            case 'JSON':
                                return [2 /*return*/, this.importFromJson(path, mergeStrategy)];
                            case 'CSV':
                                return [2 /*return*/, this.importFromCsv(path, mergeStrategy)];
                            case 'GRAPHML':
                                return [2 /*return*/, this.importFromGraphML(path, mergeStrategy)];
                            default:
                                throw new Error("Unsupported import format: ".concat(format));
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        console.error("Failed to import graph from ".concat(format, ":"), error_5);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 设置约束和索引
     */
    Neo4jKnowledgeGraphService.prototype.setupConstraintsAndIndexes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = this.getSession();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 5]);
                        return [4 /*yield*/, session.executeWrite(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var error_6, legacyError_1, error_7, legacyError_2;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 7]);
                                            return [4 /*yield*/, tx.run('CREATE CONSTRAINT node_id_unique IF NOT EXISTS FOR (n) REQUIRE n.id IS UNIQUE')];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 7];
                                        case 2:
                                            error_6 = _a.sent();
                                            // 兼容旧版Neo4j
                                            console.warn('Failed to create constraint with new syntax, trying legacy syntax:', error_6);
                                            _a.label = 3;
                                        case 3:
                                            _a.trys.push([3, 5, , 6]);
                                            return [4 /*yield*/, tx.run('CREATE CONSTRAINT ON (n) ASSERT n.id IS UNIQUE')];
                                        case 4:
                                            _a.sent();
                                            return [3 /*break*/, 6];
                                        case 5:
                                            legacyError_1 = _a.sent();
                                            console.error('Failed to create constraint with legacy syntax:', legacyError_1);
                                            return [3 /*break*/, 6];
                                        case 6: return [3 /*break*/, 7];
                                        case 7:
                                            _a.trys.push([7, 12, , 18]);
                                            return [4 /*yield*/, tx.run('CREATE INDEX node_type_index IF NOT EXISTS FOR (n) ON (n:type)')];
                                        case 8:
                                            _a.sent();
                                            return [4 /*yield*/, tx.run('CREATE INDEX node_label_index IF NOT EXISTS FOR (n) ON (n.label)')];
                                        case 9:
                                            _a.sent();
                                            return [4 /*yield*/, tx.run('CREATE INDEX relationship_id_index IF NOT EXISTS FOR ()-[r]-() ON (r.id)')];
                                        case 10:
                                            _a.sent();
                                            return [4 /*yield*/, tx.run('CREATE INDEX relationship_type_index IF NOT EXISTS FOR ()-[r]-() ON (type(r))')];
                                        case 11:
                                            _a.sent();
                                            return [3 /*break*/, 18];
                                        case 12:
                                            error_7 = _a.sent();
                                            // 兼容旧版Neo4j
                                            console.warn('Failed to create indexes with new syntax, trying legacy syntax:', error_7);
                                            _a.label = 13;
                                        case 13:
                                            _a.trys.push([13, 16, , 17]);
                                            return [4 /*yield*/, tx.run('CREATE INDEX ON :type(id)')];
                                        case 14:
                                            _a.sent();
                                            return [4 /*yield*/, tx.run('CREATE INDEX ON :type(label)')];
                                        case 15:
                                            _a.sent();
                                            return [3 /*break*/, 17];
                                        case 16:
                                            legacyError_2 = _a.sent();
                                            console.error('Failed to create indexes with legacy syntax:', legacyError_2);
                                            return [3 /*break*/, 17];
                                        case 17: return [3 /*break*/, 18];
                                        case 18: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, session.close()];
                    case 4:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取会话
     */
    Neo4jKnowledgeGraphService.prototype.getSession = function () {
        if (!this.driver) {
            throw new Error('Neo4j driver is not initialized');
        }
        return this.driver.session({
            database: this.database
        });
    };
    /**
     * 确保服务已初始化
     */
    Neo4jKnowledgeGraphService.prototype.ensureInitialized = function () {
        if (!this.initialized || !this.driver) {
            throw new Error('Neo4j knowledge graph service is not initialized');
        }
    };
    /**
     * 转换Neo4j节点为应用节点
     */
    Neo4jKnowledgeGraphService.prototype.convertNeo4jNodeToNode = function (neo4jNode) {
        var neo4jNodeProps = neo4jNode.properties;
        var properties = neo4jNodeProps.properties || {};
        var vector = properties.vector;
        // 如果向量存在，从属性中移除
        if (vector) {
            delete properties.vector;
        }
        return {
            id: neo4jNodeProps.id,
            type: Array.from(neo4jNode.labels)[0], // 使用第一个标签作为类型
            label: neo4jNodeProps.label,
            properties: properties,
            vector: vector,
            createdAt: neo4jNodeProps.createdAt ? new Date(neo4jNodeProps.createdAt.toString()) : new Date(),
            updatedAt: neo4jNodeProps.updatedAt ? new Date(neo4jNodeProps.updatedAt.toString()) : new Date()
        };
    };
    /**
     * 转换Neo4j关系为应用关系
     */
    Neo4jKnowledgeGraphService.prototype.convertNeo4jRelationshipToRelationship = function (record) {
        var neo4jRel = record.get('r');
        var sourceNode = record.get('source');
        var targetNode = record.get('target');
        var neo4jRelProps = neo4jRel.properties;
        var sourceNodeProps = sourceNode.properties;
        var targetNodeProps = targetNode.properties;
        return {
            id: neo4jRelProps.id,
            type: neo4jRel.type,
            label: neo4jRelProps.label,
            sourceNodeId: sourceNodeProps.id,
            targetNodeId: targetNodeProps.id,
            properties: neo4jRelProps.properties || {},
            createdAt: neo4jRelProps.createdAt ? new Date(neo4jRelProps.createdAt.toString()) : new Date(),
            updatedAt: neo4jRelProps.updatedAt ? new Date(neo4jRelProps.updatedAt.toString()) : new Date()
        };
    };
    /**
     * 导出为JSON格式
     */
    Neo4jKnowledgeGraphService.prototype.exportToJson = function (filePath, nodes, relationships) {
        return __awaiter(this, void 0, void 0, function () {
            var fs, path, promisify, writeFile, mkdir, dir, data, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fs = require('fs');
                        path = require('path');
                        promisify = require('util').promisify;
                        writeFile = promisify(fs.writeFile);
                        mkdir = promisify(fs.mkdir);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        dir = path.dirname(filePath);
                        if (!!fs.existsSync(dir)) return [3 /*break*/, 3];
                        return [4 /*yield*/, mkdir(dir, { recursive: true })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        data = {
                            nodes: nodes,
                            relationships: relationships
                        };
                        // 写入文件
                        return [4 /*yield*/, writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')];
                    case 4:
                        // 写入文件
                        _a.sent();
                        console.info("Exported knowledge graph to JSON: ".concat(filePath));
                        return [2 /*return*/, true];
                    case 5:
                        error_8 = _a.sent();
                        console.error('Failed to export knowledge graph to JSON:', error_8);
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 导出为CSV格式
     */
    Neo4jKnowledgeGraphService.prototype.exportToCsv = function (dirPath, nodes, relationships) {
        return __awaiter(this, void 0, void 0, function () {
            var fs, path, promisify, writeFile, mkdir, nodesPath, nodesContent, nodes_1, nodes_1_1, node, relationshipsPath, relationshipsContent, relationships_1, relationships_1_1, relationship, error_9;
            var e_6, _a, e_7, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        fs = require('fs');
                        path = require('path');
                        promisify = require('util').promisify;
                        writeFile = promisify(fs.writeFile);
                        mkdir = promisify(fs.mkdir);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, , 7]);
                        if (!!fs.existsSync(dirPath)) return [3 /*break*/, 3];
                        return [4 /*yield*/, mkdir(dirPath, { recursive: true })];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        nodesPath = path.join(dirPath, 'nodes.csv');
                        nodesContent = 'id,type,label,createdAt,updatedAt,properties\n';
                        try {
                            for (nodes_1 = __values(nodes), nodes_1_1 = nodes_1.next(); !nodes_1_1.done; nodes_1_1 = nodes_1.next()) {
                                node = nodes_1_1.value;
                                nodesContent += "\"".concat(node.id, "\",\"").concat(node.type, "\",\"").concat(node.label, "\",\"").concat(node.createdAt.toISOString(), "\",\"").concat(node.updatedAt.toISOString(), "\",\"").concat(JSON.stringify(node.properties).replace(/"/g, '""'), "\"\n");
                            }
                        }
                        catch (e_6_1) { e_6 = { error: e_6_1 }; }
                        finally {
                            try {
                                if (nodes_1_1 && !nodes_1_1.done && (_a = nodes_1.return)) _a.call(nodes_1);
                            }
                            finally { if (e_6) throw e_6.error; }
                        }
                        return [4 /*yield*/, writeFile(nodesPath, nodesContent, 'utf8')];
                    case 4:
                        _c.sent();
                        relationshipsPath = path.join(dirPath, 'relationships.csv');
                        relationshipsContent = 'id,type,label,sourceNodeId,targetNodeId,createdAt,updatedAt,properties\n';
                        try {
                            for (relationships_1 = __values(relationships), relationships_1_1 = relationships_1.next(); !relationships_1_1.done; relationships_1_1 = relationships_1.next()) {
                                relationship = relationships_1_1.value;
                                relationshipsContent += "\"".concat(relationship.id, "\",\"").concat(relationship.type, "\",\"").concat(relationship.label, "\",\"").concat(relationship.sourceNodeId, "\",\"").concat(relationship.targetNodeId, "\",\"").concat(relationship.createdAt.toISOString(), "\",\"").concat(relationship.updatedAt.toISOString(), "\",\"").concat(JSON.stringify(relationship.properties).replace(/"/g, '""'), "\"\n");
                            }
                        }
                        catch (e_7_1) { e_7 = { error: e_7_1 }; }
                        finally {
                            try {
                                if (relationships_1_1 && !relationships_1_1.done && (_b = relationships_1.return)) _b.call(relationships_1);
                            }
                            finally { if (e_7) throw e_7.error; }
                        }
                        return [4 /*yield*/, writeFile(relationshipsPath, relationshipsContent, 'utf8')];
                    case 5:
                        _c.sent();
                        console.info("Exported knowledge graph to CSV: ".concat(dirPath));
                        return [2 /*return*/, true];
                    case 6:
                        error_9 = _c.sent();
                        console.error('Failed to export knowledge graph to CSV:', error_9);
                        return [2 /*return*/, false];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 导出为GraphML格式
     */
    Neo4jKnowledgeGraphService.prototype.exportToGraphML = function (filePath, nodes, relationships) {
        return __awaiter(this, void 0, void 0, function () {
            var fs, path, promisify, writeFile, mkdir, dir, content, nodes_2, nodes_2_1, node, relationships_2, relationships_2_1, relationship, error_10;
            var e_8, _a, e_9, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        fs = require('fs');
                        path = require('path');
                        promisify = require('util').promisify;
                        writeFile = promisify(fs.writeFile);
                        mkdir = promisify(fs.mkdir);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, , 6]);
                        dir = path.dirname(filePath);
                        if (!!fs.existsSync(dir)) return [3 /*break*/, 3];
                        return [4 /*yield*/, mkdir(dir, { recursive: true })];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        content = '<?xml version="1.0" encoding="UTF-8"?>\n';
                        content += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns"\n';
                        content += '         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
                        content += '         xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns\n';
                        content += '         http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">\n';
                        // 定义属性键
                        content += '  <key id="type" for="node" attr.name="type" attr.type="string"/>\n';
                        content += '  <key id="label" for="node" attr.name="label" attr.type="string"/>\n';
                        content += '  <key id="properties" for="node" attr.name="properties" attr.type="string"/>\n';
                        content += '  <key id="createdAt" for="node" attr.name="createdAt" attr.type="string"/>\n';
                        content += '  <key id="updatedAt" for="node" attr.name="updatedAt" attr.type="string"/>\n';
                        content += '  <key id="type" for="edge" attr.name="type" attr.type="string"/>\n';
                        content += '  <key id="label" for="edge" attr.name="label" attr.type="string"/>\n';
                        content += '  <key id="properties" for="edge" attr.name="properties" attr.type="string"/>\n';
                        content += '  <key id="createdAt" for="edge" attr.name="createdAt" attr.type="string"/>\n';
                        content += '  <key id="updatedAt" for="edge" attr.name="updatedAt" attr.type="string"/>\n';
                        // 图定义
                        content += '  <graph id="G" edgedefault="directed">\n';
                        try {
                            // 节点
                            for (nodes_2 = __values(nodes), nodes_2_1 = nodes_2.next(); !nodes_2_1.done; nodes_2_1 = nodes_2.next()) {
                                node = nodes_2_1.value;
                                content += "    <node id=\"".concat(node.id, "\">\n");
                                content += "      <data key=\"type\">".concat(node.type, "</data>\n");
                                content += "      <data key=\"label\">".concat(node.label, "</data>\n");
                                content += "      <data key=\"properties\">".concat(JSON.stringify(node.properties).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'), "</data>\n");
                                content += "      <data key=\"createdAt\">".concat(node.createdAt.toISOString(), "</data>\n");
                                content += "      <data key=\"updatedAt\">".concat(node.updatedAt.toISOString(), "</data>\n");
                                content += '    </node>\n';
                            }
                        }
                        catch (e_8_1) { e_8 = { error: e_8_1 }; }
                        finally {
                            try {
                                if (nodes_2_1 && !nodes_2_1.done && (_a = nodes_2.return)) _a.call(nodes_2);
                            }
                            finally { if (e_8) throw e_8.error; }
                        }
                        try {
                            // 关系
                            for (relationships_2 = __values(relationships), relationships_2_1 = relationships_2.next(); !relationships_2_1.done; relationships_2_1 = relationships_2.next()) {
                                relationship = relationships_2_1.value;
                                content += "    <edge id=\"".concat(relationship.id, "\" source=\"").concat(relationship.sourceNodeId, "\" target=\"").concat(relationship.targetNodeId, "\">\n");
                                content += "      <data key=\"type\">".concat(relationship.type, "</data>\n");
                                content += "      <data key=\"label\">".concat(relationship.label, "</data>\n");
                                content += "      <data key=\"properties\">".concat(JSON.stringify(relationship.properties).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'), "</data>\n");
                                content += "      <data key=\"createdAt\">".concat(relationship.createdAt.toISOString(), "</data>\n");
                                content += "      <data key=\"updatedAt\">".concat(relationship.updatedAt.toISOString(), "</data>\n");
                                content += '    </edge>\n';
                            }
                        }
                        catch (e_9_1) { e_9 = { error: e_9_1 }; }
                        finally {
                            try {
                                if (relationships_2_1 && !relationships_2_1.done && (_b = relationships_2.return)) _b.call(relationships_2);
                            }
                            finally { if (e_9) throw e_9.error; }
                        }
                        // 结束标签
                        content += '  </graph>\n';
                        content += '</graphml>';
                        // 写入文件
                        return [4 /*yield*/, writeFile(filePath, content, 'utf8')];
                    case 4:
                        // 写入文件
                        _c.sent();
                        console.info("Exported knowledge graph to GraphML: ".concat(filePath));
                        return [2 /*return*/, true];
                    case 5:
                        error_10 = _c.sent();
                        console.error('Failed to export knowledge graph to GraphML:', error_10);
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 从JSON导入
     */
    Neo4jKnowledgeGraphService.prototype.importFromJson = function (filePath, mergeStrategy) {
        return __awaiter(this, void 0, void 0, function () {
            var fs, promisify, readFile, data, _a, nodes, relationships, nodes_3, nodes_3_1, node, existingNode, existingNode, e_10_1, relationships_3, relationships_3_1, relationship, existingRelationship, existingRelationship, e_11_1, error_11;
            var e_10, _b, e_11, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        fs = require('fs');
                        promisify = require('util').promisify;
                        readFile = promisify(fs.readFile);
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 34, , 35]);
                        // 检查文件是否存在
                        if (!fs.existsSync(filePath)) {
                            throw new Error("File does not exist: ".concat(filePath));
                        }
                        return [4 /*yield*/, readFile(filePath, 'utf8')];
                    case 2:
                        data = _d.sent();
                        _a = JSON.parse(data), nodes = _a.nodes, relationships = _a.relationships;
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 16, 17, 18]);
                        nodes_3 = __values(nodes), nodes_3_1 = nodes_3.next();
                        _d.label = 4;
                    case 4:
                        if (!!nodes_3_1.done) return [3 /*break*/, 15];
                        node = nodes_3_1.value;
                        // 转换日期字符串为Date对象
                        node.createdAt = new Date(node.createdAt);
                        node.updatedAt = new Date(node.updatedAt);
                        if (!(mergeStrategy === 'SKIP_DUPLICATES')) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.getNode(node.id)];
                    case 5:
                        existingNode = _d.sent();
                        if (existingNode) {
                            return [3 /*break*/, 14];
                        }
                        _d.label = 6;
                    case 6:
                        if (!(mergeStrategy === 'MERGE')) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.getNode(node.id)];
                    case 7:
                        existingNode = _d.sent();
                        if (!existingNode) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.updateNode(node.id, node)];
                    case 8:
                        _d.sent();
                        return [3 /*break*/, 11];
                    case 9: return [4 /*yield*/, this.createNode(node)];
                    case 10:
                        _d.sent();
                        _d.label = 11;
                    case 11: return [3 /*break*/, 14];
                    case 12: return [4 /*yield*/, this.createNode(node)];
                    case 13:
                        _d.sent();
                        _d.label = 14;
                    case 14:
                        nodes_3_1 = nodes_3.next();
                        return [3 /*break*/, 4];
                    case 15: return [3 /*break*/, 18];
                    case 16:
                        e_10_1 = _d.sent();
                        e_10 = { error: e_10_1 };
                        return [3 /*break*/, 18];
                    case 17:
                        try {
                            if (nodes_3_1 && !nodes_3_1.done && (_b = nodes_3.return)) _b.call(nodes_3);
                        }
                        finally { if (e_10) throw e_10.error; }
                        return [7 /*endfinally*/];
                    case 18:
                        _d.trys.push([18, 31, 32, 33]);
                        relationships_3 = __values(relationships), relationships_3_1 = relationships_3.next();
                        _d.label = 19;
                    case 19:
                        if (!!relationships_3_1.done) return [3 /*break*/, 30];
                        relationship = relationships_3_1.value;
                        // 转换日期字符串为Date对象
                        relationship.createdAt = new Date(relationship.createdAt);
                        relationship.updatedAt = new Date(relationship.updatedAt);
                        if (!(mergeStrategy === 'SKIP_DUPLICATES')) return [3 /*break*/, 21];
                        return [4 /*yield*/, this.getRelationship(relationship.id)];
                    case 20:
                        existingRelationship = _d.sent();
                        if (existingRelationship) {
                            return [3 /*break*/, 29];
                        }
                        _d.label = 21;
                    case 21:
                        if (!(mergeStrategy === 'MERGE')) return [3 /*break*/, 27];
                        return [4 /*yield*/, this.getRelationship(relationship.id)];
                    case 22:
                        existingRelationship = _d.sent();
                        if (!existingRelationship) return [3 /*break*/, 24];
                        return [4 /*yield*/, this.updateRelationship(relationship.id, relationship)];
                    case 23:
                        _d.sent();
                        return [3 /*break*/, 26];
                    case 24: return [4 /*yield*/, this.createRelationship(relationship)];
                    case 25:
                        _d.sent();
                        _d.label = 26;
                    case 26: return [3 /*break*/, 29];
                    case 27: return [4 /*yield*/, this.createRelationship(relationship)];
                    case 28:
                        _d.sent();
                        _d.label = 29;
                    case 29:
                        relationships_3_1 = relationships_3.next();
                        return [3 /*break*/, 19];
                    case 30: return [3 /*break*/, 33];
                    case 31:
                        e_11_1 = _d.sent();
                        e_11 = { error: e_11_1 };
                        return [3 /*break*/, 33];
                    case 32:
                        try {
                            if (relationships_3_1 && !relationships_3_1.done && (_c = relationships_3.return)) _c.call(relationships_3);
                        }
                        finally { if (e_11) throw e_11.error; }
                        return [7 /*endfinally*/];
                    case 33:
                        console.info("Imported knowledge graph from JSON: ".concat(filePath));
                        return [2 /*return*/, true];
                    case 34:
                        error_11 = _d.sent();
                        console.error('Failed to import knowledge graph from JSON:', error_11);
                        return [2 /*return*/, false];
                    case 35: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 解析CSV行
     */
    Neo4jKnowledgeGraphService.prototype.parseCSVLine = function (line) {
        var result = [];
        var inQuotes = false;
        var currentValue = '';
        for (var i = 0; i < line.length; i++) {
            var char = line[i];
            if (char === '"') {
                if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                    // 处理双引号转义 ("") -> ")
                    currentValue += '"';
                    i++; // 跳过下一个引号
                }
                else {
                    // 切换引号状态
                    inQuotes = !inQuotes;
                }
            }
            else if (char === ',' && !inQuotes) {
                // 字段分隔符，添加当前值并重置
                result.push(currentValue);
                currentValue = '';
            }
            else {
                // 普通字符
                currentValue += char;
            }
        }
        // 添加最后一个字段
        result.push(currentValue);
        return result;
    };
    /**
     * 从CSV导入
     */
    Neo4jKnowledgeGraphService.prototype.importFromCsv = function (dirPath, mergeStrategy) {
        return __awaiter(this, void 0, void 0, function () {
            var fs, path, promisify, readFile, nodesPath, nodesData, nodesLines, i, line, _a, id, type, label, createdAt, updatedAt, propertiesStr, node, existingNode, existingNode, relationshipsPath, relationshipsData, relationshipsLines, i, line, _b, id, type, label, sourceNodeId, targetNodeId, createdAt, updatedAt, propertiesStr, relationship, existingRelationship, existingRelationship, error_12;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        fs = require('fs');
                        path = require('path');
                        promisify = require('util').promisify;
                        readFile = promisify(fs.readFile);
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 28, , 29]);
                        // 检查目录是否存在
                        if (!fs.existsSync(dirPath)) {
                            throw new Error("Directory does not exist: ".concat(dirPath));
                        }
                        nodesPath = path.join(dirPath, 'nodes.csv');
                        if (!fs.existsSync(nodesPath)) {
                            throw new Error("Nodes file does not exist: ".concat(nodesPath));
                        }
                        return [4 /*yield*/, readFile(nodesPath, 'utf8')];
                    case 2:
                        nodesData = _c.sent();
                        nodesLines = nodesData.split('\n');
                        i = 1;
                        _c.label = 3;
                    case 3:
                        if (!(i < nodesLines.length)) return [3 /*break*/, 14];
                        line = nodesLines[i].trim();
                        if (!line)
                            return [3 /*break*/, 13];
                        _a = __read(this.parseCSVLine(line), 6), id = _a[0], type = _a[1], label = _a[2], createdAt = _a[3], updatedAt = _a[4], propertiesStr = _a[5];
                        node = {
                            id: id,
                            type: type,
                            label: label,
                            properties: JSON.parse(propertiesStr),
                            createdAt: new Date(createdAt),
                            updatedAt: new Date(updatedAt)
                        };
                        if (!(mergeStrategy === 'SKIP_DUPLICATES')) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getNode(node.id)];
                    case 4:
                        existingNode = _c.sent();
                        if (existingNode) {
                            return [3 /*break*/, 13];
                        }
                        _c.label = 5;
                    case 5:
                        if (!(mergeStrategy === 'MERGE')) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.getNode(node.id)];
                    case 6:
                        existingNode = _c.sent();
                        if (!existingNode) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.updateNode(node.id, node)];
                    case 7:
                        _c.sent();
                        return [3 /*break*/, 10];
                    case 8: return [4 /*yield*/, this.createNode(node)];
                    case 9:
                        _c.sent();
                        _c.label = 10;
                    case 10: return [3 /*break*/, 13];
                    case 11: return [4 /*yield*/, this.createNode(node)];
                    case 12:
                        _c.sent();
                        _c.label = 13;
                    case 13:
                        i++;
                        return [3 /*break*/, 3];
                    case 14:
                        relationshipsPath = path.join(dirPath, 'relationships.csv');
                        if (!fs.existsSync(relationshipsPath)) {
                            throw new Error("Relationships file does not exist: ".concat(relationshipsPath));
                        }
                        return [4 /*yield*/, readFile(relationshipsPath, 'utf8')];
                    case 15:
                        relationshipsData = _c.sent();
                        relationshipsLines = relationshipsData.split('\n');
                        i = 1;
                        _c.label = 16;
                    case 16:
                        if (!(i < relationshipsLines.length)) return [3 /*break*/, 27];
                        line = relationshipsLines[i].trim();
                        if (!line)
                            return [3 /*break*/, 26];
                        _b = __read(this.parseCSVLine(line), 8), id = _b[0], type = _b[1], label = _b[2], sourceNodeId = _b[3], targetNodeId = _b[4], createdAt = _b[5], updatedAt = _b[6], propertiesStr = _b[7];
                        relationship = {
                            id: id,
                            type: type || 'RELATED_TO',
                            label: label || '',
                            sourceNodeId: sourceNodeId,
                            targetNodeId: targetNodeId,
                            properties: JSON.parse(propertiesStr),
                            createdAt: new Date(createdAt),
                            updatedAt: new Date(updatedAt)
                        };
                        if (!(mergeStrategy === 'SKIP_DUPLICATES')) return [3 /*break*/, 18];
                        return [4 /*yield*/, this.getRelationship(relationship.id)];
                    case 17:
                        existingRelationship = _c.sent();
                        if (existingRelationship) {
                            return [3 /*break*/, 26];
                        }
                        _c.label = 18;
                    case 18:
                        if (!(mergeStrategy === 'MERGE')) return [3 /*break*/, 24];
                        return [4 /*yield*/, this.getRelationship(relationship.id)];
                    case 19:
                        existingRelationship = _c.sent();
                        if (!existingRelationship) return [3 /*break*/, 21];
                        return [4 /*yield*/, this.updateRelationship(relationship.id, relationship)];
                    case 20:
                        _c.sent();
                        return [3 /*break*/, 23];
                    case 21: return [4 /*yield*/, this.createRelationship(relationship)];
                    case 22:
                        _c.sent();
                        _c.label = 23;
                    case 23: return [3 /*break*/, 26];
                    case 24: return [4 /*yield*/, this.createRelationship(relationship)];
                    case 25:
                        _c.sent();
                        _c.label = 26;
                    case 26:
                        i++;
                        return [3 /*break*/, 16];
                    case 27:
                        console.info("Imported knowledge graph from CSV: ".concat(dirPath));
                        return [2 /*return*/, true];
                    case 28:
                        error_12 = _c.sent();
                        console.error('Failed to import knowledge graph from CSV:', error_12);
                        return [2 /*return*/, false];
                    case 29: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 从GraphML导入
     */
    Neo4jKnowledgeGraphService.prototype.importFromGraphML = function (filePath, mergeStrategy) {
        return __awaiter(this, void 0, void 0, function () {
            var fs, promisify, readFile, parseStringPromise, data, result, graphml, graph, keys, _a, _b, key, keyAttrs, _c, _d, nodeXml, nodeId, nodeData, _e, _f, data_1, keyId, keyName, node, existingNode, existingNode, e_12_1, _g, _h, edgeXml, edgeAttrs, edgeId, sourceId, targetId, edgeData, _j, _k, data_2, keyId, keyName, relationship, existingRelationship, existingRelationship, e_13_1, error_13;
            var e_14, _l, e_12, _m, e_15, _o, e_13, _p, e_16, _q;
            var _r, _s;
            return __generator(this, function (_t) {
                switch (_t.label) {
                    case 0:
                        fs = require('fs');
                        promisify = require('util').promisify;
                        readFile = promisify(fs.readFile);
                        parseStringPromise = require('xml2js').parseStringPromise;
                        _t.label = 1;
                    case 1:
                        _t.trys.push([1, 36, , 37]);
                        // 检查文件是否存在
                        if (!fs.existsSync(filePath)) {
                            throw new Error("File does not exist: ".concat(filePath));
                        }
                        return [4 /*yield*/, readFile(filePath, 'utf8')];
                    case 2:
                        data = _t.sent();
                        return [4 /*yield*/, parseStringPromise(data)];
                    case 3:
                        result = _t.sent();
                        graphml = result.graphml;
                        graph = graphml.graph[0];
                        keys = {};
                        if (graphml.key) {
                            try {
                                for (_a = __values(graphml.key), _b = _a.next(); !_b.done; _b = _a.next()) {
                                    key = _b.value;
                                    keyAttrs = key.$;
                                    keys[keyAttrs.id] = {
                                        id: keyAttrs.id,
                                        for: keyAttrs.for,
                                        name: keyAttrs['attr.name']
                                    };
                                }
                            }
                            catch (e_14_1) { e_14 = { error: e_14_1 }; }
                            finally {
                                try {
                                    if (_b && !_b.done && (_l = _a.return)) _l.call(_a);
                                }
                                finally { if (e_14) throw e_14.error; }
                            }
                        }
                        if (!graph.node) return [3 /*break*/, 19];
                        _t.label = 4;
                    case 4:
                        _t.trys.push([4, 17, 18, 19]);
                        _c = __values(graph.node), _d = _c.next();
                        _t.label = 5;
                    case 5:
                        if (!!_d.done) return [3 /*break*/, 16];
                        nodeXml = _d.value;
                        nodeId = nodeXml.$.id;
                        nodeData = {};
                        // 解析节点数据
                        if (nodeXml.data) {
                            try {
                                for (_e = (e_15 = void 0, __values(nodeXml.data)), _f = _e.next(); !_f.done; _f = _e.next()) {
                                    data_1 = _f.value;
                                    keyId = data_1.$.key;
                                    keyName = ((_r = keys[keyId]) === null || _r === void 0 ? void 0 : _r.name) || keyId;
                                    nodeData[keyName] = data_1._;
                                }
                            }
                            catch (e_15_1) { e_15 = { error: e_15_1 }; }
                            finally {
                                try {
                                    if (_f && !_f.done && (_o = _e.return)) _o.call(_e);
                                }
                                finally { if (e_15) throw e_15.error; }
                            }
                        }
                        node = {
                            id: nodeId,
                            type: nodeData.type,
                            label: nodeData.label,
                            properties: nodeData.properties ? JSON.parse(nodeData.properties) : {},
                            createdAt: nodeData.createdAt ? new Date(nodeData.createdAt) : new Date(),
                            updatedAt: nodeData.updatedAt ? new Date(nodeData.updatedAt) : new Date()
                        };
                        if (!(mergeStrategy === 'SKIP_DUPLICATES')) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.getNode(node.id)];
                    case 6:
                        existingNode = _t.sent();
                        if (existingNode) {
                            return [3 /*break*/, 15];
                        }
                        _t.label = 7;
                    case 7:
                        if (!(mergeStrategy === 'MERGE')) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.getNode(node.id)];
                    case 8:
                        existingNode = _t.sent();
                        if (!existingNode) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.updateNode(node.id, node)];
                    case 9:
                        _t.sent();
                        return [3 /*break*/, 12];
                    case 10: return [4 /*yield*/, this.createNode(node)];
                    case 11:
                        _t.sent();
                        _t.label = 12;
                    case 12: return [3 /*break*/, 15];
                    case 13: return [4 /*yield*/, this.createNode(node)];
                    case 14:
                        _t.sent();
                        _t.label = 15;
                    case 15:
                        _d = _c.next();
                        return [3 /*break*/, 5];
                    case 16: return [3 /*break*/, 19];
                    case 17:
                        e_12_1 = _t.sent();
                        e_12 = { error: e_12_1 };
                        return [3 /*break*/, 19];
                    case 18:
                        try {
                            if (_d && !_d.done && (_m = _c.return)) _m.call(_c);
                        }
                        finally { if (e_12) throw e_12.error; }
                        return [7 /*endfinally*/];
                    case 19:
                        if (!graph.edge) return [3 /*break*/, 35];
                        _t.label = 20;
                    case 20:
                        _t.trys.push([20, 33, 34, 35]);
                        _g = __values(graph.edge), _h = _g.next();
                        _t.label = 21;
                    case 21:
                        if (!!_h.done) return [3 /*break*/, 32];
                        edgeXml = _h.value;
                        edgeAttrs = edgeXml.$;
                        edgeId = edgeAttrs.id;
                        sourceId = edgeAttrs.source;
                        targetId = edgeAttrs.target;
                        edgeData = {};
                        // 解析关系数据
                        if (edgeXml.data) {
                            try {
                                for (_j = (e_16 = void 0, __values(edgeXml.data)), _k = _j.next(); !_k.done; _k = _j.next()) {
                                    data_2 = _k.value;
                                    keyId = data_2.$.key;
                                    keyName = ((_s = keys[keyId]) === null || _s === void 0 ? void 0 : _s.name) || keyId;
                                    edgeData[keyName] = data_2._;
                                }
                            }
                            catch (e_16_1) { e_16 = { error: e_16_1 }; }
                            finally {
                                try {
                                    if (_k && !_k.done && (_q = _j.return)) _q.call(_j);
                                }
                                finally { if (e_16) throw e_16.error; }
                            }
                        }
                        relationship = {
                            id: edgeId,
                            type: ('type' in edgeData ? edgeData.type : types_1.RelationshipType.RELATED_TO),
                            label: 'label' in edgeData ? String(edgeData.label) : '',
                            sourceNodeId: sourceId,
                            targetNodeId: targetId,
                            properties: 'properties' in edgeData && edgeData.properties ? JSON.parse(edgeData.properties) : {},
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        if (!(mergeStrategy === 'SKIP_DUPLICATES')) return [3 /*break*/, 23];
                        return [4 /*yield*/, this.getRelationship(relationship.id)];
                    case 22:
                        existingRelationship = _t.sent();
                        if (existingRelationship) {
                            return [3 /*break*/, 31];
                        }
                        _t.label = 23;
                    case 23:
                        if (!(mergeStrategy === 'MERGE')) return [3 /*break*/, 29];
                        return [4 /*yield*/, this.getRelationship(relationship.id)];
                    case 24:
                        existingRelationship = _t.sent();
                        if (!existingRelationship) return [3 /*break*/, 26];
                        return [4 /*yield*/, this.updateRelationship(relationship.id, relationship)];
                    case 25:
                        _t.sent();
                        return [3 /*break*/, 28];
                    case 26: return [4 /*yield*/, this.createRelationship(relationship)];
                    case 27:
                        _t.sent();
                        _t.label = 28;
                    case 28: return [3 /*break*/, 31];
                    case 29: return [4 /*yield*/, this.createRelationship(relationship)];
                    case 30:
                        _t.sent();
                        _t.label = 31;
                    case 31:
                        _h = _g.next();
                        return [3 /*break*/, 21];
                    case 32: return [3 /*break*/, 35];
                    case 33:
                        e_13_1 = _t.sent();
                        e_13 = { error: e_13_1 };
                        return [3 /*break*/, 35];
                    case 34:
                        try {
                            if (_h && !_h.done && (_p = _g.return)) _p.call(_g);
                        }
                        finally { if (e_13) throw e_13.error; }
                        return [7 /*endfinally*/];
                    case 35:
                        console.info("Imported knowledge graph from GraphML: ".concat(filePath));
                        return [2 /*return*/, true];
                    case 36:
                        error_13 = _t.sent();
                        console.error('Failed to import knowledge graph from GraphML:', error_13);
                        return [2 /*return*/, false];
                    case 37: return [2 /*return*/];
                }
            });
        });
    };
    return Neo4jKnowledgeGraphService;
}(base_knowledge_graph_service_1.BaseKnowledgeGraphService));
exports.Neo4jKnowledgeGraphService = Neo4jKnowledgeGraphService;
/**
 * 全局Neo4j知识图谱服务实例
 */
exports.globalNeo4jKnowledgeGraphService = new Neo4jKnowledgeGraphService({
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    username: process.env.NEO4J_USERNAME || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'password',
    database: process.env.NEO4J_DATABASE || 'neo4j',
    enableVectorSearch: process.env.NEO4J_ENABLE_VECTOR_SEARCH !== 'false',
    vectorDimension: parseInt(process.env.NEO4J_VECTOR_DIMENSION || '1536', 10),
    enableApoc: process.env.NEO4J_ENABLE_APOC !== 'false',
    enableGds: process.env.NEO4J_ENABLE_GDS !== 'false',
    logLevel: (process.env.NEO4J_LOG_LEVEL || 'info')
});
