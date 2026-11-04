// S-02 activity labels (ROADMAP.md): pure rules, no React, so they can be unit tested.
// Recently active ≤14 days, Quiet 15–30, Dormant >30, measured from the latest
// substantive update. No history reads "New idea", never "Dormant". Paused and
// Completed are owner-set statuses and replace the recency label.
import type { ProjectStatus } from '@neo/contracts'

export type ActivityKind = 'recent' | 'quiet' | 'dormant' | 'new' | 'paused' | 'completed'

export interface ActivityLabel {
  kind: ActivityKind
  label: string
}

const DAY = 86_400_000
export const RECENT_DAYS = 14
export const QUIET_DAYS = 30

const LABELS: Record<ActivityKind, string> = {
  recent: 'Recently active',
  quiet: 'Quiet',
  dormant: 'Dormant',
  new: 'New idea',
  paused: 'Paused',
  completed: 'Completed',
}

/** Whole days between an ISO date and now; never negative, null for an invalid date. */
export function daysSince(iso: string, now: Date = new Date()): number | null {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return null
  return Math.max(0, Math.floor((now.getTime() - then) / DAY))
}

export function activityLabel(
  project: { status?: ProjectStatus; lastSubstantiveUpdateAt: string | null },
  now: Date = new Date(),
): ActivityLabel {
  const kind = activityKind(project, now)
  return { kind, label: LABELS[kind] }
}

function activityKind({ status, lastSubstantiveUpdateAt }: { status?: ProjectStatus; lastSubstantiveUpdateAt: string | null }, now: Date): ActivityKind {
  if (status === 'paused') return 'paused'
  if (status === 'completed') return 'completed'
  const days = lastSubstantiveUpdateAt === null ? null : daysSince(lastSubstantiveUpdateAt, now)
  if (days === null) return 'new'
  if (days <= RECENT_DAYS) return 'recent'
  if (days <= QUIET_DAYS) return 'quiet'
  return 'dormant'
}
