import { QuerySession, type QueryOptions, type QueryEvent } from './Query'

/**
 * Create a new Kode query session
 * @returns A new QuerySession instance
 */
export function createSession(): QuerySession {
  return new QuerySession()
}

/**
 * Execute a single query using Kode
 * @param prompt The prompt to send to the AI
 * @param options Query options including model, safety settings, etc.
 * @returns AsyncGenerator yielding query events
 */
export async function* query(prompt: string, options?: QueryOptions): AsyncGenerator<QueryEvent, void> {
  const session = new QuerySession()
  yield* session.query(prompt, options)
}

/**
 * Simple ask function for one-shot queries
 * @param prompt The prompt to send to the AI
 * @param options Query options
 * @returns Promise resolving to the AI's response text
 */
export async function ask(prompt: string, options?: QueryOptions): Promise<string> {
  const session = new QuerySession()
  return session.ask(prompt, options)
}

/**
 * Check if Kode SDK is available and properly configured
 * @returns Promise resolving to true if SDK is ready
 */
export async function isReady(): Promise<boolean> {
  try {
    const session = new QuerySession()
    // Try a simple query to test connectivity
    await session.ask('test', { model: 'main' })
    return true
  } catch {
    return false
  }
}

export type { QuerySession, QueryOptions, QueryEvent }

// Version information
export const VERSION = '1.1.23'

