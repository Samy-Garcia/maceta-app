import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

const emptyCart = { products: [], total: 0 };

// Carrito real del cliente (GET /api/cart/mine). itemCount es la suma de las
// cantidades de todos los productos, para el badge de la barra inferior.
export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);

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
    } else {
      setCart(emptyCart);
    }
  }, [isAuthenticated, refreshCart]);

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
      return confirmed;
    },
    [refreshCart]
  );

  const itemCount = (cart?.products || []).reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{ cart, itemCount, loading, refreshCart, addToCart, updateQuantity, removeItem, checkout }}
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
