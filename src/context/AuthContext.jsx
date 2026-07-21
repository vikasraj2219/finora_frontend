import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginRequest, registerRequest, meRequest, logoutRequest } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('pf_accessToken');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await meRequest();
        setUser(data.data.user);
      } catch (err) {
        localStorage.removeItem('pf_accessToken');
        localStorage.removeItem('pf_refreshToken');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (payload) => {
    const { data } = await loginRequest(payload);
    localStorage.setItem('pf_accessToken', data.data.accessToken);
    localStorage.setItem('pf_refreshToken', data.data.refreshToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (payload) => {
    const { data } = await registerRequest(payload);
    localStorage.setItem('pf_accessToken', data.data.accessToken);
    localStorage.setItem('pf_refreshToken', data.data.refreshToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (err) {
      // ignore — we clear local state regardless
    }
    localStorage.removeItem('pf_accessToken');
    localStorage.removeItem('pf_refreshToken');
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
