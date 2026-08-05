import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import ThemeToggle from '../ThemeToggle/ThemeToggle.jsx';
import styles from './Navbar.module.css';

export default function Navbar({
  currentPage,
  setCurrentPage,
  user,
  handleLogout,
  scrollToSection,
  folkRef,
  worldRef,
  epochRef,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const { t, lang, setLang } = useLanguage();
  const accountRef = useRef(null);
  const refs = useMemo(() => ({ folkRef, worldRef, epochRef }), [folkRef, worldRef, epochRef]);

  const displayName = user?.fullName || user?.name || '';
  const accountLabel = lang === 'en' ? 'Account' : 'ანგარიში';
  const navLabel = lang === 'en' ? 'Navigation' : 'ნავიგაცია';
  const signInLabel = lang === 'en' ? 'Sign in' : 'შესვლა';

  const sectionLinks = [
    { label: t.navbar.folk, type: 'folk', refKey: 'folkRef' },
    { label: t.navbar.instruments, type: 'instruments', refKey: 'worldRef' },
    { label: t.navbar.epochs, type: 'epochs', refKey: 'epochRef' },
  ];

  const isSectionActive = (type) => currentPage === 'main' && activeSection === type;
  const isAdminPage = currentPage === 'admin' || currentPage === 'auth';

  const navigate = (type, ref) => {
    setIsOpen(false);
    setAccountOpen(false);
    if (type === 'admin' && !user) {
      localStorage.setItem('currentPage', 'admin');
      setCurrentPage('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (type === 'main' || type === 'admin') {
      setCurrentPage(type);
      setActiveSection(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (ref) {
      scrollToSection(ref);
      setActiveSection(type);
    }
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

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setIsCompact(y > 56);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isOpen) setAccountOpen(false);
  }, [isOpen]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!accountRef.current?.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, []);

  useEffect(() => {
    if (currentPage !== 'main') {
      setActiveSection(null);
      return undefined;
    }

    const entries = [
      { type: 'folk', el: folkRef?.current },
      { type: 'instruments', el: worldRef?.current },
      { type: 'epochs', el: epochRef?.current },
    ].filter((item) => item.el);

    if (!entries.length) return undefined;

    const observer = new IntersectionObserver(
      (observed) => {
        const visible = observed
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const match = entries.find((item) => item.el === visible.target);
        if (match) setActiveSection(match.type);
      },
      { rootMargin: '-28% 0px -48% 0px', threshold: [0.12, 0.28, 0.45] }
    );

    entries.forEach(({ el }) => observer.observe(el));
    return () => observer.disconnect();
  }, [currentPage, folkRef, worldRef, epochRef]);

  const avatarLetter = (displayName || accountLabel).slice(0, 1).toUpperCase();

  return (
    <nav className={`${styles.nav} ${isCompact ? styles.navCompact : ''}`}>
      <div className={styles.navShell}>
        <button type="button" className={styles.logoWrap} onClick={() => navigate('main')}>
          <img className={styles.logoImage} src="/images/logo-m.png" alt="" aria-hidden="true" />
          <span className={styles.logo}>{t.navbar.logo}</span>
        </button>

        <ul className={styles.menu}>
          {sectionLinks.map(({ label, type, refKey }) => (
            <li key={type} className={styles.menuItem}>
              <button
                type="button"
                className={`${styles.link} ${isSectionActive(type) ? styles.linkActive : ''}`}
                onClick={() => navigate(type, refs[refKey])}
              >
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.authButtons}>
          <div className={styles.themeWrap}>
            <ThemeToggle />
          </div>
          <LanguageSwitch />

          <div className={styles.accountWrap} ref={accountRef}>
            <button
              type="button"
              className={`${styles.accountBtn} ${accountOpen ? styles.accountBtnOpen : ''} ${isAdminPage ? styles.accountBtnActive : ''}`}
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              onClick={() => setAccountOpen((v) => !v)}
            >
              <span className={styles.avatar}>{avatarLetter}</span>
              <span className={styles.accountBtnLabel}>{user ? displayName : accountLabel}</span>
            </button>

            {accountOpen ? (
              <div className={styles.accountMenu} role="menu">
                {user ? (
                  <div className={styles.accountMenuHead}>
                    <span className={styles.userLabel}>{accountLabel}</span>
                    <span className={styles.userNameText}>{displayName}</span>
                  </div>
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  className={`${styles.accountMenuItem} ${currentPage === 'admin' ? styles.accountMenuItemActive : ''}`}
                  onClick={() => navigate('admin')}
                >
                  {t.navbar.admin}
                </button>
                {user ? (
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.accountMenuItem}
                    onClick={() => {
                      handleLogout();
                      setAccountOpen(false);
                    }}
                  >
                    {t.navbar.logout}
                  </button>
                ) : (
                  <button type="button" role="menuitem" className={styles.accountMenuItem} onClick={() => navigate('admin')}>
                    {signInLabel}
                  </button>
                )}
              </div>
            ) : null}
          </div>
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
            <div className={styles.drawerControls}>
              <ThemeToggle style={{ flexShrink: 0 }} />
              <LanguageSwitch drawer />
            </div>
            <ul className={styles.drawerMenu}>
              <li>
                <button
                  type="button"
                  className={`${styles.drawerLink} ${currentPage === 'main' && !activeSection ? styles.drawerLinkActive : ''}`}
                  onClick={() => navigate('main')}
                >
                  <span>{t.navbar.main}</span>
                  <span className={styles.drawerLinkDot} aria-hidden="true" />
                </button>
              </li>
              {sectionLinks.map(({ label, type, refKey }) => (
                <li key={type}>
                  <button
                    type="button"
                    className={`${styles.drawerLink} ${isSectionActive(type) ? styles.drawerLinkActive : ''}`}
                    onClick={() => navigate(type, refs[refKey])}
                  >
                    <span>{label}</span>
                    <span className={styles.drawerLinkDot} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.drawerAuth}>
              {user ? (
                <div className={styles.drawerUserSection}>
                  <div className={styles.drawerUserMeta}>
                    <span className={styles.drawerUserLabel}>{accountLabel}</span>
                    <span className={styles.drawerUserName}>{displayName}</span>
                  </div>
                  <button type="button" className={`${styles.authLink} ${styles.drawerAuthLink}`} onClick={() => navigate('admin')}>
                    {t.navbar.admin}
                  </button>
                  <button
                    type="button"
                    className={`${styles.authLink} ${styles.drawerAuthLink}`}
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                  >
                    {t.navbar.logout}
                  </button>
                </div>
              ) : (
                <button type="button" className={`${styles.authLink} ${styles.drawerAuthLink}`} onClick={() => navigate('admin')}>
                  {t.navbar.admin}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
