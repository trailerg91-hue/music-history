import { useState } from 'react';
import styles from './Navbar.module.css';

const LINKS = [
  { label: 'მთავარი', type: 'main' },
  { label: 'ფოლკლორი', type: 'folk', refKey: 'folkRef' },
  { label: 'საკრავები', type: 'instruments', refKey: 'worldRef' },
  { label: 'ეპოქები', type: 'epochs', refKey: 'epochRef' },
  { label: 'ადმინი', type: 'admin' },
];

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
  const refs = { folkRef, worldRef, epochRef };
  const displayName = user?.fullName || user?.name || '';

  const navigate = (type, ref) => {
    setIsOpen(false);
    if (type === 'main' || type === 'admin') {
      setCurrentPage(type);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (ref) {
      scrollToSection(ref);
    }
  };

  const linkClass = (type) =>
    type === 'main' || type === 'admin'
      ? currentPage === type
        ? styles.adminLink
        : styles.link
      : styles.link;

  const AuthBlock = ({ drawer }) =>
    user ? (
      <div className={drawer ? styles.drawerUserSection : styles.userInfoContainer}>
        <span className={drawer ? styles.drawerUserName : styles.userNameText}>{displayName}</span>
        <button
          className={styles.authLink}
          style={drawer ? { width: '100%', textAlign: 'center' } : undefined}
          onClick={() => {
            handleLogout();
            if (drawer) setIsOpen(false);
          }}
        >
          გასვლა
        </button>
      </div>
    ) : (
      <button
        className={styles.authLink}
        style={drawer ? { width: '100%', textAlign: 'center' } : undefined}
        onClick={() => {
          setCurrentPage('auth');
          if (drawer) setIsOpen(false);
        }}
      >
        შესვლა
      </button>
    );

  return (
    <nav className={styles.nav}>
      <div className={styles.logo} onClick={() => navigate('main')}>
        მუსიკის ისტორია
      </div>

      <ul className={styles.menu}>
        {LINKS.map(({ label, type, refKey }) => (
          <li key={type}>
            <button
              className={linkClass(type)}
              onClick={() => navigate(type, refKey ? refs[refKey] : null)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.authButtons}>
        <AuthBlock />
      </div>

      <button
        className={styles.hamburgerBtn}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="მენიუს გახსნა"
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>

      <div
        className={`${styles.drawerOverlay} ${isOpen ? styles.overlayActive : ''}`}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={`${styles.mobileDrawer} ${isOpen ? styles.drawerActive : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.drawerHeader}>
            <span className={styles.drawerTitle}>მენიუ</span>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>
          <div className={styles.drawerContent}>
            <ul className={styles.drawerMenu}>
              {LINKS.map(({ label, type, refKey }) => (
                <li key={type}>
                  <button
                    className={styles.drawerLink}
                    onClick={() => navigate(type, refKey ? refs[refKey] : null)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.drawerAuth}>
              <AuthBlock drawer />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
