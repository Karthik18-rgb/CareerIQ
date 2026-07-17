import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState(null);

  // Safety wrapper: error state must ALWAYS be a string or null, never an object/array
  const setError = useCallback((val) => {
    if (typeof val === 'string' || val === null) {
      _setError(val);
    } else {
      _setError('An unexpected error occurred.');
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then(({ data }) => setUser(data))
      .catch(() => {
        // Token invalid or expired — clear everything
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      localStorage.setItem('accessToken', data.tokens.access_token);
      localStorage.setItem('refreshToken', data.tokens.refresh_token);
      setUser(data.user);
      return data;
    } catch (err) {
      const raw = err?.response?.data?.detail;
      let message = 'Login failed. Please try again.';
      if (typeof raw === 'string') {
        message = raw;
      } else if (raw && typeof raw.msg === 'string') {
        message = raw.msg;
      } else if (Array.isArray(raw) && raw[0]?.msg) {
        message = raw[0].msg;
      } else if (err?.message) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await authApi.register(payload);
      localStorage.setItem('accessToken', data.tokens.access_token);
      localStorage.setItem('refreshToken', data.tokens.refresh_token);
      setUser(data.user);
      return data;
    } catch (err) {
      const raw = err?.response?.data?.detail;
      let message = 'Registration failed. Please try again.';
      if (typeof raw === 'string') {
        message = raw;
      } else if (raw && typeof raw.msg === 'string') {
        message = raw.msg;
      } else if (Array.isArray(raw) && raw[0]?.msg) {
        message = raw[0].msg;
      } else if (err?.message) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
