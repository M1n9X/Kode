# Kode 全量升级指南（整合 anon-kode 与 Claude Code Reverse 借鉴点）

本文将前两份升级计划（optimization/upgrade-plan.md 与 optimization/reverse-upgrade-plan.md）进行整合，形成一份自洽、可执行、按优先级排序的完整升级指南。目标是：任何工程师拿到本文档，都能按阶段逐步实现 Kode 的全部改造与增强。

- 基础代码库：`/Users/mxue/GitRepos/Coding/Kode`
- 参考对比：
  - anon-kode：`/Users/mxue/GitRepos/Coding/anon-kode`
  - Claude Code Reverse（CodeBreeze）：`/Users/mxue/GitRepos/Coding/claude-code/claude_code_reverse`

---

## 1. 总体目标与原则

- 保持 Kode 的核心优势：
  - 动态 Agent 体系（AGENTS.md/CLAUDE.md 兼容、5 层优先级加载）
  - 完整的工具体系与更强的 Tool 接口（进度流、校验、并发声明、UI 渲染）
  - 多模型画像/指针管理与适配（含 GPT‑5 错误自愈、ModelAdapterFactory）
  - MCP 客户端能力与安全权限体系（默认安全姿态可配置）
  - 发行策略稳健（Bun 开发 + Node 包装 `cli.js`）与隐私优先（可选 Sentry、无 Statsig）
- 有选择地借鉴：
  - MCP 传输与 CLI 能力（HTTP/WS、作用域操作、从 Claude Desktop 导入、健康检查）
  - 更细粒度的权限模式（acceptEdits、plan）
  - Hook 生命周期（Pre/Post Tool、SessionStart/End 等，严格可选、受安全模式约束）
  - 可选 SDK 嵌入层与（必要时）stream‑JSON 运行模式
  - 计划评审（Plan Review）工具，用于执行前把控
  - 配置导入兼容层与可选状态栏
- 明确不引入：
  - Statsig 及外部 gating/遥测；任何降低稳定性、仅为占位的“模拟”实现

---

## 2. 优先级与阶段划分（Roadmap）

下表为优先级与阶段安排（P0 最高）：

- P0 基础稳定性与开发体验
  - 包装器/路径鲁棒性、开发脚本、文档补强、跨平台/代理、快速清理
- P1 MCP 能力对齐与 CLI 增强
  - 新增 HTTP/WS 传输、作用域 list|get|remove、导入 Claude Desktop、健康检查等
- P2 权限模式增强 + 默认安全姿态
  - 新增 acceptEdits / plan 模式；REPL 与 CLI 可切换；默认安全策略可配置
- P3 工具接口一致性 + 模型体验（校验/修复）
  - 全量巡检工具实现；新增 `/model` 系列命令（list/use/validate/repair）
- P4 Hook 生命周期（可选、默认关闭）
  - PreToolUse / PostToolUse / SessionStart / SessionEnd 等命令式 Hook
- P5 计划评审（Plan Review）工具
  - 执行前对多步骤方案进行结构性审查与评分
- P6 SDK 嵌入层（可选）
  - 对外暴露最小 SDK；必要时提供 stream‑JSON 模式
- P7 状态栏（可选）
  - 长耗时任务的底部状态提示

建议里程碑顺序：P0 → P1 → P2 → P3 → P5 → P4 → P6 → P7（其中 P4/P6/P7 可按需并行/延后）

---

## 3. 分阶段详细计划

### P0 基础稳定性与开发体验

- 目标
  - 强化 `cli.js` 包装器路径解析与 Yoga WASM 定位；为无 Bun 环境补充 Node 开发脚本；补全文档（MCP 使用、安全模式说明、代理/Windows 指南）；快速清理小问题。
