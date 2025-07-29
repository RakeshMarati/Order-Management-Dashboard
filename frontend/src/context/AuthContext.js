import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // You could verify the token here if needed
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.token);
      setUser({ token: response.token });
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError('');
  };

  const register = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      const response = await authAPI.register(email, password);
      localStorage.setItem('token', response.token);
      setUser({ token: response.token });
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};