import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchBestsellers,
  fetchCombos,
  fetchMacetas,
  fetchOffers,
  fetchOtros,
  fetchPlantas,
  fetchVelas,
} from '../services/products.js';
import { applyOffer, buildOffersMap, normalizeProduct } from '../utils/normalizeProduct.js';
import { useProductActions } from './useProductActions.jsx';

// Cada pestaña es un catálogo real del backend. "otro" es el tipo con el que
// el backend guarda las demás piezas de concreto (hoy solo portavasos).
export const PRODUCT_TABS = [
  { key: 'todos', label: 'Todos' },
  { key: 'maceta', label: 'Macetas' },
  { key: 'vela', label: 'Velas' },
  { key: 'planta', label: 'Plantas' },
  { key: 'otro', label: 'Portavasos' },
  { key: 'combo', label: 'Combos' },
  { key: 'ofertas', label: 'Ofertas' },
  { key: 'bestsellers', label: 'Más Vendidos' },
];

// Solo ordenamientos que se pueden calcular con datos reales del producto
export const SORT_OPTIONS = [
  { key: 'default', label: 'Recomendados' },
  { key: 'recent', label: 'Más recientes' },
  { key: 'rating', label: 'Mejor calificados' },
  { key: 'price-asc', label: 'Precio: menor a mayor' },
  { key: 'price-desc', label: 'Precio: mayor a menor' },
];

const CATALOG_TYPES = ['maceta', 'vela', 'planta', 'otro', 'combo'];
const PAGE_SIZE = 8;

// Trae los cinco catálogos de una vez (son listas cortas y el backend no las
// pagina) para poder mostrar el conteo real de cada pestaña y cambiar entre
// ellas sin volver a pedir nada. Aplica las ofertas reales y maneja los
// filtros y la paginación "Cargar más" del lado del cliente.
export function useProducts(initial = {}) {
  const { favoriteIds, loadFavorites, toggleFavorite, addToCart } = useProductActions();

  const [activeTab, setActiveTab] = useState(initial.tab || 'todos');
  const [query, setQuery] = useState(initial.query || '');
  const [catalogs, setCatalogs] = useState({});
  const [bestsellers, setBestsellers] = useState([]);
  const [offersMap, setOffersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sortOrder, setSortOrder] = useState('default');

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sizeFilters, setSizeFilters] = useState(new Set());
  const [colorFilters, setColorFilters] = useState(new Set());
  const [priceRange, setPriceRange] = useState(null); // null = sin filtrar por precio

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([
      fetchMacetas(),
      fetchVelas(),
      fetchPlantas(),
      fetchOtros(),
      fetchCombos(),
      fetchBestsellers().catch(() => []),
      fetchOffers().catch(() => []),
    ])
      .then(([macetas, velas, plantas, otros, combos, topSellers, offers]) => {
        setCatalogs({
          maceta: (macetas || []).map((item) => normalizeProduct(item, 'maceta')),
          vela: (velas || []).map((item) => normalizeProduct(item, 'vela')),
          planta: (plantas || []).map((item) => normalizeProduct(item, 'planta')),
          otro: (otros || []).map((item) => normalizeProduct(item, 'otro')),
          combo: (combos || []).map((item) => normalizeProduct(item, 'combo')),
        });
        setBestsellers((topSellers || []).map((item) => normalizeProduct(item, item.productType)));
        setOffersMap(buildOffersMap(offers || []));
      })
      .catch((err) => setError(err.message || 'No se pudieron cargar los productos.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    loadFavorites();
  }, [load]);

  // Todo el catálogo ya con su oferta real aplicada
  const allProducts = useMemo(
    () =>
      CATALOG_TYPES.flatMap((type) => catalogs[type] || []).map((item) => applyOffer(item, offersMap)),
    [catalogs, offersMap]
  );

  const offerProducts = useMemo(
    () => allProducts.filter((item) => item.discountedPrice != null),
    [allProducts]
  );

  const itemsOfTab = useCallback(
    (tab) => {
      if (tab === 'todos') return allProducts;
      if (tab === 'ofertas') return offerProducts;
      if (tab === 'bestsellers') return bestsellers.map((item) => applyOffer(item, offersMap));
      return (catalogs[tab] || []).map((item) => applyOffer(item, offersMap));
    },
    [allProducts, offerProducts, bestsellers, catalogs, offersMap]
  );

  // Conteo real de cada pestaña, para mostrarlo junto a su nombre
  const counts = useMemo(() => {
    const result = {};
    PRODUCT_TABS.forEach((tab) => {
      result[tab.key] = itemsOfTab(tab.key).length;
    });
    return result;
  }, [itemsOfTab]);

  // Portadas de las colecciones: la imagen sale del primer producto real de
  // cada grupo y el conteo es el que tiene el catálogo ahora mismo.
  const collections = useMemo(() => {
    const cover = (list) => list.find((item) => item.image)?.image || null;
    const maxDiscount = Math.max(0, ...offerProducts.map((item) => item.discountPercentage || 0));
    return [
      { key: 'maceta', title: 'Macetas', note: counts.maceta + ' modelos' },
      { key: 'vela', title: 'Velas', note: counts.vela + ' piezas' },
      { key: 'planta', title: 'Plantas', note: counts.planta + ' piezas' },
      { key: 'otro', title: 'Portavasos', note: counts.otro + ' piezas' },
      {
        key: 'ofertas',
        title: 'Ofertas',
        tag: 'ESPECIAL',
        note: maxDiscount > 0 ? 'Hasta ' + maxDiscount + '% OFF' : counts.ofertas + ' piezas',
      },
      { key: 'combo', title: 'Combos', tag: 'SETS DE AUTOR', note: counts.combo + ' sets' },
    ]
      .filter((collection) => counts[collection.key] > 0)
      .map((collection) => ({ ...collection, image: cover(itemsOfTab(collection.key)) }));
  }, [counts, itemsOfTab, offerProducts]);
  const changeTab = (tab) => {
    setActiveTab(tab);
    setVisibleCount(PAGE_SIZE);
    setSizeFilters(new Set());
    setColorFilters(new Set());
    setPriceRange(null);
  };

  const rawItems = itemsOfTab(activeTab);

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
    rawItems.forEach((item) =>
      item.colorOptions?.forEach((c) => c?.name && !map.has(c.name) && map.set(c.name, c.hex))
    );
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [rawItems]);

  const maxPrice = useMemo(() => {
    const max = Math.max(0, ...rawItems.map((i) => i.price || 0));
    return Math.max(10, Math.ceil(max / 10) * 10);
  }, [rawItems]);

  const items = useMemo(() => {
    let list = rawItems;
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
    if (sortOrder === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    if (sortOrder === 'recent') {
      list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return list;
  }, [rawItems, query, sortOrder, sizeFilters, colorFilters, priceRange]);

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

  const clearSizeFilters = () => {
    setSizeFilters(new Set());
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
    collections,
    sortOptions: SORT_OPTIONS,
    counts,
    activeTab,
    changeTab,
    query,
    setQuery,
    items: visibleItems,
    totalCount: items.length,
    loading,
    error,
    retry: load,
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
    clearSizeFilters,
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
