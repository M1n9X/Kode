# 安装、配置与使用指南

## 环境准备 (Prerequisites)

在开始安装 Kode 之前，请确保您的系统满足以下先决条件：

### 系统要求
- **操作系统**: macOS 10.15+, Linux (Ubuntu 18.04+), Windows 10+ (WSL2 推荐)
- **Node.js**: 版本 18.0.0 或更高版本
- **内存**: 至少 4GB RAM (推荐 8GB+)
- **磁盘空间**: 至少 500MB 可用空间

### 必需的工具和依赖

#### 1. Node.js 和包管理器
```bash
# 检查 Node.js 版本
node --version  # 应该 >= 18.0.0

# 检查 npm 版本
npm --version   # 应该 >= 9.0.0
```

如果版本不符合要求，请访问 [Node.js 官网](https://nodejs.org/) 下载最新版本。

#### 2. Bun (推荐用于开发)
```bash
# macOS/Linux 安装 Bun
curl -fsSL https://bun.sh/install | bash

# Windows 安装 Bun
powershell -c "irm bun.sh/install.ps1 | iex"

# 验证安装
bun --version
```

#### 3. 系统工具依赖
- **ripgrep**: 高性能文本搜索工具
- **git**: 版本控制系统
- **tsx**: TypeScript 执行器 (如果不使用 Bun)

```bash
# macOS 安装
brew install ripgrep git

# Ubuntu/Debian 安装  
sudo apt update
sudo apt install ripgrep git

# Windows 安装 (使用 Chocolatey)
choco install ripgrep git
```

## 安装步骤 (Installation Steps)

### 方式一：NPM 全局安装 (推荐)

这是最简单的安装方式，适合大多数用户：

```bash
# 全局安装 Kode
npm install -g @shareai-lab/kode

# 验证安装
kode --version
```

安装完成后，您可以使用以下命令启动 Kode：
```bash
kode      # 主命令
kwa       # 简短别名 (Kode With Agent)  
kd        # 超短别名
```

### 方式二：从源码构建

如果您需要最新的开发版本或想要自定义构建：

```bash
# 克隆仓库
git clone https://github.com/shareAI-lab/kode.git
cd kode

# 安装依赖 (推荐使用 Bun)
bun install
# 或使用 npm
npm install

# 构建项目
bun run build
# 或使用 npm
npm run build

# 全局链接 (开发模式)
npm link

# 验证安装
kode --version
```

### 方式三：Docker 容器运行

适合容器化环境或想要隔离运行的用户：

```bash
# 拉取镜像 (暂时需要从源码构建)
git clone https://github.com/shareAI-lab/kode.git
cd kode

# 构建 Docker 镜像
docker build --no-cache -t kode .

# 运行容器
docker run -it --rm \
  -v $(pwd):/workspace \
  -v ~/.kode:/root/.kode \
  -v ~/.kode.json:/root/.kode.json \
  -w /workspace \
  kode
```

## 项目启动 (Running the Project)

### 本地开发环境

#### 交互式模式 (推荐)
```bash
# 启动交互式终端界面
kode

# 启用详细输出模式
kode --verbose

# 启用安全模式 (严格权限检查)
kode --safe

# 指定工作目录
kode --cwd /path/to/your/project
```

#### 非交互式模式
```bash
# 执行单个命令并退出
kode -p "读取并分析 package.json 文件"

# 从标准输入读取内容
cat README.md | kode -p "总结这个文档的内容"

# 处理特定文件
kode -p "解释这个函数的作用" src/main.ts
```

### 开发模式启动

如果您正在开发 Kode 本身：

```bash
# 使用 Bun 开发模式 (热重载)
bun run dev

# 启用详细调试信息
bun run dev --verbose --debug

# 运行测试
bun test

# 代码格式化
bun run format

# 类型检查
bun run typecheck
```

## 关键配置项说明 (Key Configurations)

### 全局配置文件 (~/.kode.json)

全局配置文件位于用户主目录下，包含用户级别的设置：

```json
{
  "theme": "dark",
  "hasCompletedOnboarding": true,
  "lastOnboardingVersion": "1.0.80",
  "autoUpdaterStatus": "enabled",
  "modelProfiles": {
    "claude-sonnet-4": {
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "apiKey": "sk-ant-***"
    },
    "gpt-4o": {
      "provider": "openai", 
      "model": "gpt-4o",
      "apiKey": "sk-***"
    }
  },
  "modelPointers": {
    "main": "claude-sonnet-4",
    "task": "claude-sonnet-4",
    "reasoning": "gpt-4o",
    "quick": "gpt-4o-mini"
  }
}
```

**关键配置说明**：
- `theme`: UI 主题 (`"dark"` 或 `"light"`)
- `modelProfiles`: AI 模型配置，包含 API 密钥
- `modelPointers`: 不同用途的默认模型选择

### 项目配置文件 (./.kode.json)

项目级配置文件，优先级高于全局配置：

```json
{
  "enableArchitectTool": true,
  "trustedProject": true,
  "mcpServers": {
    "filesystem": {
      "type": "stdio",
      "command": "mcp-server-filesystem",
      "args": ["/path/to/project"]
    }
  },
  "customCommands": {
    "analyze": "分析当前项目的代码结构和质量"
  }
}
```

### 环境变量配置

重要的环境变量：

```bash
# AI 模型 API 密钥
export ANTHROPIC_API_KEY="sk-ant-***"
export OPENAI_API_KEY="sk-***"

# Kode 行为配置
export KODE_SAFE_MODE=true          # 强制安全模式
export KODE_DEBUG=true              # 启用调试模式
export KODE_CACHE_DIR="~/.kode/cache" # 缓存目录

# 代理设置 (如果需要)
export HTTP_PROXY="http://proxy:8080"
export HTTPS_PROXY="http://proxy:8080"
```

## ⚠️ 注意事项 (Important Notes)

### 常见安装问题和解决方案

#### 1. 权限问题
```bash
# 如果遇到全局安装权限错误
sudo npm install -g @shareai-lab/kode

# 或者配置 npm 全局目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

#### 2. Node.js 版本问题
```bash
# 使用 nvm 管理 Node.js 版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### 3. Windows 特定问题
- **推荐使用 WSL2**: Kode 在 WSL2 环境下表现最佳
- **Git Bash 支持**: 如果无法使用 WSL2，可以在 Git Bash 中运行
- **权限执行**: 某些功能需要管理员权限

#### 4. 网络连接问题
```bash
# 如果在中国大陆，可能需要配置镜像源
npm config set registry https://registry.npmmirror.com/

# 或使用 Bun 的中国镜像
export BUN_INSTALL_BIN_URL="https://github.com/oven-sh/bun/releases/download/bun-v1.0.0/bun-linux-x64.zip"
```

### 安全建议

#### API 密钥管理
- **不要将 API 密钥提交到版本控制系统**
- 使用环境变量或安全的密钥管理系统
- 定期轮换 API 密钥
- 为不同环境使用不同的密钥

#### 安全模式使用
```bash
# 在处理重要项目时，建议使用安全模式
kode --safe

# 对于可信项目，可以使用默认模式
kode  # YOLO 模式，跳过大部分权限检查
```

### 性能优化建议

#### 1. 内存使用优化
```json
// 在配置文件中限制内存使用
{
  "performance": {
    "maxMemoryMB": 512,
    "enableAutoCleanup": true,
    "cleanupInterval": 300000
  }
}
```

#### 2. 缓存配置
```bash
# 清理缓存 (如果遇到奇怪问题)
rm -rf ~/.kode/cache/*

# 禁用缓存 (调试时)
export KODE_DISABLE_CACHE=true
```

#### 3. 并发设置
```json
{
  "tools": {
    "maxConcurrency": 3,  // 最大并行工具执行数
    "timeout": 30000      // 工具执行超时时间 (毫秒)
  }
}
```

### 故障排除命令

```bash
# 检查系统健康状态
kode doctor

# 查看详细日志
kode --debug --verbose

# 重置配置到默认状态
kode config reset

# 查看所有配置
kode config list --global
```

---

完成以上步骤后，您就可以开始使用 Kode 了！建议先查看 [快速开始教程](Quick-Start.md) 来熟悉基本功能。