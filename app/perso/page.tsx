'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

const PRODUCTS_CONFIG = [
  {
    id: 'flyer',
    name: 'Flyer Agence',
    image: '/flyer.png',
    hasVariants: true,
    variants: [
      { id: 'estim', name: 'Estimation générique' }, 
      { id: 'garantie', name: 'Garantie revente' },
      { id: 'reprise', name: 'Ouverture / Reprise' }, 
      { id: 'noel', name: 'Noël 2026' }
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
  const { cart, addToCart: addItemToGlobalCart } = useCart();
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
    <div className="min-h-screen bg-[#0f092e] text-white p-8">
      {/* Header Uniforme */}
      <header className="max-w-7xl mx-auto mb-16 flex justify-between items-center">
        <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 hover:opacity-100 transition-opacity">
          ← Retour
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-blue-500">
          Personnalisation
        </h1>
      </header>

      {/* Grille de Produits */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {PRODUCTS_CONFIG.map((product) => {
          const sel = selections[product.id];
          const qtyIndex = product.quantities.indexOf(sel.qty);
          const currentTotal = ((product.prices as any)[sel.variant] || (product.prices as any).default)[qtyIndex];

          return (
            <div key={product.id} className="group">
              <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] hover:border-blue-500/50 transition-all duration-500 flex flex-col h-full">
                <div className="h-48 flex items-center justify-center mb-8 group-hover:scale-105 transition-transform duration-500">
                   <img src={product.image} alt={product.name} className="max-h-full object-contain" />
                </div>
                
                <h3 className="text-xl font-black uppercase tracking-tighter mb-6">{product.name}</h3>
                
                <div className="space-y-3 mb-8">
                  {product.hasVariants && (
                     <select 
                      value={sel.variant} 
                      onChange={(e) => updateSelection(product.id, 'variant', e.target.value)}
                      className="w-full bg-white/10 p-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none border border-transparent focus:border-blue-500/50 transition-all"
                     >
                       {product.variants?.map(v => <option key={v.id} value={v.id} className="bg-[#0f092e]">{v.name}</option>)}
                     </select>
                  )}

                  <select 
                    value={sel.qty} 
                    onChange={(e) => updateSelection(product.id, 'qty', Number(e.target.value))}
                    className="w-full bg-white/10 p-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none border border-blue-500/30 text-blue-400"
                  >
                    {product.quantities.map(q => <option key={q} value={q} className="bg-[#0f092e]">{q} exemplaires</option>)}
                  </select>
                </div>

                <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Total HT</p>
                    <p className="text-2xl font-black tracking-tighter">{currentTotal.toFixed(2)}€</p>
                  </div>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-blue-600 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Panier Flottant Style Glassmorphism */}
      {isCartOpen && (
        <div className="fixed bottom-8 right-8 w-80 bg-white text-black rounded-[32px] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 bg-slate-50 flex justify-between items-center border-b border-slate-100">
            <span className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-400">Panier</span>
            <button onClick={() => setIsCartOpen(false)} className="bg-slate-200 hover:bg-red-100 hover:text-red-500 w-8 h-8 rounded-full flex items-center justify-center transition-all">
              <span className="text-xs font-bold">✕</span>
            </button>
          </div>
          
          <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-start group">
                <div className="w-2/3">
                  <p className="font-black text-[9px] uppercase leading-tight tracking-wide">{item.name}</p>
                  <p className="text-blue-600 font-black text-xs mt-1">{item.qty} ex.</p>
                </div>
                <p className="font-black text-[10px]">{(item.price * item.qty).toFixed(2)}€</p>
              </div>
            ))}
          </div>

          <div className="p-6 pt-0">
            <Link href="/panier" className="block w-full bg-blue-600 text-white text-center py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-black transition-all shadow-md">
              Commander
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}