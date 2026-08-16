import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

// Carrito del cliente (GET /api/cart/mine). itemCount es la suma de las
// cantidades de todos los productos, para el badge de la barra inferior.
export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [itemCount, setItemCount] = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const cart = await apiFetch('/api/cart/mine');
      const total = (cart?.products || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
      setItemCount(total);
    } catch {
      setItemCount(0);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setItemCount(0);
    }
  }, [isAuthenticated, refreshCart]);

  const addToCart = useCallback(
    async (productId, productType, quantity = 1) => {
      await apiFetch('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId, productType, quantity }),
      });
      await refreshCart();
    },
    [refreshCart]
  );

  return (
    <CartContext.Provider value={{ itemCount, refreshCart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
