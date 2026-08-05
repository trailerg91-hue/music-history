import styles from '../App.module.css';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function LoadingScreen() {
  const { t } = useLanguage();
  return (
    <div className={styles.container} style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <p style={{ color: '#f59e0b' }}>{t.common.loading}</p>
    </div>
  );
}
