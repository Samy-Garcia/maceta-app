import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext.jsx';

// Separador entre el botón principal y el de Google: dos líneas con un
// circulito al centro (o una etiqueta, si se le pasa una)
export default function Divider({ label }) {
  const { colors } = useTheme();
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
