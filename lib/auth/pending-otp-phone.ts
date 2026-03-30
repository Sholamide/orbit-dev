/**
 * Holds E.164 phone between phone-login and verify-otp so the "+" is not lost
 * when Expo Router serializes query params ("+" often becomes a space).
 */
let pendingE164: string | null = null;

export function setPendingOtpPhone(e164: string) {
  pendingE164 = e164;
}

export function getPendingOtpPhone(): string | null {
  return pendingE164;
}

export function clearPendingOtpPhone() {
  pendingE164 = null;
}
