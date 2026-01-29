'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext'; // 1. IMPORT DU CONTEXT

const STOCK_CONFIG = [
  {
    id: 'dossier_acc',
    name: 'Dossier accompagnement',
    image: '/dossier-accompagnement.png',
    baseQty: 25,
    lots: [1, 2, 4],
    prices: { default: [19.45, 19.45, 19.45] }
  },
  {
    id: 'chemise_rabat',
    name: 'Chemise à rabat',
    image: '/chemise-rabat.png',
    baseQty: 100,
    lots: [1],
    prices: { default: [25.99] }
  },
  {
    id: 'affiche',
    name: 'Affiche A3 ou A4',
    image: '/affiche.png',
    baseQty: 1,
    lots: [1, 5, 10, 20],
    prices: { default: [1.00, 1.00, 1.00, 1.00] }
  }
];

export default function StockPage() {
  // 2. ON UTILISE LE CONTEXT AU LIEU DU STATE LOCAL
  const { cart, addToCart: addItemToGlobalCart, removeFromCart, updateQty } = useCart();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selections, setSelections] = useState<any>(
    STOCK_CONFIG.reduce((acc, p) => ({
      ...acc, 
      [p.id]: { lot: p.lots[0], variant: 'default' }
    }), {})
  );

  const updateSelection = (prodId: string, field: string, value: any) => {
    setSelections((prev: any) => ({ ...prev, [prodId]: { ...prev[prodId], [field]: value } }));
  };

  const calculatePrice = (product: any) => {
    const sel = selections[product.id];
    const lotIndex = product.lots.indexOf(sel.lot);
    const priceList = product.prices.default;
    return (priceList[lotIndex] || priceList[0]); // Prix à l'unité de lot
  };

  const handleAddToCart = (product: any) => {
    const unitPrice = calculatePrice(product);
    const sel = selections[product.id];
    
    // 3. ON ENVOIE AU CONTEXT GLOBAL
    addItemToGlobalCart({
      id: product.id,
      name: product.name,
      price: unitPrice,
      qty: sel.lot, // Nombre de lots choisis
      category: 'Produit Standard'
    });
    
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col relative">
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">← Retour</Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em]">Produits standard</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-7xl mx-auto w-full py-12 px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {STOCK_CONFIG.map((product) => {
            const currentUnitPrice = calculatePrice(product);
            const sel = selections[product.id];
            const totalPrice = currentUnitPrice * sel.lot;

            return (
              <div key={product.id} className="flex flex-col group">
                <div className="h-48 w-full flex items-center justify-center relative mb-4">
                  <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain drop-shadow-2xl group-hover:scale-105 transition-all duration-500" />
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-xl uppercase tracking-tighter text-green-500 leading-tight w-2/3">{product.name}</h3>
                    <span className="bg-white/10 text-white/60 text-[7px] font-black px-2 py-1 rounded uppercase border border-white/10">
                      {product.baseQty} ex. / lot
                    </span>
                  </div>

                  <div className="mb-6">
                    <p className="text-[8px] font-black text-white/40 uppercase mb-2 tracking-widest">Nombre de lots</p>
                    <select value={sel.lot} onChange={(e) => updateSelection(product.id, 'lot', Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded p-2 text-[10px] font-black uppercase outline-none focus:border-green-500">
                      {product.lots.map(qty => (
                        <option key={qty} value={qty} className="bg-[#0f092e]">
                          {qty} {qty > 1 ? 'lots' : 'lot'} ({qty * product.baseQty} ex.)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5 text-center">
                    <p className="font-black text-2xl mb-3 tracking-tighter text-white">{totalPrice.toFixed(2)}€ <span className="text-[10px] text-white/40">HT</span></p>
                    <button onClick={() => handleAddToCart(product)} className="w-full bg-white text-[#0f092e] py-3 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-green-600 hover:text-white transition-all shadow-lg active:scale-95">Ajouter au panier</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* PANIER FLOTTANT BRANCHÉ SUR LE CONTEXT */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <button onClick={() => setIsCartOpen(!isCartOpen)} className="bg-white text-[#0f092e] px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center gap-4 hover:bg-green-600 hover:text-white transition-all">
          Mon Panier {cart.length > 0 && <span className="bg-green-500 text-white px-2 py-0.5 rounded text-[9px]">{cart.length}</span>}
        </button>
        
        {isCartOpen && (
          <div className="absolute bottom-16 left-0 w-80 bg-white rounded-2xl shadow-2xl text-[#0f092e] overflow-hidden">
            <div className="bg-slate-100 p-4 border-b flex justify-between items-center">
              <span className="font-black text-[9px] uppercase tracking-widest text-slate-500">Récapitulatif HT</span>
              <button onClick={() => setIsCartOpen(false)} className="text-red-500 font-black text-[9px]">FERMER</button>
            </div>
            
            <div className="max-h-80 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <p className="text-[10px] font-bold text-slate-400 uppercase text-center py-4">Vide</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="border-b border-slate-100 pb-3 flex justify-between items-start">
                    <div>
                      <p className="font-black text-[10px] uppercase leading-tight">{item.name}</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">{item.qty} lot(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[10px]">{(item.price * item.qty).toFixed(2)}€</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-[7px] text-red-500 font-black uppercase hover:underline">Suppr.</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 bg-slate-50 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-black text-[10px] uppercase text-slate-400">Total HT</span>
                  <span className="font-black text-xl text-green-600">
                    {cart.reduce((a, b) => a + (b.price * b.qty), 0).toFixed(2)}€
                  </span>
                </div>
                {/* 4. REDIRECTION VERS LA PAGE PANIER RÉELLE */}
                <Link href="/panier" className="block text-center w-full bg-[#0f092e] text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-green-600 transition-all">
                  Voir mon panier complet
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}