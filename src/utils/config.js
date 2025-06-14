"use strict";
/**
 * Config - 配置管理模块
 *
 * 加载和管理应用配置，支持环境变量、配置文件和默认值的多级配置
 * 提供类型安全的配置访问和验证
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceConfig = exports.getConfig = exports.config = exports.ConfigManager = void 0;
exports.getNeo4jConfig = getNeo4jConfig;
exports.validateNeo4jConfig = validateNeo4jConfig;
var fs = require("fs");
var path = require("path");
var dotenv = require("dotenv");
var logger_1 = require("./logger");
// 默认配置
var defaultConfig = {
    app: {
        name: 'BASB',
        version: '1.0.0',
        environment: 'development',
        port: 3000,
        host: 'localhost',
        baseUrl: 'http://localhost:3000',
    },
    database: {
        postgres: {
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'postgres',
            database: 'basb',
            ssl: false,
            poolSize: 10,
        },
        redis: {
            host: 'localhost',
            port: 6379,
            password: '',
            db: 0,
            prefix: 'basb:',
        },
    },
    ai: {
        routing: {
            defaultProvider: 'openai',
            fallbackProvider: 'local',
        },
    },
    storage: {
        type: 'local',
        basePath: './storage',
    },
    logging: {
        level: 'info',
        console: true,
        file: true,
        filePath: './logs/basb.log',
        maxSize: '10m',
        maxFiles: 5,
        format: 'json',
    },
    security: {
        jwt: {
            secret: 'change-me-in-production',
            expiresIn: '1h',
            refreshExpiresIn: '7d',
        },
        encryption: {
            algorithm: 'aes-256-gcm',
            key: 'change-me-in-production-32-chars-key',
        },
        cors: {
            origins: ['*'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        },
    },
    cache: {
        ttl: 60 * 60 * 1000, // 1小时
        checkPeriod: 10 * 60 * 1000, // 10分钟
    },
    mcp: {
        services: {},
    },
};
/**
 * 配置管理类
 * 负责加载、验证、管理和持久化应用配置
 */
