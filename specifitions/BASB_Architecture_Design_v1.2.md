# BASB Architecture Design v1.0

## 文档信息
- **文档版本**: v1.2
- **创建日期**: 2024-12-19
- **更新日期**: 2024-12-20
- **创建者**: BASB System Architect
- **阶段**: Stage 2 - System Architecture Design
- **状态**: 架构设计完成，待详细设计
- **审核状态**: 待审核

## 1. 架构概述

### 1.1 架构愿景
构建基于MCP原子服务的分布式第二大脑系统，支持完整的CODE框架（Capture, Organize, Distill, Express），通过微服务架构实现高可用、可扩展的个人知识管理平台。

### 1.2 核心架构原则
- **微服务架构**: 基于MCP协议的原子服务设计
- **事件驱动**: 异步消息传递和事件溯源
- **分层架构**: 清晰的职责分离和依赖管理
- **知识图谱**: 以图数据库为核心的知识存储
- **AI优先**: 深度集成AI能力的智能化系统

### 1.3 技术栈选择

#### 轻量化技术栈分层设计

##### 极简版 (个人入门)
**目标用户**: 个人用户，注重简单易用
**资源需求**: 1GB RAM, 5GB 存储

- **部署方式**: 直接进程部署 + 系统服务管理 (systemd/launchd)
- **数据存储**: 
  - 知识图谱: Obsidian (本地Vault)
    - `OBSIDIAN_VAULT_PATH`: Obsidian Vault的本地路径。
    - `OBSIDIAN_API_KEY`: (可选) 如果Obsidian插件需要API密钥进行交互。
    - `OBSIDIAN_API_URL`: (可选) Obsidian本地API服务的URL，例如 `http://localhost:27123`。
    - `OBSIDIAN_VAULT_NAME`: Obsidian Vault的名称。
  - 文档存储: SQLite
  - 文件存储: 本地文件系统
  - 搜索: SQLite FTS (全文搜索)
- **AI集成**: 
  - LLM: 可选云端API (OpenAI/Claude) - 按需付费
  - 向量化: 简单TF-IDF或关键词匹配
- **缓存**: 应用内存缓存
- **监控**: 结构化日志文件

##### 标准版 (个人进阶)
**目标用户**: 进阶个人用户，需要更好性能
**资源需求**: 4GB RAM, 50GB 存储

- **部署方式**: Docker Compose
- **数据存储**:
  - 知识图谱: Obsidian + PostgreSQL (可选图谱扩展)
    - `OBSIDIAN_VAULT_PATH`: Obsidian Vault的本地路径。
    - `OBSIDIAN_API_KEY`: (可选) 如果Obsidian插件需要API密钥进行交互。
    - `OBSIDIAN_API_URL`: (可选) Obsidian本地API服务的URL，例如 `http://localhost:27123`。
    - `OBSIDIAN_VAULT_NAME`: Obsidian Vault的名称。
  - 文档存储: PostgreSQL
  - 向量存储: ChromaDB (本地部署)
  - 文件存储: 本地 + 可选云备份
  - 搜索: PostgreSQL 全文搜索
- **AI集成**:
  - LLM: 云端API (OpenAI/Claude) + 可选本地模型
  - 向量化: 本地 Sentence Transformers
- **缓存**: 单节点 Redis
- **监控**: 健康检查端点 + 简单仪表板
- **网关**: Nginx 反向代理

##### 专业版 (小团队协作)
**目标用户**: 小团队或高级用户
**资源需求**: 8GB RAM, 200GB 存储

- **部署方式**: Docker + Traefik (自动服务发现)
- **数据存储**:
  - 知识图谱: Obsidian + Neo4j (单节点)
    - `OBSIDIAN_VAULT_PATH`: Obsidian Vault的本地路径。
    - `OBSIDIAN_API_KEY`: (可选) 如果Obsidian插件需要API密钥进行交互。
    - `OBSIDIAN_API_URL`: (可选) Obsidian本地API服务的URL，例如 `http://localhost:27123`。
    - `OBSIDIAN_VAULT_NAME`: Obsidian Vault的名称。
  - 文档存储: PostgreSQL 集群
  - 向量存储: Qdrant
  - 文件存储: MinIO (本地对象存储)
  - 搜索: Tantivy (Rust搜索引擎)
- **AI集成**:
  - LLM: Ollama本地模型 (主要) + 云端API (备选)
  - 向量化: 多种embedding模型 (本地+云端)
  - AI网关: 智能路由层 (本地优先)
- **缓存**: Redis (持久化)
- **消息队列**: Redis Pub/Sub
- **监控**: Uptime Kuma + 日志聚合

#### 技术选型原则
1. **本地优先**: 减少云服务依赖，提高隐私性
2. **渐进式**: 支持从简单到复杂的平滑升级
3. **资源友好**: 优化内存和存储使用
4. **维护简单**: 减少运维复杂度
5. **成本控制**: 最小化基础设施成本

## 2. 系统架构设计

### 2.1 系统上下文图

```mermaid
C4Context
    title BASB System Context Diagram
    
    Person(user, "BASB用户", "个人知识工作者")
    
    System(basb, "BASB系统", "基于MCP的第二大脑系统")
    
    System_Ext(obsidian, "Obsidian", "知识图谱基础层")
    System_Ext(notion, "Notion", "协作平台")
    System_Ext(readwise, "Readwise", "阅读管理")
    System_Ext(github, "GitHub", "代码仓库")
    System_Ext(web, "Web浏览器", "网页内容")
    System_Ext(ai_services, "AI服务", "DeepSeek (默认), OpenAI, Gemini等")
    System_Ext(storage, "云存储", "文件存储服务")
    
    Rel(user, basb, "使用")
    Rel(basb, obsidian, "基础知识管理")
    Rel(basb, notion, "导入内容")
    Rel(basb, readwise, "获取高亮")
    Rel(basb, github, "分析代码")
    Rel(basb, web, "抓取内容")
    Rel(basb, ai_services, "AI处理")
    Rel(basb, storage, "存储文件")
```

### 2.2 MCP服务架构图

