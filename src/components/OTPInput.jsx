import { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext.jsx';

// Input de código de verificación de 6 dígitos
export default function OTPInput({ length = 6, value, onChange }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const inputRefs = useRef([]);

  const handleChangeDigit = (char, index) => {
    // El backend genera códigos hexadecimales (0-9 y A-F), no solo dígitos
    const clean = char.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
    const digits = value.split('');
    digits[index] = clean;
    const newValue = digits.join('').slice(0, length);
    onChange(newValue);

    if (clean && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[styles.box, value[index] ? styles.boxFilled : null]}
          maxLength={1}
          keyboardType="default"
          autoCapitalize="characters"
          placeholder="."
          placeholderTextColor={colors.placeholder}
          value={value[index] || ''}
          onChangeText={(digit) => handleChangeDigit(digit, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
        />
      ))}
    </View>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 18,
    },
    box: {
      width: 46,
      height: 56,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E5EAE6',
      borderRadius: 14,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      backgroundColor: isDark ? colors.surface : '#F7F9F8',
    },
    boxFilled: {
      backgroundColor: colors.surface,
      borderColor: colors.primary,
    },
  });
