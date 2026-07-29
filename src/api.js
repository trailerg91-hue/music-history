import { withLangHeader } from './i18n/localize.js';

const DEFAULT_DEV_API = 'http://localhost:5000/api';
const DEFAULT_PROD_API = 'https://music-history-backend-6ojw.onrender.com/api';

function resolveApiBase() {
  const fromEnv = String(import.meta.env.VITE_API_BASE || '').trim();

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    if (!isLocalHost) {
      if (!fromEnv || fromEnv.includes('localhost') || fromEnv.includes('127.0.0.1')) {
        return DEFAULT_PROD_API;
      }
      return fromEnv;
    }
  }

  if (fromEnv) return fromEnv;
  return import.meta.env.PROD ? DEFAULT_PROD_API : DEFAULT_DEV_API;
}

export const API_BASE = resolveApiBase();
export const AUTH_API = `${API_BASE}/auth`;
export const ADMIN_USERS_API = `${API_BASE}/admin/users`;

export async function apiGet(path, headers = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: withLangHeader(headers),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}
