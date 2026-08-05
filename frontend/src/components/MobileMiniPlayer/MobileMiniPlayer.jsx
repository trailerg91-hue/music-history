import styles from './MobileMiniPlayer.module.css';
import { useAudioSession } from '../AudioSession/audioSession.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

export default function MobileMiniPlayer() {
  const ctx = useAudioSession();
  const { t } = useLanguage();
  const s = ctx?.session;
  if (!s?.src || !s.playing) return null;
  return (
    <div className={styles.bar} role="status" aria-live="polite">
      <span className={styles.icon} aria-hidden="true">♪</span>
      <div className={styles.meta}>
        <span className={styles.label}>{t.timeline.nowPlaying}</span>
        <span className={styles.title}>{s.title || t.common.audio}</span>
      </div>
      <button type="button" className={styles.pauseBtn} aria-label={t.common.close} onClick={() => { document.querySelectorAll('audio').forEach((el) => el.pause()); ctx?.report?.({ id: s.id, playing: false }); }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
      </button>
    </div>
  );
}
