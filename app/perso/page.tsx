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

  // 1. CHARGEMENT DEPUIS SUPABASE
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
        
        // Initialisation des sélections par défaut
        const initialSels = formatted.reduce((acc, p) => ({
          ...acc, [p.id]: { 
            qty: p.quantities[0], 
            variant: p.hasVariants ? p.variants[0].id : 'default' 
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
    const qtyIndex = product.quantities.indexOf(sel.qty);
    const priceList = product.prices[sel.variant] || product.prices.default;
    const totalPriceHT = priceList[qtyIndex];
    
    addItemToGlobalCart({
      id: `${product.id}-${sel.variant}-${Date.now()}`, // ID unique
      name: `${product.name}${product.hasVariants ? ` (${product.variants.find((v:any) => v.id === sel.variant)?.name})` : ""}`,
      price: totalPriceHT / Number(sel.qty), 
      qty: Number(sel.qty), 
      category: 'Impression'
    });
    setIsCartOpen(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f092e] flex items-center justify-center font-black uppercase text-blue-500 tracking-widest animate-pulse">
      Chargement du catalogue...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col relative overflow-x-hidden">
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">← Retour</Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">Personnalisation</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-7xl mx-auto w-full py-12 px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
          {products.map((product) => {
            const sel = selections[product.id];
            const qtyIndex = product.quantities.indexOf(sel.qty);
            const currentTotal = (product.prices[sel.variant] || product.prices.default)[qtyIndex] || 0;

            return (
              <div key={product.id} className="flex flex-col pt-10 relative group"> 
                {/* IMAGE VOLANTE */}
                <div className="h-48 w-full flex items-center justify-center relative -mb-8 z-20 pointer-events-none px-6 transition-transform duration-500 group-hover:scale-105">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full w-full object-contain drop-shadow-[0_12px_15px_rgba(0,0,0,0.5)]"
                    />
                </div>

                {/* BOITE CONFIGURATEUR */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col pt-12">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-black text-[15px] uppercase tracking-tighter text-blue-500 leading-tight w-2/3">{product.name}</h3>
                    <div className="bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded">
                        <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">Perso</span>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {product.hasVariants && (
                      <div className="space-y-2">
                        <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">Modèle</p>
                        <div className="grid grid-cols-2 gap-1">
                          {product.variants.map((v: any) => (
                            <button 
                              key={v.id} 
                              onClick={() => updateSelection(product.id, 'variant', v.id)} 
                              className={`py-2 rounded text-[8px] font-black uppercase transition-all border ${sel.variant === v.id ? 'border-blue-500 bg-blue-500 text-white' : 'border-white/5 bg-white/5 text-white/40 hover:border-white/20'}`}
                            >
                              {v.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">Quantité</p>
                      <div className="relative">
                        <select 
                            value={sel.qty} 
                            onChange={(e) => updateSelection(product.id, 'qty', Number(e.target.value))} 
                            className="w-full bg-[#16103a] border border-white/5 rounded p-2.5 text-[9px] font-black uppercase text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
                        >
                            {product.quantities.map((q: number) => <option key={q} value={q}>{q} ex.</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 text-[8px]">▼</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-white/5">
                      <div className="flex flex-col">
                          <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Total HT</span>
                          <span className="font-black text-lg text-white tracking-tighter">{currentTotal.toFixed(2)}€</span>
                      </div>
                      <button 
                        onClick={() => handleAddToCart(product)} 
                        className="bg-white text-[#0f092e] px-6 py-3 rounded-xl font-black uppercase text-[8px] tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-lg shadow-white/5"
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

      {/* PANIER FLOTTANT RECAP */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <button 
          onClick={() => setIsCartOpen(!isCartOpen)} 
          className="bg-white text-[#0f092e] px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-4 hover:bg-blue-600 hover:text-white transition-all active:scale-95"
        >
          Panier Perso {cart.length > 0 && <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[9px]">{cart.length}</span>}
        </button>
        
        {isCartOpen && (
          <div className="absolute bottom-16 left-0 w-80 bg-white rounded-2xl shadow-2xl text-[#0f092e] overflow-hidden border border-slate-200">
             <div className="bg-slate-50 p-4 border-b flex justify-between items-center text-slate-500">
               <span className="font-black text-[9px] uppercase tracking-widest">Votre Panier</span>
               <button onClick={() => setIsCartOpen(false)} className="text-red-500 font-black text-[9px]">FERMER</button>
             </div>
             
             <div className="max-h-80 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <p className="text-[10px] font-bold text-slate-400 uppercase text-center py-6">Vide</p>
              ) : cart.map((item) => (
                <div key={item.id} className="border-b border-slate-100 pb-3 flex justify-between items-start last:border-0">
                  <div>
                    <p className="font-black text-[10px] uppercase leading-tight text-blue-600">{item.name}</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">{item.qty} ex.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[10px]">{(item.price * item.qty).toFixed(2)}€</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-[7px] text-red-500 font-black uppercase hover:underline">Suppr.</button>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="p-5 bg-slate-50 border-t">
                <div className="flex justify-between items-center mb-4 text-slate-400 font-black">
                  <span className="text-[10px] uppercase">Total HT</span>
                  <span className="text-xl text-blue-600 tracking-tighter">{cart.reduce((a, b) => a + (b.price * b.qty), 0).toFixed(2)}€</span>
                </div>
                <Link href="/panier" className="block text-center w-full bg-[#0f092e] text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all">
                  Commander
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}