- 任务清单
  - 包装器加固：借鉴 anon-kode `bin/kode` 的“真实路径解析（symlink 解析）”思路，融合进 `cli.js`，同时保持当前 Bun/Node 兼容与 `YOGA_WASM_PATH` 逻辑。
    - 文件：`cli.js`
  - 新增 Node 开发脚本（不影响发行）：
    - `package.json` 增加 `dev:node`: `tsx ./src/entrypoints/cli.tsx --verbose`
  - 文档增强：在 `README.md` 增补 MCP Server 用法（`which kode` + Claude Desktop `mcpServers` 示例）、安全模式说明（YOLO vs safe、默认策略与切换方式）、代理环境配置与 Windows 最佳实践。
    - 文件：`README.md`
  - 小清理：去除重复 import（如 `src/entrypoints/cli.tsx` 重复引入 Onboarding）、校对未使用 import。
    - 文件：`src/entrypoints/cli.tsx` 等
- 验收标准
  - `bun run dev` 与 `npm run dev:node` 均可启动；全局安装/多层 symlink 场景下 `kode` 能稳定定位包根与 Yoga WASM；README 新增章节可独立完成 MCP 配置；重复 import 清理完成。
- 风险与缓解
  - 路径异常：加入 `KODE_WRAPPER_DEBUG=1` 以打印解析路径；Mac/WSL/Win 交叉验证。

### P1 MCP 能力对齐与 CLI 增强

- 目标
  - 在保持现有 `@modelcontextprotocol/sdk` 能力基础上，补齐 HTTP/WS 传输；增强 CLI：作用域 list|get|remove、从 Claude Desktop 导入、健康检查等。
- 任务清单
  - MCP 客户端扩展：在 `src/services/mcpClient.ts` 引入 HTTP 与 WS 传输（不替换已有 stdio/SSE，而是按配置类型选择）；健康检查 API。
  - CLI 命令增强：新增 `mcp` 子命令集（或扩展现有命令）：
    - `list|get|remove` 支持作用域（project/local/global）
    - `add-json` 从 JSON 添加
    - `import-desktop` 从 Claude Desktop 导入配置
    - `health` 逐个服务器探测并输出状态
    - 可选：项目级“全部启用/禁用”、approve/reject 类似 `.mcp.json` 的批处理
    - 文件：`src/commands/mcp.tsx`（新），`src/commands.ts`，`src/entrypoints/cli.tsx`（注册）
- 验收标准
  - CLI 可对 stdio/http/sse/ws 四类服务器进行 list|get|remove；可以导入 Desktop 配置；`mcp health` 输出稳定、含错误信息与类型标识。
- 风险与缓解
  - 网络波动与超时：为 HTTP/WS 设置超时与清晰错误；日志避免泄露敏感信息。

### P2 权限模式增强 + 默认安全姿态

- 目标
  - 在 safe/YOLO 之外，新增 `acceptEdits`（自动通过文件编辑、保留 shell/network 提示）与 `plan`（只允许规划类工具）模式；REPL 显示与 CLI 切换；默认安全策略可配置/首启引导。
- 任务清单
  - 扩展权限判断：在 `src/permissions.ts` 与相关工具权限判断处，增加按模式的“工具类别”判定（文件编辑、shell、网络、规划等）。
  - REPL/CLI 切换：增加 `/mode` 命令与 CLI 标志，REPL 明显展示当前模式并给出切换提示。
    - 文件：`src/screens/REPL.tsx`，`src/entrypoints/cli.tsx`，`src/commands/mode.tsx`（新），`src/commands.ts`
  - 默认策略：通过环境变量（如 `KODE_DEFAULT_SAFE=true`）或首次引导选择默认模式，并持久化到配置。
    - 文件：`src/utils/config.ts`
- 验收标准
  - 从 REPL 和 CLI 都能查看/切换权限模式；不同模式下工具提示/阻断行为符合预期；默认模式可控。
- 风险与缓解
  - 模式过多造成心智负担：保持文案简洁、REPL 明示、README 提供对照表。

### P3 工具接口一致性 + 模型体验（校验/修复）

- 目标
  - 确保所有工具完整实现 Kode 的 Tool 契约；提供 `/model` 系列命令，提升模型配置“可见性、可修复性”。
