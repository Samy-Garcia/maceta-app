import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../services/api.js';

const AuthContext = createContext(null);

// Maneja la sesión del cliente logueado (cookie httpOnly "authCookie" que pone el backend).
// authLoading indica si todavía se está revisando si ya existe una sesión activa al abrir la app.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const client = await apiFetch('/api/loginClient/me');
      setUser(client);
      return client;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setAuthLoading(false));
  }, [refreshUser]);

  const login = useCallback(
    async (email, password) => {
      await apiFetch('/api/loginClient', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return refreshUser();
    },
    [refreshUser]
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, authLoading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
