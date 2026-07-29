import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AUTH_API } from '../../api.js';
import { withLangHeader } from '../../i18n/localize.js';

export const AuthContext = createContext(null);
const getErrorMessage = (error, fallback) => error?.response?.data?.message || fallback;
const TOKEN_KEY = 'token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authLoading, setAuthLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${AUTH_API}/login`, { email, password }, { headers: withLangHeader() });
      if (!data?.token || !data?.user) return { success: false, message: 'Login failed' };
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        needsVerification: Boolean(error?.response?.data?.needsVerification),
        message: getErrorMessage(error, 'Invalid email or password'),
      };
    }
  };

  const verifyEmail = async ({ token: verifyToken, code, email }) => {
    try {
      const { data } = await axios.post(`${AUTH_API}/verify-email`, { token: verifyToken, code, email }, { headers: withLangHeader() });
      return { success: true, message: data?.message || 'Email verified' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'Verification failed') };
    }
  };

  const resendVerification = async (email) => {
    try {
      const { data } = await axios.post(`${AUTH_API}/resend-verification`, { email }, { headers: withLangHeader() });
      return { success: true, message: data?.message || 'Code ready', code: data?.code || null, emailMode: data?.emailMode || 'test' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'Send failed') };
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setAuthLoading(false);
      return undefined;
    }
    let cancelled = false;
    setAuthLoading(true);
    axios
      .get(`${AUTH_API}/me`, { headers: withLangHeader({ Authorization: `Bearer ${token}` }) })
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.token) localStorage.setItem(TOKEN_KEY, data.token);
        if (data?.user) setUser(data.user);
        else {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        if ([401, 403, 404].includes(error?.response?.status)) {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem(TOKEN_KEY);
    setAuthLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, logout, verifyEmail, resendVerification }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