- 任务清单
  - 工具一致性巡检：补齐 `validateInput`、`isReadOnly`、`isConcurrencySafe`、`renderToolUseMessage/Result` 一致性；只读工具纳入 `getReadOnlyTools()`。
    - 文件：`src/tools/*`，`src/Tool.ts`，`src/tools.ts`
  - 模型命令：新增 `/model list|use|validate|repair`；`validate/repair` 复用 `src/services/openai.ts` 中已有错误自愈逻辑（max_tokens → max_completion_tokens、删除 stream_options/citations 等），并把结果回写到画像状态（`validationStatus/lastValidation`）。
    - 文件：`src/commands/model.tsx`（新），`src/commands.ts`，`src/utils/model.ts`，`src/services/openai.ts`，`src/utils/config.ts`
- 验收标准
  - 工具在严格类型与 bun 测试下运行稳定；`/model` 命令可列出画像/指针并做校验与常见修复。
- 风险与缓解
  - 工具数量多：先覆盖高频工具；对长尾工具列出 TODO 清单与验收项。

### P4 Hook 生命周期（可选、默认关闭）

- 目标
  - 提供可选的 Hook 机制，允许在工具前后与会话起止执行外部命令；严格受安全模式与配置控制。
- 任务清单
  - HookSystem：
    - 类型：`PreToolUse`、`PostToolUse`、`SessionStart`、`SessionEnd`、`Notification`
    - 匹配：按工具名子串与/或 JSON 匹配
    - 执行：命令式、可超时、注入最小必要 env；失败不崩溃
    - 校验：配置对象结构校验与错误提示
    - 文件：`src/services/hooks/HookSystem.ts`（新），`src/utils/config.ts`（新增 Hook 配置读取/合并），`src/screens/REPL.tsx`（会话起止触发），工具调用点（Pre/Post Tool）
  - 文档与默认：默认关闭；safe/plan 模式下进一步限制可执行的 Hook 类型
- 验收标准
  - 配置启用后能稳定执行 Hook；失败/超时可见且不影响主流程；关闭/变更即时生效。
- 风险与缓解
  - 安全：默认关闭；明确受权限模式控制；文档强调最小权限原则。

### P5 计划评审（Plan Review）工具

- 目标
  - 在执行前对多步骤计划进行结构/完整性/清晰度打分与建议，降低“误操作风险”。
- 任务清单
  - 新增 `PlanReviewTool`：分析输入计划（文本），输出结构得分、完整性得分、清晰度得分、问题列表、建议与下一步；可被 TaskTool 在 safe/plan 模式下优先调用。
    - 文件：`src/tools/PlanReviewTool/PlanReviewTool.tsx`（新），`src/tools/PlanReviewTool/prompt.ts`（新），`src/tools.ts`
  - REPL/命令：提供 `/plan-review` 简便入口（可选）
- 验收标准
  - 工具返回结构化结果；与 TaskTool 的挂钩可配置（自动/手动）
- 风险与缓解
  - 误判：强调为“建议/评审”，默认不强制阻断，除非用户在 `plan` 模式下开启“强校验”。

### P6 SDK 嵌入层（可选）

- 目标
  - 对外暴露极简 SDK，使外部 Node 程序可直接驱动 Kode；如有需要再提供 stream‑JSON 模式兼容。
- 任务清单
  - `@shareai-lab/kode/sdk`：导出 `query({ prompt, options })`（异步迭代器）、`.interrupt()`、`.setPermissionMode()` 等最小表面。
    - 文件：`src/sdk/index.ts`（新），`src/sdk/Query.ts`（新）
  - 可选：在 `src/entrypoints/cli.tsx` 增加 `--output-format stream-json` 兼容，复用现有内部流程。
- 验收标准
  - 示例脚本可通过 SDK 拉起会话并收消息；REPL 不被破坏。
- 风险与缓解
  - 控制面过度公开：标注为“实验性”，默认关闭 stream‑JSON；保留向后兼容空间。

### P7 状态栏（可选）

