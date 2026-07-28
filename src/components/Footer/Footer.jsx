import styles from './Footer.module.css';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className={styles.footer}>
      <div className={styles.info}>
        <p className={styles.text}>📧 {t.footer.email}: <span className={styles.highlight}>info@historyofmusic.ge</span></p>
        <p className={styles.text}>📞 {t.footer.phone}: <span className={styles.highlight}>+995 5XX XX XX XX</span></p>
        <p className={styles.text}>📍 {t.footer.address}: <span className={styles.highlight}>{t.footer.addressValue}</span></p>
      </div>
      <p className={styles.copyright}>&copy; {new Date().getFullYear()} History of Music. {t.footer.copyright}</p>
    </footer>
  );
}
