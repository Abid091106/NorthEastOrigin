import { z } from 'zod'
import { longText, shortText } from '../../lib/validation.js'

/**
 * A milestone must already have happened. Founders in any timezone pick a calendar day
 * that the client stores at noon UTC, so allow 36 hours ahead of server time before
 * calling a date "in the future".
 */
export const FUTURE_LEEWAY_MS = 36 * 60 * 60 * 1000

export const postInput = z.strictObject({ type: z.enum(['progress', 'milestone', 'roadblock', 'opportunity', 'announcement']), body: longText })

export function milestoneInput(now: () => number = Date.now) {
  return z.strictObject({
    title: shortText,
    description: longText,
    achievedAt: z.iso.datetime({ offset: true }).refine(value => Date.parse(value) <= now() + FUTURE_LEEWAY_MS, 'A milestone must already have happened. Choose today or an earlier date.'),
    evidenceUrl: z.url({ protocol: /^https?$/ }).max(2048).nullable().default(null),
  })
}
