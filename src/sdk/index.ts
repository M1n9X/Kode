import { QuerySession, type QueryOptions, type QueryEvent } from './Query'

export function createSession(): QuerySession {
  return new QuerySession()
}

export async function* query(prompt: string, options?: QueryOptions): AsyncGenerator<QueryEvent, void> {
  const session = new QuerySession()
  yield* session.query(prompt, options)
}

export type { QuerySession, QueryOptions, QueryEvent }

