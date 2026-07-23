import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomAudioPlayer from './CustomAudioPlayer';
import './Timeline.css';

const fallbackImages = {
  "საბერძნეთი": "https://upload.wikimedia.org/wikipedia/commons/c/c4/Akropolis_by_Leo_von_Klenze.jpg",
  "ძველი საბერძნეთი": "https://upload.wikimedia.org/wikipedia/commons/c/c4/Akropolis_by_Leo_von_Klenze.jpg",
  "Greece": "https://upload.wikimedia.org/wikipedia/commons/c/c4/Akropolis_by_Leo_von_Klenze.jpg",
  
  "აშშ": "https://aviatickets.ge/wp-content/uploads/2019/12/Overlooking-DC.jpg",
  "USA": "https://aviatickets.ge/wp-content/uploads/2019/12/Overlooking-DC.jpg",
  
  "იაპონია": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAaQIwTZ65dNvrdXKiIF0cGYp1iIzv7HXtmKU9ajBhOw&s=10",
  "Japan": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAaQIwTZ65dNvrdXKiIF0cGYp1iIzv7HXtmKU9ajBhOw&s=10",
  
  "საქართველო": "https://cdn.tvpirveli.ge/w/2504/43/71/79/360443be686947a6b7ec1f1cbe8e77b3/shemomkvani-turizmi.png",
  "Georgia": "https://cdn.tvpirveli.ge/w/2504/43/71/79/360443be686947a6b7ec1f1cbe8e77b3/shemomkvani-turizmi.png",
  
  "საფრანგეთი": "https://api.tabula.ge/files/styles/news_thumb_lg/public/photos/2018/11/v2exl2nje6lsczqgxklf2mh1qjkhmfu-xlarge.jpeg.jpg?itok=uDTo-0jx",
  "France": "https://api.tabula.ge/files/styles/news_thumb_lg/public/photos/2018/11/v2exl2nje6lsczqgxklf2mh1qjkhmfu-xlarge.jpeg.jpg?itok=uDTo-0jx",
  
  "ეგვიპტე": "https://mariammeritamen.wordpress.com/wp-content/uploads/2014/08/ancient-egypt-pyramids-398605.jpg",
  "ძველი ეგვიპტე": "https://mariammeritamen.wordpress.com/wp-content/uploads/2014/08/ancient-egypt-pyramids-398605.jpg",
  "Egypt": "https://mariammeritamen.wordpress.com/wp-content/uploads/2014/08/ancient-egypt-pyramids-398605.jpg"
};

const sectionTitles = {
  celebration: "✨ ოქროს ხანა / სალხინო",
  war: "⚔️ საომარი მდგომარეობა",
  mourning: "🕯️ სამგლოვიარო პერიოდი"
};

const Timeline = ({ data }) => {
  // ეპოქების სწორი ქრონოლოგიური დალაგება (ანტიკური -> შუა საუკუნეები -> თანამედროვეობა)
  const eraOrder = { 'ancient': 1, 'medieval': 2, 'modern': 3 };
  const sortedData = data ? [...data].sort((a, b) => {
    return (eraOrder[a.id] || 99) - (eraOrder[b.id] || 99);
  }) : [];

  const [activeEraId, setActiveEraId] = useState(sortedData[0]?.id || sortedData[0]?._id || 0);
  const [selectedCountry, setSelectedCountry] = useState(null); // თუ არჩეულია, აჩვენებს მის დეტალურ გვერდს

  const currentEra = sortedData.find(item => (item.id || item._id) === activeEraId) || sortedData[0];

  // როცა ეპოქას ვცვლით, ქვეყნის დეტალური ხედი ვასუფთავებთ
  const handleEraChange = (eraId) => {
    setActiveEraId(eraId);
    setSelectedCountry(null);
  };

  return (
    <div className="timeline-container">
      {/* ეპოქების ზედა ნავიგაცია (შუა საუკუნეები ზუსტად შუაშია) */}
      <div className="era-tabs-wrapper">
        {sortedData.map((eraItem, index) => {
          const eraId = eraItem.id || eraItem._id || index;
          const isActive = eraId === activeEraId;

          return (
            <button
              key={eraId}
              className={`era-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleEraChange(eraId)}
            >
              <span className="tab-title">{eraItem.era || eraItem.title}</span>
              {eraItem.yearRange && <span className="tab-years">{eraItem.yearRange}</span>}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* თუ ქვეყანა არ არის არჩეული - ვაჩვენებთ შედარების რეჟიმს (Overview) */}
        {!selectedCountry && currentEra && (
          <motion.div
            key={`overview-${activeEraId}`}
            className="comparison-view"
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
              {currentEra.countries?.map((country, cIndex) => {
                const imgSrc = country.image || country.img || country.imageUrl || fallbackImages[country.name] || fallbackImages[country.title];

                return (
                  <motion.div
                    key={country._id || country.id || cIndex}
                    className="comparison-card"
                    onClick={() => setSelectedCountry(country)}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {imgSrc && (
                      <div className="comparison-img-wrapper">
                        <img src={imgSrc} alt={country.name || country.title} className="comparison-img" />
                        <div className="img-overlay"></div>
                      </div>
                    )}
                    <div className="comparison-card-body">
                      <h3>{country.name || country.title}</h3>
                      <p className="comparison-summary">{country.summary}</p>
                      <button className="explore-btn">
                        <span>დეტალურად და მუსიკა</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* თუ ქვეყანა არჩეულია - ვაჩვენებთ მის დეტალურ გვერდს აუდიოებით */}
        {selectedCountry && (
          <motion.div
            key={`detail-${selectedCountry.id || selectedCountry.name}`}
            className="detail-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <button className="back-to-comparison-btn" onClick={() => setSelectedCountry(null)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span>უკან შედარებაში</span>
            </button>

            <div className="detail-hero-card">
              {(() => {
                const imgSrc = selectedCountry.image || selectedCountry.img || selectedCountry.imageUrl || fallbackImages[selectedCountry.name] || fallbackImages[selectedCountry.title];
                return imgSrc ? (
                  <div className="detail-img-wrapper">
                    <img src={imgSrc} alt={selectedCountry.name || selectedCountry.title} className="detail-img" />
                  </div>
                ) : null;
              })()}

              <div className="detail-header-info">
                <h2>{selectedCountry.name || selectedCountry.title}</h2>
                <p className="detail-main-summary">{selectedCountry.summary}</p>
              </div>
            </div>

            <div className="detail-sections-grid">
              {selectedCountry.sections && Object.entries(selectedCountry.sections).map(([secKey, secData]) => (
                <div key={secKey} className="detail-section-box">
                  <span className="detail-section-badge">{sectionTitles[secKey] || secKey}</span>
                  <p className="detail-section-text">{secData.text}</p>
                  
                  {secData.audio && (
                    <div className="detail-player-wrapper">
                      <CustomAudioPlayer src={secData.audio} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Timeline;