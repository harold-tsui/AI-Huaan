```yaml
project_overview:  
  vision: "通过 MCP 原子服务，赋能个体构建和维护一个全面的第二大脑，并增强 Obsidian 的本地化存储能力。"
  scope: "基于 Obsidian Local REST API 和 MCP 原子服务的个人知识管理系统，重点关注提升本地化存储的广度和深度。"
  success_metrics:   
    - 知识捕获效率提升
    - 信息检索速度和准确性提高
    - 创意产出增加
    - 认知负荷降低
    - 对 Obsidian 本地存储的利用更加充分和灵活

code_framework_requirements:  
  capture:  
    functional_requirements:  
      # 将在此处填充具体需求
      - "支持从多种来源（如网页、PDF、邮件、文本笔记、图片、音视频链接等）捕获信息到 Obsidian 本地库"
      - "通过 MCP 服务实现自动化元数据提取（如来源 URL、创建日期、作者等）"
      - "定义内容格式的标准化流程，确保导入 Obsidian 的信息具有一致性"
      - "实现重复内容检测机制，辅助用户管理冗余信息"
      - "支持通过 MCP 服务创建具有特定模板的笔记，用于结构化信息捕获"
    non_functional_requirements:  
      # 将在此处填充具体需求
      - "捕获服务需支持高并发处理，确保用户体验流畅"
      - "捕获服务的正常运行时间不低于 99.9%"
      - "支持至少20种常见文件类型和在线内容的直接捕获或链接捕获"
    supported_sources:  
      # 将在此处填充具体需求
      - "网页和文章（例如，使用类似 Web Clipper 的功能通过 MCP 服务实现）"
      - "PDF 文档（包括文本提取和嵌入式存储）"
      - "电子邮件（关键信息提取和归档）"
      - "音频/视频内容（元数据、转录文本链接或摘要的捕获）"
      - "手动输入的文本笔记和想法"
      - "图片和屏幕截图（支持OCR文本提取）"
      
  organize:  
    para_implementation:  
      projects: "支持通过 MCP 服务创建和管理与项目相关的笔记和文件夹结构，包含明确的时间节点和成果物。"
      areas: "支持通过 MCP 服务维护与长期责任领域相关的笔记和文件夹，确保持续性管理。"
      resources: "支持通过 MCP 服务组织参考资料和兴趣主题，便于未来查阅。"
      archive: "支持通过 MCP 服务归档已完成或不再活跃的项目和区域资料。"
      initial_organization: "支持在系统启动时，通过 MCP 服务触发对现有 Obsidian 库中的笔记和文件夹进行一次性的 PARA 方法初步组织。此过程可以基于用户定义的规则（如文件夹名称、标签、创建日期等）或通过引导式流程辅助用户完成分类。"
    search_requirements:  
      # 将在此处填充具体需求
      - "通过 MCP 服务实现对 Obsidian 库内所有内容的全文检索"
      - "支持基于标签、文件夹路径、元数据（如创建/修改日期）的组合过滤搜索"
      - "探索通过 MCP 服务集成语义搜索能力（可能需要外部 AI 服务支持）"
      - "支持通过 MCP 服务进行知识图谱节点的文本内容搜索"
    categorization:  
      # 将在此处填充具体需求
      - "支持通过 MCP 服务对笔记进行手动和半自动（基于规则或建议）的标签添加和管理"
      - "支持通过 MCP 服务创建和维护标签层级或分类体系"
      - "支持通过 MCP 服务进行笔记的批量移动、打标签等组织操作"
      
  distill:  
    summarization_needs:  
      # 将在此处填充具体需求
      - "支持通过 MCP 服务对长笔记进行渐进式总结（例如，提取高亮、要点）"
      - "探索集成 AI 服务通过 MCP 实现自动化摘要生成"
      - "支持通过 MCP 服务提取笔记中的关键引言、图片、表格等元素"
    ai_enhancement:  
      # 将在此处填充具体需求
      - "通过 MCP 服务调用 AI 能力，自动识别笔记间的潜在关联"
      - "通过 MCP 服务调用 AI 能力，进行知识模式识别和洞察提取"
      - "通过 MCP 服务调用 AI 能力，识别知识空白并提供学习建议"
    progressive_refinement:  
      # 将在此处填充具体需求
      - "支持笔记版本历史的记录与追踪（依赖 Obsidian 自身功能，MCP 服务可用于触发保存）"
      - "支持通过 MCP 服务创建和应用笔记模板，确保知识提炼的一致性"
      - "支持通过 MCP 服务进行知识点的合并、重组和链接"
      
  express:  
    output_formats:  
      # 将在此处填充具体需求
      - "支持通过 MCP 服务将笔记或笔记集合导出为 Markdown 文件"
      - "支持通过 MCP 服务将笔记内容转换为 PDF 格式（可能需要集成外部工具）"
      - "支持通过 MCP 服务生成可分享的网页链接或静态 HTML 文件（依赖 Obsidian 插件或外部工具）"
    sharing_mechanisms:  
      # 将在此处填充具体需求
      - "支持通过 MCP 服务管理笔记的分享设置（如果 Obsidian 或其插件支持）"
      - "支持通过 MCP 服务将笔记内容导出到剪贴板或特定应用"
    collaboration_features:  
      # 将在此处填充具体需求
      - "探索通过 MCP 服务支持多用户对同一 Obsidian 库进行协作的可能性（需仔细评估 Obsidian 的支持程度）"

mcp_atomic_services:
  # 基于 newtype-01/obsidian-mcp 的工具，并考虑扩展
  capture_services:
    - "`create_note_service` (基于 `create_note`): 负责创建新笔记，可扩展支持模板、元数据填充。"
    - "`import_content_service`: 用于从不同来源导入内容并创建笔记，可能包含解析和格式化逻辑。"
  organization_services:
    - "`manage_folder_service` (基于 `manage_folder`): 负责文件夹的创建、重命名、移动、删除。"
    - "`list_notes_service` (基于 `list_notes`): 列出笔记，可扩展支持按文件夹、标签、日期等过滤。"
    - "`tag_management_service`: (新需求) 负责笔记标签的增删改查。"
    - "`search_service` (基于 `search_vault`): 提供强大的搜索功能，支持多种搜索条件。"
    - "`initial_para_organization_service`: (新需求) 负责在系统启动或用户触发时，对现有知识库进行 PARA 方法的初步组织和迁移。"
  processing_services:
    - "`read_note_service` (基于 `read_note`): 读取笔记内容和元数据。"
    - "`update_note_service` (基于 `update_note`): 更新笔记内容，可支持部分更新或全量更新。"
    - "`link_discovery_service`: (新需求) 发现和建议笔记间的链接。"
    - "`summarization_service`: (新需求, 可能集成AI) 辅助用户提炼笔记核心内容。"
  storage_services: # 这些服务主要依赖Obsidian本身，MCP服务是其接口
    - "`knowledge_graph_interaction_service`: (新需求) 支持查询和可视化知识图谱的节点和连接（依赖Obsidian图谱功能）。"
    - "`version_control_service_interface`: (新需求) 与Obsidian的版本控制功能交互（如触发保存，查询历史版本元数据）。"
  presentation_services:
    - "`export_note_service`: (新需求) 将笔记导出为不同格式。"
    - "`sharing_service_interface`: (新需求) 与Obsidian的分享功能交互（如果可用）。"

knowledge_graph_and_linking_requirements:
  # 将在此处填充具体需求
  - "支持通过 MCP 服务创建和删除笔记间的双向链接。"
  - "MCP 服务应能查询指定笔记的入链和出链。"
  - "探索通过 MCP 服务和 AI 自动发现和建议相关链接。"
  - "支持通过 MCP 服务进行基于链接关系的知识图谱可视化查询（例如，查找与某主题相关的二级连接节点）。"

ai_enhanced_functionality_requirements:
  # 将在此处填充具体需求
  - "通过 MCP 服务集成 AI，实现智能内容分类和自动打标签建议。"
  - "通过 MCP 服务集成 AI，实现自动化摘要和关键信息提取。"
  - "通过 MCP 服务集成 AI，辅助识别知识体系中的断层或缺失环节。"
  - "通过 MCP 服务集成 AI，提供个性化的内容回顾和学习建议。"

non_functional_requirements:
  # 将在此处填充具体需求
  - "所有 MCP 服务响应时间在95%的情况下应小于500毫秒（不含外部AI调用时间）。"
  - "系统需支持至少10万级别笔记量的 Obsidian 库的流畅操作。"
  - "确保通过 MCP 服务对 Obsidian 库的操作符合 Obsidian 的数据完整性和安全性要求。"
  - "MCP 服务本身应具备良好的可扩展性，方便未来增加新的原子服务。"
  - "提供清晰的错误处理和日志记录机制，方便问题排查。"

# --- 以下为次要交付物，暂不在此文件中详述，但会在后续阶段考虑 ---
# User Journey Maps
# Feature Prioritization Matrix
# Risk Analysis
# Competitor Analysis (e.g., comparing with tools like Notion, Roam, Logseq in terms of local-first + API access)
# Integration Requirements (e.g., with calendar apps, task managers)
```