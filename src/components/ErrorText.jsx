import { StyleSheet, Text } from 'react-native';

// Mensaje de error de formulario por si no esta bien algunas cosasutilice en todas las pantallas de auth
export default function ErrorText({ message }) {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  error: {
    color: '#C0392B',
    fontSize: 13,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
});
