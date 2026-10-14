import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightColors } from '../theme/palettes.js';

// Campo de formulario con etiqueta, que ocupe en Login, Registro y recuperación.
// Si es de contraseña muestra el ojito para ver u ocultar lo escrito.
// Fija colores claros: el flujo de autenticación no sigue el modo oscuro.
export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  uppercaseLabel = false,
}) {
  const colors = lightColors;
  const isDark = false;
  const styles = createStyles(colors, isDark);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, uppercaseLabel && styles.labelUppercase]}>{label}</Text>
      ) : null}

      <View style={styles.inputWrap}>
        <TextInput
          style={[styles.input, secureTextEntry && styles.inputWithIcon]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry && hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.eye}
            onPress={() => setHidden((prev) => !prev)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={19}
              color={colors.placeholder}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    container: { width: '100%', marginBottom: 14 },
    label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 7 },
    labelUppercase: {
      fontSize: 11,
      letterSpacing: 1.4,
      color: colors.placeholder,
      textTransform: 'uppercase',
    },
    inputWrap: { width: '100%', justifyContent: 'center' },
    input: {
      width: '100%',
      height: 50,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E5EAE6',
      borderRadius: 12,
      paddingHorizontal: 14,
      fontSize: 15,
      color: colors.text,
      backgroundColor: isDark ? colors.surface : '#F7F9F8',
    },
    inputWithIcon: { paddingRight: 46 },
    eye: { position: 'absolute', right: 14 },
  });
