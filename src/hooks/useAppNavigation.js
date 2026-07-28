import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../components/Auth/authContext.jsx';
import { API_BASE } from '../api.js';

export function useAppNavigation() {
  const { user, logout, authLoading } = useAuth();

  const [currentPage, setCurrentPage] = useState(() => localStorage.getItem('currentPage') || 'main');

  const [selectedRegion, setSelectedRegion] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const folkRef = useRef(null);
  const instrumentsRef = useRef(null);
  const epochRef = useRef(null);

  useEffect(() => {
    if (currentPage && currentPage !== 'auth') localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      if (currentPage === 'admin') setCurrentPage('auth');
    } else if (currentPage === 'auth') {
      setCurrentPage(localStorage.getItem('currentPage') || 'main');
    }
  }, [user, authLoading, currentPage]);

  useEffect(() => {
    fetch(`${API_BASE}/history`)
      .then((r) => r.json())
      .then((d) => setHistoryData(Array.isArray(d) ? d : []))
      .catch(() => setHistoryData([]));
  }, []);

  const scrollToSection = useCallback((ref) => {
    setCurrentPage('main');
    localStorage.setItem('currentPage', 'main');
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  const handleLogout = useCallback(() => {
    logout?.();
    localStorage.removeItem('token');
    localStorage.removeItem('currentPage');
    setCurrentPage('main');
  }, [logout]);

  return {
    user,
    authLoading,
    currentPage,
    setCurrentPage,
    selectedRegion,
    setSelectedRegion,
    historyData,
    folkRef,
    instrumentsRef,
    epochRef,
    scrollToSection,
    handleLogout,
    isAdmin: Boolean(user?.isAdmin || user?.role === 'admin'),
  };
}
