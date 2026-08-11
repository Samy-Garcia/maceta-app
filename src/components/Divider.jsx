import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors.jsx';

// se separa por si quiere o el de cuenta de google 
export default function Divider({ label = 'O' }) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 16 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  label: { marginHorizontal: 10, color: colors.placeholder, fontSize: 13 },
});
