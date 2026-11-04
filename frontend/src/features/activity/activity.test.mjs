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
