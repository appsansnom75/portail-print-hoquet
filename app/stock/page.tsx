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
  bg: 'bg-green-500',
  border: 'focus:border-green-500',
  hover: 'hover:bg-green-600',
  shadow: 'group-hover:border-green-500/30'
};

export default function SignaletiquePage() {
  const { cart, addToCart } = useCart();
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
    
    const variantObj = product.variants.find((v: any) => v.id === sel.variant);
    const variantName = product.hasVariants ? ` - ${variantObj?.name}` : "";

    addToCart({
      id: `${product.id}-${sel.variant}`, 
      name: `${product.name}${variantName}`,
      price: totalPriceHT / Number(sel.qty), 
      qty: Number(sel.qty), 
      category: THEME.label
    });

    setIsCartOpen(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f092e] flex items-center justify-center font-black text-green-500 tracking-[0.5em] uppercase animate-pulse italic text-xs">
      Chargement Signalétique...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col relative overflow-x-hidden">
      
      {/* PANIER FLOTTANT CORRÉLÉ */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">← Retour</Link>
        <h1 className={`text-[11px] font-black uppercase tracking-[0.3em] ${THEME.color} italic`}>{THEME.label}</h1>
        <button onClick={() => setIsCartOpen(true)} className="relative group p-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-green-500 transition-colors">
                Panier ({cart.length})
            </span>
        </button>
      </header>

      <main className="max-w-7xl mx-auto w-full py-12 px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {products.map((product) => {
            const sel = selections[product.id];
            const qtyIndex = product.quantities.indexOf(Number(sel.qty));
            const priceList = product.prices[sel.variant] || product.prices.default || [];
            const currentTotal = priceList[qtyIndex] || 0;
            const displayImage = product.variants.find((v: any) => v.id === sel.variant)?.image || product.image;

            return (
              <div key={product.id} className="flex flex-col pt-10 relative group">
                {/* Image flottante avec animation améliorée */}
                <div className="h-56 w-full flex items-center justify-center relative -mb-12 z-20 pointer-events-none px-6 transition-transform duration-700 group-hover:scale-110">
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={displayImage} 
                      initial={{ opacity: 0, scale: 0.8, y: 10 }} 
                      animate={{ opacity: 1, scale: 1, y: 0 }} 
                      src={displayImage} 
                      className="max-h-full w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]" 
                    />
                  </AnimatePresence>
                </div>

                {/* Carte au design Premium */}
                <div className={`bg-white/[0.03] border border-white/10 rounded-[40px] p-8 pt-16 shadow-2xl flex flex-col transition-all duration-500 ${THEME.shadow}`}>
                  <h3 className={`font-black text-lg uppercase tracking-tighter mb-6 ${THEME.color}`}>{product.name}</h3>
                  
                  <div className="space-y-5">
                    {product.hasVariants && (
                       <div className="space-y-2">
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Modèle disponible</p>
                          <select 
                            value={sel.variant} 
                            onChange={(e) => updateSelection(product.id, 'variant', e.target.value)} 
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[11px] font-black uppercase text-white outline-none focus:border-green-500 transition-colors cursor-pointer"
                          >
                             {product.variants.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                          </select>
                       </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Quantité</p>
                      <select 
                        value={sel.qty} 
                        onChange={(e) => updateSelection(product.id, 'qty', Number(e.target.value))} 
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[11px] font-black uppercase text-white outline-none focus:border-green-500 transition-colors cursor-pointer"
                      >
                         {product.quantities.map((q: number) => <option key={q} value={q}>{q} exemplaires</option>)}
                      </select>
                    </div>
                    
                    {/* Zone Prix et Bouton */}
                    <div className="flex items-center justify-between pt-6 mt-2 border-t border-white/10">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-black text-3xl text-white tracking-tighter">{currentTotal.toFixed(2)}€</span>
                          <span className="text-[10px] text-green-500/60 font-black italic uppercase">HT</span>
                        </div>
                        <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest mt-1">
                            {(currentTotal / sel.qty).toFixed(2)}€ / unité
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => handleAddToCart(product)} 
                        className={`bg-white text-[#0f092e] px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest ${THEME.hover} hover:text-white transition-all active:scale-90 shadow-2xl`}
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
    </div>
  );
}