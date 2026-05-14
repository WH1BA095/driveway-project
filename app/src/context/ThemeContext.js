import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { lightColors, darkColors, lightShadows, darkShadows } from '../constants/theme';

const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [override, setOverride] = useState(null); // null | 'light' | 'dark'
  const [loaded,   setLoaded]   = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('theme_override').then(val => {
      if (val === 'light' || val === 'dark') setOverride(val);
      setLoaded(true);
    });
  }, []);

  const scheme  = override || systemScheme || 'light';
  const isDark  = scheme === 'dark';
  const colors  = isDark ? darkColors  : lightColors;
  const shadows = isDark ? darkShadows : lightShadows;

  const setTheme = async (mode) => { // 'light' | 'dark' | 'system'
    if (mode === 'system') {
      setOverride(null);
      await SecureStore.deleteItemAsync('theme_override');
    } else {
      setOverride(mode);
      await SecureStore.setItemAsync('theme_override', mode);
    }
  };

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ colors, shadows, isDark, scheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
