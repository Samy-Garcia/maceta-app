import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useTheme } from '../theme/ThemeContext.jsx';

// Panel de filtros reales para Productos: las opciones de tamaño/color salen
// de los productos que de verdad tiene cargados esa categoría (no de una
// lista fija), y el precio filtra sobre el precio real de cada producto.
export default function FiltersModal({
  visible, onClose, sortOrder, setSortOrder,
  availableSizes, sizeFilters, toggleSizeFilter,
  availableColors, colorFilters, toggleColorFilter,
  maxPrice, priceRange, setPriceRange, resetFilters,
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { width } = useWindowDimensions();
  const sliderLength = Math.max(200, width - 80);

  const [sliderValues, setSliderValues] = useState(priceRange || [0, maxPrice]);

  useEffect(() => {
    setSliderValues(priceRange || [0, maxPrice]);
  }, [visible, maxPrice, priceRange]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Filtros</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>ORDENAR POR</Text>
            {[
              { key: 'price-asc', label: 'Precio Ascendente' },
              { key: 'price-desc', label: 'Precio Descendente' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={styles.radioRow}
                onPress={() => setSortOrder(sortOrder === opt.key ? 'default' : opt.key)}
              >
                <Text style={styles.radioLabel}>{opt.label}</Text>
                <View style={[styles.radioCircle, sortOrder === opt.key && styles.radioCircleActive]}>
                  {sortOrder === opt.key ? <View style={styles.radioDot} /> : null}
                </View>
              </TouchableOpacity>
            ))}

            {availableSizes.length > 0 ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionLabel}>TAMAÑO</Text>
                {availableSizes.map((size) => (
                  <TouchableOpacity key={size} style={styles.checkRow} onPress={() => toggleSizeFilter(size)}>
                    <View style={[styles.checkbox, sizeFilters.has(size) && styles.checkboxActive]}>
                      {sizeFilters.has(size) ? <Ionicons name="checkmark" size={13} color={colors.white} /> : null}
                    </View>
                    <Text style={styles.checkLabel}>{size}</Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : null}

            {availableColors.length > 0 ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionLabel}>COLOR</Text>
                {availableColors.map((c) => (
                  <TouchableOpacity key={c.name} style={styles.checkRow} onPress={() => toggleColorFilter(c.name)}>
                    <View style={[styles.checkbox, colorFilters.has(c.name) && styles.checkboxActive]}>
                      {colorFilters.has(c.name) ? <Ionicons name="checkmark" size={13} color={colors.white} /> : null}
                    </View>
                    <View style={[styles.colorDot, { backgroundColor: c.hex || colors.border }]} />
                    <Text style={styles.checkLabel}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : null}

            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>PRECIO</Text>
            <View style={styles.sliderWrapper}>
              <MultiSlider
                values={sliderValues}
                min={0}
                max={maxPrice}
                step={1}
                sliderLength={sliderLength}
                onValuesChange={setSliderValues}
                onValuesChangeFinish={setPriceRange}
                selectedStyle={{ backgroundColor: colors.primary }}
                unselectedStyle={{ backgroundColor: colors.border }}
                markerStyle={styles.sliderMarker}
                trackStyle={{ height: 4, borderRadius: 2 }}
              />
            </View>
            <View style={styles.priceRow}>
              <View style={styles.priceBox}>
                <Text style={styles.priceText}>$ {sliderValues[0]}</Text>
              </View>
              <View style={styles.priceBox}>
                <Text style={styles.priceText}>$ {sliderValues[1]}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetText}>Limpiar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onClose}>
              <Text style={styles.applyText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '88%' },
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14,
    },
    title: { fontSize: 20, fontWeight: '800', color: colors.text },
    content: { paddingHorizontal: 20, paddingBottom: 12 },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.placeholder, letterSpacing: 0.5, marginBottom: 10 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
    radioRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10,
    },
    radioLabel: { fontSize: 14, color: colors.text },
    radioCircle: {
      width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border,
      alignItems: 'center', justifyContent: 'center',
    },
    radioCircleActive: { borderColor: colors.primary },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
    checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    checkbox: {
      width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: colors.border,
      alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    colorDot: { width: 18, height: 18, borderRadius: 9, marginRight: 10, borderWidth: 1, borderColor: colors.border },
    checkLabel: { fontSize: 14, color: colors.text },
    sliderWrapper: { alignItems: 'center', marginTop: 4 },
    sliderMarker: {
      height: 22, width: 22, borderRadius: 11, backgroundColor: colors.primary,
      borderWidth: 2, borderColor: colors.surface,
    },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    priceBox: { backgroundColor: colors.card, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
    priceText: { fontSize: 13, color: colors.text, fontWeight: '600' },
    footer: {
      flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24,
      borderTopWidth: 1, borderTopColor: colors.border,
    },
    resetButton: { paddingHorizontal: 16, justifyContent: 'center' },
    resetText: { color: colors.placeholder, fontWeight: '600', fontSize: 13 },
    applyButton: { flex: 1, backgroundColor: colors.maroon, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
    applyText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  });
