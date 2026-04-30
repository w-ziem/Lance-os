import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@hooks/useAuth';
import type { AccessTokenResponse } from '@/types/auth';

// Landing page after Google OAuth2. Backend has already set the refresh
// cookie; we exchange it for an access token via /auth/refresh, then move on.
// We call axios directly (not our `api` instance) because calling
// /auth/refresh through our interceptor would start its own 401 dance.

type Status = 'exchanging' | 'success' | 'failed';

export default function OAuthCallbackPage() {
  const { setSession } = useAuth();
  const [status, setStatus] = useState<Status>('exchanging');

  useEffect(() => {
    let cancelled = false;

    async function exchange() {
      try {
        const response = await axios.post<AccessTokenResponse>(
          '/api/auth/refresh',
          null,
          { withCredentials: true },
        );
        if (!cancelled) {
          setSession(response.data.accessToken);
          setStatus('success');
        }
      } catch {
        if (!cancelled) setStatus('failed');
      }
    }

    exchange();
    return () => {
      cancelled = true;
    };
  }, [setSession]);

  if (status === 'success') return <Navigate to="/dashboard" replace />;
  if (status === 'failed') return <Navigate to="/auth" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-500">Finishing sign in…</p>
    </div>
  );
}
