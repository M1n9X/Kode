# Kode vs Claude Code Reverse (CodeBreeze) — Detailed Comparison

This document compares Kode with the reverse‑engineered Claude Code repo ("CodeBreeze"). It focuses on architecture, SDK/runtime protocols, MCP, permissions, hooks, tools, config, build, and UI. It summarizes what’s newer or unique in the reverse repo and how it maps to Kode.

- Kode repo: `/Users/mxue/GitRepos/Coding/Kode`
- Reverse repo: `/Users/mxue/GitRepos/Coding/claude-code/claude_code_reverse`

## Executive Summary

- The reverse repo reconstructs Claude Code’s SDK and CLI runtime with a process transport, stream‑JSON control messages (initialize/interrupt/set_permission_mode), SDK MCP server support, multi‑transport MCP clients, and a hook system. It is feature‑rich in protocol/SDK shape but some pieces are placeholders.
- Kode is a productionized CLI with mature multi‑model management, dynamic agents (AGENTS.md/CLAUDE.md compatible), a broad and typed tool system, and a robust distribution wrapper.
- For Kode’s roadmap: selectively borrow protocol ergonomics (SDK embed wrapper, MCP transport/CLI features, permission modes, hooks, plan review), without regressing reliability or privacy.

## Entrypoints and REPL

- Kode
  - CLI entry: `src/entrypoints/cli.tsx`
  - Wrapper distribution: `cli.js` (Bun‑first dev, Node runtime fallback, Yoga WASM path handling)
  - REPL: `src/screens/REPL.tsx` (permissions UI, binary feedback, cost dialogs, log forking, update banner)
- Reverse
  - CLI entry: `src/entrypoints/cli.tsx` (minimal, renders a simplified REPL)
  - Wrapper: `bin/codebreeze.js` (loads compiled `dist` modules and dispatches rich CLI commands)
  - REPL: `src/screens/REPL.tsx` (simplified; streams results from SDK `query` via `ui/sessionRunner.ts`)

## SDK and Process Transport

- Reverse SDK
  - `src/sdk/index.ts`: exposes `query({ prompt, options })` as an async generator with `.interrupt()`, `.setPermissionMode()`, and `.streamInput()` for streaming input.
  - `src/core/Query.ts`: bidirectional control channel (control_request/response), hook callbacks, in‑process SDK MCP message routing.
  - `src/transport/ProcessTransport.ts`: spawns CLI, supports `--output-format stream-json` vs print mode, heartbeat/reconnect, raw JSON line IO.
- Kode
  - Kode does not expose a public SDK wrapper for embedding external apps; its REPL and query flow are internal. No stream‑JSON CLI runtime mode today.

Implication: Kode could export a minimal SDK wrapper (optional) for embedding use cases. A stream‑JSON mode is only needed if you want protocol‑level compatibility with reverse/original SDKs.

## CLI Runtime (stream‑JSON)

- Reverse
  - `src/cli/runtime.ts`: implements stream‑JSON loop with control_request subtypes: `initialize`, `interrupt`, `set_permission_mode`, `hook_callback`, `mcp_message`, `supportedCommands`, plus state for MCP client forwarding.
- Kode
  - No equivalent public stream‑JSON runtime; Kode manages permissions and MCP inside its own REPL runtime.

Implication: Only add this if SDK interoperability is a goal. Otherwise Kode’s current architecture suffices.

## MCP (Model Context Protocol)

- Reverse
  - Clients: stdio, HTTP, SSE, WS‑IDE clients in `src/services/mcp/client/*`.
  - CLI: `src/cli/commands/mcp.ts` includes:
    - list/get with scope (local/project/user)
    - add‑json, add from Claude Desktop configs
    - reset project choices, approve/reject project‑scoped servers, enable‑all‑project
  - Config store with scopes: `src/common/config.ts` (user settings.json, project `.mcp.json`, local `.claude/local-settings.json`).
- Kode
  - Client: `src/services/mcpClient.ts` with stdio/SSE via `@modelcontextprotocol/sdk`, plus `.mcprc` handling and approvals.
  - CLI coverage is simpler; no HTTP/WS clients and fewer scope utilities out of the box.

Implication: Kode can adopt HTTP/WS transports and extend CLI commands with scope‑aware list/get/remove, import‑from‑Claude‑Desktop, and health checks.

## Permissions and Modes

- Reverse
  - SDK permission modes: `'default' | 'acceptEdits' | 'bypassPermissions' | 'plan'` (`src/sdk/permissions.ts`).
  - CLI runtime handles `'default' | 'bypassPermissions'` and applies settings from user/project/local config.
- Kode
  - Effective modes: safe (prompt for permissions) vs YOLO (skip permissions), with robust command prefix checks and per‑tool allowlist.

Implication: Introduce granular modes in Kode (e.g., acceptEdits, plan) to match nuanced workflows while keeping the existing strong permission enforcement.

