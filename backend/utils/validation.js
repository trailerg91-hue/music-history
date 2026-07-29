const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const BLOCKED_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  '10minutemail.com',
  'tempmail.com',
  'temp-mail.org',
  'throwawaymail.com',
  'yopmail.com',
  'trashmail.com',
  'fakeinbox.com',
  'getnada.com',
]);

export function validateEmail(email) {
  const value = String(email || '').trim().toLowerCase();
  if (!value) return { ok: false, message: 'ელ-ფოსტა სავალდებულოა' };
  if (!EMAIL_RE.test(value)) return { ok: false, message: 'ელ-ფოსტის ფორმატი არასწორია' };

  const domain = value.split('@')[1];
  if (!domain || BLOCKED_EMAIL_DOMAINS.has(domain)) {
    return { ok: false, message: 'გთხოვთ გამოიყენოთ რეალური ელ-ფოსტა' };
  }

  return { ok: true, email: value };
}
