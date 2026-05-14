import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { restoreSession(); }, []);

  const restoreSession = async () => {
    try {
      const token  = await SecureStore.getItemAsync('auth_token');
      const stored = await SecureStore.getItemAsync('auth_user');
      if (token && stored) {
        // Сначала восстанавливаем из кэша (быстро)
        setUser(JSON.parse(stored));
        // Затем тихо верифицируем токен на сервере
        const res = await api.profile().catch(() => null);
        if (res && !res.success) {
          // Токен устарел — разлогиниваем
          await SecureStore.deleteItemAsync('auth_token');
          await SecureStore.deleteItemAsync('auth_user');
          setUser(null);
        }
      }
    } catch {
      // Ошибка парсинга или SecureStore — сбрасываем
      await SecureStore.deleteItemAsync('auth_token').catch(() => {});
      await SecureStore.deleteItemAsync('auth_user').catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (!res.success) throw new Error(res.message);
    await SecureStore.setItemAsync('auth_token', res.token);
    await SecureStore.setItemAsync('auth_user',  JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const register = async (data) => {
    const res = await api.register(data);
    if (!res.success) throw new Error(res.message);
    await SecureStore.setItemAsync('auth_token', res.token);
    await SecureStore.setItemAsync('auth_user',  JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    await api.logout().catch(() => {});
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('auth_user');
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    SecureStore.setItemAsync('auth_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
