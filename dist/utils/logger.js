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
exports.initializeGlobalLogger = initializeGlobalLogger;
exports.getGlobalLogger = getGlobalLogger;
console.log('[logger.ts] Module evaluation started.');
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
const baseDefaultConfig = {
    level: LogLevel.INFO,
    console: true,
    file: true,
    filePath: './logs/basb.log',
    maxSize: '10m',
    maxFiles: 5,
    format: 'json',
};
// 从环境变量加载配置
function loadConfigFromEnv(defaults) {
    return {
        level: process.env.LOG_LEVEL || defaults.level,
        console: process.env.LOG_CONSOLE !== 'false',
        file: process.env.LOG_FILE !== 'false',
        filePath: process.env.LOG_FILE_PATH || defaults.filePath,
        maxSize: process.env.LOG_MAX_SIZE || defaults.maxSize,
        maxFiles: process.env.LOG_MAX_FILES ? parseInt(process.env.LOG_MAX_FILES) : defaults.maxFiles,
        format: process.env.LOG_FORMAT || defaults.format,
        serviceName: process.env.LOG_SERVICE_NAME || defaults.serviceName || 'global',
    };
}
// 创建日志格式
function createWinstonLogFormat(format) {
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
 * 初始化全局 Logger 配置
 * @param config Logger 配置对象或部分配置
 */
let globalWinstonLogger;
let globalLoggerConfig = loadConfigFromEnv({
    ...baseDefaultConfig,
    serviceName: 'global-uninitialized',
});
/**
 * 初始化全局 Logger 配置和实例
 * This function should be called once at application startup.
 * @param config Logger 配置对象或部分配置
 */
function initializeGlobalLogger(config) {
    console.log('[logger.ts/initializeGlobalLogger] Entry. Config provided:', config !== undefined);
    const initialConfig = {
        ...baseDefaultConfig,
        serviceName: 'global', // Default service name for the global logger
        ...config
    };
    globalLoggerConfig = loadConfigFromEnv(initialConfig); // Load env vars over initialConfig
    const { level, console: useConsole, file: useFile, filePath, maxSize, maxFiles, format, serviceName } = globalLoggerConfig;
    const transports = [];
    if (useConsole) {
        transports.push(new winston.transports.Console({
            level,
            format: createWinstonLogFormat(format || 'json'),
        }));
    }
    if (useFile && filePath) {
        const logDir = path.dirname(filePath);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        transports.push(new winston.transports.File({
            level,
            filename: filePath,
            maxsize: maxSize ? parseInt(maxSize) * 1024 * 1024 : undefined,
            maxFiles,
            format: createWinstonLogFormat(format || 'json'),
        }));
    }
    console.log('[logger.ts/initializeGlobalLogger] About to create winston logger instance. Current globalLoggerConfig:', globalLoggerConfig);
    globalWinstonLogger = winston.createLogger({
        level,
        defaultMeta: { service: serviceName },
        transports,
    });
    globalWinstonLogger.info(`Global logger initialized. Level: ${level}, Service: ${serviceName}`);
    return globalWinstonLogger;
}
/**
 * 获取全局 Winston Logger 实例。
 * 必须先调用 initializeGlobalLogger。
 */
function getGlobalLogger() {
    console.log('[logger.ts/getGlobalLogger] Entry. globalWinstonLogger defined:', globalWinstonLogger !== undefined);
    if (!globalWinstonLogger) {
        // Fallback to initialize with defaults if not already done, though explicit initialization is preferred.
        console.error('[logger.ts/getGlobalLogger] CRITICAL_FALLBACK: globalWinstonLogger is undefined. Falling back to initializeGlobalLogger(). This is likely an issue. Stack:', new Error().stack);
        return initializeGlobalLogger();
    }
    return globalWinstonLogger;
}
/**
 * 日志工具类 (Service-specific wrapper around global logger or own instance)
 */
class Logger {
    /**
     * 构造函数
     * @param serviceName 服务名称
     */
    constructor(serviceName) {
        console.log(`[logger.ts/Logger.constructor] Entry for service: '${serviceName}'. Attempting to get global logger.`);
        this.serviceName = serviceName;
        // By default, service-specific loggers will use the global Winston logger's configuration
        // but log with their own service name.
        // If globalWinstonLogger is not yet available, it will be initialized with defaults.
        const baseLogger = getGlobalLogger();
        console.log(`[logger.ts/Logger.constructor] Global logger obtained for service: '${serviceName}'. Creating child logger.`);
        this.loggerInstance = baseLogger.child({ service: this.serviceName });
        console.log(`[logger.ts/Logger.constructor] Child logger created for service: '${serviceName}'.`);
    }
    /**
     * 记录 debug 级别的日志
     * @param message 日志消息
     * @param meta 元数据
     */
    debug(message, ...meta) {
        this.loggerInstance.debug(message, ...meta);
    }
    /**
     * 记录 info 级别的日志
     * @param message 日志消息
     * @param meta 元数据
     */
    info(message, ...meta) {
        this.loggerInstance.info(message, ...meta);
    }
    /**
     * 记录 warn 级别的日志
     * @param message 日志消息
     * @param meta 元数据
     */
    warn(message, ...meta) {
        this.loggerInstance.warn(message, ...meta);
    }
    /**
     * 记录 error 级别的日志
     * @param message 日志消息
     * @param meta 元数据
     */
    error(message, ...meta) {
        this.loggerInstance.error(message, ...meta);
    }
    /**
     * 更新全局日志配置并重新初始化全局记录器。
     * 注意: 这会影响所有使用全局记录器的 Logger 实例。
     * @param config 新的日志配置
     */
    static updateGlobalConfigAndReinitialize(config) {
        console.warn('Re-initializing global logger due to config update. This may affect all logger instances.');
        // Preserve existing serviceName if not overridden by new partial config
        const newGlobalConfig = { ...globalLoggerConfig, ...config };
        return initializeGlobalLogger(newGlobalConfig);
    }
    // Static updateConfig is kept for compatibility but now updates and reinitializes the global logger.
    static updateConfig(config) {
        Logger.updateGlobalConfigAndReinitialize(config);
    }
    /**
     * 记录详细日志 (Verbose)
     * @param message 日志消息
     * @param meta 元数据
     */
    verbose(message, ...meta) {
        this.loggerInstance.verbose(message, ...meta);
    }
    /**
     * 记录异常日志，包括错误信息和堆栈跟踪。
     * @param error 错误对象，必须是 Error 的实例。
     * @param context 额外的上下文信息，将与错误信息一起记录。
     */
    exception(error, context) {
        const metadata = {
            stack: error.stack,
            ...(context || {}),
        };
        // 如果 error.name 不是 'Error' (例如 'TypeError', 'RangeError'), 也将其包含在元数据中
        if (error.name && error.name !== 'Error') {
            metadata.errorType = error.name;
        }
        this.loggerInstance.error(error.message, metadata);
    }
}
exports.Logger = Logger;
// Static config is now primarily for reference or if a Logger instance needs to deviate
Logger.currentConfig = globalLoggerConfig;
//# sourceMappingURL=logger.js.map