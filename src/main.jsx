import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App.jsx';
import { AuthProvider } from './components/Auth/authContext.jsx';
import { AudioSessionProvider } from './components/AudioSession/audioSession.jsx';
import { LanguageProvider } from './i18n/LanguageContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <AudioSessionProvider>
          <App />
        </AudioSessionProvider>
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>
);
