import React from 'react';
import ReactPlayer from 'react-player';
import styles from './RegionDetail.module.css';

export function RegionDetail({ region, onClose }) {
  if (!region) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        
        <img src={region.imageUrl} alt={region.title} className={styles.image} />
        
        <div className={styles.content}>
          <h2>{region.title}</h2>
          <span style={{color: '#f59e0b', display: 'block', marginBottom: '10px'}}>{region.tag}</span>
          <p>{region.description}</p>
        </div>
        
        <div className={styles.playerWrapper}>
       {/* ReactPlayer-ის ნაცვლად ჩასვი ეს: */}
<iframe 
  width="100%" 
  height="100%" 
  src={region.youtubeUrl.replace("watch?v=", "embed/")} 
  title="YouTube video player" 
  frameBorder="0" 
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
  allowFullScreen
></iframe>
        </div>
      </div>
    </div>
  );
}