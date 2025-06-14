/**
 * Logger - 日志工具类
 * 
 * 提供统一的日志记录功能，支持不同日志级别和格式化
 */

import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

// 日志级别枚举
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

// 日志配置接口
export interface LoggerConfig {
  level: LogLevel;
  console: boolean;
  file: boolean;
  filePath?: string;
  maxSize?: string;
  maxFiles?: number;
  format?: 'json' | 'simple' | 'detailed';
}

// 默认日志配置
const defaultConfig: LoggerConfig = {
  level: LogLevel.INFO,
  console: true,
  file: true,
  filePath: './logs/basb.log',
  maxSize: '10m',
  maxFiles: 5,
  format: 'json',
};

// 从环境变量加载配置
function loadConfigFromEnv(): LoggerConfig {
  return {
    level: (process.env.LOG_LEVEL as LogLevel) || defaultConfig.level,
    console: process.env.LOG_CONSOLE !== 'false',
    file: process.env.LOG_FILE !== 'false',
    filePath: process.env.LOG_FILE_PATH || defaultConfig.filePath,
    maxSize: process.env.LOG_MAX_SIZE || defaultConfig.maxSize,
    maxFiles: process.env.LOG_MAX_FILES ? parseInt(process.env.LOG_MAX_FILES) : defaultConfig.maxFiles,
    format: (process.env.LOG_FORMAT as 'json' | 'simple' | 'detailed') || defaultConfig.format,
  };
}

// 创建日志格式
function createLogFormat(format: 'json' | 'simple' | 'detailed') {
  switch (format) {
    case 'json':
      return winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      );
    case 'simple':
      return winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, service }) => {
          return `${timestamp} [${service}] ${level.toUpperCase()}: ${message}`;
        })
      );
    case 'detailed':
      return winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${service}] ${level.toUpperCase()}: ${message}${metaStr}`;
        })
      );
    default:
      return winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      );
  }
}

/**
 * 日志工具类
 */
export class Logger {
  private logger: winston.Logger;
  private service: string;
  private static config: LoggerConfig = loadConfigFromEnv();

  /**
   * 构造函数
   * @param service 服务名称
   */
  constructor(service: string) {
    this.service = service;
    this.logger = this.createLogger();
  }

  /**
   * 创建Winston日志记录器
   */
  private createLogger(): winston.Logger {
    const { level, console, file, filePath, maxSize, maxFiles, format } = Logger.config;
    const transports: winston.transport[] = [];

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
  public static updateConfig(config: Partial<LoggerConfig>): void {
    Logger.config = { ...Logger.config, ...config };
  }

  /**
   * 记录错误日志
   * @param message 日志消息
   * @param meta 元数据
   */
  public error(message: string, meta?: Record<string, any>): void {
    this.logger.error(message, meta);
  }

  /**
   * 记录警告日志
   * @param message 日志消息
   * @param meta 元数据
   */
  public warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, meta);
  }

  /**
   * 记录信息日志
   * @param message 日志消息
   * @param meta 元数据
   */
  public info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, meta);
  }

  /**
   * 记录调试日志
   * @param message 日志消息
   * @param meta 元数据
   */
  public debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, meta);
  }

  /**
   * 记录详细日志
   * @param message 日志消息
   * @param meta 元数据
   */
  public verbose(message: string, meta?: Record<string, any>): void {
    this.logger.verbose(message, meta);
  }

  /**
   * 记录异常日志
   * @param error 错误对象
   * @param context 上下文信息
   */
  public exception(error: Error, context?: Record<string, any>): void {
    this.logger.error(`Exception: ${error.message}`, {
      stack: error.stack,
      ...context,
    });
  }
}