```mermaid
graph TB
    subgraph "用户接口层"
        UI[Web界面]
        API[REST API]
        WS[WebSocket]
    end
    
    subgraph "API网关层"
        Gateway[API Gateway]
        Auth[认证服务]
        RateLimit[限流控制]
    end
    
    subgraph "MCP服务层"
        subgraph "知识捕获服务组"
            WebCapture[网页捕获服务]
            FileCapture[文件捕获服务]
            APICapture[API捕获服务]
            RealtimeCapture[实时捕获服务]
        end
        
        subgraph "组织管理服务组"
            PARAService[PARA组织服务]
            TagService[标签管理服务]
            CategoryService[分类服务]
            SearchService[搜索服务]
            ObsidianService[Obsidian基础服务]
            Neo4jService[Neo4j扩展服务-可选]
        end
        
        subgraph "处理分析服务组"
            LinkService[链接分析服务]
            GraphService[知识图谱服务]
            AIService[AI处理服务]
            RecommendService[推荐服务]
        end
        
        subgraph "存储管理服务组"
            MetadataService[元数据服务]
            ContentService[内容存储服务]
            VersionService[版本控制服务]
            BackupService[备份服务]
        end
        
        subgraph "表达输出服务组"
            ExportService[导出服务]
            ShareService[分享服务]
            TemplateService[模板服务]
            PublishService[发布服务]
        end
    end
    
    subgraph "数据存储层"
        KnowledgeGraph[(Obsidian基础层\n+\nNeo4j扩展层\n-可选)]
        MongoDB[(MongoDB\n文档存储)]
        Pinecone[(Pinecone\n向量数据库)]
        Redis[(Redis\n缓存)]
        S3[(S3\n对象存储)]
        ES[(Elasticsearch\n搜索引擎)]
    end
    
    subgraph "外部服务"
        AIProviders[AI服务提供商]
        ExternalAPIs[外部API]
        CloudStorage[云存储]
    end
    
    UI --> Gateway

## 3. MCP 原子服务实现细节

本章节详细描述核心 MCP 原子服务的具体实现方案和技术选型，旨在弥合当前占位符实现与需求文档之间的差距。

### 3.1 KnowledgeIngestionService 实现方案

`KnowledgeIngestionService` 负责知识的捕获和初步处理。

#### 3.1.1 `captureWebContent` 方法
- **目标**: 从指定 URL 高效、准确地捕获网页主要内容。
- **技术选型**:
    - HTTP 请求: `axios`
    - HTML 解析与内容提取: `jsdom` + `Readability.js`
- **实现步骤**:
    1. 使用 `axios` 获取目标 URL 的 HTML 内容。
    2. 使用 `jsdom` 将 HTML 字符串解析为 DOM 对象。
    3. 使用 `Readability.js` 从 DOM 对象中提取主要内容、标题。
    4. 将提取的内容转换为 Markdown 或纯文本格式。
    5. 将提取信息（标题、内容、源 URL、捕获时间等）映射到 `KnowledgeItem` 对象。
    6. 调用 `IStorageService.storeDocument` 持久化 `KnowledgeItem`。
    7. 实现详细的错误处理和日志记录 (网络错误、解析错误、内容提取失败)。

#### 3.1.2 `parseDocument` 方法
- **目标**: 解析本地不同格式的文档，提取内容和元数据。
- **支持格式**: 初期支持 `.txt`, `.md`；中期支持 `.pdf`, `.docx`。
- **技术选型**:
    - `.txt`, `.md`: Node.js `fs` 模块。
    - `.pdf`: `pdf-parse` 库。
    - `.docx`: `mammoth` 库。
- **实现步骤**:
    1. 根据文件扩展名选择合适的解析库。
    2. 使用选定库异步读取并解析文件内容。
    3. 尝试从文档中提取元数据（标题、作者、创建日期等）。
    4. 将提取信息映射到 `KnowledgeItem` 对象。
    5. 调用 `IStorageService.storeDocument` 持久化。
    6. 实现文件读取和解析过程中的错误处理与日志记录。

#### 3.1.3 `processMedia` 方法
- **目标**: 处理媒体文件，如图片 OCR 和音视频转录（未来）。
- **技术选型**:
    - 图片 OCR: `tesseract.js`
    - 音频转录 (未来规划): 云端语音识别服务 (如 Google Cloud Speech-to-Text, Azure Speech, AssemblyAI)
- **实现步骤 (图片 OCR)**:
    1. 使用 `tesseract.js` 对图片文件进行文字识别。
    2. 将识别出的文本作为 `KnowledgeItem.content`。
    3. 在 `KnowledgeItem.source` 或 `KnowledgeItem.metadata` 中存储原始媒体文件的引用。
    4. 持久化 `KnowledgeItem`。
- **实现步骤 (音频转录 - 未来)**:
    1. 设计接口以集成外部语音识别服务。
    2. 当前阶段，可创建包含音频文件引用的 `KnowledgeItem`，内容标记为“待转录”。

#### 3.1.4 `syncExternalData` 方法
- **目标**: 从外部服务（如 Readwise）或本地目录同步数据。
- **技术选型**:
    - 本地目录监控: `chokidar`
    - API 服务集成: 针对特定服务的 SDK 或直接 HTTP 请求 (`axios`)
- **实现步骤 (本地目录同步)**:
    1. 使用 `chokidar` 监控指定目录的文件变化（新增、修改）。
    2. 对变化的文件，根据类型调用 `parseDocument` 或 `processMedia`。
- **实现步骤 (API 服务同步 - 以 Readwise 为例，后续迭代)**:
    1. 实现 OAuth 或 API Token 认证。
    2. 调用 Readwise API 拉取数据（处理分页、速率限制）。
    3. 将外部数据转换为 `KnowledgeItem` 格式。
    4. 实现增量同步逻辑，避免重复导入。

### 3.2 OrganizationService 实现方案

`OrganizationService` 负责知识的组织、分类、打标签和搜索。

#### 3.2.1 `classifyContent` 方法
- **目标**: 利用 LLM 对知识内容进行智能分类。
- **增强点**: 当前已集成 LLM 服务，可考虑优化提示工程、增加上下文信息以提高分类准确性。

#### 3.2.2 `manageTags` 方法
- **目标**: 提供灵活的标签管理功能，并辅助智能标签推荐。
- **技术选型/增强思路**:
    - LLM 辅助标签推荐: 利用 `ILLMService` 进行关键词提取和主题识别。
    - 现有标签库分析: 推荐相似或层级相关的标签。
- **实现步骤**:
    1. 支持明确的标签操作：`add`, `remove`, `set`。
    2. 集成更智能的标签建议逻辑。
    3. 确保标签更改通过 `IStorageService` 正确持久化。

#### 3.2.3 `buildSearchIndex` 方法
- **目标**: 为知识条目构建高效的本地全文搜索索引。
- **技术选型**: `lunr.js` (轻量级客户端/Node.js 全文搜索引擎)
- **实现步骤**:
    1. 集成 `lunr.js` 库。
    2. 定义 `KnowledgeItem` 中需要被索引的字段 (如 `title`, `content`, `metadata.tags`)。
    3. 实现将 `KnowledgeItem` 添加、更新、删除到 Lunr 索引的逻辑。
    4. (可选但推荐) 实现 Lunr 索引的序列化与持久化，以便服务重启后快速加载。

#### 3.2.4 `search` 方法
- **目标**: 提供基于本地索引的快速、准确的搜索功能。
- **实现步骤**:
    1. 使用已构建的 `lunr.js` 索引执行用户查询。
    2. 初期支持关键词查询，中期扩展至布尔操作、短语查询。
    3. 根据相关性得分对结果排序。
    4. 确保返回 `KnowledgeItem` 对象数组。

### 3.3 通用实施建议

- **依赖管理**: 在 `package.json` 中统一管理新引入的库 (如 `axios`, `jsdom`, `readability`, `pdf-parse`, `mammoth`, `tesseract.js`, `lunr.js`, `chokidar`)。
- **配置管理**: 关键配置项（API 密钥、路径、服务地址等）通过 `IConfigManagementService` 或环境变量管理。
- **异步处理**: 所有 I/O 密集型操作使用 `async/await`。
- **单元测试**: 为所有核心功能编写单元测试。
- **日志记录**: 在关键路径和错误处理中添加详细日志。

### 3.4 提炼服务集群 (Distill Services Cluster) 实现方案

`Distill Services Cluster` 专注于对已捕获和组织的知识进行深度加工、提炼精华、发现洞察，并促进知识的渐进式完善。它与 `processing_services` MCP 原子服务紧密相关。

#### 3.4.1 `SummarizationService` (对应 `summarization_service`)
- **目标**: 辅助用户从冗长或复杂的笔记中提取核心内容和关键信息。
- **核心功能**:
    - **渐进式总结**: 允许用户手动或半自动（如基于高亮）提取笔记要点，形成初步摘要。
    - **AI 自动摘要**: 集成 `ILLMService`，对指定笔记内容生成自动化摘要。需要设计灵活的提示工程，支持不同长度和风格的摘要需求。
    - **关键元素提取**: 识别并提取笔记中的重要引言、定义、数据点、图片、表格等结构化信息，形成独立的知识片段或在摘要中突出显示。
- **技术选型/思路**:
    - 文本处理: 基础文本分析库 (如 `natural` 或类似库用于分句、关键词提取辅助手动总结)。
    - AI 集成: `ILLMService` (已定义)。
    - 用户界面交互: 需要前端配合，支持高亮选择、摘要编辑等。
- **数据模型定义 (`SummarizationService` 相关)**:
    ```typescript
    // 摘要选项，用于AI摘要生成
    interface AISummaryOptions {
      length?: 'short' | 'medium' | 'long'; // 摘要长度
      style?: string; // 摘要风格，例如：'bullet_points', 'narrative'
      focus?: string; // 摘要侧重点，例如：'key_findings', 'action_items'
      targetAudience?: string; // 目标读者
    }

    // 关键元素类型
    type KeyElementType = 'quotes' | 'images' | 'tables' | 'definitions' | 'code_blocks' | 'links';

    // 提取的关键元素结构
    interface ExtractedElement {
      type: KeyElementType;
      content: string; // 元素内容或引用
      sourceNoteId: string; // 来源笔记ID
      locationInNote?: any; // 元素在原笔记中的位置信息（可选）
    }

    // 摘要结果，可以是新的KnowledgeItem或对现有KnowledgeItem的更新
    // KnowledgeItem 已在 KnowledgeIngestionService 部分定义，这里假设其可用
    // type SummaryResult = KnowledgeItem;

    // 关键元素提取结果
    interface KeyElementsResult {
      noteId: string;
      elements: ExtractedElement[];
    }
    ```

- **接口草案 (`ISummarizationService`)**: (已更新)
    ```typescript
    interface ISummarizationService extends IMCPService {
      /**
       * 基于用户提供的高亮内容（文本片段）生成摘要。
       * @param noteId 目标笔记的ID。
       * @param highlights 一个字符串数组，每个字符串代表用户高亮的一段文本。
       * @param targetNoteId 可选，如果希望将摘要保存为新笔记，则提供新笔记的ID；否则更新原笔记或创建默认摘要笔记。
       * @returns 返回包含摘要内容的新 KnowledgeItem 或更新后的原 KnowledgeItem。
       */
      generateManualSummary(noteId: string, highlights: string[], targetNoteId?: string): Promise<KnowledgeItem>;

      /**
       * 使用 AI 生成指定笔记的摘要。
       * @param noteId 目标笔记的ID。
       * @param options AI 摘要的配置选项。
       * @param targetNoteId 可选，指定摘要存储的目标笔记ID。
       * @returns 返回包含 AI 生成摘要的 KnowledgeItem。
       */
      generateAISummary(noteId: string, options?: AISummaryOptions, targetNoteId?: string): Promise<KnowledgeItem>;

      /**
       * 从指定笔记中提取特定类型的关键元素。
       * @param noteId 目标笔记的ID。
       * @param elementTypes 一个数组，包含希望提取的关键元素的类型。
       * @returns 返回一个对象，包含提取的关键元素列表。
       */
      extractKeyElements(noteId: string, elementTypes: KeyElementType[]): Promise<KeyElementsResult>;
    }
    ```

#### 3.4.2 `InsightDiscoveryService` (部分对应 `link_discovery_service` 和 AI 增强需求)
- **目标**: 利用 AI 和链接分析，帮助用户发现笔记间的深层联系、识别知识模式和潜在的知识空白。
- **核心功能**:
    - **潜在链接识别**: 基于内容相似度、共同标签、引用关系等，通过 `ILLMService` 或图算法推荐笔记间的潜在链接 (补充 `link_discovery_service` 的基础功能)。
    - **知识模式识别**: 分析一组笔记或整个知识库，识别反复出现的主题、论点、矛盾或趋势，并向用户高亮展示。
    - **知识空白识别**: 基于用户定义的兴趣领域或现有知识结构，提示可能缺失的关键信息或下一步值得探索的方向。
- **技术选型/思路**:
    - AI 集成: `ILLMService` 用于语义分析、模式识别。
    - 图数据库/算法 (可选，中期考虑): 如 `neo4j` (若本地知识图谱复杂化) 或 `graphology` 用于分析链接关系。
    - 向量数据库 (可选，中期考虑): 存储文本嵌入，用于高效相似性搜索，辅助链接发现。
- **数据模型定义 (`InsightDiscoveryService` 相关)**:
    ```typescript
    // 笔记链接建议
    interface NoteLinkSuggestion {
      sourceNoteId: string;
      targetNoteId: string;
      reason: string; // 建议链接的原因，例如："内容高度相关", "共享多个标签"
      similarityScore?: number; // 相似度得分（如果适用）
      contextSnippet?: string; // 相关的上下文片段
    }

    // 知识模式报告
    interface KnowledgePattern {
      patternName: string; // 例如："Recurring Theme", "Contradictory Statements"
      description: string;
      involvedNoteIds: string[]; // 涉及的笔记ID
      supportingEvidence?: string[]; // 支持证据或片段
    }

    interface PatternReport {
      scope: { noteIds?: string[], tags?: string[] }; // 分析范围
      patterns: KnowledgePattern[];
      summary?: string; // 模式分析总结
    }

    // 知识空白建议
    interface GapSuggestion {
      area: string; // 知识空白所属领域
      suggestion: string; // 具体建议，例如："探索 X 概念与 Y 理论的联系"
      relatedNoteIds?: string[]; // 可作为起点的相关笔记ID
      priority?: 'high' | 'medium' | 'low';
    }
    ```

- **接口草案 (`IInsightDiscoveryService`)**: (已更新)
    ```typescript
    interface IInsightDiscoveryService extends IMCPService {
      /**
       * 为指定笔记建议相关的其他笔记。
       * @param noteId 目标笔记的ID。
       * @param context 可选的上下文信息，用于辅助推荐，例如当前用户的兴趣图谱、最近访问历史等。
       * @param limit 返回建议数量的上限。
       * @returns 返回一个笔记链接建议的数组。
       */
      suggestRelatedNotes(noteId: string, context?: any, limit?: number): Promise<NoteLinkSuggestion[]>;

      /**
       * 在指定的笔记范围或标签范围内识别知识模式。
       * @param scope 定义分析范围，可以是一组笔记ID或一组标签。
       * @returns 返回包含已识别知识模式的报告。
       */
      identifyKnowledgePatterns(scope: { noteIds?: string[], tags?: string[], allNotes?: boolean }): Promise<PatternReport>;

      /**
       * 基于用户定义的兴趣领域和现有知识上下文，识别潜在的知识空白。
       * @param interestAreas 用户感兴趣的领域或主题列表。
       * @param existingKnowledgeContext 用于描述当前知识库状态的上下文，可以是标签云、主题分布等。
       * @returns 返回一个知识空白建议的数组。
       */
      identifyKnowledgeGaps(interestAreas: string[], existingKnowledgeContext?: any): Promise<GapSuggestion[]>;
    }
    ```

#### 3.4.3 `ProgressiveRefinementService` (对应渐进式精炼需求)
- **目标**: 支持知识的持续迭代和完善，包括版本管理、模板应用和知识重组。
- **核心功能**:
    - **笔记模板应用**: (补充 `KnowledgeIngestionService` 的模板创建) 允许用户为特定类型的知识提炼过程（如文献阅读笔记、项目复盘）应用预设模板，规范提炼结构。
    - **知识点合并与重组**: 提供工具或流程建议，辅助用户将来自不同笔记的知识点进行合并、对比、重构，形成新的、更精炼的知识单元。
    - **版本历史接口 (依赖 `IStorageService` 或 Obsidian)**: 提供查询笔记版本历史、对比版本差异的接口（如果底层存储支持）。
- **技术选型/思路**:
    - 模板管理: JSON 或 Markdown 格式的模板定义。
    - 内容操作: 文本编辑和差异比较库 (如 `diff` 库)。
- **数据模型定义 (`ProgressiveRefinementService` 相关)**:
    ```typescript
    // 笔记模板元数据
    interface NoteTemplateMeta {
      templateId: string;
      name: string;
      description?: string;
      version: string;
      // 模板结构定义，可以是JSON Schema或其他格式
      structureDefinition: any; 
    }

    // 知识点合并策略
    interface MergeStrategy {
      conflictResolution: 'prefer_source' | 'prefer_target' | 'manual'; // 冲突解决方式
      preserveSourceNotes?: boolean; // 是否保留源笔记
      newNoteTitle?: string; // 如果合并到新笔记，新笔记的标题
    }

    // 笔记版本信息
    // KnowledgeItem 已定义，版本信息可以作为其元数据的一部分或单独存储
    interface VersionInfo {
      versionId: string;
      noteId: string;
      timestamp: Date;
      author?: string; // 修改者
      summaryOfChanges?: string; // 变更摘要
      // previousVersionId?: string; // 指向前一个版本
    }
    ```

- **接口草案 (`IProgressiveRefinementService`)**: (已更新)
    ```typescript
    interface IProgressiveRefinementService extends IMCPService {
      /**
       * 将指定的笔记模板应用于一个笔记。
       * @param noteId 目标笔记的ID。
       * @param templateId 要应用的模板ID。
       * @returns 返回应用模板后更新的 KnowledgeItem。
       */
      applyTemplateToNote(noteId: string, templateId: string): Promise<KnowledgeItem>;

      /**
       * 将多个源笔记中的知识点合并到一个目标笔记或创建一个新笔记。
       * @param sourceNoteIds 源笔记ID的数组。
       * @param targetNoteId 可选，目标笔记的ID。如果未提供，则会创建一个新笔记。
       * @param mergeStrategy 合并策略的配置。
       * @returns 返回合并后的 KnowledgeItem (新笔记或更新后的目标笔记)。
       */
      mergeKnowledgePoints(sourceNoteIds: string[], targetNoteId?: string, mergeStrategy?: MergeStrategy): Promise<KnowledgeItem>;

      /**
       * 获取指定笔记的版本历史记录。
       * 此功能高度依赖底层存储服务（如IStorageService或Obsidian插件）对版本控制的支持。
       * @param noteId 目标笔记的ID。
       * @returns 返回一个包含版本信息的数组。
       */
      getNoteVersionHistory(noteId: string): Promise<VersionInfo[]>;

      /**
       * 获取所有可用的笔记模板列表。
       * @returns 返回一个包含模板元数据定义的数组。
       */
      listAvailableTemplates(): Promise<NoteTemplateMeta[]>;

      /**
       * 获取特定笔记模板的详细定义。
       * @param templateId 模板ID。
       * @returns 返回模板的详细元数据。
       */
      getTemplateDetails(templateId: string): Promise<NoteTemplateMeta | null>;
    }
    ```

#### 3.4.4 `ProcessingOrchestrationService` (新增，可选的编排层)
- **目标**: (可选) 编排上述提炼服务，提供更高级别的、面向用户场景的提炼工作流。
- **核心功能**:
    - 例如：“深度阅读辅助”工作流：捕获 (Ingestion) -> 初步总结 (Summarization) -> 关联发现 (Insight) -> 应用模板精炼 (Refinement)。
- **备注**: 这个服务更多是业务逻辑层面的组合，初期可能不作为独立的 MCP 服务，而是体现在应用层逻辑中。

### 3.5 通用实施建议 (扩展)

- **与 `ILLMService` 的深度集成**: 提炼服务集群将高度依赖 `ILLMService`。需要确保 `ILLMService` 的配置灵活性（如模型选择、API密钥管理）和调用稳定性。
- **用户体验 (UX) 考量**: 提炼过程往往需要用户深度参与。服务接口的设计应考虑前端如何呈现信息、如何引导用户操作。
- **性能与异步**: 许多提炼操作（尤其是 AI 调用）可能是耗时的。所有服务接口必须是异步的，并考虑任务状态管理和通知机制。

### 3.6 表达服务集群 (Express Services Cluster) 实现方案

`Express Services Cluster` 负责将加工和提炼后的知识以不同形式输出和分享，对应 MCP 原子服务中的 `presentation_services`。

#### 3.6.1 `ExportService` (对应 `export_note_service`)
- **目标**: 支持将单个或多个笔记导出为常见的标准格式，方便在不同平台和场景下使用。
- **核心功能**:
    - **Markdown 导出**: 将笔记内容（包括图片等嵌入式资源，需考虑路径转换或内嵌）导出为 `.md` 文件或 `.zip` 压缩包（包含多个 .md 文件和相关资源）。
    - **PDF 导出**: 将笔记内容转换为高质量的 PDF 文档。需要考虑 Markdown 到 PDF 的转换引擎，处理样式、分页、图片、链接等。
    - **HTML 导出**: 将笔记内容生成静态 HTML 文件，保留基本格式和链接，可用于简单网页分享或存档。
    - **纯文本导出**: 提取笔记的纯文本内容。
- **技术选型/思路**:
    - Markdown 处理: `fs` 模块读写，可能需要处理图片等资源的相对/绝对路径问题。
    - PDF 转换: `Puppeteer` (通过打印到 PDF 功能，可以较好地保留 HTML 渲染效果)、`markdown-pdf` 库，或 Pandoc (外部命令行工具，功能强大但集成稍复杂)。
    - HTML 转换: Markdown-to-HTML 库 (如 `marked`, `showdown`)，并处理 CSS 样式以保持观感。
- **数据模型定义 (`ExportService` 相关)**:
    ```typescript
    // 导出选项
    interface ExportOptions {
      format: 'markdown' | 'pdf' | 'html' | 'text';
      // Markdown 特定选项
      singleFile?: boolean; // 对于多个笔记，是否合并到单个文件
      includeAssets?: boolean; // 是否包含图片等资源
      assetPathMode?: 'relative' | 'absolute' | 'embed'; // 资源路径模式
      // PDF/HTML 特定选项
      styleTemplate?: string; // 样式模板名称或路径
      pageSize?: 'A4' | 'Letter'; // PDF页面大小
      orientation?: 'portrait' | 'landscape'; // PDF方向
      // HTML 特定选项
      selfContained?: boolean; // 是否生成自包含的HTML文件（例如，通过data URI嵌入资源）
    }

    // 导出结果
    interface ExportResult {
      success: boolean;
      outputPath?: string; // 导出文件的路径 (如果是单个文件)
      outputPaths?: string[]; // 导出文件的路径数组 (如果是多个文件)
      outputBuffer?: Buffer; // 导出内容的Buffer (如果适用，例如单个文件且不写入磁盘)
      outputBuffers?: Buffer[]; // 多个Buffer
      message?: string; // 导出过程中的消息或错误信息
    }
    ```

- **接口草案 (`IExportService`)**: (已更新)
    ```typescript
    interface IExportService extends IMCPService {
      /**
       * 将一个或多个笔记导出为指定格式。
       * @param noteIds 需要导出的笔记ID数组。
       * @param options 导出选项，定义了导出格式和特定格式的参数。
       * @returns 返回一个包含导出结果的对象，指明操作是否成功及输出路径或内容。
       */
      exportNotes(noteIds: string[], options: ExportOptions): Promise<ExportResult>;
    }
    ```

#### 3.6.2 `SharingService` (对应 `sharing_service_interface`)
- **目标**: 提供将笔记内容或链接分享到其他应用或平台的能力，并管理分享设置（如果 Obsidian 或其插件支持）。
- **核心功能**:
    - **复制到剪贴板**: 将笔记内容（可选格式如 Markdown, HTML, Plain Text）或特定部分的文本复制到系统剪贴板。
    - **“发送到”特定应用**: (中期考虑) 如果操作系统或应用支持，尝试通过 URL Scheme 或其他 IPC 机制将内容发送到指定应用 (如邮件客户端、其他笔记应用)。
    - **生成可分享链接**: (依赖 Obsidian Publish 或类似插件) 如果笔记已通过某种方式发布到网络，则此服务可以获取或管理其分享链接。
    - **管理分享设置**: (依赖 Obsidian Publish 或类似插件) 如果笔记的分享状态（如公开、私密、密码保护）可以通过 API 控制，则此服务提供相应接口。
- **技术选型/思路**:
    - 剪贴板操作: Node.js 库如 `clipboardy`。
    - URL Scheme: 需要研究目标应用的具体 Scheme。
    - Obsidian Publish API: 如果存在，则直接调用。
- **数据模型定义 (`SharingService` 相关)**:
    ```typescript
    // 分享内容格式
    type ShareFormat = 'markdown' | 'html' | 'text' | 'link';

    // 分享目标
    type ShareTarget = 'clipboard' | 'email' | 'social_media_platform' | 'other_app';

    // 分享设置 (主要针对在线发布)
    interface ShareSettings {
      visibility: 'public' | 'private' | 'password_protected' | 'unlisted';
      password?: string; // 如果是密码保护
      canComment?: boolean;
      canEdit?: boolean; // 通常不适用于简单分享，更偏向协作
      expirationDate?: Date;
    }

    // 分享操作结果
    interface ShareResult {
      success: boolean;
      message?: string;
      sharedLink?: string; // 如果生成了分享链接
    }
    ```

- **接口草案 (`ISharingService`)**: (已更新)
    ```typescript
    interface ISharingService extends IMCPService {
      /**
       * 将指定笔记的内容或链接分享到目标。
       * @param noteId 要分享的笔记ID。
       * @param format 分享内容的格式。
       * @param target 分享的目标，例如剪贴板、邮件等。
       * @param options 可选的分享参数，例如邮件接收者、社交媒体平台特定参数。
       * @returns 返回分享操作的结果。
       */
      shareNote(noteId: string, format: ShareFormat, target: ShareTarget, options?: any): Promise<ShareResult>;

      /**
       * 获取已发布笔记的分享链接 (如果适用)。
       * @param noteId 笔记ID。
       * @returns 返回分享链接字符串，如果未发布或不支持则返回 null。
       */
      getShareableLink(noteId: string): Promise<string | null>;

      /**
       * 更新已发布笔记的分享设置 (如果适用)。
       * @param noteId 笔记ID。
       * @param settings 新的分享设置。
       * @returns 返回操作结果。
       */
      updateShareSettings(noteId: string, settings: ShareSettings): Promise<ShareResult>;
    }
    ```

#### 3.6.3 `CollaborationService` (对应协作功能探索)
- **目标**: (远期规划) 支持多人实时或异步协作编辑同一份笔记或知识空间。这超出了当前 Obsidian 的核心能力，可能需要依赖外部协作平台或自建同步机制。
- **核心功能 (设想)**:
    - **实时共同编辑**: 类似 Google Docs 的多人编辑体验。
    - **评论与讨论**: 在笔记特定位置添加评论和回复。
    - **版本合并与冲突解决**: 处理多人编辑可能产生的冲突。
    - **权限管理**: 控制不同用户对笔记的访问和编辑权限。
- **技术选型/思路 (高度复杂)**:
    - CRDTs (Conflict-free Replicated Data Types) 用于实时同步。
    - WebSocket 或 WebRTC 用于实时通信。
    - 强大的后端支持用户状态管理、权限控制、持久化。
- **备注**: 此服务在当前阶段仅为概念性探索，具体实现依赖于整体架构向多人协作的演进。
- **数据模型定义 (`CollaborationService` 相关 - 概念性)**:
    ```typescript
    // 协作会话
    interface CollaborationSession {
      sessionId: string;
      noteId: string;
      activeUsers: string[]; // 参与者UserID列表
      // ... 其他会话状态信息
    }

    // 编辑操作记录 (用于CRDT或操作转换)
    interface EditOperation {
      userId: string;
      timestamp: number;
      // ... 具体操作描述 (插入、删除、格式化等)
      operationDetails: any;
    }

    // 评论
    interface Comment {
      commentId: string;
      noteId: string;
      userId: string;
      timestamp: Date;
      text: string;
      positionInNote?: any; // 评论在笔记中的位置
      replies?: Comment[];
    }

    // 访问权限
    interface AccessPermission {
      userId: string;
      noteId: string;
      canView: boolean;
      canEdit: boolean;
      canComment: boolean;
      canShare?: boolean;
    }
    ```

- **接口草案 (`ICollaborationService` - 概念性)**:
    ```typescript
    interface ICollaborationService extends IMCPService {
      /** (远期) 开始或加入一个笔记的协作会话 */
      joinCollaborationSession(noteId: string, userId: string): Promise<CollaborationSession>;

      /** (远期) 离开协作会话 */
      leaveCollaborationSession(sessionId: string, userId: string): Promise<void>;

      /** (远期) 提交编辑操作 */
      submitEditOperation(sessionId: string, operation: EditOperation): Promise<void>;

      /** (远期) 添加评论 */
      addComment(noteId: string, comment: Omit<Comment, 'commentId' | 'timestamp' | 'replies'>): Promise<Comment>;

      /** (远期) 更新笔记的访问权限 */
      updateAccessPermissions(noteId: string, permissions: AccessPermission[]): Promise<void>;
    }
    ```
- **目标**: 探索在 Obsidian 的本地优先模型下，通过 MCP 服务辅助实现有限的协作功能。
- **核心功能 (探索性)**:
    - **内容片段分享与导入**: 允许用户选择笔记中的特定片段（如一个段落、一个列表），将其导出为一种标准格式（如带元数据的 JSON 或 Markdown 片段），方便他人导入和引用。
    - **评论或注解接口**: (高度依赖 Obsidian 插件生态) 如果有插件支持在笔记中添加非侵入式的评论或注解，此服务可以提供创建和查询这些注解的接口。
    - **变更通知与同步建议**: (非常复杂，远期) 监控共享知识库（如果通过 Git 等方式同步）的变更，并向相关用户提供同步建议或冲突提示。这超出了简单 MCP 服务的范畴，更接近一个同步协调层。
- **备注**: Obsidian 的核心是单用户、本地优先。真正的实时协作非常具有挑战性。此服务初期应聚焦于异步的、基于片段的分享和讨论辅助。
- **接口草案 (`ICollaborationService` - 初期简化)**:
    ```typescript
    interface ICollaborationService extends IMCPService {
      exportNoteSegment(noteId: string, segmentId: string): Promise<NoteSegmentData>;
      importNoteSegment(targetNoteId: string, segmentData: NoteSegmentData): Promise<void>;
      // addCommentToNote(noteId: string, comment: CommentData): Promise<Comment>; // 依赖插件
      // getCommentsForNote(noteId: string): Promise<Comment[]>; // 依赖插件
    }
    ```

### 3.7 架构总结与后续步骤

至此，我们已经初步定义了 BASB 系统中基于 CODE 框架的四大核心服务集群：捕获 (Capture)、组织 (Organize)、提炼 (Distill) 和表达 (Express)。每个集群都包含了一系列具体的 MCP 原子服务，并明确了其目标、核心功能、技术选型思路以及初步的接口设计。

**后续步骤建议**:
1.  **接口细化与数据模型定义**: 对每个服务的接口定义进行更详细的审查和完善，明确所有参数和返回值的具体数据结构 (如 `KnowledgeItem`, `NoteLinkSuggestion`, `ExportResult` 等的详细字段)。
2.  **MCP 服务注册与发现机制**: 确认所有服务如何通过 `globalServiceFactory` 进行注册，以及客户端如何发现和调用这些服务。
3.  **错误处理与日志策略**: 制定统一的错误码规范和日志记录标准，确保所有服务在出错时能提供清晰、有用的信息。
4.  **安全性考量**: 审查所有服务接口，识别潜在的安全风险（如路径遍历、注入攻击等），并设计相应的防护措施。
5.  **配置管理**: 明确各项服务的配置项（如 API 密钥、默认路径、第三方服务地址等）如何通过 `IConfigManagementService` 进行管理。
6.  **原型验证与迭代**: 针对核心服务和关键功能，可以开始小范围的原型开发和验证，以便尽早发现设计上的问题并进行调整。
7.  **与现有代码的整合**: 规划如何将这些新设计的服务与项目中已有的服务（如 `src/services/` 下的占位符实现）进行平滑过渡或替换。

本文档 <mcfile name="BASB_Architecture_Design_v1.2.md" path="specifitions/BASB_Architecture_Design_v1.2.md"></mcfile> 将作为后续开发实现阶段的重要依据。
    API --> Gateway
    WS --> Gateway
    
    Gateway --> Auth
    Gateway --> RateLimit
    
    Gateway --> WebCapture
    Gateway --> PARAService
    Gateway --> LinkService
    Gateway --> MetadataService
    Gateway --> ExportService
    
    WebCapture --> ContentService
    PARAService --> MetadataService
    LinkService --> GraphService
    AIService --> AIProviders
    
    MetadataService --> MongoDB
    ContentService --> S3
    GraphService --> KnowledgeGraph
    AIService --> Pinecone
    SearchService --> ES
    RecommendService --> Redis
```

