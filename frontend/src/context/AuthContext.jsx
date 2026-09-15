import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('careerfit_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('careerfit_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('careerfit_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Failed to fetch user:', err);
          setUser(null);
          localStorage.removeItem('careerfit_token');
          localStorage.removeItem('careerfit_user');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('careerfit_token', access_token);
    localStorage.setItem('careerfit_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('careerfit_token', access_token);
    localStorage.setItem('careerfit_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('careerfit_token');
    localStorage.removeItem('careerfit_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
