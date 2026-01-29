'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const PRODUCTS_CONFIG = [
  {
    id: 'flyer',
    name: 'Flyer Agence',
    image: '/flyer.png',
    hasVariants: true,
    variants: [
      { id: 'estim', name: 'Estimation', image: '/flyer-estim.png' }, 
      { id: 'garantie', name: 'Garantie', image: '/flyer-garantie.png' },
      { id: 'reprise', name: 'Reprise', image: '/flyer-reprise.png' }, 
      { id: 'noel', name: 'Noël', image: '/flyer-noel.png' }
    ],
    quantities: [500, 10000, 15000, 20000, 30000, 40000],
    prices: { default: [8.45, 169.00, 229.50, 302.00, 444.00, 552.00] }
  },
  {
    id: 'carte_visite',
    name: 'Carte de visite',
    image: '/carte-visite.png',
    quantities: [100, 200, 500],
    prices: { default: [8.25, 15.00, 30.00] }
  }
];

export default function PersoPage() {
  const { cart, addToCart: addItemToGlobalCart, removeFromCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // SÉCURITÉ : PRÉCHARGEMENT DES IMAGES
  useEffect(() => {
    PRODUCTS_CONFIG.forEach(p => {
      if (p.variants) {
        p.variants.forEach(v => {
          const img = new Image();
          img.src = v.image;
        });
      }
    });
  }, []);

  const [selections, setSelections] = useState<any>(
    PRODUCTS_CONFIG.reduce((acc, p) => ({
      ...acc, [p.id]: { qty: p.quantities[0], variant: p.hasVariants ? p.variants![0].id : 'default' }
    }), {})
  );

  const updateSelection = (prodId: string, field: string, value: any) => {
    setSelections((prev: any) => ({ ...prev, [prodId]: { ...prev[prodId], [field]: value } }));
  };

  const handleAddToCart = (product: any) => {
    const sel = selections[product.id];
    const qtyIndex = product.quantities.indexOf(sel.qty);
    const priceList = (product.prices as any)[sel.variant] || (product.prices as any).default;
    const totalPriceHT = priceList[qtyIndex];
    
    addItemToGlobalCart({
      id: `${product.id}-${sel.variant}`, 
      name: `${product.name}${product.hasVariants ? ` (${product.variants.find((v:any) => v.id === sel.variant)?.name})` : ""}`,
      price: totalPriceHT / Number(sel.qty), 
      qty: Number(sel.qty), 
      category: 'Impression'
    });
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col relative overflow-x-hidden">
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">← Retour</Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 italic">Personnalisation</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-7xl mx-auto w-full py-20 px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-28">
          {PRODUCTS_CONFIG.map((product) => {
            const sel = selections[product.id];
            const qtyIndex = product.quantities.indexOf(sel.qty);
            const currentTotal = ((product.prices as any)[sel.variant] || (product.prices as any).default)[qtyIndex];
            const variantImage = product.variants?.find(v => v.id === sel.variant)?.image;
            const displayImage = variantImage || product.image;

            return (
              <div key={product.id} className="flex flex-col group pt-16"> 
                
                {/* ZONE IMAGE : TAILLE LÉGÈREMENT AUGMENTÉE (W-FULL) */}
                <div className="h-64 w-full flex items-center justify-center relative -mb-12 z-10 pointer-events-none">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={displayImage}
                      src={displayImage}
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -40, opacity: 0 }}
                      // On utilise Tween au lieu de Spring pour une fluidité plus "cinématique" sans rebonds
                      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} 
                      className="max-h-full w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] will-change-transform"
                    />
                  </AnimatePresence>
                </div>

                {/* BOITE DE DESIGN (Style Business) */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full pt-16">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-black text-xl uppercase tracking-tighter text-blue-500 leading-tight w-2/3 italic">{product.name}</h3>
                    <span className="bg-white/10 text-white/60 text-[7px] font-black px-2 py-1 rounded uppercase border border-white/10 italic tracking-widest">Premium</span>
                  </div>

                  {product.hasVariants && (
                    <div className="mb-6">
                      <p className="text-[8px] font-black text-white/40 uppercase mb-2 tracking-widest">Modèle</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {product.variants?.map((v) => (
                          <button 
                            key={v.id} 
                            onClick={() => updateSelection(product.id, 'variant', v.id)} 
                            className={`p-2.5 rounded border text-[9px] font-black uppercase transition-all ${sel.variant === v.id ? 'border-blue-500 bg-blue-500 text-white' : 'border-white/10 bg-white/5 text-white/40'}`}
                          >
                            {v.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-8">
                    <p className="text-[8px] font-black text-white/40 uppercase mb-2 tracking-widest">Quantité</p>
                    <select 
                      value={sel.qty} 
                      onChange={(e) => updateSelection(product.id, 'qty', Number(e.target.value))} 
                      className="w-full bg-[#1a133d] border border-white/10 rounded p-3 text-[10px] font-black uppercase outline-none focus:border-blue-500 text-white appearance-none cursor-pointer"
                    >
                      {product.quantities.map((q: number) => (
                        <option key={q} value={q} className="bg-[#0f092e]">{q} exemplaires</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="text-left">
                        <p className="text-[7px] font-black text-white/20 uppercase tracking-widest mb-1">Total HT</p>
                        <p className="font-black text-2xl text-white tracking-tighter">{currentTotal.toFixed(2)}€</p>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(product)} 
                      className="bg-white text-[#0f092e] px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* PANIER (Code identique) */}
    </div>
  );
}