import assert from 'node:assert/strict'
import test from 'node:test'
import { parseProfilePatch, toProfile } from './profile.js'

test('legacy and incomplete subscriptions remain member accounts', () => {
  for (const metadata of [{}, { account_type: 'investor' }, { account_type: 'member', investor_subscription: 'fictional_599_monthly' }]) {
    const profile = toProfile({}, metadata)
    assert.equal(profile.accountType, 'member')
    assert.equal(profile.investorSubscription, null)
  }
})
test('investor demo account survives profile serialization', () => {
  const profile = toProfile({ id: 'user' }, { account_type: 'investor', investor_subscription: 'fictional_599_monthly' })
  assert.equal(profile.accountType, 'investor')
  assert.equal(profile.investorSubscription, 'fictional_599_monthly')
})
test('profile edits cannot change account type or subscription', () => {
  for (const field of ['accountType', 'investorSubscription']) {
    assert.throws(() => parseProfilePatch({ [field]: 'investor' }), /Check your profile details/)
  }
  assert.deepEqual(parseProfilePatch({ displayName: ' Investor ' }), { displayName: 'Investor' })
})
