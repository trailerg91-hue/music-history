import Auth from '../components/Auth/Auth.jsx';
import styles from '../App.module.css';

export default function AuthPage({ setCurrentPage }) {
  return (
    <div className={styles.container}>
      <div className={styles.authSection}>
        <Auth setCurrentPage={setCurrentPage} />
      </div>
    </div>
  );
}
