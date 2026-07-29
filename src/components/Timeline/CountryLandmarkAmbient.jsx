import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/** Landmark photos — cinematic, culture-specific (verified URLs) */
export const LANDMARK_BG = {
  egypt:
    'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1600&q=80',
  greece:
    'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=1600&q=80',
  georgia:
    'https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=1600&q=80',
  france:
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80',
  usa:
    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=80',
  japan:
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
};

const NEEDLES = {
  egypt: ['egypt', 'ეგვიპტე'],
  greece: ['greece', 'საბერძნეთი', 'ბერძნ'],
  georgia: ['georgia', 'საქართველო'],
  france: ['france', 'საფრანგეთი'],
  usa: ['usa', 'united states', 'აშშ', 'ამერიკ'],
  japan: ['japan', 'იაპონია'],
};

function asText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return [value.ka, value.en].filter(Boolean).join(' ');
}

export function resolveCountryKey(country) {
  if (!country) return null;
  const id = String(country.id || '').toLowerCase();
  if (LANDMARK_BG[id]) return id;

  const blob = [asText(country.name), asText(country.title)].join(' ').toLowerCase();

  for (const [key, needles] of Object.entries(NEEDLES)) {
    if (needles.some((n) => blob.includes(n.toLowerCase()))) return key;
  }
  return null;
}

export default function CountryLandmarkAmbient({ countryKey }) {
  useEffect(() => {
    Object.values(LANDMARK_BG).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <div className="country-landmark-layer" aria-hidden="true">
      <AnimatePresence mode="wait">
        {countryKey && LANDMARK_BG[countryKey] ? (
          <motion.div
            key={countryKey}
            className={`country-landmark country-landmark--${countryKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="country-landmark-photo"
              style={{ backgroundImage: `url(${LANDMARK_BG[countryKey]})` }}
              initial={{ opacity: 0, scale: 1.12, y: '10%' }}
              animate={{ opacity: 1, scale: 1, y: '0%' }}
              exit={{ opacity: 0, scale: 1.04, y: '4%' }}
              transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
            />
            <div className="country-landmark-veil" />
            <div className="country-landmark-ground" />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
