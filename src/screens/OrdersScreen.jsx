import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useOrders } from '../hooks/useOrders.jsx';
import { formatOrderDate } from '../utils/orderStatus.js';

const STATUS_COLORS = {
  confirmed: { bg: '#FBE3DE', text: '#B23B2E' },
  progress: { bg: '#DCEFE1', text: '#1B4D2E' },
  transit: { bg: '#DCE7FA', text: '#3B5DB2' },
  done: { bg: '#E4EFE4', text: '#3D6B4A' },
  rejected: { bg: '#F8D7DA', text: '#B23B2E' },
};

export default function OrdersScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    tabs, tab, setTab, orders, loading, error, retry,
    reordering, goToDetail, buyAgain, getStatusMeta, summarizeItems,
  } = useOrders(navigation);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Pedidos</Text>
        <Ionicons name="menu" size={22} color={colors.white} />
      </View>

      <View style={styles.tabs}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabPill, tab === t.key && styles.tabPillActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <Text style={styles.stateText}>Cargando tus pedidos...</Text> : null}
      {error ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity onPress={retry}><Text style={styles.retryText}>Reintentar</Text></TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        contentContainerStyle={styles.list}
        data={orders}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          !loading && !error ? <Text style={styles.stateText}>Todavía no tienes pedidos en esta categoría.</Text> : null
        }
        renderItem={({ item }) => {
          const meta = getStatusMeta(item.status);
          const statusColor = STATUS_COLORS[meta.kind];
          const firstImage = item.products?.[0]?.product?.image;
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardTitleWrap}>
                  <Text style={styles.orderCode}>Pedido {item.orderCode}</Text>
                  <Text style={styles.orderDate}>{formatOrderDate(item.createdAt)}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: statusColor.bg }]}>
                  <Text style={[styles.statusText, { color: statusColor.text }]}>{meta.label}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                {firstImage ? (
                  <Image source={{ uri: firstImage }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.thumbFallback]}>
                    <Ionicons name="leaf-outline" size={18} color={colors.placeholder} />
                  </View>
                )}
                <View style={styles.cardBodyText}>
                  <Text style={styles.itemsSummary} numberOfLines={2}>{summarizeItems(item)}</Text>
                  <Text style={styles.orderTotal}>$ {item.total?.toFixed(2)}</Text>
                </View>
              </View>

              {meta.kind === 'done' ? (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => buyAgain(item)}
                  disabled={reordering === item._id}
                >
                  <Text style={styles.secondaryButtonText}>
                    {reordering === item._id ? 'Agregando...' : 'Volver a comprar'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.detailButton} onPress={() => goToDetail(item)}>
                  <Text style={styles.detailButtonText}>Ver detalle</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />

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
    headerTitle: { color: colors.white, fontSize: 18, fontWeight: '700' },
    tabs: { flexDirection: 'row', padding: 20, paddingBottom: 8 },
    tabPill: { backgroundColor: colors.card, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9, marginRight: 10 },
    tabPillActive: { backgroundColor: colors.primary },
    tabText: { fontSize: 13, color: colors.text, fontWeight: '600' },
    tabTextActive: { color: colors.white },
    stateText: { fontSize: 12, color: colors.placeholder, textAlign: 'center', marginTop: 12 },
    stateBox: { alignItems: 'center' },
    retryText: { fontSize: 12, color: colors.primary, fontWeight: '700', marginTop: 4 },
    list: { padding: 20, paddingTop: 8 },
    card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardTitleWrap: { flex: 1, marginRight: 10 },
    orderCode: { fontSize: 15, fontWeight: '800', color: colors.text },
    orderDate: { fontSize: 11, color: colors.placeholder, marginTop: 2 },
    statusPill: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
    statusText: { fontSize: 11, fontWeight: '700' },
    cardBody: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
    thumb: { width: 46, height: 46, borderRadius: 10, backgroundColor: colors.border },
    thumbFallback: { alignItems: 'center', justifyContent: 'center' },
    cardBodyText: { flex: 1, marginLeft: 12 },
    itemsSummary: { fontSize: 13, color: colors.text, fontWeight: '600' },
    orderTotal: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: 4 },
    detailButton: { backgroundColor: colors.maroonDark, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 14 },
    detailButtonText: { color: colors.white, fontWeight: '700', fontSize: 14 },
    secondaryButton: {
      borderWidth: 1.5, borderColor: colors.primary, borderRadius: 12,
      paddingVertical: 13, alignItems: 'center', marginTop: 14,
    },
    secondaryButtonText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  });
