import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Instruments.css';

export default function Instruments() {
  const [instruments, setInstruments] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const sectionRef = useRef(null); // რეფი სექციის სათავისთვის

  // ფავორიტების ინიციალიზაცია localStorage-იდან
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteInstruments');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('favoriteInstruments', JSON.stringify(favorites));
    if (favorites.length === 0) {
      setShowFavoritesOnly(false);
    }
  }, [favorites]);

  useEffect(() => {
    fetch('https://music-history-backend-6ojw.onrender.com/api/instruments')
      .then((res) => res.json())
      .then((data) => {
        setInstruments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('შეცდომა ინსტრუმენტების წამოღებისას:', err);
        setLoading(false);
      });
  }, []);

  const uniqueTypes = [...new Set(instruments.map(item => item.type).filter(Boolean))];

  const handleCheckboxChange = (type) => {
    setShowFavoritesOnly(false);
    setShowAll(false);
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleSelectAll = () => {
    setSelectedTypes([]);
    setShowFavoritesOnly(false);
    setShowAll(false);
  };

  const handleToggleFavoritesFilter = () => {
    if (favorites.length === 0) return;
    setShowFavoritesOnly(prev => !prev);
    setSelectedTypes([]);
    setShowAll(false);
  };

  const toggleFavorite = (itemId, e) => {
    e.stopPropagation();
    if (favorites.includes(itemId)) {
      setFavorites(favorites.filter(id => id !== itemId));
    } else {
      setFavorites([...favorites, itemId]);
    }
  };

  // გაფილტრვის ლოგიკა
  const filteredInstruments = instruments.filter(item => {
    const itemId = item._id || item.name;
    
    if (showFavoritesOnly) {
      return favorites.includes(itemId);
    }
    
    if (selectedTypes.length > 0) {
      return selectedTypes.includes(item.type);
    }
    
    return true;
  });

  const displayedInstruments = showAll ? filteredInstruments : filteredInstruments.slice(0, 3);

  const handleToggleShow = () => {
    if (showAll) {
      setShowAll(false);
      // ვკეცავთ და ავდივართ სექციის თავში
      sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setShowAll(true);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-white">იტვირთება საკრავები...</div>;
  }

  const isFavoritesDisabled = favorites.length === 0;

  return (
    <div ref={sectionRef} className="instruments-wrapper">
      <motion.h2 
        className="instruments-section-title"
        initial={{ opacity: 0, y: -15 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        საკრავები
      </motion.h2>

      <div className="filters-wrapper">
        <motion.h3 
          className="filters-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          ფილტრაცია ტიპის მიხედვით
        </motion.h3>

        <motion.div 
          className="filters-container"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {/* „ყველა“ ღილაკი */}
          <motion.label 
            className={`filter-label ${!showFavoritesOnly && selectedTypes.length === 0 ? 'active' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <input 
              type="checkbox"
              className="filter-checkbox"
              checked={!showFavoritesOnly && selectedTypes.length === 0}
              onChange={handleSelectAll}
            />
            <span>ყველა</span>
          </motion.label>

          {/* დანარჩენი დინამიური ტიპები */}
          {uniqueTypes.map((type, index) => {
            const isActive = !showFavoritesOnly && selectedTypes.includes(type);
            return (
              <motion.label 
                key={index} 
                className={`filter-label ${isActive ? 'active' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <input 
                  type="checkbox"
                  className="filter-checkbox"
                  checked={isActive}
                  onChange={() => handleCheckboxChange(type)}
                />
                <span>{type}</span>
              </motion.label>
            );
          })}

          {/* „ფავორიტები“ ღილაკი */}
          <motion.label 
            className={`filter-label ${showFavoritesOnly ? 'active' : ''} ${isFavoritesDisabled ? 'disabled' : ''}`}
            whileHover={!isFavoritesDisabled ? { scale: 1.05 } : {}}
            whileTap={!isFavoritesDisabled ? { scale: 0.95 } : {}}
            style={{ 
              opacity: isFavoritesDisabled ? 0.4 : 1, 
              cursor: isFavoritesDisabled ? 'not-allowed' : 'pointer' 
            }}
          >
            <input 
              type="checkbox"
              className="filter-checkbox"
              checked={showFavoritesOnly}
              disabled={isFavoritesDisabled}
              onChange={handleToggleFavoritesFilter}
            />
            <span>❤️ ფავორიტები</span>
          </motion.label>
        </motion.div>
      </div>
      
      <div className="instruments-grid">
        <AnimatePresence>
          {filteredInstruments.length > 0 ? (
            displayedInstruments.map((item, index) => {
              const itemId = item._id || item.name;
              const isFavorited = favorites.includes(itemId);

              return (
                <motion.div 
                  key={itemId} 
                  className="instrument-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* ფავორიტის გულის ღილაკი */}
                  <button 
                    className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
                    onClick={(e) => toggleFavorite(itemId, e)}
                    title={isFavorited ? "ფავორიტებიდან ამოშლა" : "ფავორიტებში დამატება"}
                  >
                    {isFavorited ? '❤️' : '🤍'}
                  </button>

                  <div>
                    {item.imageUrl && (
                      <div className="instrument-image-container">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="instrument-image" 
                        />
                      </div>
                    )}
                    <h3 className="instrument-name">{item.name}</h3>
                    <p className="instrument-description">{item.description}</p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="no-results" style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#aaa', padding: '20px' }}>
              {showFavoritesOnly 
                ? 'ფავორიტებში ჯერ არცერთი ინსტრუმენტი არ დაგიმატებია.' 
                : 'მითითებული კატეგორიის ინსტრუმენტი არ მოიძებნა.'}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* „მეტის ჩვენება“ ღილაკი საკრავებისთვის */}
      {filteredInstruments.length > 3 && (
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
    </div>
  );
}