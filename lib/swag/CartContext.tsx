'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { SwagProduct } from './types';

export interface CartItem {
  product: SwagProduct;
  quantity: number;
  variant?: string;
}

// Discount system: only one code at a time, no stacking
export const PROMO_CODES: Record<string, { percent: number; label: string }> = {
  SAMETEAM: { percent: 20, label: '20% off with SAMETEAM' },
};

const AUTO_APPLY_CODE = 'SAMETEAM';

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
  discountCode: string | null;
  discountPercent: number;
  discountAmount: number;
  discountedTotal: number;
  applyCode: (code: string) => boolean;
  removeCode: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(AUTO_APPLY_CODE);

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

  const applyCode = useCallback((code: string): boolean => {
    const upper = code.toUpperCase().trim();
    if (PROMO_CODES[upper]) {
      setDiscountCode(upper);
      return true;
    }
    return false;
  }, []);

  const removeCode = useCallback(() => setDiscountCode(null), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const discountPercent = discountCode && PROMO_CODES[discountCode] ? PROMO_CODES[discountCode].percent : 0;
  const discountAmount = subtotal * (discountPercent / 100);
  const discountedTotal = subtotal - discountAmount;

  return (
    <CartContext.Provider value={{
      items, isOpen, addItem, removeItem, updateQuantity,
      clearCart, openCart, closeCart, totalItems, subtotal,
      discountCode, discountPercent, discountAmount, discountedTotal,
      applyCode, removeCode,
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
