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
      <Link href="/" className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100">← Retour</Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {PRODUCTS_CONFIG.map((product) => {
          const sel = selections[product.id];
          const qtyIndex = product.quantities.indexOf(sel.qty);
          const currentTotal = ((product.prices as any)[sel.variant] || (product.prices as any).default)[qtyIndex];

          return (
            <div key={product.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col">
              <div className="h-40 flex items-center justify-center mb-6">
                 <img src={product.image} alt={product.name} className="max-h-full object-contain" />
              </div>
              
              <h3 className="text-xl font-black uppercase text-blue-500 mb-4">{product.name}</h3>
              
              <div className="space-y-4">
                {product.hasVariants && (
                   <select 
                    value={sel.variant} 
                    onChange={(e) => updateSelection(product.id, 'variant', e.target.value)}
                    className="w-full bg-white/10 p-3 rounded-xl outline-none border border-white/5"
                   >
                     {product.variants?.map(v => <option key={v.id} value={v.id} className="bg-[#0f092e]">{v.name}</option>)}
                   </select>
                )}

                <select 
                  value={sel.qty} 
                  onChange={(e) => updateSelection(product.id, 'qty', Number(e.target.value))}
                  className="w-full bg-white/10 p-3 rounded-xl outline-none text-blue-400 font-bold border border-white/5"
                >
                  {product.quantities.map(q => <option key={q} value={q} className="bg-[#0f092e]">{q} ex.</option>)}
                </select>

                <div className="text-center pt-4 mt-auto">
                  <p className="text-2xl font-black">{currentTotal.toFixed(2)}€ HT</p>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-blue-600 mt-4 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all shadow-lg"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PANIER FLOTTANT */}
      {isCartOpen && (
        <div className="fixed bottom-8 right-8 w-80 bg-white text-black rounded-3xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-5">
          <div className="p-6 bg-slate-100 flex justify-between items-center border-b">
            <span className="font-black uppercase text-[10px] tracking-tighter">Ton Panier</span>
            <button onClick={() => setIsCartOpen(false)} className="text-red-500 font-bold hover:scale-110 transition-transform">✕</button>
          </div>
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-center text-xs font-bold text-slate-400">Ton panier est vide</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex justify-between border-b border-slate-100 pb-2">
                  <div className="w-2/3">
                    <p className="font-bold text-[10px] uppercase leading-tight">{item.name}</p>
                    <p className="text-blue-600 font-black text-sm">{item.qty} ex.</p>
                  </div>
                  <p className="font-black text-xs">{(item.price * item.qty).toFixed(2)}€</p>
                </div>
              ))
            )}
          </div>
          <div className="p-6 border-t bg-slate-50">
            <Link href="/panier" className="block w-full bg-black text-white text-center py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-colors">
              Commander
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}