/**
 * HTTP utility constants and helpers
 */

import { MACRO } from '../constants/macros'
import { PRODUCT_COMMAND } from '../constants/product'
import { ProxyAgent, setGlobalDispatcher } from 'undici'

// WARNING: We rely on `claude-cli` in the user agent for log filtering.
// Please do NOT change this without making sure that logging also gets updated!
export const USER_AGENT = `${PRODUCT_COMMAND}/${MACRO.VERSION} (${process.env.USER_TYPE})`

/**
 * Configure undici global proxy agent from standard env vars.
 * Supports HTTP_PROXY, HTTPS_PROXY, or ALL_PROXY.
 */
export function configureHttpProxyFromEnv(): void {
  try {
    const proxy = process.env.ALL_PROXY || process.env.HTTPS_PROXY || process.env.HTTP_PROXY
    if (proxy && typeof proxy === 'string' && proxy.trim()) {
      setGlobalDispatcher(new ProxyAgent(proxy))
    }
  } catch {}
}
