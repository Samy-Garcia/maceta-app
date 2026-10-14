import { StyleSheet, Text, View } from 'react-native';
import { lightColors } from '../theme/palettes.js';

// Separador entre el botón principal y el de Google: dos líneas con un
// circulito al centro (o una etiqueta, si se le pasa una).
// Fija colores claros: el flujo de autenticación no sigue el modo oscuro.
export default function Divider({ label }) {
  const colors = lightColors;
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.line} />
      {label ? <Text style={styles.label}>{label}</Text> : <View style={styles.circle} />}
      <View style={styles.line} />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 18 },
    line: { flex: 1, height: 1, backgroundColor: colors.border },
    circle: {
      width: 9,
      height: 9,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.border,
      marginHorizontal: 12,
    },
    label: { marginHorizontal: 10, color: colors.placeholder, fontSize: 13 },
  });
