'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import CartDrawer from '@/components/CartDrawer';

const THEME = { 
  category: 'Vetements', 
  label: 'Gamme Business', 
  color: 'text-orange-500', 
  bg: 'bg-orange-500' 
};

export default function BusinessPage() {
  const { cart, addToCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<any>({});
  const [isAdmin, setIsAdmin] = useState(false);
  // État pour gérer le basculement recto/verso par produit
  const [flippedProducts, setFlippedProducts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setIsAdmin(true);
      
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category', THEME.category)
        .order('created_at', { ascending: true });

      if (data) {
        const formatted = data.map(p => ({
          id: p.id, 
          name: p.name, 
          image_recto: p.image_recto, 
          image_verso: p.image_verso, 
          hasVariants: p.has_variants,
          variants: p.config.variants || [], 
          quantities: p.config.quantities || [], 
          prices: p.config.prices || { default: [] }
        }));
        setProducts(formatted);
        setSelections(formatted.reduce((acc, p) => ({ 
          ...acc, 
          [p.id]: { 
            qty: p.quantities[0], 
            variant: p.hasVariants ? p.variants[0].id : 'default' 
          } 
        }), {}));
      }
      setLoading(false);
    };
    init();
  }, []);

  const toggleFlip = (id: string) => {
    setFlippedProducts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (p: any) => {
    const s = selections[p.id];
    const pList = p.prices[s.variant] || p.prices.default || [];
    const totalHT = pList[p.quantities.indexOf(Number(s.qty))];
    addToCart({ 
      id: `${p.id}-${s.variant}`, 
      name: `${p.name}${p.hasVariants ? ' - ' + p.variants.find((v:any)=>v.id===s.variant).name : ''}`, 
      price: totalHT / Number(s.qty), 
      qty: Number(s.qty), 
      category: THEME.label,
      color: THEME.color 
    });
    setIsCartOpen(true);
  };

  if (loading) return <div className="min-h-screen bg-[#0f092e] flex items-center justify-center font-black text-orange-500 uppercase animate-pulse">Chargement Business...</div>;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white flex flex-col relative overflow-x-hidden">
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0f092e]/80 backdrop-blur-md z-50">
        <Link href="/" className="text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors">← Retour</Link>
        <h1 className={`text-[10px] font-black uppercase tracking-[0.3em] ${THEME.color} italic`}>{THEME.label}</h1>
        {isAdmin ? <Link href="/admin/products" className="bg-white/10 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-[#0f092e] transition-all">Dashboard</Link> : <div className="w-10"></div>}
      </header>

      <main className="max-w-7xl mx-auto w-full py-16 px-6 pb-40 grid grid-cols-1 md:grid-cols-3 gap-12">
        {products.map((p) => {
          const sel = selections[p.id];
          if (!sel) return null;
          const pList = p.prices[sel.variant] || p.prices.default || [];
          const currentPrice = pList[p.quantities.indexOf(Number(sel.qty))] || 0;
          
          // Logique d'affichage (Recto ou Verso)
          const isFlipped = flippedProducts[p.id] || false;
          const currentImg = (isFlipped && p.image_verso) 
            ? p.image_verso 
            : (p.variants.find((v:any) => v.id === sel.variant)?.image || p.image_recto);

          return (
            <div key={p.id} className="pt-10 relative">
              {/* ZONE IMAGE */}
              <div className="h-48 w-full flex items-center justify-center relative -mb-10 z-20">
                
                {/* BOUTON FLÈCHE FIXE (Uniquement si le verso existe) */}
                {p.image_verso && (
                  <button 
                    onClick={() => toggleFlip(p.id)}
                    className="absolute right-0 bottom-4 z-30 bg-white text-black p-2 rounded-full shadow-xl hover:bg-orange-500 hover:text-white transition-all active:scale-90"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m15 18 6-6-6-6"/><path d="M3 12h18"/>
                    </svg>
                  </button>
                )}

                <img 
                  src={currentImg} 
                  className="max-h-full object-contain drop-shadow-2xl transition-all duration-300" 
                  alt={p.name} 
                />
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 pt-16 hover:border-orange-500/30 transition-all duration-500">
                <h3 className={`font-black text-base uppercase mb-6 ${THEME.color}`}>{p.name}</h3>
                <div className="space-y-4">
                  {p.hasVariants && (
                    <select 
                      value={sel.variant} 
                      onChange={(e) => setSelections({...selections, [p.id]:{...sel, variant: e.target.value}})} 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[10px] font-black uppercase text-white outline-none focus:border-orange-500 transition-colors cursor-pointer"
                    >
                      {p.variants.map((v:any)=><option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  )}
                  <select 
                    value={sel.qty} 
                    onChange={(e) => setSelections({...selections, [p.id]:{...sel, qty: Number(e.target.value)}})} 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[10px] font-black uppercase text-white outline-none focus:border-orange-500 transition-colors cursor-pointer"
                  >
                    {p.quantities.map((q:any)=><option key={q} value={q}>{q} exemplaires</option>)}
                  </select>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-4">
                    <span className="font-black text-2xl text-white">{currentPrice.toFixed(2)}€</span>
                    <button 
                      onClick={() => handleAddToCart(p)} 
                      className="bg-white text-[#0f092e] px-8 py-3.5 rounded-2xl font-black uppercase text-[9px] hover:bg-orange-500 hover:text-white transition-all active:scale-90"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Bouton Panier flottant */}
      <button 
        onClick={() => setIsCartOpen(true)} 
        className="fixed bottom-8 right-8 w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center z-[100] hover:scale-110 active:scale-95 transition-all"
      >
        <div className="relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f092e" strokeWidth="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          {cart.length > 0 && (
            <span className={`absolute -top-3 -right-3 ${THEME.bg} text-white text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-[#0f092e]`}>
              {cart.length}
            </span>
          )}
        </div>
      </button>

      <footer className="py-10 border-t border-white/5 text-center">
        <p className="text-[7px] font-black text-white/10 uppercase tracking-[0.5em]">Guy Hoquet Business Portal — 2026</p>
      </footer>
    </div>
  );
}