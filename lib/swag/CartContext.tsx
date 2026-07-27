'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { SwagProduct } from './products';

export interface CartItem {
  product: SwagProduct;
  quantity: number;
  variant?: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: SwagProduct, variant?: string) => void;
  removeItem: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const cartKey = (id: string, variant?: string) => variant ? `${id}__${variant}` : id;

  const addItem = useCallback((product: SwagProduct, variant?: string) => {
    setItems(prev => {
      const key = cartKey(product.id, variant);
      const existing = prev.find(i => cartKey(i.product.id, i.variant) === key);
      if (existing) {
        return prev.map(i =>
          cartKey(i.product.id, i.variant) === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1, variant }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, variant?: string) => {
    const key = cartKey(productId, variant);
    setItems(prev => prev.filter(i => cartKey(i.product.id, i.variant) !== key));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variant?: string) => {
    const key = cartKey(productId, variant);
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => cartKey(i.product.id, i.variant) !== key));
    } else {
      setItems(prev =>
        prev.map(i =>
          cartKey(i.product.id, i.variant) === key ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, isOpen, addItem, removeItem, updateQuantity,
      clearCart, openCart, closeCart, totalItems, subtotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