### 2.3 知识流架构图

```mermaid
sequenceDiagram
    participant User as 用户
    participant UI as 用户界面
    participant Gateway as API网关
    participant Capture as 捕获服务
    participant AI as AI处理服务
    participant Graph as 知识图谱服务
    participant Storage as 存储服务
    participant Search as 搜索服务
    
    User->>UI: 输入内容/URL
    UI->>Gateway: 发送捕获请求
    Gateway->>Capture: 路由到捕获服务
    
    Capture->>Storage: 存储原始内容
    Capture->>AI: 请求内容分析
    
    AI->>AI: 提取关键词
    AI->>AI: 生成摘要
    AI->>AI: 创建向量嵌入
    
    AI->>Graph: 更新知识图谱
    AI->>Storage: 存储处理结果
    
    Graph->>Graph: 分析关联关系
    Graph->>Search: 更新搜索索引
    
    Search->>UI: 返回处理状态
    UI->>User: 显示处理结果
    
    Note over User,Search: 异步处理流程
    
    User->>UI: 查询知识
    UI->>Gateway: 发送查询请求
    Gateway->>Search: 执行搜索
    
    Search->>Graph: 查询关联知识
    Graph->>AI: 生成智能推荐
    
    AI->>UI: 返回结果和推荐
    UI->>User: 展示知识和关联
```

