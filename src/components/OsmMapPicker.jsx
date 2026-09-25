import { forwardRef, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { LEAFLET_CSS, LEAFLET_JS } from '../vendor/leafletAssets.js';
import { useTheme } from '../theme/ThemeContext.jsx';

// Mapa con OpenStreetMap (Leaflet) dentro de un WebView. Leaflet va embebido
// en el propio bundle (ver src/vendor/leafletAssets.js) en vez de cargarse
// desde un CDN: así el mapa funciona aunque la red del celular sea lenta o
// bloquee unpkg.com — solo los tiles y la geocodificación siguen
// necesitando internet, que es inevitable (son datos reales del mapa).
//
// La geocodificación (Nominatim) también se hace AQUÍ DENTRO y no desde el
// fetch de React Native: Nominatim responde 403 a quien no se identifique
// con un User-Agent propio, y dentro del WebView la petición sale con el
// User-Agent del navegador igual que en la tienda web. Por eso el mapa
// funcionaba en la web y no en la app.
function buildHtml(storeLat, storeLng, primaryColor, accentColor) {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>${LEAFLET_CSS}</style>
<style>html,body,#map{height:100%;margin:0;padding:0;}
.macetas-dot{width:20px;height:20px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);}
</style>
</head>
<body>
<div id="map"></div>
<script>${LEAFLET_JS}</script>
<script>
function post(payload) {
  window.ReactNativeWebView.postMessage(JSON.stringify(payload));
}

try {
  var map = L.map('map').setView([${storeLat}, ${storeLng}], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  var storeIcon = L.divIcon({
    className: '',
    html: '<div class="macetas-dot" style="background:${primaryColor}"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
  var destIcon = L.divIcon({
    className: '',
    html: '<div class="macetas-dot" style="background:${accentColor}"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  L.marker([${storeLat}, ${storeLng}], { icon: storeIcon }).addTo(map);
  var destMarker = null;
  var routeLayer = null;

  function placeDest(lat, lng) {
    if (destMarker) { destMarker.setLatLng([lat, lng]); }
    else { destMarker = L.marker([lat, lng], { icon: destIcon }).addTo(map); }
  }

  // Nominatim desde el propio WebView: aquí la petición lleva User-Agent de
  // navegador, que es lo que su política exige.
  function reverseGeocode(lat, lng) {
    fetch('https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=' + lat + '&lon=' + lng,
      { headers: { 'Accept-Language': 'es' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) { post({ type: 'geocode', lat: lat, lng: lng, data: data }); })
      .catch(function () { post({ type: 'geocode', lat: lat, lng: lng, data: null }); });
  }

  function select(lat, lng) {
    placeDest(lat, lng);
    post({ type: 'select', lat: lat, lng: lng });
    reverseGeocode(lat, lng);
  }

  map.on('click', function (e) { select(e.latlng.lat, e.latlng.lng); });

  window.panTo = function (lat, lng) {
    placeDest(lat, lng);
    map.setView([lat, lng], 15);
  };

  // Búsqueda por texto, también desde el WebView por el mismo motivo
  window.searchAddress = function (query) {
    fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=sv&addressdetails=1&q=' +
      encodeURIComponent(query), { headers: { 'Accept-Language': 'es' } })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (results) {
        if (!results || !results.length) { post({ type: 'searchEmpty' }); return; }
        var found = results[0];
        var lat = Number(found.lat);
        var lng = Number(found.lon);
        map.setView([lat, lng], 15);
        placeDest(lat, lng);
        post({ type: 'select', lat: lat, lng: lng });
        post({ type: 'geocode', lat: lat, lng: lng, data: found });
      })
      .catch(function () { post({ type: 'searchError' }); });
  };

  window.drawRoute = function (geojsonString) {
    if (routeLayer) { map.removeLayer(routeLayer); }
    routeLayer = L.geoJSON(JSON.parse(geojsonString), { style: { color: '${primaryColor}', weight: 5, opacity: 0.85 } }).addTo(map);
    map.fitBounds(routeLayer.getBounds(), { padding: [40, 40] });
  };

  post({ type: 'ready' });
} catch (e) {
  post({ type: 'error', message: String(e && e.message || e) });
}

window.onerror = function (message) {
  post({ type: 'error', message: String(message) });
};
true;
</script>
</body>
</html>`;
}

const OsmMapPicker = forwardRef(function OsmMapPicker(
  { storeLat, storeLng, onSelect, onGeocode, onSearchResult },
  ref
) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [errorDetail, setErrorDetail] = useState('');

  const html = useMemo(
    () => buildHtml(storeLat, storeLng, colors.primary, colors.maroon),
    [storeLat, storeLng, colors.primary, colors.maroon]
  );

  return (
    <View style={styles.wrapper}>
      <WebView
        ref={ref}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        nestedScrollEnabled
        domStorageEnabled
        javaScriptEnabled
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'select') onSelect?.({ lat: data.lat, lng: data.lng });
            else if (data.type === 'geocode') onGeocode?.(data);
            else if (data.type === 'searchEmpty') onSearchResult?.({ found: false });
            else if (data.type === 'searchError') onSearchResult?.({ found: false, failed: true });
            else if (data.type === 'ready') setStatus('ready');
            else if (data.type === 'error') {
              setStatus('error');
              setErrorDetail(data.message || '');
            }
          } catch {
            // ignora mensajes que no vengan del mapa
          }
        }}
        onError={(e) => {
          setStatus('error');
          setErrorDetail(e.nativeEvent?.description || 'No se pudo cargar el mapa.');
        }}
      />
      {status === 'loading' ? (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.overlayText}>Cargando mapa...</Text>
        </View>
      ) : null}
      {status === 'error' ? (
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.errorText}>
            No se pudo cargar el mapa{errorDetail ? `: ${errorDetail}` : '.'}
          </Text>
        </View>
      ) : null}
    </View>
  );
});

export default OsmMapPicker;

export function panToScript(lat, lng) {
  return `window.panTo(${lat}, ${lng}); true;`;
}

export function searchScript(query) {
  return `window.searchAddress(${JSON.stringify(query)}); true;`;
}

export function drawRouteScript(geometry) {
  return `window.drawRoute(${JSON.stringify(JSON.stringify(geometry))}); true;`;
}

const createStyles = (colors) =>
  StyleSheet.create({
    wrapper: { flex: 1 },
    webview: { flex: 1, backgroundColor: colors.card },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
    },
    overlayText: { fontSize: 12, color: colors.placeholder, marginTop: 8 },
    errorText: { fontSize: 12, color: colors.maroonDark, textAlign: 'center', paddingHorizontal: 20 },
  });
