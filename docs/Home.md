# Kode - AI-Powered Terminal Assistant Wiki

## 项目简介 (Project Introduction)

Kode 是一个基于人工智能的终端助手 (AI-Powered Terminal Assistant)，专为开发者设计。它将先进的大型语言模型 (Large Language Models) 能力直接集成到命令行环境中，实现智能代码理解、文件操作、命令执行和复杂开发工作流的自动化。Kode 的核心使命是通过 AI 技术显著提升开发者在终端环境中的生产力和工作效率。

## 核心特性列表 (Core Features)

### 🤖 AI 驱动能力
- **多模型协作系统 (Multi-Model Collaboration)**：支持 Claude、GPT、Qwen 等多种 AI 模型的智能协作
- **专家咨询机制 (Expert Consultation)**：通过 `@ask-model-name` 语法咨询特定 AI 模型
- **智能代理系统 (Intelligent Agent System)**：使用 `@run-agent-name` 委托专业子代理处理复杂任务

### 🛠️ 工具化架构
- **18+ 核心工具 (Core Tools)**：文件操作、系统命令、AI协作等标准化工具集
- **工具优先设计 (Tool-First Architecture)**：所有功能抽象为统一的 Tool 接口
- **异步流式处理 (Async Streaming)**：支持实时进度反馈和操作取消

### 🎯 智能用户体验
- **智能补全系统 (Smart Completion)**：7+ 算法融合的上下文感知补全
- **@ 提及系统 (Mention System)**：智能文件、模型、代理引用
- **AGENTS.md 支持**：自动生成和维护项目文档

### 🔒 安全与权限
- **双模式运行 (Dual Mode)**：安全模式 (--safe) 和宽松模式 (YOLO mode)
- **多层权限检查 (Multi-Layer Permission)**：工具级、会话级、持久级权限控制
- **安全沙箱执行 (Secure Sandbox)**：命令执行的安全隔离机制

### 🚀 高性能设计
- **并行工具执行 (Parallel Tool Execution)**：智能依赖分析和并发执行
- **智能缓存系统 (Intelligent Caching)**：多层缓存优化响应速度
- **上下文压缩 (Context Compression)**：自动优化 AI 模型的上下文窗口使用

## 技术栈 (Tech Stack)

### 核心技术框架
- **运行时环境**: Node.js 18+ / Bun (开发环境)
- **编程语言**: TypeScript 5.9+ (严格模式)
- **终端UI框架**: React 18.3 + Ink 5.2 (Terminal React)
- **命令行解析**: Commander.js 13.1 (CLI Argument Parsing)
- **数据验证**: Zod 3.25+ (Runtime Type Validation)

### AI 服务集成
- **Anthropic Claude**: @anthropic-ai/sdk 0.39+ (主要 AI 服务)
- **OpenAI GPT**: openai 4.104+ (多模型支持)
- **模型上下文协议**: @modelcontextprotocol/sdk 1.15+ (MCP Integration)

### 开发工具链
- **构建系统**: Bun + 自定义构建脚本
- **代码格式化**: Prettier 3.6+ (Code Formatting)
- **测试框架**: Bun Test (内置测试运行器)
- **包管理**: Bun Package Manager

### 系统集成
- **文件系统**: Node.js fs/promises + 文件监控
- **进程管理**: spawn-rx 5.1 (Reactive Process Management)
- **搜索引擎**: ripgrep (High-Performance Text Search)
- **Web请求**: undici 7.11 (High-Performance HTTP Client)

## Wiki 导航 (Wiki Navigation)

### 📖 基础指南
- **[安装配置指南](Installation.md)** - 环境准备、安装步骤和配置说明
- **[快速开始教程](Quick-Start.md)** - 5分钟上手 Kode 的核心功能

### 🏗️ 架构设计 (/Architecture/)
- **[架构总览](Architecture/Overview.md)** - 系统整体架构和设计哲学
- **[工具系统模块](Architecture/Module-Tools.md)** - 18+ 工具的设计与实现
- **[AI集成模块](Architecture/Module-AI.md)** - 多模型协作系统架构
- **[用户界面模块](Architecture/Module-UI.md)** - React/Ink 终端UI系统
- **[服务集成模块](Architecture/Module-Services.md)** - 外部服务和MCP集成

### 🔍 代码深度分析 (/Code-Analysis/)
- **[代码精粹分析](Code-Analysis/Highlights.md)** - 优秀设计模式和实现亮点
- **[潜在问题与改进建议](Code-Analysis/Issues-and-Suggestions.md)** - 架构缺陷和性能优化建议

### 🧪 测试体系 (/Testing/)
- **[测试指南](Testing/Guide.md)** - 测试架构、工具和运行方法

### 📚 开发指南
- **[工具开发指南](Development/Tool-Development.md)** - 如何开发自定义工具
- **[插件开发指南](Development/Plugin-Development.md)** - 插件系统和扩展机制
- **[贡献指南](Development/Contributing.md)** - 项目贡献流程和规范

### 🔧 运维管理
- **[部署指南](Operations/Deployment.md)** - 生产环境部署和配置
- **[监控告警](Operations/Monitoring.md)** - 性能监控和问题诊断
- **[故障排除](Operations/Troubleshooting.md)** - 常见问题和解决方案

---

## 项目状态 (Project Status)

- **当前版本**: 1.0.80
- **许可证**: Apache 2.0 License
- **开发状态**: 🟢 活跃开发中 (Active Development)
- **稳定性**: 🟡 Beta 阶段 (Beta Stage)

## 快速链接 (Quick Links)

- 📦 [NPM Package](https://www.npmjs.com/package/@shareai-lab/kode)
- 🐙 [GitHub Repository](https://github.com/shareAI-lab/kode)
- 📋 [Issue Tracker](https://github.com/shareAI-lab/kode/issues)
- 💬 [Discussions](https://github.com/shareAI-lab/kode/discussions)

---

*最后更新时间: 2025-01-XX*