import { useEffect } from 'react';
import CustomAudioPlayer from '../CustomAudioPlayer/CustomAudioPlayer.jsx';
import styles from './InstrumentDetail.module.css';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { pickLocalized } from '../../i18n/localize.js';

export default function InstrumentDetail({ instrument, onClose, favorited, onToggleFavorite }) {
  const { t, lang } = useLanguage();

  useEffect(() => {
    if (!instrument) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [instrument, onClose]);

  if (!instrument) return null;

  const name = pickLocalized(instrument.name, lang);
  const type = pickLocalized(instrument.type, lang);
  const category = pickLocalized(instrument.categoryLabel || instrument.category, lang);
  const description = pickLocalized(instrument.description, lang);
  const imageUrl = instrument.imageUrl || '';
  const audioSrc = instrument.audioUrl || instrument.audio || '';

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={name}>
        <div className={styles.sheetHandle} aria-hidden="true" />
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t.common.close}>&times;</button>
        <div className={styles.hero}>
          {imageUrl ? <img src={imageUrl} alt={name} className={styles.heroImage} /> : <div className={styles.heroFallback} />}
          <div className={styles.heroGradient} />
          <div className={styles.heroText}>
            <div className={styles.chips}>{type ? <span className={styles.chip}>{type}</span> : null}</div>
            <h2 className={styles.title}>{name}</h2>
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.copyCol}>
            {category ? <p className={styles.category}>{category}</p> : null}
            <p className={styles.description}>{description}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className={`${styles.favBtn} ${favorited ? styles.favActive : ''}`} onClick={(e) => onToggleFavorite?.(e)}>
                {favorited ? t.instruments.favoriteAdded : t.instruments.favoriteAddBtn}
              </button>
              <button type="button" className={styles.shareBtn} onClick={() => {
                const url = window.location.href;
                const text = `${name} — ${t.navbar.logo}`;
                if (navigator.share) navigator.share({ title: text, url }).catch(() => {});
                else { navigator.clipboard?.writeText(url); }
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </button>
            </div>
          </div>
          <div className={styles.playerCol}>
            {audioSrc ? (
              <div className={styles.playerPanel}>
                <p className={styles.playerLabel}>{t.common.listen}</p>
                <CustomAudioPlayer src={audioSrc} title={name} />
              </div>
            ) : (
              <div className={styles.playerEmpty}>
                <span className={styles.playerEmptyIcon}>♪</span>
                <p>{t.common.soonAudio}</p>
                <p className={styles.playerEmptyHint}>{t.instruments.addAudioHint}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
