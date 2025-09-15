# Kode Upgrade Plan — Borrowing from Claude Code Reverse

This plan outlines concrete, high‑value improvements for Kode informed by the reverse‑engineered Claude Code repo. Each milestone lists tasks, files to touch, acceptance criteria, and risks.

## Scope and Principles

- Keep Kode’s strengths: dynamic agents, rich Tool contract and suite, multi‑model management, Bun‑first dev with Node wrapper distribution, privacy‑first telemetry.
- Borrow selectively: MCP transports + CLI features, granular permission modes, hook system, optional SDK embedding, a plan review tool, config import, and an optional status line.
- Avoid introducing placeholders or regressions in reliability or security.

## Milestones

### M1 — MCP Transport Parity and CLI Enhancements

Add HTTP and WS MCP clients and extend CLI commands with scope utilities.

- Tasks
  - Add MCP HTTP and WS clients alongside existing stdio/SSE.
    - Files: `src/services/mcpClient.ts` (extend client factory and listMCPServers), `src/tools/MCPTool/*` if needed.
  - Extend CLI commands for MCP management:
    - list/get with scope (project/global/local), remove with scope.
    - import from Claude Desktop configs.
    - health checks across all servers; print transport/type and status.
    - enable‑all‑project and approve/reject project‑scoped servers if applicable to Kode’s `.mcprc`/project model.
    - Files: `src/commands/mcp.tsx` (new), `src/commands.ts`, `src/entrypoints/cli.tsx` (register commands).
- Acceptance Criteria
  - `kode mcp list|get|remove` supports scopes; `kode mcp add-json` works; importing from Claude Desktop works when available; health checks render status for stdio/http/sse/ws.
  - MCP tools can call through HTTP/WS where configured.
- Risks/Mitigations
  - Transport errors and timeouts: add conservative timeouts and clear error messages; hide sensitive data in logs.

### M2 — Granular Permission Modes

Introduce modes beyond safe/YOLO to match nuanced workflows.

- Modes
  - `acceptEdits`: auto‑approve file edits; prompt for shell/network.
  - `plan`: allow planning tools (e.g., Architect/Think/PlanReview) but block side‑effect tools.
- Tasks
  - Extend permission logic: `src/permissions.ts` and related utilities to evaluate mode per tool category.
  - Add CLI flags and REPL UI indicators to switch modes at runtime.
    - Files: `src/entrypoints/cli.tsx`, `src/screens/REPL.tsx`.
  - Persist default mode in config; add `/mode` command.
    - Files: `src/utils/config.ts`, `src/commands/mode.tsx` (new), `src/commands.ts`.
- Acceptance Criteria
  - From REPL and CLI, users can view and switch modes; tool permission prompts match selected mode semantics.
  - Safe/YOLO behavior unchanged when those modes are selected.
- Risks/Mitigations
  - Confusion from too many modes: keep concise help and visible indicators.

### M3 — Hook System (Pre/Post Tool and Session Lifecycle)

Allow opt‑in command hooks on key events for extensibility.

- Tasks
  - Implement `HookSystem` similar to reverse’s `hookSystem.ts` with:
    - Hook types: PreToolUse, PostToolUse, SessionStart/End, Notification.
    - Matcher rules (by tool name substring and/or JSON include check).
    - Command execution with timeout, env injection.
    - Validation of hook configuration.
    - Files: `src/services/hooks/HookSystem.ts` (new), `src/utils/config.ts` (hook config schema/parse), `src/screens/REPL.tsx` (invoke Session hooks), tools integration (invoke Pre/Post).
  - Add config keys and docs; disabled by default; honor safe mode restrictions.
- Acceptance Criteria
  - Hooks execute on configured events; failures/timeouts are surfaced without crashing; disabling hooks is immediate.
- Risks/Mitigations
  - Security: hooks only run when explicitly enabled; inherit permission mode constraints; redact env if needed.

### M4 — Optional SDK Embedding Layer

