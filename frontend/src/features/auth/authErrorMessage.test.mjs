import assert from 'node:assert/strict'
import test from 'node:test'
import { authErrorMessage } from './authErrorMessage.ts'
test('email sending quota explains shared limit without suggesting another address', () => {
  const result = authErrorMessage({ code: 'over_email_send_rate_limit', status: 429 }, 'raw')
  assert.match(result, /email sending limit/)
  assert.match(result, /another email address will not help/)
})
test('request throttling and unrelated errors remain distinct', () => {
  assert.match(authErrorMessage({ status: 429 }, 'raw'), /wait/)
  assert.equal(authErrorMessage(new Error('Invalid login credentials'), 'Invalid login credentials'), 'Invalid login credentials')
  assert.equal(authErrorMessage(null, 'Unknown error'), 'Unknown error')
})
