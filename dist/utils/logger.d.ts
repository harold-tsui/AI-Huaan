/**
 * Logger - 日志工具类
 *
 * 提供统一的日志记录功能，支持不同日志级别和格式化
 */
import * as winston from 'winston';
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
    serviceName?: string;
}
/**
 * 初始化全局 Logger 配置和实例
 * This function should be called once at application startup.
 * @param config Logger 配置对象或部分配置
 */
export declare function initializeGlobalLogger(config?: Partial<LoggerConfig>): winston.Logger;
/**
 * 获取全局 Winston Logger 实例。
 * 必须先调用 initializeGlobalLogger。
 */
export declare function getGlobalLogger(): winston.Logger;
/**
 * 日志工具类 (Service-specific wrapper around global logger or own instance)
 */
export declare class Logger {
    private loggerInstance;
    private serviceName;
    private static currentConfig;
    /**
     * 构造函数
     * @param serviceName 服务名称
     */
    constructor(serviceName: string);
    /**
     * 记录 debug 级别的日志
     * @param message 日志消息
     * @param meta 元数据
     */
    debug(message: string, ...meta: any[]): void;
    /**
     * 记录 info 级别的日志
     * @param message 日志消息
     * @param meta 元数据
     */
    info(message: string, ...meta: any[]): void;
    /**
     * 记录 warn 级别的日志
     * @param message 日志消息
     * @param meta 元数据
     */
    warn(message: string, ...meta: any[]): void;
    /**
     * 记录 error 级别的日志
     * @param message 日志消息
     * @param meta 元数据
     */
    error(message: string, ...meta: any[]): void;
    /**
     * 更新全局日志配置并重新初始化全局记录器。
     * 注意: 这会影响所有使用全局记录器的 Logger 实例。
     * @param config 新的日志配置
     */
    static updateGlobalConfigAndReinitialize(config: Partial<LoggerConfig>): winston.Logger;
    static updateConfig(config: Partial<LoggerConfig>): void;
    /**
     * 记录详细日志 (Verbose)
     * @param message 日志消息
     * @param meta 元数据
     */
    verbose(message: string, ...meta: any[]): void;
    /**
     * 记录异常日志，包括错误信息和堆栈跟踪。
     * @param error 错误对象，必须是 Error 的实例。
     * @param context 额外的上下文信息，将与错误信息一起记录。
     */
    exception(error: Error, context?: Record<string, any>): void;
}
