'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

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

const PRODUCTS_CONFIG = [
  ...ORIGINAL_PRODUCTS.map(p => ({ ...p, id: `${p.id}-1` })),
  ...ORIGINAL_PRODUCTS.map(p => ({ ...p, id: `${p.id}-2` })),
  ...ORIGINAL_PRODUCTS.map(p => ({ ...p, id: `${p.id}-3` })),
];

export default function PersoPage() {
  const { cart, addToCart: addItemToGlobalCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  useEffect(() => {
    PRODUCTS_CONFIG.forEach(p => {
      const imgDefault = new Image(); imgDefault.src = p.image;
      if (p.variants) p.variants.forEach(v => { const img = new Image(); img.src = v.image; });
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
        <h1 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">Personnalisation</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-7xl mx-auto w-full py-12 px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {PRODUCTS_CONFIG.map((product) => {
            const sel = selections[product.id];
            const qtyIndex = product.quantities.indexOf(sel.qty);
            const currentTotal = ((product.prices as any)[sel.variant] || (product.prices as any).default)[qtyIndex];
            const displayImage = product.variants?.find(v => v.id === sel.variant)?.image || product.image;

            return (
              <div key={product.id} className="flex flex-col pt-10 relative group"> 
                
                {/* IMAGE VOLANTE */}
                <div className="h-52 w-full flex items-center justify-center relative -mb-10 z-20 pointer-events-none px-4 transition-transform duration-500 group-hover:scale-110">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={displayImage}
                      src={displayImage}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="max-h-full w-full object-contain drop-shadow-[0_12px_15px_rgba(0,0,0,0.5)] will-change-transform"
                    />
                  </AnimatePresence>
                </div>

                {/* BOITE TOUJOURS OUVERTE */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col pt-14 border-blue-500/20 shadow-blue-500/5">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-base uppercase tracking-tighter text-blue-500 leading-tight">{product.name}</h3>
                    <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">Config</span>
                  </div>

                  <div className="space-y-6">
                    {product.hasVariants && (
                      <div>
                        <p className="text-[7px] font-black text-white/30 uppercase mb-2 tracking-widest">Modèle</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {product.variants?.map((v) => (
                            <button 
                              key={v.id} 
                              onClick={() => updateSelection(product.id, 'variant', v.id)} 
                              className={`p-2 rounded border text-[8px] font-black uppercase transition-all ${sel.variant === v.id ? 'border-blue-500 bg-blue-500 text-white' : 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10'}`}
                            >
                              {v.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-[7px] font-black text-white/30 uppercase mb-2 tracking-widest">Quantité</p>
                      <div className="relative">
                        <select 
                            value={sel.qty} 
                            onChange={(e) => updateSelection(product.id, 'qty', Number(e.target.value))} 
                            className="w-full bg-[#1a133d] border border-white/10 rounded p-3 text-[9px] font-black uppercase text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
                        >
                            {product.quantities.map((q: number) => <option key={q} value={q}>{q} ex.</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 text-[8px]">▼</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="text-left">
                          <p className="text-[7px] font-black text-white/20 uppercase mb-1 tracking-widest">Total HT</p>
                          <p className="font-black text-xl text-white tracking-tighter">{currentTotal.toFixed(2)}€</p>
                      </div>
                      <button 
                        onClick={() => handleAddToCart(product)} 
                        className="bg-white text-[#0f092e] px-8 py-3 rounded-xl font-black uppercase text-[8px] tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-lg shadow-white/5"
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