### 2.4 数据架构图

```mermaid
erDiagram
    USER {
        string user_id PK
        string username
        string email
        timestamp created_at
        json preferences
    }
    
    KNOWLEDGE_ITEM {
        string item_id PK
        string user_id FK
        string title
        string content
        string source_type
        string source_url
        json metadata
        timestamp created_at
        timestamp updated_at
    }
    
    KNOWLEDGE_GRAPH {
        string node_id PK
        string item_id FK
        string node_type
        json properties
        float[] embeddings
    }
    
    RELATIONSHIPS {
        string rel_id PK
        string from_node_id FK
        string to_node_id FK
        string relationship_type
        float strength
        json properties
    }
    
    PARA_STRUCTURE {
        string para_id PK
        string user_id FK
        string type
        string name
        string description
        string parent_id FK
        int order_index
    }
    
    TAGS {
        string tag_id PK
        string user_id FK
        string name
        string color
        int usage_count
    }
    
    ITEM_TAGS {
        string item_id FK
        string tag_id FK
        timestamp tagged_at
    }
    
    ITEM_PARA {
        string item_id FK
        string para_id FK
        timestamp assigned_at
    }
    
    VERSIONS {
        string version_id PK
        string item_id FK
        string content
        json changes
        timestamp created_at
    }
    
    USER ||--o{ KNOWLEDGE_ITEM : owns
    USER ||--o{ PARA_STRUCTURE : creates
    USER ||--o{ TAGS : creates
    
    KNOWLEDGE_ITEM ||--|| KNOWLEDGE_GRAPH : represents
    KNOWLEDGE_ITEM ||--o{ ITEM_TAGS : tagged_with
    KNOWLEDGE_ITEM ||--o{ ITEM_PARA : organized_in
    KNOWLEDGE_ITEM ||--o{ VERSIONS : has_versions
    
    KNOWLEDGE_GRAPH ||--o{ RELATIONSHIPS : connects
    TAGS ||--o{ ITEM_TAGS : applied_to
    PARA_STRUCTURE ||--o{ ITEM_PARA : contains
    PARA_STRUCTURE ||--o{ PARA_STRUCTURE : parent_child
```

### 2.5 轻量化部署架构图

#### 极简版部署 (个人入门)
```mermaid
graph TB
    subgraph "本地环境"
        subgraph "应用层"
            WebUI[Web界面]
            MCPCore[MCP核心服务]
            ObsidianCore[Obsidian核心]
        end
        
        subgraph "数据层"
            SQLite[SQLite数据库]
            LocalFiles[本地文件系统]
            ObsidianVault[Obsidian Vault]
        end
        
        subgraph "AI层"
            Ollama[Ollama本地模型]
        end
        
        subgraph "监控"
            Logs[日志文件]
        end
    end
    
    WebUI --> MCPCore
    MCPCore --> ObsidianCore
    MCPCore --> SQLite
    MCPCore --> LocalFiles
    ObsidianCore --> ObsidianVault
    MCPCore --> Ollama
    MCPCore --> Logs
```

