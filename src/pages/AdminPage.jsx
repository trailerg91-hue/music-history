import AdminPanel from '../components/AdminPanel/AdminPanel.jsx';
import styles from '../App.module.css';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function AdminPage({ isAdmin, setCurrentPage }) {
  const { t } = useLanguage();
  return (
    <div className={styles.container}>
      {isAdmin ? (
        <AdminPanel setCurrentPage={setCurrentPage} />
      ) : (
        <div style={{ textAlign: 'center', marginTop: 100, color: '#fff', padding: 20 }}>
          <h2>{t.adminPage.deniedTitle}</h2>
          <p style={{ margin: '15px 0', color: '#aaa' }}>{t.adminPage.deniedText}</p>
          <button
            type="button"
            onClick={() => setCurrentPage('main')}
            style={{ padding: '10px 20px', background: '#d97706', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer' }}
          >
            {t.adminPage.back}
          </button>
        </div>
      )}
    </div>
  );
}
