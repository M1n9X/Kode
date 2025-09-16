import { execFileNoThrow } from './execFileNoThrow'
import { memoize } from 'lodash-es'
import { join } from 'path'
import { homedir } from 'os'
import { existsSync } from 'fs'
import { CONFIG_BASE_DIR, CONFIG_FILE } from '../constants/product'
// Base directory for Kode data files
// Supports both KODE_CONFIG_DIR and CLAUDE_CONFIG_DIR for compatibility
export const CLAUDE_BASE_DIR =
  process.env.KODE_CONFIG_DIR ?? process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), CONFIG_BASE_DIR)

// Config and data paths
// Preferred config path hierarchy (first match wins):
// 1) $KODE_CONFIG_DIR/config.json (or $CLAUDE_CONFIG_DIR/config.json)
// 2) ~/.kode/config.json (directory-based default)
// 3) ~/.kode.json (legacy fallback)
const CONFIG_DIR_CANDIDATE = join(CLAUDE_BASE_DIR, 'config.json')
export const GLOBAL_CLAUDE_FILE =
  process.env.KODE_CONFIG_DIR || process.env.CLAUDE_CONFIG_DIR
    ? CONFIG_DIR_CANDIDATE
    : existsSync(CONFIG_DIR_CANDIDATE)
      ? CONFIG_DIR_CANDIDATE
      : join(homedir(), CONFIG_FILE)
export const MEMORY_DIR = join(CLAUDE_BASE_DIR, 'memory')

const getIsDocker = memoize(async (): Promise<boolean> => {
  // Check for .dockerenv file
  const { code } = await execFileNoThrow('test', ['-f', '/.dockerenv'])
  if (code !== 0) {
    return false
  }
  return process.platform === 'linux'
})

const hasInternetAccess = memoize(async (): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1000)

    await fetch('http://1.1.1.1', {
      method: 'HEAD',
      signal: controller.signal,
    })

    clearTimeout(timeout)
    return true
  } catch {
    return false
  }
})

// all of these should be immutable
export const env = {
  getIsDocker,
  hasInternetAccess,
  isCI: Boolean(process.env.CI),
  platform:
    process.platform === 'win32'
      ? 'windows'
      : process.platform === 'darwin'
        ? 'macos'
        : 'linux',
  nodeVersion: process.version,
  terminal: process.env.TERM_PROGRAM,
}
