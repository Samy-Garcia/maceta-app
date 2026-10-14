import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { lightColors } from '../theme/palettes.js';

// Botón de Iniciar sesión con Google.
// Fija colores claros: el flujo de autenticación no sigue el modo oscuro.
export default function GoogleButton({ onPress, label = 'Inicia sesión con Google', loading = false }) {
  const colors = lightColors;
  const isDark = false;
  const styles = createStyles(colors, isDark);

  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonLoading]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <View style={styles.content}>
          <AntDesign name="google" size={17} color="#DB4437" style={styles.icon} />
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    button: {
      width: '100%',
      height: 50,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E5EAE6',
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonLoading: { opacity: 0.75 },
    content: { flexDirection: 'row', alignItems: 'center' },
    icon: { marginRight: 10 },
    label: { color: colors.text, fontSize: 14, fontWeight: '600' },
  });
