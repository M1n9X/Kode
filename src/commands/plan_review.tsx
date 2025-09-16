import type { Command } from '../commands'
import { queryLLM } from '../services/claude'
import { createUserMessage } from '../utils/messages'

const plan_review: Command = {
  name: 'plan-review',
  description: 'Review a multi-step plan and return structured feedback',
  isEnabled: true,
  isHidden: false,
  userFacingName() {
    return 'plan-review'
  },
  type: 'local',
  async call(args: string, context) {
    const plan = (args || '').trim()
    if (!plan) {
      return `Usage: /plan-review <plan text>`
    }

    const prompt = await import('../tools/PlanReviewTool/prompt')

    const resp = await queryLLM(
      [createUserMessage(plan)],
      [prompt.PROMPT],
      0,
      [],
      context.abortController.signal,
      { safeMode: false, model: 'main', prependCLISysprompt: false },
    )

    const text = (resp.message.content || [])
      .filter(b => b.type === 'text')
      .map(b => (b as any).text)
      .join('\n')
      .trim()

    let parsed: any = null
    try {
      parsed = JSON.parse(text)
    } catch {
      const m = text.match(/\{[\s\S]*\}/)
      if (m) {
        try { parsed = JSON.parse(m[0]) } catch {}
      }
    }

    if (!parsed) {
      return 'Failed to parse plan review output.'
    }

    const lines: string[] = []
    lines.push('⎿  Plan Review')
    if (parsed.scores) {
      lines.push(`   - Structure: ${parsed.scores.structure}/10`)
      lines.push(`   - Completeness: ${parsed.scores.completeness}/10`)
      lines.push(`   - Clarity: ${parsed.scores.clarity}/10`)
    }
    if (parsed.summary) lines.push(`   - Summary: ${parsed.summary}`)
    if (Array.isArray(parsed.issues) && parsed.issues.length) {
      lines.push('   - Issues:')
      for (const i of parsed.issues.slice(0, 5)) {
        lines.push(`     • (${i.type}) ${i.message}`)
      }
    }
    if (Array.isArray(parsed.suggestions) && parsed.suggestions.length) {
      lines.push('   - Suggestions:')
      for (const s of parsed.suggestions.slice(0, 5)) {
        lines.push(`     • ${s}`)
      }
    }
    if (Array.isArray(parsed.next_steps) && parsed.next_steps.length) {
      lines.push('   - Next Steps:')
      for (const s of parsed.next_steps.slice(0, 5)) {
        lines.push(`     • ${s}`)
      }
    }
    return lines.join('\n')
  },
}

export default plan_review

