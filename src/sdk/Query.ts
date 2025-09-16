import { createUserMessage } from '../utils/messages'
import { queryLLM } from '../services/claude'

export type QueryOptions = {
  model?: string
  safeMode?: boolean
  systemPrompt?: string[]
}

export type QueryEvent = {
  type: 'final'
  text: string
  raw: any
}

export class QuerySession {
  private abortController = new AbortController()

  interrupt(): void {
    try { this.abortController.abort() } catch {}
  }

  async *query(prompt: string, options: QueryOptions = {}): AsyncGenerator<QueryEvent, void> {
    const response = await queryLLM(
      [createUserMessage(prompt)],
      options.systemPrompt ?? [],
      0,
      [],
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
  }
}
