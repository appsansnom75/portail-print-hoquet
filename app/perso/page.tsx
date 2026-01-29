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
      { id: 'estim', name: 'Estimation générique' }, { id: 'garantie', name: 'Garantie revente' },
      { id: 'reprise', name: 'Ouverture / Reprise' }, { id: 'noel', name: 'Noël 2026' }
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
  // ... ajoute tes autres produits ici avec la même structure
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
    
    const variantLabel = product.hasVariants 
      ? ` (${product.variants?.find((v:any) => v.id === sel.variant)?.name})` 
      : "";

    // On prépare l'objet pour le panier
    addItemToGlobalCart({
      // L'ID ne contient PAS la quantité pour permettre le cumul dans le panier
      id: `${product.id}-${sel.variant}`, 
      name: `${product.name}${variantLabel}`,
      price: totalPriceHT / sel.qty, // Prix unitaire
      qty: Number(sel.qty), // On envoie bien le volume sélectionné (ex: 500)
      category: 'Impression'
    });
    
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col relative">
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">← Retour</Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">Catalogue Impression</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-7xl mx-auto w-full py-12 px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {PRODUCTS_CONFIG.map((product) => {
            const sel = selections[product.id];
            const qtyIndex = product.quantities.indexOf(sel.qty);
            const priceList = (product.prices as any)[sel.variant] || (product.prices as any).default;
            const currentTotal = priceList[qtyIndex];

            return (
              <div key={product.id} className="flex flex-col group">
                <div className="h-48 w-full flex items-center justify-center mb-4">
                  <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full">
                  <h3 className="font-black text-xl uppercase tracking-tighter text-blue-500 mb-6">{product.name}</h3>
                  
                  {product.hasVariants && (
                    <div className="mb-4">
                      <p className="text-[8px] font-black text-white/40 uppercase mb-2 tracking-widest">Modèle</p>
                      <select value={sel.variant} onChange={(e) => updateSelection(product.id, 'variant', e.target.value)} className="w-full bg-[#1a1340] border border-white/10 rounded-lg p-2 text-[10px] font-black uppercase outline-none">
                        {product.variants?.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="mb-8">
                    <p className="text-[8px] font-black text-white/40 uppercase mb-2 tracking-widest">Sélectionner la quantité</p>
                    <select value={sel.qty} onChange={(e) => updateSelection(product.id, 'qty', Number(e.target.value))} className="w-full bg-[#1a1340] border border-white/10 rounded p-3 text-[11px] font-black uppercase outline-none">
                      {product.quantities.map(q => <option key={q} value={q}>{q} exemplaires</option>)}
                    </select>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5 text-center">
                    <p className="font-black text-2xl mb-3">{currentTotal.toFixed(2)}€ <span className="text-[10px] text-white/40">HT</span></p>
                    <button onClick={() => handleAddToCart(product)} className="w-full bg-white text-[#0f092e] py-3 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95">Ajouter au panier</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* PANIER FLOTTANT */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <button onClick={() => setIsCartOpen(!isCartOpen)} className="bg-white text-[#0f092e] px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-4 hover:bg-blue-600 transition-all">
          Panier {cart.length > 0 && <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-[9px]">{cart.length}</span>}
        </button>
        {isCartOpen && (
          <div className="absolute bottom-16 left-0 w-80 bg-white rounded-2xl shadow-2xl text-[#0f092e] overflow-hidden">
             <div className="bg-slate-100 p-4 border-b flex justify-between items-center"><span className="font-black text-[9px] uppercase tracking-widest text-slate-500">Détails</span><button onClick={() => setIsCartOpen(false)} className="text-red-500 font-black text-[9px]">FERMER</button></div>
             <div className="max-h-80 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? <p className="text-[10px] font-bold text-slate-400 uppercase text-center py-4">Vide</p> : cart.map((item) => (
                <div key={item.id} className="border-b border-slate-100 pb-3 flex justify-between items-start">
                  <div>
                    <p className="font-black text-[10px] uppercase leading-tight">{item.name}</p>
                    <p className="text-[9px] font-bold text-blue-600 mt-1">{item.qty} ex.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[10px]">{(item.price * item.qty).toFixed(2)}€</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-[7px] text-red-500 font-black uppercase">Suppr.</button>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-5 bg-slate-50 border-t">
                <Link href="/panier" className="block text-center w-full bg-[#0f092e] text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all">Finaliser la commande</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}