var ConfigManager = /** @class */ (function () {
    function ConfigManager() {
        this.initialized = false;
        this.logger = new logger_1.Logger('ConfigManager');
        this.config = this.loadConfig();
        this.validateConfig();
        this.initialized = true;
        this.logger.info('Configuration manager initialized successfully');
    }
    /**
     * 获取配置管理实例
     * @returns 配置管理实例
     */
    ConfigManager.getInstance = function () {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    };
    /**
     * 确保配置管理器已初始化
     * @throws 如果配置管理器未初始化则抛出错误
     */
    ConfigManager.prototype.ensureInitialized = function () {
        if (!this.initialized) {
            throw new Error('Configuration manager is not initialized');
        }
    };
    /**
     * 加载配置
     * @returns 应用配置
     */
    ConfigManager.prototype.loadConfig = function () {
        // 加载环境变量
        this.loadEnv();
        // 合并默认配置和环境变量配置
        var config = this.mergeWithEnvVars(defaultConfig);
        // 加载配置文件（如果存在）
        var configFilePath = process.env.CONFIG_FILE || path.resolve(process.cwd(), 'config.json');
        if (fs.existsSync(configFilePath)) {
            try {
                var fileConfig = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
                this.deepMerge(config, fileConfig);
                this.logger.info("Loaded configuration from ".concat(configFilePath));
            }
            catch (error) {
                this.logger.error("Failed to load configuration from ".concat(configFilePath), { error: error instanceof Error ? error : String(error) });
            }
        }
        return config;
    };
    /**
     * 加载环境变量
     */
    ConfigManager.prototype.loadEnv = function () {
        // 尝试加载.env文件
        var envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            dotenv.config({ path: envPath });
            this.logger.info("Loaded environment variables from ".concat(envPath));
        }
        else {
            this.logger.info('No .env file found, using system environment variables');
        }
    };
    /**
     * 将环境变量合并到配置中
     * @param defaultConfig 默认配置
     * @returns 合并后的配置
     */
    ConfigManager.prototype.mergeWithEnvVars = function (defaultConfig) {
        var config = JSON.parse(JSON.stringify(defaultConfig));
        // 应用配置
        if (process.env.APP_NAME)
            config.app.name = process.env.APP_NAME;
        if (process.env.APP_VERSION)
            config.app.version = process.env.APP_VERSION;
        if (process.env.NODE_ENV)
            config.app.environment = process.env.NODE_ENV;
        if (process.env.PORT)
            config.app.port = parseInt(process.env.PORT);
        if (process.env.HOST)
            config.app.host = process.env.HOST;
        if (process.env.BASE_URL)
            config.app.baseUrl = process.env.BASE_URL;
        // 数据库配置 - PostgreSQL
        if (process.env.POSTGRES_HOST)
            config.database.postgres.host = process.env.POSTGRES_HOST;
        if (process.env.POSTGRES_PORT)
            config.database.postgres.port = parseInt(process.env.POSTGRES_PORT);
        if (process.env.POSTGRES_USER)
            config.database.postgres.username = process.env.POSTGRES_USER;
        if (process.env.POSTGRES_PASSWORD)
            config.database.postgres.password = process.env.POSTGRES_PASSWORD;
        if (process.env.POSTGRES_DB)
            config.database.postgres.database = process.env.POSTGRES_DB;
        if (process.env.POSTGRES_SSL)
            config.database.postgres.ssl = process.env.POSTGRES_SSL === 'true';
        if (process.env.POSTGRES_POOL_SIZE)
            config.database.postgres.poolSize = parseInt(process.env.POSTGRES_POOL_SIZE);
        // 数据库配置 - Redis
        if (process.env.REDIS_HOST)
            config.database.redis.host = process.env.REDIS_HOST;
        if (process.env.REDIS_PORT)
            config.database.redis.port = parseInt(process.env.REDIS_PORT);
        if (process.env.REDIS_PASSWORD)
            config.database.redis.password = process.env.REDIS_PASSWORD;
        if (process.env.REDIS_DB)
            config.database.redis.db = parseInt(process.env.REDIS_DB);
        if (process.env.REDIS_PREFIX)
            config.database.redis.prefix = process.env.REDIS_PREFIX;
        // 数据库配置 - Neo4j
        if (process.env.NEO4J_URI || process.env.NEO4J_USER || process.env.NEO4J_PASSWORD) {
            config.database.neo4j = {
                uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
                username: process.env.NEO4J_USER || 'neo4j',
                password: process.env.NEO4J_PASSWORD || 'neo4j',
                database: process.env.NEO4J_DATABASE,
                vectorSearch: {
                    enabled: process.env.NEO4J_VECTOR_SEARCH_ENABLED === 'true',
                    dimension: process.env.NEO4J_VECTOR_DIMENSION ? parseInt(process.env.NEO4J_VECTOR_DIMENSION) : 1536,
                    similarity: (process.env.NEO4J_VECTOR_SIMILARITY || 'cosine'),
                },
                plugins: {
                    apoc: process.env.NEO4J_APOC_ENABLED === 'true',
                    gds: process.env.NEO4J_GDS_ENABLED === 'true',
                },
                connectionPool: {
                    maxSize: process.env.NEO4J_CONNECTION_POOL_SIZE ? parseInt(process.env.NEO4J_CONNECTION_POOL_SIZE) : 100,
                    idleTimeout: process.env.NEO4J_CONNECTION_IDLE_TIMEOUT ? parseInt(process.env.NEO4J_CONNECTION_IDLE_TIMEOUT) : 30000,
                },
                logLevel: (process.env.NEO4J_LOG_LEVEL || 'info'),
            };
        }
        // 数据库配置 - ChromaDB
        if (process.env.CHROMADB_HOST || process.env.CHROMADB_PORT) {
            config.database.chromadb = {
                host: process.env.CHROMADB_HOST || 'localhost',
                port: process.env.CHROMADB_PORT ? parseInt(process.env.CHROMADB_PORT) : 8000,
            };
        }
        // AI配置 - OpenAI
        if (process.env.OPENAI_API_KEY) {
            config.ai.openai = {
                apiKey: process.env.OPENAI_API_KEY,
                organization: process.env.OPENAI_ORGANIZATION,
                models: {
                    embedding: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
                    completion: process.env.OPENAI_COMPLETION_MODEL || 'gpt-3.5-turbo',
                },
            };
        }
        // AI配置 - Anthropic
        if (process.env.ANTHROPIC_API_KEY) {
            config.ai.anthropic = {
                apiKey: process.env.ANTHROPIC_API_KEY,
                baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
                models: {
                    completion: process.env.ANTHROPIC_COMPLETION_MODEL || 'claude-2',
                },
            };
        }
        // AI配置 - 本地模型
        if (process.env.LOCAL_AI_ENDPOINT) {
            config.ai.local = {
                endpoint: process.env.LOCAL_AI_ENDPOINT,
                models: {
                    embedding: process.env.LOCAL_EMBEDDING_MODEL,
                    completion: process.env.LOCAL_COMPLETION_MODEL || 'llama2',
                },
            };
        }
        // AI配置 - 路由策略
        if (process.env.AI_DEFAULT_PROVIDER) {
            config.ai.routing.defaultProvider = process.env.AI_DEFAULT_PROVIDER;
        }
        if (process.env.AI_FALLBACK_PROVIDER) {
            config.ai.routing.fallbackProvider = process.env.AI_FALLBACK_PROVIDER;
        }
        // 存储配置
        if (process.env.STORAGE_TYPE)
            config.storage.type = process.env.STORAGE_TYPE;
        if (process.env.STORAGE_PATH)
            config.storage.basePath = process.env.STORAGE_PATH;
        // S3/MinIO配置
        if (process.env.S3_BUCKET || process.env.S3_REGION || process.env.S3_ACCESS_KEY) {
            config.storage.s3 = {
                bucket: process.env.S3_BUCKET || 'basb',
                region: process.env.S3_REGION || 'us-east-1',
                accessKey: process.env.S3_ACCESS_KEY || '',
                secretKey: process.env.S3_SECRET_KEY || '',
                endpoint: process.env.S3_ENDPOINT, // 用于MinIO
            };
        }
        // 日志配置
        if (process.env.LOG_LEVEL)
            config.logging.level = process.env.LOG_LEVEL;
        if (process.env.LOG_CONSOLE)
            config.logging.console = process.env.LOG_CONSOLE === 'true';
        if (process.env.LOG_FILE)
            config.logging.file = process.env.LOG_FILE === 'true';
        if (process.env.LOG_FILE_PATH)
            config.logging.filePath = process.env.LOG_FILE_PATH;
        if (process.env.LOG_MAX_SIZE)
            config.logging.maxSize = process.env.LOG_MAX_SIZE;
        if (process.env.LOG_MAX_FILES)
            config.logging.maxFiles = parseInt(process.env.LOG_MAX_FILES);
        if (process.env.LOG_FORMAT)
            config.logging.format = process.env.LOG_FORMAT;
        // 安全配置 - JWT
        if (process.env.JWT_SECRET)
            config.security.jwt.secret = process.env.JWT_SECRET;
        if (process.env.JWT_EXPIRES_IN)
            config.security.jwt.expiresIn = process.env.JWT_EXPIRES_IN;
        if (process.env.JWT_REFRESH_EXPIRES_IN)
            config.security.jwt.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN;
        // 安全配置 - 加密
        if (process.env.ENCRYPTION_ALGORITHM)
            config.security.encryption.algorithm = process.env.ENCRYPTION_ALGORITHM;
        if (process.env.ENCRYPTION_KEY)
            config.security.encryption.key = process.env.ENCRYPTION_KEY;
        // 安全配置 - CORS
        if (process.env.CORS_ORIGINS)
            config.security.cors.origins = process.env.CORS_ORIGINS.split(',');
        if (process.env.CORS_METHODS)
            config.security.cors.methods = process.env.CORS_METHODS.split(',');
        // 缓存配置
        if (process.env.CACHE_TTL)
            config.cache.ttl = parseInt(process.env.CACHE_TTL);
        if (process.env.CACHE_CHECK_PERIOD)
            config.cache.checkPeriod = parseInt(process.env.CACHE_CHECK_PERIOD);
        return config;
    };
    /**
     * 深度合并对象
     * @param target 目标对象
     * @param source 源对象
     */
    ConfigManager.prototype.deepMerge = function (target, source) {
        for (var key in source) {
            if (source[key] instanceof Object && key in target) {
                this.deepMerge(target[key], source[key]);
            }
            else {
                target[key] = source[key];
            }
        }
    };
    /**
     * 验证配置
     * 检查必要的配置项是否存在且有效
     * @throws 如果配置无效则抛出错误
     */
    ConfigManager.prototype.validateConfig = function () {
        var _a;
        // 验证应用基础配置
        this.validateRequiredFields('app', ['name', 'port', 'environment']);
        // 验证数据库配置
        this.validateRequiredFields('database.postgres', ['host', 'port', 'username', 'database']);
        this.validateRequiredFields('database.redis', ['host', 'port']);
        // 验证Neo4j配置（如果存在）
        if (this.config.database.neo4j) {
            this.validateRequiredFields('database.neo4j', ['uri', 'username', 'password']);
            // 验证Neo4j向量搜索配置（如果启用）
            if ((_a = this.config.database.neo4j.vectorSearch) === null || _a === void 0 ? void 0 : _a.enabled) {
                this.validateRequiredFields('database.neo4j.vectorSearch', ['dimension', 'similarity']);
            }
        }
        // 验证存储配置
        this.validateRequiredFields('storage', ['type', 'basePath']);
        // 验证S3配置（如果使用S3存储）
        if (this.config.storage.type === 's3' || this.config.storage.type === 'minio') {
            if (!this.config.storage.s3) {
                throw new Error('S3 configuration is required when storage type is s3 or minio');
            }
            this.validateRequiredFields('storage.s3', ['bucket', 'region', 'accessKey', 'secretKey']);
        }
        // 验证安全配置
        this.validateRequiredFields('security.jwt', ['secret', 'expiresIn']);
        this.validateRequiredFields('security.encryption', ['algorithm', 'key']);
        // 验证生产环境的安全配置
        if (this.config.app.environment === 'production') {
            if (this.config.security.jwt.secret === 'change-me-in-production') {
                this.logger.warn('Using default JWT secret in production environment');
            }
            if (this.config.security.encryption.key === 'change-me-in-production-32-chars-key') {
                this.logger.warn('Using default encryption key in production environment');
            }
        }
        this.logger.debug('Configuration validation completed');
    };
    /**
     * 验证必要的配置字段
     * @param path 配置路径
     * @param fields 必要的字段
     * @throws 如果必要的字段不存在则抛出错误
     */
    ConfigManager.prototype.validateRequiredFields = function (path, fields) {
        var section = this.get(path);
        if (!section) {
            throw new Error("Configuration section '".concat(path, "' is missing"));
        }
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var field = fields_1[_i];
            if (section[field] === undefined || section[field] === null) {
                throw new Error("Required configuration field '".concat(path, ".").concat(field, "' is missing"));
            }
        }
    };
    /**
     * 获取完整配置
     * @returns 应用配置
     */
    ConfigManager.prototype.getConfig = function () {
        this.ensureInitialized();
        return this.config;
    };
    /**
     * 获取特定配置项
     * @param path 配置路径，例如 'app.port'
     * @param defaultValue 默认值
     * @returns 配置值
     */
    ConfigManager.prototype.get = function (path, defaultValue) {
        this.ensureInitialized();
        var parts = path.split('.');
        var current = this.config;
        for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
            var part = parts_1[_i];
            if (current === undefined || current === null) {
                this.logger.debug("Configuration path '".concat(path, "' not found, using default value"), { defaultValue: defaultValue });
                return defaultValue;
            }
            current = current[part];
        }
        if (current === undefined || current === null) {
            this.logger.debug("Configuration value at '".concat(path, "' is null or undefined, using default value"), { defaultValue: defaultValue });
            return defaultValue;
        }
        return current;
    };
    /**
     * 更新配置
     * @param path 配置路径，例如 'app.port'
     * @param value 新值
     * @returns 是否成功更新
     */
    ConfigManager.prototype.set = function (path, value) {
        this.ensureInitialized();
        try {
            var parts = path.split('.');
            var current = this.config;
            for (var i = 0; i < parts.length - 1; i++) {
                var part = parts[i];
                if (!(part in current)) {
                    current[part] = {};
                }
                current = current[part];
            }
            var lastPart = parts[parts.length - 1];
            var oldValue = current[lastPart];
            current[lastPart] = value;
            this.logger.debug("Configuration updated: ".concat(path), { oldValue: oldValue, newValue: value });
            return true;
        }
        catch (error) {
            this.logger.error("Failed to update configuration at ".concat(path), { error: error instanceof Error ? error : String(error), value: value });
            return false;
        }
    };
    /**
     * 重载配置
     * 重新加载配置文件和环境变量
     * @returns 是否成功重载
     */
    ConfigManager.prototype.reload = function () {
        try {
            this.logger.info('Reloading configuration');
            this.config = this.loadConfig();
            this.validateConfig();
            this.logger.info('Configuration reloaded successfully');
            return true;
        }
        catch (error) {
            this.logger.error('Failed to reload configuration', { error: error instanceof Error ? error : String(error) });
            return false;
        }
    };
    /**
     * 保存配置到文件
     * @param filePath 文件路径
     * @param options 保存选项
     * @returns 是否成功
     */
    ConfigManager.prototype.saveConfig = function (filePath, options) {
        if (options === void 0) { options = {}; }
        this.ensureInitialized();
        var configPath = filePath || path.resolve(process.cwd(), 'config.json');
        try {
            // 确保目录存在
            var dir = path.dirname(configPath);
            if (!fs.existsSync(dir)) {
                this.logger.debug("Creating directory: ".concat(dir));
                fs.mkdirSync(dir, { recursive: true });
            }
            // 创建备份（如果需要）
            if (options.backup && fs.existsSync(configPath)) {
                var backupPath = "".concat(configPath, ".backup.").concat(Date.now());
                fs.copyFileSync(configPath, backupPath);
                this.logger.info("Created configuration backup at ".concat(backupPath));
            }
            // 写入配置文件
            var indent = options.pretty ? 2 : 0;
            fs.writeFileSync(configPath, JSON.stringify(this.config, null, indent), 'utf8');
            this.logger.info("Configuration saved to ".concat(configPath));
            return true;
        }
        catch (error) {
            this.logger.error("Failed to save configuration to ".concat(configPath), { error: error instanceof Error ? error : String(error) });
            return false;
        }
    };
    /**
     * 获取特定服务的配置
     * 用于获取特定服务（如Neo4j、Redis等）的完整配置
     * @param service 服务名称
     * @returns 服务配置
     */
    ConfigManager.prototype.getServiceConfig = function (service) {
        this.ensureInitialized();
        // 常见服务配置路径映射
        var servicePathMap = {
            'neo4j': 'database.neo4j',
            'postgres': 'database.postgres',
            'redis': 'database.redis',
            'chromadb': 'database.chromadb',
            'openai': 'ai.openai',
            'anthropic': 'ai.anthropic',
            's3': 'storage.s3',
        };
        var configPath = servicePathMap[service] || service;
        return this.get(configPath, {});
    };
    return ConfigManager;
}());
exports.ConfigManager = ConfigManager;
// 导出配置管理器实例
exports.config = ConfigManager.getInstance();
// 导出便捷访问方法
exports.getConfig = exports.config.getConfig.bind(exports.config);
exports.getServiceConfig = exports.config.getServiceConfig.bind(exports.config);
/**
 * 获取Neo4j知识图谱服务配置
 * 用于知识图谱服务初始化
 * @param validate 是否验证配置
 * @returns Neo4j配置对象
 */
