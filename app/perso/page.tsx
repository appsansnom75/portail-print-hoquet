'use client';
import React, { useState } from 'react';
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
    const quantityToSend = Number(sel.qty);

    addItemToGlobalCart({
      id: `${product.id}-${sel.variant}`, 
      name: `${product.name}${product.hasVariants ? ` (${product.variants.find((v:any) => v.id === sel.variant)?.name})` : ""}`,
      price: totalPriceHT / quantityToSend, 
      qty: quantityToSend, 
      category: 'Impression'
    });
    
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col relative overflow-x-hidden">
      {/* HEADER IDENTIQUE AUX AUTRES PAGES */}
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">← Retour</Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 italic">Personnalisation</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-7xl mx-auto w-full py-20 px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
          {PRODUCTS_CONFIG.map((product) => {
            const sel = selections[product.id];
            const qtyIndex = product.quantities.indexOf(sel.qty);
            const currentTotal = ((product.prices as any)[sel.variant] || (product.prices as any).default)[qtyIndex];
            const variantImage = product.variants?.find(v => v.id === sel.variant)?.image;
            const displayImage = variantImage || product.image;

            return (
              <div key={product.id} className="flex flex-col">
                
                {/* L'IMAGE : FLOTTANTE, SANS CADRE, TAILLE BOOSTÉE */}
                <div className="h-[450px] w-full flex items-center justify-center relative mb-12">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={displayImage}
                      src={displayImage}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -50, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="h-full w-auto object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.6)]"
                      style={{ transform: 'scale(1.5)' }} // Agrandissement 
                    />
                  </AnimatePresence>
                </div>

                {/* INFOS PRODUIT : STYLE ORIGINAL */}
                <div className="space-y-8">
                  <h3 className="font-black text-4xl uppercase tracking-tighter italic text-white leading-none">{product.name}</h3>

                  {product.hasVariants && (
                    <div className="space-y-3">
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Modèle</p>
                      <div className="flex flex-wrap gap-2">
                        {product.variants?.map((v) => (
                          <button 
                            key={v.id} 
                            onClick={() => updateSelection(product.id, 'variant', v.id)} 
                            className={`px-6 py-3 rounded-full border text-[9px] font-black uppercase transition-all ${sel.variant === v.id ? 'border-blue-500 bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'border-white/10 bg-white/5 text-white/40 hover:border-white/30'}`}
                          >
                            {v.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Quantité</p>
                    <select 
                      value={sel.qty} 
                      onChange={(e) => updateSelection(product.id, 'qty', Number(e.target.value))} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-black uppercase outline-none focus:border-blue-500 transition-all appearance-none text-white"
                    >
                      {product.quantities.map((q: number) => (
                        <option key={q} value={q} className="bg-[#0f092e] text-white">{q} exemplaires</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                    <div>
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Total HT</p>
                        <p className="font-black text-4xl text-white tracking-tighter">{currentTotal.toFixed(2)}€</p>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(product)} 
                      className="bg-white text-[#0f092e] px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95"
                    >
                      Ajouter au panier
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* PANIER (Garde ton code actuel ici) */}
    </div>
  );
}