- 目标
  - 为长耗时任务提供底部状态栏（如当前模式/用量/活动工具/心跳），不干扰 REPL。
- 任务清单
  - 组件与配置：
    - 新增 `src/components/StatusLine.tsx`，`src/utils/config.ts` 增加开关或“命令式数据源”配置
    - REPL 集成：`src/screens/REPL.tsx` 条件渲染
- 验收标准
  - 开启时状态栏稳定刷新、关闭无副作用；默认关闭。
- 风险与缓解
  - 过度刷新导致抖动：限制刷新频率，或在输出流事件上节流。

---

## 4. 跨阶段共性工作

- 代理与网络：集中化代理注入（`undici.ProxyAgent`），统一用于 OpenAI/Anthropic/MCP/http(s) 请求。
  - 文件：`src/services/openai.ts`、`src/services/claude.ts`、`src/services/mcpClient.ts`、新增 `src/utils/http.ts`
- 文档与示例：每个里程碑完成后更新 `README.md`、补充使用示例与已知问题。
- 质量保障：所有改动需通过 `bun run typecheck`、`bun test`、`bun run format:check`；必要时补单元测试（Hook 校验、PlanReview）。

---

## 5. 执行节奏与迭代策略

- 建议 PR 切分
  - P0：包装器 + dev:node + 文档 + 小清理（1–2 个 PR）
  - P1：MCP 客户端与 CLI（1–2 个 PR，先客户端后命令）
  - P2：权限模式与默认姿态（1 个 PR）
  - P3：工具一致性 + 模型命令（1–2 个 PR）
  - P5：PlanReview 工具（1 个 PR）
  - P4/P6/P7：按需排期与灰度（每项 1 个 PR）
- 灰度与开关
  - 新功能默认关闭或走“实验性”标记（如 `KODE_EXPERIMENTAL_SDK=1`、`hooks.enabled=false`），逐步公开。
- 回滚策略
  - 关键路径（包装器、权限、MCP）改动保留环境变量快速关闭/恢复旧行为；提供清晰的变更日志与排障说明。

---

## 6. 完成定义（Definition of Done）

当满足以下条件，可视为本轮升级完成：

- P0–P3、P5 完成并文档齐全，测试/类型检查/Lint 全绿；
- MCP 四种传输均可按配置正常工作，CLI 提供作用域操作、健康检查与 Desktop 导入；
- 权限模式在 REPL 与 CLI 可视/可切换，默认姿态明确可控；
- 工具接口一致，模型命令可校验/修复常见问题；
- PlanReview 可用，并能与 TaskTool 协同；
- 可选功能（Hook/SDK/状态栏）在默认关闭下无副作用，开启后行为可控；
- README 覆盖 MCP、权限模式、代理/Windows、PlanReview、（可选）SDK/Hook/状态栏的使用说明。

---

## 7. 附：关键文件导航（便于分工）

- 入口/包装：`src/entrypoints/cli.tsx`，`cli.js`，`package.json`
- REPL：`src/screens/REPL.tsx`
- 工具与注册：`src/Tool.ts`，`src/tools.ts`，`src/tools/*`
- Agent：`src/utils/agentLoader.ts`
- 模型与适配：`src/utils/model.ts`，`src/services/openai.ts`，`src/services/modelAdapterFactory.ts`，`src/services/claude.ts`
- MCP：`src/services/mcpClient.ts`，`src/commands/mcp.tsx`（新），`src/commands.ts`
- 权限：`src/permissions.ts`
- 配置：`src/utils/config.ts`
- Hook（新）：`src/services/hooks/HookSystem.ts`
- 计划评审（新）：`src/tools/PlanReviewTool/*`
- SDK（可选新）：`src/sdk/*`
- 公共网络：`src/utils/http.ts`（新）
- 文档：`README.md`，`AGENTS.md`

以上为整合后的优先级路线与实施细节。建议先完成 P0–P3（核心稳定性、MCP 对齐、权限模式、工具/模型体验），随后按业务需要逐步引入 P5/P4/P6/P7。
