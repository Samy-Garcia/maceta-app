import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import { useTheme } from '../theme/ThemeContext.jsx';

// El flujo de entrada (bienvenida + autenticación) tiene fondo claro, así que
// necesita los iconos de la barra de estado oscuros. Al salir de la pantalla se
// devuelve el estilo claro que usa el resto de la app (ver App.jsx).
export function useBackdropStatusBar() {
  const { isDark } = useTheme();

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(isDark ? 'light' : 'dark');
      return () => setStatusBarStyle('light');
    }, [isDark])
  );
}
