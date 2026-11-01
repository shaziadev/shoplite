import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);
const TOKEN_KEY = 'shoplite_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  // On first load (or when the token changes) fetch the current user.
  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    api('/auth/me', { token })
      .then((data) => setUser(data.user))
      .catch(() => logout()) // expired/invalid token
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const saveSession = ({ user: u, token: t }) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(u);
  };

  const login = async (email, password) =>
    saveSession(await api('/auth/login', { method: 'POST', body: { email, password } }));

  const register = async (name, email, password) =>
    saveSession(await api('/auth/register', { method: 'POST', body: { name, email, password } }));

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  const value = { user, token, loading, login, register, logout, isAdmin: user?.role === 'admin' };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
