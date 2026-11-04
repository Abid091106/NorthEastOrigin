// Input validation for P3 posts and milestones. These run without Supabase;
// ownership and visibility are enforced by visibleProject and RLS (tests/e2e).
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { MAX_FUTURE_SKEW_MS, milestoneInput, postInput } from './validation.js'

const NOW = Date.parse('2026-11-04T10:00:00Z')
const schema = milestoneInput(() => NOW)
const valid = { title: 'First pilot', description: 'Ran a pilot with three users.', achievedAt: '2026-11-01T12:00:00Z' }
const iso = (ms: number) => new Date(ms).toISOString()

describe('milestone validation', () => {
  it('accepts a past milestone and defaults evidenceUrl to null', () => {
    const result = schema.parse(valid)
    assert.equal(result.evidenceUrl, null)
  })

  it('accepts today submitted from a timezone ahead of UTC', () => {
    // UTC+14 founder choosing their local "tomorrow-in-UTC" date, sent at 12:00Z.
    assert.equal(schema.safeParse({ ...valid, achievedAt: '2026-11-05T12:00:00Z' }).success, true)
    assert.equal(schema.safeParse({ ...valid, achievedAt: iso(NOW + MAX_FUTURE_SKEW_MS) }).success, true)
  })

  it('rejects future dates such as 2099 (QA finding #18)', () => {
    for (const achievedAt of ['2099-01-01T12:00:00Z', iso(NOW + MAX_FUTURE_SKEW_MS + 1000), '2026-11-06T12:00:00+00:00']) {
      const result = schema.safeParse({ ...valid, achievedAt })
      assert.equal(result.success, false, achievedAt)
      assert.equal(result.error?.issues[0]?.path.join('.'), 'achievedAt')
      assert.match(result.error?.issues[0]?.message ?? '', /future/)
    }
  })

  it('rejects invalid dates, non-http evidence and unknown fields', () => {
    assert.equal(schema.safeParse({ ...valid, achievedAt: '04/11/2026' }).success, false)
    assert.equal(schema.safeParse({ ...valid, evidenceUrl: 'javascript:alert(1)' }).success, false)
    assert.equal(schema.safeParse({ ...valid, evidenceUrl: 'ftp://example.com/x' }).success, false)
    assert.equal(schema.safeParse({ ...valid, verification: 'verified' }).success, false)
    assert.equal(schema.safeParse({ ...valid, projectId: crypto.randomUUID() }).success, false)
  })

  it('trims text and enforces required and maximum lengths', () => {
    assert.equal(schema.parse({ ...valid, title: '  Pilot  ' }).title, 'Pilot')
    assert.equal(schema.safeParse({ ...valid, title: '   ' }).success, false)
    assert.equal(schema.safeParse({ ...valid, title: 'x'.repeat(121) }).success, false)
    assert.equal(schema.safeParse({ ...valid, description: 'x'.repeat(5001) }).success, false)
  })
})

describe('post validation', () => {
  it('accepts every documented post type', () => {
    for (const type of ['progress', 'milestone', 'roadblock', 'opportunity', 'announcement']) {
      assert.equal(postInput.safeParse({ type, body: 'Update' }).success, true, type)
    }
  })

  it('rejects unknown types, blank bodies and server-owned fields', () => {
    assert.equal(postInput.safeParse({ type: 'news', body: 'Update' }).success, false)
    assert.equal(postInput.safeParse({ type: 'progress', body: '  ' }).success, false)
    assert.equal(postInput.safeParse({ type: 'progress', body: 'Update', authorId: crypto.randomUUID() }).success, false)
    assert.equal(postInput.safeParse({ type: 'progress', body: 'Update', createdAt: '2020-01-01T00:00:00Z' }).success, false)
  })
})
