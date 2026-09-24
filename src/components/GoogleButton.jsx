import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext.jsx';

// Botón de Iniciar sesión con Google
export default function GoogleButton({ onPress, label = 'Inicia sesión con Google' }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.content}>
        <AntDesign name="google" size={17} color="#DB4437" style={styles.icon} />
        <Text style={styles.label}>{label}</Text>
      </View>
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
    content: { flexDirection: 'row', alignItems: 'center' },
    icon: { marginRight: 10 },
    label: { color: colors.text, fontSize: 14, fontWeight: '600' },
  });
