/** Maps Supabase / Twilio SMS errors to actionable copy for developers. */
export function describeOtpSmsError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('from') && (m.includes('invalid') || m.includes('not'))) {
    return [
      'This usually means your Twilio sender (the "From" number or Messaging Service SID) in Supabase is wrong, or Twilio is not allowed to send to Nigeria with that sender.',
      '',
      'Fix: Supabase Dashboard → Authentication → Providers → Phone → check Twilio credentials, Messaging Service SID, and Twilio console → Geo permissions / SMS for Nigeria.',
      '',
      `Details: ${message}`,
    ].join('\n');
  }
  if (m.includes('invalid') && m.includes('phone')) {
    return [
      'The phone number was rejected. Enter a full Nigerian mobile (10 digits after +234, starting with 7, 8, or 9).',
      '',
      `Details: ${message}`,
    ].join('\n');
  }
  return message;
}
