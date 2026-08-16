import { forwardRef, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// Mapa con OpenStreetMap (Leaflet) dentro de un WebView: sin API key, igual
// que la tienda web. Un toque en el mapa dispara onSelect({lat, lng}); desde
// fuera se puede llamar drawRoute()/panTo() por medio del ref.
function buildHtml(storeLat, storeLng) {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>html,body,#map{height:100%;margin:0;padding:0;}</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var map = L.map('map').setView([${storeLat}, ${storeLng}], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  L.marker([${storeLat}, ${storeLng}]).addTo(map);
  var destMarker = null;
  var routeLayer = null;

  function placeDest(lat, lng) {
    if (destMarker) { destMarker.setLatLng([lat, lng]); }
    else { destMarker = L.marker([lat, lng]).addTo(map); }
  }

  map.on('click', function (e) {
    placeDest(e.latlng.lat, e.latlng.lng);
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'select', lat: e.latlng.lat, lng: e.latlng.lng }));
  });

  window.panTo = function (lat, lng) {
    placeDest(lat, lng);
    map.setView([lat, lng], 15);
  };

  window.drawRoute = function (geojsonString) {
    if (routeLayer) { map.removeLayer(routeLayer); }
    routeLayer = L.geoJSON(JSON.parse(geojsonString), { style: { color: '#1B4D2E', weight: 5, opacity: 0.85 } }).addTo(map);
    map.fitBounds(routeLayer.getBounds(), { padding: [40, 40] });
  };
  true;
</script>
</body>
</html>`;
}

const OsmMapPicker = forwardRef(function OsmMapPicker({ storeLat, storeLng, onSelect }, ref) {
  const html = useMemo(() => buildHtml(storeLat, storeLng), [storeLat, storeLng]);

  return (
    <WebView
      ref={ref}
      originWhitelist={['*']}
      source={{ html }}
      style={styles.webview}
      onMessage={(event) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'select') onSelect({ lat: data.lat, lng: data.lng });
        } catch {
          // ignora mensajes que no vengan del mapa
        }
      }}
    />
  );
});

export default OsmMapPicker;

export function panToScript(lat, lng) {
  return `window.panTo(${lat}, ${lng}); true;`;
}

export function drawRouteScript(geometry) {
  return `window.drawRoute(${JSON.stringify(JSON.stringify(geometry))}); true;`;
}

const styles = StyleSheet.create({
  webview: { flex: 1 },
});
