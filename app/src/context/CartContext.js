import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api';

const CartContext = createContext({});

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const persist = useCallback((newItems) => {
    SecureStore.setItemAsync('cart', JSON.stringify(newItems));
  }, []);

  // Sync cart to server — debounced 500ms
  const syncTimerRef = useRef(null);
  const syncToServer = useCallback((newItems) => {
    clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        if (!token) return;
        await api.syncCart(newItems.map(i => ({
          id:        i.product.id,
          qty:       i.quantity,
          name:      i.product.name,
          price:     i.product.price,
          image:     i.product.image || '',
          article:   i.product.article || '',
          available: i.product.available ?? 99,
        })));
      } catch {}
    }, 500);
  }, []);

  // Load cart from server and replace local cart (always, including empty = cleared on site)
  const loadFromServer = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (!token) return;
      const res = await api.getCart();
      if (res.success && Array.isArray(res.items)) {
        const serverItems = res.items.map(i => ({
          product: {
            id:        parseInt(i.id),
            name:      i.name,
            price:     parseFloat(i.price),
            image:     i.image || '',
            article:   i.article || '',
            available: parseInt(i.available) || 99,
          },
          quantity: parseInt(i.qty),
        }));
        setItems(serverItems);
        persist(serverItems);
      }
    } catch {}
  }, [persist]);

  // On mount: if logged in → load from server, else → load from local storage
  useEffect(() => {
    SecureStore.getItemAsync('auth_token').then(token => {
      if (token) {
        loadFromServer();
      } else {
        SecureStore.getItemAsync('cart').then(raw => {
          if (raw) { try { setItems(JSON.parse(raw)); } catch {} }
        });
      }
    });
  }, [loadFromServer]);

  // Re-sync from server whenever app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') loadFromServer();
    });
    return () => sub.remove();
  }, [loadFromServer]);

  const addItem = useCallback((product, quantity = 1) => {
    setItems(prev => {
      const idx    = prev.findIndex(i => i.product.id === product.id);
      const maxQty = product.available ?? 99;
      let next;
      if (idx >= 0) {
        const newQty = Math.min(prev[idx].quantity + quantity, maxQty);
        next = prev.map((i, k) => k === idx ? { ...i, quantity: newQty } : i);
      } else {
        next = [...prev, { product, quantity: Math.min(quantity, maxQty) }];
      }
      persist(next);
      syncToServer(next);
      return next;
    });
  }, [persist, syncToServer]);

  const removeItem = useCallback((productId) => {
    setItems(prev => {
      const next = prev.filter(i => i.product.id !== productId);
      persist(next);
      syncToServer(next);
      return next;
    });
  }, [persist, syncToServer]);

  const updateQty = useCallback((productId, quantity) => {
    if (quantity <= 0) { removeItem(productId); return; }
    setItems(prev => {
      const next = prev.map(i => {
        if (i.product.id !== productId) return i;
        const maxQty = i.product.available ?? 99;
        return { ...i, quantity: Math.min(quantity, maxQty) };
      });
      persist(next);
      syncToServer(next);
      return next;
    });
  }, [persist, removeItem, syncToServer]);

  const clearCart = useCallback(() => {
    setItems([]);
    SecureStore.deleteItemAsync('cart');
    syncToServer([]);
  }, [syncToServer]);

  const total     = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, itemCount, loadFromServer }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
