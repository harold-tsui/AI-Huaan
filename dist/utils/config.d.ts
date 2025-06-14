/**
 * Config - 配置管理模块
 *
 * 加载和管理应用配置，支持环境变量、配置文件和默认值的多级配置
 * 提供类型安全的配置访问和验证
 */
export interface AppConfig {
    app: {
        name: string;
        version: string;
        environment: 'development' | 'test' | 'production';
        port: number;
        host: string;
        baseUrl: string;
    };
    database: {
        postgres: {
            host: string;
            port: number;
            username: string;
            password: string;
            database: string;
            ssl: boolean;
            poolSize: number;
        };
        redis: {
            host: string;
            port: number;
            password: string;
            db: number;
            prefix: string;
        };
        neo4j?: {
            uri: string;
            username: string;
            password: string;
            database?: string;
            vectorSearch?: {
                enabled: boolean;
                dimension: number;
                similarity: 'cosine' | 'euclidean';
            };
            plugins?: {
                apoc: boolean;
                gds: boolean;
            };
            connectionPool?: {
                maxSize: number;
                idleTimeout: number;
            };
            logLevel?: 'error' | 'warn' | 'info' | 'debug' | 'trace';
        };
        chromadb?: {
            host: string;
            port: number;
        };
    };
    ai: {
        openai?: {
            apiKey: string;
            organization?: string;
            baseURL?: string;
            models: {
                embedding: string;
                completion: string;
            };
        };
        anthropic?: {
            apiKey: string;
            baseURL: string;
            models: {
                completion: string;
            };
        };
        local?: {
            endpoint: string;
            models: {
                embedding?: string;
                completion?: string;
            };
        };
        routing: {
            defaultProvider: 'openai' | 'anthropic' | 'local';
            fallbackProvider: 'openai' | 'anthropic' | 'local';
        };
    };
    storage: {
        type: 'local' | 's3' | 'minio';
        basePath: string;
        s3?: {
            bucket: string;
            region: string;
            accessKey: string;
            secretKey: string;
            endpoint?: string;
        };
    };
    logging: {
        level: string;
        console: boolean;
        file: boolean;
        filePath: string;
        maxSize: string;
        maxFiles: number;
        format: 'json' | 'simple' | 'detailed';
    };
    security: {
        jwt: {
            secret: string;
            expiresIn: string;
            refreshExpiresIn: string;
        };
        encryption: {
            algorithm: string;
            key: string;
        };
        cors: {
            origins: string[];
            methods: string[];
        };
    };
    cache: {
        ttl: number;
        checkPeriod: number;
    };
    mcp: {
        services: Record<string, any>;
    };
}
/**
 * 配置管理类
 * 负责加载、验证、管理和持久化应用配置
 */
export declare class ConfigManager {
    private static instance;
    private config;
    private logger;
    private initialized;
    private constructor();
    /**
     * 获取配置管理实例
     * @returns 配置管理实例
     */
    static getInstance(): ConfigManager;
    /**
     * 确保配置管理器已初始化
     * @throws 如果配置管理器未初始化则抛出错误
     */
    private ensureInitialized;
    /**
     * 加载配置
     * @returns 应用配置
     */
    private loadConfig;
    /**
     * 加载环境变量
     */
    private loadEnv;
    /**
     * 将环境变量合并到配置中
     * @param defaultConfig 默认配置
     * @returns 合并后的配置
     */
    private mergeWithEnvVars;
    /**
     * 深度合并对象
     * @param target 目标对象
     * @param source 源对象
     */
    private deepMerge;
    /**
     * 验证配置
     * 检查必要的配置项是否存在且有效
     * @throws 如果配置无效则抛出错误
     */
    private validateConfig;
    /**
     * 验证必要的配置字段
     * @param path 配置路径
     * @param fields 必要的字段
     * @throws 如果必要的字段不存在则抛出错误
     */
    private validateRequiredFields;
    /**
     * 获取完整配置
     * @returns 应用配置
     */
    getConfig(): AppConfig;
    /**
     * 获取特定配置项
     * @param path 配置路径，例如 'app.port'
     * @param defaultValue 默认值
     * @returns 配置值
     */
    get<T>(path: string, defaultValue?: T): T;
    /**
     * 更新配置
     * @param path 配置路径，例如 'app.port'
     * @param value 新值
     * @returns 是否成功更新
     */
    set<T>(path: string, value: T): boolean;
    /**
     * 重载配置
     * 重新加载配置文件和环境变量
     * @returns 是否成功重载
     */
    reload(): boolean;
    /**
     * 保存配置到文件
     * @param filePath 文件路径
     * @param options 保存选项
     * @returns 是否成功
     */
    saveConfig(filePath?: string, options?: {
        pretty?: boolean;
        backup?: boolean;
    }): boolean;
    /**
     * 获取特定服务的配置
     * 用于获取特定服务（如Neo4j、Redis等）的完整配置
     * @param service 服务名称
     * @returns 服务配置
     */
    getServiceConfig<T>(service: string): T | null;
}
export declare const config: ConfigManager;
export declare const getConfig: () => AppConfig;
export declare const getServiceConfig: <T>(service: string) => T | null;
/**
 * 获取Neo4j知识图谱服务配置
 * 用于知识图谱服务初始化
 * @param validate 是否验证配置
 * @returns Neo4j配置对象
 */
export declare function getNeo4jConfig(validate?: boolean): Neo4jConfig;
/**
 * 验证Neo4j配置
 * @param config Neo4j配置对象
 * @throws 如果配置无效则抛出错误
 */
/**
 * Neo4j配置类型
 */
export interface Neo4jConfig {
    uri: string;
    username: string;
    password: string;
    database?: string;
    vectorSearch?: {
        enabled: boolean;
        dimension: number;
        similarity: 'cosine' | 'euclidean';
    };
    plugins?: {
        apoc: boolean;
        gds: boolean;
    };
    connectionPool?: {
        maxSize: number;
        idleTimeout: number;
    };
    logLevel?: 'error' | 'warn' | 'info' | 'debug' | 'trace';
}
/**
 * 验证Neo4j配置
 * @param config Neo4j配置对象
 * @throws 如果配置无效则抛出错误
 */
export declare function validateNeo4jConfig(config: Neo4jConfig): void;
/**
 * 创建Neo4j驱动实例
 * 注意：此函数需要安装neo4j-driver依赖才能使用
 * 取消注释并安装依赖后可使用
 * @param config Neo4j配置
 * @returns Neo4j驱动实例
 */
/**
 * 验证Neo4j连接
 * 注意：此函数需要安装neo4j-driver依赖才能使用
 * 取消注释并安装依赖后可使用
 * @param driver Neo4j驱动实例
 * @param database 数据库名称
 * @returns 是否连接成功
 */
