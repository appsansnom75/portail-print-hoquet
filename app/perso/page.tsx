'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface ProductVariant { id: string; name: string; }
interface ProductConfig {
  id: string;
  name: string;
  image: string;
  hasVariants?: boolean;
  variants?: ProductVariant[];
  quantities: number[];
  prices: { [key: string]: number[]; default: number[]; };
}

const PRODUCTS_CONFIG: ProductConfig[] = [
  {
    id: 'flyer',
    name: 'Flyer Agence',
    image: '/flyer.png',
    hasVariants: true,
    variants: [
      { id: 'estim', name: 'Estimation générique' },
      { id: 'noel', name: 'Noël 2026' },
      { id: 'reprise', name: 'Ouverture / Reprise' }
    ],
    quantities: [500, 10000, 15000, 20000],
    prices: { default: [8.45, 169.00, 229.50, 302.00] }
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
  const { cart, addToCart, clearCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [selections, setSelections] = useState<{ [key: string]: { qty: number; variant: string } }>(
    PRODUCTS_CONFIG.reduce((acc, p) => ({
      ...acc, 
      [p.id]: { qty: p.quantities[0], variant: p.hasVariants ? p.variants![0].id : 'default' }
    }), {})
  );

  const handleAddToCart = (product: ProductConfig) => {
    const sel = selections[product.id];
    const qtyIndex = product.quantities.indexOf(sel.qty);
    const priceList = product.prices[sel.variant] || product.prices.default;
    const totalPriceHT = priceList[qtyIndex];
    
    const variantName = product.hasVariants 
      ? product.variants?.find(v => v.id === sel.variant)?.name 
      : "";

    addToCart({
      id: `${product.id}-${sel.variant}`, 
      name: `${product.name}${variantName ? ` (${variantName})` : ""}`,
      price: totalPriceHT / sel.qty, 
      qty: Number(sel.qty), // VOLUME RÉEL ENVOYÉ
      category: 'Impression'
    });
    
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto mb-8">
        <button 
          onClick={() => { localStorage.clear(); clearCart(); window.location.reload(); }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
        >
          🔄 RESET CACHE & PANIER
        </button>
      </div>

      <header className="max-w-7xl mx-auto mb-12 flex justify-between items-center border-b border-white/10 pb-6">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100">← Retour</Link>
        <h1 className="text-xl font-black uppercase tracking-tighter text-blue-400">Configuration v2.0</h1>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PRODUCTS_CONFIG.map((product) => {
          const sel = selections[product.id];
          const qtyIndex = product.quantities.indexOf(sel.qty);
          const currentTotal = (product.prices[sel.variant] || product.prices.default)[qtyIndex];

          return (
            <div key={product.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col">
              <div className="h-40 flex items-center justify-center mb-6 border-b border-white/5 pb-4">
                 <img src={product.image} alt={product.name} className="max-h-full object-contain" />
              </div>
              <h3 className="text-lg font-black uppercase mb-6 tracking-tight text-blue-500">{product.name}</h3>
              <div className="space-y-4 mb-8">
                {product.hasVariants && (
                  <select 
                    value={sel.variant}
                    onChange={(e) => setSelections(p => ({...p, [product.id]: {...p[product.id], variant: e.target.value}}))}
                    className="w-full bg-white/10 p-3 rounded-xl text-xs font-bold outline-none cursor-pointer"
                  >
                    {product.variants?.map(v => <option key={v.id} value={v.id} className="bg-[#0f092e]">{v.name}</option>)}
                  </select>
                )}
                <select 
                  value={sel.qty}
                  onChange={(e) => setSelections(p => ({...p, [product.id]: {...p[product.id], qty: Number(e.target.value)}}))}
                  className="w-full bg-white/10 p-3 rounded-xl text-xs font-bold outline-none border border-blue-500/30 cursor-pointer"
                >
                  {product.quantities.map(q => <option key={q} value={q} className="bg-[#0f092e]">{q} ex.</option>)}
                </select>
              </div>
              <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center">
                <span className="text-2xl font-black tracking-tighter">{currentTotal.toFixed(2)}€ HT</span>
                <button onClick={() => handleAddToCart(product)} className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] hover:bg-blue-500 hover:text-white transition-all">Ajouter</button>
              </div>
            </div>
          );
        })}
      </div>

      {isCartOpen && (
        <div className="fixed bottom-8 right-8 w-80 bg-white text-black rounded-3xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 bg-slate-100 flex justify-between items-center border-b">
            <span className="font-black text-[10px] uppercase tracking-widest">Panier Actuel</span>
            <button onClick={() => setIsCartOpen(false)} className="text-red-500 font-bold">✕</button>
          </div>
          <div className="p-4 max-h-60 overflow-y-auto space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="text-[9px] font-bold uppercase w-2/3">{item.name}</div>
                <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">{item.qty} ex.</div>
              </div>
            ))}
          </div>
          <div className="p-4">
            <Link href="/panier" className="block w-full bg-[#0f092e] text-white text-center py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">Voir le panier</Link>
          </div>
        </div>
      )}
    </div>
  );
}