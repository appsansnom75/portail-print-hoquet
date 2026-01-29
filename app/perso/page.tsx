'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext'; // 1. IMPORT DU CONTEXT

const PRODUCTS_CONFIG = [
  {
    id: 'voeux',
    name: 'Carte de Vœux 2026',
    image: '/voeux-detoure.png',
    baseQty: 50,
    hasVariants: true,
    variants: [
      { id: 'sans', name: 'Sans Vernis' },
      { id: 'clear', name: 'Gui et confettis vernis clear' }
    ],
    lots: [1, 2, 4, 6, 8, 10, 20],
    prices: {
      'sans': [30.90, 30.90, 30.90, 30.90, 30.90, 30.90, 30.90],
      'clear': [61.80, 61.80, 61.80, 61.80, 61.80, 61.80, 61.80]
    },
    extraOptions: { id: 'enveloppe', name: 'Option Enveloppes 16x16', pricePerLot: 9.90 }
  },
  {
    id: 'agenda',
    name: 'Agendas Agence',
    image: '/agenda-detoure.png',
    isUnitBased: true,
    units: [10, 25, 50, 100, 150, 200, 300, 400],
    unitPrices: [9.90, 9.50, 9.00, 8.50, 8.00, 7.80, 7.50, 7.20],
    prices: { default: [] }
  },
  {
    id: 'flyer',
    name: 'Flyer Agence',
    image: '/flyer.png',
    baseQty: 500,
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
    id: 'memo_climat',
    name: 'Mémo climat',
    image: '/memo-climat.png',
    baseQty: 100,
    lots: [1, 2, 3, 4, 10, 20, 30, 40],
    prices: { default: [40.00, 35.00, 30.00, 25.00, 22.00, 18.00, 14.00, 10.00] }
  }
];

