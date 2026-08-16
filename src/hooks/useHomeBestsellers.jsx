import { useEffect, useState } from 'react';
import { fetchBestsellers, fetchOffers } from '../services/products.js';
import { applyOffer, buildOffersMap, normalizeProduct } from '../utils/normalizeProduct.js';
import { useProductActions } from './useProductActions.jsx';

// Sección "Populares" de Home: los productos más vendidos de verdad
// (GET /api/orders/bestsellers), con sus ofertas reales aplicadas.
export function useHomeBestsellers(limit = 4) {
  const { favoriteIds, loadFavorites, toggleFavorite, addToCart } = useProductActions();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFavorites();
    let offersMap = {};

    Promise.all([fetchBestsellers(limit), fetchOffers().catch(() => [])])
      .then(([bestsellers, offers]) => {
        offersMap = buildOffersMap(offers || []);
        const normalized = (bestsellers || []).map((item) =>
          applyOffer(normalizeProduct(item, item.productType), offersMap)
        );
        setItems(normalized);
      })
      .catch((err) => setError(err.message || 'No se pudieron cargar los productos populares.'))
      .finally(() => setLoading(false));
  }, [limit]);

  return { items, loading, error, favoriteIds, toggleFavorite, addToCart };
}
