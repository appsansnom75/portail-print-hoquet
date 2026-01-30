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
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">← Retour</Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">Personnalisation</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-7xl mx-auto w-full py-12 px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
          {PRODUCTS_CONFIG.map((product) => {
            const sel = selections[product.id];
            const qtyIndex = product.quantities.indexOf(sel.qty);
            const currentTotal = ((product.prices as any)[sel.variant] || (product.prices as any).default)[qtyIndex];
            const displayImage = product.variants?.find(v => v.id === sel.variant)?.image || product.image;

            return (
              <div key={product.id} className="flex flex-col pt-10 relative group"> 
                <div className="h-48 w-full flex items-center justify-center relative -mb-8 z-20 pointer-events-none px-6 transition-transform duration-500 group-hover:scale-105">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={displayImage}
                      src={displayImage}
                      initial={{ x: 15, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -15, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="max-h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.5)]"
                    />
                  </AnimatePresence>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col pt-12">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-black text-[15px] uppercase tracking-tighter text-blue-500 leading-tight w-2/3">{product.name}</h3>
                    <div className="bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded">
                        <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest text-center">Perso</span>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {product.hasVariants && (
                      <div className="space-y-2">
                        <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">Modèle</p>
                        <div className="grid grid-cols-2 gap-1">
                          {product.variants?.map((v) => (
                            <button key={v.id} onClick={() => updateSelection(product.id, 'variant', v.id)} className={`py-2 rounded text-[8px] font-black uppercase transition-all border ${sel.variant === v.id ? 'border-blue-500 bg-blue-500 text-white' : 'border-white/5 bg-white/5 text-white/40'}`}>
                              {v.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">Quantité</p>
                      <select value={sel.qty} onChange={(e) => updateSelection(product.id, 'qty', Number(e.target.value))} className="w-full bg-[#16103a] border border-white/5 rounded p-2.5 text-[9px] font-black uppercase text-white outline-none focus:border-blue-500 appearance-none cursor-pointer">
                        {product.quantities.map((q: number) => <option key={q} value={q}>{q} ex.</option>)}
                      </select>
                    </div>
                    <div className="flex items-center justify-between pt-5 border-t border-white/5">
                      <div className="flex flex-col text-left">
                          <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Total HT</span>
                          <span className="font-black text-lg text-white tracking-tighter">{currentTotal.toFixed(2)}€</span>
                      </div>
                      <button onClick={() => handleAddToCart(product)} className="bg-white text-[#0f092e] px-6 py-3 rounded-xl font-black uppercase text-[8px] tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-lg">Ajouter</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* PANIER FLOTTANT ADAPTÉ AU DESIGN BLEU */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <button onClick={() => setIsCartOpen(!isCartOpen)} className="bg-white text-[#0f092e] px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-4 hover:bg-blue-600 hover:text-white transition-all">
          Panier Perso {cart.length > 0 && <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[9px]">{cart.length}</span>}
        </button>
        
        {isCartOpen && (
          <div className="absolute bottom-16 left-0 w-80 bg-white rounded-2xl shadow-2xl text-[#0f092e] overflow-hidden border border-slate-200">
             <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
               <span className="font-black text-[9px] uppercase tracking-widest text-slate-500">Récapitulatif</span>
               <button onClick={() => setIsCartOpen(false)} className="text-red-500 font-black text-[9px] hover:scale-110 transition-transform">FERMER</button>
             </div>
             
             <div className="max-h-80 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <p className="text-[10px] font-bold text-slate-400 uppercase text-center py-8 italic tracking-widest">Votre panier est vide</p>
              ) : cart.map((item) => (
                <div key={item.id} className="border-b border-slate-100 pb-3 flex justify-between items-start last:border-0">
                  <div>
                    <p className="font-black text-[10px] uppercase leading-tight text-blue-600">{item.name}</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">{item.qty} exemplaires</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[10px]">{(item.price * item.qty).toFixed(2)}€</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-[7px] text-red-500 font-black uppercase hover:underline mt-1">Suppr.</button>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="p-5 bg-slate-50 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-black text-[10px] uppercase text-slate-400">Total HT</span>
                  <span className="font-black text-xl text-blue-600 tracking-tighter">{cart.reduce((a, b) => a + (b.price * b.qty), 0).toFixed(2)}€</span>
                </div>
                <Link href="/panier" className="block text-center w-full bg-[#0f092e] text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">
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