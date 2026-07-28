const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const SYMBOL_RE = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;
const DIGIT_RE = /\d/;

// Common disposable / fake providers — block at registration
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

export function validatePassword(password) {
  const value = String(password || '');

  if (value.length < 6 || value.length > 10) {
    return { ok: false, message: 'პაროლი უნდა იყოს 6-დან 10 სიმბოლომდე' };
  }
  if (!DIGIT_RE.test(value)) {
    return { ok: false, message: 'პაროლში უნდა იყოს მინიმუმ 1 ციფრი' };
  }
  if (!SYMBOL_RE.test(value)) {
    return { ok: false, message: 'პაროლში უნდა იყოს მინიმუმ 1 სიმბოლო (!@#$...)' };
  }

  return { ok: true };
}

export function validateFullName(fullName) {
  const value = String(fullName || '').trim();
  if (value.length < 2) return { ok: false, message: 'სახელი ძალიან მოკლეა' };
  if (value.length > 80) return { ok: false, message: 'სახელი ძალიან გრძელია' };
  return { ok: true, fullName: value };
}
