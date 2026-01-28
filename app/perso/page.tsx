'use client';
import React, { useState } from 'react';
import Link from 'next/link';

// --- CONFIGURATION AVEC PRIX RÉELS ---
const PRODUCTS_CONFIG = [
  {
    id: 'voeux',
    name: 'Carte de Vœux 2026',
    image: '/voeux-detoure.png',
    baseQty: 50,
    hasVariants: true,
    variants: [
      { id: 'sans', name: 'Sans Vernis' },
      { id: 'clear', name: 'Vernis Gui et Confettis' }
    ],
    lots: [1, 5, 10, 50, 100],
    prices: {
      'sans': [125.00, 115.00, 105.00, 95.00, 85.00], // Prix HT par lot
      'clear': [150.00, 140.00, 130.00, 120.00, 110.00]
    },
    extraOptions: { id: 'enveloppe', name: 'Enveloppes 16x16', pricePerLot: 25.00 }
  },
  {
    id: 'agenda',
    name: 'Agendas Agence',
    image: '/agenda-detoure.png',
    baseQty: 50,
    lots: [1, 5, 10, 50, 100],
    prices: { default: [450.00, 420.00, 400.00, 380.00, 350.00] }
  },
  {
    id: 'flyers',
    name: 'Flyers Agence',
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
    lots: [1, 5, 10, 20, 30, 40, 60, 80],
    prices: { default: [8.45, 8.00, 7.65, 7.55, 7.40, 6.90, 6.50, 6.00] }
  },
  {
    id: 'carte_visite',
    name: 'Carte de visite',
    image: '/carte-visite.png',
    baseQty: 100,
    hasVariants: true,
    variants: [
      { id: 'classique', name: 'Classique' },
      { id: 'bloc_marque', name: 'Bloc Marque' }
    ],
    lots: [1, 5, 10],
    prices: {
      'classique': [8.25, 7.50, 7.00],
      'bloc_marque': [8.25, 7.50, 7.00]
    }
  },
  {
    id: 'entete',
    name: 'En-tête de lettre',
    image: '/entete-lettre.png',
    baseQty: 500,
    lots: [1, 20, 30, 40, 60, 80],
    prices: { default: [12.85, 8.00, 7.65, 7.55, 7.40, 6.90] }
  }
];

