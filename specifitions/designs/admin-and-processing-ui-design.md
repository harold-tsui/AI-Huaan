# Admin & Processing UI/UX Design

This document outlines the UI/UX design for the BASB system's administrative and knowledge processing features, reflecting that the primary knowledge consumption occurs in Obsidian.

## 1. Core Design Philosophy

- **Configuration-First**: The UI will prioritize easy access to all system configurations.
- **Action-Oriented**: The interface will be designed to facilitate powerful backend actions like knowledge ingestion, organization, and distillation.
- **Minimalist Presentation**: Since knowledge is viewed in Obsidian, this UI will not attempt to replicate a full knowledge browser. Instead, it will provide necessary previews and status indicators.

## 2. Main Dashboard - Wireframe

**Description**: A central hub for accessing all configuration and processing modules.

```
+----------------------------------------------------------------------+
| BASB - Admin Dashboard                                               |
+----------------------------------------------------------------------+
| Navigation                               | Main Content Area         |
|------------------------------------------|---------------------------|
| - Configuration                          |                           |
|   - Core Platform                        |                           |
|   - PARA Organization                    |                           |
|   - Knowledge Ingestion                  |                           |
|                                          |                           |
| - Knowledge Processing                   |                           |
|   - Distill & Summarize                  |                           |
|   - Search & Retrieval                   |                           |
|                                          |                           |
| - System Status                          |                           |
|   - API Health                           |                           |
|   - Service Logs                         |                           |
|                                          |                           |
+----------------------------------------------------------------------+
```

## 3. Configuration UI Modules

### 3.1. PARA Organization Config

**Description**: Allows users to configure the rules for automatic PARA classification.

**Wireframe Concept**:
```
+--------------------------------------------------------------------+
| # PARA Organization Configuration                                  |
+--------------------------------------------------------------------+
|                                                                    |
|  [+] Add New Rule                                                  |
|                                                                    |
|  Rule 1: If tag is 'project-x', move to 'Projects/Project X'       |
|                                                              [Edit]|
|                                                                    |
|  Rule 2: If source is 'work-email', move to 'Areas/Work'           |
|                                                              [Edit]|
|                                                                    |
|  [ Save Changes ]                                                  |
|                                                                    |
+--------------------------------------------------------------------+
```

## 4. Knowledge Processing UI Modules

### 4.1. Distill & Processing

**Description**: A UI to trigger and view the results of knowledge distillation tasks (e.g., summarization, concept extraction).

**Wireframe Concept**:
```
+--------------------------------------------------------------------+
| # Distill & Process Knowledge                                      |
+--------------------------------------------------------------------+
|                                                                    |
|  Select Knowledge Item(s) to Process:                              |
|  [ Dropdown or Search to find items... ]                           |
|                                                                    |
|  Processing Action:                                                |
|  (o) Summarize                                                     |
|  ( ) Extract Key Concepts                                          |
|  ( ) Discover Relations                                            |
|                                                                    |
|  [ Run Process ]                                                   |
|                                                                    |
|  ---                                                               |
|                                                                    |
|  Results:                                                          |
|  +--------------------------------------------------------------+  |
|  | Summary for 'Item X':                                        |  |
|  | <Generated summary text...>                                  |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
+--------------------------------------------------------------------+
```

## 5. Next Steps

- Refine user flows for each configuration and processing module.
- Develop high-fidelity mockups in Figma based on these wireframes.
- Conduct usability testing with a focus on the clarity and efficiency of the configuration process.