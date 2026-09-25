import { useEffect, useState } from 'react';
import { fetchRoute, fetchStoreConfig, parseNominatimAddress, reverseGeocode } from '../services/shipping.js';
import { addAddress } from '../services/addresses.js';
import { saveAddressCoords } from '../services/addressCoords.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

// Tienda por defecto mientras carga la configuración real (mismo respaldo que usa la web)
const DEFAULT_STORE = { lat: 13.6929, lng: -89.2182 };

const coordsLabel = (coords) => `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;

// Selección de dirección de envío sobre OpenStreetMap: geocodifica el punto
// elegido, calcula la ruta real (OSRM vía /api/ruta) y el costo con el
// pricePerKm configurado — igual que ShippingMap.jsx en la tienda web.
//
// La dirección del punto la resuelve el propio mapa (ver OsmMapPicker) y
// llega aquí por applyGeocode: Nominatim bloquea con 403 las peticiones que
// no se identifican, y dentro del WebView salen con User-Agent de navegador.
//
// Al confirmar, además de usarla para el pedido actual, la guarda como una
// dirección real de la cuenta (POST /api/loginClient/me/addresses) para que
// aparezca en "Mis Direcciones".
export function useShippingMap(navigation, returnTo = 'Cart') {
  const { cart, setShippingInfo } = useCart();
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [store, setStore] = useState(DEFAULT_STORE);
  const [shippingConfig, setShippingConfig] = useState({
    pricePerKm: 0,
    shippingMode: 'perKm',
    flatShippingFee: 0,
    freeShippingMinAmount: null,
  });
  const [selected, setSelected] = useState(null);
  const [address, setAddress] = useState('');
  const [addressDetails, setAddressDetails] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStoreConfig()
      .then((config) => {
        if (config?.storeLat && config?.storeLng) {
          setStore({ lat: config.storeLat, lng: config.storeLng });
        }
        setShippingConfig({
          pricePerKm: config?.pricePerKm || 0,
          shippingMode: config?.shippingMode || 'perKm',
          flatShippingFee: config?.flatShippingFee ?? config?.fixedShippingCost ?? 0,
          freeShippingMinAmount:
            typeof config?.freeShippingMinAmount === 'number' ? config.freeShippingMinAmount : null,
        });
      })
      .catch(() => {});
  }, []);

  // Se dispara al tocar el mapa: marca el punto y pide la ruta real. La
  // dirección legible llega aparte, por applyGeocode.
  const selectLocation = async (coords) => {
    setSelected(coords);
    setRoute(null);
    setAddress(coordsLabel(coords));
    setAddressDetails(null);
    setError('');
    setSearching(false);
    setLoading(true);

    try {
      const routeData = await fetchRoute(store, coords);
      setRoute(routeData);
    } catch (err) {
      setError(
        err.message ||
          'No se pudo calcular la ruta hasta ese punto. Puede que no haya una calle cercana; intenta marcar otro lugar.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Respuesta cruda de Nominatim que resolvió el mapa
  const applyGeocode = async ({ lat, lng, data }) => {
    if (data) {
      const geo = parseNominatimAddress(data, lat, lng);
      setAddress(geo.label);
      setAddressDetails(geo);
      return;
    }
    // Si el mapa no pudo resolverla (Nominatim limita por minuto), se intenta
    // una vez más desde la app; si tampoco, quedan las coordenadas.
    try {
      const geo = await reverseGeocode(lat, lng);
      setAddress(geo.label);
      setAddressDetails(geo);
    } catch {
      // se queda el texto de coordenadas que ya puso selectLocation
    }
  };

  const handleSearchResult = ({ found, failed }) => {
    setSearching(false);
    if (!found) {
      setError(failed ? 'No se pudo buscar esa dirección.' : 'No se encontró esa dirección.');
    }
  };

  const subtotal = cart.total || 0;
  const { freeShippingMinAmount } = shippingConfig;
  const qualifiesForFreeShipping = freeShippingMinAmount != null && subtotal >= freeShippingMinAmount;

  // Misma configuración real que usa el panel de administración: cobro por
  // km o costo fijo, y envío gratis automático a partir de cierto subtotal.
  const shippingCost = (() => {
    if (!route) return null;
    if (qualifiesForFreeShipping) return 0;
    if (shippingConfig.shippingMode === 'perKm') {
      return Number(((route.distanciaMetros / 1000) * shippingConfig.pricePerKm).toFixed(2));
    }
    return Number(shippingConfig.flatShippingFee.toFixed(2));
  })();

  // Guarda esta ubicación como dirección real de la cuenta (o solo cachea
  // las coordenadas si ya existía una guardada con la misma calle).
  const persistAddress = async () => {
    const fullName = [user?.name, user?.lastName].filter(Boolean).join(' ') || 'Cliente';
    const payload = {
      fullName,
      addressLine: addressDetails?.addressLine || address,
      department: addressDetails?.department || 'San Salvador',
      municipality: addressDetails?.municipality || 'San Salvador',
      phone: user?.phone || '',
      isDefault: !(user?.addresses?.length > 0),
    };

    const existing = user?.addresses?.find((a) => a.addressLine === payload.addressLine);
    try {
      if (existing) {
        await saveAddressCoords(user?.email, existing._id, selected);
      } else {
        const updated = await addAddress(payload);
        const saved = updated?.[updated.length - 1];
        if (saved?._id) await saveAddressCoords(user?.email, saved._id, selected);
        await refreshUser();
      }
    } catch {
      // no bloquea el flujo de compra/selección si falla el guardado de la dirección
    }
  };

  // Antes esto no hacía nada si faltaba algo, y el botón se veía "colgado"
  // sin explicar por qué. Ahora siempre da una razón concreta al tocarlo.
  const confirm = async () => {
    if (!selected) {
      toast.warning('Falta marcar tu ubicación', 'Toca el mapa o busca tu dirección para marcar dónde quieres el envío.');
      return;
    }
    if (loading) {
      toast.info('Un momento', 'Todavía se está calculando la ruta hacia ese punto.');
      return;
    }
    if (!route) {
      toast.error(
        'No se pudo calcular la ruta',
        error || 'Intenta marcar otro lugar más cercano a una calle.'
      );
      return;
    }
    setShippingInfo({
      address,
      municipality: addressDetails?.municipality || '',
      department: addressDetails?.department || '',
      coords: selected,
      distanceMeters: route.distanciaMetros,
      durationSeconds: route.duracionSegundos,
      shippingCost,
    });

    setSaving(true);
    await persistAddress();
    setSaving(false);

    navigation.navigate(returnTo);
  };

  return {
    store,
    selected,
    address,
    route,
    shippingCost,
    loading,
    error,
    saving,
    query,
    setQuery,
    searching,
    setSearching,
    selectLocation,
    applyGeocode,
    handleSearchResult,
    confirm,
    canConfirm: !!selected && !!route,
    qualifiesForFreeShipping,
    freeShippingMinAmount,
  };
}
