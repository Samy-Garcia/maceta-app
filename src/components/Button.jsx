import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext.jsx';

// Botón principal usado en todos los de autenticación
export default function Button({ label, onPress, loading = false, disabled = false, icon }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={16} color={colors.white} style={styles.icon} /> : null}
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    button: {
      width: '100%',
      height: 50,
      backgroundColor: colors.primary,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabled: { opacity: 0.6 },
    content: { flexDirection: 'row', alignItems: 'center' },
    icon: { marginRight: 8 },
    label: { color: colors.white, fontSize: 16, fontWeight: '700' },
  });
