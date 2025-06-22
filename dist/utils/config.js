"use strict";
/**
 * Config - 配置管理模块
 *
 * 加载和管理应用配置，支持环境变量、配置文件和默认值的多级配置
 * 提供类型安全的配置访问和验证
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
exports.ConfigManager = exports.config = void 0;
exports.getNeo4jConfig = getNeo4jConfig;
exports.validateNeo4jConfig = validateNeo4jConfig;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
const logger_1 = require("./logger"); // Added getGlobalLogger and LogLevel
// 默认配置
exports.config = {
    app: {
        name: 'BASB',
        version: '1.0.0',
        environment: 'development',
        port: 8081, // Changed port from 8080 to 8081
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
class ConfigManager {
    constructor(configFilePath) {
        this.initialized = false;
        this.configFilePath = configFilePath;
        console.log('[ConfigManager.constructor] Entry. Initialized:', this.initialized);
        try {
            // Step 1: Load environment variables first (uses console.log)
            console.log('[ConfigManager.constructor] Before loadEnv. Initialized:', this.initialized);
            this.loadEnv();
            console.log('[ConfigManager.constructor] After loadEnv. Initialized:', this.initialized);
            // Step 2: Initialize logger FIRST (even before full config, it uses global defaults or its own internal defaults)
            console.log('[ConfigManager.constructor] Before new Logger. Initialized:', this.initialized);
            this.logger = new logger_1.Logger('ConfigManager');
            // At this point, logger might be using default settings from logger.ts if config.logging is not yet processed.
            // This is acceptable for early stage logging within ConfigManager itself.
            this.logger.info('[ConfigManager] Logger initialized. Proceeding with config loading...');
            console.log('[ConfigManager.constructor] After new Logger. Initialized:', this.initialized);
            // Step 3: Initialize config with defaults
            console.log('[ConfigManager.constructor] Before defaultConfig assignment. Initialized:', this.initialized);
            this.config = JSON.parse(JSON.stringify(exports.config));
            console.log('[ConfigManager.constructor] After defaultConfig assignment. Initialized:', this.initialized);
            // Step 4: Load and merge config file, then apply env overrides
            console.log('[ConfigManager.constructor] Before loadConfigFromFile. Initialized:', this.initialized);
            this.loadConfigFromFile(); // This internally calls applyEnvOverrides
            console.log('[ConfigManager.constructor] After loadConfigFromFile. Initialized:', this.initialized);
            // Step 5: Validate the final config
            try {
                console.log('[ConfigManager.constructor] Before validateConfig. Current Initialized:', this.initialized);
                this.validateConfig();
                // Logger should be available here if validation passed
                const logInfo = this.logger ? this.logger.info.bind(this.logger) : console.log;
                logInfo('[ConfigManager] Configuration validated successfully');
                // Step 6: Mark as initialized AFTER successful validation
                console.log('[ConfigManager.constructor] Before this.initialized = true (post-validation). Current Initialized:', this.initialized);
                this.initialized = true;
                console.log('[ConfigManager.constructor] After this.initialized = true (post-validation). Current Initialized:', this.initialized);
            }
            catch (error) {
                this.initialized = false; // Ensure initialized state is false on validation failure
                const logError = this.logger ? this.logger.error.bind(this.logger) : console.error;
                logError('[ConfigManager] Configuration validation failed', {
                    error: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined
                });
                throw error; // Re-throw to be caught by outer try-catch
            }
        }
        catch (error) {
            // If any step fails, ensure we're not marked as initialized
            this.initialized = false;
            // Use logger if available, otherwise fallback to console
            const logError = this.logger ? this.logger.error.bind(this.logger) : console.error;
            logError('[ConfigManager] Failed to initialize configuration manager', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error; // Propagate the error
        }
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            try {
                ConfigManager.instance = new ConfigManager();
            }
            catch (error) {
                // It's crucial to log this error, as it might not be caught elsewhere if it happens during static initialization.
                console.error(`[ConfigManager.getInstance] CRITICAL - Failed to create ConfigManager instance: ${(error instanceof Error ? error.message : String(error))}`, error);
                // Depending on the application's needs, you might want to throw a more specific error
                // or allow the application to attempt to run in a degraded state if some default config can be used.
                // For now, re-throwing ensures the application doesn't proceed with an uninitialized/badly initialized ConfigManager.
                throw new Error(`CRITICAL - Failed to initialize ConfigManager: ${(error instanceof Error ? error.message : String(error))}`);
            }
        }
        return ConfigManager.instance;
    }
    /**
     * 确保配置管理器已初始化
     * @throws 如果配置管理器未初始化则抛出错误
     */
    ensureInitialized() {
        // CRITICAL DEBUG LOG: Do not remove without careful consideration.
        console.log(`[ConfigManager.ensureInitialized ENTRY] initialized: ${this.initialized}, instance exists: ${!!ConfigManager.instance}`);
        const currentStack = new Error().stack;
        console.log(`[ConfigManager.ensureInitialized STACK]:\n${currentStack}`);
        console.log('[ConfigManager.ensureInitialized] Check: this.initialized =', this.initialized);
        if (!this.initialized) {
            console.error('[ConfigManager.ensureInitialized] ERROR: Not initialized!');
            throw new Error('Configuration manager is not initialized');
        }
    }
    /**
     * 加载环境变量 (.env file)
     * This method is called early in the constructor.
     * It uses console for logging as this.logger might not be initialized yet.
     */
    loadEnv() {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            dotenv.config({ path: envPath });
            // Use console.log as logger might not be initialized or configured yet.
            console.log(`[ConfigManager/loadEnv] Loaded environment variables from ${envPath}`);
        }
        else {
            console.log('[ConfigManager/loadEnv] No .env file found, using system environment variables.');
        }
    }
    /**
     * Loads configuration from a JSON file and merges it into this.config.
     * this.config should already be initialized with defaults before this method is called.
     * It then calls applyEnvOverrides to ensure environment variables take precedence.
     * Uses this.logger for logging, assuming it's initialized.
     */
    loadConfigFromFile() {
        const configFilePathToLoad = this.configFilePath || process.env.CONFIG_FILE || path.resolve(process.cwd(), 'config.json');
        const logInfo = this.logger ? this.logger.info.bind(this.logger) : console.log;
        const logError = this.logger ? this.logger.error.bind(this.logger) : console.error;
        if (fs.existsSync(configFilePathToLoad)) {
            try {
                const fileConfigStr = fs.readFileSync(configFilePathToLoad, 'utf8');
                const fileConfig = JSON.parse(fileConfigStr);
                this.deepMerge(this.config, fileConfig); // Merge file config into this.config (which has defaults)
                logInfo(`[ConfigManager/loadConfigFromFile] Loaded and merged configuration from ${configFilePathToLoad}`);
            }
            catch (error) {
                logError(`[ConfigManager/loadConfigFromFile] Failed to load or parse configuration from ${configFilePathToLoad}`, { error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined });
            }
        }
        else {
            logInfo(`[ConfigManager/loadConfigFromFile] Configuration file not found at ${configFilePathToLoad}. Using defaults and environment variables.`);
        }
        // After loading defaults and file (if any), apply environment variable overrides.
        this.applyEnvOverrides();
    }
    /**
     * Applies environment variable overrides to this.config.
     * This method is called after defaults and file configurations are loaded.
     * Modifies this.config in place.
     */
    applyEnvOverrides() {
        const config = this.config; // Alias for convenience, modifies this.config directly
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
        // MCP服务配置
        // 示例环境变量: MCP_SERVICE_OBSIDIAN_CONFIG='{"url":"http://localhost:27123","apiKey":"your_api_key"}'
        // MCP_SERVICE_MYCUSTOMSERVICE_CONFIG='{"param1":"value1"}'
        config.mcp.services = {}; // Initialize as an empty object
        for (const envVar in process.env) {
            if (envVar.startsWith('MCP_SERVICE_') && envVar.endsWith('_CONFIG')) {
                const serviceName = envVar.substring('MCP_SERVICE_'.length, envVar.length - '_CONFIG'.length).toLowerCase();
                const serviceConfigJson = process.env[envVar];
                if (serviceConfigJson) {
                    try {
                        const serviceConfig = JSON.parse(serviceConfigJson);
                        config.mcp.services[serviceName] = serviceConfig;
                        const logger = this.logger;
                        // Assuming logger is initialized by the time applyEnvOverrides is called
                        const logFn = logger ? logger.info.bind(logger) : console.log;
                        logFn(`[ConfigManager] Loaded MCP service configuration for '${serviceName}' from environment variable ${envVar}`);
                    }
                    catch (error) {
                        const logger = this.logger;
                        // Assuming logger is initialized by the time applyEnvOverrides is called
                        const logErrorFn = logger ? logger.error.bind(logger) : console.error;
                        logErrorFn(`[ConfigManager] Failed to parse MCP service configuration for '${serviceName}' from environment variable ${envVar}`, { error: error instanceof Error ? error : String(error), value: serviceConfigJson });
                    }
                }
            }
        }
    }
    /**
     * 深度合并对象
     * @param target 目标对象
     * @param source 源对象
     */
    deepMerge(target, source) {
        for (const key in source) {
            if (source[key] instanceof Object && key in target) {
                this.deepMerge(target[key], source[key]);
            }
            else {
                target[key] = source[key];
            }
        }
    }
    /**
     * 验证配置
     * 检查必要的配置项是否存在且有效
     * @throws 如果配置无效则抛出错误
     */
    _getConfigValueAtPath(obj, path) {
        const keys = path.split('.');
        let current = obj;
        for (const key of keys) {
            if (current === undefined || current === null || typeof current !== 'object') {
                // If logger is available and path is not for logging itself (to avoid recursion)
                if (this.logger && !path.startsWith('logging')) {
                    this.logger.debug(`_getConfigValueAtPath: Path '${path}' not found or not an object at '${key}'.`);
                }
                else if (!path.startsWith('logging')) {
                    console.debug(`[ConfigManager/_getConfigValueAtPath/pre-logger] Path '${path}' not found at '${key}'.`);
                }
                return undefined;
            }
            current = current[key];
        }
        return current;
    }
    validateConfig() {
        // Validation now uses this.config directly via _getConfigValueAtPath helper
        // 验证应用基础配置
        this.validateRequiredFields('app', ['name', 'port', 'environment']);
        // 验证数据库配置
        this.validateRequiredFields('database.postgres', ['host', 'port', 'username', 'database']);
        this.validateRequiredFields('database.redis', ['host', 'port']);
        // 验证Neo4j配置（如果存在）
        if (this._getConfigValueAtPath(this.config, 'database.neo4j')) {
            this.validateRequiredFields('database.neo4j', ['uri', 'username', 'password']);
            // 验证Neo4j向量搜索配置（如果启用）
            if (this._getConfigValueAtPath(this.config, 'database.neo4j.vectorSearch.enabled')) {
                this.validateRequiredFields('database.neo4j.vectorSearch', ['dimension', 'similarity']);
            }
        }
        // 验证存储配置
        this.validateRequiredFields('storage', ['type', 'basePath']);
        // 验证S3配置（如果使用S3存储）
        const storageType = this._getConfigValueAtPath(this.config, 'storage.type');
        if (storageType === 's3' || storageType === 'minio') {
            if (!this._getConfigValueAtPath(this.config, 'storage.s3')) {
                throw new Error('S3 configuration (storage.s3) is required when storage.type is s3 or minio');
            }
            this.validateRequiredFields('storage.s3', ['bucket', 'region', 'accessKey', 'secretKey']);
        }
        const currentLogLevel = this._getConfigValueAtPath(this.config, 'logging.level');
        if (!Object.values(logger_1.LogLevel).includes(currentLogLevel)) {
            throw new Error(`Invalid logging.level: ${currentLogLevel}. Must be one of ${Object.values(logger_1.LogLevel).join(', ')}`);
        }
        // 验证安全配置
        this.validateRequiredFields('security.jwt', ['secret', 'expiresIn', 'refreshExpiresIn']);
        this.validateRequiredFields('security.encryption', ['algorithm', 'key']);
        // 验证AI配置
        this.validateRequiredFields('ai.routing', ['defaultProvider', 'fallbackProvider']);
        // 验证特定AI提供商的配置（如果已定义）
        if (this._getConfigValueAtPath(this.config, 'ai.openai')) {
            this.validateRequiredFields('ai.openai', ['apiKey', 'models']);
            this.validateRequiredFields('ai.openai.models', ['embedding', 'completion']);
        }
        if (this._getConfigValueAtPath(this.config, 'ai.anthropic')) {
            this.validateRequiredFields('ai.anthropic', ['apiKey', 'models']);
            this.validateRequiredFields('ai.anthropic.models', ['completion']);
        }
        if (this._getConfigValueAtPath(this.config, 'ai.local')) {
            this.validateRequiredFields('ai.local', ['endpoint', 'models']);
        }
        // 验证日志格式
        const validLogFormats = ['json', 'simple', 'detailed'];
        const currentLogFormat = this._getConfigValueAtPath(this.config, 'logging.format');
        if (!validLogFormats.includes(currentLogFormat)) {
            throw new Error(`Invalid logging.format: ${currentLogFormat}. Must be one of ${validLogFormats.join(', ')}`);
        }
        // 验证环境
        const validEnvironments = ['development', 'test', 'production'];
        const currentEnvironment = this._getConfigValueAtPath(this.config, 'app.environment');
        if (!validEnvironments.includes(currentEnvironment)) {
            throw new Error(`Invalid app.environment: ${currentEnvironment}. Must be one of ${validEnvironments.join(', ')}`);
        }
        // 验证存储类型
        const validStorageTypes = ['local', 's3', 'minio'];
        const currentStorageType = this._getConfigValueAtPath(this.config, 'storage.type');
        if (!validStorageTypes.includes(currentStorageType)) {
            throw new Error(`Invalid storage.type: ${currentStorageType}. Must be one of ${validStorageTypes.join(', ')}`);
        }
        // 验证AI提供商
        const validAiProviders = ['openai', 'anthropic', 'local'];
        const defaultProvider = this._getConfigValueAtPath(this.config, 'ai.routing.defaultProvider');
        const fallbackProvider = this._getConfigValueAtPath(this.config, 'ai.routing.fallbackProvider');
        if (!validAiProviders.includes(defaultProvider)) {
            throw new Error(`Invalid ai.routing.defaultProvider: ${defaultProvider}. Must be one of ${validAiProviders.join(', ')}`);
        }
        if (!validAiProviders.includes(fallbackProvider)) {
            throw new Error(`Invalid ai.routing.fallbackProvider: ${fallbackProvider}. Must be one of ${validAiProviders.join(', ')}`);
        }
        const logInfo = this.logger ? this.logger.info.bind(this.logger) : console.log;
        logInfo('[ConfigManager/validateConfig] Configuration validation passed.');
    }
    /**
     * 验证指定路径下的必需字段
     * @param basePath 基础路径
     * @param fields 字段列表
     * @throws 如果字段缺失或无效则抛出错误
     */
    validateRequiredFields(basePath, fields) {
        // Validation now uses this.config directly via _getConfigValueAtPath helper
        for (const field of fields) {
            const fullPath = `${basePath}.${field}`;
            const value = this._getConfigValueAtPath(this.config, fullPath);
            if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
                const errorMessage = `Missing or invalid required configuration field: ${fullPath}`;
                const logError = this.logger ? this.logger.error.bind(this.logger) : console.error;
                logError(`[ConfigManager/validateRequiredFields] ${errorMessage}`);
                throw new Error(errorMessage);
            }
        }
    }
    /**
     * 获取完整配置
     * @returns 应用配置
     */
    getConfig() {
        this.ensureInitialized();
        return this.config;
    }
    /**
     * 获取特定配置项
     * @param path 配置路径，例如 'app.port'
     * @param defaultValue 默认值
     * @returns 配置值或默认值，如果路径未找到且无默认值则返回 undefined
     */
    get(path, defaultValue) {
        // CRITICAL DEBUG LOG: Do not remove without careful consideration.
        // console.log(`[ConfigManager.get ENTRY] path: ${path}, initialized: ${this.initialized}, instance exists: ${!!ConfigManager.instance}`);
        // const currentStack = new Error().stack;
        // console.log(`[ConfigManager.get STACK]:\n${currentStack}`);
        // 允许在初始化完成前访问日志配置，因为日志本身可能需要配置
        if (path.startsWith('logging.') || path === 'app.environment') {
            // console.log(`[ConfigManager.get] Early access for logging or environment: ${path}`);
        }
        else {
            // 对于其他所有配置，确保已初始化
            this.ensureInitialized();
        }
        const logger = this.logger; // Type assertion
        let current = this.config;
        const segments = path.split('.');
        for (const segment of segments) {
            if (current && typeof current === 'object' && segment in current) {
                current = current[segment];
            }
            else {
                // 如果路径无效或值不存在
                if (defaultValue === undefined) {
                    // 如果没有提供默认值，则根据情况记录警告或错误
                    const message = `[ConfigManager.get] Configuration value at '${path}' is undefined and no default value provided.`;
                    // Use asserted logger or console if early access
                    if (path.startsWith('logging.') || path === 'app.environment') {
                        console.warn(message);
                    }
                    else {
                        logger.warn(message);
                    }
                    return undefined; // 或者可以抛出错误，取决于严格性要求
                }
                // 使用默认值
                // Log this only if logger is available and initialized, or use console for early access
                if (path.startsWith('logging.') || path === 'app.environment') {
                    console.debug(`[ConfigManager.get] Configuration value at '${path}' is undefined, using default value`, { defaultValue });
                }
                else if (this.initialized) { // Check this.initialized as well for non-early access
                    logger.debug(`Configuration value at '${path}' is undefined, using default value`, { defaultValue });
                }
                else {
                    // Fallback for very early stage before full initialization but not logging path
                    console.debug(`[ConfigManager.get] Pre-init access for '${path}', using default. Value undefined.`);
                }
                return defaultValue;
            }
        }
        // If loop completes, current holds the value. Log before returning.
        if (path.startsWith('logging.') || path === 'app.environment') {
            console.debug(`[ConfigManager.get("${path}")] returning. Value defined: ${current !== undefined && current !== null}`);
        }
        else {
            logger.debug(`[ConfigManager.get("${path}")] returning. Value defined: ${current !== undefined && current !== null}`);
        }
        return current;
    }
    /**
     * 更新配置
     * @param path 配置路径，例如 'app.port'
     * @param value 新值
     * @returns 是否成功更新
     */
    set(path, value) {
        this.ensureInitialized();
        const keys = path.split('.');
        let current = this.config; // Start with 'any' for flexible property access
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
                current[key] = {};
            }
            current = current[key];
        }
        const lastKey = keys[keys.length - 1];
        const oldValue = current[lastKey];
        current[lastKey] = value;
        if (this.logger) {
            this.logger.debug(`Configuration updated: ${path}`, { oldValue, newValue: value });
        }
        else {
            console.debug(`[ConfigManager.set] Configuration updated: ${path}`, { oldValue, newValue: value });
        }
    }
    /**
     * Checks if the ConfigManager has been successfully initialized.
     * @returns True if initialized, false otherwise.
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * 重载配置
     * 重新加载配置文件和环境变量
     * @returns 是否成功重载
     */
    reload() {
        try {
            if (this.logger) {
                this.logger.info('Reloading configuration');
            }
            else {
                console.info('[ConfigManager.reload] Reloading configuration');
            }
            this.loadEnv(); // Reload environment variables
            this.config = JSON.parse(JSON.stringify(exports.config)); // Reset to defaults
            this.loadConfigFromFile(); // Load from file and apply environment overrides
            this.validateConfig(); // validateConfig itself uses get() which has logger checks
            if (this.logger) {
                this.logger.info('Configuration reloaded successfully');
            }
            else {
                console.info('[ConfigManager.reload] Configuration reloaded successfully');
            }
            return true;
        }
        catch (error) {
            if (this.logger) {
                this.logger.error('Failed to reload configuration', { error: error instanceof Error ? error : String(error) });
            }
            else {
                console.error('[ConfigManager.reload] Failed to reload configuration', { error: error instanceof Error ? error : String(error) });
            }
            // In case of reload failure, we should probably mark the config as uninitialized
            // or revert to a last known good state if possible, though that's more complex.
            // For now, just log and return false. The existing (potentially stale) config remains.
            return false;
        }
    }
    /**
     * 保存配置到文件
     * @param filePath 文件路径
     * @param options 保存选项
     * @returns 是否成功
     */
    saveConfig(filePath, options = {}) {
        this.ensureInitialized();
        const configPath = filePath || path.resolve(process.cwd(), 'config.json');
        try {
            // 确保目录存在
            const dir = path.dirname(configPath);
            if (!fs.existsSync(dir)) {
                if (this.logger) {
                    this.logger.debug(`Creating directory: ${dir}`);
                }
                else {
                    console.debug(`[ConfigManager.saveConfig] Creating directory: ${dir}`);
                }
                fs.mkdirSync(dir, { recursive: true });
            }
            // 创建备份（如果需要）
            if (options.backup && fs.existsSync(configPath)) {
                const backupPath = `${configPath}.backup.${Date.now()}`;
                fs.copyFileSync(configPath, backupPath);
                if (this.logger) {
                    this.logger.info(`Created configuration backup at ${backupPath}`);
                }
                else {
                    console.info(`[ConfigManager.saveConfig] Created configuration backup at ${backupPath}`);
                }
            }
            // 写入配置文件
            const indent = options.pretty ? 2 : 0;
            fs.writeFileSync(configPath, JSON.stringify(this.config, null, indent), 'utf8');
            if (this.logger) {
                this.logger.info(`Configuration saved to ${configPath}`);
            }
            else {
                console.info(`[ConfigManager.saveConfig] Configuration saved to ${configPath}`);
            }
            return true;
        }
        catch (error) {
            if (this.logger) {
                this.logger.error(`Failed to save configuration to ${configPath}`, { error: error instanceof Error ? error : String(error) });
            }
            else {
                console.error(`[ConfigManager.saveConfig] Failed to save configuration to ${configPath}`, { error: error instanceof Error ? error : String(error) });
            }
            return false;
        }
    }
    /**
     * 获取特定服务的配置
     * 用于获取特定服务（如Neo4j、Redis等）的完整配置
     * @param service 服务名称
     * @returns 服务配置，如果未找到则为 undefined
     */
    getServiceConfig(service) {
        this.ensureInitialized();
        // 常见服务配置路径映射
        const servicePathMap = {
            'neo4j': 'database.neo4j',
            'postgres': 'database.postgres',
            'redis': 'database.redis',
            'chromadb': 'database.chromadb',
            'openai': 'ai.openai',
            'anthropic': 'ai.anthropic',
            's3': 'storage.s3',
        };
        const configPath = servicePathMap[service] || service;
        // Pass undefined as default to allow get() to return undefined if not found
        return this.get(configPath, undefined);
    }
}
exports.ConfigManager = ConfigManager;
// 导出配置管理器实例
// export const config = ConfigManager.getInstance(); // Commented out to prevent auto-initialization
// 导出便捷访问方法
// export const getConfig = config.getConfig.bind(config); // Commented out as it depends on 'config'
// export const getServiceConfig = config.getServiceConfig.bind(config); // Commented out as it depends on 'config'
/**
 * 获取Neo4j知识图谱服务配置
 * 用于知识图谱服务初始化
 * @param validate 是否验证配置
 * @returns Neo4j配置对象
 */
