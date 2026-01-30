'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

// CONFIGURATION DES PRODUITS
const ORIGINAL_PRODUCTS = [
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

// DUPLICATION POUR REMPLIR LA PAGE (6 PRODUITS)
const PRODUCTS_CONFIG = [
  ...ORIGINAL_PRODUCTS.map(p => ({ ...p, id: `${p.id}-1` })),
  ...ORIGINAL_PRODUCTS.map(p => ({ ...p, id: `${p.id}-2` })),
  ...ORIGINAL_PRODUCTS.map(p => ({ ...p, id: `${p.id}-3` })),
];

export default function PersoPage() {
  const { cart, addToCart: addItemToGlobalCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Préchargement des assets pour la fluidité
  useEffect(() => {
    PRODUCTS_CONFIG.forEach(p => {
      const img = new Image(); img.src = p.image;
      if (p.variants) p.variants.forEach(v => { const i = new Image(); i.src = v.image; });
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
      {/* HEADER FIXE */}
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">← Retour</Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">Personnalisation</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-7xl mx-auto w-full py-12 px-6 pb-40">
        {/* GRILLE RESSERRÉE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
          {PRODUCTS_CONFIG.map((product) => {
            const sel = selections[product.id];
            const qtyIndex = product.quantities.indexOf(sel.qty);
            const currentTotal = ((product.prices as any)[sel.variant] || (product.prices as any).default)[qtyIndex];
            const displayImage = product.variants?.find(v => v.id === sel.variant)?.image || product.image;

            return (
              <div key={product.id} className="flex flex-col pt-10 relative group"> 
                
                {/* IMAGE FLOTTANTE SANS FOND */}
                <div className="h-48 w-full flex items-center justify-center relative -mb-8 z-20 pointer-events-none px-6 transition-transform duration-500 group-hover:scale-105">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={displayImage}
                      src={displayImage}
                      initial={{ x: 15, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -15, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="max-h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.5)] will-change-transform"
                    />
                  </AnimatePresence>
                </div>

                {/* CONTENEUR CONFIGURATEUR */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col pt-12 transition-all hover:bg-white/[0.05] hover:border-blue-500/30">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-black text-[15px] uppercase tracking-tighter text-blue-500 leading-tight w-2/3">{product.name}</h3>
                    <div className="bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded">
                        <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">Premium</span>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {product.hasVariants && (
                      <div className="space-y-2">
                        <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">Modèle</p>
                        <div className="grid grid-cols-2 gap-1">
                          {product.variants?.map((v) => (
                            <button 
                              key={v.id} 
                              onClick={() => updateSelection(product.id, 'variant', v.id)} 
                              className={`py-2 rounded text-[8px] font-black uppercase transition-all border ${sel.variant === v.id ? 'border-blue-500 bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-white/5 bg-white/5 text-white/40 hover:border-white/20'}`}
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
                            className="w-full bg-[#16103a] border border-white/5 rounded p-2.5 text-[9px] font-black uppercase text-white outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-inner"
                        >
                            {product.quantities.map((q: number) => <option key={q} value={q}>{q} exemplaires</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 text-[8px]">▼</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-white/5">
                      <div className="flex flex-col">
                          <span className="text-[7px] font-black text-white/20 uppercase">Total HT</span>
                          <span className="font-black text-lg text-white tracking-tighter">{currentTotal.toFixed(2)}€</span>
                      </div>
                      <button 
                        onClick={() => handleAddToCart(product)} 
                        className="bg-white text-[#0f092e] px-6 py-3 rounded-xl font-black uppercase text-[8px] tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-lg"
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