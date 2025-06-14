"use strict";
/**
 * Memory Knowledge Graph Service - 内存知识图谱服务
 *
 * 基于内存的知识图谱服务实现，适用于开发和测试环境
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
exports.globalMemoryKnowledgeGraphService = exports.MemoryKnowledgeGraphService = void 0;
var base_knowledge_graph_service_1 = require("./base-knowledge-graph-service");
var fs = require("fs");
var path = require("path");
var util_1 = require("util");
// 向量相似度计算函数
function cosineSimilarity(a, b) {
    if (a.length !== b.length) {
        throw new Error('Vectors must have the same length');
    }
    var dotProduct = 0;
    var normA = 0;
    var normB = 0;
    for (var i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) {
        return 0;
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
/**
 * 内存知识图谱服务
 *
 * 基于内存的知识图谱服务实现，适用于开发和测试环境
 */
var MemoryKnowledgeGraphService = /** @class */ (function (_super) {
    __extends(MemoryKnowledgeGraphService, _super);
    /**
     * 构造函数
     * @param config 配置
     */
    function MemoryKnowledgeGraphService(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this, {
            serviceName: 'MemoryKnowledgeGraphService',
            enableVectorSearch: config.enableVectorSearch !== undefined ? config.enableVectorSearch : true,
            vectorDimension: config.vectorDimension || 1536,
            logLevel: config.logLevel || 'info'
        }) || this;
        _this.nodes = new Map();
        _this.relationships = new Map();
        _this.autoSaveTimer = null;
        _this.memoryConfig = __assign({ persistToFile: config.persistToFile !== undefined ? config.persistToFile : false, persistFilePath: config.persistFilePath || path.join(process.cwd(), 'knowledge-graph.json'), autoSaveInterval: config.autoSaveInterval || 60000 }, config);
        return _this;
    }
    /**
     * 初始化实现
     */
    MemoryKnowledgeGraphService.prototype.initializeImplementation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.memoryConfig.persistToFile) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.loadFromFile()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.warn('Failed to load knowledge graph from file:', error_1 instanceof Error ? error_1 : String(error_1));
                        console.info('Starting with an empty knowledge graph');
                        return [3 /*break*/, 4];
                    case 4:
                        // 设置自动保存定时器
                        if (this.memoryConfig.autoSaveInterval > 0) {
                            this.autoSaveTimer = setInterval(function () {
                                _this.saveToFile().catch(function (error) {
                                    console.error('Failed to auto-save knowledge graph:', error instanceof Error ? error : String(error));
                                });
                            }, this.memoryConfig.autoSaveInterval);
                        }
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 关闭实现
     */
    MemoryKnowledgeGraphService.prototype.shutdownImplementation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.memoryConfig.persistToFile) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.saveToFile()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Failed to save knowledge graph to file during shutdown:', error_2 instanceof Error ? error_2 : String(error_2));
                        return [3 /*break*/, 4];
                    case 4:
                        // 清除自动保存定时器
                        if (this.autoSaveTimer) {
                            clearInterval(this.autoSaveTimer);
                            this.autoSaveTimer = null;
                        }
                        _a.label = 5;
                    case 5:
                        // 清空内存
                        this.nodes.clear();
                        this.relationships.clear();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建节点实现
     */
    MemoryKnowledgeGraphService.prototype.createNodeImplementation = function (node) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.nodes.set(node.id, node);
                return [2 /*return*/, node];
            });
        });
    };
    /**
     * 批量创建节点实现
     */
    MemoryKnowledgeGraphService.prototype.createNodesImplementation = function (nodes) {
        return __awaiter(this, void 0, void 0, function () {
            var nodes_1, nodes_1_1, node;
            var e_1, _a;
            return __generator(this, function (_b) {
                try {
                    for (nodes_1 = __values(nodes), nodes_1_1 = nodes_1.next(); !nodes_1_1.done; nodes_1_1 = nodes_1.next()) {
                        node = nodes_1_1.value;
                        this.nodes.set(node.id, node);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (nodes_1_1 && !nodes_1_1.done && (_a = nodes_1.return)) _a.call(nodes_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return [2 /*return*/, nodes];
            });
        });
    };
    /**
     * 获取节点实现
     */
    MemoryKnowledgeGraphService.prototype.getNodeImplementation = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.nodes.get(id) || null];
            });
        });
    };
    /**
     * 更新节点实现
     */
    MemoryKnowledgeGraphService.prototype.updateNodeImplementation = function (id, node) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.nodes.has(id)) {
                    return [2 /*return*/, null];
                }
                this.nodes.set(id, node);
                return [2 /*return*/, node];
            });
        });
    };
    /**
     * 删除节点实现
     */
    MemoryKnowledgeGraphService.prototype.deleteNodeImplementation = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var relationshipsToDelete, _a, _b, _c, relationshipId, relationship, relationshipsToDelete_1, relationshipsToDelete_1_1, relationshipId;
            var e_2, _d, e_3, _e;
            return __generator(this, function (_f) {
                if (!this.nodes.has(id)) {
                    return [2 /*return*/, false];
                }
                // 删除节点
                this.nodes.delete(id);
                relationshipsToDelete = [];
                try {
                    for (_a = __values(this.relationships.entries()), _b = _a.next(); !_b.done; _b = _a.next()) {
                        _c = __read(_b.value, 2), relationshipId = _c[0], relationship = _c[1];
                        if (relationship.sourceNodeId === id || relationship.targetNodeId === id) {
                            relationshipsToDelete.push(relationshipId);
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                try {
                    for (relationshipsToDelete_1 = __values(relationshipsToDelete), relationshipsToDelete_1_1 = relationshipsToDelete_1.next(); !relationshipsToDelete_1_1.done; relationshipsToDelete_1_1 = relationshipsToDelete_1.next()) {
                        relationshipId = relationshipsToDelete_1_1.value;
                        this.relationships.delete(relationshipId);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (relationshipsToDelete_1_1 && !relationshipsToDelete_1_1.done && (_e = relationshipsToDelete_1.return)) _e.call(relationshipsToDelete_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                return [2 /*return*/, true];
            });
        });
    };
    /**
     * 查询节点实现
     */
    MemoryKnowledgeGraphService.prototype.queryNodesImplementation = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var result, orderDirection, orderMultiplier_1, offset, limit;
            return __generator(this, function (_a) {
                result = Array.from(this.nodes.values());
                // 按类型过滤
                if (options.types && options.types.length > 0) {
                    result = result.filter(function (node) { return options.types.includes(node.type); });
                }
                // 按标签过滤
                if (options.labels && options.labels.length > 0) {
                    result = result.filter(function (node) { return options.labels.includes(node.label); });
                }
                // 按属性过滤
                if (options.properties) {
                    result = result.filter(function (node) {
                        var e_4, _a;
                        try {
                            for (var _b = __values(Object.entries(options.properties)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                                // 如果节点没有该属性或属性值不匹配
                                if (node.properties[key] === undefined || node.properties[key] !== value) {
                                    return false;
                                }
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                        return true;
                    });
                }
                // 排序
                if (options.orderBy) {
                    orderDirection = options.orderDirection || 'ASC';
                    orderMultiplier_1 = orderDirection === 'ASC' ? 1 : -1;
                    result.sort(function (a, b) {
                        var valueA;
                        var valueB;
                        // 特殊字段处理
                        if (options.orderBy === 'createdAt' || options.orderBy === 'updatedAt') {
                            valueA = a[options.orderBy].getTime();
                            valueB = b[options.orderBy].getTime();
                        }
                        else if (options.orderBy === 'id' || options.orderBy === 'type' || options.orderBy === 'label') {
                            valueA = a[options.orderBy];
                            valueB = b[options.orderBy];
                        }
                        else {
                            // 属性字段
                            valueA = a.properties[options.orderBy];
                            valueB = b.properties[options.orderBy];
                        }
                        // 排序比较
                        if (valueA === undefined && valueB === undefined)
                            return 0;
                        if (valueA === undefined)
                            return orderMultiplier_1 * -1;
                        if (valueB === undefined)
                            return orderMultiplier_1 * 1;
                        // 使用类型守卫确保类型安全的比较
                        if (typeof valueA === 'number' && typeof valueB === 'number') {
                            return orderMultiplier_1 * (valueA - valueB);
                        }
                        else if (typeof valueA === 'string' && typeof valueB === 'string') {
                            return orderMultiplier_1 * valueA.localeCompare(valueB);
                        }
                        else if (valueA instanceof Date && valueB instanceof Date) {
                            return orderMultiplier_1 * (valueA.getTime() - valueB.getTime());
                        }
                        else if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
                            return orderMultiplier_1 * (valueA === valueB ? 0 : valueA ? 1 : -1);
                        }
                        else {
                            // 转换为字符串进行比较，确保安全
                            var strA = String(valueA);
                            var strB = String(valueB);
                            return orderMultiplier_1 * strA.localeCompare(strB);
                        }
                        return 0;
                    });
                }
                // 分页
                if (options.offset !== undefined || options.limit !== undefined) {
                    offset = options.offset || 0;
                    limit = options.limit !== undefined ? options.limit : result.length;
                    result = result.slice(offset, offset + limit);
                }
                return [2 /*return*/, result];
            });
        });
    };
    /**
     * 创建关系实现
     */
    MemoryKnowledgeGraphService.prototype.createRelationshipImplementation = function (relationship) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.relationships.set(relationship.id, relationship);
                return [2 /*return*/, relationship];
            });
        });
    };
    /**
     * 批量创建关系实现
     */
    MemoryKnowledgeGraphService.prototype.createRelationshipsImplementation = function (relationships) {
        return __awaiter(this, void 0, void 0, function () {
            var relationships_1, relationships_1_1, relationship;
            var e_5, _a;
            return __generator(this, function (_b) {
                try {
                    for (relationships_1 = __values(relationships), relationships_1_1 = relationships_1.next(); !relationships_1_1.done; relationships_1_1 = relationships_1.next()) {
                        relationship = relationships_1_1.value;
                        this.relationships.set(relationship.id, relationship);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (relationships_1_1 && !relationships_1_1.done && (_a = relationships_1.return)) _a.call(relationships_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                return [2 /*return*/, relationships];
            });
        });
    };
    /**
     * 获取关系实现
     */
    MemoryKnowledgeGraphService.prototype.getRelationshipImplementation = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.relationships.get(id) || null];
            });
        });
    };
    /**
     * 更新关系实现
     */
    MemoryKnowledgeGraphService.prototype.updateRelationshipImplementation = function (id, relationship) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.relationships.has(id)) {
                    return [2 /*return*/, null];
                }
                this.relationships.set(id, relationship);
                return [2 /*return*/, relationship];
            });
        });
    };
    /**
     * 删除关系实现
     */
    MemoryKnowledgeGraphService.prototype.deleteRelationshipImplementation = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.relationships.delete(id)];
            });
        });
    };
    /**
     * 查询关系实现
     */
    MemoryKnowledgeGraphService.prototype.queryRelationshipsImplementation = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var result, orderDirection, orderMultiplier_2, offset, limit;
            return __generator(this, function (_a) {
                result = Array.from(this.relationships.values());
                // 按类型过滤
                if (options.types && options.types.length > 0) {
                    result = result.filter(function (rel) { return options.types.includes(rel.type); });
                }
                // 按标签过滤
                if (options.labels && options.labels.length > 0) {
                    result = result.filter(function (rel) { return options.labels.includes(rel.label); });
                }
                // 按源节点ID过滤
                if (options.sourceNodeIds && options.sourceNodeIds.length > 0) {
                    result = result.filter(function (rel) { return options.sourceNodeIds.includes(rel.sourceNodeId); });
                }
                // 按目标节点ID过滤
                if (options.targetNodeIds && options.targetNodeIds.length > 0) {
                    result = result.filter(function (rel) { return options.targetNodeIds.includes(rel.targetNodeId); });
                }
                // 按属性过滤
                if (options.properties) {
                    result = result.filter(function (rel) {
                        var e_6, _a;
                        try {
                            for (var _b = __values(Object.entries(options.properties)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                                // 如果关系没有该属性或属性值不匹配
                                if (rel.properties[key] === undefined || rel.properties[key] !== value) {
                                    return false;
                                }
                            }
                        }
                        catch (e_6_1) { e_6 = { error: e_6_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            }
                            finally { if (e_6) throw e_6.error; }
                        }
                        return true;
                    });
                }
                // 排序
                if (options.orderBy) {
                    orderDirection = options.orderDirection || 'ASC';
                    orderMultiplier_2 = orderDirection === 'ASC' ? 1 : -1;
                    result.sort(function (a, b) {
                        var valueA;
                        var valueB;
                        // 特殊字段处理
                        if (options.orderBy === 'createdAt' || options.orderBy === 'updatedAt') {
                            valueA = a[options.orderBy].getTime();
                            valueB = b[options.orderBy].getTime();
                        }
                        else if (['id', 'type', 'label', 'sourceNodeId', 'targetNodeId'].includes(options.orderBy)) {
                            valueA = a[options.orderBy];
                            valueB = b[options.orderBy];
                        }
                        else {
                            // 属性字段
                            valueA = a.properties[options.orderBy];
                            valueB = b.properties[options.orderBy];
                        }
                        // 排序比较
                        if (valueA === undefined && valueB === undefined)
                            return 0;
                        if (valueA === undefined)
                            return orderMultiplier_2 * -1;
                        if (valueB === undefined)
                            return orderMultiplier_2 * 1;
                        // 使用类型守卫确保类型安全的比较
                        if (typeof valueA === 'number' && typeof valueB === 'number') {
                            return orderMultiplier_2 * (valueA - valueB);
                        }
                        else if (typeof valueA === 'string' && typeof valueB === 'string') {
                            return orderMultiplier_2 * valueA.localeCompare(valueB);
                        }
                        else if (valueA instanceof Date && valueB instanceof Date) {
                            return orderMultiplier_2 * (valueA.getTime() - valueB.getTime());
                        }
                        else if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
                            return orderMultiplier_2 * (valueA === valueB ? 0 : valueA ? 1 : -1);
                        }
                        else {
                            // 转换为字符串进行比较，确保安全
                            var strA = String(valueA);
                            var strB = String(valueB);
                            return orderMultiplier_2 * strA.localeCompare(strB);
                        }
                        return 0;
                    });
                }
                // 分页
                if (options.offset !== undefined || options.limit !== undefined) {
                    offset = options.offset || 0;
                    limit = options.limit !== undefined ? options.limit : result.length;
                    result = result.slice(offset, offset + limit);
                }
                return [2 /*return*/, result];
            });
        });
    };
    /**
     * 向量搜索实现
     */
    MemoryKnowledgeGraphService.prototype.vectorSearchImplementation = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var nodes, results;
            return __generator(this, function (_a) {
                if (!this.config.enableVectorSearch) {
                    throw new Error('Vector search is not enabled for this service');
                }
                nodes = Array.from(this.nodes.values()).filter(function (node) { return node.vector !== undefined; });
                // 按节点类型过滤
                if (options.nodeTypes && options.nodeTypes.length > 0) {
                    nodes = nodes.filter(function (node) { return options.nodeTypes.includes(node.type); });
                }
                results = nodes.map(function (node) { return ({
                    node: node,
                    similarity: cosineSimilarity(options.vector, node.vector)
                }); });
                // 按相似度排序（降序）
                results.sort(function (a, b) { return b.similarity - a.similarity; });
                // 应用最小相似度过滤
                if (options.minSimilarity !== undefined) {
                    return [2 /*return*/, results.filter(function (result) { return result.similarity >= options.minSimilarity; })];
                }
                // 应用结果限制
                if (options.limit !== undefined) {
                    return [2 /*return*/, results.slice(0, options.limit)];
                }
                return [2 /*return*/, results];
            });
        });
    };
    /**
     * 图遍历实现
     */
    MemoryKnowledgeGraphService.prototype.traverseGraphImplementation = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var startNode, maxDepth, limit, direction, visitedNodeIds, resultNodes, resultRelationships, resultPaths, queue, _loop_1, this_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getNode(options.startNodeId)];
                    case 1:
                        startNode = _a.sent();
                        if (!startNode) {
                            throw new Error("Start node with ID ".concat(options.startNodeId, " does not exist"));
                        }
                        maxDepth = options.maxDepth !== undefined ? options.maxDepth : 3;
                        limit = options.limit !== undefined ? options.limit : 100;
                        direction = options.direction || 'BOTH';
                        visitedNodeIds = new Set([options.startNodeId]);
                        resultNodes = [startNode];
                        resultRelationships = [];
                        resultPaths = [];
                        queue = [{
                                nodeId: options.startNodeId,
                                depth: 0,
                                path: {
                                    nodes: [startNode],
                                    relationships: []
                                }
                            }];
                        _loop_1 = function () {
                            var current, relationships, outgoing, incoming, relationships_2, relationships_2_1, relationship, nextNodeId, nextNode, newPath, e_7_1;
                            var e_7, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        current = queue.shift();
                                        // 如果已达到最大深度，不再继续
                                        if (current.depth >= maxDepth) {
                                            return [2 /*return*/, "continue"];
                                        }
                                        relationships = [];
                                        if (direction === 'OUTGOING' || direction === 'BOTH') {
                                            outgoing = Array.from(this_1.relationships.values())
                                                .filter(function (rel) { return rel.sourceNodeId === current.nodeId; });
                                            relationships = relationships.concat(outgoing);
                                        }
                                        if (direction === 'INCOMING' || direction === 'BOTH') {
                                            incoming = Array.from(this_1.relationships.values())
                                                .filter(function (rel) { return rel.targetNodeId === current.nodeId; });
                                            relationships = relationships.concat(incoming);
                                        }
                                        // 按关系类型过滤
                                        if (options.relationshipTypes && options.relationshipTypes.length > 0) {
                                            relationships = relationships.filter(function (rel) {
                                                return options.relationshipTypes.includes(rel.type);
                                            });
                                        }
                                        _c.label = 1;
                                    case 1:
                                        _c.trys.push([1, 6, 7, 8]);
                                        relationships_2 = (e_7 = void 0, __values(relationships)), relationships_2_1 = relationships_2.next();
                                        _c.label = 2;
                                    case 2:
                                        if (!!relationships_2_1.done) return [3 /*break*/, 5];
                                        relationship = relationships_2_1.value;
                                        nextNodeId = relationship.sourceNodeId === current.nodeId
                                            ? relationship.targetNodeId
                                            : relationship.sourceNodeId;
                                        // 如果已访问过该节点，跳过
                                        if (visitedNodeIds.has(nextNodeId)) {
                                            return [3 /*break*/, 4];
                                        }
                                        return [4 /*yield*/, this_1.getNode(nextNodeId)];
                                    case 3:
                                        nextNode = _c.sent();
                                        if (!nextNode) {
                                            return [3 /*break*/, 4];
                                        }
                                        // 按节点类型过滤
                                        if (options.nodeTypes && options.nodeTypes.length > 0 && !options.nodeTypes.includes(nextNode.type)) {
                                            return [3 /*break*/, 4];
                                        }
                                        // 添加到结果集
                                        visitedNodeIds.add(nextNodeId);
                                        resultNodes.push(nextNode);
                                        resultRelationships.push(relationship);
                                        newPath = {
                                            nodes: __spreadArray(__spreadArray([], __read(current.path.nodes), false), [nextNode], false),
                                            relationships: __spreadArray(__spreadArray([], __read(current.path.relationships), false), [relationship], false)
                                        };
                                        // 添加路径到结果集
                                        resultPaths.push({
                                            nodes: newPath.nodes,
                                            relationships: newPath.relationships,
                                            length: newPath.relationships.length
                                        });
                                        // 添加到队列继续遍历
                                        queue.push({
                                            nodeId: nextNodeId,
                                            depth: current.depth + 1,
                                            path: newPath
                                        });
                                        _c.label = 4;
                                    case 4:
                                        relationships_2_1 = relationships_2.next();
                                        return [3 /*break*/, 2];
                                    case 5: return [3 /*break*/, 8];
                                    case 6:
                                        e_7_1 = _c.sent();
                                        e_7 = { error: e_7_1 };
                                        return [3 /*break*/, 8];
                                    case 7:
                                        try {
                                            if (relationships_2_1 && !relationships_2_1.done && (_b = relationships_2.return)) _b.call(relationships_2);
                                        }
                                        finally { if (e_7) throw e_7.error; }
                                        return [7 /*endfinally*/];
                                    case 8: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _a.label = 2;
                    case 2:
                        if (!(queue.length > 0 && resultNodes.length < limit)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 2];
                    case 4: return [2 /*return*/, {
                            nodes: resultNodes,
                            relationships: resultRelationships,
                            paths: resultPaths
                        }];
                }
            });
        });
    };
    /**
     * 查找最短路径实现
     */
    MemoryKnowledgeGraphService.prototype.findShortestPathImplementation = function (startNodeId_1, endNodeId_1, relationshipTypes_1) {
        return __awaiter(this, arguments, void 0, function (startNodeId, endNodeId, relationshipTypes, maxDepth) {
            var startNode, endNode, visited, queue, _loop_2, this_2, state_1;
            if (maxDepth === void 0) { maxDepth = 5; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getNode(startNodeId)];
                    case 1:
                        startNode = _a.sent();
                        return [4 /*yield*/, this.getNode(endNodeId)];
                    case 2:
                        endNode = _a.sent();
                        if (!startNode) {
                            throw new Error("Start node with ID ".concat(startNodeId, " does not exist"));
                        }
                        if (!endNode) {
                            throw new Error("End node with ID ".concat(endNodeId, " does not exist"));
                        }
                        // 如果起始节点和结束节点相同，返回只包含该节点的路径
                        if (startNodeId === endNodeId) {
                            return [2 /*return*/, {
                                    nodes: [startNode],
                                    relationships: [],
                                    length: 0
                                }];
                        }
                        visited = new Set([startNodeId]);
                        queue = [{
                                nodeId: startNodeId,
                                path: {
                                    nodes: [startNode],
                                    relationships: []
                                }
                            }];
                        _loop_2 = function () {
                            var current, relationships, relationships_3, relationships_3_1, relationship, nextNodeId, nextNode, newPath, e_8_1;
                            var e_8, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        current = queue.shift();
                                        // 如果已达到最大深度，不再继续
                                        if (current.path.relationships.length >= maxDepth) {
                                            return [2 /*return*/, "continue"];
                                        }
                                        relationships = Array.from(this_2.relationships.values())
                                            .filter(function (rel) { return rel.sourceNodeId === current.nodeId || rel.targetNodeId === current.nodeId; });
                                        // 按关系类型过滤
                                        if (relationshipTypes && relationshipTypes.length > 0) {
                                            relationships = relationships.filter(function (rel) { return relationshipTypes.includes(rel.type); });
                                        }
                                        _c.label = 1;
                                    case 1:
                                        _c.trys.push([1, 6, 7, 8]);
                                        relationships_3 = (e_8 = void 0, __values(relationships)), relationships_3_1 = relationships_3.next();
                                        _c.label = 2;
                                    case 2:
                                        if (!!relationships_3_1.done) return [3 /*break*/, 5];
                                        relationship = relationships_3_1.value;
                                        nextNodeId = relationship.sourceNodeId === current.nodeId
                                            ? relationship.targetNodeId
                                            : relationship.sourceNodeId;
                                        // 如果已访问过该节点，跳过
                                        if (visited.has(nextNodeId)) {
                                            return [3 /*break*/, 4];
                                        }
                                        return [4 /*yield*/, this_2.getNode(nextNodeId)];
                                    case 3:
                                        nextNode = _c.sent();
                                        if (!nextNode) {
                                            return [3 /*break*/, 4];
                                        }
                                        newPath = {
                                            nodes: __spreadArray(__spreadArray([], __read(current.path.nodes), false), [nextNode], false),
                                            relationships: __spreadArray(__spreadArray([], __read(current.path.relationships), false), [relationship], false)
                                        };
                                        // 如果找到结束节点，返回路径
                                        if (nextNodeId === endNodeId) {
                                            return [2 /*return*/, { value: {
                                                        nodes: newPath.nodes,
                                                        relationships: newPath.relationships,
                                                        length: newPath.relationships.length
                                                    } }];
                                        }
                                        // 标记为已访问
                                        visited.add(nextNodeId);
                                        // 添加到队列继续搜索
                                        queue.push({
                                            nodeId: nextNodeId,
                                            path: newPath
                                        });
                                        _c.label = 4;
                                    case 4:
                                        relationships_3_1 = relationships_3.next();
                                        return [3 /*break*/, 2];
                                    case 5: return [3 /*break*/, 8];
                                    case 6:
                                        e_8_1 = _c.sent();
                                        e_8 = { error: e_8_1 };
                                        return [3 /*break*/, 8];
                                    case 7:
                                        try {
                                            if (relationships_3_1 && !relationships_3_1.done && (_b = relationships_3.return)) _b.call(relationships_3);
                                        }
                                        finally { if (e_8) throw e_8.error; }
                                        return [7 /*endfinally*/];
                                    case 8: return [2 /*return*/];
                                }
                            });
                        };
                        this_2 = this;
                        _a.label = 3;
                    case 3:
                        if (!(queue.length > 0)) return [3 /*break*/, 5];
                        return [5 /*yield**/, _loop_2()];
                    case 4:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        return [3 /*break*/, 3];
                    case 5: 
                    // 未找到路径
                    return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * 查找所有路径实现
     */
    MemoryKnowledgeGraphService.prototype.findAllPathsImplementation = function (startNodeId_1, endNodeId_1, relationshipTypes_1) {
        return __awaiter(this, arguments, void 0, function (startNodeId, endNodeId, relationshipTypes, maxDepth) {
            var startNode, endNode, resultPaths, dfs;
            var _this = this;
            if (maxDepth === void 0) { maxDepth = 3; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getNode(startNodeId)];
                    case 1:
                        startNode = _a.sent();
                        return [4 /*yield*/, this.getNode(endNodeId)];
                    case 2:
                        endNode = _a.sent();
                        if (!startNode) {
                            throw new Error("Start node with ID ".concat(startNodeId, " does not exist"));
                        }
                        if (!endNode) {
                            throw new Error("End node with ID ".concat(endNodeId, " does not exist"));
                        }
                        // 如果起始节点和结束节点相同，返回只包含该节点的路径
                        if (startNodeId === endNodeId) {
                            return [2 /*return*/, [{
                                        nodes: [startNode],
                                        relationships: [],
                                        length: 0
                                    }]];
                        }
                        resultPaths = [];
                        dfs = function (currentNodeId, currentPath, visited) { return __awaiter(_this, void 0, void 0, function () {
                            var relationships, relationships_4, relationships_4_1, relationship, nextNodeId, nextNode, newPath, newVisited, e_9_1;
                            var e_9, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        // 如果已达到最大深度，不再继续
                                        if (currentPath.relationships.length >= maxDepth) {
                                            return [2 /*return*/];
                                        }
                                        relationships = Array.from(this.relationships.values())
                                            .filter(function (rel) { return rel.sourceNodeId === currentNodeId || rel.targetNodeId === currentNodeId; });
                                        // 按关系类型过滤
                                        if (relationshipTypes && relationshipTypes.length > 0) {
                                            relationships = relationships.filter(function (rel) { return relationshipTypes.includes(rel.type); });
                                        }
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 7, 8, 9]);
                                        relationships_4 = __values(relationships), relationships_4_1 = relationships_4.next();
                                        _b.label = 2;
                                    case 2:
                                        if (!!relationships_4_1.done) return [3 /*break*/, 6];
                                        relationship = relationships_4_1.value;
                                        nextNodeId = relationship.sourceNodeId === currentNodeId
                                            ? relationship.targetNodeId
                                            : relationship.sourceNodeId;
                                        // 如果已访问过该节点，跳过
                                        if (visited.has(nextNodeId)) {
                                            return [3 /*break*/, 5];
                                        }
                                        return [4 /*yield*/, this.getNode(nextNodeId)];
                                    case 3:
                                        nextNode = _b.sent();
                                        if (!nextNode) {
                                            return [3 /*break*/, 5];
                                        }
                                        newPath = {
                                            nodes: __spreadArray(__spreadArray([], __read(currentPath.nodes), false), [nextNode], false),
                                            relationships: __spreadArray(__spreadArray([], __read(currentPath.relationships), false), [relationship], false)
                                        };
                                        // 如果找到结束节点，添加到结果路径
                                        if (nextNodeId === endNodeId) {
                                            resultPaths.push({
                                                nodes: newPath.nodes,
                                                relationships: newPath.relationships,
                                                length: newPath.relationships.length
                                            });
                                            return [3 /*break*/, 5]; // 不再继续搜索
                                        }
                                        newVisited = new Set(visited);
                                        newVisited.add(nextNodeId);
                                        // 继续深度搜索
                                        return [4 /*yield*/, dfs(nextNodeId, newPath, newVisited)];
                                    case 4:
                                        // 继续深度搜索
                                        _b.sent();
                                        _b.label = 5;
                                    case 5:
                                        relationships_4_1 = relationships_4.next();
                                        return [3 /*break*/, 2];
                                    case 6: return [3 /*break*/, 9];
                                    case 7:
                                        e_9_1 = _b.sent();
                                        e_9 = { error: e_9_1 };
                                        return [3 /*break*/, 9];
                                    case 8:
                                        try {
                                            if (relationships_4_1 && !relationships_4_1.done && (_a = relationships_4.return)) _a.call(relationships_4);
                                        }
                                        finally { if (e_9) throw e_9.error; }
                                        return [7 /*endfinally*/];
                                    case 9: return [2 /*return*/];
                                }
                            });
                        }); };
                        // 开始深度优先搜索
                        return [4 /*yield*/, dfs(startNodeId, { nodes: [startNode], relationships: [] }, new Set([startNodeId]))];
                    case 3:
                        // 开始深度优先搜索
                        _a.sent();
                        // 按路径长度排序
                        resultPaths.sort(function (a, b) { return a.length - b.length; });
                        return [2 /*return*/, resultPaths];
                }
            });
        });
    };
    /**
     * 获取图谱统计信息实现
     */
    MemoryKnowledgeGraphService.prototype.getGraphStatsImplementation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var nodeCount, relationshipCount, nodeTypeCounts, _a, _b, node, relationshipTypeCounts, _c, _d, relationship;
            var e_10, _e, e_11, _f;
            return __generator(this, function (_g) {
                nodeCount = this.nodes.size;
                relationshipCount = this.relationships.size;
                nodeTypeCounts = {};
                try {
                    for (_a = __values(this.nodes.values()), _b = _a.next(); !_b.done; _b = _a.next()) {
                        node = _b.value;
                        nodeTypeCounts[node.type] = (nodeTypeCounts[node.type] || 0) + 1;
                    }
                }
                catch (e_10_1) { e_10 = { error: e_10_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                    }
                    finally { if (e_10) throw e_10.error; }
                }
                relationshipTypeCounts = {};
                try {
                    for (_c = __values(this.relationships.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
                        relationship = _d.value;
                        relationshipTypeCounts[relationship.type] = (relationshipTypeCounts[relationship.type] || 0) + 1;
                    }
                }
                catch (e_11_1) { e_11 = { error: e_11_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_f = _c.return)) _f.call(_c);
                    }
                    finally { if (e_11) throw e_11.error; }
                }
                return [2 /*return*/, {
                        nodeCount: nodeCount,
                        relationshipCount: relationshipCount,
                        nodeTypeCounts: nodeTypeCounts,
                        relationshipTypeCounts: relationshipTypeCounts
                    }];
            });
        });
    };
    /**
     * 清空图谱实现
     */
    MemoryKnowledgeGraphService.prototype.clearGraphImplementation = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.nodes.clear();
                this.relationships.clear();
                return [2 /*return*/, true];
            });
        });
    };
    /**
     * 导出图谱实现
     */
    MemoryKnowledgeGraphService.prototype.exportGraphImplementation = function (format, path) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (format) {
                    case 'JSON':
                        return [2 /*return*/, this.exportToJson(path)];
                    case 'CSV':
                        return [2 /*return*/, this.exportToCsv(path)];
                    case 'GRAPHML':
                        return [2 /*return*/, this.exportToGraphML(path)];
                    default:
                        throw new Error("Unsupported export format: ".concat(format));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 导入图谱实现
     */
    MemoryKnowledgeGraphService.prototype.importGraphImplementation = function (format, path, mergeStrategy) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
                return [2 /*return*/];
            });
        });
    };
    /**
     * 从文件加载知识图谱
     */
    MemoryKnowledgeGraphService.prototype.loadFromFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var readFile, data, _a, nodes, relationships, nodes_2, nodes_2_1, node, relationships_5, relationships_5_1, relationship, error_3;
            var e_12, _b, e_13, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        readFile = (0, util_1.promisify)(fs.readFile);
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        // 检查文件是否存在
                        if (!fs.existsSync(this.memoryConfig.persistFilePath)) {
                            console.info("Knowledge graph file does not exist: ".concat(this.memoryConfig.persistFilePath));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, readFile(this.memoryConfig.persistFilePath, 'utf8')];
                    case 2:
                        data = _d.sent();
                        _a = JSON.parse(data), nodes = _a.nodes, relationships = _a.relationships;
                        // 清空当前图谱
                        this.nodes.clear();
                        this.relationships.clear();
                        try {
                            // 加载节点
                            for (nodes_2 = __values(nodes), nodes_2_1 = nodes_2.next(); !nodes_2_1.done; nodes_2_1 = nodes_2.next()) {
                                node = nodes_2_1.value;
                                // 转换日期字符串为Date对象
                                node.createdAt = new Date(node.createdAt);
                                node.updatedAt = new Date(node.updatedAt);
                                this.nodes.set(node.id, node);
                            }
                        }
                        catch (e_12_1) { e_12 = { error: e_12_1 }; }
                        finally {
                            try {
                                if (nodes_2_1 && !nodes_2_1.done && (_b = nodes_2.return)) _b.call(nodes_2);
                            }
                            finally { if (e_12) throw e_12.error; }
                        }
                        try {
                            // 加载关系
                            for (relationships_5 = __values(relationships), relationships_5_1 = relationships_5.next(); !relationships_5_1.done; relationships_5_1 = relationships_5.next()) {
                                relationship = relationships_5_1.value;
                                // 转换日期字符串为Date对象
                                relationship.createdAt = new Date(relationship.createdAt);
                                relationship.updatedAt = new Date(relationship.updatedAt);
                                this.relationships.set(relationship.id, relationship);
                            }
                        }
                        catch (e_13_1) { e_13 = { error: e_13_1 }; }
                        finally {
                            try {
                                if (relationships_5_1 && !relationships_5_1.done && (_c = relationships_5.return)) _c.call(relationships_5);
                            }
                            finally { if (e_13) throw e_13.error; }
                        }
                        console.info("Loaded knowledge graph from ".concat(this.memoryConfig.persistFilePath, ": ").concat(nodes.length, " nodes, ").concat(relationships.length, " relationships"));
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _d.sent();
                        console.error('Failed to load knowledge graph from file:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 保存知识图谱到文件
     */
    MemoryKnowledgeGraphService.prototype.saveToFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var writeFile, mkdir, dir, data, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        writeFile = (0, util_1.promisify)(fs.writeFile);
                        mkdir = (0, util_1.promisify)(fs.mkdir);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        dir = path.dirname(this.memoryConfig.persistFilePath);
                        if (!!fs.existsSync(dir)) return [3 /*break*/, 3];
                        return [4 /*yield*/, mkdir(dir, { recursive: true })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        data = {
                            nodes: Array.from(this.nodes.values()),
                            relationships: Array.from(this.relationships.values())
                        };
                        // 写入文件
                        return [4 /*yield*/, writeFile(this.memoryConfig.persistFilePath, JSON.stringify(data, null, 2), 'utf8')];
                    case 4:
                        // 写入文件
                        _a.sent();
                        console.info("Saved knowledge graph to ".concat(this.memoryConfig.persistFilePath, ": ").concat(this.nodes.size, " nodes, ").concat(this.relationships.size, " relationships"));
                        return [3 /*break*/, 6];
                    case 5:
                        error_4 = _a.sent();
                        console.error('Failed to save knowledge graph to file:', error_4);
                        throw error_4;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 导出为JSON格式
     */
    MemoryKnowledgeGraphService.prototype.exportToJson = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var writeFile, mkdir, dir, data, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        writeFile = (0, util_1.promisify)(fs.writeFile);
                        mkdir = (0, util_1.promisify)(fs.mkdir);
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
                            nodes: Array.from(this.nodes.values()),
                            relationships: Array.from(this.relationships.values())
                        };
                        // 写入文件
                        return [4 /*yield*/, writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')];
                    case 4:
                        // 写入文件
                        _a.sent();
                        console.info("Exported knowledge graph to JSON: ".concat(filePath));
                        return [2 /*return*/, true];
                    case 5:
                        error_5 = _a.sent();
                        console.error('Failed to export knowledge graph to JSON:', error_5);
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 导出为CSV格式
     */
    MemoryKnowledgeGraphService.prototype.exportToCsv = function (dirPath) {
        return __awaiter(this, void 0, void 0, function () {
            var writeFile, mkdir, nodesPath, nodesContent, _a, _b, node, relationshipsPath, relationshipsContent, _c, _d, relationship, error_6;
            var e_14, _e, e_15, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        writeFile = (0, util_1.promisify)(fs.writeFile);
                        mkdir = (0, util_1.promisify)(fs.mkdir);
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 6, , 7]);
                        if (!!fs.existsSync(dirPath)) return [3 /*break*/, 3];
                        return [4 /*yield*/, mkdir(dirPath, { recursive: true })];
                    case 2:
                        _g.sent();
                        _g.label = 3;
                    case 3:
                        nodesPath = path.join(dirPath, 'nodes.csv');
                        nodesContent = 'id,type,label,createdAt,updatedAt,properties\n';
                        try {
                            for (_a = __values(this.nodes.values()), _b = _a.next(); !_b.done; _b = _a.next()) {
                                node = _b.value;
                                nodesContent += "\"".concat(node.id, "\",\"").concat(node.type, "\",\"").concat(node.label, "\",\"").concat(node.createdAt.toISOString(), "\",\"").concat(node.updatedAt.toISOString(), "\",\"").concat(JSON.stringify(node.properties).replace(/"/g, '""'), "\"\n");
                            }
                        }
                        catch (e_14_1) { e_14 = { error: e_14_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                            }
                            finally { if (e_14) throw e_14.error; }
                        }
                        return [4 /*yield*/, writeFile(nodesPath, nodesContent, 'utf8')];
                    case 4:
                        _g.sent();
                        relationshipsPath = path.join(dirPath, 'relationships.csv');
                        relationshipsContent = 'id,type,label,sourceNodeId,targetNodeId,createdAt,updatedAt,properties\n';
                        try {
                            for (_c = __values(this.relationships.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
                                relationship = _d.value;
                                relationshipsContent += "\"".concat(relationship.id, "\",\"").concat(relationship.type, "\",\"").concat(relationship.label, "\",\"").concat(relationship.sourceNodeId, "\",\"").concat(relationship.targetNodeId, "\",\"").concat(relationship.createdAt.toISOString(), "\",\"").concat(relationship.updatedAt.toISOString(), "\",\"").concat(JSON.stringify(relationship.properties).replace(/"/g, '""'), "\"\n");
                            }
                        }
                        catch (e_15_1) { e_15 = { error: e_15_1 }; }
                        finally {
                            try {
                                if (_d && !_d.done && (_f = _c.return)) _f.call(_c);
                            }
                            finally { if (e_15) throw e_15.error; }
                        }
                        return [4 /*yield*/, writeFile(relationshipsPath, relationshipsContent, 'utf8')];
                    case 5:
                        _g.sent();
                        console.info("Exported knowledge graph to CSV: ".concat(dirPath));
                        return [2 /*return*/, true];
                    case 6:
                        error_6 = _g.sent();
                        console.error('Failed to export knowledge graph to CSV:', error_6);
                        return [2 /*return*/, false];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 导出为GraphML格式
     */
    MemoryKnowledgeGraphService.prototype.exportToGraphML = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var writeFile, mkdir, dir, content, _a, _b, node, _c, _d, relationship, error_7;
            var e_16, _e, e_17, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        writeFile = (0, util_1.promisify)(fs.writeFile);
                        mkdir = (0, util_1.promisify)(fs.mkdir);
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 5, , 6]);
                        dir = path.dirname(filePath);
                        if (!!fs.existsSync(dir)) return [3 /*break*/, 3];
                        return [4 /*yield*/, mkdir(dir, { recursive: true })];
                    case 2:
                        _g.sent();
                        _g.label = 3;
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
                            for (_a = __values(this.nodes.values()), _b = _a.next(); !_b.done; _b = _a.next()) {
                                node = _b.value;
                                content += "    <node id=\"".concat(node.id, "\">\n");
                                content += "      <data key=\"type\">".concat(node.type, "</data>\n");
                                content += "      <data key=\"label\">".concat(node.label, "</data>\n");
                                content += "      <data key=\"properties\">".concat(JSON.stringify(node.properties).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'), "</data>\n");
                                content += "      <data key=\"createdAt\">".concat(node.createdAt.toISOString(), "</data>\n");
                                content += "      <data key=\"updatedAt\">".concat(node.updatedAt.toISOString(), "</data>\n");
                                content += '    </node>\n';
                            }
                        }
                        catch (e_16_1) { e_16 = { error: e_16_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                            }
                            finally { if (e_16) throw e_16.error; }
                        }
                        try {
                            // 关系
                            for (_c = __values(this.relationships.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
                                relationship = _d.value;
                                content += "    <edge id=\"".concat(relationship.id, "\" source=\"").concat(relationship.sourceNodeId, "\" target=\"").concat(relationship.targetNodeId, "\">\n");
                                content += "      <data key=\"type\">".concat(relationship.type, "</data>\n");
                                content += "      <data key=\"label\">".concat(relationship.label, "</data>\n");
                                content += "      <data key=\"properties\">".concat(JSON.stringify(relationship.properties).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'), "</data>\n");
                                content += "      <data key=\"createdAt\">".concat(relationship.createdAt.toISOString(), "</data>\n");
                                content += "      <data key=\"updatedAt\">".concat(relationship.updatedAt.toISOString(), "</data>\n");
                                content += '    </edge>\n';
                            }
                        }
                        catch (e_17_1) { e_17 = { error: e_17_1 }; }
                        finally {
                            try {
                                if (_d && !_d.done && (_f = _c.return)) _f.call(_c);
                            }
                            finally { if (e_17) throw e_17.error; }
                        }
                        // 结束标签
                        content += '  </graph>\n';
                        content += '</graphml>';
                        // 写入文件
                        return [4 /*yield*/, writeFile(filePath, content, 'utf8')];
                    case 4:
                        // 写入文件
                        _g.sent();
                        console.info("Exported knowledge graph to GraphML: ".concat(filePath));
                        return [2 /*return*/, true];
                    case 5:
                        error_7 = _g.sent();
                        console.error('Failed to export knowledge graph to GraphML:', error_7);
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 从JSON导入
     */
    MemoryKnowledgeGraphService.prototype.importFromJson = function (filePath, mergeStrategy) {
        return __awaiter(this, void 0, void 0, function () {
            var readFile, data, _a, nodes, relationships, nodes_3, nodes_3_1, node, relationships_6, relationships_6_1, relationship, error_8;
            var e_18, _b, e_19, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        readFile = (0, util_1.promisify)(fs.readFile);
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        // 检查文件是否存在
                        if (!fs.existsSync(filePath)) {
                            throw new Error("File does not exist: ".concat(filePath));
                        }
                        return [4 /*yield*/, readFile(filePath, 'utf8')];
                    case 2:
                        data = _d.sent();
                        _a = JSON.parse(data), nodes = _a.nodes, relationships = _a.relationships;
                        // 根据合并策略处理
                        if (mergeStrategy === 'REPLACE') {
                            // 清空当前图谱
                            this.nodes.clear();
                            this.relationships.clear();
                        }
                        try {
                            // 导入节点
                            for (nodes_3 = __values(nodes), nodes_3_1 = nodes_3.next(); !nodes_3_1.done; nodes_3_1 = nodes_3.next()) {
                                node = nodes_3_1.value;
                                // 转换日期字符串为Date对象
                                node.createdAt = new Date(node.createdAt);
                                node.updatedAt = new Date(node.updatedAt);
                                if (mergeStrategy === 'SKIP_DUPLICATES' && this.nodes.has(node.id)) {
                                    continue;
                                }
                                this.nodes.set(node.id, node);
                            }
                        }
                        catch (e_18_1) { e_18 = { error: e_18_1 }; }
                        finally {
                            try {
                                if (nodes_3_1 && !nodes_3_1.done && (_b = nodes_3.return)) _b.call(nodes_3);
                            }
                            finally { if (e_18) throw e_18.error; }
                        }
                        try {
                            // 导入关系
                            for (relationships_6 = __values(relationships), relationships_6_1 = relationships_6.next(); !relationships_6_1.done; relationships_6_1 = relationships_6.next()) {
                                relationship = relationships_6_1.value;
                                // 转换日期字符串为Date对象
                                relationship.createdAt = new Date(relationship.createdAt);
                                relationship.updatedAt = new Date(relationship.updatedAt);
                                if (mergeStrategy === 'SKIP_DUPLICATES' && this.relationships.has(relationship.id)) {
                                    continue;
                                }
                                // 验证源节点和目标节点是否存在
                                if (!this.nodes.has(relationship.sourceNodeId) || !this.nodes.has(relationship.targetNodeId)) {
                                    console.warn("Skipping relationship ".concat(relationship.id, " due to missing source or target node"));
                                    continue;
                                }
                                this.relationships.set(relationship.id, relationship);
                            }
                        }
                        catch (e_19_1) { e_19 = { error: e_19_1 }; }
                        finally {
                            try {
                                if (relationships_6_1 && !relationships_6_1.done && (_c = relationships_6.return)) _c.call(relationships_6);
                            }
                            finally { if (e_19) throw e_19.error; }
                        }
                        console.info("Imported knowledge graph from JSON: ".concat(filePath));
                        return [2 /*return*/, true];
                    case 3:
                        error_8 = _d.sent();
                        console.error('Failed to import knowledge graph from JSON:', error_8);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 从CSV导入
     */
    MemoryKnowledgeGraphService.prototype.importFromCsv = function (dirPath, mergeStrategy) {
        return __awaiter(this, void 0, void 0, function () {
            var readFile, nodesPath, relationshipsPath, nodesData, nodesLines, i, line, parts, id, type, label, createdAt, updatedAt, properties, node, relationshipsData, relationshipsLines, i, line, parts, id, type, label, sourceNodeId, targetNodeId, createdAt, updatedAt, properties, relationship, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        readFile = (0, util_1.promisify)(fs.readFile);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        // 检查目录是否存在
                        if (!fs.existsSync(dirPath)) {
                            throw new Error("Directory does not exist: ".concat(dirPath));
                        }
                        nodesPath = path.join(dirPath, 'nodes.csv');
                        relationshipsPath = path.join(dirPath, 'relationships.csv');
                        // 检查文件是否存在
                        if (!fs.existsSync(nodesPath) || !fs.existsSync(relationshipsPath)) {
                            throw new Error("Required CSV files not found in directory: ".concat(dirPath));
                        }
                        // 根据合并策略处理
                        if (mergeStrategy === 'REPLACE') {
                            // 清空当前图谱
                            this.nodes.clear();
                            this.relationships.clear();
                        }
                        return [4 /*yield*/, readFile(nodesPath, 'utf8')];
                    case 2:
                        nodesData = _a.sent();
                        nodesLines = nodesData.split('\n');
                        // 跳过标题行
                        for (i = 1; i < nodesLines.length; i++) {
                            line = nodesLines[i].trim();
                            if (!line)
                                continue;
                            parts = line.match(/"([^"]*)"|([^,]+)/g);
                            if (!parts || parts.length < 6)
                                continue;
                            id = parts[0].replace(/"/g, '');
                            type = parts[1].replace(/"/g, '');
                            label = parts[2].replace(/"/g, '');
                            createdAt = new Date(parts[3].replace(/"/g, ''));
                            updatedAt = new Date(parts[4].replace(/"/g, ''));
                            properties = JSON.parse(parts[5].replace(/""/g, '"').replace(/^"|"$/g, ''));
                            node = {
                                id: id,
                                type: type,
                                label: label,
                                properties: properties,
                                createdAt: createdAt,
                                updatedAt: updatedAt
                            };
                            if (mergeStrategy === 'SKIP_DUPLICATES' && this.nodes.has(id)) {
                                continue;
                            }
                            this.nodes.set(id, node);
                        }
                        return [4 /*yield*/, readFile(relationshipsPath, 'utf8')];
                    case 3:
                        relationshipsData = _a.sent();
                        relationshipsLines = relationshipsData.split('\n');
                        // 跳过标题行
                        for (i = 1; i < relationshipsLines.length; i++) {
                            line = relationshipsLines[i].trim();
                            if (!line)
                                continue;
                            parts = line.match(/"([^"]*)"|([^,]+)/g);
                            if (!parts || parts.length < 8)
                                continue;
                            id = parts[0].replace(/"/g, '');
                            type = parts[1].replace(/"/g, '');
                            label = parts[2].replace(/"/g, '');
                            sourceNodeId = parts[3].replace(/"/g, '');
                            targetNodeId = parts[4].replace(/"/g, '');
                            createdAt = new Date(parts[5].replace(/"/g, ''));
                            updatedAt = new Date(parts[6].replace(/"/g, ''));
                            properties = JSON.parse(parts[7].replace(/""/g, '"').replace(/^"|"$/g, ''));
                            // 验证源节点和目标节点是否存在
                            if (!this.nodes.has(sourceNodeId) || !this.nodes.has(targetNodeId)) {
                                console.warn("Skipping relationship ".concat(id, " due to missing source or target node"));
                                continue;
                            }
                            relationship = {
                                id: id,
                                type: type,
                                label: label,
                                sourceNodeId: sourceNodeId,
                                targetNodeId: targetNodeId,
                                properties: properties,
                                createdAt: createdAt,
                                updatedAt: updatedAt
                            };
                            if (mergeStrategy === 'SKIP_DUPLICATES' && this.relationships.has(id)) {
                                continue;
                            }
                            this.relationships.set(id, relationship);
                        }
                        console.info("Imported knowledge graph from CSV: ".concat(dirPath));
                        return [2 /*return*/, true];
                    case 4:
                        error_9 = _a.sent();
                        console.error('Failed to import knowledge graph from CSV:', error_9);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 从GraphML导入
     */
    MemoryKnowledgeGraphService.prototype.importFromGraphML = function (filePath, mergeStrategy) {
        return __awaiter(this, void 0, void 0, function () {
            var readFile, data, nodeRegex, edgeRegex, nodeMatch, id, type, label, properties, createdAt, updatedAt, node, edgeMatch, id, sourceNodeId, targetNodeId, type, label, properties, createdAt, updatedAt, relationship, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 由于GraphML解析比较复杂，这里简化实现
                        console.warn('GraphML import is not fully implemented. Using a simplified version.');
                        readFile = (0, util_1.promisify)(fs.readFile);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // 检查文件是否存在
                        if (!fs.existsSync(filePath)) {
                            throw new Error("File does not exist: ".concat(filePath));
                        }
                        return [4 /*yield*/, readFile(filePath, 'utf8')];
                    case 2:
                        data = _a.sent();
                        nodeRegex = /<node id="([^"]+)">[\s\S]*?<data key="type">([^<]+)<\/data>[\s\S]*?<data key="label">([^<]+)<\/data>[\s\S]*?<data key="properties">([^<]+)<\/data>[\s\S]*?<data key="createdAt">([^<]+)<\/data>[\s\S]*?<data key="updatedAt">([^<]+)<\/data>[\s\S]*?<\/node>/g;
                        edgeRegex = /<edge id="([^"]+)" source="([^"]+)" target="([^"]+)">[\s\S]*?<data key="type">([^<]+)<\/data>[\s\S]*?<data key="label">([^<]+)<\/data>[\s\S]*?<data key="properties">([^<]+)<\/data>[\s\S]*?<data key="createdAt">([^<]+)<\/data>[\s\S]*?<data key="updatedAt">([^<]+)<\/data>[\s\S]*?<\/edge>/g;
                        // 根据合并策略处理
                        if (mergeStrategy === 'REPLACE') {
                            // 清空当前图谱
                            this.nodes.clear();
                            this.relationships.clear();
                        }
                        nodeMatch = void 0;
                        while ((nodeMatch = nodeRegex.exec(data)) !== null) {
                            id = nodeMatch[1];
                            type = nodeMatch[2];
                            label = nodeMatch[3];
                            properties = JSON.parse(nodeMatch[4].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
                            createdAt = new Date(nodeMatch[5]);
                            updatedAt = new Date(nodeMatch[6]);
                            node = {
                                id: id,
                                type: type,
                                label: label,
                                properties: properties,
                                createdAt: createdAt,
                                updatedAt: updatedAt
                            };
                            if (mergeStrategy === 'SKIP_DUPLICATES' && this.nodes.has(id)) {
                                continue;
                            }
                            this.nodes.set(id, node);
                        }
                        edgeMatch = void 0;
                        while ((edgeMatch = edgeRegex.exec(data)) !== null) {
                            id = edgeMatch[1];
                            sourceNodeId = edgeMatch[2];
                            targetNodeId = edgeMatch[3];
                            type = edgeMatch[4];
                            label = edgeMatch[5];
                            properties = JSON.parse(edgeMatch[6].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
                            createdAt = new Date(edgeMatch[7]);
                            updatedAt = new Date(edgeMatch[8]);
                            // 验证源节点和目标节点是否存在
                            if (!this.nodes.has(sourceNodeId) || !this.nodes.has(targetNodeId)) {
                                console.warn("Skipping relationship ".concat(id, " due to missing source or target node"));
                                continue;
                            }
                            relationship = {
                                id: id,
                                type: type,
                                label: label,
                                sourceNodeId: sourceNodeId,
                                targetNodeId: targetNodeId,
                                properties: properties,
                                createdAt: createdAt,
                                updatedAt: updatedAt
                            };
                            if (mergeStrategy === 'SKIP_DUPLICATES' && this.relationships.has(id)) {
                                continue;
                            }
                            this.relationships.set(id, relationship);
                        }
                        console.info("Imported knowledge graph from GraphML: ".concat(filePath));
                        return [2 /*return*/, true];
                    case 3:
                        error_10 = _a.sent();
                        console.error('Failed to import knowledge graph from GraphML:', error_10);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return MemoryKnowledgeGraphService;
}(base_knowledge_graph_service_1.BaseKnowledgeGraphService));
exports.MemoryKnowledgeGraphService = MemoryKnowledgeGraphService;
/**
 * 全局内存知识图谱服务实例
 */
exports.globalMemoryKnowledgeGraphService = new MemoryKnowledgeGraphService({
    persistToFile: process.env.MEMORY_KG_PERSIST_TO_FILE === 'true',
    persistFilePath: process.env.MEMORY_KG_PERSIST_FILE_PATH || 'data/knowledge-graph.json',
    autoSaveInterval: parseInt(process.env.MEMORY_KG_AUTO_SAVE_INTERVAL || '60000', 10),
    enableVectorSearch: process.env.MEMORY_KG_ENABLE_VECTOR_SEARCH !== 'false',
    vectorDimension: parseInt(process.env.MEMORY_KG_VECTOR_DIMENSION || '1536', 10),
    logLevel: (process.env.MEMORY_KG_LOG_LEVEL || 'info')
});
