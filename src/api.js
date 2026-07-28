const DEFAULT_DEV_API = 'http://localhost:5000/api';
const DEFAULT_PROD_API = 'https://music-history-backend-6ojw.onrender.com/api';

export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.PROD ? DEFAULT_PROD_API : DEFAULT_DEV_API);

export const AUTH_API = `${API_BASE}/auth`;
export const ADMIN_USERS_API = `${API_BASE}/admin/users`;
