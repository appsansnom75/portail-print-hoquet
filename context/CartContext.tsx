'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  cartLineId: string;      // ← identifiant unique de la ligne panier
  name: string;
  price: number;
  qty: number;
  category: string;
  color?: string;
  orderedBy?: string | null;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'cartLineId'>) => void;
  removeFromCart: (cartLineId: string) => void;
  updateQty: (cartLineId: string, newQty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart_storage');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Erreur lors du chargement du panier", e);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart_storage', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = (item: Omit<CartItem, 'cartLineId'>) => {
    setCart((prevCart) => {
      // Même produit ET même profil → on cumule la quantité sur la même ligne
      const existingIndex = prevCart.findIndex(
        (i) => i.id === item.id && i.orderedBy === item.orderedBy
      );

      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          qty: newCart[existingIndex].qty + item.qty,
        };
        return newCart;
      }

      // Produit différent OU profil différent → nouvelle ligne indépendante
      const cartLineId = `${item.id}_${item.orderedBy ?? 'none'}_${Date.now()}`;
      return [...prevCart, { ...item, cartLineId }];
    });
  };

  // ✅ Supprime uniquement la ligne ciblée par son cartLineId
  const removeFromCart = (cartLineId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartLineId !== cartLineId));
  };

  // ✅ Met à jour la quantité d'une ligne spécifique
  const updateQty = (cartLineId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartLineId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartLineId === cartLineId ? { ...item, qty: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart_storage');
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}