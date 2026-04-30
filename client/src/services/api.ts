import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { AccessTokenResponse } from '@/types/auth';

// ---------------------------------------------------------------------------
// Auth bridge
// ---------------------------------------------------------------------------
// api.ts must not import React/AuthContext (circular dep, wrong lifecycle).
// Instead, AuthProvider injects callbacks on mount via configureAuth().
// Everything below uses these callbacks to read/write the current token.
// ---------------------------------------------------------------------------

type TokenGetter = () => string | null;
type TokenSetter = (token: string | null) => void;
type LogoutHandler = () => void;

let getAccessToken: TokenGetter = () => null;
let setAccessToken: TokenSetter = () => { };
let onLogout: LogoutHandler = () => { };

export function configureAuth(opts: {
  getAccessToken: TokenGetter;
  setAccessToken: TokenSetter;
  onLogout: LogoutHandler;
}) {
  getAccessToken = opts.getAccessToken;
  setAccessToken = opts.setAccessToken;
  onLogout = opts.onLogout;
}


const api: AxiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request intezrceptor: inject Bearer token on every call.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor: silent refresh on 401
// ---------------------------------------------------------------------------
// When a request returns 401, we:
//   1. Call /auth/refresh (which uses the HttpOnly refresh cookie).
//   2. Save the new access token.
//   3. Retry the original request with the new token.
//
// Concurrency: if 3 requests race and all get 401, we only want ONE refresh.
// The other two wait on the same promise, then retry with the fresh token.
// ---------------------------------------------------------------------------

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  // refresh token need to use different axios instance not to re-trigger interceptors
  const response = await axios.post<AccessTokenResponse>(
    '/api/auth/refresh',
    null,
    { withCredentials: true }
  );
  return response.data.accessToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401 that we haven't already retried.
    // Never try to refresh on /auth/* endpoints — that would loop.
    const isAuthEndpoint = original?.url?.includes('/auth/');
    if (error.response?.status !== 401 || original._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      // Deduplicate concurrent refreshes.
      refreshPromise ??= refreshAccessToken();
      const newToken = await refreshPromise;
      setAccessToken(newToken);

      original.headers.set('Authorization', `Bearer ${newToken}`);
      return api(original);
    } catch (refreshError) {
      // Refresh failed → session is dead. Clear state and let caller fail.
      setAccessToken(null);
      onLogout();
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  }
);

export default api;
