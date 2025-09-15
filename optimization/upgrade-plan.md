# Kode Upgrade and Optimization Plan

This plan translates the comparison findings into concrete, actionable work for Kode. It aims to be self-contained so any engineer can follow it to implement all improvements.

## Goals

- Maintain Kode as the primary, feature-complete codebase with strong multi-model, dynamic agents, rich Tool contract, and robust MCP.
- Improve developer and user ergonomics (wrapper robustness, docs, proxy support, Windows UX).
- Keep security and privacy first: local-transparent configurations, optional Sentry, no Statsig.

## Non-Goals

- Do not integrate Statsig or external updater pathways.
- Do not replace the Node-wrapper distribution with runtime `tsx` transpilation (keep current `cli.js` strategy).

## Milestones and Tasks

### M1 — Wrapper Hardening and Dev Ergonomics

Overview: Make the distribution wrapper extra robust in global installs and symlink-heavy environments, and add a Node-only dev path for contributors without Bun.

- Tasks
  - Harden path resolution in `cli.js` using ideas from anon-kode’s `bin/kode` (symlink-aware “real path” resolution) while keeping current Yoga WASM and Bun/Node behavior intact.
    - Files: `cli.js`
  - Add a Node dev script that uses `tsx` without affecting the build/release path.
    - Files: `package.json` (add `dev:node`: `tsx ./src/entrypoints/cli.tsx --verbose`)
  - Verify Yoga WASM env var setup remains correct after path changes.
    - Files: `src/entrypoints/cli.tsx`
- Acceptance Criteria
  - Global installs work regardless of symlinks; `kode` resolves the correct package root and loads Yoga WASM.
  - `bun run dev` and `npm run dev:node` both launch the CLI in development.
  - No regressions on Windows/macOS/Linux.
- Risks/Mitigations
  - Path resolution edge cases: add debug logs behind an env flag, manual test on macOS + WSL + Windows Git Bash.

### M2 — Documentation Improvements (MCP and Modes)

Overview: Strengthen docs to be immediately useful for MCP server usage and permission modes.

- Tasks
  - Add “Use as MCP Server” section to `README.md` with `which kode` example and Claude Desktop `mcpServers` JSON snippet.
    - Files: `README.md`
  - Expand security section describing YOLO vs safe mode, suggested defaults, and quick toggles.
    - Files: `README.md`
  - Cross-reference AGENTS.md support and dynamic agent priority in docs.
    - Files: `README.md`, `AGENTS.md`
- Acceptance Criteria
  - A new contributor can configure Claude Desktop MCP from the README alone.
  - Users clearly understand permission modes and how to switch.

### M3 — Default Security Posture

Overview: Revisit defaults to favor safety for new users without removing YOLO productivity for power users.

- Tasks
  - Introduce an environment variable (e.g., `KODE_DEFAULT_SAFE=true`) to flip the default to safe mode, or make first-run onboarding explicitly prompt to choose default mode.
    - Files: `src/entrypoints/cli.tsx`, `src/utils/config.ts`
  - Ensure REPL visually reflects current mode and logs a one-line hint for switching.
    - Files: `src/screens/REPL.tsx`
- Acceptance Criteria
  - Fresh install runs in safe mode if env/choice dictates; clear toggle guidance appears.
  - No unexpected prompts for users who set YOLO.

### M4 — Tool Interface Consistency Pass

Overview: Ensure all tools correctly implement Kode’s rich Tool contract to minimize runtime edge cases.

- Tasks
  - Audit tools for `validateInput`, `isReadOnly`, `isConcurrencySafe`, and unified `renderToolUseMessage`/`renderToolResultMessage` consistency.
    - Files: `src/tools/*`, `src/Tool.ts`, `src/tools.ts`
  - Add missing basic validations (Zod enforcement + `validateInput` semantics) where inputs can mislead models.
  - Ensure read-only tools are filtered by `getReadOnlyTools()`.
- Acceptance Criteria
  - All tools compile with TypeScript strict mode and pass bun tests.
  - In REPL, progress rendering and tool result rendering are predictable for every tool.

### M5 — Model UX: Commands and Validation

Overview: Make model profile and pointer management easy and self-healing from the CLI.

- Tasks
  - Add `/model` command suite: `list`, `use <profile>`, `validate`, `repair`.
    - Files: `src/commands/model.tsx`, `src/commands.ts`, `src/utils/model.ts`, `src/services/openai.ts`
  - Implement “validation” pass that checks baseURL, apiKey presence, contextLength, and GPT‑5 flags; auto-repair common issues (rename `max_tokens` → `max_completion_tokens`, remove `stream_options`, strip `citations`).
    - Files: `src/services/openai.ts` (handlers exist; expose results to CLI)
  - Log validation status to model profile (e.g., `validationStatus`/`lastValidation`).
    - Files: `src/utils/config.ts`
- Acceptance Criteria
  - `kode /model list` shows profiles, pointers, and validation states.
  - `kode /model validate` surfaces actionable feedback and can auto-repair common API param issues.

### M6 — Proxy and Network Settings Consolidation

Overview: Ensure all outbound requests (OpenAI/Anthropic/custom fetch) share consistent proxy handling.

- Tasks
  - Centralize proxy agent creation using `undici.ProxyAgent`; ensure Claude/OpenAI/MCP paths use the same helper.
    - Files: `src/services/openai.ts`, `src/services/claude.ts`, `src/services/mcpClient.ts`, `src/utils/http.ts` (new helper)
  - Document proxy environment variables in README.
- Acceptance Criteria
  - One place configures proxy; all providers respect it.

### M7 — Windows and Shell UX Polishing

Overview: Validate Windows Git Bash/WSL flows and update guidance.

- Tasks
  - Test wrapper path resolution on Windows Git Bash/WSL; update tips in README if needed.
  - Provide fallback messages when shell assumptions don’t hold (e.g., suggest Git Bash in VS Code terminal).
- Acceptance Criteria
  - README contains practical, verified Windows notes; wrapper behavior confirmed.

### M8 — Code Cleanup and Small Fixes

- Tasks
  - Remove duplicate imports (e.g., duplicate `Onboarding` import) and any unused imports.
    - Files: `src/entrypoints/cli.tsx`
  - Ensure error messages and logging avoid leaking sensitive paths; guard with verbosity flags.
    - Files: `src/utils/debugLogger.ts`, cross-check throughout
- Acceptance Criteria
  - `typecheck`, `lint`, and `bun test` pass cleanly; no duplicate imports or obvious dead code remain.

## Sequencing and PR Strategy

Recommended order to minimize merge conflicts and maximize incremental value:

1) M1 Wrapper + dev script
2) M2 Docs (MCP + modes)
3) M8 Cleanup (quick win)
4) M3 Default security mode
5) M4 Tool consistency pass
6) M5 Model UX and validation
7) M6 Proxy consolidation
8) M7 Windows UX polish

Each milestone can be a separate PR with a short checklist in the description, linking to this plan.

## Rollback and Risk Management

- Wrapper changes: retain a `KODE_WRAPPER_DEBUG=1` env flag to print computed paths; provide a simple revert commit if issues arise.
- Security defaults: use feature flags/env toggles; if users hit friction, docs instruct flipping modes instantly.
- Model validation: only auto-repair parameters in-memory unless the user confirms writing back to profiles.

## Definition of Done

- All milestones accepted; README updated; `bun run dev` and `npm run dev:node` work; CI (typecheck/lint/test) green; Windows/macOS/Linux manual spot-checks pass; proxy documented and honored.

