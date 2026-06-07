'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { getStorage, setStorage, removeStorage } from '@/lib/utils';
import toast from 'react-hot-toast';

// ========================
// Auth Context
// ========================
const AuthContext = createContext(null);

// ========================
// Auth Provider
// ========================
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize user from localStorage
  useEffect(() => {
    const token    = getStorage('admin_token');
    const userData = getStorage('admin_user');

    if (token && userData) {
      setUser(userData);
    }
    setLoading(false);
  }, []);

  // ========================
  // Login
  // ========================
  const login = useCallback(async (credentials) => {
    const res = await authAPI.login(credentials);
    const { accessToken, refreshToken, user: userData } = res.data;

    setStorage('admin_token', accessToken);
    setStorage('admin_refresh', refreshToken);
    setStorage('admin_user', userData);
    setUser(userData);

    return userData;
  }, []);

  // ========================
  // Logout
  // ========================
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore API errors on logout
    } finally {
      removeStorage('admin_token');
      removeStorage('admin_refresh');
      removeStorage('admin_user');
      setUser(null);
      router.push('/admin/login');
      toast.success('Logged out successfully');
    }
  }, [router]);

  // ========================
  // Refresh token
  // ========================
  const refreshToken = useCallback(async () => {
    const refresh = getStorage('admin_refresh');
    if (!refresh) throw new Error('No refresh token');

    const res = await authAPI.refresh(refresh);
    const { accessToken, user: userData } = res.data;

    setStorage('admin_token', accessToken);
    setStorage('admin_user', userData);
    setUser(userData);

    return accessToken;
  }, []);

  // ========================
  // Change password
  // ========================
  const changePassword = useCallback(async (data) => {
    const res = await authAPI.changePassword(data);
    const { accessToken, refreshToken: newRefresh, user: userData } = res.data;

    setStorage('admin_token', accessToken);
    setStorage('admin_refresh', newRefresh);
    setStorage('admin_user', userData);
    setUser(userData);

    return res.data;
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshToken,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ========================
// useAuth Hook
// ========================
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// ========================
// withAuth HOC — wraps admin pages
// ========================
export function withAuth(Component) {
  return function ProtectedComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.replace('/admin/login');
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className="min-h-screen bg-[#07071a] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!user) return null;

    return <Component {...props} />;
  };
}
