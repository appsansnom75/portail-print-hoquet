'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion'; // Pour le swipe fluide

const PRODUCTS_CONFIG = [
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
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col relative overflow-x-hidden">
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">← Retour</Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">Personnalisation</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-7xl mx-auto w-full py-12 px-6 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {PRODUCTS_CONFIG.map((product) => {
            const sel = selections[product.id];
            const qtyIndex = product.quantities.indexOf(sel.qty);
            const currentTotal = ((product.prices as any)[sel.variant] || (product.prices as any).default)[qtyIndex];
            const variantImage = product.variants?.find(v => v.id === sel.variant)?.image;
            const displayImage = variantImage || product.image;

            return (
              <div key={product.id} className="flex flex-col md:flex-row gap-12 items-center bg-white/[0.02] p-8 rounded-[50px] border border-white/5">
                
                {/* ZONE IMAGE : PLUS DE CADRE, TAILLE BOOSTÉE, EFFET SWIPE */}
                <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={displayImage}
                      src={displayImage}
                      initial={{ x: 100, opacity: 0, scale: 0.8 }}
                      animate={{ x: 0, opacity: 1, scale: 1.2 }} // Scale 1.2 pour l'effet "Agrandissement"
                      exit={{ x: -100, opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="max-h-full max-w-full object-contain drop-shadow-[0_20px_50px_rgba(59,130,246,0.3)]"
                      style={{ filter: 'drop-shadow(0px 20px 30px rgba(0,0,0,0.5))' }}
                    />
                  </AnimatePresence>
                </div>

                {/* ZONE CONTROLE */}
                <div className="w-full max-w-sm flex flex-col">
                  <h3 className="font-black text-3xl uppercase tracking-tighter text-blue-500 mb-6 leading-none italic">{product.name}</h3>

                  {product.hasVariants && (
                    <div className="mb-6">
                      <p className="text-[8px] font-black text-white/40 uppercase mb-3 tracking-widest">Sélectionner le modèle</p>
                      <div className="grid grid-cols-2 gap-2">
                        {product.variants?.map((v) => (
                          <button 
                            key={v.id} 
                            onClick={() => updateSelection(product.id, 'variant', v.id)} 
                            className={`p-4 rounded-2xl border text-[9px] font-black uppercase transition-all duration-300 ${sel.variant === v.id ? 'border-blue-500 bg-blue-600 text-white' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                          >
                            {v.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-8">
                    <p className="text-[8px] font-black text-white/40 uppercase mb-3 tracking-widest">Quantité souhaitée</p>
                    <select 
                      value={sel.qty} 
                      onChange={(e) => updateSelection(product.id, 'qty', Number(e.target.value))} 
                      className="w-full bg-[#1a133d] border border-white/10 rounded-2xl p-5 text-xs font-black uppercase outline-none focus:border-blue-500 transition-all cursor-pointer"
                    >
                      {product.quantities.map((q: number) => (
                        <option key={q} value={q}>{q} exemplaires</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-[10px] font-black text-white/30 uppercase italic">Prix HT</span>
                        <p className="font-black text-4xl text-white tracking-tighter">{currentTotal.toFixed(2)}€</p>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(product)} 
                      className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-[#0f092e] transition-all shadow-2xl shadow-blue-500/20 active:scale-95"
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

      {/* PANIER FLOTTANT (Inchangé) */}
      {/* ... garde ton code du panier ici ... */}
    </div>
  );
}