import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../services/api.js';
import { addCustomOrderToCart as addCustomOrderToCartApi } from '../services/customOrders.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

const emptyCart = { products: [], total: 0 };

// Carrito real del cliente (GET /api/cart/mine). itemCount es la suma de las
// cantidades de todos los productos, para el badge de la barra inferior.
//
// La dirección de envío ya no vive aquí: se escribe a mano en la pantalla de
// pago y viaja directo en el checkout, así que no hay nada que guardar entre
// pantallas.
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
    if (isAuthenticated) refreshCart();
    else setCart(emptyCart);
  }, [isAuthenticated, refreshCart]);

  const addToCart = useCallback(async (productId, productType, quantity = 1) => {
    const data = await apiFetch('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, productType, quantity }),
    });
    setCart(data);
  }, []);

  // Agregar una personalización ya aceptada (con precio) al carrito, igual
  // que un producto normal, pero por su id de solicitud en vez de productId.
  const addCustomOrderToCart = useCallback(async (customOrderId, quantity = 1) => {
    const data = await addCustomOrderToCartApi(customOrderId, quantity);
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

  // shippingCost va SIEMPRE: el backend desplegado lo exige para cerrar el
  // pedido (si falta responde "Debes marcar tu ubicación en el mapa para
  // calcular el envío"). Es el mismo campo que manda la tienda web, solo que
  // aquí el monto sale de la tarifa configurada y no de un mapa.
  //
  // wompiTransaccionId también es obligatorio desde que el checkout de la web
  // cobra con Wompi (modo de prueba) antes de confirmar el pedido: el pago se
  // hace primero y recién con la transacción aprobada se llama esto.
  const checkout = useCallback(
    async ({
      shippingAddress,
      contactPhone,
      couponCode,
      shippingCost = 0,
      deliveryMethod = 'shipping',
      pickupLocationId,
      wompiTransaccionId,
    }) => {
      const confirmed = await apiFetch('/api/cart/checkout', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress,
          contactPhone,
          couponCode: couponCode || undefined,
          shippingCost: Number(shippingCost) || 0,
          deliveryMethod,
          pickupLocationId: pickupLocationId || undefined,
          wompiTransaccionId,
        }),
      });
      await refreshCart(); // el carrito activo confirmado pasa a "Pendiente"; esto trae uno nuevo vacío
      return confirmed;
    },
    [refreshCart]
  );

  const itemCount = (cart?.products || []).reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cart, itemCount, loading, refreshCart, addToCart, addCustomOrderToCart, updateQuantity, removeItem, checkout,
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
