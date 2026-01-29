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
    useDropdown: true,
    variants: [
      { id: 'estim', name: 'Estimation générique' }, { id: 'garantie', name: 'Garantie revente' },
      { id: 'reprise', name: 'Ouverture / Reprise' }, { id: 'affiliation', name: 'Ouverture / Affiliation' },
      { id: 'creation', name: 'Ouverture / Création' }, { id: 'gestion', name: 'Gestion locative Générique' },
      { id: 'op_gestion', name: 'OPERATION Gestion locative' }, { id: 'matterport', name: 'Matterport' },
      { id: 'mtaux', name: 'Meilleur Taux' }, { id: 'loc_gen', name: 'Location Générique' },
      { id: 'op_loc', name: 'OPERATION Location' }, { id: 'op_mandat', name: 'OPERATION Mandat Exclusif' },
      { id: 'recrutement', name: 'Recrutement' }, { id: 'climat', name: 'Climat' }, { id: 'noel', name: 'Noël 2026' }
    ],
    quantities: [500, 10000, 15000, 20000, 30000, 40000],
    prices: { default: [8.45, 169.00, 229.50, 302.00, 444.00, 552.00] } // Prix TOTAL pour la quantité
  },
  {
    id: 'calendrier',
    name: 'Calendrier',
    image: '/calendrier.png',
    hasVariants: true,
    variants: [{ id: 'A4', name: 'Format A4' }, { id: 'A5', name: 'Format A5' }],
    quantities: [500, 1000, 2000, 3000, 5000],
    prices: {
      'A4': [73.50, 110.26, 197.40, 283.50, 456.80],
      'A5': [51.52, 74.90, 128.40, 160.50, 192.50]
    }
  },
  {
    id: 'carte_visite',
    name: 'Carte de visite',
    image: '/carte-visite.png',
    quantities: [100, 200, 500],
    prices: { default: [8.25, 15.00, 30.00] }
  },
  {
    id: 'entete_lettre',
    name: 'En-tête de lettre',
    image: '/entete-lettre.png',
    quantities: [500, 1000, 5000],
    prices: { default: [12.85, 24.00, 110.00] }
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
    const priceList = product.prices[sel.variant] || product.prices.default;
    const totalPrice = priceList[qtyIndex];
    
    const variantLabel = product.hasVariants ? ` (${product.variants?.find((v:any) => v.id === sel.variant)?.name})` : "";

    addItemToGlobalCart({
      id: `${product.id}-${sel.variant}-${sel.qty}`, // On inclut la qty dans l'ID pour différencier si besoin
      name: `${product.name}${variantLabel}`,
      price: totalPrice / sel.qty, // Prix à l'unité (ex: 0.02)
      qty: sel.qty, // Nombre d'exemplaires (ex: 500)
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
            const priceList = product.prices[sel.variant] || product.prices.default;
            const currentTotal = priceList[qtyIndex];

            return (
              <div key={product.id} className="flex flex-col group">
                <div className="h-48 w-full flex items-center justify-center mb-4">
                  <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain transition-all duration-500 group-hover:scale-105" />
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full">
                  <h3 className="font-black text-xl uppercase tracking-tighter text-blue-500 mb-6">{product.name}</h3>
                  
                  {product.hasVariants && (
                    <div className="mb-4">
                      <p className="text-[8px] font-black text-white/40 uppercase mb-2 tracking-widest">Modèle</p>
                      <select value={sel.variant} onChange={(e) => updateSelection(product.id, 'variant', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] font-black uppercase outline-none focus:border-blue-500">
                        {product.variants?.map((v: any) => <option key={v.id} value={v.id} className="bg-[#0f092e]">{v.name}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="mb-8">
                    <p className="text-[8px] font-black text-white/40 uppercase mb-2 tracking-widest">Quantité (Exemplaires)</p>
                    <select value={sel.qty} onChange={(e) => updateSelection(product.id, 'qty', Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded p-3 text-[11px] font-black uppercase outline-none focus:border-blue-500">
                      {product.quantities.map(q => <option key={q} value={q} className="bg-[#0f092e]">{q} ex.</option>)}
                    </select>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5 text-center">
                    <p className="font-black text-2xl mb-3">{currentTotal.toFixed(2)}€ <span className="text-[10px] text-white/40">HT</span></p>
                    <button onClick={() => handleAddToCart(product)} className="w-full bg-white text-[#0f092e] py-3 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg">Ajouter au panier</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}