import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';

// Components call useAuth() — never useContext(AuthContext) directly.
// The null check here turns "forgot to wrap in AuthProvider" into a loud error
// instead of a silent undefined at runtime.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
