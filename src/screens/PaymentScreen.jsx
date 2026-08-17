import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import Button from '../components/Button.jsx';
import ErrorText from '../components/ErrorText.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { usePayment } from '../hooks/usePayment.jsx';
import { filterPhoneChars } from '../utils/validators.js';

export default function PaymentScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    items, itemLabel, fullName, setFullName, phone, setPhone, email, shippingInfo, goToChangeAddress,
    couponInput, setCouponInput, appliedCoupon, couponError, applyCoupon,
    subtotal, discount, shippingCost, total, paying, error, pay,
  } = usePayment(navigation);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Confirmar Pedido</Text>
        <Ionicons name="menu" size={22} color={colors.white} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información del Cliente</Text>
          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholderTextColor={colors.placeholder} />
          <View style={styles.rowFields}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={(text) => setPhone(filterPhoneChars(text))}
                keyboardType="phone-pad"
                placeholder="7000-0000"
                placeholderTextColor={colors.placeholder}
                maxLength={12}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={[styles.input, styles.inputDisabled]} value={email} editable={false} />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Dirección de Envío</Text>
            {shippingInfo ? (
              <TouchableOpacity onPress={goToChangeAddress} style={styles.changeLink}>
                <Ionicons name="pencil" size={12} color={colors.primary} />
                <Text style={styles.changeLinkText}>Cambiar</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          {shippingInfo ? (
            <View style={styles.addressRow}>
              <Ionicons name="location" size={16} color={colors.primary} style={{ marginTop: 2 }} />
              <Text style={styles.addressText}>{shippingInfo.address}</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.pickAddressButton} onPress={goToChangeAddress}>
              <Ionicons name="map-outline" size={16} color={colors.primary} />
              <Text style={styles.pickAddressText}>Elegir ubicación en el mapa</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>Tu Pedido</Text>
        {items.map((item) => (
          <View key={item._id} style={styles.orderItem}>
            <View>
              <Text style={styles.orderItemName}>{item.product?.name}</Text>
              <Text style={styles.orderItemMeta}>Cant: {item.quantity} · {itemLabel(item)}</Text>
            </View>
            <Text style={styles.orderItemPrice}>$ {item.subtotal.toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.couponRow}>
          <TextInput
            style={styles.couponInput}
            value={couponInput}
            onChangeText={setCouponInput}
            placeholder="Código de descuento (opcional)"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.applyButton} onPress={applyCoupon}>
            <Text style={styles.applyButtonText}>Aplicar</Text>
          </TouchableOpacity>
        </View>
        {couponError ? <Text style={styles.couponHintError}>{couponError}</Text> : null}
        {appliedCoupon ? (
          <Text style={styles.couponHintOk}>
            {appliedCoupon.type === 'coupon' ? `Cupón aplicado: -${appliedCoupon.discountPercent}%` : 'Envío gratis aplicado.'}
          </Text>
        ) : null}

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>$ {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Envío</Text>
            <Text style={styles.summaryValue}>
              {shippingInfo ? (shippingCost > 0 ? `$ ${shippingCost.toFixed(2)}` : 'Gratis') : '—'}
            </Text>
          </View>
          {discount > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.discountLabel}>Descuento Aplicado</Text>
              <Text style={styles.discountValue}>- $ {discount.toFixed(2)}</Text>
            </View>
          ) : null}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total a Pagar</Text>
            <Text style={styles.totalValue}>$ {total.toFixed(2)}</Text>
          </View>
        </View>

        <ErrorText message={error} />

        <Button label="Confirmar Pedido" icon="checkmark-circle" onPress={pay} loading={paying} />

        <Text style={styles.disclaimer}>
          Este proyecto no procesa pagos reales: al confirmar, tu pedido queda registrado y visible para el equipo.
        </Text>
        <Text style={styles.buildTag}>build-check: PAGO-002</Text>
      </ScrollView>

      <BottomTabBar active="Carrito" />
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
    content: { padding: 20, paddingBottom: 24 },
    card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 16 },
    cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
    changeLink: { flexDirection: 'row', alignItems: 'center' },
    changeLinkText: { fontSize: 12, color: colors.primary, fontWeight: '700', marginLeft: 4 },
    addressRow: { flexDirection: 'row', marginTop: 10, backgroundColor: colors.surface, borderRadius: 10, padding: 10 },
    addressText: { fontSize: 12, color: colors.text, marginLeft: 8, flex: 1, lineHeight: 17 },
    pickAddressButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.primarySoft, borderRadius: 10, paddingVertical: 12, marginTop: 10,
    },
    pickAddressText: { fontSize: 13, color: colors.primary, fontWeight: '700', marginLeft: 8 },
    label: { fontSize: 12, color: colors.placeholder, marginTop: 12, marginBottom: 6 },
    input: {
      height: 44, borderRadius: 10, paddingHorizontal: 12, fontSize: 13,
      color: colors.text, backgroundColor: colors.surface,
    },
    inputDisabled: { color: colors.placeholder },
    rowFields: { flexDirection: 'row', justifyContent: 'space-between' },
    halfField: { width: '48%' },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 10 },
    orderItem: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 10,
    },
    orderItemName: { fontSize: 13, fontWeight: '700', color: colors.text },
    orderItemMeta: { fontSize: 11, color: colors.placeholder, marginTop: 2 },
    orderItemPrice: { fontSize: 13, fontWeight: '700', color: colors.primary },
    couponRow: { flexDirection: 'row', marginTop: 4, marginBottom: 4 },
    couponInput: {
      flex: 1, height: 46, borderRadius: 12, paddingHorizontal: 14,
      backgroundColor: colors.surface, color: colors.text, fontSize: 13, marginRight: 8,
    },
    applyButton: { backgroundColor: colors.maroonDark, borderRadius: 12, paddingHorizontal: 18, justifyContent: 'center' },
    applyButtonText: { color: colors.white, fontWeight: '700', fontSize: 13 },
    couponHintError: { fontSize: 11, color: colors.maroonDark, marginBottom: 8 },
    couponHintOk: { fontSize: 11, color: colors.primary, fontWeight: '700', marginBottom: 8 },
    summaryCard: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginTop: 12 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
    summaryLabel: { fontSize: 13, color: colors.placeholder },
    summaryValue: { fontSize: 13, color: colors.text, fontWeight: '600' },
    discountLabel: { fontSize: 13, color: colors.maroonDark },
    discountValue: { fontSize: 13, color: colors.maroonDark, fontWeight: '700' },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
    totalLabel: { fontSize: 14, fontWeight: '800', color: colors.text },
    totalValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
    disclaimer: { fontSize: 11, color: colors.placeholder, textAlign: 'center', marginTop: 12, lineHeight: 16 },
    buildTag: { fontSize: 9, color: colors.border, textAlign: 'center', marginTop: 8 },
  });
