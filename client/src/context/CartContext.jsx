import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const EMPTY = { items: [], total: 0 };

// The cart lives on the server; this context keeps a local copy in sync.
export function CartProvider({ children }) {
  const { token } = useAuth();
  const [cart, setCart] = useState(EMPTY);

  const refresh = useCallback(async () => {
    if (!token) return setCart(EMPTY);
    setCart(await api('/cart', { token }));
  }, [token]);

  useEffect(() => {
    refresh().catch(() => setCart(EMPTY));
  }, [refresh]);

  const addItem = async (productId, quantity = 1) =>
    setCart(await api('/cart', { method: 'POST', body: { productId, quantity }, token }));

  const updateItem = async (productId, quantity) =>
    setCart(await api(`/cart/${productId}`, { method: 'PATCH', body: { quantity }, token }));

  const removeItem = async (productId) =>
    setCart(await api(`/cart/${productId}`, { method: 'DELETE', token }));

  const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, count, refresh, addItem, updateItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
