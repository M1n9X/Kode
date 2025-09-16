import React from 'react'
import { Box, Text } from 'ink'
import { z } from 'zod'
import { Tool, ValidationResult } from '../../Tool'
import { DESCRIPTION, PROMPT } from './prompt'
import { createUserMessage } from '../../utils/messages'
import { queryLLM } from '../../services/claude'
import { getTheme } from '../../utils/theme'

const inputSchema = z.object({
  plan: z.string().min(1).describe('The multi-step plan text to review'),
})

type Out = {
  scores: { structure: number; completeness: number; clarity: number }
  issues: { type: string; message: string; evidence?: string }[]
  suggestions: string[]
  next_steps: string[]
  summary: string
}

export const PlanReviewTool = {
  name: 'PlanReview',
  userFacingName: () => 'Plan Review',
  description: async () => DESCRIPTION,
  inputSchema,
  isEnabled: async () => true,
  isReadOnly: () => true,
  isConcurrencySafe: () => true,
  needsPermissions: () => false,
  prompt: async () => PROMPT,

  async validateInput({ plan }): Promise<ValidationResult> {
    if (!plan || !plan.trim()) {
      return { result: false, message: 'Plan text is required' }
    }
    if (plan.length < 10) {
      return { result: false, message: 'Plan is too short to review' }
    }
    return { result: true }
  },

  renderToolUseMessage({ plan }, { verbose }) {
    const preview = plan?.slice(0, 120) || ''
    if (verbose) return `Plan review: ${preview}${plan.length > 120 ? '…' : ''}`
    return 'Plan review'
  },

  renderToolResultMessage(content: Out) {
    const theme = getTheme()
    if (!content) return null
    const { scores, summary } = content
    return (
      <Box flexDirection="column">
        <Text>
          ⎿ Plan review · structure {scores?.structure ?? '-'} · completeness {scores?.completeness ?? '-'} · clarity {scores?.clarity ?? '-'}
        </Text>
        {summary && (
          <Box marginLeft={2}>
            <Text color={theme.secondaryText}>{summary}</Text>
          </Box>
        )}
      </Box>
    )
  },

  renderResultForAssistant(content: Out) {
    if (!content?.scores) return 'Plan reviewed.'
    const s = content.scores
    return `Plan reviewed. Scores → structure ${s.structure}/10, completeness ${s.completeness}/10, clarity ${s.clarity}/10.`
  },

  async *call({ plan }, context) {
    // Emit a quick progress line
    yield {
      type: 'progress',
      content: createUserMessage('Reviewing plan…'),
      normalizedMessages: undefined,
      tools: [],
    }

    // Query with main model; no tools; no extra system prefix
    const response = await queryLLM(
      [createUserMessage(plan)],
      [await this.prompt({ safeMode: context.options?.safeMode })],
      0,
      [],
      context.abortController.signal,
      {
        safeMode: false,
        model: 'main',
        prependCLISysprompt: false,
        toolUseContext: context,
      },
    )

    // Extract text blocks, then parse JSON
    const text = (response.message.content || [])
      .filter(b => b.type === 'text')
      .map(b => (b as any).text)
      .join('\n')
      .trim()

    let parsed: Out | null = null
    try {
      parsed = JSON.parse(text) as Out
    } catch (e) {
      // Try to salvage JSON from fenced blocks if present
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        try { parsed = JSON.parse(match[0]) as Out } catch {}
      }
    }

    if (!parsed) {
      parsed = {
        scores: { structure: 0, completeness: 0, clarity: 0 },
        issues: [
          {
            type: 'other',
            message: 'Failed to parse reviewer output as JSON',
            evidence: text.slice(0, 200),
          },
        ],
        suggestions: [],
        next_steps: [],
        summary: 'Plan review failed to produce valid JSON output.',
      }
    }

    yield { type: 'result', data: parsed, resultForAssistant: this.renderResultForAssistant(parsed) }
  },
} satisfies Tool<typeof inputSchema, Out>

export default PlanReviewTool

