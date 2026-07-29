import './App.module.css';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppNavigation } from './hooks/useAppNavigation.js';
import LoadingScreen from './pages/LoadingScreen.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import MainPage from './pages/MainPage.jsx';

const pageTransition = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

export default function App() {
  const nav = useAppNavigation();

  if (nav.authLoading) return <LoadingScreen />;

  const pageKey = nav.currentPage === 'auth' ? 'auth' : nav.currentPage === 'admin' ? 'admin' : 'main';

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pageKey} {...pageTransition} style={{ minHeight: '100vh' }}>
        {pageKey === 'auth' && <AuthPage setCurrentPage={nav.setCurrentPage} />}
        {pageKey === 'admin' && <AdminPage isAdmin={nav.isAdmin} setCurrentPage={nav.setCurrentPage} />}
        {pageKey === 'main' && <MainPage {...nav} />}
      </motion.div>
    </AnimatePresence>
  );
}
