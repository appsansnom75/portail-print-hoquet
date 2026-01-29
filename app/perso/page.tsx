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
      { id: 'estim', name: 'Estimation' }, 
      { id: 'garantie', name: 'Garantie' },
      { id: 'reprise', name: 'Reprise' }, 
      { id: 'noel', name: 'Noël' }
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
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col relative">
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">← Retour</Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">Personnalisation</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-7xl mx-auto w-full py-12 px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {PRODUCTS_CONFIG.map((product) => {
            const sel = selections[product.id];
            const qtyIndex = product.quantities.indexOf(sel.qty);
            const currentTotal = ((product.prices as any)[sel.variant] || (product.prices as any).default)[qtyIndex];

            return (
              <div key={product.id} className="flex flex-col group">
                <div className="h-48 w-full flex items-center justify-center relative mb-4">
                  <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain transition-all duration-500 group-hover:scale-105" />
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-black text-xl uppercase tracking-tighter text-blue-500 leading-tight w-2/3">{product.name}</h3>
                  </div>

                  {product.hasVariants && (
                    <div className="mb-6">
                      <p className="text-[8px] font-black text-white/40 uppercase mb-2 tracking-widest">Modèle</p>
                      <div className="grid grid-cols-2 gap-1">
                        {product.variants?.map((v) => (
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

                  <div className="mb-8">
                    <p className="text-[8px] font-black text-white/40 uppercase mb-2 tracking-widest">Quantité</p>
                    <select 
                      value={sel.qty} 
                      onChange={(e) => updateSelection(product.id, 'qty', Number(e.target.value))} 
                      className="w-full bg-white/5 border border-white/10 rounded p-3 text-[10px] font-black uppercase outline-none focus:border-blue-500 transition-colors"
                    >
                      {product.quantities.map((q: number) => (
                        <option key={q} value={q} className="bg-[#0f092e]">{q} exemplaires</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/5 text-center">
                    <p className="font-black text-2xl mb-4 text-white">{currentTotal.toFixed(2)}€ <span className="text-[10px] text-white/40 font-normal">HT</span></p>
                    <button 
                      onClick={() => handleAddToCart(product)} 
                      className="w-full bg-white text-[#0f092e] py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg active:scale-95"
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

      {/* PANIER FLOTTANT (Style Hoquet sans mention de lot) */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <button 
          onClick={() => setIsCartOpen(!isCartOpen)} 
          className="bg-white text-[#0f092e] px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-4 hover:bg-blue-500 hover:text-white transition-all"
        >
          Mon Panier {cart.length > 0 && <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-[9px]">{cart.length}</span>}
        </button>

        {isCartOpen && (
          <div className="absolute bottom-16 left-0 w-80 bg-white rounded-2xl shadow-2xl text-[#0f092e] overflow-hidden">
             <div className="bg-slate-100 p-4 border-b flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                <span>Panier</span>
                <button onClick={() => setIsCartOpen(false)} className="text-red-500">Fermer</button>
             </div>
             
             <div className="max-h-80 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <p className="text-[10px] font-bold text-slate-400 uppercase text-center py-4">Vide</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="border-b border-slate-100 pb-3 flex justify-between items-start">
                    <div>
                      <p className="font-black text-[10px] uppercase leading-tight w-40">{item.name}</p>
                      <p className="text-[9px] font-bold text-blue-500 uppercase mt-1">{item.qty} ex.</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[10px]">{(item.price * item.qty).toFixed(2)}€</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-[7px] text-red-500 font-black uppercase">Suppr.</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 bg-slate-50 border-t">
                <div className="flex justify-between items-center mb-4 text-[10px] font-black uppercase">
                  <span className="text-slate-400 tracking-widest">Total HT</span>
                  <span className="text-xl text-blue-600">{cart.reduce((a, b) => a + (b.price * b.qty), 0).toFixed(2)}€</span>
                </div>
                <Link href="/panier" className="block text-center w-full bg-[#0f092e] text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all">
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