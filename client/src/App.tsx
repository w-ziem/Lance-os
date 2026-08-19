import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from '@contexts/AuthContext';
import ProtectedRoute from '@components/common/ProtectedRoute';
import AppLayout from '@components/layout/AppLayout';
import AuthPage from '@pages/AuthPage';
import OAuthCallbackPage from '@pages/OAuthCallbackPage';
import DashboardPage from '@pages/DashboardPage';
import ClientsPage from '@pages/ClientsPage';
import ProjectsPage from '@pages/ProjectsPage';
import TasksPage from '@pages/TasksPage';
import CalendarPage from '@pages/CalendarPage';
import SettingsPage from '@pages/SettingsPage';

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
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              },
              success: { iconTheme: { primary: 'var(--status-success)', secondary: '#fff' } },
              error: { iconTheme: { primary: 'var(--status-error)', secondary: '#fff' } },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />

            {/* Protected — all wrapped in AppLayout (Sidebar + Outlet) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
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
