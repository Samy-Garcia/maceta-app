import {
  ActivityIndicator,
  Image,
  ScrollView,
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
import HomeProductCard from '../components/HomeProductCard.jsx';
import SortSelect from '../components/SortSelect.jsx';
import FiltersModal from '../components/FiltersModal.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { useProducts } from '../hooks/useProducts.jsx';
import { useStoreConfig } from '../hooks/useStoreConfig.jsx';
import { TYPE_LABEL, productRoute } from '../utils/productTypes.js';
import { favoriteKey } from '../hooks/useProductActions.jsx';
import { isRecentlyAdded } from '../utils/normalizeProduct.js';

// Chips del catálogo completo: las mismas categorías reales, sin las vistas
// derivadas (ofertas / más vendidos) que ya tienen su propia colección.
const CHIP_KEYS = ['todos', 'maceta', 'vela', 'planta', 'otro', 'combo'];

export default function ProductsScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const { freeShippingFrom } = useStoreConfig();
  const {
    tabs, collections, counts, activeTab, changeTab, query, setQuery,
    items, totalCount, loading, error, retry, hasMore, loadMore,
    favoriteIds, toggleFavorite, addToCart,
    sortOptions, sortOrder, setSortOrder,
    filtersVisible, setFiltersVisible,
    availableSizes, sizeFilters, toggleSizeFilter,
    availableColors, colorFilters, toggleColorFilter,
    maxPrice, priceRange, setPriceRange, onlyOffers, setOnlyOffers,
    onlyAvailable, setOnlyAvailable, resetFilters, activeFilterCount,
  } = useProducts({ tab: route?.params?.tab, query: route?.params?.query });

  const chips = tabs.filter((tab) => CHIP_KEYS.includes(tab.key));
  const openCollection = (key) => navigation.navigate('Collection', { tab: key });

  // Etiqueta destacada de la tarjeta: primero la oferta real, luego lo recién
  // ingresado y por último la falta de stock.
  const badgeOf = (item) => {
    if (item.discountPercentage) return '-' + item.discountPercentage + '% OFF';
    if (isRecentlyAdded(item)) return 'Nuevo';
    if (!item.stock) return 'Agotado';
    return undefined;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ShopHeader />

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.placeholder} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar plantas, macetas artesanales..."
            placeholderTextColor={colors.placeholder}
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFiltersVisible(true)}>
          <Ionicons name="options-outline" size={18} color={colors.text} />
          {activeFilterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {collections.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Colecciones Macetas503</Text>
            <Text style={styles.sectionSub}>Curadas por maestros ceramistas</Text>

            <View style={styles.collections}>
              {collections.map((collection) => (
                <TouchableOpacity
                  key={collection.key}
                  style={styles.collectionCard}
                  activeOpacity={0.9}
                  onPress={() => openCollection(collection.key)}
                >
                  {collection.image ? (
                    <Image
                      source={{ uri: collection.image }}
                      style={styles.collectionImage}
                      resizeMode="cover"
                    />
                  ) : null}
                  <View
                    style={[
                      styles.collectionShade,
                      collection.key === 'ofertas' && styles.collectionShadeOffer,
                      collection.key === 'combo' && styles.collectionShadeCombo,
                    ]}
                  />
                  {collection.tag ? (
                    <View style={styles.collectionTag}>
                      <Text style={styles.collectionTagText}>{collection.tag}</Text>
                    </View>
                  ) : null}
                  <View style={styles.collectionFoot}>
                    <View style={styles.collectionTexts}>
                      <Text style={styles.collectionTitle}>{collection.title}</Text>
                      <Text style={styles.collectionNote}>{collection.note}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={15} color={colors.white} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}

        <Text style={styles.overline}>EDICIÓN ARTESANAL</Text>
        <View style={styles.catalogHead}>
          <Text style={styles.catalogTitle}>Catálogo Completo</Text>
          <View style={styles.countPill}>
            <View style={styles.countDot} />
            <Text style={styles.countPillText}>{counts.todos} piezas</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {chips.map((tab) => {
            const active = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => changeTab(tab.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.toolbar}>
          <Text style={styles.showing}>
            Mostrando {items.length} de {totalCount} piezas
          </Text>
          <SortSelect options={sortOptions} value={sortOrder} onChange={setSortOrder} />
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

        {!loading && !error && totalCount === 0 ? (
          <Text style={styles.stateText}>No hay piezas que coincidan con tu búsqueda.</Text>
        ) : null}

        <View style={styles.grid}>
          {items.map((item) => (
            <HomeProductCard
              key={item.productType + '-' + item.id}
              product={item}
              overline={TYPE_LABEL[item.productType] || 'Pieza'}
              badge={badgeOf(item)}
              specs={item.description || item.dimensions}
              isFavorite={favoriteIds.has(favoriteKey(item.productType, item.id))}
              onPress={() => {
                const { name, params } = productRoute(item);
                navigation.navigate(name, params);
              }}
              onToggleFavorite={() => toggleFavorite(item)}
              onAdd={() => addToCart(item)}
            />
          ))}
        </View>

        {hasMore ? (
          <TouchableOpacity style={styles.loadMore} onPress={loadMore} activeOpacity={0.8}>
            <Text style={styles.loadMoreText}>Cargar más piezas artesanales</Text>
            <Ionicons name="chevron-down" size={15} color={colors.text} />
          </TouchableOpacity>
        ) : null}

        {freeShippingFrom != null ? (
          <View style={styles.shippingStrip}>
            <Ionicons name="car-outline" size={15} color={colors.white} />
            <Text style={styles.shippingText}>
              Envío gratis en órdenes sobre ${freeShippingFrom.toFixed(2)}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <BottomTabBar active="Productos" />

      <FiltersModal
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        tabs={tabs}
        counts={counts}
        activeTab={activeTab}
        changeTab={changeTab}
        sortOptions={sortOptions}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        availableSizes={availableSizes}
        sizeFilters={sizeFilters}
        toggleSizeFilter={toggleSizeFilter}
        availableColors={availableColors}
        colorFilters={colorFilters}
        toggleColorFilter={toggleColorFilter}
        maxPrice={maxPrice}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        onlyOffers={onlyOffers}
        setOnlyOffers={setOnlyOffers}
        onlyAvailable={onlyAvailable}
        setOnlyAvailable={setOnlyAvailable}
        resetFilters={resetFilters}
        activeFilterCount={activeFilterCount}
        resultCount={totalCount}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: isDark ? colors.background : '#F6F7F5' },

    searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      height: 42,
      borderRadius: 12,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: colors.text },
    filterButton: {
      width: 42,
      height: 42,
      borderRadius: 12,
      marginLeft: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
    },
    filterBadge: {
      position: 'absolute',
      top: -5,
      right: -5,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.maroon,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    filterBadgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },

    content: { paddingHorizontal: 20, paddingBottom: 24 },

    sectionTitle: { fontFamily: SERIF, fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 8 },
    sectionSub: { fontSize: 12, color: colors.placeholder, marginTop: 4 },

    collections: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    collectionCard: {
      width: '48%',
      height: 148,
      borderRadius: 18,
      overflow: 'hidden',
      marginBottom: 12,
      backgroundColor: colors.card,
    },
    collectionImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
    collectionShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(12, 32, 20, 0.42)' },
    collectionShadeOffer: { backgroundColor: 'rgba(110, 27, 43, 0.68)' },
    collectionShadeCombo: { backgroundColor: 'rgba(27, 77, 46, 0.68)' },
    collectionTag: {
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    collectionTagText: { fontSize: 8, letterSpacing: 1, fontWeight: '700', color: colors.white },
    collectionFoot: {
      position: 'absolute',
      left: 12,
      right: 12,
      bottom: 12,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
    collectionTexts: { flex: 1, marginRight: 8 },
    collectionTitle: { fontFamily: SERIF, fontSize: 18, fontWeight: '700', color: colors.white },
    collectionNote: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

    overline: {
      fontSize: 9,
      letterSpacing: 1.6,
      fontWeight: '700',
      color: colors.maroon,
      marginTop: 18,
    },
    catalogHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    catalogTitle: { fontFamily: SERIF, fontSize: 22, fontWeight: '700', color: colors.text },
    countPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
    },
    countDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary, marginRight: 6 },
    countPillText: { fontSize: 11, fontWeight: '700', color: colors.text },

    chipsRow: { paddingVertical: 14, paddingRight: 8 },
    chip: {
      paddingHorizontal: 15,
      height: 33,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
    chipTextActive: { color: colors.white },

    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    showing: { fontSize: 12, color: colors.placeholder },

    loader: { marginVertical: 24 },
    stateBox: { alignItems: 'center', paddingVertical: 18 },
    stateText: { fontSize: 13, color: colors.placeholder, textAlign: 'center', paddingVertical: 12 },
    retryText: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 6 },

    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

    loadMore: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 48,
      borderRadius: 24,
      marginTop: 6,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    loadMoreText: { fontSize: 13, fontWeight: '700', color: colors.text, marginRight: 6 },

    shippingStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 44,
      borderRadius: 22,
      marginTop: 16,
      backgroundColor: colors.primary,
    },
    shippingText: { fontSize: 12, fontWeight: '600', color: colors.white, marginLeft: 8 },
  });
