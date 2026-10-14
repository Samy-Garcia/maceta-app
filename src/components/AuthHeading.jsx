import { StyleSheet, Text, View } from 'react-native';
import { lightColors } from '../theme/palettes.js';
import { SERIF } from '../theme/typography.js';

// Título serif + subtítulo que encabeza cada tarjeta de autenticación.
// Fija colores claros: el flujo de autenticación no sigue el modo oscuro.
export default function AuthHeading({ title, subtitle }) {
  const colors = lightColors;
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { alignItems: 'center', marginTop: 16, marginBottom: 20 },
    title: {
      fontFamily: SERIF,
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      marginTop: 8,
      fontSize: 13,
      lineHeight: 19,
      color: colors.placeholder,
      textAlign: 'center',
    },
  });
