import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '../theme/colors.jsx';

// Botón de Iniciar sesión con Google
export default function GoogleButton({ onPress, label = 'Inicia sesión Con Google' }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.content}>
        <AntDesign name="google" size={18} color="#DB4437" style={styles.icon} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 10 },
  label: { color: colors.text, fontSize: 14, fontWeight: '600' },
});
