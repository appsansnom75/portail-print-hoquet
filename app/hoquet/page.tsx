'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const BUSINESS_CONFIG = [
  { id: 'pochette', name: 'Pochette à rabat', image: '/pochette.png', baseQty: 100, lots: [1], prices: { default: [25.99] } },
  { id: 'carte_visite', name: 'Carte de visite', image: '/carte.png', baseQty: 100, lots: [1], prices: { default: [8.25] } },
  { id: 'entete', name: 'En-tête de lettre', image: '/entete.png', baseQty: 500, lots: [1, 20, 30, 40, 60, 80], prices: { default: [12.85] } },
  { id: 'plaquette', name: 'Plaquette servicielle', image: '/plaquette.png', baseQty: 25, lots: [1, 2, 4], prices: { default: [19.45] } },
  { 
    id: 'flyer_detachable', 
    name: 'Flyer carte détachable', 
    image: '/flyer-detachable.png', 
    baseQty: 100, 
    hasVariants: true,
    variants: [{ id: '250g', name: 'Papier 250g' }, { id: '170g', name: 'Papier 170g' }],
    lotsByVariant: { '250g': [1, 2, 5, 10, 20, 50, 100, 150], '170g': [1] },
    prices: { '250g': [10.40], '170g': [9.35] } 
  },
  { 
    id: 'calendrier_2026', 
    name: 'Calendrier 2026', 
    image: '/calendrier-business.png', 
    baseQty: 500, 
    hasVariants: true,
    variants: [{ id: 'A4', name: 'Format A4' }, { id: 'A5', name: 'Format A5' }],
    lots: [1, 2, 4, 6, 10, 20, 30, 40],
    prices: { 'A4': [73.50], 'A5': [51.52] } 
  },
  { id: 'flyer_std', name: 'Flyer Business', image: '/flyer-std.png', baseQty: 25, lots: [1, 20, 30, 40], prices: { default: [19.45] } },
];

export default function BusinessPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selections, setSelections] = useState<any>(
    BUSINESS_CONFIG.reduce((acc, p) => ({
      ...acc, [p.id]: { lot: p.lots ? p.lots[0] : (p.lotsByVariant ? p.lotsByVariant['250g'][0] : 1), variant: p.hasVariants ? p.variants![0].id : 'default' }
    }), {})
  );

  const updateSelection = (id: string, field: string, val: any) => {
    setSelections((prev: any) => {
      const newSel = { ...prev, [id]: { ...prev[id], [field]: val } };
      if (field === 'variant' && BUSINESS_CONFIG.find(p => p.id === id)?.lotsByVariant) {
        newSel[id].lot = BUSINESS_CONFIG.find(p => p.id === id)!.lotsByVariant![val][0];
      }
      return newSel;
    });
  };

  const calculatePrice = (product: any) => {
    const sel = selections[product.id];
    const priceList = product.prices[sel.variant] || product.prices.default;
    return priceList[0] * sel.lot;
  };

  const addToCart = (product: any) => {
    const price = calculatePrice(product);
    const sel = selections[product.id];
    setCart([...cart, { id: Date.now(), name: product.name, variant: sel.variant !== 'default' ? sel.variant : '', quantity: sel.lot, totalPrice: price }]);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col relative">
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">← Retour</Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">Gamme Business</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-7xl mx-auto w-full py-12 px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {BUSINESS_CONFIG.map((product) => {
            const currentTotal = calculatePrice(product);
            const sel = selections[product.id];
            const availableLots = product.lotsByVariant ? product.lotsByVariant[sel.variant] : product.lots;

            return (
              <div key={product.id} className="flex flex-col group">
                <div className="h-48 w-full flex items-center justify-center relative mb-4">
                  <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain transition-all duration-500 group-hover:scale-105" />
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-xl uppercase tracking-tighter text-orange-500 leading-tight w-2/3">{product.name}</h3>
                    <span className="bg-white/10 text-white/60 text-[7px] font-black px-2 py-1 rounded uppercase border border-white/10">{product.baseQty} ex. / lot</span>
                  </div>

                  {product.hasVariants && (
                    <div className="mb-4">
                      <p className="text-[8px] font-black text-white/40 uppercase mb-2 tracking-widest">Type</p>
                      <div className="grid grid-cols-2 gap-1">
                        {product.variants?.map((v: any) => (
                          <button key={v.id} onClick={() => updateSelection(product.id, 'variant', v.id)} className={`p-2 rounded border text-[9px] font-black uppercase transition-all ${sel.variant === v.id ? 'border-orange-500 bg-orange-500/20 text-orange-400' : 'border-white/10 bg-white/5'}`}>{v.name}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <p className="text-[8px] font-black text-white/40 uppercase mb-2 tracking-widest">Nombre de lots</p>
                    <select value={sel.lot} onChange={(e) => updateSelection(product.id, 'lot', Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded p-2 text-[10px] font-black uppercase outline-none focus:border-orange-500">
                      {availableLots?.map((qty: number) => (
                        <option key={qty} value={qty} className="bg-[#0f092e]">{qty} {qty > 1 ? 'lots' : 'lot'} ({qty * product.baseQty} ex.)</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5 text-center">
                    <p className="font-black text-2xl mb-3 text-white">{currentTotal.toFixed(2)}€ <span className="text-[10px] text-white/40">HT</span></p>
                    <button onClick={() => addToCart(product)} className="w-full bg-white text-[#0f092e] py-3 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-lg active:scale-95">Ajouter au panier</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <div className="fixed bottom-8 left-8 z-[100]">
        <button onClick={() => setIsCartOpen(!isCartOpen)} className="bg-white text-[#0f092e] px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-4 hover:bg-orange-500 hover:text-white transition-all">
          Panier Business {cart.length > 0 && <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[9px]">{cart.length}</span>}
        </button>
        {isCartOpen && (
          <div className="absolute bottom-16 left-0 w-80 bg-white rounded-2xl shadow-2xl text-[#0f092e] overflow-hidden">
             <div className="bg-slate-100 p-4 border-b flex justify-between items-center"><span className="font-black text-[9px] uppercase tracking-widest text-slate-500">Panier</span><button onClick={() => setIsCartOpen(false)} className="text-red-500 font-black text-[9px]">FERMER</button></div>
             <div className="max-h-80 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? <p className="text-[10px] font-bold text-slate-400 uppercase text-center py-4 text-orange-500">Vide</p> : cart.map((item, idx) => (
                <div key={item.id} className="border-b border-slate-100 pb-3 flex justify-between items-start">
                  <div>
                    <p className="font-black text-[10px] uppercase leading-tight">{item.name}</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">{item.variant} • {item.quantity} lot(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[10px]">{item.totalPrice.toFixed(2)}€</p>
                    <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-[7px] text-red-500 font-black uppercase hover:underline">Suppr.</button>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-5 bg-slate-50 border-t">
                <div className="flex justify-between items-center mb-4"><span className="font-black text-[10px] uppercase text-slate-400">Total HT</span><span className="font-black text-xl text-orange-600">{cart.reduce((a, b) => a + b.totalPrice, 0).toFixed(2)}€</span></div>
                <button className="w-full bg-[#0f092e] text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-500 transition-all">Commander</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}