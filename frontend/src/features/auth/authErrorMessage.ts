/** Provider limits are not resolved by retrying or changing the email address. */
export function authErrorMessage(error: unknown, fallback: string): string {
  const details = error as { code?: string; status?: number } | null
  if (details?.code === 'over_email_send_rate_limit') {
    return 'Signup confirmation emails are temporarily unavailable because the service has reached its email sending limit. Trying another email address will not help. Please try later, or sign in if you already have an account.'
  }
  if (details?.status === 429 || details?.code === 'over_request_rate_limit') {
    return 'Too many sign-in or signup attempts. Please wait before trying again.'
  }
  return fallback
}
