import { useEffect, useState } from 'react';
import { fetchStoreConfig } from '../services/shipping.js';

// Configuración real de la tienda (envío gratis, anuncio, redes...). Es
// opcional en pantalla: si falla, simplemente no se muestra esa franja.
export function useStoreConfig() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetchStoreConfig()
      .then(setConfig)
      .catch(() => setConfig(null));
  }, []);

  return {
    config,
    freeShippingFrom:
      typeof config?.freeShippingMinAmount === 'number' ? config.freeShippingMinAmount : null,
  };
}
