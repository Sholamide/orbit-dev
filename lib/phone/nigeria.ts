/** Nigerian mobile numbers: E.164 +234 + 10-digit national (no leading 0). */

const NON_DIGITS = /\D/g;

/**
 * Reduces user input to at most 10 national digits.
 * Accepts local (0XXXXXXXXXX), international (234XXXXXXXXXX), or national (XXXXXXXXXX).
 */
export function sanitizeNationalDigitsInput(raw: string): string {
  let d = raw.replace(NON_DIGITS, '');
  if (!d) return '';

  if (d.startsWith('234')) {
    return d.slice(3, 13);
  }
  if (d.startsWith('0')) {
    return d.slice(1).slice(0, 10);
  }
  return d.slice(0, 10);
}

/** Nigerian mobile: first digit of national number is 7, 8, or 9. */
function isValidNigerianMobileNational(national10: string): boolean {
  return national10.length === 10 && /^[789]/.test(national10);
}

/**
 * Returns E.164 string +234XXXXXXXXXX or null if invalid.
 */
export function toNigeriaE164(input: string): string | null {
  const national = sanitizeNationalDigitsInput(input);
  if (!isValidNigerianMobileNational(national)) return null;
  return `+234${national}`;
}

/**
 * Recovers E.164 after navigation when "+" was stripped or turned into a space.
 */
export function normalizePhoneFromRouteParam(raw: string | undefined): string | null {
  if (raw == null || raw === '') return null;
  let s: string;
  try {
    s = decodeURIComponent(String(raw).trim());
  } catch {
    s = String(raw).trim();
  }
  const digits = s.replace(NON_DIGITS, '');
  if (digits.startsWith('234') && digits.length === 13) {
    return `+${digits}`;
  }
  if (s.startsWith('+')) {
    const compact = s.replace(/\s/g, '');
    if (/^\+[1-9]\d{6,14}$/.test(compact)) return compact;
  }
  return toNigeriaE164(s) ?? toNigeriaE164(digits);
}

/** Formats 10 national digits as "901 900 8187" (3-3-4). */
export function formatNigeriaNationalForDisplay(digits: string): string {
  const d = sanitizeNationalDigitsInput(digits);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

/** Pretty-print E.164 for UI, e.g. +234 901 900 8187 */
export function formatNigeriaE164ForDisplay(e164: string): string {
  const d = e164.replace(NON_DIGITS, '');
  if (d.startsWith('234') && d.length === 13) {
    return `+234 ${formatNigeriaNationalForDisplay(d.slice(3))}`;
  }
  if (e164.trim().startsWith('+')) {
    return e164.trim();
  }
  if (d.length === 13 && d.startsWith('234')) {
    return `+234 ${formatNigeriaNationalForDisplay(d.slice(3))}`;
  }
  return e164.trim();
}
