import styles from './RegionDetail.module.css';
import { toYoutubeEmbed } from '../../utils/youtube.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { pickLocalized } from '../../i18n/localize.js';

export function RegionDetail({ region, onClose }) {
  const { t, lang } = useLanguage();
  if (!region) return null;
  const title = pickLocalized(region.title || region.name, lang);
  const tag = pickLocalized(region.tag, lang);
  const description = pickLocalized(region.description || region.text, lang);
  const imageUrl = region.imageUrl || '';
  const embed = toYoutubeEmbed(region.youtubeUrl);

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className={styles.sheetHandle} aria-hidden="true" />
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t.common.close}>&times;</button>
        <div className={styles.hero}>
          {imageUrl ? <img src={imageUrl} alt={title} className={styles.heroImage} /> : <div className={styles.heroFallback} />}
          <div className={styles.heroGradient} />
          <div className={styles.heroText}>{tag ? <span className={styles.tag}>{tag}</span> : null}<h2 className={styles.title}>{title}</h2></div>
        </div>
        <div className={styles.body}>
          <div className={styles.copyCol}><p className={styles.description}>{description}</p><p className={styles.metaHint}>{t.folk.regionMeta}</p><button type="button" className={styles.shareBtn} onClick={() => {
            const url = window.location.href;
            const text = `${title} — ${t.navbar.logo}`;
            if (navigator.share) navigator.share({ title: text, url }).catch(() => {});
            else navigator.clipboard?.writeText(url);
          }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button></div>
          <div className={styles.playerCol}>{embed ? <div className={styles.playerWrapper}><iframe src={embed} title={`${title} — YouTube`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div> : <div className={styles.playerEmpty}>{t.common.soonVideo}</div>}</div>
        </div>
      </div>
    </div>
  );
}