export default function PersoPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selections, setSelections] = useState<any>(
    PRODUCTS_CONFIG.reduce((acc, p) => ({
      ...acc, 
      [p.id]: { lot: p.lots[0], variant: p.hasVariants ? p.variants[0].id : 'default', extra: false }
    }), {})
  );

  const updateSelection = (prodId: string, field: string, value: any) => {
    setSelections((prev: any) => ({ ...prev, [prodId]: { ...prev[prodId], [field]: value } }));
  };

  const calculatePrice = (product: any) => {
    const sel = selections[product.id];
    const lotIndex = product.lots.indexOf(sel.lot);
    const priceList = product.prices[sel.variant] || product.prices.default;
    let base = (priceList[lotIndex] || priceList[0]) * sel.lot;
    if (sel.extra && product.extraOptions) base += product.extraOptions.pricePerLot * sel.lot;
    return base;
  };

  const addToCart = (product: any) => {
    const price = calculatePrice(product);
    const sel = selections[product.id];
    const variantLabel = product.variants?.find((v:any) => v.id === sel.variant)?.name || "";
    setCart([...cart, { id: Date.now(), name: product.name, variant: variantLabel, quantity: sel.lot, totalPrice: price, extra: sel.extra }]);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col relative">
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">← Retour</Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em]">Portail Impression</h1>
        <div className="w-20"></div>
      </header>

      <main className="max-w-7xl mx-auto w-full py-12 px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {PRODUCTS_CONFIG.map((product) => {
            const currentTotal = calculatePrice(product);
            const sel = selections[product.id];

            return (
              <div key={product.id} className="flex flex-col group">
                <div className="h-52 w-full flex items-center justify-center relative mb-6">
                  <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain drop-shadow-2xl group-hover:scale-105 transition-all duration-500" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  <span className="absolute -z-10 text-[35px] font-black text-white/[0.02] uppercase select-none text-center leading-none px-4">{product.name}</span>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full">
                  <h3 className="font-black text-xl uppercase tracking-tighter mb-6 text-blue-500">{product.name}</h3>
                  
                  {product.hasVariants && (
                    <div className="mb-6">
                      <p className="text-[8px] font-black text-white/40 uppercase mb-3 tracking-widest">Choix du modèle</p>
                      {product.useDropdown ? (
                        <select value={sel.variant} onChange={(e) => updateSelection(product.id, 'variant', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-[10px] font-black uppercase outline-none focus:border-blue-500">
                          {product.variants?.map(v => <option key={v.id} value={v.id} className="bg-[#0f092e]">{v.name}</option>)}
                        </select>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {product.variants?.map(v => (
                            <button key={v.id} onClick={() => updateSelection(product.id, 'variant', v.id)} className={`p-3 rounded-lg border text-[9px] font-black uppercase transition-all ${sel.variant === v.id ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>{v.name}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="flex justify-between mb-3 text-[8px] font-black text-white/40 uppercase tracking-widest">
                      <span>Nombres de lots</span>
                      <span className="text-blue-400">{product.baseQty} ex. / lot</span>
                    </div>
                    <select value={sel.lot} onChange={(e) => updateSelection(product.id, 'lot', Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-[10px] font-black uppercase outline-none focus:border-blue-500">
                      {product.lots.map(qty => <option key={qty} value={qty} className="bg-[#0f092e]">{qty} {qty > 1 ? 'lots' : 'lot'}</option>)}
                    </select>
                  </div>

                  {product.extraOptions && (
                    <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer mb-6 transition-all ${sel.extra ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-white/10 bg-white/5'}`}>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={sel.extra} onChange={() => updateSelection(product.id, 'extra', !sel.extra)} className="accent-green-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{product.extraOptions.name}</span>
                      </div>
                    </label>
                  )}

                  <div className="mt-auto pt-6 border-t border-white/5 text-center">
                    <p className="font-black text-xl mb-4 tracking-tighter">{currentTotal.toFixed(2)}€ HT</p>
                    <button onClick={() => addToCart(product)} className="w-full bg-white text-[#0f092e] py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95">Ajouter au panier</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* PANIER FLOTTANT (BAS GAUCHE) */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <button onClick={() => setIsCartOpen(!isCartOpen)} className="bg-white text-[#0f092e] px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-4 hover:bg-blue-600 hover:text-white transition-all">
          Mon Panier {cart.length > 0 && <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-[9px]">{cart.length}</span>}
        </button>
        {isCartOpen && (
          <div className="absolute bottom-16 left-0 w-80 bg-white rounded-2xl shadow-2xl text-[#0f092e] overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-slate-100 p-4 border-b flex justify-between items-center"><span className="font-black text-[9px] uppercase tracking-widest">Récapitulatif HT</span><button onClick={() => setIsCartOpen(false)} className="text-red-500 font-black text-[9px]">FERMER</button></div>
            <div className="max-h-80 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? <p className="text-[10px] font-bold text-slate-400 uppercase text-center py-4">Vide</p> : cart.map((item, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-3 flex justify-between items-start">
                  <div><p className="font-black text-[10px] uppercase leading-tight">{item.name}</p><p className="text-[8px] font-bold text-slate-500 uppercase mt-1">{item.variant} • {item.quantity} lot(s)</p></div>
                  <div className="text-right"><p className="font-black text-[10px]">{item.totalPrice.toFixed(2)}€</p><button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-[7px] text-red-500 font-black uppercase hover:underline">Suppr.</button></div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-5 bg-slate-50 border-t"><div className="flex justify-between items-center mb-4"><span className="font-black text-[10px] uppercase text-slate-400">Total HT</span><span className="font-black text-xl text-blue-600">{cart.reduce((a, b) => a + b.totalPrice, 0).toFixed(2)}€</span></div><button className="w-full bg-[#0f092e] text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all">Valider</button></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}