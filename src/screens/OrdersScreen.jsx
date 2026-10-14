import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import ShopHeader from '../components/ShopHeader.jsx';
import ReviewModal from '../components/ReviewModal.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { useOrders } from '../hooks/useOrders.jsx';
import { formatOrderDate, statusColors } from '../utils/orderStatus.js';

export default function OrdersScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const {
    tabs, tab, setTab, countOf, activeCount, query, setQuery,
    orders, loading, refreshing, error, retry, refresh,
    reordering, goToDetail, buyAgain,
    canReview, reviewOrder, setReviewOrder, submitReview, savingReview,
    getStatusMeta,
  } = useOrders(navigation);

  const renderOrder = ({ item: order }) => {
    const meta = getStatusMeta(order.status);
    const statusColor = statusColors(meta.kind, isDark);
    const products = order.products || [];

    return (
      <View style={styles.card}>
        <Text style={styles.cardOverline}>MACETAS503</Text>

        <View style={styles.cardTop}>
          <Text style={styles.orderCode}>Pedido {order.orderCode}</Text>
          <View style={[styles.statusPill, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>{meta.label}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.orderDate}>{formatOrderDate(order.createdAt)}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.orderTotal}>Total: ${order.total?.toFixed(2)}</Text>
        </View>

        {products.map((item) => (
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
                {item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'}
              </Text>
            </View>
            <Text style={styles.itemPrice}>${item.subtotal?.toFixed(2)}</Text>
          </View>
        ))}

        {order.shippingAddress ? (
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color={colors.maroon} />
            <Text style={styles.addressText} numberOfLines={2}>{order.shippingAddress}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          {canReview(order) ? (
            <TouchableOpacity style={styles.ghostButton} onPress={() => setReviewOrder(order)}>
              <Text style={styles.ghostText}>Reseña</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.ghostButton} onPress={() => goToDetail(order)}>
            <Text style={styles.ghostText}>Ver detalle</Text>
          </TouchableOpacity>
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
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ShopHeader />

      <FlatList
        contentContainerStyle={styles.list}
        data={orders}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={refresh}
        renderItem={renderOrder}
        ListHeaderComponent={
          <>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Pedidos</Text>
              {activeCount > 0 ? (
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>{activeCount} activos</Text>
                </View>
              ) : null}
              <View style={styles.titleSpacer} />
              <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
                <Ionicons name="refresh" size={14} color={colors.text} />
                <Text style={styles.refreshText}>Actualizar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>
              Consulta y da seguimiento al estado de tus pedidos artesanales.
            </Text>

            <View style={styles.searchBar}>
              <Ionicons name="search" size={16} color={colors.placeholder} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por código de pedido o pieza..."
                placeholderTextColor={colors.placeholder}
                style={styles.searchInput}
              />
            </View>

            <View style={styles.tabsRow}>
              {tabs.map((item) => {
                const active = item.key === tab;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.tab, active && styles.tabActive]}
                    onPress={() => setTab(item.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
                    <Text style={[styles.tabCount, active && styles.tabCountActive]}>
                      {countOf(item.key)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}

            {error ? (
              <View style={styles.stateBox}>
                <Text style={styles.stateText}>{error}</Text>
                <TouchableOpacity onPress={retry}>
                  <Text style={styles.retryText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.emptyBox}>
              <Ionicons name="cube-outline" size={30} color={colors.placeholder} />
              <Text style={styles.stateText}>
                {query.trim()
                  ? 'Ningún pedido coincide con esa búsqueda.'
                  : 'Todavía no tienes pedidos en esta categoría.'}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Products')}>
                <Text style={styles.retryText}>Ver el catálogo</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

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
    list: { paddingHorizontal: 20, paddingBottom: 20 },

    titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    title: { fontFamily: SERIF, fontSize: 26, fontWeight: '700', color: colors.text, marginRight: 10 },
    activePill: {
      backgroundColor: colors.primarySoft,
      borderRadius: 10,
      paddingHorizontal: 9,
      paddingVertical: 4,
    },
    activePillText: { fontSize: 11, fontWeight: '700', color: colors.primary },
    titleSpacer: { flex: 1 },
    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 32,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    refreshText: { fontSize: 11.5, fontWeight: '700', color: colors.text, marginLeft: 5 },

    subtitle: { fontSize: 12.5, lineHeight: 18, color: colors.placeholder, marginTop: 6 },

    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 44,
      borderRadius: 22,
      paddingHorizontal: 14,
      marginTop: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: colors.text },

    tabsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, marginBottom: 4 },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      height: 34,
      borderRadius: 17,
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    tabText: { fontSize: 12.5, fontWeight: '600', color: colors.text },
    tabTextActive: { color: colors.white },
    tabCount: { fontSize: 10.5, fontWeight: '700', color: colors.placeholder, marginLeft: 6 },
    tabCountActive: { color: 'rgba(255,255,255,0.8)' },

    loader: { marginVertical: 24 },
    stateBox: { alignItems: 'center', paddingVertical: 18 },
    stateText: { fontSize: 13, color: colors.placeholder, textAlign: 'center', marginTop: 10 },
    retryText: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 10 },
    emptyBox: { alignItems: 'center', paddingVertical: 40 },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      marginTop: 14,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    cardOverline: { fontSize: 8.5, letterSpacing: 1.4, fontWeight: '700', color: colors.placeholder },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    orderCode: { fontFamily: SERIF, fontSize: 18, fontWeight: '700', color: colors.text, flex: 1 },
    statusPill: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
    statusText: { fontSize: 11, fontWeight: '700' },

    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    orderDate: { fontSize: 12, color: colors.placeholder },
    metaDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: colors.placeholder,
      marginHorizontal: 8,
    },
    orderTotal: { fontSize: 12, fontWeight: '700', color: colors.text },

    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderRadius: 14,
      marginTop: 12,
      backgroundColor: isDark ? colors.card : '#F7F9F8',
    },
    itemImage: { width: 44, height: 44, borderRadius: 11, backgroundColor: colors.border },
    itemImageFallback: { alignItems: 'center', justifyContent: 'center' },
    itemTexts: { flex: 1, marginHorizontal: 11 },
    itemName: { fontSize: 13, fontWeight: '700', color: colors.text },
    itemMeta: { fontSize: 11, color: colors.placeholder, marginTop: 2 },
    itemPrice: { fontSize: 13.5, fontWeight: '700', color: colors.text },

    addressRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 12 },
    addressText: { flex: 1, fontSize: 11.5, lineHeight: 16, color: colors.placeholder, marginLeft: 6 },

    actions: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
    ghostButton: {
      height: 42,
      paddingHorizontal: 14,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      backgroundColor: isDark ? colors.card : '#F2F4F2',
    },
    ghostText: { fontSize: 12.5, fontWeight: '700', color: colors.text },
    solidButton: {
      flex: 1,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    solidText: { fontSize: 12.5, fontWeight: '700', color: colors.white },
  });
