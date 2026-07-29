import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App.jsx';
import { AuthProvider } from './components/Auth/authContext.jsx';
import { AudioSessionProvider } from './components/AudioSession/audioSession.jsx';
import { LanguageProvider } from './i18n/LanguageContext.jsx';
import { ToastProvider } from './components/Toast/Toast.jsx';
import { ThemeProvider } from './components/ThemeToggle/ThemeToggle.jsx';
import { API_BASE } from './api.js';

// Wake Render free-tier early so later content fetches are warmer.
const wakeUrl = `${API_BASE}/health`;
fetch(wakeUrl, { method: 'GET', mode: 'cors', cache: 'no-store' }).catch(() => {});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AudioSessionProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </AudioSessionProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>
);
