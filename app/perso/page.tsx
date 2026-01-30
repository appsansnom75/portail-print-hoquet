'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import CartDrawer from '@/components/CartDrawer';

const THEME = { 
  category: 'Signaletique', 
  label: 'Produits sans personnalisation', 
  color: 'text-green-500', 
  bg: 'bg-green-500' 
};

export default function SignaletiquePage() {
  const { cart, addToCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<any>({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setIsAdmin(true);
      const { data } = await supabase.from('products').select('*').eq('category', THEME.category).order('created_at', { ascending: true });
      if (data) {
        const formatted = data.map(p => ({
          id: p.id, name: p.name, image: p.image_url, hasVariants: p.has_variants,
          variants: p.config.variants || [], quantities: p.config.quantities || [], prices: p.config.prices || { default: [] }
        }));
        setProducts(formatted);
        setSelections(formatted.reduce((acc, p) => ({ ...acc, [p.id]: { qty: p.quantities[0], variant: p.hasVariants ? p.variants[0].id : 'default' } }), {}));
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleAddToCart = (p: any) => {
    const s = selections[p.id];
    const pList = p.prices[s.variant] || p.prices.default || [];
    const totalHT = pList[p.quantities.indexOf(Number(s.qty))];
    addToCart({ 
      id: `${p.id}-${s.variant}`, 
      name: `${p.name}${p.hasVariants ? ' - ' + p.variants.find((v:any)=>v.id===s.variant).name : ''}`, 
      price: totalHT / Number(s.qty), 
      qty: Number(s.qty), 
      category: THEME.label 
    });
    setIsCartOpen(true);
  };

  if (loading) return <div className="min-h-screen bg-[#0f092e] flex items-center justify-center font-black text-green-500 uppercase animate-pulse">Chargement Signalétique...</div>;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white flex flex-col relative overflow-x-hidden">
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0f092e]/80 backdrop-blur-md z-50">
        <Link href="/" className="text-[10px] font-black uppercase text-white/40">← Retour</Link>
        <h1 className={`text-[10px] font-black uppercase tracking-[0.3em] ${THEME.color} italic`}>{THEME.label}</h1>
        {isAdmin ? <Link href="/admin/products" className="bg-white/10 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-[#0f092e] transition-all">Dashboard</Link> : <div className="w-10"></div>}
      </header>

      <main className="max-w-7xl mx-auto w-full py-16 px-6 pb-40 grid grid-cols-1 md:grid-cols-3 gap-12">
        {products.map((p) => (
          <div key={p.id} className="pt-10 relative group">
            <div className="h-48 w-full flex items-center justify-center relative -mb-10 z-20 transition-transform duration-500 group-hover:scale-110">
              <img src={p.variants.find((v:any)=>v.id===selections[p.id].variant)?.image || p.image} className="max-h-full object-contain drop-shadow-2xl" alt={p.name} />
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 pt-16 group-hover:border-green-500/30 transition-all">
              <h3 className={`font-black text-base uppercase mb-6 ${THEME.color}`}>{p.name}</h3>
              <div className="space-y-4">
                {p.hasVariants && <select value={selections[p.id].variant} onChange={(e) => setSelections({...selections, [p.id]:{...selections[p.id], variant: e.target.value}})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[10px] font-black uppercase text-white outline-none focus:border-green-500 transition-colors">
                  {p.variants.map((v:any)=><option key={v.id} value={v.id}>{v.name}</option>)}
                </select>}
                <select value={selections[p.id].qty} onChange={(e) => setSelections({...selections, [p.id]:{...selections[p.id], qty: Number(e.target.value)}})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[10px] font-black uppercase text-white outline-none focus:border-green-500 transition-colors">
                  {p.quantities.map((q:any)=><option key={q} value={q}>{q} exemplaires</option>)}
                </select>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <span className="font-black text-2xl text-white">{(p.prices[selections[p.id].variant][p.quantities.indexOf(Number(selections[p.id].qty))]).toFixed(2)}€</span>
                  <button onClick={() => handleAddToCart(p)} className="bg-white text-[#0f092e] px-6 py-3 rounded-2xl font-black uppercase text-[9px] hover:bg-green-500 hover:text-white transition-all">Ajouter</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>

      <button onClick={() => setIsCartOpen(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center z-[100] hover:scale-110 transition-transform">
        <div className="relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f092e" strokeWidth="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          {cart.length > 0 && <span className={`absolute -top-3 -right-3 ${THEME.bg} text-white text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-[#0f092e]`}>{cart.length}</span>}
        </div>
      </button>
    </div>
  );
}