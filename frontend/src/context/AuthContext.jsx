import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const userData = {
      _id: data._id,
      name: data.name,
      username: data.username || null,
      email: data.email,
      careerProfile: data.careerProfile || {},
      personalStreak: data.personalStreak || 0,
      lastActiveDate: data.lastActiveDate || null,
      lastLessonCompletedDate: data.lastLessonCompletedDate || null,
    };
    setUser(userData);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    toast.success(`Welcome back, ${data.name}! 🎉`);
    return data;
  };

  const signup = async (name, username, email, password) => {
    const { data } = await api.post('/auth/signup', { name, username, email, password });
    const userData = {
      _id: data._id,
      name: data.name,
      username: data.username,
      email: data.email,
      careerProfile: data.careerProfile || {},
      personalStreak: data.personalStreak || 0,
      lastActiveDate: data.lastActiveDate || null,
      lastLessonCompletedDate: data.lastLessonCompletedDate || null,
    };
    setUser(userData);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    toast.success(`Account created! Welcome, ${data.name}! 🚀`);
    return data;
  };

  const updateCareerProfile = (careerProfile) => {
    setUser((prev) => {
      const updated = { ...prev, careerProfile };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const updateStreak = (streakData) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        personalStreak: streakData.personalStreak,
        lastActiveDate: streakData.lastActiveDate,
        lastLessonCompletedDate: streakData.lastLessonCompletedDate,
      };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateCareerProfile, updateStreak }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
