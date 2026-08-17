import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { formatOrderDate, getStatusMeta, STATUS_STEP, STEPS } from '../utils/orderStatus.js';

export default function OrderDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const order = route?.params?.order;

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pedido</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.stateText}>No se encontró este pedido.</Text>
        </View>
        <BottomTabBar active="Pedidos" />
      </SafeAreaView>
    );
  }

  const meta = getStatusMeta(order.status);
  const isRejected = order.status === 'Rechazado';
  const currentStep = STATUS_STEP[order.status] ?? 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{order.orderCode}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>{meta.label}</Text>
          <Text style={styles.date}>{formatOrderDate(order.createdAt)}</Text>
        </View>

        {!isRejected ? (
          <View style={styles.trackerCard}>
            <View style={styles.trackerRow}>
              {STEPS.map((step, index) => {
                const done = index < currentStep;
                const active = index === currentStep;
                return (
                  <View key={step} style={styles.trackerStepWrapper}>
                    <View style={[styles.trackerDot, (done || active) && styles.trackerDotActive]}>
                      {done ? <Ionicons name="checkmark" size={12} color={colors.white} /> : null}
                    </View>
                    {index < STEPS.length - 1 ? (
                      <View style={[styles.trackerLine, done && styles.trackerLineActive]} />
                    ) : null}
                  </View>
                );
              })}
            </View>
            <View style={styles.trackerLabels}>
              {STEPS.map((step, index) => (
                <Text key={step} style={[styles.trackerLabel, index === currentStep && styles.trackerLabelActive]}>
                  {step}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Productos</Text>
          {(order.products || []).map((item) => (
            <View key={item._id} style={styles.orderItem}>
              <View>
                <Text style={styles.orderItemName}>{item.product?.name || 'Producto eliminado'}</Text>
                <Text style={styles.orderItemMeta}>Cant: {item.quantity}</Text>
              </View>
              <Text style={styles.orderItemPrice}>$ {item.subtotal?.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="car-outline" size={14} color={colors.text} />
            <Text style={styles.cardTitle}>Detalles de Envío</Text>
          </View>
          <Text style={styles.detailText}>{order.shippingAddress}</Text>
          <Text style={styles.detailMeta}>{order.contactPhone}</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.totalValue}>$ {order.total?.toFixed(2)}</Text>
          </View>
          {order.couponCode ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Cupón usado</Text>
              <Text style={styles.summaryValue}>{order.couponCode}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <BottomTabBar active="Pedidos" />
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.shopBg },
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 18,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: { color: colors.white, fontSize: 17, fontWeight: '700' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    stateText: { fontSize: 13, color: colors.placeholder },
    content: { padding: 20, paddingBottom: 24 },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    statusLabel: { fontSize: 18, fontWeight: '800', color: colors.text },
    date: { fontSize: 12, color: colors.placeholder },
    trackerCard: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 16 },
    trackerRow: { flexDirection: 'row', alignItems: 'center' },
    trackerStepWrapper: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    trackerDot: {
      width: 24, height: 24, borderRadius: 12, backgroundColor: colors.border,
      alignItems: 'center', justifyContent: 'center',
    },
    trackerDotActive: { backgroundColor: colors.primary },
    trackerLine: { flex: 1, height: 2, backgroundColor: colors.border },
    trackerLineActive: { backgroundColor: colors.primary },
    trackerLabels: { flexDirection: 'row', marginTop: 6 },
    trackerLabel: { flex: 1, fontSize: 9, color: colors.placeholder, textAlign: 'center' },
    trackerLabelActive: { color: colors.primary, fontWeight: '700' },
    card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 16 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    cardTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginLeft: 4 },
    orderItem: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    orderItemName: { fontSize: 13, fontWeight: '700', color: colors.text },
    orderItemMeta: { fontSize: 11, color: colors.placeholder, marginTop: 2 },
    orderItemPrice: { fontSize: 13, fontWeight: '700', color: colors.primary },
    detailText: { fontSize: 13, color: colors.text, marginTop: 6, lineHeight: 18 },
    detailMeta: { fontSize: 12, color: colors.placeholder, marginTop: 4 },
    summaryCard: { backgroundColor: colors.card, borderRadius: 14, padding: 16 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    summaryLabel: { fontSize: 13, color: colors.placeholder },
    summaryValue: { fontSize: 13, color: colors.text, fontWeight: '600' },
    totalValue: { fontSize: 19, fontWeight: '800', color: colors.primary },
  });
