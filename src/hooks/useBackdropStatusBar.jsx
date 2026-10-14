import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';

// El flujo de entrada (bienvenida + autenticación) siempre tiene fondo claro,
// sin importar el modo oscuro del resto de la app, así que sus iconos de la
// barra de estado siempre van oscuros. Al salir de la pantalla se devuelve el
// estilo claro que usa el resto de la app (ver App.jsx).
export function useBackdropStatusBar() {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('dark');
      return () => setStatusBarStyle('light');
    }, [])
  );
}