#### 标准版部署 (个人进阶)
```mermaid
graph TB
    subgraph "Docker环境"
        subgraph "前端层"
            WebApp[Web应用容器]
            Nginx[Nginx反向代理]
        end
        
        subgraph "应用层"
            MCPServices[MCP服务容器]
            ObsidianPro[Obsidian Pro容器]
        end
        
        subgraph "数据层"
            PostgreSQL[PostgreSQL容器]
            ChromaDB[ChromaDB容器]
            Redis[Redis容器]
        end
        
        subgraph "AI层"
            OllamaContainer[Ollama容器]
        end
        
        subgraph "存储层"
            LocalVolumes[本地数据卷]
            CloudBackup[云备份 (可选)]
        end
        
        subgraph "监控层"
            HealthCheck[健康检查]
        end
    end
    
    Nginx --> WebApp
    WebApp --> MCPServices
    MCPServices --> ObsidianPro
    MCPServices --> PostgreSQL
    MCPServices --> ChromaDB
    MCPServices --> Redis
    MCPServices --> OllamaContainer
    PostgreSQL --> LocalVolumes
    LocalVolumes -.-> CloudBackup
    MCPServices --> HealthCheck
```

#### 专业版部署 (小团队)
```mermaid
graph TB
    subgraph "容器编排环境"
        subgraph "负载均衡层"
            Traefik[Traefik网关]
        end
        
        subgraph "应用层"
            WebCluster[Web应用集群]
            MCPCluster[MCP服务集群]
            ObsidianEnterprise[Obsidian企业版]
        end
        
        subgraph "数据层"
            PostgreSQLCluster[PostgreSQL集群]
            Neo4jSingle[Neo4j单节点]
            QdrantCluster[Qdrant集群]
            RedisCluster[Redis集群]
        end
        
        subgraph "AI层"
            MultiAI[多AI模型服务]
        end
        
        subgraph "存储层"
            MinIO[MinIO对象存储]
            PersistentVolumes[持久化存储]
        end
        
        subgraph "监控层"
            UptimeKuma[Uptime Kuma]
            LogAggregation[日志聚合]
        end
    end
    
    Traefik --> WebCluster
    WebCluster --> MCPCluster
    MCPCluster --> ObsidianEnterprise
    MCPCluster --> PostgreSQLCluster
    MCPCluster --> Neo4jSingle
    MCPCluster --> QdrantCluster
    MCPCluster --> RedisCluster
    MCPCluster --> MultiAI
    PostgreSQLCluster --> PersistentVolumes
    MinIO --> PersistentVolumes
    MCPCluster --> UptimeKuma
    MCPCluster --> LogAggregation
    
    API --> MCPServices
    MCPServices --> Redis
    MCPServices --> Kafka
    MCPServices --> ES
    
    MCPServices --> Neo4jCluster
    MCPServices --> MongoCluster
    MCPServices --> PineconeCloud
    MCPServices --> S3
    
    MCPServices --> AIServices
    MCPServices --> ExternalAPIs
    
    MCPServices --> Prometheus
    Prometheus --> Grafana
    MCPServices --> Jaeger
    MCPServices --> ELK
```

## 3. MCP服务详细设计

### 3.1 知识捕获服务组

#### 3.1.1 网页捕获服务 (Web Capture Service)
**职责**: 从网页抓取内容并进行预处理

**接口定义**:
```yaml
service: web-capture
version: v1
endpoints:
  - path: /capture/url
    method: POST
    input:
      url: string
      options:
        include_images: boolean
        include_links: boolean
        depth: integer
    output:
      capture_id: string
      status: string
      content:
        title: string
        text: string
        html: string
        metadata: object
```

**技术实现**:
- 使用Puppeteer进行网页渲染
- 支持JavaScript动态内容
- 智能内容提取算法
- 反爬虫机制处理

#### 3.1.2 文件捕获服务 (File Capture Service)
**职责**: 处理各种文件格式的内容提取

**支持格式**:
- 文档: PDF, DOCX, TXT, MD
- 表格: XLSX, CSV
- 演示: PPTX
- 图片: PNG, JPG (OCR)
- 音频: MP3, WAV (转录)
- 视频: MP4 (字幕提取)

### 3.2 组织管理服务组

#### 3.2.1 PARA组织服务 (PARA Organization Service)
**职责**: 实现PARA方法的知识组织

**PARA结构**:
- **Projects**: 有明确截止日期的工作
- **Areas**: 需要持续维护的领域
- **Resources**: 未来可能有用的参考资料
- **Archive**: 已完成或不再活跃的内容

**接口定义**:
```yaml
service: para-organization
version: v1
endpoints:
  - path: /para/classify
    method: POST
    input:
      item_id: string
      content: string
      metadata: object
    output:
      classification:
        type: string  # project/area/resource/archive
        confidence: float
        reasoning: string
      suggestions:
        - category: string
          score: float
```

### 3.3 处理分析服务组

#### 3.3.1 AI处理服务 (AI Processing Service)
**职责**: 集成多种AI能力进行内容分析

**AI能力**:
- 内容摘要生成
- 关键词提取
- 情感分析
- 主题分类
- 相似度计算
- 问答生成

**AI服务架构**:
```mermaid
graph LR
    AIGateway[AI网关] --> OpenAI[OpenAI GPT-4]
    AIGateway --> Claude[Anthropic Claude]
    AIGateway --> Local[本地Ollama]
    
    AIGateway --> Cache[结果缓存]
    AIGateway --> Monitor[成本监控]
    AIGateway --> Fallback[降级策略]
```

#### 3.3.2 知识图谱服务 (Knowledge Graph Service)
**职责**: 构建和维护轻量化知识图谱，以Obsidian为核心

**Obsidian基础功能** (默认启用):
- **知识网络**: 基于Markdown链接的知识关联
- **标签系统**: 灵活的内容分类和组织
- **图谱可视化**: 直观的知识关系展示
- **全文搜索**: 快速的内容检索
- **PARA组织**: Projects, Areas, Resources, Archive结构

**Neo4j高级功能** (企业级扩展，可选):
- **复杂查询**: Cypher语言支持的高级图查询
- **AI集成**: 智能推荐和知识发现
- **大规模处理**: 支持海量数据的图计算
- **多用户协作**: 企业级权限和协作功能
- **高级分析**: PageRank、社区发现等图算法

**分层架构设计**:
- **个人版**: 仅使用Obsidian，轻量化部署
- **专业版**: Obsidian + 基础Neo4j功能
- **企业版**: 完整Neo4j集群 + 高级AI功能

**MCP服务配置** (按版本分层):

**极简版服务**:
- ObsidianCore: 基础文件管理和搜索
- CloudAI: 可选云端API集成 (按需)
- SimpleSync: 基础同步功能

**标准版服务**:
- ObsidianPro: 增强文件管理和图谱功能
- PostgresGraph: 轻量级图谱扩展
- ChromaVector: 本地向量搜索
- CloudAI: 云端AI服务集成
- RedisCache: 缓存加速
- CloudBackup: 可选云备份

**专业版服务**:
- ObsidianEnterprise: 完整功能集
- Neo4jGraph: 高级图计算
- QdrantVector: 专业向量数据库
- OllamaAI: 本地AI模型服务
- MultiAI: 混合AI集成 (本地+云端)
- TeamCollaboration: 团队协作功能


### 3.4 用户画像服务组

**用户画像构建服务**
- 职责: 多维度用户画像的构建和维护
- 接口: `build_user_profile(user_data, behavioral_data)`
- 输出: 结构化用户画像对象

**行为分析服务**
- 职责: 用户行为模式的分析和预测
- 接口: `analyze_behavior(user_actions, time_window)`
- 输出: 行为模式报告和趋势预测

**个性化推荐服务**
- 职责: 基于用户画像的内容推荐
- 接口: `recommend_content(user_profile, content_pool, context)`
- 输出: 个性化推荐列表和推荐理由

**学习路径规划服务**
- 职责: 个性化学习路径的生成和优化
- 接口: `plan_learning_path(user_profile, learning_goals)`
- 输出: 结构化学习路径和里程碑

**上下文更新服务**
- 职责: 用户上下文的动态更新和版本管理
- 接口: `update_user_context(user_id, trigger_event, new_data)`
- 输出: 更新后的用户画像和变更日志

### 3.5 存储管理服务组

#### 3.4.1 元数据服务 (Metadata Service)
**职责**: 管理所有知识项的元数据

**元数据结构**:
```yaml
metadata:
  basic:
    id: string
    title: string
    source: string
    created_at: timestamp
    updated_at: timestamp
  content:
    type: string
    format: string
    language: string
    size: integer
  processing:
    status: string
    ai_processed: boolean
    graph_indexed: boolean
    search_indexed: boolean
  organization:
    para_category: string
    tags: array
    projects: array
  analytics:
    view_count: integer
    last_accessed: timestamp
    relevance_score: float
```

### 3.6 表达输出服务组

#### 3.5.1 导出服务 (Export Service)
**职责**: 支持多种格式的知识导出

**导出格式**:
- Markdown文档
- PDF报告
- HTML网页
- JSON数据
- 知识图谱可视化
- Obsidian Vault (标准Markdown格式，包含PARA结构)

## 4. 数据架构设计

### 4.1 数据存储策略

#### 4.1.1 分层知识图谱架构

**Obsidian基础层** (个人版默认):
- **用途**: 轻量化知识管理和图谱可视化
- **存储方式**: 本地文件系统 + Markdown格式
- **核心功能**:
  - 双向链接: [[wikilink]] 语法建立知识关联
  - 标签系统: #tag 实现内容分类
  - 文件夹结构: PARA方法组织知识
  - 图谱视图: 可视化知识网络
  - 全文搜索: 快速内容检索
- **优势**: 部署简单、响应快速、离线可用

**Neo4j扩展层** (专业版/企业版可选):
- **用途**: 高级图计算和AI集成
- **配置** (按需部署):
  - 单节点模式: 专业版轻量部署
  - 集群模式: 企业版高可用 (3节点)
  - 内存配置: 8GB-32GB heap (可调)
  - 索引策略: 全文索引 + 属性索引
- **高级功能**:
  - Cypher查询: 复杂图遍历和分析
  - AI推荐: 基于图结构的智能推荐
  - 批量处理: 大规模数据导入和分析
  - 多用户支持: 权限管理和协作功能

**分层部署策略**:
- **个人版**: 仅Obsidian，本地部署
- **专业版**: Obsidian + 单节点Neo4j
- **企业版**: Obsidian + Neo4j集群 + AI服务

**数据模型**:
```cypher
// 节点标签
(:Knowledge {id, title, type, content_hash, created_at})
(:Concept {id, name, definition, domain})
(:Tag {id, name, color, usage_count})
(:Project {id, name, status, deadline})

// 关系类型
(:Knowledge)-[:REFERENCES]->(:Knowledge)
(:Knowledge)-[:SIMILAR_TO {score}]->(:Knowledge)
(:Knowledge)-[:TAGGED_WITH]->(:Tag)
(:Knowledge)-[:BELONGS_TO]->(:Project)
(:Concept)-[:RELATED_TO {strength}]->(:Concept)
```

#### 4.1.2 MongoDB文档存储
**用途**: 存储结构化内容和元数据
**配置**:
- 副本集: 3节点
- 分片策略: 按用户ID分片
- 索引: 复合索引优化查询

