import { z } from 'zod'
import { longText, shortText } from '../../lib/validation.js'

export const POST_TYPES = ['progress', 'milestone', 'roadblock', 'opportunity', 'announcement'] as const

// The web form sends the chosen local calendar date at 12:00 UTC. For a founder
// ahead of UTC (up to UTC+14), "today" can therefore be up to 36 hours after the
// server clock. Anything later is a future date and is rejected (QA finding #18).
export const MAX_FUTURE_SKEW_MS = 36 * 60 * 60 * 1000

export const postInput = z.strictObject({ type: z.enum(POST_TYPES), body: longText })

export function milestoneInput(now: () => number = Date.now) {
  return z.strictObject({
    title: shortText,
    description: longText,
    achievedAt: z.iso.datetime({ offset: true }).refine(
      value => Date.parse(value) <= now() + MAX_FUTURE_SKEW_MS,
      'Date achieved cannot be in the future.',
    ),
    evidenceUrl: z.url({ protocol: /^https?$/ }).max(2048).nullable().default(null),
  })
}
