// BASB 系统 MongoDB 初始化脚本
// 文件路径: init-mongo.js

// 连接到 admin 数据库进行认证
db = db.getSiblingDB('admin');

// 创建应用数据库
db = db.getSiblingDB('basb');

// 创建应用用户
db.createUser({
  user: process.env.MONGO_USERNAME || 'basb_user',
  pwd: process.env.MONGO_PASSWORD || 'basb_password',
  roles: [
    { role: 'readWrite', db: 'basb' },
    { role: 'dbAdmin', db: 'basb' }
  ]
});

// 创建集合
db.createCollection('users');
db.createCollection('notes');
db.createCollection('tags');
db.createCollection('projects');
db.createCollection('references');
db.createCollection('knowledge_nodes');
db.createCollection('knowledge_links');
db.createCollection('documents');
db.createCollection('search_index');
db.createCollection('ai_models');
db.createCollection('system_logs');
db.createCollection('audit_logs');

// 创建索引
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.notes.createIndex({ "user_id": 1 });
db.notes.createIndex({ "tags": 1 });
db.notes.createIndex({ "created_at": 1 });
db.notes.createIndex({ "updated_at": 1 });
db.tags.createIndex({ "user_id": 1 });
db.tags.createIndex({ "name": 1 });
db.projects.createIndex({ "user_id": 1 });
db.projects.createIndex({ "name": 1 });
db.references.createIndex({ "source_id": 1 });
db.references.createIndex({ "target_id": 1 });
db.knowledge_nodes.createIndex({ "user_id": 1 });
db.knowledge_nodes.createIndex({ "title": "text", "content": "text" });
db.knowledge_links.createIndex({ "source_node_id": 1 });
db.knowledge_links.createIndex({ "target_node_id": 1 });
db.documents.createIndex({ "user_id": 1 });
db.documents.createIndex({ "filename": 1 });
db.documents.createIndex({ "content": "text" });
db.search_index.createIndex({ "content": "text" });
db.search_index.createIndex({ "user_id": 1 });
db.ai_models.createIndex({ "name": 1 }, { unique: true });
db.system_logs.createIndex({ "timestamp": 1 });
db.system_logs.createIndex({ "level": 1 });
db.system_logs.createIndex({ "service": 1 });
db.audit_logs.createIndex({ "user_id": 1 });
db.audit_logs.createIndex({ "action": 1 });
db.audit_logs.createIndex({ "timestamp": 1 });

// 创建 TTL 索引用于日志自动过期
db.system_logs.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30 天后过期
db.audit_logs.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // 90 天后过期

// 插入初始管理员用户
db.users.insertOne({
  username: 'admin',
  email: 'admin@example.com',
  password: '$2b$10$rRvVr5.3BjUvQvq9Pv3dXuC8WuAZBIXL7DROxWc21VQIlyK3.JVVS', // 默认密码: admin123
  role: 'admin',
  first_name: 'System',
  last_name: 'Administrator',
  created_at: new Date(),
  updated_at: new Date(),
  last_login: null,
  status: 'active',
  settings: {
    theme: 'light',
    language: 'en',
    notifications_enabled: true
  }
});

// 插入系统配置
db.createCollection('system_config');
db.system_config.insertOne({
  key: 'app_settings',
  value: {
    app_name: 'Building a Second Brain',
    version: '1.0.0',
    maintenance_mode: false,
    registration_enabled: true,
    max_upload_size_mb: 50,
    allowed_file_types: ['pdf', 'doc', 'docx', 'txt', 'md', 'jpg', 'jpeg', 'png'],
    default_user_quota_mb: 1024,
    max_notes_per_user: 10000,
    max_projects_per_user: 100,
    max_tags_per_user: 500
  },
  updated_at: new Date()
});

// 插入示例标签
db.tags.insertMany([
  { name: '想法', color: '#FF5733', user_id: null, system: true, created_at: new Date() },
  { name: '任务', color: '#33FF57', user_id: null, system: true, created_at: new Date() },
  { name: '项目', color: '#3357FF', user_id: null, system: true, created_at: new Date() },
  { name: '资源', color: '#F3FF33', user_id: null, system: true, created_at: new Date() },
  { name: '区域', color: '#FF33F3', user_id: null, system: true, created_at: new Date() }
]);

// 插入示例知识节点
db.knowledge_nodes.insertOne({
  title: '欢迎使用 Building a Second Brain',
  content: '这是您的第二大脑系统。在这里，您可以组织您的想法、笔记和知识。\n\n开始使用：\n1. 创建笔记\n2. 添加标签\n3. 建立知识连接\n4. 探索您的知识图谱',
  type: 'note',
  user_id: null,
  system: true,
  created_at: new Date(),
  updated_at: new Date()
});

// 插入 AI 模型配置
db.ai_models.insertMany([
  {
    name: 'text-embedding',
    description: '文本嵌入模型，用于将文本转换为向量表示',
    version: '1.0.0',
    type: 'embedding',
    provider: 'internal',
    config: {
      dimensions: 384,
      model_path: '/app/models/text-embedding'
    },
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'text-generation',
    description: '文本生成模型，用于生成文本内容',
    version: '1.0.0',
    type: 'generation',
    provider: 'openai',
    config: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1000
    },
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'text-summarization',
    description: '文本摘要模型，用于生成文本摘要',
    version: '1.0.0',
    type: 'summarization',
    provider: 'internal',
    config: {
      model_path: '/app/models/text-summarization',
      max_length: 200
    },
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
  }
]);

console.log('MongoDB 初始化完成');