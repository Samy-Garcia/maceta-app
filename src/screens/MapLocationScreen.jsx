import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import OsmMapPicker, { drawRouteScript, searchScript } from '../components/OsmMapPicker.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { SERIF } from '../theme/typography.js';
import { useShippingMap } from '../hooks/useShippingMap.jsx';

// Elegir dirección de envío en un mapa real de OpenStreetMap: calcula la
// distancia real hasta la tienda (OSRM) y el costo de envío con el
// pricePerKm configurado, igual que en la tienda web.
export default function MapLocationScreen({ navigation, route: navRoute }) {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const mapRef = useRef(null);
  const {
    store, selected, address, route, shippingCost, loading, saving, error,
    query, setQuery, searching, setSearching,
    selectLocation, applyGeocode, handleSearchResult, confirm, canConfirm,
    qualifiesForFreeShipping, freeShippingMinAmount,
  } = useShippingMap(navigation, navRoute?.params?.returnTo);

  useEffect(() => {
    if (route?.geometria) {
      mapRef.current?.injectJavaScript(drawRouteScript(route.geometria));
    }
  }, [route]);

  // La búsqueda también corre dentro del mapa: Nominatim exige identificarse
  // y ahí la petición sale con el User-Agent del navegador.
  const onSearchSubmit = () => {
    if (!query.trim()) return;
    setSearching(true);
    mapRef.current?.injectJavaScript(searchScript(query.trim()));
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
        <Text style={styles.headerTitle}>Dirección de envío</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.placeholder} />
          <TextInput
            placeholder="Busca tu colonia, calle o referencia"
            placeholderTextColor={colors.placeholder}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSearchSubmit}
            returnKeyType="search"
          />
          {searching ? <ActivityIndicator size="small" color={colors.primary} /> : null}
        </View>
      </View>

      {qualifiesForFreeShipping ? (
        <View style={styles.freeBanner}>
          <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
          <Text style={styles.freeBannerText}>¡Tu pedido califica para envío gratis!</Text>
        </View>
      ) : null}

      <View style={styles.mapWrapper}>
        <OsmMapPicker
          ref={mapRef}
          storeLat={store.lat}
          storeLng={store.lng}
          onSelect={selectLocation}
          onGeocode={applyGeocode}
          onSearchResult={handleSearchResult}
        />
      </View>

      <View style={styles.panel}>
        <Text style={styles.hint}>
          Toca el mapa para marcar el punto exacto donde quieres recibir tu pedido.
        </Text>

        {loading ? <Text style={styles.loadingText}>Calculando ruta...</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {selected ? (
          <View style={styles.addressRow}>
            <Ionicons name="location" size={15} color={colors.maroon} />
            <Text style={styles.address} numberOfLines={2}>{address}</Text>
          </View>
        ) : null}

        {route ? (
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Distancia</Text>
              <Text style={styles.statValue}>{(route.distanciaMetros / 1000).toFixed(2)} km</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Tiempo</Text>
              <Text style={styles.statValue}>{Math.round(route.duracionSegundos / 60)} min</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Envío</Text>
              <Text style={[styles.statValue, styles.statValueStrong]}>
                {shippingCost > 0 ? '$' + shippingCost.toFixed(2) : 'Gratis'}
              </Text>
            </View>
          </View>
        ) : null}

        {!qualifiesForFreeShipping && freeShippingMinAmount ? (
          <Text style={styles.freeHint}>
            Envío gratis en compras desde ${freeShippingMinAmount.toFixed(2)}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.confirmButton, !canConfirm && styles.confirmDisabled]}
          onPress={confirm}
          disabled={loading || saving}
          activeOpacity={0.85}
        >
          {loading || saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.confirmText}>Confirmar ubicación</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
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
    headerTitle: { fontFamily: SERIF, fontSize: 18, fontWeight: '700', color: colors.text },
    headerSpacer: { width: 22 },

    searchWrapper: { paddingHorizontal: 20, paddingBottom: 10 },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 22,
      paddingHorizontal: 14,
      height: 44,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E9ECE9',
    },
    searchInput: { marginLeft: 8, flex: 1, fontSize: 13, color: colors.text },

    freeBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      marginBottom: 10,
      backgroundColor: colors.primarySoft,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    freeBannerText: { color: colors.primary, fontWeight: '700', fontSize: 12, marginLeft: 7 },

    mapWrapper: {
      flex: 1,
      marginHorizontal: 20,
      borderRadius: 18,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },

    panel: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 18 },
    hint: { fontSize: 11.5, color: colors.placeholder },
    loadingText: { fontSize: 12, color: colors.primary, marginTop: 6 },
    errorText: { fontSize: 12, color: colors.maroon, marginTop: 6 },

    addressRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 },
    address: { flex: 1, fontSize: 13, color: colors.text, fontWeight: '600', marginLeft: 6 },

    statsRow: {
      flexDirection: 'row',
      marginTop: 12,
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#ECEFEC',
    },
    stat: { flex: 1, alignItems: 'center' },
    statLabel: { fontSize: 10, color: colors.placeholder },
    statValue: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 2 },
    statValueStrong: { color: colors.primary },

    freeHint: { fontSize: 11, color: colors.placeholder, marginTop: 8 },

    confirmButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 52,
      borderRadius: 26,
      marginTop: 14,
      backgroundColor: colors.primary,
    },
    confirmDisabled: { opacity: 0.55 },
    confirmText: { fontSize: 15, fontWeight: '700', color: colors.white, marginRight: 8 },
  });
