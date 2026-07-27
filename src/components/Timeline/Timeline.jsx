import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomAudioPlayer from '../CustomAudioPlayer/CustomAudioPlayer.jsx';
import './Timeline.css';

const IMG = {
  greece: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Akropolis_by_Leo_von_Klenze.jpg',
  usa: 'https://aviatickets.ge/wp-content/uploads/2019/12/Overlooking-DC.jpg',
  japan: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAaQIwTZ65dNvrdXKiIF0cGYp1iIzv7HXtmKU9ajBhOw&s=10',
  georgia: 'https://cdn.tvpirveli.ge/w/2504/43/71/79/360443be686947a6b7ec1f1cbe8e77b3/shemomkvani-turizmi.png',
  france: 'https://api.tabula.ge/files/styles/news_thumb_lg/public/photos/2018/11/v2exl2nje6lsczqgxklf2mh1qjkhmfu-xlarge.jpeg.jpg?itok=uDTo-0jx',
  egypt: 'https://mariammeritamen.wordpress.com/wp-content/uploads/2014/08/ancient-egypt-pyramids-398605.jpg',
};

const fallbackImages = {
  საბერძნეთი: IMG.greece,
  'ძველი საბერძნეთი': IMG.greece,
  Greece: IMG.greece,
  აშშ: IMG.usa,
  USA: IMG.usa,
  იაპონია: IMG.japan,
  Japan: IMG.japan,
  საქართველო: IMG.georgia,
  Georgia: IMG.georgia,
  საფრანგეთი: IMG.france,
  France: IMG.france,
  ეგვიპტე: IMG.egypt,
  'ძველი ეგვიპტე': IMG.egypt,
  Egypt: IMG.egypt,
};

const sectionTitles = {
  celebration: '✨ ოქროს ხანა / სალხინო',
  war: '⚔️ საომარი მდგომარეობა',
  mourning: '🕯️ სამგლოვიარო პერიოდი',
};

const eraOrder = { ancient: 1, medieval: 2, modern: 3 };
const countryImg = (c) => c.image || c.img || c.imageUrl || fallbackImages[c.name] || fallbackImages[c.title];
const idOf = (item, i) => item.id || item._id || i;

export default function Timeline({ data }) {
  const sorted = data
    ? [...data].sort((a, b) => (eraOrder[a.id] || 99) - (eraOrder[b.id] || 99))
    : [];

  const [activeEraId, setActiveEraId] = useState(idOf(sorted[0] || {}, 0));
  const [selectedCountry, setSelectedCountry] = useState(null);
  const currentEra = sorted.find((item) => idOf(item) === activeEraId) || sorted[0];

  const selectEra = (eraId) => {
    setActiveEraId(eraId);
    setSelectedCountry(null);
  };

  return (
    <div className="timeline-container">
      <div className="era-tabs-wrapper">
        {sorted.map((era, i) => {
          const eraId = idOf(era, i);
          return (
            <button
              key={eraId}
              className={`era-tab-btn ${eraId === activeEraId ? 'active' : ''}`}
              onClick={() => selectEra(eraId)}
            >
              <span className="tab-title">{era.era || era.title}</span>
              {era.yearRange && <span className="tab-years">{era.yearRange}</span>}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {!selectedCountry && currentEra && (
          <motion.div
            key={`overview-${activeEraId}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="section-intro-header">
              <h2>{currentEra.era}</h2>
              <p>აირჩიეთ ქვეყანა, რომ გაეცნოთ მის მუსიკალურ ისტორიას, ოქროს ხანასა და ტრადიციებს</p>
            </div>

            <div className="comparison-grid">
              {currentEra.countries?.map((country, i) => {
                const img = countryImg(country);
                return (
                  <motion.div
                    key={country._id || country.id || i}
                    className="comparison-card"
                    onClick={() => setSelectedCountry(country)}
                    whileHover={{ scale: 1.02, y: -5, rotateX: 2, rotateY: -2 }}
                    transition={{ duration: 0.3 }}
                  >
                    {img && (
                      <div className="comparison-img-wrapper">
                        <img src={img} alt={country.name || country.title} className="comparison-img" />
                        <div className="img-overlay" />
                      </div>
                    )}
                    <div className="comparison-card-body">
                      <h3>{country.name || country.title}</h3>
                      <p className="comparison-summary">{country.summary}</p>
                      <button className="explore-btn">
                        <span>დეტალურად და მუსიკა</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {selectedCountry && (() => {
          const detailImg = countryImg(selectedCountry);
          return (
          <motion.div
            key={`detail-${selectedCountry.id || selectedCountry.name}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <button className="back-to-comparison-btn" onClick={() => setSelectedCountry(null)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>უკან შედარებაში</span>
            </button>

            <div className="detail-hero-card">
              {detailImg && (
                <div className="detail-img-wrapper">
                  <img
                    src={detailImg}
                    alt={selectedCountry.name || selectedCountry.title}
                    className="detail-img"
                  />
                </div>
              )}
              <div className="detail-header-info">
                <h2>{selectedCountry.name || selectedCountry.title}</h2>
                <p className="detail-main-summary">{selectedCountry.summary}</p>
              </div>
            </div>

            <div className="detail-sections-grid">
              {selectedCountry.sections &&
                Object.entries(selectedCountry.sections).map(([key, sec]) => (
                  <div key={key} className="detail-section-box">
                    <span className="detail-section-badge">{sectionTitles[key] || key}</span>
                    <p className="detail-section-text">{sec.text}</p>
                    {sec.audio && (
                      <div className="detail-player-wrapper">
                        <CustomAudioPlayer src={sec.audio} />
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
