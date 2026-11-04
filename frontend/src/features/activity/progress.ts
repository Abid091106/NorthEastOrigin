// Pure helpers for the P3 progress feature. No React, so they can be unit tested.
import type { Milestone, PostType, ProjectPost } from '@neo/contracts'

/** Canonical post types (docs/CONTRACTS.md) with readable labels, in contract order. */
export const POST_TYPES: readonly { value: PostType; label: string }[] = [
  { value: 'progress', label: 'Progress update' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'roadblock', label: 'Roadblock' },
  { value: 'opportunity', label: 'Opportunity' },
  { value: 'announcement', label: 'Announcement' },
]

export const postLabel = (type: PostType): string => POST_TYPES.find(t => t.value === type)?.label ?? type

/**
 * Progress, milestone and roadblock posts are substantive; announcements and opportunity
 * posts are not (docs/CONTRACTS.md). Same rule as discovery's lastSubstantiveUpdateAt in
 * supabase/migrations/202611040002_discovery.sql, which also counts milestone dates.
 */
const SUBSTANTIVE: ReadonlySet<PostType> = new Set<PostType>(['progress', 'milestone', 'roadblock'])
export const isSubstantive = (type: PostType): boolean => SUBSTANTIVE.has(type)

const time = (iso: string) => new Date(iso).getTime()
const valid = (iso: string) => !Number.isNaN(time(iso))

/** Latest substantive date, or null when the project has no progress history yet. */
export function latestProgress(
  posts: readonly Pick<ProjectPost, 'type' | 'createdAt'>[],
  milestones: readonly Pick<Milestone, 'achievedAt'>[],
): string | null {
  let latest: string | null = null
  for (const date of [
    ...posts.filter(post => isSubstantive(post.type)).map(post => post.createdAt),
    ...milestones.map(milestone => milestone.achievedAt),
  ]) {
    if (valid(date) && (latest === null || time(date) > time(latest))) latest = date
  }
  return latest
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
export const formatDate = (iso: string): string => (valid(iso) ? dateFormat.format(new Date(iso)) : 'Unknown date')

/** Today as a yyyy-mm-dd value in the person's own timezone, for a date input's max. */
export function todayInputValue(now: Date = new Date()): string {
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}

/**
 * Milestones store a full timestamp. Noon UTC keeps the chosen calendar day the same
 * when it is shown again in UK time.
 */
export const milestoneTimestamp = (day: string): string => new Date(`${day}T12:00:00Z`).toISOString()
