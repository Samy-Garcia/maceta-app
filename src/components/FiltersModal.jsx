import { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';

// Rangos rápidos de precio calculados sobre el precio real más alto de la
// categoría, en vez de tramos fijos que podrían quedar fuera del catálogo.
function quickRanges(maxPrice) {
  const step = Math.max(5, Math.round(maxPrice / 4 / 5) * 5);
  return [
    { label: '< $' + step, range: [0, step] },
    { label: '$' + step + ' - $' + step * 2, range: [step, step * 2] },
    { label: '$' + step * 2 + ' - $' + step * 3, range: [step * 2, step * 3] },
    { label: '+ $' + step * 3, range: [step * 3, maxPrice] },
  ];
}

// Panel de filtros del catálogo. Todas las opciones salen de los productos que
// de verdad tiene cargados la categoría (colores, tamaños y precios reales),
// nunca de listas fijas.
export default function FiltersModal({
  visible, onClose,
  tabs = [], counts = {}, activeTab, changeTab,
  sortOptions = [], sortOrder, setSortOrder,
  availableSizes = [], sizeFilters, toggleSizeFilter,
  availableColors = [], colorFilters, toggleColorFilter,
  maxPrice, priceRange, setPriceRange,
  onlyOffers, setOnlyOffers, onlyAvailable, setOnlyAvailable,
  resetFilters, activeFilterCount = 0, resultCount = 0,
}) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const { width } = useWindowDimensions();
  const sliderLength = Math.max(200, width - 92);

  const [sliderValues, setSliderValues] = useState(priceRange || [0, maxPrice]);

  useEffect(() => {
    setSliderValues(priceRange || [0, maxPrice]);
  }, [visible, maxPrice, priceRange]);

  const commitBound = (index) => (text) => {
    const value = Number(text.replace(/[^\d.]/g, ''));
    if (Number.isNaN(value)) return;
    const next = [...(priceRange || [0, maxPrice])];
    next[index] = value;
    setPriceRange([Math.min(next[0], next[1]), Math.max(next[0], next[1])]);
  };

  const rangeIsActive = (range) =>
    priceRange && priceRange[0] === range[0] && priceRange[1] === range[1];

  const collections = tabs.filter((tab) => counts[tab.key] > 0);
  const currentCollection = tabs.find((tab) => tab.key === activeTab);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>Filtros</Text>
            <Text style={styles.subtitle}>MACETAS503 ATELIER</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.statusRow}>
          <View style={styles.activePill}>
            <Text style={styles.activePillText}>
              {activeFilterCount} {activeFilterCount === 1 ? 'ACTIVO' : 'ACTIVOS'}
            </Text>
          </View>
          <Text style={styles.statusLabel}>{currentCollection?.label || 'Catálogo'}</Text>
          <TouchableOpacity onPress={resetFilters}>
            <Text style={styles.resetText}>Reestablecer</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {collections.length > 0 && changeTab ? (
            <>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>Colecciones</Text>
                <Text style={styles.sectionHint}>CATEGORÍA</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {collections.map((tab) => {
                  const active = tab.key === activeTab;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => changeTab(tab.key)}
                      activeOpacity={0.8}
                    >
                      {active ? <View style={styles.chipDot} /> : null}
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          ) : null}

          <View style={styles.card}>
            <View style={styles.sectionHead}>
              <Text style={styles.cardTitle}>Rango de Precio</Text>
              <Text style={styles.sectionHint}>USD</Text>
            </View>

            <View style={styles.boundsRow}>
              <View style={styles.bound}>
                <Text style={styles.boundLabel}>MÍNIMO</Text>
                <View style={styles.boundInputRow}>
                  <Text style={styles.boundCurrency}>$</Text>
                  <TextInput
                    style={styles.boundInput}
                    keyboardType="decimal-pad"
                    defaultValue={String(sliderValues[0] ?? 0)}
                    onEndEditing={(e) => commitBound(0)(e.nativeEvent.text)}
                  />
                </View>
              </View>
              <View style={styles.bound}>
                <Text style={styles.boundLabel}>MÁXIMO</Text>
                <View style={styles.boundInputRow}>
                  <Text style={styles.boundCurrency}>$</Text>
                  <TextInput
                    style={styles.boundInput}
                    keyboardType="decimal-pad"
                    defaultValue={String(sliderValues[1] ?? maxPrice)}
                    onEndEditing={(e) => commitBound(1)(e.nativeEvent.text)}
                  />
                </View>
              </View>
            </View>

            <MultiSlider
              values={sliderValues}
              min={0}
              max={maxPrice}
              step={1}
              sliderLength={sliderLength}
              onValuesChange={setSliderValues}
              onValuesChangeFinish={(values) => setPriceRange(values)}
              selectedStyle={{ backgroundColor: colors.primary }}
              unselectedStyle={{ backgroundColor: colors.border }}
              markerStyle={styles.marker}
            />

            <View style={styles.quickRow}>
              {quickRanges(maxPrice).map((quick) => {
                const active = rangeIsActive(quick.range);
                return (
                  <TouchableOpacity
                    key={quick.label}
                    style={[styles.quickChip, active && styles.quickChipActive]}
                    onPress={() => setPriceRange(active ? null : quick.range)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.quickText, active && styles.quickTextActive]}>{quick.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {availableColors.length > 0 ? (
            <>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>Acabado y Color</Text>
                <Text style={styles.sectionHint}>
                  {colorFilters.size > 0 ? colorFilters.size + ' SELECCIONADOS' : 'TODOS'}
                </Text>
              </View>
              <View style={styles.card}>
                {availableColors.map((color, index) => {
                  const active = colorFilters.has(color.name);
                  return (
                    <TouchableOpacity
                      key={color.name}
                      style={[styles.row, index > 0 && styles.rowDivider]}
                      onPress={() => toggleColorFilter(color.name)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.swatch, { backgroundColor: color.hex || colors.border }]}>
                        {active ? <Ionicons name="checkmark" size={13} color={colors.white} /> : null}
                      </View>
                      <Text style={styles.rowTitle}>{color.name}</Text>
                      <Text style={styles.rowCount}>{color.count} U.</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : null}

          {availableSizes.length > 0 ? (
            <>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>Dimensiones y Tamaño</Text>
                <Text style={styles.sectionHint}>
                  {sizeFilters.size > 0 ? sizeFilters.size + ' SELECCIONADOS' : 'TODOS'}
                </Text>
              </View>
              <View style={styles.sizeGrid}>
                {availableSizes.map((size) => {
                  const active = sizeFilters.has(size.name);
                  return (
                    <TouchableOpacity
                      key={size.name}
                      style={[styles.sizeCard, active && styles.sizeCardActive]}
                      onPress={() => toggleSizeFilter(size.name)}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name="cube-outline"
                        size={17}
                        color={active ? colors.white : colors.placeholder}
                      />
                      <Text style={[styles.sizeName, active && styles.sizeNameActive]} numberOfLines={1}>
                        {size.name}
                      </Text>
                      <Text style={[styles.sizeCount, active && styles.sizeCountActive]}>
                        {size.count} {size.count === 1 ? 'pieza' : 'piezas'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : null}

          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Disponibilidad</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={styles.switchTexts}>
                <Text style={styles.rowTitle}>Piezas en oferta</Text>
                <Text style={styles.rowNote}>Solo lo que tiene descuento activo</Text>
              </View>
              <Switch
                value={onlyOffers}
                onValueChange={setOnlyOffers}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor={colors.white}
              />
            </View>
            <View style={[styles.switchRow, styles.rowDivider]}>
              <View style={styles.switchTexts}>
                <Text style={styles.rowTitle}>Disponibilidad inmediata</Text>
                <Text style={styles.rowNote}>Oculta lo que está sin stock</Text>
              </View>
              <Switch
                value={onlyAvailable}
                onValueChange={setOnlyAvailable}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor={colors.white}
              />
            </View>
          </View>

          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Ordenar por</Text>
            <Text style={styles.sectionHint}>CRITERIO</Text>
          </View>
          <View style={styles.card}>
            {sortOptions.map((option, index) => {
              const active = option.key === sortOrder;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.row, index > 0 && styles.rowDivider]}
                  onPress={() => setSortOrder(option.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.rowTitle}>{option.label}</Text>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearButton} onPress={resetFilters}>
            <Text style={styles.clearText}>Limpiar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.applyText}>Ver {resultCount} piezas</Text>
            <Ionicons name="arrow-forward" size={15} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: isDark ? colors.background : '#F6F7F5' },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 52,
      paddingBottom: 12,
    },
    headerTitles: { alignItems: 'center' },
    headerSpacer: { width: 24 },
    title: { fontFamily: SERIF, fontSize: 21, fontWeight: '700', color: colors.text },
    subtitle: { fontSize: 8.5, letterSpacing: 1.6, fontWeight: '700', color: colors.placeholder, marginTop: 2 },

    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 14,
    },
    activePill: {
      backgroundColor: colors.primarySoft,
      borderRadius: 8,
      paddingHorizontal: 9,
      paddingVertical: 4,
    },
    activePillText: { fontSize: 9.5, letterSpacing: 0.8, fontWeight: '700', color: colors.primary },
    statusLabel: { flex: 1, fontSize: 12, color: colors.placeholder, marginLeft: 10 },
    resetText: { fontSize: 12, fontWeight: '700', color: colors.maroon },

    content: { paddingHorizontal: 20, paddingBottom: 24 },

    sectionHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 22,
      marginBottom: 12,
    },
    sectionTitle: { fontFamily: SERIF, fontSize: 18, fontWeight: '700', color: colors.text },
    sectionHint: { fontSize: 9, letterSpacing: 1.2, fontWeight: '700', color: colors.placeholder },
    cardTitle: { fontFamily: SERIF, fontSize: 17, fontWeight: '700', color: colors.text },

    chipsRow: { paddingRight: 8, paddingBottom: 2 },
    chip: {
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
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#E8A33D', marginRight: 7 },
    chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
    chipTextActive: { color: colors.white },

    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginTop: 4,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },

    boundsRow: { flexDirection: 'row', marginTop: 14 },
    bound: {
      flex: 1,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E4E8E4',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 9,
      marginRight: 10,
    },
    boundLabel: { fontSize: 9, letterSpacing: 1, fontWeight: '700', color: colors.placeholder },
    boundInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    boundCurrency: { fontSize: 15, fontWeight: '700', color: colors.text, marginRight: 4 },
    boundInput: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text, padding: 0 },
    marker: {
      height: 18,
      width: 18,
      borderRadius: 9,
      backgroundColor: colors.primary,
      borderWidth: 0,
    },

    quickRow: { flexDirection: 'row', marginTop: 10 },
    quickChip: {
      flex: 1,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 6,
      backgroundColor: isDark ? colors.card : '#F2F4F2',
    },
    quickChipActive: { backgroundColor: colors.primary },
    quickText: { fontSize: 11, fontWeight: '600', color: colors.text },
    quickTextActive: { color: colors.white },

    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    rowDivider: { borderTopWidth: 1, borderTopColor: colors.border },
    rowTitle: { flex: 1, fontSize: 13.5, fontWeight: '600', color: colors.text },
    rowNote: { fontSize: 11, color: colors.placeholder, marginTop: 2 },
    rowCount: { fontSize: 11, fontWeight: '700', color: colors.placeholder },
    swatch: {
      width: 26,
      height: 26,
      borderRadius: 13,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },

    sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    sizeCard: {
      width: '48%',
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    sizeCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    sizeName: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 8 },
    sizeNameActive: { color: colors.white },
    sizeCount: { fontSize: 11, color: colors.placeholder, marginTop: 3 },
    sizeCountActive: { color: 'rgba(255,255,255,0.8)' },

    switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    switchTexts: { flex: 1, marginRight: 12 },

    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioActive: { borderColor: colors.primary },
    radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.primary },

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 24,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    clearButton: { paddingHorizontal: 18, paddingVertical: 14 },
    clearText: { fontSize: 14, fontWeight: '700', color: colors.maroon },
    applyButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 52,
      borderRadius: 26,
      marginLeft: 10,
      backgroundColor: colors.primary,
    },
    applyText: { fontSize: 15, fontWeight: '700', color: colors.white, marginRight: 8 },
  });
