import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import axios from 'axios';
import api, { configureAuth } from '@services/api';
import type { AccessTokenResponse, AuthUser } from '@/types/auth';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;   // true while the initial silent refresh runs
  setSession: (token: string, user?: AuthUser | null) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
// - Holds access token in state (re-renders on change).
// - Holds token in a ref too so api.ts can read the latest synchronously.
// - On mount, tries /auth/refresh once — if the cookie is valid, user stays
//   logged in across page reloads without re-typing a code.
// ---------------------------------------------------------------------------

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const accessTokenRef = useRef<string | null>(null);

  const setSession = useCallback(async (token: string) => {
    accessTokenRef.current = token;
    setAccessTokenState(token);
    const userDto = (await api.get("/auth/me")).data
    setUser(userDto);
    console.log(`Started session for user: ${userDto}`);
  }, []);

  const clearSession = useCallback(() => {
    accessTokenRef.current = null;
    setAccessTokenState(null);
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Server-side logout failure doesn't block client-side cleanup.
    }
    clearSession();
  }, [clearSession]);

  // Wire api.ts callbacks to this provider. Runs once after first render.
  useEffect(() => {
    configureAuth({
      getAccessToken: () => accessTokenRef.current,
      setAccessToken: (token) => {
        accessTokenRef.current = token;
        setAccessTokenState(token);
      },
      onLogout: clearSession,
    });
  }, [clearSession]);

  // Silent bootstrap: try to restore session from refresh cookie.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const response = await axios.post<AccessTokenResponse>(
          '/api/auth/refresh',
          null,
          { withCredentials: true }
        );
        if (!cancelled) {
          setSession(response.data.accessToken);
        }
      } catch {
        // No valid refresh cookie → user stays logged out. Not an error.
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [setSession]);

  const value: AuthContextValue = {
    user,
    accessToken,
    isAuthenticated: !!accessToken,
    isBootstrapping,
    setSession,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
