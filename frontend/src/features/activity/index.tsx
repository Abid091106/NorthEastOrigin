// P3 progress feature: dated updates, founder-reported milestones and the owner's
// publishing tools. Public export: ProjectActivity({ projectId, canManage }).
// Styled with the Network Design Kit (docs/DESIGN.md), scoped to this feature.
import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type { ActivityProps, Milestone, Page, PostType, ProjectPost } from '@neo/contracts'
import { useResource } from '../../lib/useResource'
import { message, save } from '../../lib/api'
import { Feedback, Field, Pager } from '../../components/ui/Feedback'
import { POST_TYPES, formatDate, isSubstantive, latestProgress, milestoneTimestamp, postLabel, todayInputValue } from './progress'
import './activity.css'

const PAGE_SIZE = 20

export function ProjectActivity({ projectId, canManage }: ActivityProps) {
  const [postOffset, setPostOffset] = useState(0)
  const [milestoneOffset, setMilestoneOffset] = useState(0)
  const posts = useResource<Page<ProjectPost>>(`/projects/${projectId}/posts?limit=${PAGE_SIZE}&offset=${postOffset}`)
  const milestones = useResource<Page<Milestone>>(`/projects/${projectId}/milestones?limit=${PAGE_SIZE}&offset=${milestoneOffset}`)

  // Both lists arrive newest first, so their first pages hold the latest dates.
  // Remember those pages so the summary stays put while someone reads older entries.
  const [firstPosts, setFirstPosts] = useState<ProjectPost[] | null>(null)
  const [firstMilestones, setFirstMilestones] = useState<Milestone[] | null>(null)
  if (postOffset === 0 && posts.data && posts.data.data !== firstPosts) setFirstPosts(posts.data.data)
  if (milestoneOffset === 0 && milestones.data && milestones.data.data !== firstMilestones) setFirstMilestones(milestones.data.data)
  const summaryReady = firstPosts !== null && firstMilestones !== null
  const latest = summaryReady ? latestProgress(firstPosts, firstMilestones) : null

  const updateCount = posts.data?.pagination.total
  const milestoneCount = milestones.data?.pagination.total

  return <div className="col-main neo-activity act">
    <Ticket
      id={`act-timeline-${projectId}`}
      band="Progress / Timeline"
      bandNote={updateCount === undefined ? undefined : `${updateCount} ${updateCount === 1 ? 'update' : 'updates'}`}
      eyebrow="Dated updates from the team"
      title="Timeline"
    >
      <dl className="act-facts">
        <div>
          <dt>Last progress</dt>
          <dd>{!summaryReady ? 'Checking…' : latest ? <time dateTime={latest}>{formatDate(latest)}</time> : 'No progress update yet'}</dd>
        </div>
        <div><dt>Updates</dt><dd>{updateCount ?? '…'}</dd></div>
        <div><dt>Milestones</dt><dd>{milestoneCount ?? '…'}</dd></div>
      </dl>
      <Feedback loading={posts.loading} error={posts.error} retry={posts.refresh} />
      {posts.data && (posts.data.data.length === 0
        ? <p className="act-empty">No progress update yet.{canManage && ' Publish the first one below so people can see the project moving.'}</p>
        : <ol className="act-timeline" aria-label="Project updates, newest first">
          {posts.data.data.map(post => <li key={post.id} className={isSubstantive(post.type) ? 'act-entry act-counts' : 'act-entry'}>
            <div className="act-entry-meta">
              <span className={`act-type act-type-${post.type}`}>{postLabel(post.type)}</span>
              <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            </div>
            <p className="neo-prose">{post.body}</p>
          </li>)}
        </ol>)}
      {posts.data && <Pager pagination={posts.data.pagination} onPage={setPostOffset} />}
      <p className="act-key">
        <span className="act-key-item"><i className="act-node act-node-filled" aria-hidden="true" />Counts as progress</span>
        <span className="act-key-item"><i className="act-node" aria-hidden="true" />Announcement or opportunity</span>
      </p>
    </Ticket>

    <Ticket
      id={`act-milestones-${projectId}`}
      band="Progress / Milestones"
      bandNote="Founder reported"
      eyebrow="Claims made by the project team"
      title="Milestones"
    >
      <Feedback loading={milestones.loading} error={milestones.error} retry={milestones.refresh} />
      {milestones.data && (milestones.data.data.length === 0
        ? <p className="act-empty">No milestones yet.</p>
        : <ol className="act-timeline" aria-label="Milestones, most recent first">
          {milestones.data.data.map(milestone => <li key={milestone.id} className="act-entry act-counts">
            <div className="act-entry-meta">
              <time dateTime={milestone.achievedAt}>{formatDate(milestone.achievedAt)}</time>
              <span className="act-type act-type-reported">Founder reported</span>
            </div>
            <h3>{milestone.title}</h3>
            <p className="neo-prose">{milestone.description}</p>
            {milestone.evidenceUrl && <a className="act-evidence" href={milestone.evidenceUrl} target="_blank" rel="noopener noreferrer">
              Evidence link<span className="act-sr"> (opens in a new tab)</span>
            </a>}
          </li>)}
        </ol>)}
      {milestones.data && <Pager pagination={milestones.data.pagination} onPage={setMilestoneOffset} />}
      <p className="act-note">Milestones are self-reported by the founder. An evidence link is not independent verification.</p>
    </Ticket>

    {canManage && <>
      <PostForm projectId={projectId} onPublished={() => { setPostOffset(0); posts.refresh() }} />
      <MilestoneForm projectId={projectId} onPublished={() => { setMilestoneOffset(0); milestones.refresh() }} />
    </>}
  </div>
}

