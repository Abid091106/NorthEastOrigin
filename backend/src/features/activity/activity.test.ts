// Run: npx tsx --test src/features/activity/activity.test.ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { FUTURE_LEEWAY_MS, milestoneInput } from './validation.js'

const NOW = Date.parse('2026-11-04T12:00:00Z')
const schema = milestoneInput(() => NOW)
const milestone = (achievedAt: string) => ({ title: 'First pilot', description: 'Ran a pilot with two schools.', achievedAt })

describe('milestone date validation', () => {
  it('accepts today and past dates', () => {
    assert.equal(schema.safeParse(milestone('2026-11-04T12:00:00Z')).success, true)
    assert.equal(schema.safeParse(milestone('2025-01-01T12:00:00Z')).success, true)
  })

  it('accepts tomorrow at noon UTC, for founders ahead of UTC', () => {
    assert.equal(schema.safeParse(milestone('2026-11-05T12:00:00Z')).success, true)
  })

  it('rejects dates beyond the leeway with a readable message', () => {
    const result = schema.safeParse(milestone(new Date(NOW + FUTURE_LEEWAY_MS + 1000).toISOString()))
    assert.equal(result.success, false)
    assert.match(result.error!.issues[0]!.message, /already have happened/)
    assert.equal(schema.safeParse(milestone('2027-01-01T12:00:00Z')).success, false)
  })

  it('still rejects malformed dates', () => {
    assert.equal(schema.safeParse(milestone('yesterday')).success, false)
  })
})
