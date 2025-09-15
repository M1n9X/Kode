import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// Avoid importing JSON as a module (emits ExperimentalWarning in Node.js)
// Read and parse package.json manually to get version
let version = '0.0.0'
try {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const pkgPath = join(__dirname, '../../package.json')
  const pkgRaw = readFileSync(pkgPath, 'utf8')
  const pkg = JSON.parse(pkgRaw)
  if (pkg && typeof pkg.version === 'string') version = pkg.version
} catch {
  // ignore and keep default
}

export const MACRO = {
  VERSION: version,
  README_URL: 'https://docs.anthropic.com/s/claude-code',
  PACKAGE_URL: '@shareai-lab/kode',
  ISSUES_EXPLAINER: 'report the issue at https://github.com/shareAI-lab/kode/issues',
}
