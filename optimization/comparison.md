# Kode vs anon-kode — Detailed Comparison

This document records a thorough, engineer-oriented comparison of the two repositories as they exist locally:

- Repo A (Kode): `/Users/mxue/GitRepos/Coding/Kode`
- Repo B (anon-kode): `/Users/mxue/GitRepos/Coding/anon-kode`

It focuses on functional differences, architectural choices, build/distribution strategies, tool and agent systems, model management, MCP, permissions, telemetry, and OS compatibility. The goal is to enable any engineer to quickly understand gaps and confidently plan integration or migration.

## Executive Summary

- Kode is a more complete, production-leaning CLI with a mature multi-model system, dynamic agent loading (AGENTS.md/CLAUDE.md compatible), richer Tool contract, broader toolset, robust MCP integration, and a reliable distribution wrapper.
- anon-kode is a leaner fork with minimal Tool interface, a single AgentTool, Statsig-based gating/telemetry, and a simpler build that runs TS directly via `tsx`.
- For a unified strong project: keep Kode’s architecture and features; optionally borrow minor wrapper ergonomics from anon-kode; avoid importing Statsig/remote gating.

## Project Metadata and Build

- Package metadata
  - Kode: name `@shareai-lab/kode`, multi-bin (`kode`, `kwa`, `kd`), full scripts including `test`, `typecheck`, `lint`.
    - `package.json`
  - anon-kode: name `anon-kode`, single bin `kode`, minimal scripts (no tests/typecheck/lint).
    - `/Users/mxue/GitRepos/Coding/anon-kode/package.json`
- Build/distribution
  - Kode: Bun-first dev (`bun run dev`, `bun test`), Node-compatible distribution via `cli.js` wrapper. Handles `YOGA_WASM_PATH` and Bun/Node subtleties.
    - `cli.js`
    - `src/entrypoints/cli.tsx`
  - anon-kode: builds `cli.mjs` via `bun build`; global bin `bin/kode` runs TypeScript via `tsx` at runtime.
    - `/Users/mxue/GitRepos/Coding/anon-kode/cli.mjs`
    - `/Users/mxue/GitRepos/Coding/anon-kode/bin/kode`

## CLI Entrypoint and Wrapper

- Kode
  - Early Sentry init (optional), robust `YOGA_WASM_PATH` resolution, Windows/Bun shim awareness, MCP subcommands, permission modes (YOLO/safe), update banner handoff.
  - `src/entrypoints/cli.tsx`
  - `cli.js`
- anon-kode
  - Uses `tsx` in `bin/kode` to run TS source; includes Statsig gates and external updater hooks.
  - `/Users/mxue/GitRepos/Coding/anon-kode/src/entrypoints/cli.tsx`
  - `/Users/mxue/GitRepos/Coding/anon-kode/bin/kode`

## REPL (Ink UI)

- Kode
  - Full-featured: permission dialogs, binary feedback, cost dialogs, log forking, update banner injection from CLI, verbose controls.
  - `src/screens/REPL.tsx`
- anon-kode
  - Similar structure; wired to Statsig and external updater state; fewer productized toggles.
  - `/Users/mxue/GitRepos/Coding/anon-kode/src/screens/REPL.tsx`

## Agent System

- Kode
  - Dynamic agent configuration loader with priority overrides (built-in < user `~/.claude/agents` < user `~/.kode/agents` < project `./.claude/agents` < project `./.kode/agents`).
  - Agents defined as Markdown with YAML frontmatter, AGENTS.md/CLAUDE.md compatible. Subagent selection, tool filters, optional per-agent model.
  - `src/utils/agentLoader.ts`
- anon-kode
  - No dynamic agent loader; relies on a single `AgentTool` to kick off tasks.
  - `/Users/mxue/GitRepos/Coding/anon-kode/src/tools/AgentTool/AgentTool.tsx`

## Tools and Tool Contract

- Kode
  - Rich Tool interface with streaming progress, validation, read-only flags, concurrency flags, UI rendering hooks.
  - Tool registry contains broader capabilities: Task orchestration, AskExpertModel, MultiEdit, WebSearch, URLFetcher, Todo, Memory tools, etc.
  - `src/Tool.ts`
  - `src/tools.ts`
  - Present tool dirs: `src/tools/TaskTool/`, `src/tools/AskExpertModelTool/`, `src/tools/MultiEditTool/`, `src/tools/WebSearchTool/`, `src/tools/URLFetcherTool/`, `src/tools/TodoWriteTool/`, etc.
- anon-kode
  - Minimal `Tool` type (name/description/schema/prompt only). Smaller tool set. Primary orchestrator is `AgentTool`.
  - `/Users/mxue/GitRepos/Coding/anon-kode/src/Tool.ts`
  - `/Users/mxue/GitRepos/Coding/anon-kode/src/tools.ts`

### Tooling Differences at a Glance

- Tools present only in Kode (not found in anon-kode):
  - `AskExpertModelTool`, `MultiEditTool`, `TodoWriteTool`, `WebSearchTool`, `URLFetcherTool`, and `TaskTool` (distinct from anon-kode’s `AgentTool`).
- Tools present in both:
  - `BashTool`, `FileReadTool`, `FileEditTool`, `FileWriteTool`, `GlobTool`, `GrepTool`, `NotebookReadTool`, `NotebookEditTool`, `MemoryReadTool`, `MemoryWriteTool`, `ThinkTool`, `ArchitectTool`, `MCPTool`, `lsTool`, and `StickerRequestTool`.

## Model Management