**集合设计**:
```javascript
// users集合
{
  _id: ObjectId,
  user_id: String,
  username: String,
  email: String,
  preferences: {
    theme: String,
    language: String,
    ai_settings: Object
  },
  created_at: Date
}

// knowledge_items集合
{
  _id: ObjectId,
  item_id: String,
  user_id: String,
  title: String,
  content: String,
  source: {
    type: String,
    url: String,
    metadata: Object
  },
  processing: {
    status: String,
    ai_summary: String,
    keywords: [String],
    embeddings: [Number]
  },
  organization: {
    para_type: String,
    tags: [String],
    projects: [String]
  },
  created_at: Date,
  updated_at: Date
}
```

#### 4.1.3 Pinecone向量数据库
**用途**: 存储内容向量嵌入
**配置**:
- 维度: 1536 (OpenAI embeddings)
- 相似度度量: cosine
- 索引类型: approximate

### 4.2 数据一致性策略

#### 4.2.1 事务管理
- **强一致性**: 用户核心数据 (MongoDB事务)
- **最终一致性**: 知识图谱更新 (异步同步)
- **缓存一致性**: Redis缓存失效策略

#### 4.2.2 数据同步
```mermaid
sequenceDiagram
    participant App as 应用服务
    participant Mongo as MongoDB
    participant Neo4j as Neo4j
    participant Pinecone as Pinecone
    participant Cache as Redis
    
    App->>Mongo: 写入知识项
    Mongo-->>App: 确认写入
    
    App->>Neo4j: 异步更新图谱
    App->>Pinecone: 异步更新向量
    App->>Cache: 更新缓存
    
    Note over App,Cache: 异步处理保证性能
    
    Neo4j-->>App: 图谱更新完成
    Pinecone-->>App: 向量更新完成
    
    App->>Cache: 标记数据一致
```

## 5. AI集成架构

### 5.1 AI服务网关

#### 5.1.1 多提供商支持
```yaml
ai_providers:
  deepseek: # 默认服务
    models: ["deepseek-coder", "deepseek-llm", "deepseek-moe"] # 示例模型，根据实际可用调整
    deployment: "local_ollama_priority_or_cloud_api" # 优先本地Ollama部署，可选云API
    rate_limit: "dependent_on_deployment" # 本地部署时无限制，云API根据服务商
    cost_per_token: "dependent_on_deployment" # 本地部署成本主要是硬件，云API按量付费
  openai: # 可选服务
    models: ["gpt-4", "gpt-3.5-turbo", "text-embedding-ada-002"]
    rate_limit: 60/min
    cost_per_token: 0.03/1k # 示例价格
  gemini: # 可选服务
    models: ["gemini-pro", "gemini-ultra"] # 示例模型
    rate_limit: "dependent_on_plan" # 根据Google AI Platform计划
    cost_per_token: "dependent_on_model_and_usage" # 示例价格
  # local_other: # 其他本地模型，可通过Ollama等方式运行
  #   models: ["llama2", "mistral"]
  #   rate_limit: unlimited
  #   cost_per_token: 0

routing_strategy:
  - condition: "task_type == 'embedding' and preferred_provider == 'openai'"
    provider: "openai"
    model: "text-embedding-ada-002"
  - condition: "task_type == 'coding_assistance'"
    provider: "deepseek" # DeepSeek Coder 擅长代码
    model: "deepseek-coder"
  - condition: "content_length > 16000 and preferred_provider == 'gemini'" # 假设Gemini有更大上下文窗口
    provider: "gemini"
    model: "gemini-ultra"
  - condition: "cost_sensitive == true or default_preference == 'deepseek'"
    provider: "deepseek"
    model: "deepseek-llm" # 通用场景默认使用DeepSeek
  - condition: "true" # 默认回退到DeepSeek
    provider: "deepseek"
    model: "deepseek-llm"
```
**核心策略**:
- **DeepSeek为基石**: 默认首选 DeepSeek，优先通过Ollama本地部署，以实现数据隐私、低延迟和成本控制。同时保留使用其云API的选项。
- **OpenAI与Gemini为增强**: OpenAI 和 Gemini 作为强大的可选云服务，用于特定高级任务或当其模型特性更优时。
- **灵活路由**: 基于任务类型、内容特性、成本敏感度、用户偏好等因素动态选择最合适的模型和服务。

#### 5.1.2 智能路由策略
- **成本优化**: 根据任务复杂度选择模型
- **性能优化**: 负载均衡和缓存
- **可用性**: 自动故障转移
- **质量保证**: 结果验证和重试

### 5.2 AI处理流水线

```mermaid
graph LR
    Input[输入内容] --> Preprocess[预处理]
    Preprocess --> Route[智能路由]
    
    Route --> OpenAI[OpenAI处理]
    Route --> Claude[Claude处理]
    Route --> Local[本地模型]
    
    OpenAI --> Cache[结果缓存]
    Claude --> Cache
    Local --> Cache
    
    Cache --> Postprocess[后处理]
    Postprocess --> Validate[结果验证]
    Validate --> Output[输出结果]
    
    Validate --> Retry[重试机制]
    Retry --> Route
```

### 5.3 提示工程模块

#### 5.3.1 提示模板管理
```yaml
prompt_templates:
  summarization:
    template: |
      请为以下内容生成简洁的摘要，突出关键信息：
      
      内容：{content}
      
      要求：
      - 摘要长度不超过200字
      - 保留核心观点和关键数据
      - 使用清晰的中文表达
    parameters:
      - name: content
        type: string
        required: true
  
  keyword_extraction:
    template: |
      从以下内容中提取5-10个最重要的关键词：
      
      内容：{content}
      
      输出格式：JSON数组，每个关键词包含词汇和重要性评分
    parameters:
      - name: content
        type: string
        required: true
```

## 6. 安全架构设计

### 6.1 认证授权架构

#### 6.1.1 认证流程
```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as 前端应用
    participant Gateway as API网关
    participant Auth as 认证服务
    participant JWT as JWT服务
    
    User->>Frontend: 登录请求
    Frontend->>Gateway: 转发认证
    Gateway->>Auth: 验证凭据
    
    Auth->>Auth: 验证用户名密码
    Auth->>JWT: 生成JWT令牌
    JWT-->>Auth: 返回令牌
    
    Auth-->>Gateway: 认证成功+令牌
    Gateway-->>Frontend: 返回令牌
    Frontend-->>User: 登录成功
    
    Note over User,JWT: 后续请求携带JWT令牌
    
    User->>Frontend: API请求
    Frontend->>Gateway: 请求+JWT
    Gateway->>JWT: 验证令牌
    JWT-->>Gateway: 令牌有效
    Gateway->>Auth: 检查权限
    Auth-->>Gateway: 权限确认
    Gateway->>Backend: 转发请求
```

#### 6.1.2 权限控制模型
```yaml
rbac_model:
  roles:
    - name: "user"
      permissions:
        - "knowledge:read:own"
        - "knowledge:write:own"
        - "knowledge:delete:own"
    - name: "premium_user"
      inherits: ["user"]
      permissions:
        - "ai:advanced_features"
        - "export:unlimited"
    - name: "admin"
      permissions:
        - "*:*:*"
  
  resources:
    - name: "knowledge"
      attributes: ["user_id", "visibility"]
    - name: "ai"
      attributes: ["feature_level"]
  
  policies:
    - effect: "allow"
      subject: "user"
      resource: "knowledge"
      action: "read"
      condition: "resource.user_id == subject.user_id"
```

### 6.2 数据安全

#### 6.2.1 加密策略
- **传输加密**: TLS 1.3
- **存储加密**: AES-256
- **数据库加密**: 透明数据加密(TDE)
- **密钥管理**: HashiCorp Vault

#### 6.2.2 隐私保护
- **数据脱敏**: 敏感信息自动识别和脱敏
- **访问日志**: 完整的数据访问审计
- **数据隔离**: 多租户数据严格隔离
- **GDPR合规**: 数据删除和导出权利

## 7. 性能与可扩展性

### 7.1 性能目标

#### 7.1.1 响应时间要求
- **内容捕获**: < 5秒
- **搜索查询**: < 500ms
- **AI处理**: < 30秒
- **图谱查询**: < 1秒
- **页面加载**: < 2秒

#### 7.1.2 吞吐量要求
- **并发用户**: 10,000
- **每日处理**: 1,000,000个知识项
- **API调用**: 100,000 QPS
- **存储容量**: 100TB

### 7.2 扩展策略

#### 7.2.1 水平扩展
```yaml
scaling_config:
  api_gateway:
    min_replicas: 3
    max_replicas: 50
    target_cpu: 70%
  
  mcp_services:
    min_replicas: 2
    max_replicas: 20
    target_cpu: 80%
    target_memory: 85%
  
  databases:
    neo4j:
      cluster_size: 3
      read_replicas: 5
    mongodb:
      shards: 10
      replica_set_size: 3
    redis:
      cluster_nodes: 6
      sentinel_nodes: 3
```

#### 7.2.2 缓存策略
```mermaid
graph TB
    subgraph "多层缓存架构"
        CDN[CDN缓存]
        Browser[浏览器缓存]
        Gateway[网关缓存]
        App[应用缓存]
        Redis[Redis缓存]
        DB[数据库缓存]
    end
    
    User --> CDN
    CDN --> Browser
    Browser --> Gateway
    Gateway --> App
    App --> Redis
    Redis --> DB
    
    CDN -.-> |静态资源| S3
    Gateway -.-> |API响应| Memory
    App -.-> |查询结果| Memory
    Redis -.-> |热点数据| Memory
    DB -.-> |查询计划| Disk
```

### 7.3 监控与观测

#### 7.3.1 监控指标
```yaml
monitoring_metrics:
  system:
    - cpu_usage
    - memory_usage
    - disk_io
    - network_io
  
  application:
    - request_rate
    - response_time
    - error_rate
    - active_users
  
  business:
    - knowledge_items_processed
    - ai_api_calls
    - user_engagement
    - cost_per_user
  
  custom:
    - knowledge_graph_size
    - embedding_quality
    - recommendation_accuracy
```

#### 7.3.2 告警策略
```yaml
alerts:
  critical:
    - name: "service_down"
      condition: "up == 0"
      duration: "1m"
      action: "page_oncall"
    
    - name: "high_error_rate"
      condition: "error_rate > 5%"
      duration: "5m"
      action: "slack_alert"
  
  warning:
    - name: "high_latency"
      condition: "response_time > 2s"
      duration: "10m"
      action: "email_team"
    
    - name: "ai_cost_spike"
      condition: "ai_cost_per_hour > threshold"
      duration: "1h"
      action: "cost_alert"
```

## 8. 部署与运维

### 8.1 轻量化部署策略

#### 8.1.1 极简版部署 (个人入门)

**系统要求**:
- 操作系统: macOS/Linux/Windows
- 内存: 1GB RAM
- 存储: 5GB 可用空间
- 网络: 可选互联网连接 (AI功能需要)

**安装步骤**:
```bash
# 1. 下载BASB极简版
curl -L https://github.com/basb/releases/latest/basb-minimal.tar.gz | tar xz
cd basb-minimal

# 2. 配置Obsidian
mkdir -p ~/.basb/vault
cp -r templates/* ~/.basb/vault/

# 3. 启动服务
./basb-start.sh
```

