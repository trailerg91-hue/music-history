import { createContext, useContext, useMemo, useState } from 'react';
import { messages } from './messages.js';

const Ctx = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ka');
  const changeLanguage = (next) => {
    localStorage.setItem('lang', next);
    setLang(next);
  };

  const value = useMemo(() => ({
    lang,
    setLang: changeLanguage,
    t: messages[lang] || messages.ka,
    isEnglish: lang === 'en',
  }), [lang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLanguage = () => useContext(Ctx);
