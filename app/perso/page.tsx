'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';

// --- CONFIGURATION DE TOUS LES PRODUITS ---
const PRODUCTS_CONFIG = [
  {
    id: 'carte_visite',
    name: 'Carte de visite',
    image: '/carte-visite.png',
    baseQty: 100,
    lots: [1],
    prices: { default: [8.25] }
  },
  {
    id: 'entete_lettre',
    name: 'En-tête de lettre',
    image: '/entete-lettre.png',
    baseQty: 500,
    lots: [1, 20, 30, 40, 60, 80],
    prices: { default: [12.85, 8.00, 7.65, 7.55, 7.40, 6.90] }
  },
  {
    id: 'flyer',
    name: 'Flyer',
    image: '/flyer.png',
    baseQty: 500,
    lots: [1, 20, 30, 40, 60, 80],
    prices: { default: [8.45, 8.00, 7.65, 7.55, 7.40, 6.90] }
  },
  {
    id: 'calendrier',
    name: 'Calendrier',
    image: '/calendrier.png',
    baseQty: 500,
    hasVariants: true,
    variants: [
      { id: 'A4', name: 'Format A4' },
      { id: 'A5', name: 'Format A5' }
    ],
    lots: [1, 2, 4, 6, 10, 20, 30, 40],
    prices: {
      'A4': [73.50, 55.13, 49.35, 47.25, 45.68, 44.57, 44.17, 43.97],
      'A5': [51.52, 37.45, 32.10, 26.75, 19.25, 17.30, 16.50, 15.39]
    }
  },
  {
    id: 'carte_corresp',
    name: 'Carte de correspondance',
    image: '/carte-corresp.png',
    baseQty: 100,
    lots: [1],
    prices: { default: [9.90] }
  },
  {
    id: 'enveloppe',
    name: 'Enveloppe',
    image: '/enveloppe.png',
    baseQty: 500,
    hasVariants: true,
    variants: [
      { id: 'sans', name: 'Sans personnalisation' },
      { id: 'avec', name: 'Avec personnalisation' }
    ],
    lots: [1],
    prices: {
      'sans': [21.30],
      'avec': [48.50]
    }
  },
  {
    id: 'memo_climat',
    name: 'Mémo climat',
    image: '/memo-climat.png',
    baseQty: 100,
    lots: [1, 2, 3, 4, 10, 20, 30, 40],
    prices: { default: [40.00, 35.00, 30.00, 25.00, 22.00, 18.00, 14.00, 10.00] }
  }
];

export default function PersoPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // État pour stocker les choix de l'utilisateur pour chaque produit
  const [selections, setSelections] = useState<any>(
    PRODUCTS_CONFIG.reduce((acc, p) => ({
      ...acc, 
      [p.id]: { 
        lot: p.lots[0], 
        variant: p.hasVariants ? p.variants[0].id : 'default' 
      }
    }), {})
  );

  const updateSelection = (prodId: string, field: string, value: any) => {
    setSelections((prev: any) => ({
      ...prev,
      [prodId]: { ...prev[prodId], [field]: value }
    }));
  };

  const calculatePrice = (product: any) => {
    const sel = selections[product.id];
    const lotIndex = product.lots.indexOf(sel.lot);
    const priceList = product.prices[sel.variant] || product.prices.default;
    return (priceList[lotIndex] || priceList[0]) * sel.lot;
  };

  const addToCart = (product: any) => {
    const price = calculatePrice(product);
    const sel = selections[product.id];
    const variantName = product.hasVariants ? product.variants.find((v:any) => v.id === sel.variant)?.name : "";

    const newItem = {
      id: Date.now(),
      name: product.name,
      variant: variantName,
      quantity: sel.lot,
      baseQty: product.baseQty,
      totalPrice: price
    };
    setCart([...cart, newItem]);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => setCart(cart.filter(item => item.id !== id));
  const totalPriceHT = cart.reduce((acc, item) => acc + item.totalPrice, 0);

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col relative">
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">← Retour</Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em]">Catalogue Impression</h1>
        <div className="w-20"></div>
      </header>

      <main className="max-w-7xl mx-auto w-full py-12 px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {PRODUCTS_CONFIG.map((product) => {
            const currentTotal = calculatePrice(product);
            const sel = selections[product.id];

            return (
              <div key={product.id} className="flex flex-col group">
                <div className="h-48 w-full flex items-center justify-center relative mb-4">
                  <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain drop-shadow-2xl transform group-hover:scale-105 transition-all" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  <span className="absolute -z-10 text-[40px] font-black text-white/[0.02] uppercase select-none">{product.name}</span>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full">
                  <h3 className="font-black text-xl uppercase tracking-tight mb-4 text-blue-500">{product.name}</h3>
                  
                  {/* Variantes */}
                  {product.hasVariants && (
                    <div className="mb-4">
                      <p className="text-[8px] font-black text-white/30 uppercase mb-2">Options</p>
                      <div className="grid grid-cols-1 gap-1">
                        {product.variants.map((v: any) => (
                          <button 
                            key={v.id}
                            onClick={() => updateSelection(product.id, 'variant', v.id)}
                            className={`p-2 rounded border text-[9px] font-black uppercase transition-all ${sel.variant === v.id ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-white/10 bg-white/5'}`}
                          >
                            {v.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lots */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <p className="text-[8px] font-black text-white/30 uppercase">Nombre de lots</p>
                      <p className="text-[8px] font-black text-blue-400 uppercase">Unités/lot: {product.baseQty}</p>
                    </div>
                    <select 
                      value={sel.lot} 
                      onChange={(e) => updateSelection(product.id, 'lot', Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded p-2 text-[10px] font-black uppercase outline-none focus:border-blue-500"
                    >
                      {product.lots.map(qty => <option key={qty} value={qty} className="bg-[#0f092e]">{qty} {qty > 1 ? 'lots' : 'lot'}</option>)}
                    </select>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5">
                    <p className="text-center font-black text-lg mb-4">{currentTotal.toFixed(2)}€ HT</p>
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full bg-white text-[#0f092e] py-3 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all"
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

      {/* --- PANIER --- */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <button onClick={() => setIsCartOpen(!isCartOpen)} className="bg-white text-[#0f092e] px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-3">
          Mon Panier {cart.length > 0 && <span className="bg-blue-500 text-white px-2 py-0.5 rounded">{cart.length}</span>}
        </button>
        {isCartOpen && (
          <div className="absolute bottom-16 left-0 w-80 bg-white rounded-xl shadow-2xl text-[#0f092e] overflow-hidden">
            <div className="bg-slate-100 p-3 border-b flex justify-between items-center">
              <span className="font-black text-[9px] uppercase">Récapitulatif HT</span>
              <button onClick={() => setIsCartOpen(false)} className="text-red-500 font-black text-[9px]">X</button>
            </div>
            <div className="max-h-64 overflow-y-auto p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="border-b border-slate-100 pb-2 flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-black text-[10px] uppercase leading-none">{item.name}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase mt-1">{item.variant} - {item.quantity} lot(s)</span>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-[10px]">{item.totalPrice.toFixed(2)}€</div>
                    <button onClick={() => removeFromCart(item.id)} className="text-[7px] text-red-500 font-black uppercase">Suppr.</button>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-4 bg-slate-50 border-t">
                <div className="flex justify-between mb-3"><span className="font-black text-[9px] uppercase">Total</span><span className="font-black text-lg text-blue-600">{totalPriceHT.toFixed(2)}€ HT</span></div>
                <button className="w-full bg-[#0f092e] text-white py-3 rounded font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all">Commander</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}