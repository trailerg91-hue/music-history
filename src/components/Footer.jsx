import React from 'react';
import styles from './Footer.module.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.info}>
        <p className={styles.text}>
          📧 ელ-ფოსტა: <span className={styles.highlight}>info@historyofmusic.ge</span>
        </p>
        <p className={styles.text}>
          📞 ტელეფონი: <span className={styles.highlight}>+995 5XX XX XX XX</span>
        </p>
        <p className={styles.text}>
          📍 მისამართი: <span className={styles.highlight}>თბილისი, საქართველო</span>
        </p>
      </div>
      <p className={styles.copyright}>
        &copy; {currentYear} History of Music. ყველა უფლება დაცულია. კავშირი ადმინისტრაციასთან.
      </p>
    </footer>
  );
}

export default Footer;