import { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext.jsx';

// Input de código de verificación de 6 dígitos
export default function OTPInput({ length = 6, value, onChange }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const inputRefs = useRef([]);

  const handleChangeDigit = (digit, index) => {
    const digits = value.split('');
    digits[index] = digit;
    const newValue = digits.join('').slice(0, length);
    onChange(newValue);

    if (digit && index < length - 1) {
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
          style={styles.box}
          maxLength={1}
          keyboardType="number-pad"
          value={value[index] || ''}
          onChangeText={(digit) => handleChangeDigit(digit, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
        />
      ))}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
    box: {
      width: 42,
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      textAlign: 'center',
      fontSize: 18,
      color: colors.text,
      backgroundColor: colors.surface,
    },
  });