- Kode
  - Central `ModelManager` with Model Profiles, pointers (main/task/etc.), active profile selection, context-aware switching, GPT‑5 adaptations, and ModelAdapterFactory.
  - Robust OpenAI-compatible layer with error pattern handling (e.g. `max_completion_tokens`, stream options, citation stripping), retry with jitter, abortable delays.
  - `src/utils/model.ts`
  - `src/services/openai.ts`
  - `src/services/modelAdapterFactory.ts`
- anon-kode
  - Simplified model utilities; defaults often point to `deepseek-chat` and pull configs via Statsig; lacks profile/pointer system and advanced error adaptation.
  - `/Users/mxue/GitRepos/Coding/anon-kode/src/utils/model.ts`

## Claude/OpenAI Services

- Kode
  - Claude service integrates with message context management, cost tracking, debug logging, model manager, and GPT‑5 routing where needed.
  - `src/services/claude.ts`
  - `src/services/openai.ts`
- anon-kode
  - Functional services with Statsig logging hooks; simpler error handling; includes `@sentry/node` dependency by default.
  - `/Users/mxue/GitRepos/Coding/anon-kode/src/services/claude.ts`
  - `/Users/mxue/GitRepos/Coding/anon-kode/src/services/openai.ts`

## MCP (Model Context Protocol)

- Both repositories implement robust MCP clients with stdio/SSE support, add/remove/list server config, and `.mcprc` integration.
  - Kode: `src/services/mcpClient.ts`
  - anon-kode: `/Users/mxue/GitRepos/Coding/anon-kode/src/services/mcpClient.ts`

## Permissions System

- Both repos:
  - Safe command allowlist, split-command prefix detection, command injection guard, per-tool allow approvals, and a mode to skip permissions (YOLO).
  - Kode: `src/permissions.ts`
  - anon-kode: `/Users/mxue/GitRepos/Coding/anon-kode/src/permissions.ts`

## Telemetry and Updates

- Kode
  - Statsig removed; update banner shown via CLI; Sentry initialization happens early but can be optional/configurable.
  - `src/entrypoints/cli.tsx`
- anon-kode
  - Statsig gates/dynamic configs in multiple services; external updater hook in CLI; `@sentry/node` dependency.
  - `/Users/mxue/GitRepos/Coding/anon-kode/src/services/statsig.ts`
  - `/Users/mxue/GitRepos/Coding/anon-kode/src/entrypoints/cli.tsx`

## OS and Distribution Notes

- Kode: Bun-first development, Node-compatible distribution via `cli.js`, Yoga WASM path resolution, Windows support notes in `README.md`.
- anon-kode: `bin/kode` resolves symlinks and then executes TS via `tsx`, which can be ergonomic in dev but adds a runtime loader dependency in production installs.

## Relationship and Lineage

- Both repos share visible ancestry from the Claude Code architecture. Kode can be seen as a systematized, product-focused evolution: more complete multi-model support, dynamic agent system, richer Tool contract, broader tools, and a steadier distribution model.

## Keep / Borrow / Drop Recommendations

- Keep (from Kode)
  - Dynamic agent loader and AGENTS.md compatibility: `src/utils/agentLoader.ts`
  - Broad tool suite and Tool contract: `src/Tool.ts`, `src/tools.ts`
  - ModelManager, adapters, GPT‑5 compatibility: `src/utils/model.ts`, `src/services/openai.ts`, `src/services/modelAdapterFactory.ts`
  - MCP client: `src/services/mcpClient.ts`
  - Distribution wrapper and Yoga WASM handling: `cli.js`, `src/entrypoints/cli.tsx`
- Borrow (from anon-kode)
  - Wrapper path robustness from `bin/kode` (symlink resolution patterns) for potential hardening of `cli.js`.
  - Documentation snippet for MCP server setup (`which kode` + Claude Desktop `mcpServers` example).
- Drop (do not adopt from anon-kode)
  - Statsig gates/telemetry and external updater pathway; prefer local, transparent configuration and a simple update banner.

## Appendix: Notable Files

- Kode
  - CLI entry: `src/entrypoints/cli.tsx`
  - Wrapper: `cli.js`
  - REPL: `src/screens/REPL.tsx`
  - Tools: `src/tools.ts`, `src/Tool.ts`, `src/tools/*`
  - Agents: `src/utils/agentLoader.ts`
  - Models: `src/utils/model.ts`, `src/services/openai.ts`, `src/services/modelAdapterFactory.ts`, `src/services/claude.ts`
  - MCP: `src/services/mcpClient.ts`
  - Permissions: `src/permissions.ts`
  - Docs: `README.md`, `AGENTS.md`
- anon-kode
  - CLI entry: `/Users/mxue/GitRepos/Coding/anon-kode/src/entrypoints/cli.tsx`
  - Wrapper: `/Users/mxue/GitRepos/Coding/anon-kode/bin/kode`, `/Users/mxue/GitRepos/Coding/anon-kode/cli.mjs`
  - REPL: `/Users/mxue/GitRepos/Coding/anon-kode/src/screens/REPL.tsx`
  - Tools: `/Users/mxue/GitRepos/Coding/anon-kode/src/tools.ts`, `/Users/mxue/GitRepos/Coding/anon-kode/src/Tool.ts`
  - Models: `/Users/mxue/GitRepos/Coding/anon-kode/src/utils/model.ts`, `/Users/mxue/GitRepos/Coding/anon-kode/src/services/openai.ts`, `/Users/mxue/GitRepos/Coding/anon-kode/src/services/claude.ts`
  - MCP: `/Users/mxue/GitRepos/Coding/anon-kode/src/services/mcpClient.ts`
  - Permissions: `/Users/mxue/GitRepos/Coding/anon-kode/src/permissions.ts`
  - Telemetry/Gates: `/Users/mxue/GitRepos/Coding/anon-kode/src/services/statsig.ts`