function Ticket({ id, band, bandNote, eyebrow, title, children, action }: {
  id: string; band: string; bandNote?: string; eyebrow: string; title: string; children: ReactNode; action?: ReactNode
}) {
  return <section className="act-ticket" aria-labelledby={id}>
    <div className="act-band">
      <span className="act-band-id"><span className="act-badge" aria-hidden="true">U</span>{band}</span>
      {bandNote && <span>{bandNote}</span>}
    </div>
    <div className="act-content">
      <p className="act-eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {children}
    </div>
    {action && <div className="act-action">{action}</div>}
  </section>
}

function PostForm({ projectId, onPublished }: { projectId: string; onPublished: () => void }) {
  const [type, setType] = useState<PostType>('progress')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const formId = `act-post-form-${projectId}`
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('')
    try {
      await save<ProjectPost>(`/projects/${projectId}/posts`, { type, body })
      setBody(''); setNotice(`${postLabel(type)} published.`); onPublished()
    } catch (error) { setError(message(error)) } finally { setBusy(false) }
  }
  return <form id={formId} className="act-form" onSubmit={submit} aria-labelledby={`${formId}-title`}>
    <Ticket id={`${formId}-title`} band="Progress / New update" bandNote="Only you can see this" eyebrow="Owner tools" title="Post an update"
      action={<><button className="act-button" disabled={busy}>{busy ? 'Publishing…' : 'Publish update'}</button>{notice && <p role="status" className="act-notice">{notice}</p>}</>}>
      <div className="neo-form">
        <Field label="Update type">
          <select value={type} onChange={e => setType(e.target.value as PostType)}>
            {POST_TYPES.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </Field>
        <p className="act-help">Progress updates, milestones and roadblocks set the project's last progress date. Announcements and opportunity posts do not.</p>
        <Field label="Update"><textarea required maxLength={5000} value={body} onChange={e => setBody(e.target.value)} /></Field>
        <Feedback error={error} />
      </div>
    </Ticket>
  </form>
}

function MilestoneForm({ projectId, onPublished }: { projectId: string; onPublished: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [achievedOn, setAchievedOn] = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const today = todayInputValue()
  const formId = `act-milestone-form-${projectId}`
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setNotice('')
    if (achievedOn > today) { setError('A milestone must already have happened. Choose today or an earlier date.'); return }
    setBusy(true)
    try {
      await save<Milestone>(`/projects/${projectId}/milestones`, { title, description, achievedAt: milestoneTimestamp(achievedOn), evidenceUrl: evidenceUrl.trim() || null })
      setTitle(''); setDescription(''); setAchievedOn(''); setEvidenceUrl('')
      setNotice('Milestone published.'); onPublished()
    } catch (error) { setError(message(error)) } finally { setBusy(false) }
  }
  return <form id={formId} className="act-form" onSubmit={submit} aria-labelledby={`${formId}-title`}>
    <Ticket id={`${formId}-title`} band="Progress / New milestone" bandNote="Only you can see this" eyebrow="Owner tools" title="Record a milestone"
      action={<><button className="act-button" disabled={busy}>{busy ? 'Publishing…' : 'Publish milestone'}</button>{notice && <p role="status" className="act-notice">{notice}</p>}</>}>
      <div className="neo-form">
        <Field label="Milestone title"><input required maxLength={120} value={title} onChange={e => setTitle(e.target.value)} /></Field>
        <Field label="What happened?"><textarea required maxLength={5000} value={description} onChange={e => setDescription(e.target.value)} /></Field>
        <Field label="Date achieved"><input required type="date" max={today} value={achievedOn} onChange={e => setAchievedOn(e.target.value)} /></Field>
        <Field label="Evidence link (optional)"><input type="url" maxLength={2048} pattern="https?://.*" placeholder="https://" value={evidenceUrl} onChange={e => setEvidenceUrl(e.target.value)} /></Field>
        <p className="act-help">This will be shown as founder reported. A link does not count as independent verification.</p>
        <Feedback error={error} />
      </div>
    </Ticket>
  </form>
}
