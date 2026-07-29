import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar/Navbar.jsx';
import Footer from '../components/Footer/Footer.jsx';
import { GeorgianFolk } from '../components/GeorgianFolk/GeorgianFolk.jsx';
import { RegionDetail } from '../components/RegionDetail/RegionDetail.jsx';
import Timeline from '../components/Timeline/Timeline.jsx';
import Instruments from '../components/Instruments/Instruments.jsx';
import MobileSectionNav from '../components/MobileSectionNav/MobileSectionNav.jsx';
import MobileMiniPlayer from '../components/MobileMiniPlayer/MobileMiniPlayer.jsx';
import ScrollProgress from '../components/ScrollProgress/ScrollProgress.jsx';
import BackToTop from '../components/BackToTop/BackToTop.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import styles from '../App.module.css';

const fadeIn = { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: false } };

function useParallax() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return offset;
}

function TypeWriter({ text, speed = 80 }) {
  const [displayed, setDisplayed] = useState('');
  const idx = useRef(0);
  useEffect(() => {
    idx.current = 0;
    setDisplayed('');
    const timer = setInterval(() => {
      idx.current++;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return <>{displayed}<span style={{ opacity: displayed.length < text.length ? 1 : 0, transition: 'opacity 0.3s' }}>|</span></>;
}

const NOTES = ['♪', '♫', '♩', '♬', '𝅘𝅥𝅮'];
function MusicParticles() {
  const particles = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      note: NOTES[i % NOTES.length],
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      size: 14 + Math.random() * 14,
    }))
  ).current;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 2 }}>
      {particles.map((p) => (
        <span key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`,
          bottom: '-5%',
          fontSize: p.size,
          color: 'rgba(245,158,11,0.18)',
          animation: `noteFloat ${p.duration}s ${p.delay}s ease-in infinite`,
        }}>{p.note}</span>
      ))}
      <style>{`@keyframes noteFloat { 0% { transform:translateY(0) rotate(0deg); opacity:0; } 10% { opacity:0.7; } 90% { opacity:0.3; } 100% { transform:translateY(-110vh) rotate(360deg); opacity:0; } }`}</style>
    </div>
  );
}

export default function MainPage({ user, currentPage, setCurrentPage, selectedRegion, setSelectedRegion, historyData, folkRef, instrumentsRef, epochRef, scrollToSection, handleLogout }) {
  const { t } = useLanguage();
  const scrollY = useParallax();
  return (
    <div className={`${styles.container} ${styles.hasMobileChrome}`}>
      <ScrollProgress />
      {selectedRegion && <RegionDetail region={selectedRegion} onClose={() => setSelectedRegion(null)} />}
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} scrollToSection={scrollToSection} folkRef={folkRef} worldRef={instrumentsRef} epochRef={epochRef} user={user} handleLogout={handleLogout} />
      <div className={styles.heroSection} style={{ backgroundPositionY: -(scrollY * 0.35) }}>
        <div className={styles.heroOverlay} />
        <MusicParticles />
        <div className={styles.heroTextZone}>
          <h1 className={styles.title}><TypeWriter text={t.navbar.logo} speed={100} /></h1>
          <motion.p className={styles.subtitle} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8, duration: 0.6 }}>{t.main.heroSubtitle}</motion.p>
        </div>
      </div>
      <div ref={folkRef} className={styles.sectionAnchor}><GeorgianFolk onSelectRegion={setSelectedRegion} /></div>
      <motion.div ref={instrumentsRef} className={styles.section} {...fadeIn}><Instruments /></motion.div>
      <motion.div ref={epochRef} className={styles.section} {...fadeIn}><Timeline data={historyData} /></motion.div>
      <Footer />
      <MobileMiniPlayer />
      <BackToTop />
      <MobileSectionNav folkRef={folkRef} instrumentsRef={instrumentsRef} epochRef={epochRef} />
    </div>
  );
}
