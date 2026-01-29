'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

const PRODUCTS_CONFIG = [
  {
    id: 'flyer',
    name: 'Flyer Agence',
    image: '/flyer.png', // Image par défaut
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

            // LOGIQUE POUR CHANGER L'IMAGE
            // Si une variante est choisie et qu'elle a une image, on l'affiche, sinon image par défaut
            const variantImage = product.variants?.find(v => v.id === sel.variant)?.image;
            const displayImage = variantImage || product.image;

            return (
              <div key={product.id} className="flex flex-col group">
                {/* ZONE IMAGE AVEC TRANSITION */}
                <div className="h-64 w-full flex items-center justify-center relative mb-4 bg-white/[0.02] rounded-3xl overflow-hidden border border-white/5">
                  <img 
                    key={displayImage} // Le 'key' force React à re-render l'anim lors du changement
                    src={displayImage} 
                    alt={product.name} 
                    className="max-h-[80%] max-w-[80%] object-contain animate-in fade-in zoom-in duration-500 transition-all group-hover:scale-110" 
                  />
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-black text-xl uppercase tracking-tighter text-blue-500 leading-tight w-2/3">{product.name}</h3>
                  </div>

                  {product.hasVariants && (
                    <div className="mb-6">
                      <p className="text-[8px] font-black text-white/40 uppercase mb-2 tracking-widest">Modèle</p>
                      <div className="grid grid-cols-2 gap-2">
                        {product.variants?.map((v) => (
                          <button 
                            key={v.id} 
                            onClick={() => updateSelection(product.id, 'variant', v.id)} 
                            className={`p-3 rounded-xl border text-[9px] font-black uppercase transition-all duration-300 ${sel.variant === v.id ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'}`}
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
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[10px] font-black uppercase outline-none focus:border-blue-500 transition-colors cursor-pointer"
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

      {/* Reste du composant (Panier) identique... */}
      {/* ... */}
    </div>
  );
}