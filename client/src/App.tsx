import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@contexts/AuthContext';
import ProtectedRoute from '@components/common/ProtectedRoute';
import AuthPage from '@pages/AuthPage';
import OAuthCallbackPage from '@pages/OAuthCallbackPage';
import DashboardPage from '@pages/DashboardPage';

// Provider order matters:
//   QueryClientProvider → AuthProvider → BrowserRouter
// AuthProvider uses React Query-bound hooks (and API calls) so it must be
// inside QueryClientProvider. Routes need both, so BrowserRouter is innermost.

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* Default */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
