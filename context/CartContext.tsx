'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  category: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      // On cherche si le produit (identifié par son ID unique) est déjà là
      const existingItemIndex = prevCart.findIndex((item) => item.id === newItem.id);

      if (existingItemIndex !== -1) {
        // LE PRODUIT EST DÉJÀ LÀ
        const updatedCart = [...prevCart];
        const existingItem = updatedCart[existingItemIndex];
        
        // LOGIQUE CRUCIALE : On force l'addition des volumes
        // On utilise Number() pour éviter que JS transforme 500+500 en "500500"
        const newTotalQty = Number(existingItem.qty) + Number(newItem.qty);

        updatedCart[existingItemIndex] = {
          ...existingItem,
          qty: newTotalQty // On remplace par le nouveau total cumulé
        };
        
        return updatedCart;
      }

      // NOUVEAU PRODUIT : On l'ajoute tel quel
      return [...prevCart, newItem];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}