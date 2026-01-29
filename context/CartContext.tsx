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
      const existingItemIndex = prevCart.findIndex((item) => item.id === newItem.id);

      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart];
        const currentQty = Number(updatedCart[existingItemIndex].qty);
        const qtyToAdd = Number(newItem.qty);

        // DEBUG: Ouvre ta console (F12) pour voir ce message
        console.log(`PANIER: Reçu ${qtyToAdd} à ajouter aux ${currentQty} existants`);

        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          qty: currentQty + qtyToAdd
        };
        return updatedCart;
      }
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