**服务配置**:
```yaml
# config/minimal.yaml
services:
  obsidian_core:
    vault_path: "~/.basb/vault"
    plugins: ["graph-view", "search", "templates"]
  
  cloud_ai:
    enabled: false  # 默认关闭，按需启用
    provider: "openai"  # 或 "claude"
    api_key_env: "OPENAI_API_KEY"
    model: "gpt-3.5-turbo"
  
  storage:
    type: "sqlite"
    path: "~/.basb/data.db"
  
  web_ui:
    port: 3000
    host: "localhost"
```

#### 8.1.2 标准版部署 (个人进阶)

**系统要求**:
- Docker & Docker Compose
- 内存: 4GB RAM
- 存储: 50GB 可用空间

**Docker Compose配置**:
```yaml
# docker-compose.yml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - webapp
  
  webapp:
    image: basb/webapp:standard
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/basb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
      - chromadb
  
  mcp_services:
    image: basb/mcp-services:standard
    environment:
      - OBSIDIAN_VAULT_PATH=/data/vault
      - POSTGRES_URL=postgresql://user:pass@postgres:5432/basb
      - CHROMA_URL=http://chromadb:8000
    volumes:
      - vault_data:/data/vault
      - mcp_data:/data/mcp
    depends_on:
      - postgres
      - chromadb
  
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=basb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
  
  chromadb:
    image: chromadb/chroma:latest
    volumes:
      - chroma_data:/chroma/chroma
  
  ollama: # 用于运行本地LLM，如DeepSeek
    image: ollama/ollama:latest
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
    # 可选：根据需要预拉取DeepSeek等模型
    # command: sh -c "ollama serve & ollama pull deepseek-coder & ollama pull deepseek-llm & wait" 
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all # 如果有GPU，分配给Ollama
              capabilities: [gpu]
        limits:
          memory: "16G" # 根据运行模型调整
        reservations:
          memory: "8G"

volumes:
  vault_data:
  mcp_data:
  postgres_data:
  redis_data:
  chroma_data:
  ollama_data:
```

**启动命令**:
```bash
# 克隆配置
git clone https://github.com/basb/deploy-standard.git
cd deploy-standard

# 配置环境变量
cp .env.example .env
vim .env  # 编辑配置

# 启动服务
docker-compose up -d

# 初始化数据
docker-compose exec mcp_services basb-init
```

#### 8.1.3 专业版部署 (小团队)

**系统要求**:
- Docker Swarm 或 单机Docker
- 内存: 8GB RAM
- 存储: 200GB 可用空间

**Traefik配置** (`traefik.yml`):
```yaml
api:
  dashboard: true
  insecure: true

entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

providers:
  docker:
    exposedByDefault: false
  file:
    filename: /etc/traefik/dynamic.yml

certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com
      storage: acme.json
      httpChallenge:
        entryPoint: web
```

**Ollama AI服务配置**:
```yaml
# docker-compose.yml 中的 Ollama 服务 (运行DeepSeek等本地模型)
services:
  ollama:
    image: ollama/ollama:latest
    container_name: basb-ollama-deepseek
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11434:11434"
    environment:
      - OLLAMA_HOST=0.0.0.0
      # - OLLAMA_MODELS=/path/to/custom/models # 如果有自定义模型存放路径
    restart: unless-stopped
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all # 分配所有可用GPU
              capabilities: [gpu]
        limits:
          memory: "24G" # 根据运行的DeepSeek模型大小调整，例如DeepSeek-Coder 33B可能需要更多
        reservations:
          memory: "16G"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.ollama.rule=Host(`ollama.basb.local`) || Host(`deepseek.basb.local`)" # 可通过多个域名访问
      - "traefik.http.services.ollama.loadbalancer.server.port=11434"

  # AI模型初始化 (确保DeepSeek模型被拉取)
  ollama-setup:
    image: ollama/ollama:latest # 使用与ollama服务相同的镜像版本
    container_name: basb-ollama-setup
    depends_on:
      ollama: # 显式声明依赖ollama服务
        condition: service_started # 等待ollama服务启动后再执行
    volumes:
      - ollama_data:/root/.ollama # 共享相同的ollama数据卷，确保模型拉取到正确位置
      # 如果有初始化脚本，可以挂载脚本目录
      # - ./scripts/ollama_init.sh:/init.sh 
    # command: /init.sh # 执行初始化脚本
    command: >
      sh -c "
        echo 'Waiting for Ollama service to be fully ready...'; 
        until curl -s http://ollama:11434/api/tags > /dev/null; do 
          sleep 5; 
        done; 
        echo 'Ollama service is up. Pulling DeepSeek models...'; 
        ollama pull deepseek-coder; 
        ollama pull deepseek-llm; 
        # ollama pull deepseek-moe; # 如果需要
        # ollama pull mxbai-embed-large; # 如果需要本地embedding模型
        echo 'DeepSeek models pulled successfully or already exist.'; 
      "
    restart: on-failure # 如果初始化失败则重试几次
```

**服务编排**:
```yaml
# docker-compose.pro.yml
version: '3.8'
services:
  traefik:
    image: traefik:v3.0
    command:
      - --configFile=/etc/traefik/traefik.yml
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik:/etc/traefik
      - letsencrypt:/letsencrypt
  
  webapp:
    image: basb/webapp:professional
    deploy:
      replicas: 2
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.webapp.rule=Host(`basb.example.com`)"
      - "traefik.http.routers.webapp.tls.certresolver=letsencrypt"
  
  mcp_cluster:
    image: basb/mcp-services:professional
    deploy:
      replicas: 3
    environment:
      - CLUSTER_MODE=true
      - NEO4J_URL=bolt://neo4j:7687
      - QDRANT_URL=http://qdrant:6333
  
  postgres_primary:
    image: postgres:15-alpine
    environment:
      - POSTGRES_REPLICATION_MODE=master
      - POSTGRES_REPLICATION_USER=replicator
      - POSTGRES_REPLICATION_PASSWORD=replicator_password
  
  postgres_replica:
    image: postgres:15-alpine
    environment:
      - POSTGRES_REPLICATION_MODE=slave
      - POSTGRES_MASTER_HOST=postgres_primary
  
  neo4j:
    image: neo4j:5-community
    environment:
      - NEO4J_AUTH=neo4j/password
      - NEO4J_PLUGINS=["apoc"]
    volumes:
      - neo4j_data:/data
  
  qdrant:
    image: qdrant/qdrant:latest
    volumes:
      - qdrant_data:/qdrant/storage
  
  redis_cluster:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes
    deploy:
      replicas: 3
  
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=admin
      - MINIO_ROOT_PASSWORD=password
    volumes:
      - minio_data:/data
  
  uptime_kuma:
    image: louislam/uptime-kuma:latest
    volumes:
      - uptime_data:/app/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.uptime.rule=Host(`monitor.example.com`)"

volumes:
  letsencrypt:
  neo4j_data:
  qdrant_data:
  minio_data:
  uptime_data:
```

#### 8.1.4 部署脚本

**一键部署脚本**:
```bash
#!/bin/bash
# deploy.sh

set -e

VERSION=${1:-"minimal"}
DOMAIN=${2:-"localhost"}

echo "Deploying BASB ${VERSION} version..."

case $VERSION in
  "minimal")
    echo "Setting up minimal deployment..."
    ./scripts/deploy-minimal.sh
    ;;
  "standard")
    echo "Setting up standard deployment..."
    ./scripts/deploy-standard.sh $DOMAIN
    ;;
  "professional")
    echo "Setting up professional deployment..."
    ./scripts/deploy-professional.sh $DOMAIN
    ;;
  *)
    echo "Unknown version: $VERSION"
    echo "Usage: $0 [minimal|standard|professional] [domain]"
    exit 1
    ;;
esac

echo "Deployment completed!"
echo "Access your BASB system at: http://$DOMAIN"
```

#### 8.1.5 资源优化

**内存优化配置**:
```yaml
# 极简版内存配置
resource_limits:
  obsidian_core: "256MB"
  sqlite: "64MB"
  web_ui: "128MB"
  total: "~1GB"  # 无本地AI，纯文档管理

# 标准版内存配置
resource_limits:
  webapp: "512MB"
  mcp_services: "1GB"
  postgres: "1GB"
  redis: "256MB"
  chromadb: "512MB"
  total: "~4GB"  # 云端AI + 本地向量化

# 专业版内存配置
resource_limits:
  webapp: "512MB"
  mcp_services: "1GB"
  postgres: "1GB"
  redis: "256MB"
  chromadb: "512MB"
  neo4j: "1GB"
  ollama: "2GB"
  total: "~8GB"  # 本地Ollama + 完整功能
```

**启动时间优化**:
```yaml
optimizations:
  lazy_loading: true
  precompiled_assets: true
  connection_pooling: true
  cache_warming: true
  parallel_startup: true
  
startup_targets:
  minimal: "< 15秒"  # 直接进程启动，无AI加载
  standard: "< 2分钟"  # Docker快速启动
  professional: "< 5分钟"  # 包含Ollama模型预加载
```
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

##### 生产镜像
FROM base AS production
COPY --from=build /app/dist ./dist
EXPOSE 3000
USER node
CMD ["npm", "start"]
```

#### 8.1.2 Kubernetes部署
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: basb-api
  namespace: basb
spec:
  replicas: 3
  selector:
    matchLabels:
      app: basb-api
  template:
    metadata:
      labels:
        app: basb-api
    spec:
      containers:
      - name: api
        image: basb/api:v1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: basb-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 8.2 CI/CD流水线

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_REGISTRY: registry.gitlab.com/basb
  KUBERNETES_NAMESPACE: basb

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run test
    - npm run lint
    - npm run type-check
  coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $DOCKER_REGISTRY/api:$CI_COMMIT_SHA .
    - docker push $DOCKER_REGISTRY/api:$CI_COMMIT_SHA
  only:
    - main
    - develop

deploy_staging:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/basb-api api=$DOCKER_REGISTRY/api:$CI_COMMIT_SHA -n $KUBERNETES_NAMESPACE-staging
    - kubectl rollout status deployment/basb-api -n $KUBERNETES_NAMESPACE-staging
  environment:
    name: staging
    url: https://staging.basb.example.com
  only:
    - develop

deploy_production:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/basb-api api=$DOCKER_REGISTRY/api:$CI_COMMIT_SHA -n $KUBERNETES_NAMESPACE
    - kubectl rollout status deployment/basb-api -n $KUBERNETES_NAMESPACE
  environment:
    name: production
    url: https://basb.example.com
  when: manual
  only:
    - main
```

### 8.3 备份与恢复

#### 8.3.1 备份策略
```yaml
backup_strategy:
  databases:
    neo4j:
      frequency: "daily"
      retention: "30 days"
      method: "dump"
      storage: "s3://basb-backups/neo4j/"
    
    mongodb:
      frequency: "every 6 hours"
      retention: "7 days"
      method: "mongodump"
      storage: "s3://basb-backups/mongodb/"
    
    redis:
      frequency: "hourly"
      retention: "24 hours"
      method: "rdb_snapshot"
      storage: "s3://basb-backups/redis/"
  
  application_data:
    user_files:
      frequency: "continuous"
      method: "s3_replication"
      cross_region: true
    
    configurations:
      frequency: "on_change"
      method: "git_commit"
      repository: "config-repo"
```

