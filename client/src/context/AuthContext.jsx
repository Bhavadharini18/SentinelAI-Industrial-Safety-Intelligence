import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sentinel_token'));
  const [loading, setLoading] = useState(true);

  // Set default axios base URL and authorization header
  axios.defaults.baseURL = 'http://localhost:5000/api';

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('sentinel_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Login failed. Please check credentials.' 
      };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await axios.post('/auth/register', { name, email, password, role });
      if (res.data.success) {
        localStorage.setItem('sentinel_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.error || 'Registration failed.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('sentinel_token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
