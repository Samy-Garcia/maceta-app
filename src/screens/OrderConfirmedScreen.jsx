import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';

export default function OrderConfirmedScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const order = route?.params?.order;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={40} color={colors.white} />
        </View>

        <Text style={styles.title}>¡Pedido confirmado!</Text>
        <Text style={styles.subtitle}>Tu pedido fue registrado y ya lo estamos preparando.</Text>

        {order ? (
          <View style={styles.orderCard}>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Código de pedido</Text>
              <Text style={styles.orderValue}>{order.orderCode}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Total</Text>
              <Text style={styles.orderValue}>$ {order.total?.toFixed?.(2) ?? order.total}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Dirección</Text>
              <Text style={styles.orderValue}>{order.shippingAddress}</Text>
            </View>
          </View>
        ) : null}

        <Button label="Ver mis pedidos" onPress={() => navigation.navigate('Orders')} />
        <Text style={styles.link} onPress={() => navigation.navigate('Home')}>Volver al inicio</Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
    checkCircle: {
      width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    },
    title: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 13, color: colors.placeholder, textAlign: 'center', marginBottom: 24, lineHeight: 19 },
    orderCard: { width: '100%', backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 24 },
    orderRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    orderLabel: { fontSize: 12, color: colors.placeholder },
    orderValue: { fontSize: 12, color: colors.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
    link: { color: colors.primary, fontSize: 13, fontWeight: '600', marginTop: 16 },
  });
