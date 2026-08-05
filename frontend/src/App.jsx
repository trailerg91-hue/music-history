import { lazy, Suspense } from 'react';
import './App.module.css';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppNavigation } from './hooks/useAppNavigation.js';
import MainPage from './pages/MainPage.jsx';

const AuthPage = lazy(() => import('./pages/AuthPage.jsx'));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

export default function App() {
  const nav = useAppNavigation();
  const pageKey = nav.currentPage === 'auth' ? 'auth' : nav.currentPage === 'admin' ? 'admin' : 'main';

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pageKey} {...pageTransition} style={{ minHeight: '100vh' }}>
        <Suspense fallback={null}>
          {pageKey === 'auth' && <AuthPage setCurrentPage={nav.setCurrentPage} />}
          {pageKey === 'admin' && <AdminPage isAdmin={nav.isAdmin} setCurrentPage={nav.setCurrentPage} />}
          {pageKey === 'main' && <MainPage {...nav} />}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}
