"use strict";
/**
 * Logger - 日志工具类
 *
 * 提供统一的日志记录功能，支持不同日志级别和格式化
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
var winston = require("winston");
var path = require("path");
var fs = require("fs");
// 日志级别枚举
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
    LogLevel["VERBOSE"] = "verbose";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
// 默认日志配置
var defaultConfig = {
    level: LogLevel.INFO,
    console: true,
    file: true,
    filePath: './logs/basb.log',
    maxSize: '10m',
    maxFiles: 5,
    format: 'json',
};
// 从环境变量加载配置
function loadConfigFromEnv() {
    return {
        level: process.env.LOG_LEVEL || defaultConfig.level,
        console: process.env.LOG_CONSOLE !== 'false',
        file: process.env.LOG_FILE !== 'false',
        filePath: process.env.LOG_FILE_PATH || defaultConfig.filePath,
        maxSize: process.env.LOG_MAX_SIZE || defaultConfig.maxSize,
        maxFiles: process.env.LOG_MAX_FILES ? parseInt(process.env.LOG_MAX_FILES) : defaultConfig.maxFiles,
        format: process.env.LOG_FORMAT || defaultConfig.format,
    };
}
// 创建日志格式
function createLogFormat(format) {
    switch (format) {
        case 'json':
            return winston.format.combine(winston.format.timestamp(), winston.format.json());
        case 'simple':
            return winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.printf(function (_a) {
                var timestamp = _a.timestamp, level = _a.level, message = _a.message, service = _a.service;
                return "".concat(timestamp, " [").concat(service, "] ").concat(level.toUpperCase(), ": ").concat(message);
            }));
        case 'detailed':
            return winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.printf(function (_a) {
                var timestamp = _a.timestamp, level = _a.level, message = _a.message, service = _a.service, meta = __rest(_a, ["timestamp", "level", "message", "service"]);
                var metaStr = Object.keys(meta).length ? " | ".concat(JSON.stringify(meta)) : '';
                return "".concat(timestamp, " [").concat(service, "] ").concat(level.toUpperCase(), ": ").concat(message).concat(metaStr);
            }));
        default:
            return winston.format.combine(winston.format.timestamp(), winston.format.json());
    }
}
/**
 * 日志工具类
 */
var Logger = /** @class */ (function () {
    /**
     * 构造函数
     * @param service 服务名称
     */
    function Logger(service) {
        this.service = service;
        this.logger = this.createLogger();
    }
    /**
     * 创建Winston日志记录器
     */
    Logger.prototype.createLogger = function () {
        var _a = Logger.config, level = _a.level, console = _a.console, file = _a.file, filePath = _a.filePath, maxSize = _a.maxSize, maxFiles = _a.maxFiles, format = _a.format;
        var transports = [];
        // 控制台输出
        if (console) {
            transports.push(new winston.transports.Console({
                level: level,
                format: createLogFormat(format || 'json'),
            }));
        }
        // 文件输出
        if (file && filePath) {
            // 确保日志目录存在
            var logDir = path.dirname(filePath);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            transports.push(new winston.transports.File({
                level: level,
                filename: filePath,
                maxsize: maxSize ? parseInt(maxSize) * 1024 * 1024 : undefined,
                maxFiles: maxFiles,
                format: createLogFormat(format || 'json'),
            }));
        }
        return winston.createLogger({
            level: level,
            defaultMeta: { service: this.service },
            transports: transports,
        });
    };
    /**
     * 更新日志配置
     * @param config 新的日志配置
     */
    Logger.updateConfig = function (config) {
        Logger.config = __assign(__assign({}, Logger.config), config);
    };
    /**
     * 记录错误日志
     * @param message 日志消息
     * @param meta 元数据
     */
    Logger.prototype.error = function (message, meta) {
        this.logger.error(message, meta);
    };
    /**
     * 记录警告日志
     * @param message 日志消息
     * @param meta 元数据
     */
    Logger.prototype.warn = function (message, meta) {
        this.logger.warn(message, meta);
    };
    /**
     * 记录信息日志
     * @param message 日志消息
     * @param meta 元数据
     */
    Logger.prototype.info = function (message, meta) {
        this.logger.info(message, meta);
    };
    /**
     * 记录调试日志
     * @param message 日志消息
     * @param meta 元数据
     */
    Logger.prototype.debug = function (message, meta) {
        this.logger.debug(message, meta);
    };
    /**
     * 记录详细日志
     * @param message 日志消息
     * @param meta 元数据
     */
    Logger.prototype.verbose = function (message, meta) {
        this.logger.verbose(message, meta);
    };
    /**
     * 记录异常日志
     * @param error 错误对象
     * @param context 上下文信息
     */
    Logger.prototype.exception = function (error, context) {
        this.logger.error("Exception: ".concat(error.message), __assign({ stack: error.stack }, context));
    };
    Logger.config = loadConfigFromEnv();
    return Logger;
}());
exports.Logger = Logger;
