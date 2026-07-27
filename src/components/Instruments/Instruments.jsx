import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '../../api.js';
import './Instruments.css';

const cardMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

const chipMotion = { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } };

export default function Instruments() {
  const [instruments, setInstruments] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const sectionRef = useRef(null);

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteInstruments');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('favoriteInstruments', JSON.stringify(favorites));
    if (!favorites.length) setShowFavoritesOnly(false);
  }, [favorites]);

  useEffect(() => {
    fetch(`${API_BASE}/instruments`)
      .then((res) => res.json())
      .then((data) => {
        setInstruments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const uniqueTypes = [...new Set(instruments.map((i) => i.type).filter(Boolean))];
  const resetView = () => setShowAll(false);

  const handleCheckboxChange = (type) => {
    setShowFavoritesOnly(false);
    resetView();
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSelectAll = () => {
    setSelectedTypes([]);
    setShowFavoritesOnly(false);
    resetView();
  };

  const handleToggleFavoritesFilter = () => {
    if (!favorites.length) return;
    setShowFavoritesOnly((v) => !v);
    setSelectedTypes([]);
    resetView();
  };

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const filtered = instruments.filter((item) => {
    const id = item._id || item.name;
    if (showFavoritesOnly) return favorites.includes(id);
    if (selectedTypes.length) return selectedTypes.includes(item.type);
    return true;
  });

  const displayed = showAll ? filtered : filtered.slice(0, 3);

  const toggleShow = () => {
    if (showAll) {
      setShowAll(false);
      sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else setShowAll(true);
  };

  if (loading) return <div className="instruments-loading">იტვირთება საკრავები...</div>;

  const favDisabled = !favorites.length;
  const allActive = !showFavoritesOnly && !selectedTypes.length;

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
          <motion.label className={`filter-label ${allActive ? 'active' : ''}`} {...chipMotion}>
            <input
              type="checkbox"
              className="filter-checkbox"
              checked={allActive}
              onChange={handleSelectAll}
            />
            <span>ყველა</span>
          </motion.label>

          {uniqueTypes.map((type) => {
            const active = !showFavoritesOnly && selectedTypes.includes(type);
            return (
              <motion.label key={type} className={`filter-label ${active ? 'active' : ''}`} {...chipMotion}>
                <input
                  type="checkbox"
                  className="filter-checkbox"
                  checked={active}
                  onChange={() => handleCheckboxChange(type)}
                />
                <span>{type}</span>
              </motion.label>
            );
          })}

          <motion.label
            className={`filter-label ${showFavoritesOnly ? 'active' : ''}`}
            whileHover={!favDisabled ? { scale: 1.05 } : {}}
            whileTap={!favDisabled ? { scale: 0.95 } : {}}
            style={{ opacity: favDisabled ? 0.4 : 1, cursor: favDisabled ? 'not-allowed' : 'pointer' }}
          >
            <input
              type="checkbox"
              className="filter-checkbox"
              checked={showFavoritesOnly}
              disabled={favDisabled}
              onChange={handleToggleFavoritesFilter}
            />
            <span>❤️ ფავორიტები</span>
          </motion.label>
        </motion.div>
      </div>

      <div className="instruments-grid">
        <AnimatePresence>
          {filtered.length ? (
            displayed.map((item) => {
              const id = item._id || item.name;
              const favorited = favorites.includes(id);
              return (
                <motion.div key={id} className="instrument-card" {...cardMotion}>
                  <button
                    className={`favorite-btn ${favorited ? 'favorited' : ''}`}
                    onClick={(e) => toggleFavorite(id, e)}
                    title={favorited ? 'ფავორიტებიდან ამოშლა' : 'ფავორიტებში დამატება'}
                  >
                    {favorited ? '❤️' : '🤍'}
                  </button>
                  <div>
                    {item.imageUrl && (
                      <div className="instrument-image-container">
                        <img src={item.imageUrl} alt={item.name} className="instrument-image" />
                      </div>
                    )}
                    <h3 className="instrument-name">{item.name}</h3>
                    <p className="instrument-description">{item.description}</p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="no-results">
              {showFavoritesOnly
                ? 'ფავორიტებში ჯერ არცერთი ინსტრუმენტი არ დაგიმატებია.'
                : 'მითითებული კატეგორიის ინსტრუმენტი არ მოიძებნა.'}
            </div>
          )}
        </AnimatePresence>
      </div>

      {filtered.length > 3 && (
        <div className="show-more-wrap">
          <motion.button whileTap={{ scale: 0.95 }} onClick={toggleShow} className="show-more-btn">
            {showAll ? 'ნაკლების ჩვენება ▲' : 'მეტის ჩვენება ▼'}
          </motion.button>
        </div>
      )}
    </div>
  );
}
