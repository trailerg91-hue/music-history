import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { GeorgianFolk } from './components/GeorgianFolk.jsx';
import { RegionDetail } from './components/RegionDetail/RegionDetail.jsx';
import { AuthProvider, useAuth } from './components/authContext.jsx';
import Auth from './components/Auth.jsx';
import Timeline from './components/Timeline.jsx';
import Instruments from './components/Instruments.jsx';
import AdminPanel from './components/AdminPanel.jsx';

import styles from './App.module.css';

function MainContent() {
  const { user, logout } = useAuth();
  
  const [currentPage, setCurrentPage] = useState(() => {
    const savedUser = localStorage.getItem('token') || localStorage.getItem('user');
    if (!savedUser) return 'auth';
    return localStorage.getItem('currentPage') || 'main';
  });
  
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  
  const folkRef = useRef(null);
  const instrumentsRef = useRef(null);
  const epochRef = useRef(null);

  useEffect(() => {
    if (currentPage && currentPage !== 'auth') {
      localStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    if (!user) {
      setCurrentPage('auth');
      localStorage.removeItem('currentPage');
    }
  }, [user]);

  useEffect(() => {
    fetch('https://music-history-backend-6ojw.onrender.com/api/history')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistoryData(data);
        } else {
          setHistoryData([]);
        }
      })
      .catch(err => {
        console.error("ეპოქების ბაზის შეცდომა:", err);
        setHistoryData([]);
      });
  }, []);

  const scrollToSection = (ref) => {
    setCurrentPage('main');
    localStorage.setItem('currentPage', 'main');
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentPage');
    setCurrentPage('auth');
  };

  // ვამოწმებთ არის თუ არა იუზერი ადმინი (შეცვალე შენი ბაზის ველის მიხედვით: isAdmin ან role === 'admin')
  const isAdmin = user?.isAdmin || user?.role === 'admin';

  return (
    <div className={styles.container}>
      {selectedRegion && <RegionDetail region={selectedRegion} onClose={() => setSelectedRegion(null)} />}

      {currentPage === 'auth' ? (
        <div className={styles.authSection}>
          <Auth setCurrentPage={setCurrentPage} />
        </div>
      ) : currentPage === 'admin' ? (
        /* მკაცრი შემოწმება: თუ ადმინია - უშვებს, თუ არა - აჩვენებს შეტყობინებას და ღილაკს */
        isAdmin ? (
          <AdminPanel setCurrentPage={setCurrentPage} />
        ) : (
          <div style={{ textAlign: 'center', marginTop: '100px', color: '#fff', padding: '20px' }}>
            <h2>წვდომა შეზღუდულია</h2>
            <p style={{ margin: '15px 0', color: '#aaa' }}>თქვენ არ გაქვთ ადმინისტრატორის უფლებები ამ გვერდზე შესასვლელად.</p>
            <button 
              onClick={() => setCurrentPage('main')}
              style={{ padding: '10px 20px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              მთავარ გვერდზე დაბრუნება
            </button>
          </div>
        )
      ) : (
        <>
          <Navbar 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage} 
            scrollToSection={scrollToSection} 
            folkRef={folkRef} 
            worldRef={instrumentsRef} 
            epochRef={epochRef} 
            user={user}
            handleLogout={handleLogout}
          />

          <div className={styles.heroSection}>
            <div className={styles.heroOverlay}></div>
            <div className={styles.heroTextZone}>
              <h1 className={styles.title}>History of Music</h1>
              <p className={styles.subtitle}>მოგზაურობა ხმებისა და ეპოქების სამყაროში...</p>
            </div>
          </div>

          <div ref={folkRef}>
            <GeorgianFolk onSelectRegion={setSelectedRegion} />
          </div>

          <motion.div 
            ref={instrumentsRef} 
            className={styles.section} 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            viewport={{ once: false }}
          >
            <Instruments />
          </motion.div>
          
          <motion.div ref={epochRef} className={styles.section} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: false }}>
            <h2>ეპოქები</h2>
            <Timeline data={historyData} />
          </motion.div>

          <Footer />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;