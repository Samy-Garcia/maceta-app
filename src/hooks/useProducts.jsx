import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchBestsellers, fetchMacetas, fetchOffers, fetchPlantas, fetchVelas } from '../services/products.js';
import { applyOffer, buildOffersMap, normalizeProduct } from '../utils/normalizeProduct.js';
import { useProductActions } from './useProductActions.jsx';

export const PRODUCT_TABS = [
  { key: 'maceta', label: 'Macetas' },
  { key: 'vela', label: 'Velas' },
  { key: 'planta', label: 'Plantas' },
  { key: 'bestsellers', label: 'Más Vendidos' },
];

const PAGE_SIZE = 4;

// Puede recibir la etiqueta de un catálogo, o pedir favoritos y wishlist toggle,
// se encarga de traer cada categoría real del backend, aplicar ofertas reales
// y manejar la paginación "Cargar Más" (del lado del cliente: el backend no
// pagina estos tres catálogos).
export function useProducts() {
  const { favoriteIds, loadFavorites, toggleFavorite, addToCart } = useProductActions();

  const [activeTab, setActiveTab] = useState('maceta');
  const [query, setQuery] = useState('');
  const [cache, setCache] = useState({});
  const [loadingTab, setLoadingTab] = useState({});
  const [errorTab, setErrorTab] = useState({});
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [offersMap, setOffersMap] = useState({});
  const [sortOrder, setSortOrder] = useState('default'); // 'default' | 'price-asc' | 'price-desc'

  useEffect(() => {
    fetchOffers()
      .then((offers) => setOffersMap(buildOffersMap(offers || [])))
      .catch(() => {});
    loadFavorites();
  }, []);

  const loadTab = useCallback(async (tab) => {
    setLoadingTab((prev) => ({ ...prev, [tab]: true }));
    setErrorTab((prev) => ({ ...prev, [tab]: '' }));
    try {
      let items;
      if (tab === 'bestsellers') {
        const raw = await fetchBestsellers();
        items = (raw || []).map((item) => normalizeProduct(item, item.productType));
      } else {
        const fetcher = { maceta: fetchMacetas, vela: fetchVelas, planta: fetchPlantas }[tab];
        const raw = await fetcher();
        items = (raw || []).map((item) => normalizeProduct(item, tab));
      }
      setCache((prev) => ({ ...prev, [tab]: items }));
    } catch (err) {
      setErrorTab((prev) => ({ ...prev, [tab]: err.message || 'No se pudieron cargar los productos.' }));
    } finally {
      setLoadingTab((prev) => ({ ...prev, [tab]: false }));
    }
  }, []);

  useEffect(() => {
    if (!cache[activeTab]) loadTab(activeTab);
  }, [activeTab, cache, loadTab]);

  const changeTab = (tab) => {
    setActiveTab(tab);
    setVisibleCount(PAGE_SIZE);
  };

  const rawItems = cache[activeTab] || [];

  const items = useMemo(() => {
    let list = rawItems.map((item) => applyOffer(item, offersMap));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((item) => item.name?.toLowerCase().includes(q));
    }
    const priceOf = (item) => item.discountedPrice ?? item.price;
    if (sortOrder === 'price-asc') list = [...list].sort((a, b) => priceOf(a) - priceOf(b));
    if (sortOrder === 'price-desc') list = [...list].sort((a, b) => priceOf(b) - priceOf(a));
    return list;
  }, [rawItems, offersMap, query, sortOrder]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;
  const loadMore = () => setVisibleCount((prev) => prev + PAGE_SIZE);

  return {
    tabs: PRODUCT_TABS,
    activeTab,
    changeTab,
    query,
    setQuery,
    items: visibleItems,
    totalCount: items.length,
    loading: !!loadingTab[activeTab] && !cache[activeTab],
    error: errorTab[activeTab],
    retry: () => loadTab(activeTab),
    hasMore,
    loadMore,
    favoriteIds,
    toggleFavorite,
    addToCart,
    sortOrder,
    setSortOrder,
  };
}
