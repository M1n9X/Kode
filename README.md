# Kode - AI Coding
<img width="991" height="479" alt="image" src="https://github.com/user-attachments/assets/c1751e92-94dc-4e4a-9558-8cd2d058c1a1" />  <br> 
[![npm version](https://badge.fury.io/js/@shareai-lab%2Fkode.svg)](https://www.npmjs.com/package/@shareai-lab/kode)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![AGENTS.md](https://img.shields.io/badge/AGENTS.md-Compatible-brightgreen)](https://agents.md)

[中文文档](README.zh-CN.md) | [Contributing](CONTRIBUTING.md) | [Documentation](docs/)

## 🎉 Big Announcement: We're Now Apache 2.0 Licensed!

**Great news for the developer community!** In our commitment to democratizing AI agent technology and fostering a vibrant ecosystem of innovation, we're thrilled to announce that Kode has transitioned from AGPLv3 to the **Apache 2.0 license**.

### What This Means for You:
- ✅ **Complete Freedom**: Use Kode in any project - personal, commercial, or enterprise
- ✅ **Build Without Barriers**: Create proprietary solutions without open-sourcing requirements
- ✅ **Simple Attribution**: Just maintain copyright notices and license info
- ✅ **Join a Movement**: Be part of accelerating the world's transition to AI-powered development

This change reflects our belief that the future of software development is collaborative, open, and augmented by AI. By removing licensing barriers, we're empowering developers worldwide to build the next generation of AI-assisted tools and workflows. Let's build the future together! 🚀

## 📢 Update Log

**2025-08-29**: We've added Windows support! All Windows users can now run Kode using Git Bash, Unix subsystems, or WSL (Windows Subsystem for Linux) on their computers.


## 🤝 AGENTS.md Standard Support

**Kode proudly supports the [AGENTS.md standard protocol](https://agents.md) initiated by OpenAI** - a simple, open format for guiding programming agents that's used by 20k+ open source projects.

### Full Compatibility with Multiple Standards

- ✅ **AGENTS.md** - Native support for the OpenAI-initiated standard format
- ✅ **CLAUDE.md** - Full backward compatibility with Claude Code configurations  
- ✅ **Subagent System** - Advanced agent delegation and task orchestration
- ✅ **Cross-platform** - Works with 20+ AI models and providers

Use `# Your documentation request` to generate and maintain your AGENTS.md file automatically, while maintaining full compatibility with existing Claude Code workflows.

## Overview

Kode is a powerful AI assistant that lives in your terminal. It can understand your codebase, edit files, run commands, and handle entire workflows for you.

> **⚠️ Security Notice**: Kode runs in YOLO mode by default (equivalent to Claude's `--dangerously-skip-permissions` flag), bypassing all permission checks for maximum productivity. YOLO mode is recommended only for trusted, secure environments when working on non-critical projects. If you're working with important files or using models of questionable capability, we strongly recommend using `kode --safe` to enable permission checks and manual approval for all operations.
> 
> **📊 Model Performance**: For optimal performance, we recommend using newer, more capable models designed for autonomous task completion. Avoid older Q&A-focused models like GPT-4o or Gemini 2.5 Pro, which are optimized for answering questions rather than sustained independent task execution. Choose models specifically trained for agentic workflows and extended reasoning capabilities.

<img width="600" height="577" alt="image" src="https://github.com/user-attachments/assets/8b46a39d-1ab6-4669-9391-14ccc6c5234c" />

## Features

### Core Capabilities
- 🤖 **AI-Powered Assistance** - Uses advanced AI models to understand and respond to your requests
- 🔄 **Multi-Model Collaboration** - Flexibly switch and combine multiple AI models to leverage their unique strengths
- 🦜 **Expert Model Consultation** - Use `@ask-model-name` to consult specific AI models for specialized analysis
- 👤 **Intelligent Agent System** - Use `@run-agent-name` to delegate tasks to specialized subagents
- 📝 **Code Editing** - Directly edit files with intelligent suggestions and improvements
- 🔍 **Codebase Understanding** - Analyzes your project structure and code relationships
- 🚀 **Command Execution** - Run shell commands and see results in real-time
- 🛠️ **Workflow Automation** - Handle complex development tasks with simple prompts

### 🎯 Advanced Intelligent Completion System
Our state-of-the-art completion system provides unparalleled coding assistance:

#### Smart Fuzzy Matching
- **Hyphen-Aware Matching** - Type `dao` to match `run-agent-dao-qi-harmony-designer`
- **Abbreviation Support** - `dq` matches `dao-qi`, `nde` matches `node`
- **Numeric Suffix Handling** - `py3` intelligently matches `python3`
- **Multi-Algorithm Fusion** - Combines 7+ matching algorithms for best results

#### Intelligent Context Detection
- **No @ Required** - Type `gp5` directly to match `@ask-gpt-5`
- **Auto-Prefix Addition** - Tab/Enter automatically adds `@` for agents and models
- **Mixed Completion** - Seamlessly switch between commands, files, agents, and models
- **Smart Prioritization** - Results ranked by relevance and usage frequency

#### Unix Command Optimization
- **500+ Common Commands** - Curated database of frequently used Unix/Linux commands
- **System Intersection** - Only shows commands that actually exist on your system
- **Priority Scoring** - Common commands appear first (git, npm, docker, etc.)
- **Real-time Loading** - Dynamic command discovery from system PATH

### User Experience
- 🎨 **Interactive UI** - Beautiful terminal interface with syntax highlighting
- 🔌 **Tool System** - Extensible architecture with specialized tools for different tasks
- 💾 **Context Management** - Smart context handling to maintain conversation continuity
- 📋 **AGENTS.md Integration** - Use `# documentation requests` to auto-generate and maintain project documentation

## Installation

```bash
npm install -g @shareai-lab/kode
```

After installation, you can use any of these commands:
- `kode` - Primary command
- `kwa` - Kode With Agent (alternative)
- `kd` - Ultra-short alias

### Windows Notes

- Install Git for Windows to provide a Bash (Unix‑like) environment: https://git-scm.com/download/win
  - Kode automatically prefers Git Bash/MSYS or WSL Bash when available.
  - If neither is available, it will fall back to your default shell, but many features work best with Bash.
- Use VS Code’s integrated terminal rather than legacy Command Prompt (cmd):
  - Better font rendering and icon support.
  - Fewer path and encoding quirks compared to cmd.
  - Select “Git Bash” as the VS Code terminal shell when possible.
- Optional: If you install globally via npm, avoid spaces in the global prefix path to prevent shim issues.
  - Example: `npm config set prefix "C:\\npm"` and reinstall global packages.

## Usage

### Interactive Mode
Start an interactive session:
```bash
kode
# or
kwa
# or
kd
```

### Non-Interactive Mode
Get a quick response:
```bash
kode -p "explain this function" main.js
# or
kwa -p "explain this function" main.js
```

### Using the @ Mention System

Kode supports a powerful @ mention system for intelligent completions:

#### 🦜 Expert Model Consultation
```bash
# Consult specific AI models for expert opinions
@ask-claude-sonnet-4 How should I optimize this React component for performance?
@ask-gpt-5 What are the security implications of this authentication method?
@ask-o1-preview Analyze the complexity of this algorithm
```

#### 👤 Specialized Agent Delegation  
```bash
# Delegate tasks to specialized subagents
@run-agent-simplicity-auditor Review this code for over-engineering
@run-agent-architect Design a microservices architecture for this system
@run-agent-test-writer Create comprehensive tests for these modules
```

#### 📁 Smart File References
```bash
# Reference files and directories with auto-completion
@src/components/Button.tsx
@docs/api-reference.md
@.env.example
```

The @ mention system provides intelligent completions as you type, showing available models, agents, and files.

### AGENTS.md Documentation Mode

Use the `#` prefix to generate and maintain your AGENTS.md documentation:

```bash
# Generate setup instructions
# How do I set up the development environment?

# Create testing documentation  
# What are the testing procedures for this project?

# Document deployment process
# Explain the deployment pipeline and requirements
```

This mode automatically formats responses as structured documentation and appends them to your AGENTS.md file.

### Docker Usage

#### Alternative: Build from local source

```bash
# Clone the repository
git clone https://github.com/shareAI-lab/Kode.git
cd Kode

# Build the image locally
docker build --no-cache -t kode .

# Run in your project directory
cd your-project
docker run -it --rm \
  -v $(pwd):/workspace \
  -v ~/.kode:/root/.kode \
  -v ~/.kode.json:/root/.kode.json \
  -w /workspace \
  kode
```

#### Docker Configuration Details

The Docker setup includes:

- **Volume Mounts**:
  - `$(pwd):/workspace` - Mounts your current project directory
  - `~/.kode:/root/.kode` - Preserves your kode configuration directory between runs
  - `~/.kode.json:/root/.kode.json` - Preserves your kode global configuration file between runs

- **Working Directory**: Set to `/workspace` inside the container

- **Interactive Mode**: Uses `-it` flags for interactive terminal access

- **Cleanup**: `--rm` flag removes the container after exit

**Note**: Kode stores data under `~/.kode/` and prefers `~/.kode/config.json` for global configuration. For backward compatibility, `~/.kode.json` is still supported and automatically used if the directory config is missing.

The first time you run the Docker command, it will build the image. Subsequent runs will use the cached image for faster startup.

You can use the onboarding to set up the model, or `/model`.
If you don't see the models you want on the list, you can manually set them in `/config`
As long as you have an openai-like endpoint, it should work.

### MCP Servers (Model Context Protocol)

Kode both runs as an MCP client and can expose its own tools as an MCP server for other apps (e.g., Claude Desktop).

#### Supported Transport Types
- **stdio**: Standard input/output communication (most common)
- **sse**: Server-Sent Events over HTTP
- **http**: HTTP-based communication  
- **ws**: WebSocket connections

#### MCP Client Commands
- List configured servers: `kode mcp list`
- Add stdio server: `kode mcp add <name> <command> [args...]`
- Add SSE server: `kode mcp add <name> <url>`
- Add HTTP server: `kode mcp add-http <name> <http://url>`
- Add WebSocket server: `kode mcp add-ws <name> <ws://url>`
- Add from JSON: `kode mcp add-json <name> '{"type": "sse", "url": "https://example"}'`
- Show details: `kode mcp get <name>`
- Remove server: `kode mcp remove <name>`
- Import from Claude Desktop: `kode mcp import-desktop`
- Health check all servers: `kode mcp health`

#### MCP Server Mode
- Start Kode as an MCP server (stdio): `kode mcp serve`

To connect Kode to Claude Desktop, add an entry to Claude Desktop’s config under `mcpServers`:

```json
{
  "mcpServers": {
    "kode": {
      "type": "stdio",
      "command": "/usr/local/bin/kode",
      "args": ["mcp", "serve"]
    }
  }
}
```

Find the path with `which kode` (macOS/Linux) or `where kode` (Windows). You can also reset local project-scoped approvals any time: `kode mcp reset-project-choices`.

### Models CLI

- List pointers and profiles: `kode models list`
- Set pointer: `kode models use <main|task|reasoning|quick> <model>`
- Validate/repair GPT‑5 profiles: `kode models validate` / `kode models repair`

### Plan Review

- Review a multi-step plan and get structured feedback: `/plan-review <plan>`
- In plan mode, TaskTool auto-runs a quick plan review before execution and shows a summary.

### Proxy

Kode honors standard proxy env vars via a global undici dispatcher:

```bash
export ALL_PROXY="http://127.0.0.1:7890"
# or
export HTTPS_PROXY="http://127.0.0.1:7890"
export HTTP_PROXY="http://127.0.0.1:7890"
```

### Hooks (Experimental)

Configure lifecycle hooks in `~/.kode.json` (default disabled):

```json
{
  "hooks": {
    "enabled": true,
    "sessionStart": [{ "command": "echo start", "timeoutMs": 1500 }],
    "preToolUse": [{ "match": "Bash", "command": "echo pre-bash" }],
    "postToolUse": [{ "match": "View", "command": "echo viewed" }]
  }
}
```

### Commands

- `/help` - Show available commands
- `/model` - Change AI model settings
- `/config` - Open configuration panel
- `/cost` - Show token usage and costs
- `/clear` - Clear conversation history
- `/init` - Initialize project context

## Multi-Model Intelligent Collaboration

Unlike official Claude which supports only a single model, Kode implements **true multi-model collaboration**, allowing you to fully leverage the unique strengths of different AI models.

### 🏗️ Core Technical Architecture

#### 1. **ModelManager Multi-Model Manager**
We designed a unified `ModelManager` system that supports:
- **Model Profiles**: Each model has an independent configuration file containing API endpoints, authentication, context window size, cost parameters, etc.
- **Model Pointers**: Users can configure default models for different purposes in the `/model` command:
  - `main`: Default model for main Agent
  - `task`: Default model for SubAgent
  - `reasoning`: Reserved for future ThinkTool usage
  - `quick`: Fast model for simple NLP tasks (security identification, title generation, etc.)
- **Dynamic Model Switching**: Support runtime model switching without restarting sessions, maintaining context continuity

#### 2. **TaskTool Intelligent Task Distribution**
Our specially designed `TaskTool` (Architect tool) implements:
- **Subagent Mechanism**: Can launch multiple sub-agents to process tasks in parallel
- **Model Parameter Passing**: Users can specify which model SubAgents should use in their requests
- **Default Model Configuration**: SubAgents use the model configured by the `task` pointer by default

#### 3. **AskExpertModel Expert Consultation Tool**
We specially designed the `AskExpertModel` tool:
- **Expert Model Invocation**: Allows temporarily calling specific expert models to solve difficult problems during conversations
- **Model Isolation Execution**: Expert model responses are processed independently without affecting the main conversation flow
- **Knowledge Integration**: Integrates expert model insights into the current task

#### 🎯 Flexible Model Switching
- **Tab Key Quick Switch**: Press Tab in the input box to quickly switch the model for the current conversation
- **`/model` Command**: Use `/model` command to configure and manage multiple model profiles, set default models for different purposes
- **User Control**: Users can specify specific models for task processing at any time

#### 🔄 Intelligent Work Allocation Strategy

**Architecture Design Phase**
- Use **o3 model** or **GPT-5 model** to explore system architecture and formulate sharp and clear technical solutions
- These models excel in abstract thinking and system design

**Solution Refinement Phase**
- Use **gemini model** to deeply explore production environment design details
- Leverage its deep accumulation in practical engineering and balanced reasoning capabilities

**Code Implementation Phase**
- Use **Qwen Coder model**, **Kimi k2 model**, **GLM-4.5 model**, or **Claude Sonnet 4 model** for specific code writing
- These models have strong performance in code generation, file editing, and engineering implementation
- Support parallel processing of multiple coding tasks through subagents

**Problem Solving**
- When encountering complex problems, consult expert models like **o3 model**, **Claude Opus 4.1 model**, or **Grok 4 model**
- Obtain deep technical insights and innovative solutions

#### 💡 Practical Application Scenarios

```bash
# Example 1: Architecture Design
"Use o3 model to help me design a high-concurrency message queue system architecture"

# Example 2: Multi-Model Collaboration
"First use GPT-5 model to analyze the root cause of this performance issue, then use Claude Sonnet 4 model to write optimization code"

# Example 3: Parallel Task Processing
"Use Qwen Coder model as subagent to refactor these three modules simultaneously"

# Example 4: Expert Consultation
"This memory leak issue is tricky, ask Claude Opus 4.1 model separately for solutions"

# Example 5: Code Review
"Have Kimi k2 model review the code quality of this PR"

# Example 6: Complex Reasoning
"Use Grok 4 model to help me derive the time complexity of this algorithm"

# Example 7: Solution Design
"Have GLM-4.5 model design a microservice decomposition plan"
```

### 🛠️ Key Implementation Mechanisms

#### **Configuration System**
```typescript
// Example of multi-model configuration support
{
  "modelProfiles": {
    "o3": { "provider": "openai", "model": "o3", "apiKey": "..." },
    "claude4": { "provider": "anthropic", "model": "claude-sonnet-4", "apiKey": "..." },
    "qwen": { "provider": "alibaba", "model": "qwen-coder", "apiKey": "..." }
  },
  "modelPointers": {
    "main": "claude4",      // Main conversation model
    "task": "qwen",         // Task execution model
    "reasoning": "o3",      // Reasoning model
    "quick": "glm-4.5"      // Quick response model
  }
}
```

#### **Cost Tracking System**
- **Usage Statistics**: Use `/cost` command to view token usage and costs for each model
- **Multi-Model Cost Comparison**: Track usage costs of different models in real-time
- **History Records**: Save cost data for each session

#### **Context Manager**
- **Context Inheritance**: Maintain conversation continuity when switching models
- **Context Window Adaptation**: Automatically adjust based on different models' context window sizes
- **Session State Preservation**: Ensure information consistency during multi-model collaboration

### 🚀 Advantages of Multi-Model Collaboration

1. **Maximized Efficiency**: Each task is handled by the most suitable model
2. **Cost Optimization**: Use lightweight models for simple tasks, powerful models for complex tasks
3. **Parallel Processing**: Multiple models can work on different subtasks simultaneously
4. **Flexible Switching**: Switch models based on task requirements without restarting sessions
5. **Leveraging Strengths**: Combine advantages of different models for optimal overall results

### 📊 Comparison with Official Implementation

| Feature | Kode | Official Claude |
|---------|------|-----------------|
| Number of Supported Models | Unlimited, configurable for any model | Only supports single Claude model |
| Model Switching | ✅ Tab key quick switch | ❌ Requires session restart |
| Parallel Processing | ✅ Multiple SubAgents work in parallel | ❌ Single-threaded processing |
| Cost Tracking | ✅ Separate statistics for multiple models | ❌ Single model cost |
| Task Model Configuration | ✅ Different default models for different purposes | ❌ Same model for all tasks |
| Expert Consultation | ✅ AskExpertModel tool | ❌ Not supported |

This multi-model collaboration capability makes Kode a true **AI Development Workbench**, not just a single AI assistant.

## Development

Kode is built with modern tools and requires [Bun](https://bun.sh) for development.

### Install Bun

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows
powershell -c "irm bun.sh/install.ps1 | iex"
```

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/shareAI-lab/kode.git
cd kode

# Install dependencies
bun install

# Run in development mode
bun run dev

# Alternative Node-based dev (no Bun required)
npm run dev:node
```

### Build

```bash
bun run build
```

### Testing

```bash
# Run tests
bun test

# Test the CLI
./cli.js --help
```

### Safe Mode and Permissions

Kode defaults to a permissive "YOLO" mode to maximize productivity. For sensitive work, enable safe mode to require approvals for tool actions:

```bash
kode --safe
```

#### Permission Modes

You can select different permission modes to control tool access:

```bash
# Read-only planning mode (blocks all write operations)
kode --mode plan

# Auto-approve file edits while prompting for shell/network tools  
kode --mode acceptEdits

# Fully bypass all permission checks (default YOLO mode)
kode --mode bypassPermissions

# Standard safe mode with manual approval for all tools
kode --safe
```

#### Mode Switching During Session

You can change permission modes without restarting:

```bash
# In REPL, use the /mode command
/mode plan          # Switch to read-only mode
/mode acceptEdits   # Allow edits, prompt for other tools
/mode safe          # Enable full safe mode
/mode yolo          # Return to permissive mode
```

#### Default Security Policy

Configure your preferred default mode via environment variable:

```bash
export KODE_DEFAULT_SAFE=true    # Start in safe mode by default
export KODE_DEFAULT_MODE=plan    # Start in planning mode by default
```

Notes:
- `--mode` controls high-level behavior; combine with `--safe` to enforce confirmations for non-edit tools.
- Permission settings are displayed in the REPL status line for visibility.
- When unset, mode defaults to `bypassPermissions` (YOLO).

### Proxy and Platform Notes

- Proxy: Set standard environment variables such as `HTTP_PROXY`, `HTTPS_PROXY`, or `ALL_PROXY` before launching Kode to proxy API and HTTP traffic.
- Windows: Prefer Git Bash or WSL for the best experience; VS Code integrated terminal is recommended. Ensure your global npm prefix has no spaces to avoid shim issues.

### Wrapper Debugging

If you run into path issues (global installs, symlinks), enable wrapper debug output:

```bash
KODE_WRAPPER_DEBUG=1 kode --version
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

Apache 2.0 License - see [LICENSE](LICENSE) for details.

## Thanks

- Some code from @dnakov's anonkode
- Some UI learned from gemini-cli  
- Some system design learned from claude code

## Support

- 📚 [Documentation](docs/)
- 🐛 [Report Issues](https://github.com/shareAI-lab/kode/issues)
- 💬 [Discussions](https://github.com/shareAI-lab/kode/discussions)
