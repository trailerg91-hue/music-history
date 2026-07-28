const SYMBOL_RE = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;
const DIGIT_RE = /\d/;

const text = {
  ka: {
    hint: 'პაროლი: 6-10 სიმბოლო, მინიმუმ 1 ციფრი და 1 სიმბოლო (!@#$)',
    length: 'პაროლი უნდა იყოს 6-დან 10 სიმბოლომდე',
    digit: 'პაროლში უნდა იყოს მინიმუმ 1 ციფრი',
    symbol: 'პაროლში უნდა იყოს მინიმუმ 1 სიმბოლო (!@#$...)',
  },
  en: {
    hint: 'Password: 6-10 characters, at least 1 digit and 1 symbol (!@#$)',
    length: 'Password must be between 6 and 10 characters',
    digit: 'Password must contain at least 1 digit',
    symbol: 'Password must contain at least 1 symbol (!@#$...)',
  },
};

const copy = (lang = 'ka') => (lang === 'en' ? text.en : text.ka);

export function getPasswordHint(lang = 'ka') {
  return copy(lang).hint;
}

export function validatePasswordClient(password, lang = 'ka') {
  const value = String(password || '');
  const t = copy(lang);

  if (value.length < 6 || value.length > 10) {
    return t.length;
  }
  if (!DIGIT_RE.test(value)) {
    return t.digit;
  }
  if (!SYMBOL_RE.test(value)) {
    return t.symbol;
  }
  return null;
}
