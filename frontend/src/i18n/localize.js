export function pickLocalized(value, lang = 'ka', fallbackLang = 'ka') {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return String(value);
  return value[lang] || value[fallbackLang] || Object.values(value).find(Boolean) || '';
}

export function withLangHeader(headers = {}) {
  const lang = localStorage.getItem('lang') || 'ka';
  return { ...headers, 'X-Lang': lang };
}
