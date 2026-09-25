import { useState } from 'react';
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
import { TYPE_LABEL } from '../utils/productTypes.js';
import { favoriteKey } from '../hooks/useProductActions.jsx';
import { isRecentlyAdded } from '../utils/normalizeProduct.js';

// Vista de una colección: la misma categoría con sus filtros propios.
// Se llega desde las tarjetas de "Colecciones del Atelier".
export default function CollectionScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const [globalSearch, setGlobalSearch] = useState('');
  const {
    tabs, collections, counts, activeTab, changeTab, query, setQuery,
    items, totalCount, loading, error, retry, hasMore, loadMore,
    favoriteIds, toggleFavorite, addToCart,
    sortOptions, sortOrder, setSortOrder,
    filtersVisible, setFiltersVisible,
    availableSizes, sizeFilters, toggleSizeFilter, clearSizeFilters,
    availableColors, colorFilters, toggleColorFilter,
    maxPrice, priceRange, setPriceRange, resetFilters, activeFilterCount,
  } = useProducts({ tab: route?.params?.tab || 'maceta' });

  const current = tabs.find((tab) => tab.key === activeTab);
  // Otra colección para saltar desde el pie, siempre distinta a la actual
  const suggestion = collections.find((collection) => collection.key !== activeTab);

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
            value={globalSearch}
            onChangeText={setGlobalSearch}
            onSubmitEditing={() =>
              navigation.navigate('Products', globalSearch.trim() ? { query: globalSearch.trim() } : undefined)
            }
            returnKeyType="search"
            placeholder="Buscar en todo el catálogo..."
            placeholderTextColor={colors.placeholder}
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.overline}>CATÁLOGO · MACETAS503</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{current?.label || 'Catálogo'}</Text>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{counts[activeTab]} piezas</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {tabs
            .filter((tab) => tab.key !== 'todos' && counts[tab.key] > 0)
            .map((tab) => {
              const active = tab.key === activeTab;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, active && styles.tabActive]}
                  onPress={() => changeTab(tab.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
                  <Text style={[styles.tabCount, active && styles.tabCountActive]}>{counts[tab.key]}</Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>

        <View style={styles.filterRow}>
          <View style={styles.innerSearch}>
            <Ionicons name="search" size={15} color={colors.placeholder} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Filtrar dentro de esta colección..."
              placeholderTextColor={colors.placeholder}
              style={styles.innerSearchInput}
            />
          </View>
          <TouchableOpacity style={styles.filtersButton} onPress={() => setFiltersVisible(true)}>
            <Ionicons name="options-outline" size={15} color={colors.text} />
            <Text style={styles.filtersButtonText}>Filtros</Text>
            {activeFilterCount > 0 ? (
              <View style={styles.filtersBadge}>
                <Text style={styles.filtersBadgeText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        {availableSizes.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sizeRow}>
            <TouchableOpacity
              style={[styles.sizeChip, sizeFilters.size === 0 && styles.sizeChipActive]}
              onPress={clearSizeFilters}
              activeOpacity={0.8}
            >
              <Text style={[styles.sizeChipText, sizeFilters.size === 0 && styles.sizeChipTextActive]}>
                Todas
              </Text>
            </TouchableOpacity>
            {availableSizes.map((size) => {
              const active = sizeFilters.has(size);
              return (
                <TouchableOpacity
                  key={size}
                  style={[styles.sizeChip, active && styles.sizeChipActive]}
                  onPress={() => toggleSizeFilter(size)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.sizeChipText, active && styles.sizeChipTextActive]}>{size}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}

        <View style={styles.toolbar}>
          <SortSelect options={sortOptions} value={sortOrder} onChange={setSortOrder} />
          <Text style={styles.showing}>
            Mostrando {items.length} de {totalCount} piezas
          </Text>
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
          <Text style={styles.stateText}>No hay piezas que coincidan con estos filtros.</Text>
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
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
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

        {suggestion ? (
          <View style={styles.suggestion}>
            <View style={styles.suggestionTexts}>
              <Text style={styles.suggestionOverline}>OTRA COLECCIÓN</Text>
              <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
              <Text style={styles.suggestionNote}>{suggestion.note}</Text>
            </View>
            <TouchableOpacity
              style={styles.suggestionButton}
              onPress={() => changeTab(suggestion.key)}
              activeOpacity={0.85}
            >
              <Text style={styles.suggestionButtonText}>Explorar</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.white} />
            </TouchableOpacity>
            {suggestion.image ? (
              <Image source={{ uri: suggestion.image }} style={styles.suggestionImage} resizeMode="cover" />
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <BottomTabBar active="Productos" />

      <FiltersModal
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
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
        resetFilters={resetFilters}
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

    content: { paddingHorizontal: 20, paddingBottom: 24 },

    overline: { fontSize: 9, letterSpacing: 1.6, fontWeight: '700', color: colors.maroon, marginTop: 6 },
    titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    title: { fontFamily: SERIF, fontSize: 24, fontWeight: '700', color: colors.text, marginRight: 10 },
    countPill: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
    },
    countPillText: { fontSize: 11, fontWeight: '700', color: colors.text },

    tabsRow: { paddingVertical: 16, paddingRight: 8 },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      height: 36,
      borderRadius: 18,
      marginRight: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    tabText: { fontSize: 13, fontWeight: '600', color: colors.text },
    tabTextActive: { color: colors.white },
    tabCount: { fontSize: 11, fontWeight: '700', color: colors.placeholder, marginLeft: 7 },
    tabCountActive: { color: 'rgba(255,255,255,0.8)' },

    filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    innerSearch: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      height: 42,
      borderRadius: 21,
      paddingHorizontal: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
    },
    innerSearchInput: { flex: 1, marginLeft: 8, fontSize: 12.5, color: colors.text },
    filtersButton: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 42,
      paddingHorizontal: 14,
      borderRadius: 21,
      marginLeft: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
    },
    filtersButtonText: { fontSize: 12.5, fontWeight: '700', color: colors.text, marginLeft: 6 },
    filtersBadge: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.maroon,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      marginLeft: 6,
    },
    filtersBadgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },

    sizeRow: { paddingBottom: 16, paddingRight: 8 },
    sizeChip: {
      paddingHorizontal: 14,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
    },
    sizeChipActive: { backgroundColor: colors.text, borderColor: colors.text },
    sizeChipText: { fontSize: 12.5, fontWeight: '600', color: colors.text },
    sizeChipTextActive: { color: colors.white },

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

    suggestion: {
      marginTop: 20,
      borderRadius: 20,
      padding: 20,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
    },
    suggestionTexts: { maxWidth: '65%' },
    suggestionOverline: { fontSize: 9, letterSpacing: 1.4, fontWeight: '700', color: colors.maroon },
    suggestionTitle: {
      fontFamily: SERIF,
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginTop: 6,
    },
    suggestionNote: { fontSize: 12, color: colors.placeholder, marginTop: 4 },
    suggestionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: colors.primary,
      borderRadius: 20,
      height: 40,
      paddingHorizontal: 16,
      marginTop: 16,
    },
    suggestionButtonText: { fontSize: 13, fontWeight: '700', color: colors.white, marginRight: 6 },
    suggestionImage: {
      position: 'absolute',
      right: -18,
      bottom: -18,
      width: 110,
      height: 110,
      borderRadius: 55,
      opacity: 0.35,
    },
  });
