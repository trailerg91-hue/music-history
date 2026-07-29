import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import styles from './ThemeToggle.module.css';

const ThemeContext = createContext({ theme: 'dark', toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export default function ThemeToggle({ style }) {
  const { theme, toggle } = useTheme();
  const isLight = theme === 'light';
  return (
    <label
      className={styles.switch}
      style={style}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <input type="checkbox" role="switch" checked={!isLight} onChange={toggle} />
      <span className={styles.slider}>
        <span className={styles.circle}>
          <span className={`${styles.shine} ${styles.shine1}`} />
          <span className={`${styles.shine} ${styles.shine2}`} />
          <span className={`${styles.shine} ${styles.shine3}`} />
          <span className={`${styles.shine} ${styles.shine4}`} />
          <span className={`${styles.shine} ${styles.shine5}`} />
          <span className={`${styles.shine} ${styles.shine6}`} />
          <span className={`${styles.shine} ${styles.shine7}`} />
          <span className={`${styles.shine} ${styles.shine8}`} />
          <span className={styles.moon} />
        </span>
      </span>
    </label>
  );
}
