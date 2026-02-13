import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for Google OAuth redirect (token in URL)
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        const urlUser = params.get('user');

        if (urlToken && urlUser) {
          // Google OAuth just completed — store token and user
          localStorage.setItem('token', urlToken);
          const parsedUser = JSON.parse(decodeURIComponent(urlUser));
          localStorage.setItem('user', JSON.stringify(parsedUser));
          setUser(parsedUser);

          // Clean URL (remove token/user params)
          window.history.replaceState({}, document.title, window.location.pathname);
          setLoading(false);
          return;
        }

        // Normal flow: verify stored token
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          setLoading(false);
          return;
        }

        const user = await authApi.getMe();
        if (user) {
          setUser(user);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const signup = async ({ username, email, password, displayName }) => {
    const result = await authApi.signup({ username, email, password, displayName });
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
    setUser(result.data.user);
    return result;
  };

  const signin = async ({ email, password }) => {
    const result = await authApi.signin({ email, password });
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
    setUser(result.data.user);
    return result;
  };

  const logout = async () => {
    await authApi.signout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, signin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};