import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { typeLabel } from '../utils/productTypes.js';
import { formatOrderDate, getStatusMeta, STATUS_STEP, STEPS } from '../utils/orderStatus.js';

const STEP_ICONS = ['checkmark', 'cube-outline', 'car-outline', 'home-outline'];

export default function OrderConfirmedScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const order = route?.params?.order;
  const breakdown = route?.params?.breakdown;
  const isPickup = route?.params?.isPickup;

  const products = order?.products || [];
  const meta = getStatusMeta(order?.status);
  const currentStep = STATUS_STEP[order?.status] ?? 0;
  const itemCount = products.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const goToOrders = () => navigation.reset({ index: 0, routes: [{ name: 'Orders' }] });
  const keepShopping = () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={keepShopping}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerBrand}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Macetas503</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={36} color={colors.primary} />
        </View>

        <Text style={styles.title}>¡Pedido confirmado!</Text>
        <Text style={styles.subtitle}>
          Gracias por tu compra. Recibimos tu pedido y el taller ya lo está preparando.
        </Text>

        <View style={styles.codeCard}>
          <Ionicons name="cube-outline" size={17} color={colors.primary} />
          <View style={styles.codeTexts}>
            <Text style={styles.codeLabel}>NÚMERO DE PEDIDO</Text>
            <Text style={styles.codeValue}>{order?.orderCode || '—'}</Text>
          </View>
        </View>

        {order?.createdAt ? (
          <Text style={styles.date}>Confirmado el {formatOrderDate(order.createdAt)}</Text>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>ESTADO DEL PEDIDO</Text>
          <View style={styles.stepsRow}>
            {STEPS.map((step, index) => {
              const reached = index <= currentStep;
              return (
                <View key={step} style={styles.step}>
                  <View style={styles.stepTop}>
                    {index > 0 ? (
                      <View style={[styles.stepLine, reached && styles.stepLineActive]} />
                    ) : (
                      <View style={styles.stepLineGhost} />
                    )}
                    <View style={[styles.stepDot, reached && styles.stepDotActive]}>
                      <Ionicons
                        name={STEP_ICONS[index]}
                        size={13}
                        color={reached ? colors.white : colors.placeholder}
                      />
                    </View>
                    {index < STEPS.length - 1 ? (
                      <View style={[styles.stepLine, index < currentStep && styles.stepLineActive]} />
                    ) : (
                      <View style={styles.stepLineGhost} />
                    )}
                  </View>
                  <Text style={[styles.stepLabel, reached && styles.stepLabelActive]}>{step}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.statusNote}>
            Estado actual: <Text style={styles.statusStrong}>{meta.label}</Text>
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Detalle del pedido</Text>
            <Text style={styles.cardCount}>
              {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
            </Text>
          </View>

          {products.map((item) => (
            <View key={item._id} style={styles.itemRow}>
              {item.product?.image ? (
                <Image source={{ uri: item.product.image }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, styles.itemImageFallback]}>
                  <Ionicons name="leaf-outline" size={16} color={colors.placeholder} />
                </View>
              )}
              <View style={styles.itemTexts}>
                <Text style={styles.itemName} numberOfLines={1}>{item.product?.name}</Text>
                <Text style={styles.itemMeta}>
                  {typeLabel(item.productType)} · Cant: {item.quantity}
                </Text>
              </View>
              <Text style={styles.itemPrice}>${item.subtotal?.toFixed(2)}</Text>
            </View>
          ))}

          {breakdown ? (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${breakdown.subtotal.toFixed(2)}</Text>
              </View>
              {breakdown.discount > 0 ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Descuento</Text>
                  <Text style={styles.discountValue}>-${breakdown.discount.toFixed(2)}</Text>
                </View>
              ) : null}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Envío</Text>
                <Text style={styles.summaryValue}>
                  {breakdown.shippingCost > 0
                    ? '$' + breakdown.shippingCost.toFixed(2)
                    : isPickup
                    ? 'Retiro en tienda'
                    : 'Gratis'}
                </Text>
              </View>
            </>
          ) : null}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ${(breakdown?.total ?? order?.total ?? 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {order?.shippingAddress ? (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Ionicons name="location-outline" size={15} color={colors.maroon} />
              <Text style={styles.cardTitleSmall}>
                {isPickup ? 'PUNTO DE RETIRO' : 'INFORMACIÓN DE ENVÍO'}
              </Text>
            </View>
            <Text style={styles.addressText}>{order.shippingAddress}</Text>
            {order.contactPhone ? (
              <View style={styles.phoneRow}>
                <Ionicons name="call-outline" size={13} color={colors.placeholder} />
                <Text style={styles.phoneText}>{order.contactPhone}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <TouchableOpacity style={styles.primaryButton} onPress={goToOrders} activeOpacity={0.85}>
          <Ionicons name="cube-outline" size={16} color={colors.white} />
          <Text style={styles.primaryText}>Ir a mis pedidos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={keepShopping}>
          <Text style={styles.secondaryText}>Seguir comprando</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: isDark ? colors.background : '#F6F7F5' },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    headerBrand: { flexDirection: 'row', alignItems: 'center' },
    headerLogo: { width: 20, height: 20, marginRight: 8 },
    headerTitle: { fontFamily: SERIF, fontSize: 18, fontWeight: '700', color: colors.text },
    headerSpacer: { width: 22 },

    content: { paddingHorizontal: 20, paddingBottom: 28, alignItems: 'center' },

    checkCircle: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 18,
    },
    title: {
      fontFamily: SERIF,
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
      marginTop: 18,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.placeholder,
      textAlign: 'center',
      marginTop: 8,
      paddingHorizontal: 10,
    },

    codeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginTop: 18,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    codeTexts: { marginLeft: 10 },
    codeLabel: { fontSize: 9, letterSpacing: 1.2, fontWeight: '700', color: colors.placeholder },
    codeValue: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 2 },
    date: { fontSize: 11.5, color: colors.placeholder, marginTop: 10 },

    card: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 18,
      marginTop: 14,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    sectionLabel: {
      fontSize: 9,
      letterSpacing: 1.3,
      fontWeight: '700',
      color: colors.placeholder,
      marginBottom: 14,
    },

    stepsRow: { flexDirection: 'row' },
    step: { flex: 1, alignItems: 'center' },
    stepTop: { flexDirection: 'row', alignItems: 'center', width: '100%' },
    stepDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? colors.card : '#EFF2EF',
    },
    stepDotActive: { backgroundColor: colors.primary },
    stepLine: { flex: 1, height: 2, backgroundColor: isDark ? colors.border : '#E7EBE8' },
    stepLineActive: { backgroundColor: colors.primary },
    stepLineGhost: { flex: 1, height: 2, backgroundColor: 'transparent' },
    stepLabel: { fontSize: 9.5, color: colors.placeholder, marginTop: 6, textAlign: 'center' },
    stepLabelActive: { color: colors.primary, fontWeight: '700' },
    statusNote: { fontSize: 11.5, color: colors.placeholder, marginTop: 14, textAlign: 'center' },
    statusStrong: { color: colors.text, fontWeight: '700' },

    cardHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    cardTitle: { fontFamily: SERIF, fontSize: 18, fontWeight: '700', color: colors.text },
    cardTitleSmall: {
      flex: 1,
      fontSize: 9,
      letterSpacing: 1.3,
      fontWeight: '700',
      color: colors.placeholder,
      marginLeft: 7,
    },
    cardCount: { fontSize: 11.5, color: colors.placeholder },

    itemRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    itemImage: { width: 44, height: 44, borderRadius: 11, backgroundColor: colors.border },
    itemImageFallback: { alignItems: 'center', justifyContent: 'center' },
    itemTexts: { flex: 1, marginHorizontal: 11 },
    itemName: { fontSize: 13, fontWeight: '700', color: colors.text },
    itemMeta: { fontSize: 11, color: colors.placeholder, marginTop: 2 },
    itemPrice: { fontSize: 13.5, fontWeight: '700', color: colors.text },

    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
    },
    summaryLabel: { fontSize: 12.5, color: colors.placeholder },
    summaryValue: { fontSize: 12.5, fontWeight: '700', color: colors.text },
    discountValue: { fontSize: 12.5, fontWeight: '700', color: colors.primary },

    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    totalLabel: { fontFamily: SERIF, fontSize: 18, fontWeight: '700', color: colors.text },
    totalValue: { fontFamily: SERIF, fontSize: 21, fontWeight: '700', color: colors.text },

    addressText: { fontSize: 12.5, lineHeight: 18, color: colors.text, marginTop: 8 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    phoneText: { fontSize: 12, color: colors.placeholder, marginLeft: 6 },

    primaryButton: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 54,
      borderRadius: 27,
      marginTop: 20,
      backgroundColor: colors.primary,
    },
    primaryText: { fontSize: 15, fontWeight: '700', color: colors.white, marginLeft: 8 },
    secondaryButton: { paddingVertical: 16 },
    secondaryText: { fontSize: 13.5, fontWeight: '700', color: colors.text },
  });
