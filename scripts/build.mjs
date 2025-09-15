#!/usr/bin/env node
import { build } from 'esbuild'
import { existsSync, mkdirSync, writeFileSync, cpSync, readFileSync, readdirSync, statSync, chmodSync, rmSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'

const SRC_DIR = 'src'
const OUT_DIR = 'dist'

function collectEntries(dir, acc = []) {
  const items = readdirSync(dir)
  for (const name of items) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) {
      // skip tests and storybook or similar folders if any, adjust as needed
      if (name === 'test' || name === '__tests__') continue
      collectEntries(p, acc)
    } else if (st.isFile()) {
      if (p.endsWith('.ts') || p.endsWith('.tsx')) acc.push(p)
    }
  }
  return acc
}

function fixRelativeImports(dir) {
  const items = readdirSync(dir)
  for (const name of items) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) {
      fixRelativeImports(p)
      continue
    }
    if (!p.endsWith('.js')) continue
    let text = readFileSync(p, 'utf8')
    // Handle: from '...'
    text = text.replace(/(from\s+['"])(\.{1,2}\/[^'"\n]+)(['"])/gm, (m, a, spec, c) => {
      if (/\.(js|json|node|mjs|cjs)$/.test(spec)) return m
      return a + spec + '.js' + c
    })
    // Handle: export ... from '...'
    text = text.replace(/(export\s+[^;]*?from\s+['"])(\.{1,2}\/[^'"\n]+)(['"])/gm, (m, a, spec, c) => {
      if (/\.(js|json|node|mjs|cjs)$/.test(spec)) return m
      return a + spec + '.js' + c
    })
    // Handle: dynamic import('...')
    text = text.replace(/(import\(\s*['"])(\.{1,2}\/[^'"\n]+)(['"]\s*\))/gm, (m, a, spec, c) => {
      if (/\.(js|json|node|mjs|cjs)$/.test(spec)) return m
      return a + spec + '.js' + c
    })
    writeFileSync(p, text)
  }
}

async function main() {
  console.log('🚀 Building Kode CLI for cross-platform compatibility...')
  
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

  const entries = collectEntries(SRC_DIR)

  // Build ESM format but ensure Node.js compatibility
  await build({
    entryPoints: entries,
    outdir: OUT_DIR,
    outbase: SRC_DIR,
    bundle: false,
    platform: 'node',
    format: 'esm',
    target: ['node20'],
    sourcemap: true,
    legalComments: 'none',
    logLevel: 'info'  })

  // Fix relative import specifiers to include .js extension for ESM
  fixRelativeImports(OUT_DIR)

  // Mark dist as ES module
  writeFileSync(join(OUT_DIR, 'package.json'), JSON.stringify({
    type: 'module',
    main: './entrypoints/cli.js'
  }, null, 2))

  // Create a proper entrypoint - ESM with async handling
  const mainEntrypoint = join(OUT_DIR, 'index.js')
  writeFileSync(mainEntrypoint, `#!/usr/bin/env node
import('./entrypoints/cli.js').catch(err => {
  console.error('❌ Failed to load CLI:', err.message);
  process.exit(1);
});
`)
  chmodSync(mainEntrypoint, 0o755)

  // Create smart CLI wrapper at repo root that prefers dist -> bun -> node+tsx
  try {
    // Clean any previous wrapper/npmrc
    if (existsSync('cli.js')) rmSync('cli.js', { force: true })
    if (existsSync('.npmrc')) rmSync('.npmrc', { force: true })

    const wrapper = `#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const cliTsx = path.join(__dirname, 'src', 'entrypoints', 'cli.tsx');
const distCli = path.join(__dirname, 'dist', 'entrypoints', 'cli.js');

function runNode(file) {
  const child = spawn(process.execPath, [file, ...args], {
    stdio: 'inherit',
    env: { ...process.env, YOGA_WASM_PATH: path.join(__dirname, 'yoga.wasm') },
  });
  child.on('exit', (code) => process.exit(code || 0));
  child.on('error', () => process.exit(1));
}

// 1) Prefer compiled dist if present
if (fs.existsSync(distCli)) {
  runNode(distCli);
} else {
  // 2) Try bun
  try {
    execSync('bun --version', { stdio: 'ignore' });
    const child = spawn('bun', ['run', cliTsx, ...args], {
      stdio: 'inherit',
      env: { ...process.env, YOGA_WASM_PATH: path.join(__dirname, 'yoga.wasm') },
    });
    child.on('exit', (code) => process.exit(code || 0));
    child.on('error', runWithTsx);
  } catch (_) {
    runWithTsx();
  }
}

function runWithTsx() {
  const binDir = path.join(__dirname, 'node_modules', '.bin');
  const tsxLocal = process.platform === 'win32' ? path.join(binDir, 'tsx.cmd') : path.join(binDir, 'tsx');

  // Try local tsx first
  const child = spawn(tsxLocal, [cliTsx, ...args], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, YOGA_WASM_PATH: path.join(__dirname, 'yoga.wasm'), TSX_TSCONFIG_PATH: process.platform === 'win32' ? 'noop' : undefined },
  });
  child.on('error', () => {
    // Fallback to PATH tsx
    const child2 = spawn('tsx', [cliTsx, ...args], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, YOGA_WASM_PATH: path.join(__dirname, 'yoga.wasm'), TSX_TSCONFIG_PATH: process.platform === 'win32' ? 'noop' : undefined },
    });
    child2.on('error', () => {
      console.error('Error: tsx is required but not found.');
      console.error('Please install tsx globally: npm i -g tsx');
      process.exit(1);
    });
    child2.on('exit', (code) => process.exit(code || 0));
  });
  child.on('exit', (code) => process.exit(code || 0));
}
`

    writeFileSync('cli.js', wrapper)
    chmodSync('cli.js', 0o755)

    // Create a minimal .npmrc for publishing compatibility
    writeFileSync('.npmrc', `auto-install-peers=true\n`)
  } catch (err) {
    console.warn('⚠️  Could not create CLI wrapper:', err.message)
  }

  // Copy yoga.wasm alongside outputs
  try {
    cpSync('yoga.wasm', join(OUT_DIR, 'yoga.wasm'))
    console.log('✅ yoga.wasm copied to dist')
  } catch (err) {
    console.warn('⚠️  Could not copy yoga.wasm:', err.message)
  }

  console.log('✅ Build completed for cross-platform compatibility!')
  console.log('📋 Generated files:')
  console.log('  - dist/ (ESM modules)')
  console.log('  - dist/index.js (main entrypoint)')
  console.log('  - dist/entrypoints/cli.js (CLI main)')
  console.log('  - cli.js (cross-platform wrapper)')
}

main().catch(err => {
  console.error('❌ Build failed:', err)
  process.exit(1)
})
