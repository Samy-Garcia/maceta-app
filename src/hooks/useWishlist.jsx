import { useEffect, useMemo, useState } from 'react';
import { fetchMyWishlists, fetchWishlistById, removeFromWishlist } from '../services/wishlist.js';
import { useCart } from '../context/CartContext.jsx';
import { useStoreConfig } from './useStoreConfig.jsx';
import { TYPE_LABEL } from '../utils/productTypes.js';
import { useToast } from '../context/ToastContext.jsx';

// Orden en que se muestran las pestañas; solo salen las que tienen piezas
const TYPE_ORDER = ['maceta', 'vela', 'planta', 'otro', 'combo'];

// Lista de deseos real del cliente (la lista principal/default que llena el
// corazón rápido en Productos, Home y el detalle de producto).
export function useWishlist() {
  const { addToCart } = useCart();
  const { freeShippingFrom } = useStoreConfig();
  const toast = useToast();
  const [listId, setListId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [removingId, setRemovingId] = useState(null);
  const [buyingAll, setBuyingAll] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    fetchMyWishlists()
      .then((lists) => {
        const defaultList = lists?.find((l) => l.isDefault) || lists?.[0];
        if (!defaultList) {
          setItems([]);
          return null;
        }
        setListId(defaultList._id);
        return fetchWishlistById(defaultList._id);
      })
      .then((full) => setItems(full?.items || []))
      .catch((err) => setError(err.message || 'No se pudo cargar tu lista de deseos.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Pestañas con el conteo real de cada tipo que hay guardado
  const typeTabs = useMemo(() => {
    const tabs = [{ key: 'todos', label: 'Todos', count: items.length }];
    TYPE_ORDER.forEach((type) => {
      const count = items.filter((item) => item.productType === type).length;
      if (count > 0) tabs.push({ key: type, label: TYPE_LABEL[type] + 's', count });
    });
    return tabs;
  }, [items]);

  const filtered = useMemo(() => {
    let list = typeFilter === 'todos' ? items : items.filter((item) => item.productType === typeFilter);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((item) => item.product?.name?.toLowerCase().includes(q));
    return list;
  }, [items, typeFilter, query]);

  // Solo se puede comprar de una lo que tiene stock
  const buyable = items.filter((item) => item.product?.stock > 0);
  const listTotal = Number(
    buyable.reduce((sum, item) => sum + (item.product?.price || 0), 0).toFixed(2)
  );
  const qualifiesForFreeShipping = freeShippingFrom != null && listTotal >= freeShippingFrom;

  const handleRemove = async (item) => {
    if (!listId) return;
    setRemovingId(item._id);
    try {
      await removeFromWishlist(listId, item._id);
      setItems((prev) => prev.filter((i) => i._id !== item._id));
    } catch (err) {
      toast.error('No se pudo quitar', err.message || 'No se pudo quitar el producto de tu lista.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (item) => {
    if (!item.product?.stock) {
      toast.warning('Sin stock', 'Este producto no tiene unidades disponibles por ahora.');
      return;
    }
    try {
      await addToCart(item.productId, item.productType, 1);
      toast.success('Agregado al carrito', item.product.name);
    } catch (err) {
      toast.error('No se pudo agregar', err.message || 'No se pudo agregar el producto al carrito.');
    }
  };

  // Manda al carrito todas las piezas con stock, una por una (el backend
  // agrega de a un producto por petición).
  const buyAll = async (navigation) => {
    if (!buyable.length) {
      toast.warning('Sin piezas disponibles', 'Los productos de tu lista no tienen stock por ahora.');
      return;
    }
    setBuyingAll(true);
    let added = 0;
    const failed = [];
    for (const item of buyable) {
      try {
        await addToCart(item.productId, item.productType, 1);
        added += 1;
      } catch {
        failed.push(item.product?.name || 'Producto');
      }
    }
    setBuyingAll(false);

    if (!added) {
      toast.error('No se pudo agregar', 'Ninguna de las piezas pudo agregarse al carrito.');
      return;
    }
    toast.success(
      failed.length ? 'Agregamos ' + added + ' piezas' : 'Lista agregada al carrito',
      failed.length
        ? 'No se pudieron agregar: ' + failed.join(', ') + '.'
        : 'Las ' + added + ' piezas de tu lista ya están en el carrito.',
      { actionLabel: 'Ver carrito', onAction: () => navigation.navigate('Cart') }
    );
  };

  return {
    items: filtered,
    totalCount: items.length,
    typeTabs,
    typeFilter,
    setTypeFilter,
    loading,
    error,
    retry: load,
    query,
    setQuery,
    removingId,
    handleRemove,
    handleAddToCart,
    buyable,
    listTotal,
    buyAll,
    buyingAll,
    freeShippingFrom,
    qualifiesForFreeShipping,
  };
}
