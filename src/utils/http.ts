import { ProxyAgent } from 'undici'

let globalProxyAgent: ProxyAgent | null = null

// User agent for HTTP requests
export const USER_AGENT = 'Kode/1.1.23'

/**
 * Configure global HTTP proxy for all network calls
 * This affects OpenAI, Anthropic, MCP, and other HTTP requests
 */
export function configureHttpProxyFromEnv(): void {
  const proxyUrl = 
    process.env.ALL_PROXY || 
    process.env.HTTPS_PROXY || 
    process.env.HTTP_PROXY ||
    process.env.all_proxy ||
    process.env.https_proxy ||
    process.env.http_proxy

  if (proxyUrl) {
    try {
      globalProxyAgent = new ProxyAgent(proxyUrl)
      
      // Set global dispatcher for undici-based requests
      const { setGlobalDispatcher } = require('undici')
      setGlobalDispatcher(globalProxyAgent)
      
      console.log(`Configured HTTP proxy: ${proxyUrl}`)
    } catch (error) {
      console.error(`Failed to configure proxy: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

/**
 * Get the current global proxy agent
 */
export function getGlobalProxyAgent(): ProxyAgent | null {
  return globalProxyAgent
}

/**
 * Create fetch options with proxy support
 */
export function createFetchOptions(options: RequestInit = {}): RequestInit {
  if (globalProxyAgent) {
    return {
      ...options,
      // @ts-ignore - undici types
      dispatcher: globalProxyAgent,
    }
  }
  return options
}

/**
 * Proxy-aware fetch function
 */
export async function proxyFetch(url: string | URL, options?: RequestInit): Promise<Response> {
  const fetchOptions = createFetchOptions(options)
  return fetch(url, fetchOptions)
}

/**
 * Get proxy configuration for axios-style clients
 */
export function getProxyConfig(): { proxy?: { protocol: string; host: string; port: number } } | {} {
  const proxyUrl = 
    process.env.ALL_PROXY || 
    process.env.HTTPS_PROXY || 
    process.env.HTTP_PROXY ||
    process.env.all_proxy ||
    process.env.https_proxy ||
    process.env.http_proxy

  if (proxyUrl) {
    try {
      const url = new URL(proxyUrl)
      return {
        proxy: {
          protocol: url.protocol.replace(':', ''),
          host: url.hostname,
          port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
        }
      }
    } catch (error) {
      console.error(`Failed to parse proxy URL: ${proxyUrl}`)
    }
  }
  
  return {}
}