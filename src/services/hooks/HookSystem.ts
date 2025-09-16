import { spawn } from 'child_process'
import { getGlobalConfig } from '../../utils/config'
import { debug as debugLogger } from '../../utils/debugLogger'

type Hook = {
  match?: string // substring match on tool name
  command: string // shell command to run
  timeoutMs?: number
}

export type HookConfig = {
  enabled?: boolean
  sessionStart?: Hook[]
  sessionEnd?: Hook[]
  preToolUse?: Hook[]
  postToolUse?: Hook[]
}

function getConfig(): HookConfig | undefined {
  try {
    const cfg = getGlobalConfig()
    return (cfg as any).hooks as HookConfig
  } catch {
    return undefined
  }
}

function shouldRun(hook: Hook, toolName?: string): boolean {
  if (!hook) return false
  if (!toolName || !hook.match) return true
  try {
    return toolName.toLowerCase().includes(hook.match.toLowerCase())
  } catch {
    return false
  }
}

async function runCommand(cmd: string, timeoutMs = 3000): Promise<void> {
  return new Promise(resolve => {
    const child = spawn(cmd, {
      shell: true,
      stdio: 'ignore',
      env: { ...process.env },
    })
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      try {
        child.kill('SIGKILL')
      } catch {}
      resolve()
    }, timeoutMs)
    child.on('exit', code => {
      clearTimeout(timer)
      debugLogger.state('HOOK_EXIT', { cmd, code: String(code), timedOut: String(timedOut) })
      resolve()
    })
    child.on('error', err => {
      clearTimeout(timer)
      debugLogger.error('HOOK_ERROR', { cmd, error: (err as Error).message })
      resolve()
    })
  })
}

async function runHooks(list: Hook[] | undefined, toolName?: string): Promise<void> {
  if (!list || list.length === 0) return
  // Run sequentially to avoid contention
  for (const h of list) {
    if (shouldRun(h, toolName)) {
      await runCommand(h.command, h.timeoutMs ?? 3000)
    }
  }
}

export async function runSessionStartHooks(): Promise<void> {
  const cfg = getConfig()
  if (!cfg?.enabled) return
  await runHooks(cfg.sessionStart)
}

export async function runSessionEndHooks(): Promise<void> {
  const cfg = getConfig()
  if (!cfg?.enabled) return
  await runHooks(cfg.sessionEnd)
}

export async function runPreToolHooks(toolName: string): Promise<void> {
  const cfg = getConfig()
  if (!cfg?.enabled) return
  await runHooks(cfg.preToolUse, toolName)
}

export async function runPostToolHooks(toolName: string): Promise<void> {
  const cfg = getConfig()
  if (!cfg?.enabled) return
  await runHooks(cfg.postToolUse, toolName)
}

export function validateHookConfig(): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const result = { valid: true, errors: [] as string[], warnings: [] as string[] }
  const cfg = getConfig()
  if (!cfg) return result
  if (cfg.enabled !== true) return result

  const lists: Array<{ name: string; list?: Hook[] }> = [
    { name: 'sessionStart', list: cfg.sessionStart },
    { name: 'sessionEnd', list: cfg.sessionEnd },
    { name: 'preToolUse', list: cfg.preToolUse },
    { name: 'postToolUse', list: cfg.postToolUse },
  ]
  for (const { name, list } of lists) {
    if (!list) continue
    if (!Array.isArray(list)) {
      result.valid = false
      result.errors.push(`${name} must be an array`)
      continue
    }
    list.forEach((h, idx) => {
      if (!h || typeof h !== 'object') {
        result.valid = false
        result.errors.push(`${name}[${idx}] must be an object`)
        return
      }
      if (!h.command || typeof h.command !== 'string') {
        result.valid = false
        result.errors.push(`${name}[${idx}].command is required and must be a string`)
      }
      if (h.timeoutMs !== undefined && (typeof h.timeoutMs !== 'number' || h.timeoutMs <= 0)) {
        result.valid = false
        result.errors.push(`${name}[${idx}].timeoutMs must be a positive number`)
      }
      if (h.match !== undefined && typeof h.match !== 'string') {
        result.warnings.push(`${name}[${idx}].match should be a string`)
      }
    })
  }
  return result
}
