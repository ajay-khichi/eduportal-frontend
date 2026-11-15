import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, userApi } from '../api/authApi';
import { getErrorMessage } from '../api/axiosClient';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Parse JWT token to extract claims if needed
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const loadUserProfile = useCallback(async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const claims = parseJwt(accessToken);
      const profile = await userApi.getCurrentUser();
      setUser({
        ...profile,
        id: claims?.userId || null,
        email: profile.email || claims?.sub,
        role: profile.role || claims?.role,
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      // If profile fails, check if we still have valid claims
      const claims = parseJwt(accessToken);
      if (claims?.sub) {
        setUser({
          email: claims.sub,
          id: claims.userId,
          role: claims.role,
          active: true,
        });
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);

      const claims = parseJwt(res.accessToken);
      let fullProfile = null;
      try {
        fullProfile = await userApi.getCurrentUser();
      } catch (e) {
        // Fallback to token claims
      }

      const userData = {
        ...(fullProfile || {}),
        id: claims?.userId,
        email: fullProfile?.email || claims?.sub || email,
        role: fullProfile?.role || claims?.role,
        active: fullProfile?.active ?? true,
      };

      setUser(userData);
      toast.success(`Welcome back, ${userData.email}!`);
      return userData;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      throw error;
    }
  };

  const register = async (email, password) => {
    try {
      const res = await authApi.register({ email, password });
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);

      const claims = parseJwt(res.accessToken);
      let fullProfile = null;
      try {
        fullProfile = await userApi.getCurrentUser();
      } catch (e) {
        // Fallback
      }

      const userData = {
        ...(fullProfile || {}),
        id: claims?.userId,
        email: fullProfile?.email || claims?.sub || email,
        role: fullProfile?.role || claims?.role || 'STUDENT',
        active: true,
      };

      setUser(userData);
      toast.success('Registration successful! Welcome to EduPortal.');
      return userData;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      throw error;
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (err) {
      console.warn('Logout network error (local session still cleared):', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      toast.success('You have been logged out.');
    }
  };

  const hasRole = (roles) => {
    if (!user || !user.role) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isCollegeAdmin = user?.role === 'COLLEGE_ADMIN';
  const isAdmin = isSuperAdmin || isCollegeAdmin;
  const isFaculty = user?.role === 'FACULTY';
  const isStudent = user?.role === 'STUDENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        hasRole,
        isSuperAdmin,
        isCollegeAdmin,
        isAdmin,
        isFaculty,
        isStudent,
        reloadProfile: loadUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
