import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import Button from '../components/Button.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useCartScreen } from '../hooks/useCartScreen.jsx';

export default function CartScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    items, loading, subtotal, shippingCost, shippingInfo, total,
    itemLabel, changeQuantity, handleRemove, goToShippingMap, goToPayment,
  } = useCartScreen(navigation);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        <Ionicons name="menu" size={22} color={colors.white} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionHeader}>
          <Ionicons name="cube-outline" size={16} color={colors.text} />
          <Text style={styles.sectionTitle}>PRODUCTOS</Text>
          <Text style={styles.itemsCount}>{items.length} item{items.length === 1 ? '' : 's'}</Text>
        </View>

        {loading && !items.length ? <Text style={styles.stateText}>Cargando tu carrito...</Text> : null}
        {!loading && !items.length ? (
          <Text style={styles.stateText}>Tu carrito está vacío. ¡Agrega algo bonito!</Text>
        ) : null}

        {items.map((item) => (
          <View key={item._id} style={styles.itemCard}>
            {item.product?.image ? (
              <Image source={{ uri: item.product.image }} style={styles.itemImage} />
            ) : (
              <View style={[styles.itemImage, styles.itemImageFallback]}>
                <Ionicons name="leaf-outline" size={20} color={colors.placeholder} />
              </View>
            )}
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.product?.name}</Text>
              <Text style={styles.itemDims}>{itemLabel(item)}</Text>
              <Text style={styles.itemPrice}>$ {item.unitPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity onPress={() => handleRemove(item)}>
                <Ionicons name="trash" size={18} color={colors.maroonDark} />
              </TouchableOpacity>
              <View style={styles.stepper}>
                <TouchableOpacity style={styles.stepperButton} onPress={() => changeQuantity(item, item.quantity - 1)}>
                  <Ionicons name="remove" size={14} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{item.quantity}</Text>
                <TouchableOpacity style={styles.stepperButton} onPress={() => changeQuantity(item, item.quantity + 1)}>
                  <Ionicons name="add" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addMoreButton} onPress={() => navigation.navigate('Products')}>
          <Ionicons name="add" size={16} color={colors.maroonDark} />
          <Text style={styles.addMoreText}>AGREGAR MÁS</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Ionicons name="car-outline" size={16} color={colors.text} />
          <Text style={styles.sectionTitle}>ENVÍO</Text>
        </View>

        <TouchableOpacity style={styles.addressCard} onPress={goToShippingMap} activeOpacity={0.8}>
          <View style={styles.addressIcon}>
            <Ionicons name="location" size={18} color={colors.primary} />
          </View>
          <View style={styles.addressInfo}>
            {shippingInfo ? (
              <>
                <Text style={styles.addressTitle} numberOfLines={2}>{shippingInfo.address}</Text>
                <Text style={styles.addressMeta}>
                  {(shippingInfo.distanceMeters / 1000).toFixed(2)} km ·{' '}
                  {Math.round(shippingInfo.durationSeconds / 60)} min · Envío: $ {shippingInfo.shippingCost.toFixed(2)}
                </Text>
              </>
            ) : (
              <Text style={styles.addressTitle}>Marca tu ubicación en el mapa (OpenStreetMap)</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Ionicons name="receipt-outline" size={16} color={colors.text} />
          <Text style={styles.sectionTitle}>RESUMEN</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>$ {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Envío</Text>
            <Text style={styles.summaryValue}>
              {shippingInfo ? (shippingCost > 0 ? `$ ${shippingCost.toFixed(2)}` : 'Gratis') : 'Marca tu ubicación'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <View style={styles.totalLabelRow}>
              <View style={styles.totalDot} />
              <Text style={styles.totalLabel}>TOTAL</Text>
            </View>
            <Text style={styles.totalValue}>$ {total.toFixed(2)}</Text>
          </View>
        </View>

        <Button label="Confirmar Orden" onPress={goToPayment} />

        <TouchableOpacity style={styles.keepShoppingButton} onPress={() => navigation.navigate('Products')}>
          <Text style={styles.keepShoppingText}>Seguir Comprando</Text>
        </TouchableOpacity>
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
    headerTitle: { color: colors.white, fontSize: 20, fontWeight: '700' },
    content: { padding: 20, paddingBottom: 24 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 10 },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginLeft: 6, letterSpacing: 0.5 },
    itemsCount: { marginLeft: 'auto', fontSize: 12, color: colors.placeholder },
    stateText: { fontSize: 12, color: colors.placeholder, textAlign: 'center', marginVertical: 16 },
    itemCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 12,
      marginBottom: 12,
    },
    itemImage: { width: 64, height: 64, borderRadius: 10 },
    itemImageFallback: { backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    itemInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
    itemName: { fontSize: 14, fontWeight: '700', color: colors.text },
    itemDims: { fontSize: 11, color: colors.placeholder, marginTop: 2 },
    itemPrice: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 4 },
    itemActions: { alignItems: 'flex-end', justifyContent: 'space-between' },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 16,
      paddingHorizontal: 4,
      marginTop: 10,
    },
    stepperButton: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
    stepperValue: { width: 20, textAlign: 'center', fontSize: 13, fontWeight: '700', color: colors.text },
    addMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.maroonDark,
      borderStyle: 'dashed',
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 4,
    },
    addMoreText: { color: colors.maroonDark, fontWeight: '800', fontSize: 13, marginLeft: 6 },
    addressCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
    },
    addressIcon: {
      width: 34, height: 34, borderRadius: 10, backgroundColor: colors.primarySoft,
      alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    addressInfo: { flex: 1 },
    addressTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
    addressMeta: { fontSize: 11, color: colors.placeholder, marginTop: 4 },
    summaryCard: { backgroundColor: colors.card, borderRadius: 14, padding: 16 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
    summaryLabel: { fontSize: 13, color: colors.placeholder },
    summaryValue: { fontSize: 13, color: colors.text, fontWeight: '600' },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
    totalLabelRow: { flexDirection: 'row', alignItems: 'center' },
    totalDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginRight: 6 },
    totalLabel: { fontSize: 14, fontWeight: '800', color: colors.text },
    totalValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
    keepShoppingButton: {
      borderWidth: 1.5, borderColor: colors.primary, borderRadius: 12,
      paddingVertical: 14, alignItems: 'center', marginTop: 12,
    },
    keepShoppingText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  });
