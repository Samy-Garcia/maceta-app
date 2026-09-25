import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import ReviewModal from '../components/ReviewModal.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { useOrderActions } from '../hooks/useOrderActions.jsx';
import { typeLabel } from '../utils/productTypes.js';
import { formatOrderDate, getStatusMeta, STATUS_STEP, STEPS, statusColors } from '../utils/orderStatus.js';

export default function OrderDetailScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const order = route?.params?.order;
  const [showItems, setShowItems] = useState(true);
  const {
    reordering, buyAgain, canReview, reviewOrder, setReviewOrder, submitReview, savingReview,
  } = useOrderActions(navigation);

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerBrand}>MACETAS503</Text>
            <Text style={styles.headerTitle}>Detalle de Pedido</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.stateText}>No se encontró este pedido.</Text>
        </View>
        <BottomTabBar active="Pedidos" />
      </SafeAreaView>
    );
  }

  const meta = getStatusMeta(order.status);
  const statusColor = statusColors(meta.kind, isDark);
  const isRejected = order.status === 'Rechazado';
  const currentStep = STATUS_STEP[order.status] ?? 0;
  const products = order.products || [];

  // El backend guarda el total ya cobrado y el subtotal de cada pieza: la
  // diferencia es lo que se cobró de envío en ese pedido.
  const itemsSubtotal = products.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const shipping = Number(((order.total || 0) - itemsSubtotal).toFixed(2));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerBrand}>MACETAS503</Text>
          <Text style={styles.headerTitle}>Detalle de Pedido</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.orderCode}>Pedido {order.orderCode}</Text>
            <View style={[styles.statusPill, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.statusText, { color: statusColor.text }]}>{meta.label}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={13} color={colors.placeholder} />
            <Text style={styles.metaText}>{formatOrderDate(order.createdAt)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="receipt-outline" size={13} color={colors.placeholder} />
            <Text style={styles.metaText}>Total: ${order.total?.toFixed(2)}</Text>
          </View>

          {!isRejected ? (
            <View style={styles.tracker}>
              <View style={styles.trackerBar}>
                <View
                  style={[
                    styles.trackerFill,
                    { width: ((currentStep + 1) / STEPS.length) * 100 + '%' },
                  ]}
                />
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

          <TouchableOpacity
            style={styles.itemsToggle}
            onPress={() => setShowItems((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Text style={styles.itemsCount}>
              {products.length} {products.length === 1 ? 'Producto' : 'Productos'}
            </Text>
            <Ionicons
              name={showItems ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.placeholder}
            />
          </TouchableOpacity>

          {showItems
            ? products.map((item) => (
                <View key={item._id} style={styles.itemRow}>
                  {item.product?.image ? (
                    <Image source={{ uri: item.product.image }} style={styles.itemImage} />
                  ) : (
                    <View style={[styles.itemImage, styles.itemImageFallback]}>
                      <Ionicons name="leaf-outline" size={18} color={colors.placeholder} />
                    </View>
                  )}
                  <View style={styles.itemTexts}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.product?.name || 'Producto eliminado'}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {typeLabel(item.productType)} · {item.quantity}{' '}
                      {item.quantity === 1 ? 'unidad' : 'unidades'}
                    </Text>
                  </View>
                  <Text style={styles.itemPrice}>${item.subtotal?.toFixed(2)}</Text>
                </View>
              ))
            : null}

          {order.shippingAddress ? (
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={14} color={colors.maroon} />
              <View style={styles.addressTexts}>
                <Text style={styles.addressLabel}>Dirección de entrega</Text>
                <Text style={styles.addressText}>{order.shippingAddress}</Text>
                {order.contactPhone ? (
                  <Text style={styles.addressPhone}>Tel. {order.contactPhone}</Text>
                ) : null}
              </View>
            </View>
          ) : null}

          <View style={styles.actions}>
            {canReview(order) ? (
              <TouchableOpacity style={styles.ghostButton} onPress={() => setReviewOrder(order)}>
                <Text style={styles.ghostText}>Dejar reseña</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={styles.solidButton}
              onPress={() => buyAgain(order)}
              disabled={reordering === order._id}
              activeOpacity={0.85}
            >
              {reordering === order._id ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.solidText}>Volver a comprar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.summaryHead}>
            <Text style={styles.summaryTitle}>Resumen</Text>
            <Text style={styles.summaryTotal}>${order.total?.toFixed(2)} USD</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal de productos</Text>
            <Text style={styles.summaryValue}>${itemsSubtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Envío</Text>
            <Text style={styles.summaryValue}>
              {shipping > 0 ? '$' + shipping.toFixed(2) : 'Gratis'}
            </Text>
          </View>

          {order.couponCode ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Cupón aplicado</Text>
              <Text style={styles.couponValue}>{order.couponCode}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <BottomTabBar active="Pedidos" />

      <ReviewModal
        order={reviewOrder}
        onClose={() => setReviewOrder(null)}
        onSubmit={submitReview}
        saving={savingReview}
      />
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
    headerTitles: { alignItems: 'center' },
    headerBrand: { fontSize: 8.5, letterSpacing: 1.8, fontWeight: '700', color: colors.maroon },
    headerTitle: { fontFamily: SERIF, fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 2 },
    headerSpacer: { width: 22 },

    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    stateText: { fontSize: 13, color: colors.placeholder },

    content: { paddingHorizontal: 20, paddingBottom: 24 },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 18,
      marginTop: 12,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    orderCode: { fontFamily: SERIF, fontSize: 20, fontWeight: '700', color: colors.text, flex: 1 },
    statusPill: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
    statusText: { fontSize: 11, fontWeight: '700' },

    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    metaText: { fontSize: 12.5, color: colors.placeholder, marginLeft: 7 },

    tracker: { marginTop: 16 },
    trackerBar: {
      height: 6,
      borderRadius: 3,
      backgroundColor: isDark ? colors.border : '#E7EBE8',
      overflow: 'hidden',
    },
    trackerFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primary },
    trackerLabels: { flexDirection: 'row', marginTop: 8 },
    trackerLabel: { flex: 1, fontSize: 9.5, color: colors.placeholder, textAlign: 'center' },
    trackerLabelActive: { color: colors.primary, fontWeight: '700' },

    itemsToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 18,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    itemsCount: { fontSize: 13, fontWeight: '700', color: colors.text },

    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderRadius: 14,
      marginTop: 10,
      backgroundColor: isDark ? colors.card : '#F7F9F8',
    },
    itemImage: { width: 44, height: 44, borderRadius: 11, backgroundColor: colors.border },
    itemImageFallback: { alignItems: 'center', justifyContent: 'center' },
    itemTexts: { flex: 1, marginHorizontal: 11 },
    itemName: { fontSize: 13, fontWeight: '700', color: colors.text },
    itemMeta: { fontSize: 11, color: colors.placeholder, marginTop: 2 },
    itemPrice: { fontSize: 13.5, fontWeight: '700', color: colors.text },

    addressRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 16 },
    addressTexts: { flex: 1, marginLeft: 8 },
    addressLabel: { fontSize: 11, fontWeight: '700', color: colors.text },
    addressText: { fontSize: 12, lineHeight: 17, color: colors.placeholder, marginTop: 3 },
    addressPhone: { fontSize: 12, color: colors.placeholder, marginTop: 3 },

    actions: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
    ghostButton: {
      height: 44,
      paddingHorizontal: 16,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      backgroundColor: isDark ? colors.card : '#F2F4F2',
    },
    ghostText: { fontSize: 12.5, fontWeight: '700', color: colors.text },
    solidButton: {
      flex: 1,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    solidText: { fontSize: 12.5, fontWeight: '700', color: colors.white },

    summaryHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    summaryTitle: { fontFamily: SERIF, fontSize: 19, fontWeight: '700', color: colors.text },
    summaryTotal: { fontSize: 17, fontWeight: '700', color: colors.text },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 7,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    summaryLabel: { fontSize: 12.5, color: colors.placeholder },
    summaryValue: { fontSize: 12.5, fontWeight: '700', color: colors.text },
    couponValue: { fontSize: 12.5, fontWeight: '700', color: colors.primary },
  });
