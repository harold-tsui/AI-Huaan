"use strict";
/**
 * Knowledge Graph Services Types - 知识图谱服务类型定义
 *
 * 定义知识图谱服务的接口和类型
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipType = exports.NodeType = void 0;
/**
 * 知识图谱节点类型枚举
 */
var NodeType;
(function (NodeType) {
    // 基础节点类型
    NodeType["NOTE"] = "NOTE";
    NodeType["TAG"] = "TAG";
    NodeType["CONCEPT"] = "CONCEPT";
    NodeType["ENTITY"] = "ENTITY";
    NodeType["TOPIC"] = "TOPIC";
    NodeType["QUESTION"] = "QUESTION";
    NodeType["ANSWER"] = "ANSWER";
    NodeType["TASK"] = "TASK";
    NodeType["PROJECT"] = "PROJECT";
    NodeType["GOAL"] = "GOAL";
    NodeType["AREA"] = "AREA";
    NodeType["RESOURCE"] = "RESOURCE";
    // 媒体节点类型
    NodeType["FILE"] = "FILE";
    NodeType["IMAGE"] = "IMAGE";
    NodeType["AUDIO"] = "AUDIO";
    NodeType["VIDEO"] = "VIDEO";
    NodeType["DOCUMENT"] = "DOCUMENT";
    NodeType["WEBPAGE"] = "WEBPAGE";
    // 时间相关节点类型
    NodeType["DATE"] = "DATE";
    NodeType["EVENT"] = "EVENT";
    NodeType["DAILY_NOTE"] = "DAILY_NOTE";
    NodeType["WEEKLY_NOTE"] = "WEEKLY_NOTE";
    NodeType["MONTHLY_NOTE"] = "MONTHLY_NOTE";
    // 自定义节点类型
    NodeType["CUSTOM"] = "CUSTOM";
})(NodeType || (exports.NodeType = NodeType = {}));
/**
 * 知识图谱关系类型枚举
 */
var RelationshipType;
(function (RelationshipType) {
    // 基础关系类型
    RelationshipType["REFERENCES"] = "REFERENCES";
    RelationshipType["CONTAINS"] = "CONTAINS";
    RelationshipType["RELATED_TO"] = "RELATED_TO";
    RelationshipType["SIMILAR_TO"] = "SIMILAR_TO";
    RelationshipType["PART_OF"] = "PART_OF";
    RelationshipType["HAS_TAG"] = "HAS_TAG";
    RelationshipType["BELONGS_TO"] = "BELONGS_TO";
    RelationshipType["CREATED_AT"] = "CREATED_AT";
    RelationshipType["CREATED_BY"] = "CREATED_BY";
    RelationshipType["MODIFIED_AT"] = "MODIFIED_AT";
    RelationshipType["MODIFIED_BY"] = "MODIFIED_BY";
    // 语义关系类型
    RelationshipType["IS_A"] = "IS_A";
    RelationshipType["HAS_PROPERTY"] = "HAS_PROPERTY";
    RelationshipType["CAUSES"] = "CAUSES";
    RelationshipType["PRECEDES"] = "PRECEDES";
    RelationshipType["FOLLOWS"] = "FOLLOWS";
    RelationshipType["CONTRADICTS"] = "CONTRADICTS";
    RelationshipType["SUPPORTS"] = "SUPPORTS";
    RelationshipType["ANSWERS"] = "ANSWERS";
    RelationshipType["QUESTIONS"] = "QUESTIONS";
    // 项目关系类型
    RelationshipType["DEPENDS_ON"] = "DEPENDS_ON";
    RelationshipType["BLOCKS"] = "BLOCKS";
    RelationshipType["IMPLEMENTS"] = "IMPLEMENTS";
    // 自定义关系类型
    RelationshipType["CUSTOM"] = "CUSTOM";
    RelationshipType["DESCRIBES"] = "DESCRIBES";
    RelationshipType["MENTIONS"] = "MENTIONS";
})(RelationshipType || (exports.RelationshipType = RelationshipType = {}));
