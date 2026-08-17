import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../services/api.js';
import { getShippingInfo, saveShippingInfo, clearShippingInfo } from '../services/shippingInfoStorage.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

const emptyCart = { products: [], total: 0 };

// Carrito real del cliente (GET /api/cart/mine). itemCount es la suma de las
// cantidades de todos los productos, para el badge de la barra inferior.
export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);
  // Envío elegido en el mapa para ESTE pedido (no se guarda en el backend:
  // el modelo de Address no tiene coordenadas, así que se calcula al vuelo
  // igual que en la tienda web). Se persiste en AsyncStorage para que no se
  // pierda si la app se recarga entre elegir la ubicación y pagar.
  const [shippingInfo, setShippingInfoState] = useState(null);
  // true en cuanto terminó de intentar recuperar el envío guardado (aunque
  // no hubiera ninguno) — evita que la pantalla de pago juzgue "no hay
  // dirección" mientras todavía está cargando desde el dispositivo.
  const [shippingInfoLoaded, setShippingInfoLoaded] = useState(false);

  const setShippingInfo = useCallback(
    (info) => {
      setShippingInfoState(info);
      if (info) saveShippingInfo(user?.email, info);
      else clearShippingInfo(user?.email);
    },
    [user?.email]
  );

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/cart/mine');
      setCart(data || emptyCart);
    } catch {
      setCart(emptyCart);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
      setShippingInfoLoaded(false);
      getShippingInfo(user?.email)
        .then((stored) => {
          if (stored) setShippingInfoState(stored);
        })
        .finally(() => setShippingInfoLoaded(true));
    } else {
      setCart(emptyCart);
      setShippingInfoState(null);
      setShippingInfoLoaded(true);
    }
  }, [isAuthenticated, user?.email, refreshCart]);

  const addToCart = useCallback(async (productId, productType, quantity = 1) => {
    const data = await apiFetch('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, productType, quantity }),
    });
    setCart(data);
  }, []);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    const data = await apiFetch(`/api/cart/item/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    setCart(data);
  }, []);

  const removeItem = useCallback(async (itemId) => {
    const data = await apiFetch(`/api/cart/item/${itemId}`, { method: 'DELETE' });
    setCart(data);
  }, []);

  const checkout = useCallback(
    async (shippingAddress, contactPhone, couponCode) => {
      const confirmed = await apiFetch('/api/cart/checkout', {
        method: 'POST',
        body: JSON.stringify({ shippingAddress, contactPhone, couponCode: couponCode || undefined }),
      });
      await refreshCart(); // el carrito activo confirmado pasa a "Pendiente"; esto trae uno nuevo vacío
      setShippingInfo(null);
      return confirmed;
    },
    [refreshCart, setShippingInfo]
  );

  const itemCount = (cart?.products || []).reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cart, itemCount, loading, refreshCart, addToCart, updateQuantity, removeItem, checkout,
        shippingInfo, setShippingInfo, shippingInfoLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
