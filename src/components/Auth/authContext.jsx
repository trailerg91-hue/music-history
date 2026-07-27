import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AUTH_API, API_BASE } from '../../api.js';

export const AuthContext = createContext(null);

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

export const AuthProvider = ({ children }) => {
  const TOKEN_KEY = 'token';

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authLoading, setAuthLoading] = useState(() => Boolean(localStorage.getItem('token')));

  const token = () => localStorage.getItem(TOKEN_KEY);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const register = async (fullName, email, password) => {
    try {
      const { data } = await axios.post(`${AUTH_API}/register`, { fullName, email, password });
      return {
        success: true,
        needsVerification: Boolean(data?.needsVerification),
        passwordUpdated: Boolean(data?.passwordUpdated),
        message: data?.message || 'დაადასტურე ანგარიში კოდით.',
        code: data?.code || null,
        emailMode: data?.emailMode || 'test',
      };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'რეგისტრაცია ვერ მოხერხდა') };
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${AUTH_API}/login`, { email, password });
      if (!data?.token || !data?.user) return { success: false, message: 'შესვლა ვერ მოხერხდა' };
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        needsVerification: Boolean(error?.response?.data?.needsVerification),
        message: getErrorMessage(error, 'არასწორი ელ-ფოსტა ან პაროლი'),
      };
    }
  };

  const verifyEmail = async ({ token: verifyToken, code, email }) => {
    try {
      const { data } = await axios.post(`${AUTH_API}/verify-email`, {
        token: verifyToken,
        code,
        email,
      });
      return { success: true, message: data?.message || 'ელ-ფოსტა დადასტურდა' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'ვერიფიკაცია ვერ მოხერხდა') };
    }
  };

  const resendVerification = async (email) => {
    try {
      const { data } = await axios.post(`${AUTH_API}/resend-verification`, { email });
      return {
        success: true,
        message: data?.message || 'კოდი მზადაა',
        code: data?.code || null,
        emailMode: data?.emailMode || 'test',
      };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'გაგზავნა ვერ მოხერხდა') };
    }
  };

  useEffect(() => {
    const t = token();
    if (!t) {
      setAuthLoading(false);
      return;
    }

    let cancelled = false;
    setAuthLoading(true);

    const cached = (() => {
      try {
        return JSON.parse(localStorage.getItem('user') || 'null');
      } catch {
        return null;
      }
    })();

    axios
      .get(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${t}`,
          ...(cached?.email ? { 'X-User-Email': cached.email } : {}),
        },
      })
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
        const status = error?.response?.status;
        // ქსელის შეცდომაზე სესიას არ ვშლით — მხოლოდ auth უარყოფაზე
        if (status === 401 || status === 403 || status === 404) {
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
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        register,
        login,
        logout,
        verifyEmail,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
