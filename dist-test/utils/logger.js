"use strict";
/**
 * Logger - 日志工具类
 *
 * 提供统一的日志记录功能，支持不同日志级别和格式化
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
const winston = __importStar(require("winston"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
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
const defaultConfig = {
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
            return winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.printf(({ timestamp, level, message, service }) => {
                return `${timestamp} [${service}] ${level.toUpperCase()}: ${message}`;
            }));
        case 'detailed':
            return winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
                const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
                return `${timestamp} [${service}] ${level.toUpperCase()}: ${message}${metaStr}`;
            }));
        default:
            return winston.format.combine(winston.format.timestamp(), winston.format.json());
    }
}
/**
 * 日志工具类
 */
class Logger {
    /**
     * 构造函数
     * @param service 服务名称
     */
    constructor(service) {
        this.service = service;
        this.logger = this.createLogger();
    }
    /**
     * 创建Winston日志记录器
     */
    createLogger() {
        const { level, console, file, filePath, maxSize, maxFiles, format } = Logger.config;
        const transports = [];
        // 控制台输出
        if (console) {
            transports.push(new winston.transports.Console({
                level,
                format: createLogFormat(format || 'json'),
            }));
        }
        // 文件输出
        if (file && filePath) {
            // 确保日志目录存在
            const logDir = path.dirname(filePath);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            transports.push(new winston.transports.File({
                level,
                filename: filePath,
                maxsize: maxSize ? parseInt(maxSize) * 1024 * 1024 : undefined,
                maxFiles,
                format: createLogFormat(format || 'json'),
            }));
        }
        return winston.createLogger({
            level,
            defaultMeta: { service: this.service },
            transports,
        });
    }
    /**
     * 更新日志配置
     * @param config 新的日志配置
     */
    static updateConfig(config) {
        Logger.config = { ...Logger.config, ...config };
    }
    /**
     * 记录错误日志
     * @param message 日志消息
     * @param meta 元数据
     */
    error(message, meta) {
        this.logger.error(message, meta);
    }
    /**
     * 记录警告日志
     * @param message 日志消息
     * @param meta 元数据
     */
    warn(message, meta) {
        this.logger.warn(message, meta);
    }
    /**
     * 记录信息日志
     * @param message 日志消息
     * @param meta 元数据
     */
    info(message, meta) {
        this.logger.info(message, meta);
    }
    /**
     * 记录调试日志
     * @param message 日志消息
     * @param meta 元数据
     */
    debug(message, meta) {
        this.logger.debug(message, meta);
    }
    /**
     * 记录详细日志
     * @param message 日志消息
     * @param meta 元数据
     */
    verbose(message, meta) {
        this.logger.verbose(message, meta);
    }
    /**
     * 记录异常日志
     * @param error 错误对象
     * @param context 上下文信息
     */
    exception(error, context) {
        this.logger.error(`Exception: ${error.message}`, {
            stack: error.stack,
            ...context,
        });
    }
}
exports.Logger = Logger;
Logger.config = loadConfigFromEnv();
//# sourceMappingURL=logger.js.map