import { Alert, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../components/BottomTabBar.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useProducts } from '../hooks/useProducts.jsx';
import { isRecentlyAdded } from '../utils/normalizeProduct.js';

export default function ProductsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    tabs, activeTab, changeTab, query, setQuery, items, totalCount,
    loading, error, retry, hasMore, loadMore,
    favoriteIds, toggleFavorite, addToCart, sortOrder, setSortOrder,
  } = useProducts();

  const openFilters = () => {
    Alert.alert('Ordenar por', undefined, [
      { text: 'Recomendados', onPress: () => setSortOrder('default') },
      { text: 'Precio: menor a mayor', onPress: () => setSortOrder('price-asc') },
      { text: 'Precio: mayor a menor', onPress: () => setSortOrder('price-desc') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.white} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar Plantas..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            style={styles.searchInput}
          />
        </View>
        <Ionicons name="menu" size={22} color={colors.white} />
      </View>

      <FlatList
        contentContainerStyle={styles.content}
        data={items}
        keyExtractor={(item) => `${item.productType}-${item.id}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Todos los{'\n'}Productos</Text>
              <TouchableOpacity style={styles.filtersButton} onPress={openFilters}>
                <Ionicons name="options-outline" size={14} color={colors.text} />
                <Text style={styles.filtersText}>Filtros</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabPill, activeTab === tab.key && styles.tabPillActive]}
                  onPress={() => changeTab(tab.key)}
                >
                  <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {loading ? <Text style={styles.stateText}>Cargando productos...</Text> : null}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.stateText}>{error}</Text>
                <TouchableOpacity onPress={retry}>
                  <Text style={styles.retryText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            {!loading && !error && totalCount === 0 ? (
              <Text style={styles.stateText}>No hay productos en esta categoría todavía.</Text>
            ) : null}
          </>
        }
        renderItem={({ item }) => {
          const isFavorite = favoriteIds.has(item.id);
          const badge =
            activeTab === 'bestsellers' && item.sold
              ? `${item.sold} vendidos`
              : item.discountPercentage
              ? `-${item.discountPercentage}%`
              : isRecentlyAdded(item)
              ? 'Nuevo'
              : null;

          return (
            <TouchableOpacity
              style={styles.productCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
            >
              <View style={styles.productImageWrapper}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
                ) : (
                  <View style={styles.productImageFallback}>
                    <Ionicons name="leaf-outline" size={26} color={colors.placeholder} />
                  </View>
                )}
                {badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ) : null}
                <TouchableOpacity style={styles.heartButton} onPress={() => toggleFavorite(item)}>
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={16}
                    color={isFavorite ? colors.maroon : colors.text}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              {item.dimensions ? <Text style={styles.productDims}>{item.dimensions}</Text> : null}

              <View style={styles.productFooter}>
                <View>
                  <Text style={styles.productPrice}>
                    $ {(item.discountedPrice ?? item.price).toFixed(2)}
                  </Text>
                  {item.discountedPrice ? (
                    <Text style={styles.productOldPrice}>$ {item.price.toFixed(2)}</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={[styles.addButton, !item.stock && styles.addButtonDisabled]}
                  onPress={() => addToCart(item)}
                  disabled={!item.stock}
                >
                  <Ionicons name="add" size={16} color={colors.white} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
              <Text style={styles.loadMoreText}>Cargar Más</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <BottomTabBar active="Productos" />
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.shopBg },
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 20,
      paddingHorizontal: 14,
      height: 38,
      marginRight: 14,
    },
    searchInput: { marginLeft: 8, color: colors.white, flex: 1, fontSize: 13 },
    content: { padding: 20, paddingBottom: 20 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 4 },
    title: { fontSize: 24, fontWeight: '700', color: colors.text, lineHeight: 28 },
    filtersButton: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
      borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 4,
    },
    filtersText: { fontSize: 12, color: colors.text, marginLeft: 6, fontWeight: '600' },
    tabs: { paddingVertical: 16 },
    tabPill: {
      backgroundColor: colors.card, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9, marginRight: 10,
    },
    tabPillActive: { backgroundColor: colors.maroon },
    tabText: { fontSize: 13, color: colors.text, fontWeight: '600' },
    tabTextActive: { color: colors.white },
    stateText: { fontSize: 12, color: colors.placeholder, textAlign: 'center', marginTop: 12, marginBottom: 8 },
    errorBox: { alignItems: 'center' },
    retryText: { fontSize: 12, color: colors.primary, fontWeight: '700', marginTop: 4 },
    row: { justifyContent: 'space-between' },
    productCard: { width: '48%', backgroundColor: colors.card, borderRadius: 14, padding: 10, marginBottom: 14 },
    productImageWrapper: {
      width: '100%', height: 110, borderRadius: 10, backgroundColor: colors.border,
      marginBottom: 8, overflow: 'hidden',
    },
    productImage: { width: '100%', height: '100%' },
    productImageFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    badge: {
      position: 'absolute', top: 8, left: 8, backgroundColor: colors.maroon,
      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    },
    badgeText: { color: colors.white, fontSize: 9, fontWeight: '700' },
    heartButton: {
      position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13,
      backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center',
    },
    productName: { fontSize: 13, fontWeight: '700', color: colors.text },
    productDims: { fontSize: 10, color: colors.placeholder, marginTop: 2 },
    productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 6 },
    productPrice: { fontSize: 13, fontWeight: '700', color: colors.text },
    productOldPrice: { fontSize: 10, color: colors.placeholder, textDecorationLine: 'line-through' },
    addButton: {
      width: 24, height: 24, borderRadius: 6, backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    addButtonDisabled: { opacity: 0.4 },
    loadMoreButton: {
      alignSelf: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10,
      paddingHorizontal: 24, paddingVertical: 12, marginTop: 8,
    },
    loadMoreText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  });
