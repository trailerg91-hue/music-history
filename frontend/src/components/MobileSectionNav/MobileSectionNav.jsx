import styles from './MobileSectionNav.module.css';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

export default function MobileSectionNav({ folkRef, instrumentsRef, epochRef, onNavigate }) {
  const { t } = useLanguage();
  const refs = { folkRef, instrumentsRef, epochRef };
  const items = [
    { key: 'folk', label: t.navbar.folk, refKey: 'folkRef' },
    { key: 'instruments', label: t.navbar.instruments, refKey: 'instrumentsRef' },
    { key: 'epochs', label: t.navbar.epochs, refKey: 'epochRef' },
  ];
  return (
    <nav className={styles.nav} aria-label={t.navbar.menu}>
      {items.map(({ key, label, refKey }) => (
        <button key={key} type="button" className={styles.item} onClick={() => { onNavigate?.(); refs[refKey]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
          <span className={styles.dot} aria-hidden="true" />{label}
        </button>
      ))}
    </nav>
  );
}
