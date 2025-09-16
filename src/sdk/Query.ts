import { createUserMessage } from '../utils/messages'
import { queryLLM } from '../services/claude'
import { getTools } from '../tools'
import { getCommands } from '../commands'
import type { PermissionMode } from '../types/PermissionMode'

export type QueryOptions = {
  model?: string
  safeMode?: boolean
  permissionMode?: PermissionMode
  systemPrompt?: string[]
  tools?: boolean
  verbose?: boolean
  cwd?: string
}

export type QueryEvent = 
  | { type: 'progress'; content: string }
  | { type: 'tool_use'; tool: string; input: any }
  | { type: 'tool_result'; tool: string; output: any }
  | { type: 'final'; text: string; raw: any }
  | { type: 'error'; error: string }

export class QuerySession {
  private abortController = new AbortController()
  private sessionId = Math.random().toString(36).substring(7)

  interrupt(): void {
    try { this.abortController.abort() } catch {}
  }

  setPermissionMode(mode: PermissionMode): void {
    // This would update the session's permission mode
    // Implementation depends on how permissions are managed in the session
  }

  async *query(prompt: string, options: QueryOptions = {}): AsyncGenerator<QueryEvent, void> {
    try {
      // Set up working directory if provided
      if (options.cwd) {
        process.chdir(options.cwd)
      }

      // Get tools if requested
      const tools = options.tools ? await getTools() : []
      const commands = options.tools ? await getCommands() : []

      yield { type: 'progress', content: 'Processing query...' }

      const response = await queryLLM(
        [createUserMessage(prompt)],
        options.systemPrompt ?? [],
        0,
        tools,
        this.abortController.signal,
        {
          safeMode: Boolean(options.safeMode),
          model: options.model ?? 'main',
          prependCLISysprompt: false,
        },
      )

      const text = (response.message.content || [])
        .filter(b => b.type === 'text')
        .map(b => (b as any).text)
        .join('\n')

      yield { type: 'final', text, raw: response }
    } catch (error) {
      yield { 
        type: 'error', 
        error: error instanceof Error ? error.message : String(error) 
      }
    }
  }

  // Convenience method for simple queries
  async ask(prompt: string, options: QueryOptions = {}): Promise<string> {
    for await (const event of this.query(prompt, options)) {
      if (event.type === 'final') {
        return event.text
      }
      if (event.type === 'error') {
        throw new Error(event.error)
      }
    }
    return ''
  }
}
