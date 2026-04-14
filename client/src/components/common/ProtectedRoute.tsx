import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

// Guards any nested routes. Three possible states:
//   1. Still bootstrapping (initial /auth/refresh in flight) → show loader.
//   2. Authenticated → render the nested route via <Outlet />.
//   3. Not authenticated → redirect to /auth, remembering where we came from
//      so AuthPage can send the user back there after login.

export default function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
