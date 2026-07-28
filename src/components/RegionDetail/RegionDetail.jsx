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
          <div className={styles.copyCol}><p className={styles.description}>{description}</p><p className={styles.metaHint}>{t.folk.regionMeta}</p></div>
          <div className={styles.playerCol}>{embed ? <div className={styles.playerWrapper}><iframe src={embed} title={`${title} — YouTube`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div> : <div className={styles.playerEmpty}>{t.common.soonVideo}</div>}</div>
        </div>
      </div>
    </div>
  );
}
