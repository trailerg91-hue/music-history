import { motion } from 'framer-motion';
import Navbar from '../components/Navbar/Navbar.jsx';
import Footer from '../components/Footer/Footer.jsx';
import { GeorgianFolk } from '../components/GeorgianFolk/GeorgianFolk.jsx';
import { RegionDetail } from '../components/RegionDetail/RegionDetail.jsx';
import Timeline from '../components/Timeline/Timeline.jsx';
import Instruments from '../components/Instruments/Instruments.jsx';
import MobileSectionNav from '../components/MobileSectionNav/MobileSectionNav.jsx';
import MobileMiniPlayer from '../components/MobileMiniPlayer/MobileMiniPlayer.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import styles from '../App.module.css';

const fadeIn = { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: false } };

export default function MainPage({ user, currentPage, setCurrentPage, selectedRegion, setSelectedRegion, historyData, folkRef, instrumentsRef, epochRef, scrollToSection, handleLogout }) {
  const { t } = useLanguage();
  return (
    <div className={`${styles.container} ${styles.hasMobileChrome}`}>
      {selectedRegion && <RegionDetail region={selectedRegion} onClose={() => setSelectedRegion(null)} />}
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} scrollToSection={scrollToSection} folkRef={folkRef} worldRef={instrumentsRef} epochRef={epochRef} user={user} handleLogout={handleLogout} />
      <div className={styles.heroSection}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroTextZone}>
          <h1 className={styles.title}>{t.navbar.logo}</h1>
          <p className={styles.subtitle}>{t.main.heroSubtitle}</p>
        </div>
      </div>
      <div ref={folkRef} className={styles.sectionAnchor}><GeorgianFolk onSelectRegion={setSelectedRegion} /></div>
      <motion.div ref={instrumentsRef} className={styles.section} {...fadeIn}><Instruments /></motion.div>
      <motion.div ref={epochRef} className={styles.section} {...fadeIn}><Timeline data={historyData} /></motion.div>
      <Footer />
      <MobileMiniPlayer />
      <MobileSectionNav folkRef={folkRef} instrumentsRef={instrumentsRef} epochRef={epochRef} />
    </div>
  );
}
