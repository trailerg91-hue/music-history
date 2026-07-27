import styles from './RegionDetail.module.css';

export function RegionDetail({ region, onClose }) {
  if (!region) return null;

  const embed = region.youtubeUrl?.replace('watch?v=', 'embed/');

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>

        <img src={region.imageUrl} alt={region.title} className={styles.image} />

        <div className={styles.content}>
          <h2>{region.title}</h2>
          <span className={styles.tag}>{region.tag}</span>
          <p>{region.description}</p>
        </div>

        <div className={styles.playerWrapper}>
          <iframe
            width="100%"
            height="100%"
            src={embed}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
