import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import ThemeToggle from '../ThemeToggle/ThemeToggle.jsx';
import styles from './Navbar.module.css';

export default function Navbar({ currentPage, setCurrentPage, user, handleLogout, scrollToSection, folkRef, worldRef, epochRef }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const { t, lang, setLang } = useLanguage();
  const refs = useMemo(() => ({ folkRef, worldRef, epochRef }), [folkRef, worldRef, epochRef]);
  const lastScrollY = useRef(0);
  const displayName = user?.fullName || user?.name || '';
  const accountLabel = lang === 'en' ? 'Account' : 'ანგარიში';
  const navLabel = lang === 'en' ? 'Navigation' : 'ნავიგაცია';
  const links = [
    { label: t.navbar.main, type: 'main' },
    { label: t.navbar.folk, type: 'folk', refKey: 'folkRef' },
    { label: t.navbar.instruments, type: 'instruments', refKey: 'worldRef' },
    { label: t.navbar.epochs, type: 'epochs', refKey: 'epochRef' },
    { label: t.navbar.admin, type: 'admin' },
  ];

  const isActive = (type) => currentPage === type;

  const navigate = (type, ref) => {
    setIsOpen(false);
    setIsHidden(false);
    if (type === 'admin' && !user) {
      localStorage.setItem('currentPage', 'admin');
      setCurrentPage('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (type === 'main' || type === 'admin') {
      setCurrentPage(type);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (ref) scrollToSection(ref);
  };

  const LanguageSwitch = ({ drawer = false }) => (
    <div className={drawer ? styles.drawerLang : styles.langSwitch} aria-label="Language switch">
      {['ka', 'en'].map((code) => (
        <button
          key={code}
          type="button"
          className={`${styles.langBtn} ${lang === code ? styles.langBtnActive : ''}`}
          onClick={() => setLang(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );

  const AuthBlock = ({ drawer = false }) =>
    user ? (
      <div className={drawer ? styles.drawerUserSection : styles.userInfoContainer}>
        <div className={drawer ? styles.drawerUserMeta : styles.userMeta}>
          <span className={drawer ? styles.drawerUserLabel : styles.userLabel}>{accountLabel}</span>
          <span className={drawer ? styles.drawerUserName : styles.userNameText}>{displayName}</span>
        </div>
        <button
          type="button"
          className={`${styles.authLink} ${drawer ? styles.drawerAuthLink : ''}`}
          onClick={() => {
            handleLogout();
            if (drawer) setIsOpen(false);
          }}
        >
          {t.navbar.logout}
        </button>
      </div>
    ) : null;

  useEffect(() => {
    lastScrollY.current = window.scrollY || 0;

    const onScroll = () => {
      const currentY = window.scrollY || 0;
      const delta = currentY - lastScrollY.current;

      if (currentY < 96) {
        setIsHidden(false);
        lastScrollY.current = currentY;
        return;
      }

      if (Math.abs(delta) < 12) return;

      if (delta > 0 && currentY > 140) setIsHidden(true);
      if (delta < 0) setIsHidden(false);

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isOpen) setIsHidden(false);
  }, [isOpen]);

  return (
    <nav className={`${styles.nav} ${isHidden && !isOpen ? styles.navHidden : ''}`}>
      <div className={styles.navShell}>
        <button type="button" className={styles.logoWrap} onClick={() => navigate('main')}>
          <img className={styles.logoImage} src="/images/logo-m.png" alt="" aria-hidden="true" />
          <span className={styles.logo}>{t.navbar.logo}</span>
        </button>

        <ul className={styles.menu}>
          {links.map(({ label, type, refKey }) => (
            <li key={type} className={styles.menuItem}>
              <button
                type="button"
                className={`${styles.link} ${isActive(type) ? styles.linkActive : ''}`}
                onClick={() => navigate(type, refKey ? refs[refKey] : null)}
              >
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.authButtons}>
          <ThemeToggle />
          <LanguageSwitch />
          <AuthBlock />
        </div>
      </div>

      <button
        type="button"
        className={`${styles.hamburgerBtn} ${isOpen ? styles.hamburgerBtnActive : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t.navbar.openMenu}
        aria-expanded={isOpen}
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>

      <div className={`${styles.drawerOverlay} ${isOpen ? styles.overlayActive : ''}`} onClick={() => setIsOpen(false)}>
        <div className={`${styles.mobileDrawer} ${isOpen ? styles.drawerActive : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className={styles.drawerHeader}>
            <div>
              <span className={styles.drawerEyebrow}>{navLabel}</span>
              <span className={styles.drawerTitle}>{t.navbar.menu}</span>
            </div>
          </div>
          <div className={styles.drawerContent}>
            <LanguageSwitch drawer />
            <ul className={styles.drawerMenu}>
              {links.map(({ label, type, refKey }) => (
                <li key={type}>
                  <button
                    type="button"
                    className={`${styles.drawerLink} ${isActive(type) ? styles.drawerLinkActive : ''}`}
                    onClick={() => navigate(type, refKey ? refs[refKey] : null)}
                  >
                    <span>{label}</span>
                    <span className={styles.drawerLinkDot} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.drawerAuth}><AuthBlock drawer /></div>
          </div>
        </div>
      </div>
    </nav>
  );
}
