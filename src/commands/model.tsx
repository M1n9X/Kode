import React from 'react'
import { render } from 'ink'
import { ModelConfig } from '../components/ModelConfig'
import { enableConfigs, getGlobalConfig, saveGlobalConfig } from '../utils/config'
import { triggerModelConfigChange } from '../messages'
import { getModelManager, reloadModelManager } from '../utils/model'
import type { Command } from '../commands'

const modelCommand: Command = {
  name: 'model',
  description: 'Manage AI provider and model settings',
  isEnabled: true,
  isHidden: false,
  userFacingName() {
    return 'model'
  },
  type: 'local',
  async call(args: string) {
    const [subcommand, ...rest] = args.trim().split(/\s+/).filter(Boolean)
    
    if (!subcommand || subcommand === 'config') {
      // Default behavior - show model config UI
      return 'Opening model configuration...'
    }

    switch (subcommand) {
      case 'list': {
        const modelManager = getModelManager()
        const config = getGlobalConfig()
        
        const lines = ['⎿  Model Configuration']
        
        // Show current pointers
        if (config.modelPointers) {
          lines.push('   Pointers:')
          Object.entries(config.modelPointers).forEach(([pointer, modelName]) => {
            lines.push(`     ${pointer}: ${modelName}`)
          })
        }
        
        // Show available profiles
        if (config.modelProfiles && config.modelProfiles.length > 0) {
          lines.push('   Profiles:')
          config.modelProfiles.forEach(profile => {
            const isCurrent = modelManager.getModelName('main') === profile.name
            const marker = isCurrent ? ' (current)' : ''
            lines.push(`     • ${profile.name}${marker} - ${profile.provider}`)
          })
        }
        
        return lines.join('\n')
      }

      case 'use': {
        const [pointer, modelName] = rest
        if (!pointer || !modelName) {
          return '⎿  Usage: model use <pointer> <model-name>\n   Pointers: main, task, reasoning, quick'
        }

        const validPointers = ['main', 'task', 'reasoning', 'quick']
        if (!validPointers.includes(pointer)) {
          return `⎿  Error: Invalid pointer '${pointer}'. Valid pointers: ${validPointers.join(', ')}`
        }

        const config = getGlobalConfig()
        if (!config.modelPointers) {
          config.modelPointers = {
            main: '',
            task: '',
            reasoning: '',
            quick: ''
          }
        }
        
        // Check if model exists in profiles
        const modelExists = config.modelProfiles?.some(profile => profile.name === modelName)
        if (!modelExists) {
          return `⎿  Warning: Model '${modelName}' not found in profiles. Setting pointer anyway.`
        }

        config.modelPointers[pointer as keyof typeof config.modelPointers] = modelName
        saveGlobalConfig(config)
        reloadModelManager()
        triggerModelConfigChange()

        return `⎿  Set ${pointer} pointer to ${modelName}`
      }

      case 'validate': {
        const modelManager = getModelManager()
        const config = getGlobalConfig()
        
        if (!config.modelProfiles || config.modelProfiles.length === 0) {
          return '⎿  No model profiles configured'
        }

        const lines = ['⎿  Model Validation Results']
        let hasIssues = false

        for (const profile of config.modelProfiles) {
          try {
            // Basic validation - check if profile has required fields
            const issues = []
            
            if (!profile.name) issues.push('missing name')
            if (!profile.provider) issues.push('missing provider')
            if (!profile.apiKey && !profile.baseURL) issues.push('missing apiKey or baseURL')
            
            // GPT-5 specific validation
            if (profile.name?.includes('gpt-5') || profile.modelName?.includes('gpt-5')) {
              if (profile.maxTokens && profile.maxTokens > 8192) {
                issues.push('maxTokens too high for GPT-5 (max 8192)')
              }
              // Note: stream_options and citations are not part of ModelProfile type
              // They would be handled at the API level
            }

            if (issues.length === 0) {
              lines.push(`   ✅ ${profile.name}: OK`)
            } else {
              lines.push(`   ❌ ${profile.name}: ${issues.join(', ')}`)
              hasIssues = true
            }
          } catch (error) {
            lines.push(`   ❌ ${profile.name}: validation error - ${error instanceof Error ? error.message : String(error)}`)
            hasIssues = true
          }
        }

        if (hasIssues) {
          lines.push('')
          lines.push('⎿  Run `model repair` to fix common issues')
        }

        return lines.join('\n')
      }

      case 'repair': {
        const config = getGlobalConfig()
        
        if (!config.modelProfiles || config.modelProfiles.length === 0) {
          return '⎿  No model profiles to repair'
        }

        let repaired = 0
        const lines = ['⎿  Model Repair Results']

        for (const profile of config.modelProfiles) {
          const issues = []
          
          // GPT-5 specific repairs
          if (profile.name?.includes('gpt-5') || profile.modelName?.includes('gpt-5')) {
            if (profile.maxTokens && profile.maxTokens > 8192) {
              profile.maxTokens = 8192
              issues.push('fixed maxTokens')
            }
            // Note: stream_options and citations are not part of ModelProfile type
            // They would be handled at the API level during request processing
          }

          if (issues.length > 0) {
            lines.push(`   🔧 ${profile.name}: ${issues.join(', ')}`)
            repaired++
          } else {
            lines.push(`   ✅ ${profile.name}: no issues`)
          }
        }

        if (repaired > 0) {
          saveGlobalConfig(config)
          reloadModelManager()
          triggerModelConfigChange()
          lines.push(``)
          lines.push(`⎿  Repaired ${repaired} model profile(s)`)
        } else {
          lines.push('')
          lines.push('⎿  No repairs needed')
        }

        return lines.join('\n')
      }

      default: {
        return [
          '⎿  Model Management',
          '   Usage: model [command] [args...]',
          '',
          '   Commands:',
          '     config              Open model configuration UI (default)',
          '     list                List model pointers and profiles',
          '     use <pointer> <model> Set model pointer (main/task/reasoning/quick)',
          '     validate            Check model profiles for issues',
          '     repair              Fix common model profile issues',
          '',
          '   Examples:',
          '     model use main claude-sonnet-4',
          '     model use task qwen-coder',
          '     model validate',
          '     model repair',
        ].join('\n')
      }
    }
  }
}

// Legacy exports for backward compatibility
export const help = modelCommand.description
export const description = modelCommand.description
export const isEnabled = modelCommand.isEnabled
export const isHidden = modelCommand.isHidden
export const name = modelCommand.name
export const type = 'local-jsx'

export function userFacingName(): string {
  return modelCommand.userFacingName()
}

export async function call(
  onDone: (result?: string) => void,
  context: any,
): Promise<React.ReactNode> {
  const { abortController } = context
  enableConfigs()
  abortController?.abort?.()
  return (
    <ModelConfig
      onClose={() => {
        // Force ModelManager reload to ensure UI sync - wait for completion before closing
        reloadModelManager()
        // 🔧 Critical fix: Trigger global UI refresh after model config changes
        // This ensures PromptInput component detects ModelManager singleton state changes
        triggerModelConfigChange()
        // Only close after reload is complete to ensure UI synchronization
        onDone()
      }}
    />
  )
}

export default modelCommand
