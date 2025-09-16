import type { Command } from '../commands'
import { 
  listMCPServers, 
  getClients, 
  addMcpServer, 
  removeMcpServer, 
  getMcpServer,
  listScopedMcpServers,
  ensureConfigScope,
  type ScopedServer 
} from '../services/mcpClient'
import { PRODUCT_COMMAND } from '../constants/product'
import chalk from 'chalk'
import { getTheme } from '../utils/theme'
import { safeParseJSON } from '../utils/json'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import type { McpServerConfig } from '../utils/config'

async function importFromClaudeDesktop(): Promise<string> {
  const configPaths = [
    join(homedir(), 'Library/Application Support/Claude/claude_desktop_config.json'), // macOS
    join(homedir(), 'AppData/Roaming/Claude/claude_desktop_config.json'), // Windows
    join(homedir(), '.config/claude/claude_desktop_config.json'), // Linux
  ]

  let configPath: string | null = null
  for (const path of configPaths) {
    if (existsSync(path)) {
      configPath = path
      break
    }
  }

  if (!configPath) {
    return '⎿  No Claude Desktop configuration found'
  }

  try {
    const configContent = readFileSync(configPath, 'utf-8')
    const config = safeParseJSON(configContent)
    
    if (!config || typeof config !== 'object' || !('mcpServers' in config) || typeof config.mcpServers !== 'object') {
      return '⎿  No MCP servers found in Claude Desktop configuration'
    }

    let imported = 0
    const errors: string[] = []

    for (const [name, serverConfig] of Object.entries((config as any).mcpServers)) {
      try {
        const mcpConfig = serverConfig as any
        let kodeConfig: McpServerConfig

        if (mcpConfig.command) {
          // stdio server
          kodeConfig = {
            type: 'stdio',
            command: mcpConfig.command,
            args: mcpConfig.args || [],
            env: mcpConfig.env || {},
          }
        } else if (mcpConfig.url) {
          // HTTP/SSE server
          kodeConfig = {
            type: 'sse',
            url: mcpConfig.url,
          }
        } else {
          errors.push(`${name}: unsupported server configuration`)
          continue
        }

        addMcpServer(name, kodeConfig, 'global')
        imported++
      } catch (error) {
        errors.push(`${name}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    const lines = [`⎿  Imported ${imported} MCP servers from Claude Desktop`]
    if (errors.length > 0) {
      lines.push('⎿  Errors:')
      errors.forEach(error => lines.push(`   • ${error}`))
    }
    return lines.join('\n')
  } catch (error) {
    return `⎿  Failed to read Claude Desktop config: ${error instanceof Error ? error.message : String(error)}`
  }
}

async function healthCheck(): Promise<string> {
  const clients = await getClients()
  const theme = getTheme()
  
  if (clients.length === 0) {
    return '⎿  No MCP servers configured'
  }

  const lines = ['⎿  MCP Server Health Check']
  
  for (const client of clients.sort((a, b) => a.name.localeCompare(b.name))) {
    const isConnected = client.type === 'connected'
    const status = isConnected ? 'healthy' : 'failed'
    const coloredStatus = isConnected
      ? chalk.hex(theme.success)(status)
      : chalk.hex(theme.error)(status)
    
    let details = ''
    if (isConnected) {
      try {
        const capabilities = await client.client.getServerCapabilities()
        const features = []
        if (capabilities.tools) features.push('tools')
        if (capabilities.prompts) features.push('prompts')
        if (capabilities.resources) features.push('resources')
        details = features.length > 0 ? ` (${features.join(', ')})` : ''
      } catch {
        details = ' (capabilities unknown)'
      }
    }
    
    lines.push(`   • ${client.name}: ${coloredStatus}${details}`)
  }
  
  return lines.join('\n')
}

const mcp = {
  type: 'local',
  name: 'mcp',
  description: 'Manage MCP servers and show connection status',
  isEnabled: true,
  isHidden: false,
  async call(args: string) {
    const [subcommand, ...rest] = args.trim().split(/\s+/).filter(Boolean)
    
    if (!subcommand || subcommand === 'status') {
      // Default behavior - show status
      const servers = listMCPServers()
      const clients = await getClients()
      const theme = getTheme()

      if (Object.keys(servers).length === 0) {
        return `⎿  No MCP servers configured. Run \`${PRODUCT_COMMAND} mcp add\` to add servers.`
      }

      // Sort servers by name and format status with colors
      const serverStatusLines = clients
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(client => {
          const isConnected = client.type === 'connected'
          const status = isConnected ? 'connected' : 'disconnected'
          const coloredStatus = isConnected
            ? chalk.hex(theme.success)(status)
            : chalk.hex(theme.error)(status)
          return `⎿  • ${client.name}: ${coloredStatus}`
        })

      return ['⎿  MCP Server Status', ...serverStatusLines].join('\n')
    }

    switch (subcommand) {
      case 'list': {
        const scope = rest[0] ? ensureConfigScope(rest[0]) : undefined
        const servers = listScopedMcpServers(scope)
        
        if (servers.length === 0) {
          return scope 
            ? `⎿  No MCP servers configured in ${scope} scope`
            : '⎿  No MCP servers configured'
        }

        const lines = ['⎿  MCP Servers']
        servers.forEach(({ name, scope, server }) => {
          const typeInfo = server.type === 'stdio' 
            ? `${server.command} ${(server.args || []).join(' ')}`
            : server.url
          lines.push(`   • ${name} (${scope}): ${server.type} - ${typeInfo}`)
        })
        return lines.join('\n')
      }

      case 'get': {
        const name = rest[0]
        if (!name) {
          return '⎿  Usage: mcp get <name>'
        }

        const server = getMcpServer(name)
        if (!server) {
          return `⎿  MCP server '${name}' not found`
        }

        const lines = [`⎿  MCP Server: ${name} (${server.scope})`]
        lines.push(`   Type: ${server.type}`)
        
        if (server.type === 'stdio') {
          lines.push(`   Command: ${server.command}`)
          if (server.args?.length) {
            lines.push(`   Args: ${server.args.join(' ')}`)
          }
          if (server.env && Object.keys(server.env).length > 0) {
            lines.push(`   Environment:`)
            Object.entries(server.env).forEach(([key, value]) => {
              lines.push(`     ${key}=${value}`)
            })
          }
        } else {
          lines.push(`   URL: ${server.url}`)
        }
        
        return lines.join('\n')
      }

      case 'remove': {
        const name = rest[0]
        const scope = rest[1] ? ensureConfigScope(rest[1]) : 'project'
        
        if (!name) {
          return '⎿  Usage: mcp remove <name> [scope]'
        }

        try {
          removeMcpServer(name, scope)
          return `⎿  Removed MCP server '${name}' from ${scope} scope`
        } catch (error) {
          return `⎿  Error: ${error instanceof Error ? error.message : String(error)}`
        }
      }

      case 'add-json': {
        const name = rest[0]
        const jsonStr = rest.slice(1).join(' ')
        const scope = 'project' // Default scope for JSON additions
        
        if (!name || !jsonStr) {
          return '⎿  Usage: mcp add-json <name> \'{"type": "sse", "url": "https://example.com"}\''
        }

        try {
          const config = safeParseJSON(jsonStr) as McpServerConfig
          if (!config || typeof config !== 'object') {
            return '⎿  Error: Invalid JSON configuration'
          }

          if (!['stdio', 'sse', 'http', 'ws'].includes(config.type)) {
            return '⎿  Error: Invalid server type. Must be one of: stdio, sse, http, ws'
          }

          addMcpServer(name, config, scope)
          return `⎿  Added MCP server '${name}' (${config.type})`
        } catch (error) {
          return `⎿  Error: ${error instanceof Error ? error.message : String(error)}`
        }
      }

      case 'add-http': {
        const name = rest[0]
        const url = rest[1]
        const scope = rest[2] ? ensureConfigScope(rest[2]) : 'project'
        
        if (!name || !url) {
          return '⎿  Usage: mcp add-http <name> <http://url> [scope]'
        }

        try {
          const config: McpServerConfig = { type: 'http', url }
          addMcpServer(name, config, scope)
          return `⎿  Added HTTP MCP server '${name}' in ${scope} scope`
        } catch (error) {
          return `⎿  Error: ${error instanceof Error ? error.message : String(error)}`
        }
      }

      case 'add-ws': {
        const name = rest[0]
        const url = rest[1]
        const scope = rest[2] ? ensureConfigScope(rest[2]) : 'project'
        
        if (!name || !url) {
          return '⎿  Usage: mcp add-ws <name> <ws://url> [scope]'
        }

        try {
          const config: McpServerConfig = { type: 'ws', url }
          addMcpServer(name, config, scope)
          return `⎿  Added WebSocket MCP server '${name}' in ${scope} scope`
        } catch (error) {
          return `⎿  Error: ${error instanceof Error ? error.message : String(error)}`
        }
      }

      case 'import-desktop': {
        return await importFromClaudeDesktop()
      }

      case 'health': {
        return await healthCheck()
      }

      default: {
        return [
          '⎿  MCP Server Management',
          '   Usage: mcp [command] [args...]',
          '',
          '   Commands:',
          '     status              Show server connection status (default)',
          '     list [scope]        List servers (project/global/mcprc)',
          '     get <name>          Show server details',
          '     remove <name> [scope] Remove server',
          '     add-json <name> <json> Add server from JSON config',
          '     add-http <name> <url>  Add HTTP server',
          '     add-ws <name> <url>    Add WebSocket server', 
          '     import-desktop      Import from Claude Desktop config',
          '     health              Check server health and capabilities',
          '',
          '   Scopes: project (default), global, mcprc',
        ].join('\n')
      }
    }
  },
  userFacingName() {
    return 'mcp'
  },
} satisfies Command

export default mcp
