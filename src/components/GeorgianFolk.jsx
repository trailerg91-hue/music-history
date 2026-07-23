import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './GeorgianFolk.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, ease: "easeInOut" }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

export function GeorgianFolk({ onSelectRegion }) {
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    fetch('https://music-history-backend-6ojw.onrender.com/api/instruments')
      .then(res => res.json())
      .then(data => setRegions(data))
      .catch(err => console.error("ბაზის შეცდომა:", err));
  }, []);

  return (
    <motion.section 
      className={styles.pageContainer}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.1 }}
    >
      <div className={styles.hero}>
        <h2 className={styles.mainTitle}>ქართული ხალხური მუსიკა</h2>
        <p className={styles.subText}>მუსიკალური მოგზაურობა საქართველოს რეგიონებში.</p>
      </div>

      <motion.div className={styles.grid} variants={containerVariants}>
        {regions.map((region) => (
          <motion.div 
            key={region._id || region.id} 
            className={styles.card}
            variants={cardVariants}
          >
            <p className={styles.cardTag}>{region.tag || 'კუთხე'}</p>
            <h3 className={styles.cardTitle}>{region.title || region.name}</h3>
            <p className={styles.cardDescription}>{region.description || region.text}</p>
            <button onClick={() => onSelectRegion(region)} className={styles.exploreBtn}>
              მოსმენა & დეტალები
            </button>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}