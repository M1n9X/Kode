import type { Command } from '../commands'
import { MODE_CONFIGS, getNextPermissionMode, type PermissionMode } from '../types/PermissionMode'
import { getGlobalConfig, saveGlobalConfig } from '../utils/config'
import chalk from 'chalk'

const mode: Command = {
  name: 'mode',
  description: 'View or change permission mode',
  isEnabled: true,
  isHidden: false,
  userFacingName() {
    return 'mode'
  },
  type: 'local',
  async call(args: string, context) {
    const [targetMode] = args.trim().split(/\s+/).filter(Boolean)
    
    // Get current permission mode from global config or default
    const globalConfig = getGlobalConfig()
    const currentMode = (globalConfig.defaultPermissionMode as PermissionMode) || 'bypassPermissions'
    
    if (!targetMode) {
      // Show current mode and available modes
      const modeConfig = MODE_CONFIGS[currentMode]
      const lines = [
        `⎿  Current Permission Mode: ${modeConfig.icon} ${modeConfig.label}`,
        `   ${modeConfig.description}`,
        '',
        '⎿  Available Modes:',
      ]
      
      Object.values(MODE_CONFIGS).forEach(modeConfig => {
        const isCurrent = modeConfig.name === currentMode
        const prefix = isCurrent ? '   • ' : '     '
        const marker = isCurrent ? ' (current)' : ''
        lines.push(`${prefix}${modeConfig.icon} ${modeConfig.label.toLowerCase()}${marker} - ${modeConfig.description}`)
      })
      
      lines.push('')
      lines.push('⎿  Usage: /mode <mode-name>')
      lines.push('   Example: /mode acceptEdits')
      
      return lines.join('\n')
    }
    
    // Normalize mode name
    let newMode: PermissionMode
    switch (targetMode.toLowerCase()) {
      case 'default':
      case 'safe':
        newMode = 'default'
        break
      case 'acceptedits':
      case 'accept-edits':
      case 'edits':
        newMode = 'acceptEdits'
        break
      case 'plan':
      case 'planning':
      case 'readonly':
      case 'read-only':
        newMode = 'plan'
        break
      case 'bypass':
      case 'bypasspermissions':
      case 'bypass-permissions':
      case 'yolo':
        newMode = 'bypassPermissions'
        break
      default:
        return `⎿  Error: Unknown mode '${targetMode}'. Available modes: default, acceptEdits, plan, bypassPermissions`
    }
    
    if (newMode === currentMode) {
      const currentModeConfig = MODE_CONFIGS[currentMode]
      return `⎿  Already in ${currentModeConfig.icon} ${currentModeConfig.label} mode`
    }
    
    // Note: Permission mode is managed globally through config
    // Context doesn't have permissionMode property
    
    // Save to global config as default
    globalConfig.defaultPermissionMode = newMode
    saveGlobalConfig(globalConfig)
    
    const newModeConfig = MODE_CONFIGS[newMode]
    return `⎿  Switched to ${newModeConfig.icon} ${newModeConfig.label} mode\n   ${newModeConfig.description}`
  },
}

export default mode