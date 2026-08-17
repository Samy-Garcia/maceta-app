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

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sizeFilters, setSizeFilters] = useState(new Set());
  const [colorFilters, setColorFilters] = useState(new Set());
  const [priceRange, setPriceRange] = useState(null); // null = sin filtrar por precio

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
    setSizeFilters(new Set());
    setColorFilters(new Set());
    setPriceRange(null);
  };

  const rawItems = cache[activeTab] || [];

  // Opciones de filtro reales: solo se muestran tamaños/colores que de
  // verdad tiene al menos un producto de esta categoría — nada de listas
  // fijas que no coincidan con lo que hay en la base de datos.
  const availableSizes = useMemo(() => {
    const set = new Set();
    rawItems.forEach((item) => item.sizes?.forEach((s) => s && set.add(s)));
    return Array.from(set).sort();
  }, [rawItems]);

  const availableColors = useMemo(() => {
    const map = new Map();
    rawItems.forEach((item) => item.colorOptions?.forEach((c) => c?.name && !map.has(c.name) && map.set(c.name, c.hex)));
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [rawItems]);

  const maxPrice = useMemo(() => {
    const max = Math.max(0, ...rawItems.map((i) => i.price || 0));
    return Math.max(10, Math.ceil(max / 10) * 10);
  }, [rawItems]);

  const items = useMemo(() => {
    let list = rawItems.map((item) => applyOffer(item, offersMap));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((item) => item.name?.toLowerCase().includes(q));
    }
    if (sizeFilters.size > 0) {
      list = list.filter((item) => item.sizes?.some((s) => sizeFilters.has(s)));
    }
    if (colorFilters.size > 0) {
      list = list.filter((item) => item.colorOptions?.some((c) => colorFilters.has(c.name)));
    }
    if (priceRange) {
      list = list.filter((item) => {
        const p = item.discountedPrice ?? item.price;
        return p >= priceRange[0] && p <= priceRange[1];
      });
    }
    const priceOf = (item) => item.discountedPrice ?? item.price;
    if (sortOrder === 'price-asc') list = [...list].sort((a, b) => priceOf(a) - priceOf(b));
    if (sortOrder === 'price-desc') list = [...list].sort((a, b) => priceOf(b) - priceOf(a));
    return list;
  }, [rawItems, offersMap, query, sortOrder, sizeFilters, colorFilters, priceRange]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;
  const loadMore = () => setVisibleCount((prev) => prev + PAGE_SIZE);

  const toggleSizeFilter = (size) => {
    setSizeFilters((prev) => {
      const next = new Set(prev);
      next.has(size) ? next.delete(size) : next.add(size);
      return next;
    });
    setVisibleCount(PAGE_SIZE);
  };

  const toggleColorFilter = (name) => {
    setColorFilters((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
    setVisibleCount(PAGE_SIZE);
  };

  const resetFilters = () => {
    setSizeFilters(new Set());
    setColorFilters(new Set());
    setPriceRange(null);
    setSortOrder('default');
  };

  const activeFilterCount =
    sizeFilters.size + colorFilters.size + (priceRange ? 1 : 0) + (sortOrder !== 'default' ? 1 : 0);

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
    filtersVisible,
    setFiltersVisible,
    availableSizes,
    sizeFilters,
    toggleSizeFilter,
    availableColors,
    colorFilters,
    toggleColorFilter,
    maxPrice,
    priceRange,
    setPriceRange,
    resetFilters,
    activeFilterCount,
  };
}
