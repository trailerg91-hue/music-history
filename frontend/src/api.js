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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let wakePromise = null;

/** Keep Render free-tier answering while the SPA boots. */
export function wakeBackend({ timeoutMs = 90000 } = {}) {
  if (wakePromise) return wakePromise;

  const run = (async () => {
    const url = `${API_BASE}/health`;
    const started = Date.now();
    let delay = 800;

    while (Date.now() - started < timeoutMs) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);
        const res = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (res.ok) return true;
      } catch {
        // cold start / network — keep trying
      }
      await sleep(delay);
      delay = Math.min(delay + 400, 3000);
    }
    return false;
  })();

  wakePromise = run;
  run.then((ok) => {
    if (!ok) wakePromise = null;
  });
  return run;
}

async function fetchJson(path, headers, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: withLangHeader(headers),
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function apiGet(path, headers = {}) {
  await wakeBackend();

  let lastError;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      return await fetchJson(path, headers, 20000);
    } catch (error) {
      lastError = error;
      // Re-arm wake after a failed attempt (common right as Render is booting).
      wakePromise = null;
      await wakeBackend({ timeoutMs: 45000 });
      await sleep(600 * (attempt + 1));
    }
  }
  throw lastError || new Error(`Request failed: ${path}`);
}
