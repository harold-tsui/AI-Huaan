/**
 * Logger - 日志工具类
 *
 * 提供统一的日志记录功能，支持不同日志级别和格式化
 */
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug",
    VERBOSE = "verbose"
}
export interface LoggerConfig {
    level: LogLevel;
    console: boolean;
    file: boolean;
    filePath?: string;
    maxSize?: string;
    maxFiles?: number;
    format?: 'json' | 'simple' | 'detailed';
}
/**
 * 日志工具类
 */
export declare class Logger {
    private logger;
    private service;
    private static config;
    /**
     * 构造函数
     * @param service 服务名称
     */
    constructor(service: string);
    /**
     * 创建Winston日志记录器
     */
    private createLogger;
    /**
     * 更新日志配置
     * @param config 新的日志配置
     */
    static updateConfig(config: Partial<LoggerConfig>): void;
    /**
     * 记录错误日志
     * @param message 日志消息
     * @param meta 元数据
     */
    error(message: string, meta?: Record<string, any>): void;
    /**
     * 记录警告日志
     * @param message 日志消息
     * @param meta 元数据
     */
    warn(message: string, meta?: Record<string, any>): void;
    /**
     * 记录信息日志
     * @param message 日志消息
     * @param meta 元数据
     */
    info(message: string, meta?: Record<string, any>): void;
    /**
     * 记录调试日志
     * @param message 日志消息
     * @param meta 元数据
     */
    debug(message: string, meta?: Record<string, any>): void;
    /**
     * 记录详细日志
     * @param message 日志消息
     * @param meta 元数据
     */
    verbose(message: string, meta?: Record<string, any>): void;
    /**
     * 记录异常日志
     * @param error 错误对象
     * @param context 上下文信息
     */
    exception(error: Error, context?: Record<string, any>): void;
}
