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
  const { cart, addToCart: addItemToGlobalCart, removeFromCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [openConfigId, setOpenConfigId] = useState<string | null>(null);
  
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
        {/* GAP-Y RÉDUIT À 12 POUR RAPPROCHER LES LIGNES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
          {PRODUCTS_CONFIG.map((product) => {
            const sel = selections[product.id];
            const qtyIndex = product.quantities.indexOf(sel.qty);
            const currentTotal = ((product.prices as any)[sel.variant] || (product.prices as any).default)[qtyIndex];
            const displayImage = product.variants?.find(v => v.id === sel.variant)?.image || product.image;
            const isOpen = openConfigId === product.id;

            return (
              <div key={product.id} className="flex flex-col pt-10 relative group"> 
                
                {/* ZONE IMAGE : HAUTEUR RÉDUITE POUR RESSERRER LE TOUT */}
                <div className="h-52 w-full flex items-center justify-center relative -mb-10 z-20 pointer-events-none px-4 transition-transform duration-500 group-hover:scale-110">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={displayImage}
                      src={displayImage}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="max-h-full w-full object-contain drop-shadow-[0_12px_15px_rgba(0,0,0,0.5)]"
                    />
                  </AnimatePresence>
                </div>

                {/* LA BOX */}
                <div className={`bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col pt-14 transition-all duration-300 ${isOpen ? 'ring-2 ring-blue-500/50 bg-white/[0.05]' : ''}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-base uppercase tracking-tighter text-blue-500 leading-tight">{product.name}</h3>
                    {!isOpen && (
                        <button 
                            onClick={() => setOpenConfigId(product.id)}
                            className="text-[8px] font-black uppercase bg-blue-500 px-4 py-2 rounded-full hover:bg-blue-400 transition-all shadow-lg active:scale-90"
                        >
                            Configurer
                        </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-6 pt-4 border-t border-white/5 mt-2">
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
                            <select 
                                value={sel.qty} 
                                onChange={(e) => updateSelection(product.id, 'qty', Number(e.target.value))} 
                                className="w-full bg-[#1a133d] border border-white/10 rounded p-3 text-[9px] font-black uppercase text-white outline-none focus:border-blue-500 appearance-none"
                            >
                                {product.quantities.map((q: number) => <option key={q} value={q}>{q} ex.</option>)}
                            </select>
                          </div>

                          <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="text-left">
                                <p className="text-[7px] font-black text-white/20 uppercase mb-1">Total HT</p>
                                <p className="font-black text-xl text-white tracking-tighter">{currentTotal.toFixed(2)}€</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setOpenConfigId(null)} className="bg-white/5 border border-white/10 text-white/40 px-3 py-3 rounded-xl font-black uppercase text-[8px] hover:text-white transition-all">Annuler</button>
                                <button onClick={() => handleAddToCart(product)} className="bg-white text-[#0f092e] px-5 py-3 rounded-xl font-black uppercase text-[8px] tracking-widest hover:bg-blue-600 hover:text-white transition-all">Ajouter</button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}