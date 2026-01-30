'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const THEME = {
  category: 'produit non personnalisable', // Nom exact dans ton admin pour les produits standard
  label: 'Produits Standard',
  color: 'text-green-500',
  bg: 'bg-green-500',
  border: 'focus:border-green-500',
  hover: 'hover:bg-green-600'
};

export default function BusinessPage() {
  const { cart, addToCart: addItemToGlobalCart, removeFromCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<any>({});

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').eq('category', THEME.category).order('created_at', { ascending: true });
      if (data) {
        const formatted = data.map(p => ({
          id: p.id,
          name: p.name,
          image: p.image_url,
          hasVariants: p.has_variants,
          variants: p.config.variants || [],
          quantities: p.config.quantities || [],
          prices: p.config.prices || { default: [] }
        }));
        setProducts(formatted);
        const initialSels = formatted.reduce((acc, p) => ({
          ...acc, [p.id]: { qty: p.quantities[0], variant: p.hasVariants ? p.variants[0].id : 'default' }
        }), {});
        setSelections(initialSels);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const updateSelection = (prodId: string, field: string, value: any) => {
    setSelections((prev: any) => ({ ...prev, [prodId]: { ...prev[prodId], [field]: value } }));
  };

  const handleAddToCart = (product: any) => {
    const sel = selections[product.id];
    const qtyIndex = product.quantities.indexOf(Number(sel.qty));
    const priceList = product.prices[sel.variant] || product.prices.default || [];
    const totalPriceHT = priceList[qtyIndex];
    const variantName = product.hasVariants ? ` (${product.variants.find((v:any) => v.id === sel.variant)?.name})` : "";

    addItemToGlobalCart({
      id: `${product.id}-${sel.variant}-${Date.now()}`, 
      name: `${product.name}${variantName}`,
      price: totalPriceHT / Number(sel.qty), 
      qty: Number(sel.qty), 
      category: THEME.label
    });
    setIsCartOpen(true);
  };

  if (loading) return <div className="min-h-screen bg-[#0f092e] flex items-center justify-center font-black text-orange-500 tracking-widest uppercase animate-pulse">Chargement Business...</div>;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col relative overflow-x-hidden">
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">← Retour</Link>
        <h1 className={`text-xs font-black uppercase tracking-[0.3em] ${THEME.color} italic`}>{THEME.label}</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-7xl mx-auto w-full py-12 px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {products.map((product) => {
            const sel = selections[product.id];
            const qtyIndex = product.quantities.indexOf(Number(sel.qty));
            const priceList = product.prices[sel.variant] || product.prices.default || [];
            const currentTotal = priceList[qtyIndex] || 0;
            const displayImage = product.variants.find((v: any) => v.id === sel.variant)?.image || product.image;

            return (
              <div key={product.id} className="flex flex-col pt-10 relative group">
                <div className="h-48 w-full flex items-center justify-center relative -mb-8 z-20 pointer-events-none px-6 transition-transform duration-500 group-hover:scale-105">
                  <AnimatePresence mode="wait">
                    <motion.img key={displayImage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} src={displayImage} className="max-h-full w-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)]" />
                  </AnimatePresence>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 pt-12 shadow-xl flex flex-col transition-all group-hover:border-orange-500/30">
                  <h3 className={`font-black text-[15px] uppercase tracking-tighter mb-4 ${THEME.color}`}>{product.name}</h3>
                  
                  <div className="space-y-4">
                    {product.hasVariants && (
                       <select value={sel.variant} onChange={(e) => updateSelection(product.id, 'variant', e.target.value)} className="w-full bg-[#16103a] border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase text-white outline-none">
                          {product.variants.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                       </select>
                    )}
                    <select value={sel.qty} onChange={(e) => updateSelection(product.id, 'qty', Number(e.target.value))} className="w-full bg-[#16103a] border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase text-white outline-none">
                       {product.quantities.map((q: number) => <option key={q} value={q}>{q} exemplaires</option>)}
                    </select>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="font-black text-2xl text-white tracking-tighter">{currentTotal.toFixed(2)}€</span>
                      <button onClick={() => handleAddToCart(product)} className={`bg-white text-[#0f092e] px-6 py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest ${THEME.hover} hover:text-white transition-all active:scale-95 shadow-xl`}>
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* PANIER FLOTTANT (Raccourci pour gain de place) */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <button onClick={() => setIsCartOpen(!isCartOpen)} className={`bg-white text-[#0f092e] px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-4 ${THEME.hover} hover:text-white transition-all border-4 border-[#0f092e]`}>
          Panier {cart.length > 0 && <span className={`${THEME.bg} text-white px-2 py-0.5 rounded-full text-[9px]`}>{cart.length}</span>}
        </button>
      </div>
    </div>
  );
}