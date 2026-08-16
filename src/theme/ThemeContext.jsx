import { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors } from './palettes.js';

const THEME_STORAGE_KEY = '@macetas/theme_preference';

const ThemeContext = createContext(null);

// Tema global de la app (claro/oscuro). Arranca con la preferencia guardada
// o, si no hay ninguna, con el tema del sistema operativo.
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');
  const [themeLoading, setThemeLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'dark' || stored === 'light') {
        setIsDark(stored === 'dark');
      }
      setThemeLoading(false);
    });
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
      return next;
    });
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme, themeLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}
