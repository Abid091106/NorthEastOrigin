// S-02: activity label plus the actual last progress date, for discovery cards (P5)
// and the project page (P2). The date is always shown alongside the label.
import type { ProjectStatus } from '@neo/contracts'
import { activityLabel } from './labels'
import { formatDate } from './progress'
import './activity-status.css'

export function ActivityStatus({ status, lastSubstantiveUpdateAt }: { status?: ProjectStatus; lastSubstantiveUpdateAt: string | null }) {
  const { kind, label } = activityLabel({ status, lastSubstantiveUpdateAt })
  return <span className="act-status">
    <span className={`act-status-label act-status-${kind}`}>{label}</span>
    <span className="act-status-date">
      {lastSubstantiveUpdateAt
        ? <>Last progress <time dateTime={lastSubstantiveUpdateAt}>{formatDate(lastSubstantiveUpdateAt)}</time></>
        : 'No progress update yet'}
    </span>
  </span>
}
