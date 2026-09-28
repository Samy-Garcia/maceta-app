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
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { useCartScreen } from '../hooks/useCartScreen.jsx';
import { typeLabel } from '../utils/productTypes.js';

export default function CartScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const {
    items, loading, subtotal, shippingCost, total,
    freeShippingFrom, qualifiesForFreeShipping, missingForFreeShipping, freeShippingProgress,
    itemLabel, changeQuantity, handleRemove, goToPayment,
  } = useCartScreen(navigation);

  const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Carrito</Text>
          <Text style={styles.count}>({count})</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {loading && items.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="bag-outline" size={34} color={colors.placeholder} />
          <Text style={styles.emptyText}>Tu carrito está vacío.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Products')}>
            <Text style={styles.emptyLink}>Ver el catálogo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {freeShippingFrom != null ? (
              <View style={styles.freeCard}>
                <View style={styles.freeTop}>
                  <Ionicons
                    name={qualifiesForFreeShipping ? 'checkmark-circle' : 'car-outline'}
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.freeText}>
                    {qualifiesForFreeShipping
                      ? 'Tu pedido califica para envío gratis'
                      : 'Agrega $' + missingForFreeShipping.toFixed(2) + ' para envío gratis'}
                  </Text>
                  <Text style={styles.freePercent}>
                    {Math.round(freeShippingProgress * 100)}%
                  </Text>
                </View>
                <View style={styles.freeBar}>
                  <View
                    style={[styles.freeBarFill, { width: freeShippingProgress * 100 + '%' }]}
                  />
                </View>
              </View>
            ) : null}

            {items.map((item) => {
              const unit = item.product?.price ?? 0;
              return (
                <View key={item._id} style={styles.card}>
                  {item.product?.image ? (
                    <Image source={{ uri: item.product.image }} style={styles.image} />
                  ) : (
                    <View style={[styles.image, styles.imageFallback]}>
                      <Ionicons name="leaf-outline" size={20} color={colors.placeholder} />
                    </View>
                  )}

                  <View style={styles.cardBody}>
                    <View style={styles.cardTop}>
                      <Text style={styles.overline} numberOfLines={1}>
                        {typeLabel(item.productType).toUpperCase()}
                      </Text>
                      <View
                        style={[
                          styles.stockPill,
                          !item.product?.stock && styles.stockPillOut,
                        ]}
                      >
                        <Text
                          style={[
                            styles.stockPillText,
                            !item.product?.stock && styles.stockPillTextOut,
                          ]}
                        >
                          {item.product?.stock ? 'En stock' : 'Sin stock'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemove(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.placeholder} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.name} numberOfLines={1}>
                      {item.product?.name || 'Producto eliminado'}
                    </Text>
                    <Text style={styles.variant} numberOfLines={1}>{itemLabel(item)}</Text>
                    <Text style={styles.price}>${unit.toFixed(2)}</Text>

                    <View style={styles.cardFooter}>
                      <Text style={styles.subtotal}>
                        Subtotal: <Text style={styles.subtotalValue}>${item.subtotal?.toFixed(2)}</Text>
                      </Text>
                      <View style={styles.stepper}>
                        <TouchableOpacity
                          style={styles.stepperButton}
                          onPress={() => changeQuantity(item, item.quantity - 1)}
                        >
                          <Ionicons name="remove" size={15} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.stepperButton}
                          onPress={() => changeQuantity(item, item.quantity + 1)}
                        >
                          <Ionicons name="add" size={15} color={colors.text} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Envío</Text>
              <Text style={styles.summaryValue}>
                {shippingCost > 0 ? '$' + shippingCost.toFixed(2) : 'Gratis'}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalNote}>Impuestos incluidos</Text>
              </View>
              <View style={styles.totalAmount}>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                <Text style={styles.totalCurrency}>USD</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.checkoutButton} onPress={goToPayment} activeOpacity={0.85}>
              <Text style={styles.checkoutText}>Finalizar compra</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
        </>
      )}

      <BottomTabBar active="Carrito" />
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
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerLogo: { width: 22, height: 22, marginRight: 8 },
    title: { fontFamily: SERIF, fontSize: 24, fontWeight: '700', color: colors.text },
    count: { fontSize: 15, color: colors.placeholder, marginLeft: 6 },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },

    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { fontSize: 13, color: colors.placeholder, marginTop: 12 },
    emptyLink: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 10 },

    content: { paddingHorizontal: 20, paddingBottom: 16 },

    freeCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    freeTop: { flexDirection: 'row', alignItems: 'center' },
    freeText: { flex: 1, fontSize: 12, color: colors.text, marginLeft: 8 },
    freePercent: { fontSize: 11, fontWeight: '700', color: colors.primary },
    freeBar: {
      height: 5,
      borderRadius: 3,
      marginTop: 10,
      backgroundColor: isDark ? colors.border : '#E7EBE8',
      overflow: 'hidden',
    },
    freeBarFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primary },

    card: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    image: { width: 74, height: 84, borderRadius: 12, backgroundColor: colors.border },
    imageFallback: { alignItems: 'center', justifyContent: 'center' },
    cardBody: { flex: 1, marginLeft: 12 },
    cardTop: { flexDirection: 'row', alignItems: 'center' },
    overline: {
      fontSize: 8.5,
      letterSpacing: 1,
      fontWeight: '700',
      color: colors.placeholder,
      marginRight: 8,
    },
    stockPill: {
      flex: 1,
      alignSelf: 'flex-start',
      backgroundColor: colors.primarySoft,
      borderRadius: 8,
      paddingHorizontal: 7,
      paddingVertical: 3,
      maxWidth: 74,
      marginRight: 8,
    },
    stockPillOut: { backgroundColor: isDark ? colors.card : '#F1E7E7' },
    stockPillText: { fontSize: 9, fontWeight: '700', color: colors.primary, textAlign: 'center' },
    stockPillTextOut: { color: colors.maroon },

    name: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 6 },
    variant: { fontSize: 11.5, color: colors.placeholder, marginTop: 2 },
    price: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 6 },

    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    subtotal: { fontSize: 11.5, color: colors.placeholder },
    subtotalValue: { fontWeight: '700', color: colors.text },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 18,
      height: 32,
      paddingHorizontal: 2,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    stepperButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
    stepperValue: { width: 22, textAlign: 'center', fontSize: 13, fontWeight: '700', color: colors.text },

    footer: {
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 10,
      backgroundColor: isDark ? colors.card : colors.surface,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
    summaryLabel: { fontSize: 12.5, color: colors.placeholder },
    summaryValue: { fontSize: 12.5, fontWeight: '600', color: colors.text },

    totalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    totalLabel: { fontFamily: SERIF, fontSize: 20, fontWeight: '700', color: colors.text },
    totalNote: { fontSize: 10.5, color: colors.placeholder, marginTop: 1 },
    totalAmount: { alignItems: 'flex-end' },
    totalValue: { fontFamily: SERIF, fontSize: 24, fontWeight: '700', color: colors.text },
    totalCurrency: { fontSize: 10, color: colors.placeholder },

    checkoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 52,
      borderRadius: 26,
      marginTop: 12,
      backgroundColor: colors.primary,
    },
    checkoutText: { fontSize: 15, fontWeight: '700', color: colors.white, marginRight: 8 },
  });
