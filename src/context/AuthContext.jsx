import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('civicpulse_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('civicpulse_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  function login(tokenValue, userObj) {
    localStorage.setItem('civicpulse_token', tokenValue);
    setToken(tokenValue);
    setUser(userObj);
  }

  function logout() {
    localStorage.removeItem('civicpulse_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
