'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. On définit ce qu'est un "Produit" dans notre panier
type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  category: string;
};

// 2. On définit les actions possibles
type CartContextType = {
  cart: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Charger le panier sauvegardé au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('gh_cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Sauvegarder automatiquement quand le panier change
  useEffect(() => {
    localStorage.setItem('gh_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: CartItem) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, product];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty }}>
      {children}
    </CartContext.Provider>
  );
}

// Le petit "hook" pour utiliser le panier facilement dans les pages
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};