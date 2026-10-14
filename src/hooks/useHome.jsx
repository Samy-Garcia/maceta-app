import { useEffect, useMemo, useState } from 'react';
import {
  fetchBestsellers,
  fetchCombos,
  fetchMacetas,
  fetchOffers,
  fetchPlantas,
  fetchVelas,
} from '../services/products.js';
import { fetchProductReviews } from '../services/reviews.js';
import { fetchStoreConfig } from '../services/shipping.js';
import { fetchMyLoyalty } from '../services/loyalty.js';
import { applyOffer, buildOffersMap, normalizeProduct } from '../utils/normalizeProduct.js';
import { useProductActions } from './useProductActions.jsx';
export { TYPE_LABEL } from '../utils/productTypes.js';

// Mismas categorías que tiene el catálogo real del backend
export const HOME_CATEGORIES = [
  { key: 'todo', label: 'Todo' },
  { key: 'maceta', label: 'Macetas' },
  { key: 'vela', label: 'Velas' },
  { key: 'planta', label: 'Plantas' },
  { key: 'combo', label: 'Combos' },
];

const NEW_ARRIVALS_LIMIT = 6;
const REVIEWED_PRODUCTS_LIMIT = 4;
const COMMUNITY_LIMIT = 6;

const byNewest = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);

// Todo lo que muestra la tienda web en su portada, traído del backend real:
// anuncio y envío gratis (GET /api/config), promociones activas (/api/offers),
// más vendidos (/api/orders/bestsellers), catálogo completo para las novedades,
// reseñas reales de clientes y el saldo del programa de lealtad.
export function useHome() {
  const { favoriteIds, loadFavorites, toggleFavorite, addToCart } = useProductActions();

  const [config, setConfig] = useState(null);
  const [promos, setPromos] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [community, setCommunity] = useState([]);
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('todo');

  const load = () => {
    setLoading(true);
    setError('');

    // Cada pieza falla por su cuenta: que no haya promociones o que el
    // programa de lealtad no responda no debe dejar la portada en blanco.
    Promise.all([
      fetchStoreConfig().catch(() => null),
      fetchOffers().catch(() => []),
      fetchBestsellers(8).catch(() => []),
      fetchMacetas().catch(() => []),
      fetchVelas().catch(() => []),
      fetchPlantas().catch(() => []),
      fetchCombos().catch(() => []),
    ])
      .then(([configData, offers, bestsellersData, macetas, velas, plantas, combos]) => {
        const offersMap = buildOffersMap(offers || []);

        setConfig(configData);
        // offersMap ya descartó las inactivas y deja una sola oferta por
        // producto — la misma que se aplica a las tarjetas, así el precio del
        // banner nunca contradice al del catálogo.
        setPromos(
          Object.values(offersMap)
            .filter((offer) => offer.product)
            .map((offer) => ({
              offerId: offer._id,
              id: offer.product._id,
              productType: offer.productType,
              name: offer.product.name,
              image: offer.product.image,
              price: offer.product.price,
              stock: offer.product.stock,
              discountedPrice: offer.discountedPrice,
              discountPercentage: offer.discountPercentage,
            }))
            .sort((a, b) => b.discountPercentage - a.discountPercentage)
        );

        const allProducts = [
          ...(macetas || []).map((item) => normalizeProduct(item, 'maceta')),
          ...(velas || []).map((item) => normalizeProduct(item, 'vela')),
          ...(plantas || []).map((item) => normalizeProduct(item, 'planta')),
          ...(combos || []).map((item) => normalizeProduct(item, 'combo')),
        ].map((item) => applyOffer(item, offersMap));
        setCatalog(allProducts);

        // /api/orders/bestsellers no resuelve el precio de todos los tipos
        // (los "otro", por ejemplo, vienen sin price). Se completa con lo que
        // ya trajimos del catálogo antes de mostrarlo.
        const catalogIndex = new Map(
          allProducts.map((item) => [item.productType + '-' + item.id, item])
        );
        const topSellers = (bestsellersData || [])
          .map((item) => applyOffer(normalizeProduct(item, item.productType), offersMap))
          .map((item) => {
            if (typeof item.price === 'number') return item;
            const known = catalogIndex.get(item.productType + '-' + item.id);
            return known ? { ...known, sold: item.sold } : null;
          })
          .filter(Boolean);
        setBestsellers(topSellers);

        if (!configData && !topSellers.length && !allProducts.length) {
          setError('No se pudo cargar la tienda. Revisa tu conexión e intenta de nuevo.');
        }

        loadCommunity([...topSellers, ...allProducts]);
      })
      .finally(() => setLoading(false));

    loadFavorites();

    // Depende de la sesión: si no hay, simplemente no se muestra
    fetchMyLoyalty()
      .then(setLoyalty)
      .catch(() => setLoyalty(null));
  };

  // Reseñas reales: el backend solo las expone por producto, así que se piden
  // las de los productos mejor calificados y se juntan en un solo muro.
  const loadCommunity = (products) => {
    const seen = new Set();
    const reviewed = products
      .filter((item) => {
        const key = `${item.productType}-${item.id}`;
        if (!item.reviewCount || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => b.reviewCount - a.reviewCount);

    if (!reviewed.length) return;

    const totals = reviewed.reduce(
      (acc, item) => ({
        sum: acc.sum + item.rating * item.reviewCount,
        count: acc.count + item.reviewCount,
      }),
      { sum: 0, count: 0 }
    );
    setRating({ average: totals.count ? totals.sum / totals.count : 0, count: totals.count });

    Promise.all(
      reviewed.slice(0, REVIEWED_PRODUCTS_LIMIT).map((item) =>
        fetchProductReviews(item.productType, item.id)
          .then((data) =>
            (data?.reviews || []).map((review) => ({ ...review, productName: item.name }))
          )
          .catch(() => [])
      )
    ).then((lists) => {
      const merged = lists
        .flat()
        .filter((review) => review.comment)
        .sort(byNewest)
        .slice(0, COMMUNITY_LIMIT);
      setCommunity(merged);
    });
  };

  useEffect(load, []);

  const newArrivals = useMemo(() => {
    const list = category === 'todo' ? catalog : catalog.filter((item) => item.productType === category);
    return [...list].sort(byNewest).slice(0, NEW_ARRIVALS_LIMIT);
  }, [catalog, category]);

  return {
    socialMedia: config?.socialMedia || {},
    // Banners que la web muestra en su portada, por si no hay promociones activas
    heroImages: (config?.heroImages || []).filter((hero) => hero.url),
    categories: HOME_CATEGORIES,
    category,
    setCategory,
    promos,
    bestsellers,
    newArrivals,
    community,
    rating,
    loyaltyPoints: loyalty?.points ?? null,
    loading,
    error,
    retry: load,
    favoriteIds,
    toggleFavorite,
    addToCart,
  };
}