#### 8.3.2 灾难恢复
```yaml
disaster_recovery:
  rto: "4 hours"  # Recovery Time Objective
  rpo: "1 hour"   # Recovery Point Objective
  
  procedures:
    - name: "database_restore"
      steps:
        - "Stop application services"
        - "Restore database from backup"
        - "Verify data integrity"
        - "Restart services"
        - "Run health checks"
    
    - name: "full_system_restore"
      steps:
        - "Provision new infrastructure"
        - "Deploy application stack"
        - "Restore all databases"
        - "Restore user files"
        - "Update DNS records"
        - "Verify system functionality"
```

## 9. 风险评估与缓解

### 9.1 技术风险

#### 9.1.1 AI服务依赖风险
**风险**: 外部AI服务不可用、性能下降、成本激增、API变更或服务商政策调整。
**影响**: 系统核心AI功能受限或中断，用户体验下降，运营成本不可控。
**缓解策略**:
- **默认本地优先 (DeepSeek via Ollama)**: 将DeepSeek作为基础和默认的LLM服务，并优先通过Ollama进行本地化部署。这能显著降低对外部服务的直接依赖，增强数据隐私，并提供更可预测的成本模型（主要是硬件和运维）。
- **多AI提供商战略 (OpenAI, Gemini as Options)**: 系统设计支持快速切换和集成OpenAI、Gemini等主流云端AI服务。这些服务可作为特定高级功能的增强，或在本地DeepSeek遇到问题时的备选方案。
- **统一AI服务抽象层**: 通过一个统一的接口与所有AI服务（无论是本地还是云端）交互，简化服务切换和管理。
- **智能路由与动态选择**: 实现AI服务智能路由机制，能根据任务需求（如文本生成、摘要、编码、嵌入）、成本预算、当前服务可用性、模型性能（如上下文窗口、特定能力）和用户偏好，动态选择最合适的AI模型和服务（DeepSeek本地、DeepSeek云、OpenAI、Gemini等）。
- **本地模型作为坚实后盾**: 即使在需要使用云端AI的场景，也应确保有基础的本地模型（如较小版本的DeepSeek或其他开源模型）作为降级选项，保证核心功能在极端情况下的可用性。
- **成本监控与预算控制**: 对所有AI服务的使用进行精细化成本监控，包括云API调用费用和本地部署的资源消耗。设置预算阈值和告警机制。
- **API版本管理与兼容性测试**: 跟踪各AI提供商的API版本更新，并进行兼容性测试，避免因API不兼容导致服务中断。
- **定期评估与技术选型更新**: 定期重新评估各AI提供商的性能、成本效益、服务条款和技术路线图，适时调整系统AI策略和技术选型。

#### 9.1.2 数据一致性风险
**风险**: 分布式系统数据不一致
**影响**: 用户体验下降，数据丢失
**缓解策略**:
- 事务边界明确定义
- 最终一致性监控
- 数据修复机制
- 定期一致性检查

### 9.2 性能风险

#### 9.2.1 扩展性瓶颈
**风险**: 系统无法支撑用户增长
**影响**: 性能下降，用户流失
**缓解策略**:
- 水平扩展设计
- 性能测试和监控
- 容量规划
- 自动扩缩容

### 9.3 安全风险

#### 9.3.1 数据泄露风险
**风险**: 用户隐私数据被泄露
**影响**: 法律责任，信任危机
**缓解策略**:
- 端到端加密
- 访问控制和审计
- 安全测试
- 合规认证

## 10. 迁移策略

### 10.1 现有工具迁移

#### 10.1.1 Obsidian基础部署策略
```yaml
obsidian_deployment:
  # 个人版 (默认配置)
  personal_edition:
    setup:
      - install_obsidian_app
      - configure_basb_vault_template
      - setup_para_folder_structure
      - install_essential_plugins
    
    plugins:
      - basb_capture_plugin  # 内容捕获
      - para_organizer      # PARA组织
      - smart_connections   # 智能链接推荐
      - graph_analysis      # 图谱分析
    
    templates:
      - daily_note_template
      - project_template
      - area_template
      - resource_template
  
  # 现有Vault迁移
  vault_migration:
    data_extraction:
      - markdown_files
      - attachments
      - graph_connections
      - tags_and_metadata
    
    transformation:
      - preserve_folder_structure
      - maintain_link_relationships
      - convert_to_para_structure
      - setup_basb_templates
    
    validation:
      - verify_link_integrity
      - check_file_accessibility
      - validate_para_organization
  
  # 专业版扩展 (可选)
  professional_extension:
    neo4j_integration:
      - install_neo4j_plugin
      - configure_sync_settings
      - setup_advanced_queries
    
    ai_features:
      - smart_recommendations
      - auto_tagging
      - content_analysis
```

#### 10.1.2 其他工具支持
- **Notion**: API导出 + 结构转换
- **Roam Research**: JSON导出 + 图谱重建
- **Logseq**: Markdown兼容 + 块引用转换
- **Readwise**: 高亮同步 + 元数据保留

### 10.2 分阶段迁移

```mermaid
gantt
    title BASB系统迁移时间线
    dateFormat  YYYY-MM-DD
    section 准备阶段
    数据评估           :prep1, 2024-01-01, 1w
    迁移工具开发       :prep2, after prep1, 2w
    测试环境搭建       :prep3, after prep2, 1w
    
    section 试点迁移
    小规模用户测试     :pilot1, after prep3, 2w
    问题修复优化       :pilot2, after pilot1, 1w
    
    section 批量迁移
    第一批用户迁移     :batch1, after pilot2, 2w
    第二批用户迁移     :batch2, after batch1, 2w
    第三批用户迁移     :batch3, after batch2, 2w
    
    section 完成阶段
    数据验证           :final1, after batch3, 1w
    系统优化           :final2, after final1, 1w
    迁移完成           :final3, after final2, 1d
```

## 11. 成本分析

### 11.1 基础设施成本

#### 11.1.1 云服务成本 (月度)
```yaml
infrastructure_costs:
  compute:
    kubernetes_cluster: $2000
    worker_nodes: $3000
    load_balancers: $500
  
  storage:
    databases: $1500
    object_storage: $800
    backup_storage: $400
  
  networking:
    data_transfer: $600
    cdn: $300
  
  monitoring:
    prometheus_grafana: $200
    logging: $300
  
  total_monthly: $9600
```

#### 11.1.2 AI服务成本
```yaml
ai_costs:
  deepseek_service: # 默认服务
    local_ollama_gpu_amortized: $300-$800/month # 估算本地Ollama部署所需GPU的月度分摊成本 (硬件折旧、电力等)
    cloud_api_calls: $X00/month # (可选) 若部分场景使用DeepSeek云API，按实际用量估算

  openai_optional: # 可选服务 (按需使用)
    api_calls: $Y00/month # 根据实际调用量估算 (e.g., GPT-4, embeddings)

  gemini_optional: # 可选服务 (按需使用)
    api_calls: $W00/month # 根据实际调用量估算 (e.g., Gemini Pro, Gemini Ultra)
  
  # 其他本地模型 (若有独立部署，非通过DeepSeek的Ollama实例)
  # other_local_models_gpu: $Z00/month
  
  estimated_total_ai_monthly: "$ (local_gpu + deepseek_cloud_api_if_used + openai_if_used + gemini_if_used)" 
  # 示例: 若主要依赖本地DeepSeek ($500) + 少量OpenAI ($200) = $700/月
  # 总成本高度依赖于DeepSeek本地部署程度和可选云服务的使用频率。
```
*注: 上述成本为高度抽象的示例估算。实际成本需根据具体模型选择、硬件配置、云服务商的最新定价策略以及API调用量精确计算。优先本地部署DeepSeek旨在最大化成本效益和数据控制。*

### 11.2 成本优化策略

- **智能路由**: 根据任务复杂度选择合适的AI模型
- **结果缓存**: 减少重复AI调用
- **本地模型**: 降低简单任务成本
- **资源调度**: 动态扩缩容优化资源使用

## 12. 技术债务管理

### 12.1 架构债务

#### 12.1.1 已知技术债务
- **单体遗留**: 部分功能仍需拆分为微服务
- **数据模型**: 历史数据结构需要优化
- **API版本**: 需要统一API版本管理

#### 12.1.2 债务偿还计划
```yaml
tech_debt_roadmap:
  q1_2024:
    - refactor_legacy_search
    - implement_api_versioning
    - optimize_database_schema
  
  q2_2024:
    - microservice_decomposition
    - performance_optimization
    - security_hardening
  
  q3_2024:
    - ai_model_optimization
    - caching_layer_improvement
    - monitoring_enhancement
```

## 13. 质量保证

### 13.1 测试策略

#### 13.1.1 测试金字塔
```yaml
testing_strategy:
  unit_tests:
    coverage: 90%
    tools: ["jest", "pytest"]
    automation: "pre_commit"
  
  integration_tests:
    coverage: 80%
    tools: ["testcontainers", "newman"]
    automation: "ci_pipeline"
  
  e2e_tests:
    coverage: "critical_paths"
    tools: ["playwright", "cypress"]
    automation: "nightly"
  
  performance_tests:
    tools: ["k6", "jmeter"]
    frequency: "weekly"
    targets: "sla_compliance"
```

#### 13.1.2 质量门控
- **代码覆盖率**: > 85%
- **性能基准**: 响应时间 < SLA要求
- **安全扫描**: 无高危漏洞
- **依赖检查**: 无已知安全漏洞

### 13.2 代码质量

#### 13.2.1 代码规范
```yaml
code_standards:
  linting:
    javascript: "eslint + prettier"
    python: "black + flake8"
    typescript: "tslint + prettier"
  
  documentation:
    api: "openapi_3.0"
    code: "jsdoc + sphinx"
    architecture: "c4_model"
  
  review_process:
    required_reviewers: 2
    automated_checks: true
    security_review: "for_sensitive_changes"
```

## 14. 总结

### 14.1 架构优势

1. **模块化设计**: MCP原子服务确保系统的可维护性和可扩展性
2. **技术先进性**: 采用云原生架构和最新的AI技术
3. **用户体验**: 基于BASB方法论的科学知识管理
4. **性能保证**: 多层缓存和水平扩展确保高性能
5. **安全可靠**: 全面的安全措施和灾难恢复机制

### 14.2 实施建议

1. **分阶段实施**: 按照MVP -> 核心功能 -> 高级功能的顺序
2. **持续优化**: 基于用户反馈和性能监控持续改进
3. **团队培训**: 确保开发团队掌握相关技术栈
4. **社区建设**: 建立用户社区，收集需求和反馈

### 14.3 下一步行动

1. **技术验证**: 构建关键组件的POC
2. **团队组建**: 招募具备相关技能的开发人员
3. **基础设施**: 搭建开发和测试环境
4. **详细设计**: 进入Stage 3详细设计阶段

---

**文档状态**: ✅ 完成  
**审核状态**: 待审核  
**下一阶段**: Stage 3 - Detailed Design  
**负责人**: Software Development Engineer