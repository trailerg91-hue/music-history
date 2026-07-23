import React, { useState } from 'react';
import styles from './Navbar.module.css';

export default function Navbar({ 
  currentPage, 
  setCurrentPage, 
  user, 
  handleLogout, 
  scrollToSection, 
  folkRef, 
  worldRef, 
  epochRef 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (actionType, ref) => {
    setIsOpen(false);
    if (actionType === 'main') {
      setCurrentPage('main');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (actionType === 'admin') {
      setCurrentPage('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (ref) {
      scrollToSection(ref);
    }
  };

  // ზუსტად იმის მიხედვით, როგორც ბაზაშია: fullName
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.fullName || user.name || '';
  };

  return (
    <nav className={styles.nav}>
      {/* ლოგო */}
      <div className={styles.logo} onClick={() => handleNavClick('main')}>
        მუსიკის ისტორია
      </div>

      {/* დესკტოპ მენიუ */}
      <ul className={styles.menu}>
        <li>
          <button 
            className={currentPage === 'main' ? styles.adminLink : styles.link} 
            onClick={() => handleNavClick('main')}
          >
            მთავარი
          </button>
        </li>
        <li>
          <button 
            className={styles.link} 
            onClick={() => handleNavClick('folk', folkRef)}
          >
            ფოლკლორი
          </button>
        </li>
        <li>
          <button 
            className={styles.link} 
            onClick={() => handleNavClick('instruments', worldRef)}
          >
            საკრავები
          </button>
        </li>
        <li>
          <button 
            className={styles.link} 
            onClick={() => handleNavClick('epochs', epochRef)}
          >
            ეპოქები
          </button>
        </li>
        <li>
          <button 
            className={currentPage === 'admin' ? styles.adminLink : styles.link} 
            onClick={() => handleNavClick('admin')}
          >
            ადმინი
          </button>
        </li>
      </ul>

      {/* ავტორიზაცია / იუზერი დესკტოპისთვის */}
      <div className={styles.authButtons}>
        {user ? (
          <div className={styles.userInfoContainer}>
            <span className={styles.userNameText}>{getUserDisplayName()}</span>
            <button className={styles.authLink} onClick={handleLogout}>
              გასვლა
            </button>
          </div>
        ) : (
          <button className={styles.authLink} onClick={() => setCurrentPage('auth')}>
            შესვლა
          </button>
        )}
      </div>

      {/* მობილური ჰამბურგერის ღილაკი */}
      <button 
        className={styles.hamburgerBtn} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="მენიუს გახსნა"
      >
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
      </button>

      {/* მობილური სლაიდერ მენიუ (Drawer) */}
      <div className={`${styles.drawerOverlay} ${isOpen ? styles.overlayActive : ''}`} onClick={() => setIsOpen(false)}>
        <div className={`${styles.mobileDrawer} ${isOpen ? styles.drawerActive : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className={styles.drawerHeader}>
            <span className={styles.drawerTitle}>მენიუ</span>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className={styles.drawerContent}>
            <ul className={styles.drawerMenu}>
              <li><button className={styles.drawerLink} onClick={() => handleNavClick('main')}>მთავარი</button></li>
              <li><button className={styles.drawerLink} onClick={() => handleNavClick('folk', folkRef)}>ფოლკლორი</button></li>
              <li><button className={styles.drawerLink} onClick={() => handleNavClick('instruments', worldRef)}>საკრავები</button></li>
              <li><button className={styles.drawerLink} onClick={() => handleNavClick('epochs', epochRef)}>ეპოქები</button></li>
              <li><button className={styles.drawerLink} onClick={() => handleNavClick('admin')}>ადმინი</button></li>
            </ul>

            <div className={styles.drawerAuth}>
              {user ? (
                <div className={styles.drawerUserSection}>
                  <span className={styles.drawerUserName}>{getUserDisplayName()}</span>
                  <button className={styles.authLink} onClick={() => { handleLogout(); setIsOpen(false); }} style={{ width: '100%', textAlign: 'center' }}>
                    გასვლა
                  </button>
                </div>
              ) : (
                <button className={styles.authLink} onClick={() => { setCurrentPage('auth'); setIsOpen(false); }} style={{ width: '100%', textAlign: 'center' }}>
                  შესვლა
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}