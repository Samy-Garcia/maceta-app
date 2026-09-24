import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext.jsx';
import { backdropFor } from '../theme/gradients.js';
import { useBackdropStatusBar } from '../hooks/useBackdropStatusBar.jsx';

// Fondo de las pantallas de autenticación: el mismo degradado verde suave
// de la pantalla de bienvenida.
export default function ScreenBackground({ children }) {
  const { isDark } = useTheme();
  useBackdropStatusBar();

  return (
    <LinearGradient colors={backdropFor(isDark)} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {children}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
});