Expose a minimal SDK wrapper for external Node apps (optional).

- Tasks
  - Export `@shareai-lab/kode/sdk` with `query({ prompt, options })` that yields normalized messages and supports `.interrupt()` and `.setPermissionMode()`.
    - Files: `src/sdk/index.ts` (new), `src/sdk/Query.ts` (new) – can be a thin adapter over Kode internals.
  - Consider (optional) a stream‑JSON CLI mode to match reverse/original SDK expectations.
    - Files: `src/entrypoints/cli.tsx` (conditionally accept `--output-format stream-json`).
- Acceptance Criteria
  - Example external script can consume SDK and drive Kode sessions without shelling into the REPL.
- Risks/Mitigations
  - Scope creep: keep SDK surface minimal and documented as experimental.

### M5 — Plan Review Tool

Add a planning evaluator tool to score/annotate plans before execution.

- Tasks
  - Create `PlanReviewTool` that analyzes a plan string and outputs assessment (structure/completeness/clarity) and suggested next steps (inspired by `ExitPlanMode.ts`).
    - Files: `src/tools/PlanReviewTool/PlanReviewTool.tsx` (new), `src/tools/PlanReviewTool/prompt.ts` (new), `src/tools.ts` (register), docs.
  - Integrate with TaskTool: allow pre‑execution plan vetting in `safe`/`plan` modes.
- Acceptance Criteria
  - `/plan-review` style command (or tool use) returns structured feedback; TaskTool can optionally run it before heavy actions.

### M6 — Config Import Compatibility

Provide an importer to read Claude Code config locations and merge into Kode format.

- Tasks
  - Implement CLI command: `kode config import --from claude` that reads:
    - User settings: `~/Library/Application Support/Claude Code/settings.json` (macOS) or `~/.config/claude-code/settings.json` (Linux/Windows).
    - Project: `./.mcp.json` (merge MCP servers).
    - Local: `./.claude/local-settings.json`.
    - Files: `src/commands/config-import.tsx` (new), `src/commands.ts`.
  - Merge rules: preview diff; require user confirmation before writing to `~/.kode.json` or project `.kode.json`.
- Acceptance Criteria
  - Import prints summary and writes only upon confirmation; invalid files are skipped with clear messages.

### M7 — Optional Status Line

Add an optional status line at the bottom of the REPL for long operations.

- Tasks
  - Provide a pluggable status line source (built‑in stats or external command via hook/config).
    - Files: `src/components/StatusLine.tsx` (new), `src/screens/REPL.tsx` (render area), `src/utils/config.ts` (toggle/command).
- Acceptance Criteria
  - When enabled, status line updates periodically without disrupting REPL; off by default.

### M8 — Docs and Tests

- Tasks
  - README: add MCP scope features, permission modes, hook system, SDK embed sample, plan review tool, and config import docs.
    - Files: `README.md`.
  - Add unit tests where feasible (hook validation, plan review analyzer) and E2E manual steps for MCP CLI.
- Acceptance Criteria
  - `bun run typecheck`, `bun test`, and lint pass; docs enable a new engineer to use new features.

## Sequencing

Recommended order:

1) M1 MCP transports + CLI
2) M2 Permission modes
3) M3 Hook system
4) M5 Plan Review tool
5) M6 Config import
6) M7 Status line
7) M4 SDK embed (optional; can be parallel if isolated)
8) M8 Docs/tests

## Risks and Rollback

- Transports and hooks may introduce platform differences. Keep feature flags and robust error messages; allow users to disable new features.
- SDK embed and stream‑JSON mode are optional; can ship behind `KODE_EXPERIMENTAL_SDK=1`.
- Plan review should be advisory; never block unless user sets `plan` mode.

## Definition of Done

- New MCP transports and CLI are usable; permission modes visible and effective; hooks run safely when enabled; optional SDK works; plan review available; config import works with preview; status line toggles cleanly; docs updated; tests and typechecks green.

