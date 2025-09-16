import { z } from 'zod'
import { spawn } from 'child_process'
import { getGlobalConfig } from '../../utils/config'
import { logError } from '../../utils/log'
import type { PermissionMode } from '../../types/PermissionMode'

// Hook configuration schema
const HookConfigSchema = z.object({
  command: z.string().describe('Shell command to execute'),
  match: z.string().optional().describe('Tool name or pattern to match'),
  timeoutMs: z.number().default(5000).describe('Timeout in milliseconds'),
  enabled: z.boolean().default(true).describe('Whether this hook is enabled'),
  env: z.record(z.string()).optional().describe('Additional environment variables'),
})

const HookSystemConfigSchema = z.object({
  enabled: z.boolean().default(false).describe('Whether hooks are enabled globally'),
  sessionStart: z.array(HookConfigSchema).default([]).describe('Hooks to run on session start'),
  sessionEnd: z.array(HookConfigSchema).default([]).describe('Hooks to run on session end'),
  preToolUse: z.array(HookConfigSchema).default([]).describe('Hooks to run before tool use'),
  postToolUse: z.array(HookConfigSchema).default([]).describe('Hooks to run after tool use'),
  notification: z.array(HookConfigSchema).default([]).describe('Hooks to run on notifications'),
})

export type HookConfig = z.infer<typeof HookConfigSchema>
export type HookSystemConfig = z.infer<typeof HookSystemConfigSchema>

export type HookType = 'sessionStart' | 'sessionEnd' | 'preToolUse' | 'postToolUse' | 'notification'

export interface HookContext {
  safeMode?: boolean
  permissionMode?: PermissionMode
  toolName?: string
  toolInput?: any
  toolOutput?: any
  timestamp?: number
  sessionId?: string
}

class HookSystemImpl {
  private isEnabled(): boolean {
    const config = getGlobalConfig()
    return Boolean(config.hooks?.enabled)
  }

  private getHooks(type: HookType): HookConfig[] {
    if (!this.isEnabled()) return []
    
    const config = getGlobalConfig()
    const hooks = config.hooks?.[type] || []
    
    return hooks.filter(hook => hook.enabled !== false)
  }

  private shouldRunHook(hook: HookConfig, context: HookContext): boolean {
    // Check permission mode restrictions
    if (context.permissionMode === 'plan' && !hook.match?.includes('read')) {
      return false // In plan mode, only allow read-related hooks
    }

    // Check tool name matching
    if (hook.match && context.toolName) {
      const match = hook.match.toLowerCase()
      const toolName = context.toolName.toLowerCase()
      
      // Support substring matching
      if (!toolName.includes(match)) {
        return false
      }
    }

    return true
  }

  private async executeHook(hook: HookConfig, context: HookContext): Promise<void> {
    if (!this.shouldRunHook(hook, context)) {
      return
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        logError(`Hook timeout: ${hook.command}`)
        resolve()
      }, hook.timeoutMs || 5000)

      try {
        const env = {
          ...process.env,
          KODE_HOOK_TYPE: context.toolName ? 'tool' : 'session',
          KODE_TOOL_NAME: context.toolName || '',
          KODE_SAFE_MODE: context.safeMode ? 'true' : 'false',
          KODE_PERMISSION_MODE: context.permissionMode || 'default',
          KODE_TIMESTAMP: String(context.timestamp || Date.now()),
          KODE_SESSION_ID: context.sessionId || '',
          ...hook.env,
        }

        const child = spawn('sh', ['-c', hook.command], {
          env,
          stdio: 'pipe',
          timeout: hook.timeoutMs || 5000,
        })

        child.on('close', (code) => {
          clearTimeout(timeout)
          if (code !== 0) {
            logError(`Hook failed with code ${code}: ${hook.command}`)
          }
          resolve()
        })

        child.on('error', (error) => {
          clearTimeout(timeout)
          logError(`Hook error: ${hook.command} - ${error.message}`)
          resolve()
        })

        // Capture and log output for debugging
        child.stdout?.on('data', (data) => {
          if (process.env.KODE_HOOK_DEBUG) {
            console.log(`Hook stdout: ${data.toString().trim()}`)
          }
        })

        child.stderr?.on('data', (data) => {
          if (process.env.KODE_HOOK_DEBUG) {
            console.error(`Hook stderr: ${data.toString().trim()}`)
          }
        })
      } catch (error) {
        clearTimeout(timeout)
        logError(`Hook execution error: ${hook.command} - ${error instanceof Error ? error.message : String(error)}`)
        resolve()
      }
    })
  }

  async runHooks(type: HookType, context: HookContext = {}): Promise<void> {
    if (!this.isEnabled()) return

    const hooks = this.getHooks(type)
    if (hooks.length === 0) return

    // Add timestamp and session ID to context
    const enrichedContext = {
      ...context,
      timestamp: context.timestamp || Date.now(),
      sessionId: context.sessionId || process.env.KODE_SESSION_ID || 'unknown',
    }

    // Execute hooks in parallel with error isolation
    await Promise.allSettled(
      hooks.map(hook => this.executeHook(hook, enrichedContext))
    )
  }

  validateConfig(config: any): { valid: boolean; errors: string[] } {
    try {
      HookSystemConfigSchema.parse(config)
      return { valid: true, errors: [] }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }
      }
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : String(error)]
      }
    }
  }
}

export const HookSystem = new HookSystemImpl()

// Convenience functions for common hook types
export async function runSessionStartHooks(context: HookContext = {}): Promise<void> {
  return HookSystem.runHooks('sessionStart', context)
}

export async function runSessionEndHooks(context: HookContext = {}): Promise<void> {
  return HookSystem.runHooks('sessionEnd', context)
}

export async function runPreToolUseHooks(context: HookContext = {}): Promise<void> {
  return HookSystem.runHooks('preToolUse', context)
}

export async function runPostToolUseHooks(context: HookContext = {}): Promise<void> {
  return HookSystem.runHooks('postToolUse', context)
}

export async function runNotificationHooks(context: HookContext = {}): Promise<void> {
  return HookSystem.runHooks('notification', context)
}