const SYMBOL_RE = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;
const DIGIT_RE = /\d/;

export const PASSWORD_HINT =
  'პაროლი: 6–10 სიმბოლო, მინიმუმ 1 ციფრი და 1 სიმბოლო (!@#$)';

export function validatePasswordClient(password) {
  const value = String(password || '');

  if (value.length < 6 || value.length > 10) {
    return 'პაროლი უნდა იყოს 6-დან 10 სიმბოლომდე';
  }
  if (!DIGIT_RE.test(value)) {
    return 'პაროლში უნდა იყოს მინიმუმ 1 ციფრი';
  }
  if (!SYMBOL_RE.test(value)) {
    return 'პაროლში უნდა იყოს მინიმუმ 1 სიმბოლო (!@#$...)';
  }
  return null;
}
