import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet } from '../../api.js';
import InstrumentDetail from './InstrumentDetail.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { pickLocalized } from '../../i18n/localize.js';
import { SkeletonGrid } from '../Skeleton/Skeleton.jsx';
import './Instruments.css';

const cardMotion = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, transition: { duration: 0.3, ease: 'easeOut' } };
const handleCardMouse = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
};
const idOf = (item) => item._id || item.id || pickLocalized(item.name, 'ka');

export default function Instruments() {
  const { t, lang } = useLanguage();
  const [instruments, setInstruments] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState(null);
  const sectionRef = useRef(null);
  const [favorites, setFavorites] = useState(() => { try { return JSON.parse(localStorage.getItem('favoriteInstruments') || '[]'); } catch { return []; } });

  useEffect(() => { localStorage.setItem('favoriteInstruments', JSON.stringify(favorites)); if (!favorites.length) setShowFavoritesOnly(false); }, [favorites]);
  useEffect(() => { apiGet('/instruments').then((d) => { setInstruments(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const types = [...new Set(instruments.map((i) => pickLocalized(i.type, lang)).filter(Boolean))];
  const filtered = instruments.filter((item) => {
    const id = idOf(item);
    const type = pickLocalized(item.type, lang);
    if (showFavoritesOnly) return favorites.includes(id);
    if (selectedTypes.length) return selectedTypes.includes(type);
    return true;
  });
  const displayed = showAll ? filtered : filtered.slice(0, 6);
  const selectedId = selected ? idOf(selected) : null;

  if (loading) return <div className="instruments-wrapper"><div className="instruments-hero"><h2 className="instruments-section-title">{t.instruments.title}</h2><p className="instruments-subtitle">{t.instruments.subtitle}</p></div><SkeletonGrid count={6} /></div>;

  return (
    <div ref={sectionRef} className="instruments-wrapper">
      <div className="instruments-hero">
        <motion.h2 className="instruments-section-title" initial={{ opacity: 0, y: -12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>{t.instruments.title}</motion.h2>
        <p className="instruments-subtitle">{t.instruments.subtitle}</p>
        <p className="instruments-hint"><span className="instruments-hint-dot" aria-hidden="true" />{t.instruments.hint}</p>
      </div>
      <div className="filters-row" role="toolbar" aria-label={t.instruments.title}>
        <button type="button" className={`filter-chip ${!showFavoritesOnly && !selectedTypes.length ? 'active' : ''}`} onClick={() => { setSelectedTypes([]); setShowFavoritesOnly(false); setShowAll(false); }}>{t.instruments.all}</button>
        {types.map((type) => <button key={type} type="button" className={`filter-chip ${!showFavoritesOnly && selectedTypes.includes(type) ? 'active' : ''}`} onClick={() => { setShowFavoritesOnly(false); setShowAll(false); setSelectedTypes((prev) => prev.includes(type) ? prev.filter((t2) => t2 !== type) : [...prev, type]); }}>{type}</button>)}
        <button type="button" className={`filter-chip filter-chip-fav ${showFavoritesOnly ? 'active' : ''}`} disabled={!favorites.length} title={!favorites.length ? t.instruments.favoritesHint : t.instruments.favoritesOnly} onClick={() => { if (!favorites.length) return; setShowFavoritesOnly((v) => !v); setSelectedTypes([]); setShowAll(false); }}>♥ {t.instruments.favorites}</button>
      </div>
      <div className="instruments-grid"><AnimatePresence>{filtered.length ? displayed.map((item) => { const id = idOf(item); const favorited = favorites.includes(id); return <motion.div key={id} className="instrument-card" {...cardMotion} role="button" tabIndex={0} onClick={() => setSelected(item)} onMouseMove={handleCardMouse} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(item); } }}><button type="button" className={`favorite-btn ${favorited ? 'favorited' : ''}`} onClick={(e) => { e.stopPropagation(); setFavorites((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]); }} title={favorited ? t.instruments.removeFavorite : t.instruments.addFavorite}>{favorited ? '♥' : '♡'}</button><div className="instrument-image-container">{item.imageUrl ? <img src={item.imageUrl} alt="" className="instrument-image" /> : <span className="instrument-image-fallback">♪</span>}<div className="instrument-image-shade" /></div><div className="instrument-meta">{pickLocalized(item.type, lang) ? <span className="instrument-type">{pickLocalized(item.type, lang)}</span> : null}<h3 className="instrument-name">{pickLocalized(item.name, lang)}</h3></div></motion.div>; }) : <div className="no-results">{showFavoritesOnly ? t.instruments.noFavoritesYet : t.instruments.noCategoryResults}</div>}</AnimatePresence></div>
      {filtered.length > 6 && <div className="show-more-wrap"><motion.button type="button" whileTap={{ scale: 0.97 }} className="show-more-btn" onClick={() => { if (showAll) { setShowAll(false); sectionRef.current?.scrollIntoView({ behavior: 'smooth' }); } else setShowAll(true); }}>{showAll ? t.common.showLess : t.common.showMore}</motion.button></div>}
      {selected && <InstrumentDetail instrument={selected} favorited={favorites.includes(selectedId)} onToggleFavorite={() => setFavorites((prev) => prev.includes(selectedId) ? prev.filter((x) => x !== selectedId) : [...prev, selectedId])} onClose={() => setSelected(null)} />}
    </div>
  );
}
