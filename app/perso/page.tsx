'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function PersoPage() {
  const { cart, addToCart: addItemToGlobalCart, removeFromCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<any>({});

  // 1. CHARGEMENT DYNAMIQUE DEPUIS SUPABASE
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'Perso')
        .order('created_at', { ascending: true });

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
        
        // Initialisation intelligente des sélections par défaut
        const initialSels = formatted.reduce((acc, p) => ({
          ...acc, [p.id]: { 
            qty: p.quantities[0], 
            variant: p.hasVariants && p.variants.length > 0 ? p.variants[0].id : 'default' 
          }
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
    if (!sel) return;

    const qtyIndex = product.quantities.indexOf(Number(sel.qty));
    const priceList = product.prices[sel.variant] || product.prices.default || [];
    const totalPriceHT = priceList[qtyIndex];
    
    const variantName = product.hasVariants 
      ? ` (${product.variants.find((v:any) => v.id === sel.variant)?.name})` 
      : "";

    addItemToGlobalCart({
      id: `${product.id}-${sel.variant}-${Date.now()}`, 
      name: `${product.name}${variantName}`,
      price: totalPriceHT / Number(sel.qty), 
      qty: Number(sel.qty), 
      category: 'Impression'
    });
    setIsCartOpen(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f092e] flex flex-col items-center justify-center font-black uppercase text-blue-500 tracking-[0.3em] gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      Chargement du catalogue...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col relative overflow-x-hidden">
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">← Retour</Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 italic">Portail Impression</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-7xl mx-auto w-full py-12 px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
          {products.map((product) => {
            const sel = selections[product.id] || { qty: product.quantities[0], variant: 'default' };
            const qtyIndex = product.quantities.indexOf(Number(sel.qty));
            const priceList = product.prices[sel.variant] || product.prices.default || [];
            const currentTotal = priceList[qtyIndex] || 0;

            // LOGIQUE IMAGE DYNAMIQUE : On cherche l'image de la variante
            const currentVariantData = product.variants.find((v: any) => v.id === sel.variant);
            const displayImage = currentVariantData?.image || product.image;

            return (
              <div key={product.id} className="flex flex-col pt-10 relative group"> 
                
                {/* IMAGE FLOTTANTE ANIMÉE */}
                <div className="h-48 w-full flex items-center justify-center relative -mb-8 z-20 pointer-events-none px-6 transition-transform duration-500 group-hover:scale-105">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={displayImage} // Force l'animation au changement d'URL
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.3 }}
                      src={displayImage}
                      alt={product.name}
                      className="max-h-full w-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)]"
                    />
                  </AnimatePresence>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col pt-12 transition-all group-hover:border-blue-500/30 group-hover:bg-white/[0.05]">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-black text-[15px] uppercase tracking-tighter text-blue-500 leading-tight w-2/3">{product.name}</h3>
                    <div className="bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded">
                        <span className="text-[7px] font-black text-blue-400 uppercase tracking-[0.2em]">Config</span>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* MENU VARIANTES AVEC IMAGE DYNAMIQUE */}
                    {product.hasVariants && (
                      <div className="space-y-2">
                        <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">Choisir le modèle</p>
                        <select 
                            value={sel.variant}
                            onChange={(e) => updateSelection(product.id, 'variant', e.target.value)}
                            className="w-full bg-[#16103a] border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase text-white outline-none focus:border-blue-500 cursor-pointer transition-colors"
                        >
                            {product.variants.map((v: any) => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">Quantité</p>
                      <div className="relative">
                        <select 
                            value={sel.qty} 
                            onChange={(e) => updateSelection(product.id, 'qty', Number(e.target.value))} 
                            className="w-full bg-[#16103a] border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
                        >
                            {product.quantities.map((q: number) => <option key={q} value={q}>{q} exemplaires</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500 text-[8px]">▼</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-white/5 mt-2">
                      <div className="flex flex-col">
                          <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Total HT</span>
                          <span className="font-black text-2xl text-white tracking-tighter">
                            {currentTotal > 0 ? `${currentTotal.toFixed(2)}€` : "---"}
                          </span>
                      </div>
                      <button 
                        onClick={() => handleAddToCart(product)} 
                        className="bg-white text-[#0f092e] px-6 py-3.5 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-xl"
                      >
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

      {/* PANIER FLOTTANT */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <button 
          onClick={() => setIsCartOpen(!isCartOpen)} 
          className="bg-white text-[#0f092e] px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-4 hover:bg-blue-600 hover:text-white transition-all active:scale-95 border-4 border-[#0f092e]"
        >
          Panier {cart.length > 0 && <span className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-[9px]">{cart.length}</span>}
        </button>
        
        <AnimatePresence>
          {isCartOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-20 left-0 w-80 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-[#0f092e] overflow-hidden border border-slate-200"
            >
               <div className="bg-slate-50 p-5 border-b flex justify-between items-center">
                 <span className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Sélection</span>
                 <button onClick={() => setIsCartOpen(false)} className="text-red-500 font-black text-[9px] hover:rotate-90 transition-transform px-2">✕</button>
               </div>
               
               <div className="max-h-80 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <p className="text-[10px] font-bold text-slate-300 uppercase text-center py-10 tracking-[0.2em]">Votre panier est vide</p>
                ) : cart.map((item) => (
                  <div key={item.id} className="border-b border-slate-100 pb-4 flex justify-between items-start last:border-0">
                    <div className="max-w-[180px]">
                      <p className="font-black text-[11px] uppercase leading-tight text-blue-600 tracking-tight">{item.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{item.qty} ex.</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[11px] tracking-tighter">{(item.price * item.qty).toFixed(2)}€</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-[7px] text-red-500 font-black uppercase hover:underline">Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-slate-50 border-t">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-black text-[10px] uppercase text-slate-400 tracking-widest">Sous-total HT</span>
                    <span className="font-black text-2xl text-blue-600 tracking-tighter">
                        {cart.reduce((a, b) => a + (b.price * b.qty), 0).toFixed(2)}€
                    </span>
                  </div>
                  <Link href="/panier" className="block text-center w-full bg-[#0f092e] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl">
                    Terminer la commande
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}