function getNeo4jConfig(validate = true) {
    const configManager = ConfigManager.getInstance();
    const neo4jConfig = configManager.getServiceConfig('neo4j');
    if (!neo4jConfig) {
        throw new Error('Neo4j configuration is missing');
    }
    const finalConfig = {
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
    const logger = new logger_1.Logger('Neo4jConfig');
    // 验证必要字段
    const requiredFields = ['uri', 'username', 'password'];
    for (const field of requiredFields) {
        if (!config[field]) {
            throw new Error(`Neo4j configuration missing required field: ${field}`);
        }
    }
    // 验证URI格式
    if (!config.uri.startsWith('bolt://') &&
        !config.uri.startsWith('neo4j://') &&
        !config.uri.startsWith('neo4j+s://')) {
        throw new Error(`Invalid Neo4j URI format: ${config.uri}. Must start with bolt://, neo4j:// or neo4j+s://`);
    }
    // 验证向量搜索配置（如果启用）
    if (config.vectorSearch?.enabled) {
        if (!config.vectorSearch.dimension || config.vectorSearch.dimension <= 0) {
            throw new Error(`Invalid vector dimension: ${config.vectorSearch.dimension}. Must be a positive number`);
        }
        if (!['cosine', 'euclidean'].includes(config.vectorSearch.similarity)) {
            throw new Error(`Invalid similarity metric: ${config.vectorSearch.similarity}. Must be 'cosine' or 'euclidean'`);
        }
        logger.info('Neo4j vector search is enabled', {
            dimension: config.vectorSearch.dimension,
            similarity: config.vectorSearch.similarity
        });
    }
    // 验证连接池配置
    if (config.connectionPool) {
        if (config.connectionPool.maxSize <= 0) {
            logger.warn(`Invalid connection pool maxSize: ${config.connectionPool.maxSize}. Using default value 100`);
            config.connectionPool.maxSize = 100;
        }
        if (config.connectionPool.idleTimeout <= 0) {
            logger.warn(`Invalid connection pool idleTimeout: ${config.connectionPool.idleTimeout}. Using default value 30000`);
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
//# sourceMappingURL=config.js.map