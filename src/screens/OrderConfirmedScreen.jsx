import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import Button from '../components/Button.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { STEPS, STATUS_STEP } from '../utils/orderStatus.js';

export default function OrderConfirmedScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const order = route?.params?.order;
  const breakdown = route?.params?.breakdown;
  const destination = route?.params?.destination;

  const isRejected = order?.status === 'Rechazado';
  const currentStep = STATUS_STEP[order?.status] ?? 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pedido Confirmado</Text>
        <Ionicons name="menu" size={22} color={colors.white} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.checkCircle}>
          <Ionicons name={isRejected ? 'close' : 'checkmark'} size={36} color={colors.white} />
        </View>
        <Text style={styles.title}>{isRejected ? 'Pedido no confirmado' : '¡Pedido Confirmado!'}</Text>
        <Text style={styles.subtitle}>
          {isRejected ? 'Hubo un problema con tu pedido.' : 'Tu pedido está siendo procesado.'}
        </Text>
        {order?.orderCode ? (
          <View style={styles.codePill}>
            <Text style={styles.codeText}>{order.orderCode}</Text>
          </View>
        ) : null}

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
                <Text
                  key={step}
                  style={[styles.trackerLabel, index === currentStep && styles.trackerLabelActive]}
                >
                  {step}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {destination?.municipality ? (
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="location" size={14} color={colors.primary} />
                <Text style={styles.infoLabel}>DESTINO</Text>
              </View>
              <Text style={styles.infoValue}>{destination.municipality}</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="time" size={14} color={colors.primary} />
                <Text style={styles.infoLabel}>ENTREGA</Text>
              </View>
              <Text style={styles.infoValue}>2-3 días</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tu Pedido</Text>
          {(order?.products || []).map((item) => (
            <View key={item._id} style={styles.orderItem}>
              <View>
                <Text style={styles.orderItemName}>{item.product?.name || 'Producto eliminado'}</Text>
                <Text style={styles.orderItemMeta}>{item.quantity} unidad{item.quantity === 1 ? '' : 'es'}</Text>
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
          <Text style={styles.detailName}>{order?.shippingAddress}</Text>
          <Text style={styles.detailMeta}>{order?.contactPhone}</Text>
        </View>

        {breakdown ? (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>$ {breakdown.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Envío</Text>
              <Text style={styles.summaryValue}>
                {breakdown.shippingCost > 0 ? `$ ${breakdown.shippingCost.toFixed(2)}` : 'Gratis'}
              </Text>
            </View>
            {breakdown.discount > 0 ? (
              <View style={styles.summaryRow}>
                <Text style={styles.discountLabel}>Descuento</Text>
                <Text style={styles.discountValue}>- $ {breakdown.discount.toFixed(2)}</Text>
              </View>
            ) : null}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>$ {breakdown.total.toFixed(2)}</Text>
            </View>
          </View>
        ) : null}

        <Button label="Ir a mis pedidos" onPress={() => navigation.navigate('Orders')} />
        <TouchableOpacity style={styles.keepShoppingButton} onPress={() => navigation.navigate('Products')}>
          <Text style={styles.keepShoppingText}>Seguir Comprando</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomTabBar active="Home" />
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
    headerTitle: { color: colors.white, fontSize: 18, fontWeight: '700' },
    content: { padding: 20, paddingBottom: 24, alignItems: 'center' },
    checkCircle: {
      width: 80, height: 80, borderRadius: 40, backgroundColor: colors.maroonDark,
      alignItems: 'center', justifyContent: 'center', marginTop: 12, marginBottom: 16,
    },
    title: { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center' },
    subtitle: { fontSize: 13, color: colors.placeholder, textAlign: 'center', marginTop: 4 },
    codePill: {
      backgroundColor: colors.primarySoft, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 12,
    },
    codeText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
    trackerCard: { width: '100%', backgroundColor: colors.card, borderRadius: 14, padding: 16, marginTop: 20 },
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
    infoRow: { flexDirection: 'row', width: '100%', marginTop: 16 },
    infoCard: { flex: 1, backgroundColor: colors.primarySoft, borderRadius: 12, padding: 12, marginHorizontal: 4 },
    infoHeader: { flexDirection: 'row', alignItems: 'center' },
    infoLabel: { fontSize: 10, color: colors.primary, fontWeight: '700', marginLeft: 4 },
    infoValue: { fontSize: 13, color: colors.text, fontWeight: '700', marginTop: 6 },
    card: { width: '100%', backgroundColor: colors.card, borderRadius: 14, padding: 16, marginTop: 16 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    cardTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginLeft: 4 },
    orderItem: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    orderItemName: { fontSize: 13, fontWeight: '700', color: colors.text },
    orderItemMeta: { fontSize: 11, color: colors.placeholder, marginTop: 2 },
    orderItemPrice: { fontSize: 13, fontWeight: '700', color: colors.primary },
    detailName: { fontSize: 13, color: colors.text, marginTop: 6, lineHeight: 18 },
    detailMeta: { fontSize: 12, color: colors.placeholder, marginTop: 4 },
    summaryCard: { width: '100%', backgroundColor: colors.card, borderRadius: 14, padding: 16, marginTop: 16 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
    summaryLabel: { fontSize: 13, color: colors.placeholder },
    summaryValue: { fontSize: 13, color: colors.text, fontWeight: '600' },
    discountLabel: { fontSize: 13, color: colors.maroonDark },
    discountValue: { fontSize: 13, color: colors.maroonDark, fontWeight: '700' },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
    totalLabel: { fontSize: 15, fontWeight: '800', color: colors.text },
    totalValue: { fontSize: 19, fontWeight: '800', color: colors.primary },
    keepShoppingButton: {
      width: '100%', borderWidth: 1.5, borderColor: colors.primary, borderRadius: 12,
      paddingVertical: 14, alignItems: 'center', marginTop: 12,
    },
    keepShoppingText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  });