## Hook System

- Reverse
  - `src/services/hooks/hookSystem.ts`: hook types (PreToolUse, PostToolUse, SessionStart/End, etc.), matchers, command execution with timeouts, env injection; validations.
- Kode
  - No generic external hook execution system; logging and UI exist internally.

Implication: Add an optional hook mechanism to run external commands around tool use and sessions. It must be opt‑in, transparent, and permission‑aware.

## Tools

- Reverse tool set (examples):
  - `Agent.ts` (strategy stub), `Bash.ts`, `FileRead.ts`, `FileWrite.ts`, `FileEdit.ts`, `FileMultiEdit.ts`, `Grep.ts`, `Glob.ts`, `NotebookEdit.ts`, `TodoWrite.ts`, `WebFetch.ts`, `WebSearch.ts`, `ExitPlanMode.ts` (plan analyzer).
- Kode tool set:
  - Richer and typed tools with streaming UI hooks. Unique tools include `TaskTool` (orchestration via dynamic agents), `AskExpertModelTool`, `MultiEditTool`, `TodoWriteTool`, `WebSearchTool`, `URLFetcherTool`, `Memory*`, `ArchitectTool`, `MCPTool`, `ThinkTool`, etc.

Implication: Keep Kode’s tool architecture; optionally add a “Plan Review” tool similar to `ExitPlanMode` to vet multi‑step plans before execution.

## Agent System

- Reverse
  - Has an `Agent` tool stub; no dynamic config loader.
- Kode
  - Dynamic agents via markdown configs with YAML frontmatter and 5‑tier priority (built‑in, user/project `.claude/agents` and `.kode/agents`).

Implication: Kode’s agent system is superior; retain it.

## Config System

- Reverse
  - Scopes: user (OS‑specific settings.json), project (`.mcp.json`), local (`.claude/local-settings.json`).
- Kode
  - Global `~/.kode.json`, project `./.kode.json`, `.mcprc`, agent dirs via `.claude/agents` and `.kode/agents`.

Implication: Optionally provide an import command to pull known Claude Code config locations into Kode’s config format.

## UI Add‑ons

- Reverse
  - Multiple console UI variants and references to a status line concept in UI and docs.
- Kode
  - Robust Ink UI with indicators and logging; no generic status line plugin.

Implication: Add an optional status line (built‑in or command‑driven) for long operations.

## Build and Distribution

- Reverse
  - `bin/codebreeze.js` drives compiled `dist/` modules; relies on `npm run build` first.
- Kode
  - Bun‑first development and Node wrapper distribution (`cli.js`), with Yoga WASM handling and Windows guidance.

Implication: Keep Kode’s distribution; if needed, port symlink/realpath hardening ideas.

## Keep / Borrow / Avoid — Summary

- Keep (Kode strengths)
  - Dynamic agent system, rich Tool contract and suite, multi‑model manager and adapters, robust CLI/REPL, current distribution model, privacy‑first telemetry stance.
- Borrow (from Reverse)
  - MCP: HTTP/WS transports, scope‑aware CLI commands, import from Claude Desktop, health checks.
  - Permissions: granular modes (`acceptEdits`, `plan`).
  - Hooks: pre/post tool and session lifecycle command hooks.
  - SDK: optional embedding wrapper for external Node apps; stream‑JSON mode only if needed.
  - Tools: add “Plan Review” akin to `ExitPlanMode`.
  - Config: optional importer for Claude Code config paths.
  - UI: status line plugin.
- Avoid
  - Replacing Kode’s agent/task orchestration with reverse stubs; any placeholder logic that reduces Kode’s reliability.

## Notable Files (for reference)

- Reverse
  - CLI entry: `src/entrypoints/cli.tsx`
  - SDK: `src/sdk/index.ts`, `src/core/Query.ts`, `src/transport/ProcessTransport.ts`
  - CLI runtime: `src/cli/runtime.ts`
  - MCP CLI: `src/cli/commands/mcp.ts`
  - MCP SDK server: `src/services/mcp/createSdkMcpServer.ts`
  - Hooks: `src/services/hooks/hookSystem.ts`
  - Tools: `src/tools/*`
  - Config store: `src/common/config.ts`, `src/types/mcp.ts`
  - Wrapper: `bin/codebreeze.js`
- Kode
  - CLI entry: `src/entrypoints/cli.tsx`
  - Wrapper: `cli.js`
  - REPL: `src/screens/REPL.tsx`
  - Tools and Tool contract: `src/tools.ts`, `src/Tool.ts`, `src/tools/*`
  - Agents: `src/utils/agentLoader.ts`
  - Models: `src/utils/model.ts`, `src/services/openai.ts`, `src/services/modelAdapterFactory.ts`, `src/services/claude.ts`
  - MCP: `src/services/mcpClient.ts`
  - Permissions: `src/permissions.ts`
  - Config: `src/utils/config.ts`

