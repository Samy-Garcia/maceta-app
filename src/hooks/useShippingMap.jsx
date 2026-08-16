import { useEffect, useState } from 'react';
import { fetchRoute, fetchStoreConfig, reverseGeocode, searchAddress } from '../services/shipping.js';
import { useCart } from '../context/CartContext.jsx';

// Tienda por defecto mientras carga la configuración real (mismo respaldo que usa la web)
const DEFAULT_STORE = { lat: 13.6929, lng: -89.2182 };

// Selección de dirección de envío sobre OpenStreetMap: geocodifica el punto
// elegido, calcula la ruta real (OSRM vía /api/route) y el costo con el
// pricePerKm configurado — igual que ShippingMap.jsx en la tienda web.
export function useShippingMap(navigation, returnTo = 'Cart') {
  const { setShippingInfo } = useCart();
  const [store, setStore] = useState(DEFAULT_STORE);
  const [pricePerKm, setPricePerKm] = useState(0);
  const [selected, setSelected] = useState(null);
  const [address, setAddress] = useState('');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchStoreConfig()
      .then((config) => {
        if (config?.storeLat && config?.storeLng) {
          setStore({ lat: config.storeLat, lng: config.storeLng });
        }
        setPricePerKm(config?.pricePerKm || 0);
      })
      .catch(() => {});
  }, []);

  const selectLocation = async (coords) => {
    setSelected(coords);
    setRoute(null);
    setAddress('');
    setError('');
    setLoading(true);

    // La dirección (Nominatim) y la ruta (OSRM) son dos llamadas independientes:
    // si una falla, no debe tumbar a la otra, y cada una necesita su propio
    // mensaje para poder distinguir cuál fue la que realmente falló.
    try {
      const addr = await reverseGeocode(coords.lat, coords.lng);
      setAddress(addr);
    } catch {
      setAddress(`${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
    }

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

  const handleSearch = async () => {
    if (!query.trim()) return null;
    setSearching(true);
    setError('');
    try {
      const result = await searchAddress(query.trim());
      if (!result) {
        setError('No se encontró esa dirección.');
        return null;
      }
      await selectLocation({ lat: result.lat, lng: result.lng });
      return result;
    } catch {
      setError('No se pudo buscar esa dirección.');
      return null;
    } finally {
      setSearching(false);
    }
  };

  const shippingCost = route ? Number(((route.distanciaMetros / 1000) * pricePerKm).toFixed(2)) : null;

  const confirm = () => {
    if (!selected || !route) return;
    setShippingInfo({
      address,
      coords: selected,
      distanceMeters: route.distanciaMetros,
      durationSeconds: route.duracionSegundos,
      shippingCost,
    });
    navigation.navigate(returnTo);
  };

  return {
    store, selected, address, route, shippingCost, loading, error,
    query, setQuery, searching, handleSearch, selectLocation, confirm,
    canConfirm: !!selected && !!route,
  };
}