function getNeo4jConfig(validate) {
    if (validate === void 0) { validate = true; }
    var neo4jConfig = exports.config.getServiceConfig('neo4j');
    if (!neo4jConfig) {
        throw new Error('Neo4j configuration is missing');
    }
    var finalConfig = {
        uri: neo4jConfig.uri,
        username: neo4jConfig.username,
        password: neo4jConfig.password,
        database: neo4jConfig.database || 'neo4j',
        vectorSearch: neo4jConfig.vectorSearch || {
            enabled: false,
            dimension: 1536,
            similarity: 'cosine'
        },
        plugins: neo4jConfig.plugins || {
            apoc: false,
            gds: false
        },
        connectionPool: neo4jConfig.connectionPool || {
            maxSize: 100,
            idleTimeout: 30000
        },
        logLevel: neo4jConfig.logLevel || 'info'
    };
    if (validate) {
        validateNeo4jConfig(finalConfig);
    }
    return finalConfig;
}
/**
 * 验证Neo4j配置
 * @param config Neo4j配置对象
 * @throws 如果配置无效则抛出错误
 */
function validateNeo4jConfig(config) {
    var _a;
    var logger = new logger_1.Logger('Neo4jConfig');
    // 验证必要字段
    var requiredFields = ['uri', 'username', 'password'];
    for (var _i = 0, requiredFields_1 = requiredFields; _i < requiredFields_1.length; _i++) {
        var field = requiredFields_1[_i];
        if (!config[field]) {
            throw new Error("Neo4j configuration missing required field: ".concat(field));
        }
    }
    // 验证URI格式
    if (!config.uri.startsWith('bolt://') &&
        !config.uri.startsWith('neo4j://') &&
        !config.uri.startsWith('neo4j+s://')) {
        throw new Error("Invalid Neo4j URI format: ".concat(config.uri, ". Must start with bolt://, neo4j:// or neo4j+s://"));
    }
    // 验证向量搜索配置（如果启用）
    if ((_a = config.vectorSearch) === null || _a === void 0 ? void 0 : _a.enabled) {
        if (!config.vectorSearch.dimension || config.vectorSearch.dimension <= 0) {
            throw new Error("Invalid vector dimension: ".concat(config.vectorSearch.dimension, ". Must be a positive number"));
        }
        if (!['cosine', 'euclidean'].includes(config.vectorSearch.similarity)) {
            throw new Error("Invalid similarity metric: ".concat(config.vectorSearch.similarity, ". Must be 'cosine' or 'euclidean'"));
        }
        logger.info('Neo4j vector search is enabled', {
            dimension: config.vectorSearch.dimension,
            similarity: config.vectorSearch.similarity
        });
    }
    // 验证连接池配置
    if (config.connectionPool) {
        if (config.connectionPool.maxSize <= 0) {
            logger.warn("Invalid connection pool maxSize: ".concat(config.connectionPool.maxSize, ". Using default value 100"));
            config.connectionPool.maxSize = 100;
        }
        if (config.connectionPool.idleTimeout <= 0) {
            logger.warn("Invalid connection pool idleTimeout: ".concat(config.connectionPool.idleTimeout, ". Using default value 30000"));
            config.connectionPool.idleTimeout = 30000;
        }
    }
    logger.debug('Neo4j configuration validated successfully');
}
/**
 * 创建Neo4j驱动实例
 * 注意：此函数需要安装neo4j-driver依赖才能使用
 * 取消注释并安装依赖后可使用
 * @param config Neo4j配置
 * @returns Neo4j驱动实例
 */
