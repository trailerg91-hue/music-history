import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './GeorgianFolk.module.css';

export function GeorgianFolk({ onSelectRegion }) {
  const [regions, setRegions] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    fetch('https://music-history-backend-6ojw.onrender.com/api/folklore')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRegions(data);
        } else {
          setRegions([]);
        }
      })
      .catch(err => console.error("ფოლკლორის ბაზის შეცდომა:", err));
  }, []);

  const displayedRegions = showAll ? regions : regions.slice(0, 3);

  const handleToggleShow = () => {
    if (showAll) {
      setShowAll(false);
      sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setShowAll(true);
    }
  };

  return (
    <section ref={sectionRef} className={styles.pageContainer}>
      <div className={styles.hero}>
        <h2 className={styles.mainTitle}>ქართული ხალხური მუსიკა</h2>
        <p className={styles.subText}>მუსიკალური მოგზაურობა საქართველოს რეგიონებში.</p>
      </div>

      <div className={styles.grid}>
        <AnimatePresence>
          {displayedRegions.length > 0 ? (
            displayedRegions.map((region) => (
              <motion.div 
                key={region._id || region.id} 
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* რეგიონის ფოტო ბარათზე თავიდანვე */}
                {region.imageUrl && (
                  <div style={{ width: '100%', height: '180px', overflow: 'hidden', borderRadius: '8px 8px 0 0', marginBottom: '12px' }}>
                    <img 
                      src={region.imageUrl} 
                      alt={region.title || region.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                )}

                <p className={styles.cardTag}>{region.tag || 'კუთხე'}</p>
                <h3 className={styles.cardTitle}>{region.title || region.name}</h3>
                <p className={styles.cardDescription}>{region.description || region.text}</p>
                <button onClick={() => onSelectRegion(region)} className={styles.exploreBtn}>
                  მოსმენა & დეტალები
                </button>
              </motion.div>
            ))
          ) : (
            <div style={{ color: '#aaa', textAlign: 'center', gridColumn: '1 / -1', padding: '20px' }}>
              კუთხეები ვერ ჩამოიტვირთა...
            </div>
          )}
        </AnimatePresence>
      </div>

      {regions.length > 3 && (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleShow}
            style={{
              padding: '12px 28px',
              backgroundColor: '#d97706',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              transition: 'background 0.3s ease'
            }}
          >
            {showAll ? 'ნაკლების ჩვენება ▲' : 'მეტის ჩვენება ▼'}
          </motion.button>
        </div>
      )}
    </section>
  );
}