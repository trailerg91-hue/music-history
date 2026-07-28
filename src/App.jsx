import './App.module.css';
import { useAppNavigation } from './hooks/useAppNavigation.js';
import LoadingScreen from './pages/LoadingScreen.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import MainPage from './pages/MainPage.jsx';

export default function App() {
  const nav = useAppNavigation();

  if (nav.authLoading) return <LoadingScreen />;
  if (nav.currentPage === 'auth') return <AuthPage setCurrentPage={nav.setCurrentPage} />;
  if (nav.currentPage === 'admin') {
    return <AdminPage isAdmin={nav.isAdmin} setCurrentPage={nav.setCurrentPage} />;
  }

  return <MainPage {...nav} />;
}
