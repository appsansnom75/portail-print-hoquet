'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface CartItem {
  id: string;
  cartLineId: string;
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
  const [userId, setUserId] = useState<string | null>(null);

  // ── Clé de stockage unique par utilisateur ────────────────────
  const storageKey = userId ? `cart_storage_${userId}` : null;

  // ── 1. Charger le panier au montage ──────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? null;
      setUserId(uid);

      if (uid) {
        const key = `cart_storage_${uid}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          try { setCart(JSON.parse(saved)); } catch (e) { console.error(e); }
        }
      }
      setIsInitialized(true);
    };
    init();
  }, []);

  // ── 2. Vider le panier à chaque changement de session ────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const newUid = session?.user?.id ?? null;

      if (event === 'SIGNED_OUT') {
        setCart([]);
        setUserId(null);
      }

      if (event === 'SIGNED_IN' && newUid) {
        setUserId(newUid);
        const key = `cart_storage_${newUid}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          try { setCart(JSON.parse(saved)); } catch (e) { setCart([]); }
        } else {
          setCart([]);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── 3. Sauvegarder le panier en localStorage ──────────────────
  useEffect(() => {
    if (isInitialized && storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    }
  }, [cart, isInitialized, storageKey]);

  // ── 4. Sync draft en base Supabase (debounce 2s) ─────────────
  useEffect(() => {
    if (!isInitialized || !userId) return;

    const syncDraft = async () => {
      if (cart.length === 0) {
        await supabase
          .from('orders')
          .delete()
          .eq('user_id', userId)
          .eq('status', 'draft');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('id', userId)
        .single();

      const { data: agency } = profile?.agency_id
        ? await supabase
            .from('agencies')
            .select('name, agence_email')
            .eq('id', profile.agency_id)
            .single()
        : { data: null };

      const itemsFormatted = cart.map((i) => ({
        productName: i.name,
        quantity: i.qty,
        price: i.price,
        color: i.color || null,
        orderedBy: i.orderedBy || null,
      }));

      // Delete ancien draft puis insert nouveau
      await supabase
        .from('orders')
        .delete()
        .eq('user_id', userId)
        .eq('status', 'draft');

      await supabase
        .from('orders')
        .insert({
          user_id: userId,
          status: 'draft',
          agency_name: agency?.name ?? null,
          client_email: agency?.agence_email ?? null,
          items: itemsFormatted,
          updated_at: new Date().toISOString(),
        });
    };

    const timeout = setTimeout(syncDraft, 2000);
    return () => clearTimeout(timeout);
  }, [cart, isInitialized, userId]);

  // ── ACTIONS ───────────────────────────────────────────────────
  const addToCart = (item: Omit<CartItem, 'cartLineId'>) => {
    setCart((prevCart) => {
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

      const cartLineId = `${item.id}_${item.orderedBy ?? 'none'}_${Date.now()}`;
      return [...prevCart, { ...item, cartLineId }];
    });
  };

  const removeFromCart = (cartLineId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartLineId !== cartLineId));
  };

  const updateQty = (cartLineId: string, newQty: number) => {
    if (newQty <= 0) { removeFromCart(cartLineId); return; }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartLineId === cartLineId ? { ...item, qty: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    if (typeof window !== 'undefined' && storageKey) {
      localStorage.removeItem(storageKey);
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
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}