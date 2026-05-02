import { jwtDecode } from "jwt-decode";
import React, { createContext, useContext, useEffect, useState } from "react";

import { authApi, registerAuthStore } from "../lib/api";

const AuthContext = createContext(null);

const ACCESS_KEY = "lms_access";
const REFRESH_KEY = "lms_refresh";
const USER_KEY = "lms_user";

const loadStoredUser = () => {
  try {
    const rawUser = localStorage.getItem(USER_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(ACCESS_KEY));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(REFRESH_KEY));
  const [user, setUser] = useState(() => loadStoredUser());
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(ACCESS_KEY)));

  const persistAuth = (payload) => {
    if (payload.access) {
      localStorage.setItem(ACCESS_KEY, payload.access);
      setAccessToken(payload.access);
    }
    if (payload.refresh) {
      localStorage.setItem(REFRESH_KEY, payload.refresh);
      setRefreshToken(payload.refresh);
    }
    if (payload.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
      setUser(payload.user);
    } else if (payload.access) {
      try {
        const decoded = jwtDecode(payload.access);
        setUser((currentUser) => currentUser || { username: decoded.username, role: decoded.role });
      } catch {
        // Ignore malformed tokens; refresh flow or profile request can repopulate user.
      }
    }
  };

  const logout = () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  useEffect(() => {
    registerAuthStore({
      getAccessToken: () => localStorage.getItem(ACCESS_KEY),
      getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
      updateTokens: persistAuth,
      logout,
    });
  }, []);

  useEffect(() => {
    const hydrateUser = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }
    if (user?.role) {
        setLoading(false);
        return;
      }
      try {
        const response = await authApi.profile();
        persistAuth({ user: response.data });
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    hydrateUser();
  }, [accessToken, user?.role]);

  const login = async (payload) => {
    const response = await authApi.login(payload);
    persistAuth(response.data);
    return response.data;
  };

  const register = async (payload) => {
    const response = await authApi.register(payload);
    return response.data;
  };

  const refreshProfile = async () => {
    const response = await authApi.profile();
    persistAuth({ user: response.data });
    return response.data;
  };

  const value = {
    accessToken,
    refreshToken,
    user,
    loading,
    isAuthenticated: Boolean(accessToken),
    login,
    register,
    logout,
    persistAuth,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
