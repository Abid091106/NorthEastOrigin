// Run: node --test frontend/src/features/activity/activity.test.mjs  (Node >= 22.18; imports .ts via type stripping)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { POST_TYPES, formatDate, isSubstantive, latestProgress, milestoneTimestamp, postLabel, todayInputValue } from './progress.ts';

const post = (type, createdAt) => ({ type, createdAt });

test('every canonical post type has a readable label, in contract order', () => {
  assert.deepEqual(POST_TYPES.map(t => t.value), ['progress', 'milestone', 'roadblock', 'opportunity', 'announcement']);
  assert.equal(postLabel('progress'), 'Progress update');
  assert.equal(postLabel('announcement'), 'Announcement');
});

test('only progress, milestone and roadblock posts count as progress', () => {
  assert.deepEqual(POST_TYPES.map(t => isSubstantive(t.value)), [true, true, true, false, false]);
});

test('no history gives no date, so a new idea is never called dormant', () => {
  assert.equal(latestProgress([], []), null);
  assert.equal(latestProgress([post('announcement', '2026-11-01T10:00:00Z'), post('opportunity', '2026-11-02T10:00:00Z')], []), null);
});

test('latest progress uses the same rule as discovery', () => {
  const posts = [
    post('announcement', '2026-11-03T09:00:00Z'),
    post('roadblock', '2026-10-20T09:00:00Z'),
    post('progress', '2026-10-01T09:00:00Z'),
  ];
  assert.equal(latestProgress(posts, []), '2026-10-20T09:00:00Z');
  assert.equal(latestProgress(posts, [{ achievedAt: '2026-10-28T12:00:00Z' }]), '2026-10-28T12:00:00Z');
  assert.equal(latestProgress([], [{ achievedAt: '2026-09-01T12:00:00Z' }]), '2026-09-01T12:00:00Z');
});

test('invalid dates are ignored and never displayed as dates', () => {
  assert.equal(latestProgress([post('progress', 'not a date')], []), null);
  assert.equal(formatDate('not a date'), 'Unknown date');
  assert.equal(formatDate('2026-11-04T12:00:00Z'), '4 Nov 2026');
});

test('milestone dates keep the chosen calendar day', () => {
  assert.equal(milestoneTimestamp('2026-11-04'), '2026-11-04T12:00:00.000Z');
  assert.equal(todayInputValue(new Date(2026, 10, 4, 23, 30)), '2026-11-04');
});

// S-02 activity labels
import { activityLabel, daysSince } from './labels.ts';

const NOW = new Date('2026-11-04T12:00:00Z');
const label = (lastSubstantiveUpdateAt, status = 'active') => activityLabel({ status, lastSubstantiveUpdateAt }, NOW).label;
const daysAgo = n => new Date(NOW.getTime() - n * 86_400_000).toISOString();

test('recently active up to and including 14 days', () => {
  assert.equal(label(daysAgo(0)), 'Recently active');
  assert.equal(label(daysAgo(14)), 'Recently active');
});

test('quiet from 15 to 30 days', () => {
  assert.equal(label(daysAgo(15)), 'Quiet');
  assert.equal(label(daysAgo(30)), 'Quiet');
});

test('dormant after 30 days', () => {
  assert.equal(label(daysAgo(31)), 'Dormant');
  assert.equal(label(daysAgo(400)), 'Dormant');
});

test('no history is a new idea, never dormant', () => {
  assert.equal(label(null), 'New idea');
  assert.equal(label('not a date'), 'New idea');
});

test('paused and completed replace the recency label', () => {
  assert.equal(label(daysAgo(2), 'paused'), 'Paused');
  assert.equal(label(null, 'completed'), 'Completed');
  assert.equal(label(daysAgo(90), 'completed'), 'Completed');
});

test('a missing status falls back to recency', () => {
  assert.equal(activityLabel({ lastSubstantiveUpdateAt: daysAgo(3) }, NOW).kind, 'recent');
});

test('a date slightly in the future counts as today, not negative days', () => {
  assert.equal(daysSince('2026-11-05T00:00:00Z', NOW), 0);
  assert.equal(label('2026-11-05T00:00:00Z'), 'Recently active');
});