/*
export function createNeo4jDriver(config?: Neo4jConfig): Driver {
  const logger = new Logger('Neo4jDriver');
  
  // 如果未提供配置，则从配置管理器获取
  const neo4jConfig = config || getNeo4jConfig();
  
  // 创建驱动配置
  const driverConfig: Neo4jConfig = {
    maxConnectionPoolSize: neo4jConfig.connectionPool?.maxSize || 100,
    connectionAcquisitionTimeout: 60000,
    connectionTimeout: 30000,
    logging: {
      level: neo4jConfig.logLevel || 'info',
      logger: (level, message) => {
        switch(level) {
          case 'error': logger.error(message); break;
          case 'warn': logger.warn(message); break;
          case 'info': logger.info(message); break;
          case 'debug': logger.debug(message); break;
          default: logger.trace(message);
        }
      }
    }
  };
  
  // 创建驱动实例
  logger.info('Creating Neo4j driver', { uri: neo4jConfig.uri });
  const driver = neo4j.driver(
    neo4jConfig.uri,
    neo4j.auth.basic(neo4jConfig.username, neo4jConfig.password),
    driverConfig
  );
  
  return driver;
}
*/
/**
 * 验证Neo4j连接
 * 注意：此函数需要安装neo4j-driver依赖才能使用
 * 取消注释并安装依赖后可使用
 * @param driver Neo4j驱动实例
 * @param database 数据库名称
 * @returns 是否连接成功
 */
/*
export async function verifyNeo4jConnection(driver: Driver, database?: string): Promise<boolean> {
  const logger = new Logger('Neo4jConnection');
  const session = driver.session({ database });
  
  try {
    logger.debug('Verifying Neo4j connection');
    const result = await session.run('RETURN 1 as n');
    const value = result.records[0].get('n').toNumber();
    
    if (value === 1) {
      logger.info('Neo4j connection verified successfully');
      return true;
    } else {
      logger.error('Neo4j connection verification failed: unexpected result', { value });
      return false;
    }
  } catch (error) {
    logger.error('Failed to verify Neo4j connection', { error });
    return false;
  } finally {
    await session.close();
  }
}
*/ 
