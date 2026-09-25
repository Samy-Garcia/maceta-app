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
import { useWishlist } from '../hooks/useWishlist.jsx';
import { typeLabel } from '../utils/productTypes.js';

// Lista de deseos real (GET /api/wishlist/mine + GET /api/wishlist/mine/:id):
// los productos que el cliente marcó con el corazón en Catálogo/Inicio/Detalle.
export default function WishlistScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const {
    items, totalCount, typeTabs, typeFilter, setTypeFilter,
    loading, error, retry, removingId, handleRemove, handleAddToCart,
    buyable, listTotal, buyAll, buyingAll, freeShippingFrom, qualifiesForFreeShipping,
  } = useWishlist();

  const openProduct = (item) =>
    navigation.navigate('ProductDetail', {
      product: {
        id: item.productId,
        productType: item.productType,
        name: item.product?.name,
        image: item.product?.image,
        price: item.product?.price,
        stock: item.product?.stock,
      },
    });

  // El stock real decide la etiqueta: agotado, últimas unidades o disponible
  const stockBadge = (stock) => {
    if (!stock) return { text: 'AGOTADO', low: true };
    if (stock <= 3) return { text: 'ÚLTIMAS ' + stock, low: true };
    return { text: 'STOCK', low: false };
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lista de deseos</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Guardados</Text>

        {totalCount > 0 ? (
          <View style={styles.countPill}>
            <View style={styles.countDot} />
            <Text style={styles.countText}>
              {totalCount} {totalCount === 1 ? 'pieza artesanal reservada' : 'piezas artesanales reservadas'}
            </Text>
          </View>
        ) : null}

        {typeTabs.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {typeTabs.map((tab) => {
              const active = tab.key === typeFilter;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, active && styles.tabActive]}
                  onPress={() => setTypeFilter(tab.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {tab.label} ({tab.count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}

        {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}

        {error ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity onPress={retry}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="heart-outline" size={32} color={colors.placeholder} />
            <Text style={styles.stateText}>
              {totalCount
                ? 'No hay piezas guardadas de esta categoría.'
                : 'Tu lista está vacía. Toca el corazón en una pieza para guardarla aquí.'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
              <Text style={styles.retryText}>Ver el catálogo</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {items.map((item) => {
          const badge = stockBadge(item.product?.stock);
          const specs = item.product?.dimensions || item.product?.size || '';
          return (
            <TouchableOpacity
              key={item._id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => openProduct(item)}
            >
              <View style={styles.imageWrap}>
                {item.product?.image ? (
                  <Image source={{ uri: item.product.image }} style={styles.image} />
                ) : (
                  <View style={[styles.image, styles.imageFallback]}>
                    <Ionicons name="leaf-outline" size={20} color={colors.placeholder} />
                  </View>
                )}
                <View style={[styles.stockBadge, badge.low && styles.stockBadgeLow]}>
                  <Text style={styles.stockBadgeText}>{badge.text}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.overline} numberOfLines={1}>
                    {typeLabel(item.productType).toUpperCase()}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemove(item)}
                    disabled={removingId === item._id}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {removingId === item._id ? (
                      <ActivityIndicator size="small" color={colors.maroon} />
                    ) : (
                      <Ionicons name="heart" size={20} color={colors.maroon} />
                    )}
                  </TouchableOpacity>
                </View>

                <Text style={styles.name} numberOfLines={1}>{item.product?.name}</Text>
                {specs ? <Text style={styles.specs} numberOfLines={1}>{specs}</Text> : null}

                <View style={styles.cardFooter}>
                  <Text style={styles.price}>${(item.product?.price || 0).toFixed(2)}</Text>
                  <TouchableOpacity
                    style={[styles.addButton, !item.product?.stock && styles.addButtonDisabled]}
                    onPress={() => handleAddToCart(item)}
                    disabled={!item.product?.stock}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="cart-outline" size={15} color={colors.white} />
                    <Text style={styles.addButtonText}>Agregar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {buyable.length > 0 ? (
          <View style={styles.buyCard}>
            {freeShippingFrom != null ? (
              <View style={styles.freeRow}>
                <View style={styles.freeIcon}>
                  <Ionicons name="car-outline" size={15} color={colors.primary} />
                </View>
                <Text style={styles.freeText}>
                  <Text style={styles.freeStrong}>Envío gratis</Text> en compras mayores a $
                  {freeShippingFrom.toFixed(2)}.{' '}
                  {qualifiesForFreeShipping ? '¡Tu lista califica!' : ''}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => buyAll(navigation)}
              disabled={buyingAll}
              activeOpacity={0.85}
            >
              {buyingAll ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="cart" size={17} color={colors.white} />
                  <Text style={styles.buyButtonText}>
                    Comprar lista completa ({buyable.length})
                  </Text>
                  <Text style={styles.buyButtonPrice}>${listTotal.toFixed(2)}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      <BottomTabBar active="Perfil" />
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
    headerTitle: { fontFamily: SERIF, fontSize: 19, fontWeight: '700', color: colors.text },
    headerSpacer: { width: 22 },

    content: { paddingHorizontal: 20, paddingBottom: 24 },

    title: { fontFamily: SERIF, fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 6 },
    countPill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: isDark ? '#2E2716' : '#FBEFD8',
      borderRadius: 12,
      paddingHorizontal: 11,
      paddingVertical: 6,
      marginTop: 10,
    },
    countDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: isDark ? '#E3BE72' : '#9A6B16',
      marginRight: 7,
    },
    countText: { fontSize: 11.5, fontWeight: '600', color: isDark ? '#E3BE72' : '#8A6D1F' },

    tabsRow: { paddingVertical: 16, paddingRight: 8 },
    tab: {
      paddingHorizontal: 15,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    tabText: { fontSize: 13, fontWeight: '600', color: colors.text },
    tabTextActive: { color: colors.white },

    loader: { marginVertical: 24 },
    stateBox: { alignItems: 'center', paddingVertical: 18 },
    emptyBox: { alignItems: 'center', paddingVertical: 40 },
    stateText: {
      fontSize: 13,
      color: colors.placeholder,
      textAlign: 'center',
      marginTop: 10,
      paddingHorizontal: 20,
    },
    retryText: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 10 },

    card: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    imageWrap: { width: 86, height: 96 },
    image: { width: '100%', height: '100%', borderRadius: 14, backgroundColor: colors.border },
    imageFallback: { alignItems: 'center', justifyContent: 'center' },
    stockBadge: {
      position: 'absolute',
      top: 6,
      left: 6,
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 7,
      paddingVertical: 3,
    },
    stockBadgeLow: { backgroundColor: colors.maroon },
    stockBadgeText: { fontSize: 8, letterSpacing: 0.5, fontWeight: '700', color: colors.white },

    cardBody: { flex: 1, marginLeft: 12 },
    cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    overline: {
      flex: 1,
      fontSize: 9,
      letterSpacing: 1.1,
      fontWeight: '700',
      color: colors.placeholder,
      marginRight: 8,
    },
    name: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 5 },
    specs: { fontSize: 11.5, color: colors.placeholder, marginTop: 3 },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    price: { fontSize: 18, fontWeight: '700', color: colors.text },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 36,
      paddingHorizontal: 14,
      borderRadius: 18,
      backgroundColor: colors.primary,
    },
    addButtonDisabled: { opacity: 0.4 },
    addButtonText: { fontSize: 12.5, fontWeight: '700', color: colors.white, marginLeft: 6 },

    buyCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      marginTop: 8,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    freeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    freeIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    freeText: { flex: 1, fontSize: 12, lineHeight: 17, color: colors.placeholder },
    freeStrong: { fontWeight: '700', color: colors.text },

    buyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 54,
      borderRadius: 27,
      backgroundColor: colors.maroon,
    },
    buyButtonText: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.white, marginLeft: 10 },
    buyButtonPrice: { fontSize: 16, fontWeight: '700', color: colors.white },
  });
