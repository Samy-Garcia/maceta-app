import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button.jsx';
import OsmMapPicker, { drawRouteScript, panToScript } from '../components/OsmMapPicker.jsx';
import { useTheme } from '../theme/ThemeContext.jsx';
import { useShippingMap } from '../hooks/useShippingMap.jsx';

// Elegir dirección de envío en un mapa real de OpenStreetMap: calcula la
// distancia real hasta la tienda (OSRM) y el costo de envío con el
// pricePerKm configurado, igual que en la tienda web.
export default function MapLocationScreen({ navigation, route: navRoute }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const mapRef = useRef(null);
  const {
    store, address, route, shippingCost, loading, saving, error,
    query, setQuery, searching, handleSearch, selectLocation, confirm,
    qualifiesForFreeShipping, freeShippingMinAmount,
  } = useShippingMap(navigation, navRoute?.params?.returnTo);

  useEffect(() => {
    if (route?.geometria) {
      mapRef.current?.injectJavaScript(drawRouteScript(route.geometria));
    }
  }, [route]);

  const onSearchSubmit = async () => {
    const result = await handleSearch();
    if (result) {
      mapRef.current?.injectJavaScript(panToScript(result.lat, result.lng));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dirección de envío</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.placeholder} />
          <TextInput
            placeholder="Buscar en el mapa"
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
        <View style={styles.freeShippingBanner}>
          <Text style={styles.freeShippingText}>🎉 ¡Tu pedido califica para envío gratis!</Text>
        </View>
      ) : null}

      <View style={styles.mapWrapper}>
        <OsmMapPicker ref={mapRef} storeLat={store.lat} storeLng={store.lng} onSelect={selectLocation} />
      </View>

      <View style={styles.infoPanel}>
        <Text style={styles.hint}>Toca el mapa para marcar tu dirección de entrega</Text>

        {loading ? <Text style={styles.loadingText}>Calculando ruta...</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {address ? <Text style={styles.address} numberOfLines={2}>{address}</Text> : null}

        {route ? (
          <Text style={styles.routeInfo}>
            Distancia: {(route.distanciaMetros / 1000).toFixed(2)} km — Tiempo estimado: {Math.round(route.duracionSegundos / 60)} min
            — Envío: <Text style={styles.routeInfoStrong}>{shippingCost > 0 ? `$ ${shippingCost.toFixed(2)}` : 'Gratis'}</Text>
          </Text>
        ) : null}

        {!qualifiesForFreeShipping && freeShippingMinAmount ? (
          <Text style={styles.freeShippingHint}>
            Envío gratis en compras desde $ {freeShippingMinAmount.toFixed(2)}
          </Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button label="Confirmar ubicación" onPress={confirm} loading={loading || saving} />
      </View>
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
    headerTitle: { color: colors.white, fontSize: 17, fontWeight: '700' },
    searchWrapper: { paddingHorizontal: 20, marginTop: -18, zIndex: 2 },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 44,
      elevation: 3,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    searchInput: { marginLeft: 8, flex: 1, fontSize: 13, color: colors.text },
    mapWrapper: {
      flex: 1,
      marginTop: 12,
      marginHorizontal: 20,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    infoPanel: { paddingHorizontal: 20, paddingTop: 10 },
    hint: { fontSize: 11, color: colors.placeholder },
    loadingText: { fontSize: 12, color: colors.primary, marginTop: 4 },
    errorText: { fontSize: 12, color: colors.maroonDark, marginTop: 4 },
    address: { fontSize: 13, color: colors.text, fontWeight: '600', marginTop: 6 },
    routeInfo: { fontSize: 12, color: colors.placeholder, marginTop: 4 },
    routeInfoStrong: { color: colors.primary, fontWeight: '700' },
    freeShippingBanner: {
      marginHorizontal: 20, marginTop: 10, backgroundColor: colors.primarySoft,
      borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12,
    },
    freeShippingText: { color: colors.primary, fontWeight: '700', fontSize: 12, textAlign: 'center' },
    freeShippingHint: { fontSize: 11, color: colors.placeholder, marginTop: 4 },
    footer: { paddingHorizontal: 20, paddingVertical: 16 },
  });