export default function PersoPage() {
  // 2. UTILISATION DU CONTEXT GLOBAL
  const { cart, addToCart: addItemToGlobalCart, removeFromCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [selections, setSelections] = useState<any>(
    PRODUCTS_CONFIG.reduce((acc, p) => ({
      ...acc, 
      [p.id]: { 
        lot: p.isUnitBased ? (p.units ? p.units[0] : 1) : (p.lots ? p.lots[0] : 1), 
        variant: p.hasVariants ? (p.variants ? p.variants[0].id : 'default') : 'default', 
        extra: false 
      }
    }), {})
  );

  const updateSelection = (prodId: string, field: string, value: any) => {
    setSelections((prev: any) => ({ ...prev, [prodId]: { ...prev[prodId], [field]: value } }));
  };

  const calculateUnitPrice = (product: any) => {
    const sel = selections[product.id];
    if (product.isUnitBased && product.units && product.unitPrices) {
      const unitIndex = product.units.indexOf(sel.lot);
      return product.unitPrices[unitIndex];
    }
    const lotIndex = product.lots ? product.lots.indexOf(sel.lot) : 0;
    const priceList = product.prices[sel.variant] || product.prices.default;
    let basePricePerLot = (priceList[lotIndex] || priceList[0]);
    if (sel.extra && product.extraOptions) basePricePerLot += product.extraOptions.pricePerLot;
    return basePricePerLot;
  };

  const handleAddToCart = (product: any) => {
    const unitPrice = calculateUnitPrice(product);
    const sel = selections[product.id];
    const variantLabel = product.hasVariants ? product.variants?.find((v:any) => v.id === sel.variant)?.name : "";
    const extraLabel = sel.extra ? ` (+ ${product.extraOptions.name})` : "";

    // 3. AJOUT AU CONTEXT GLOBAL
    addItemToGlobalCart({
      id: `${product.id}-${sel.variant}-${sel.extra}`, // ID unique incluant la variante
      name: `${product.name} ${variantLabel}${extraLabel}`,
      price: unitPrice,
      qty: sel.lot,
      category: 'Sur-Mesure'
    });
    
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col relative">
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">← Retour</Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em]">Catalogue Impression</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-7xl mx-auto w-full py-12 px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {PRODUCTS_CONFIG.map((product) => {
            const unitPrice = calculateUnitPrice(product);
            const sel = selections[product.id];
            const totalPrice = unitPrice * sel.lot;

            return (
              <div key={product.id} className="flex flex-col group">
                <div className="h-48 w-full flex items-center justify-center relative mb-4">
                  <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain drop-shadow-2xl group-hover:scale-105 transition-all duration-500" />
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-xl uppercase tracking-tighter text-blue-500 leading-tight w-2/3">{product.name}</h3>
                    {product.baseQty && !product.isUnitBased && (
                      <span className="bg-white/10 text-white/60 text-[7px] font-black px-2 py-1 rounded uppercase border border-white/10">
                        {product.baseQty} ex. / lot
                      </span>
                    )}
                  </div>
                  
                  {product.hasVariants && (
                    <div className="mb-4">
                      <p className="text-[8px] font-black text-white/40 uppercase mb-2 tracking-widest">Options</p>
                      {product.useDropdown ? (
                        <select value={sel.variant} onChange={(e) => updateSelection(product.id, 'variant', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] font-black uppercase outline-none focus:border-blue-500">
                          {product.variants?.map((v: any) => <option key={v.id} value={v.id} className="bg-[#0f092e]">{v.name}</option>)}
                        </select>
                      ) : (
                        <div className="grid grid-cols-1 gap-1">
                          {product.variants?.map((v: any) => (
                            <button key={v.id} onClick={() => updateSelection(product.id, 'variant', v.id)} className={`p-2 rounded border text-[9px] font-black uppercase transition-all ${sel.variant === v.id ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-white/10 bg-white/5'}`}>{v.name}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-[8px] font-black text-white/40 uppercase mb-2 tracking-widest">
                      {product.isUnitBased ? 'Quantité' : 'Nombre de lots'}
                    </p>
                    <select value={sel.lot} onChange={(e) => updateSelection(product.id, 'lot', Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded p-2 text-[10px] font-black uppercase outline-none focus:border-blue-500">
                      {product.isUnitBased 
                        ? product.units?.map(q => <option key={q} value={q} className="bg-[#0f092e]">{q} exemplaires</option>)
                        : product.lots?.map(qty => (
                            <option key={qty} value={qty} className="bg-[#0f092e]">
                              {qty} {qty > 1 ? 'lots' : 'lot'} {product.baseQty ? `(${qty * product.baseQty} ex.)` : ''}
                            </option>
                          ))
                      }
                    </select>
                  </div>

                  {product.extraOptions && (
                    <label className={`flex items-center justify-between p-3 rounded border cursor-pointer mb-4 transition-all ${sel.extra ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-white/10 bg-white/5'}`}>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={sel.extra} onChange={() => updateSelection(product.id, 'extra', !sel.extra)} className="accent-green-500" />
                        <span className="text-[9px] font-black uppercase">{product.extraOptions.name}</span>
                      </div>
                      <span className="text-[8px] font-bold opacity-60">+{product.extraOptions.pricePerLot.toFixed(2)}€ / lot</span>
                    </label>
                  )}

                  <div className="mt-auto pt-4 border-t border-white/5 text-center">
                    <p className="font-black text-2xl mb-3 tracking-tighter text-white">{totalPrice.toFixed(2)}€ <span className="text-[10px] text-white/40">HT</span></p>
                    <button onClick={() => handleAddToCart(product)} className="w-full bg-white text-[#0f092e] py-3 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95">Ajouter au panier</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* PANIER FLOTTANT BRANCHÉ AU CONTEXT */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <button onClick={() => setIsCartOpen(!isCartOpen)} className="bg-white text-[#0f092e] px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-4 hover:bg-blue-600 hover:text-white transition-all">
          Mon Panier {cart.length > 0 && <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-[9px]">{cart.length}</span>}
        </button>
        {isCartOpen && (
          <div className="absolute bottom-16 left-0 w-80 bg-white rounded-2xl shadow-2xl text-[#0f092e] overflow-hidden">
            <div className="bg-slate-100 p-4 border-b flex justify-between items-center"><span className="font-black text-[9px] uppercase tracking-widest text-slate-500">Récapitulatif HT</span><button onClick={() => setIsCartOpen(false)} className="text-red-500 font-black text-[9px]">FERMER</button></div>
            <div className="max-h-80 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? <p className="text-[10px] font-bold text-slate-400 uppercase text-center py-4">Vide</p> : cart.map((item) => (
                <div key={item.id} className="border-b border-slate-100 pb-3 flex justify-between items-start">
                  <div>
                    <p className="font-black text-[10px] uppercase leading-tight">{item.name}</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">
                      {item.qty} {item.qty > 1 && item.id.includes('agenda') ? 'ex.' : 'lot(s)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[10px]">{(item.price * item.qty).toFixed(2)}€</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-[7px] text-red-500 font-black uppercase hover:underline">Suppr.</button>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-5 bg-slate-50 border-t">
                <div className="flex justify-between items-center mb-4"><span className="font-black text-[10px] uppercase text-slate-400">Total HT</span><span className="font-black text-xl text-blue-600">{cart.reduce((a, b) => a + (b.price * b.qty), 0).toFixed(2)}€</span></div>
                <Link href="/panier" className="block text-center w-full bg-[#0f092e] text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all">Voir mon panier complet</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}