'use client';
import React, { useState } from 'react';
import Link from 'next/link';

// --- EXTRACTION DES TARIFS DEPUIS TES CAPTURES ---
const PRODUITS_PERSO = [
  {
    id: 'CALENDRIER_A4',
    nom: 'Calendrier format A4',
    options: [
      { qte: 500, prix: 73.50 }, { qte: 1000, prix: 55.13 }, { qte: 2000, prix: 49.35 },
      { qte: 3000, prix: 47.25 }, { qte: 5000, prix: 45.68 }, { qte: 10000, prix: 44.57 },
      { qte: 15000, prix: 44.17 }, { qte: 20000, prix: 43.97 }
    ]
  },
  {
    id: 'CALENDRIER_A5',
    nom: 'Calendrier format A5',
    options: [
      { qte: 500, prix: 51.52 }, { qte: 1000, prix: 37.45 }, { qte: 2000, prix: 32.10 },
      { qte: 3000, prix: 26.75 }, { qte: 5000, prix: 19.25 }, { qte: 10000, prix: 17.30 },
      { qte: 15000, prix: 16.50 }, { qte: 20000, prix: 15.39 }
    ]
  },
  {
    id: 'CARTE_VOEUX_SIMPLE',
    nom: 'Carte de voeux (sans vernis)',
    options: [
      { qte: 50, prix: 30.90 }, { qte: 100, prix: 32.70 }, { qte: 200, prix: 40.00 },
      { qte: 300, prix: 44.50 }, { qte: 400, prix: 47.50 }, { qte: 500, prix: 56.20 }, { qte: 1000, prix: 82.70 }
    ]
  },
  {
    id: 'DEPLIANT_MT',
    nom: 'Dépliant Meilleur Taux',
    options: [
      { qte: 100, prix: 45.82 }, { qte: 200, prix: 26.69 }, { qte: 500, prix: 15.55 },
      { qte: 1000, prix: 11.81 }, { qte: 3000, prix: 9.97 }
    ]
  },
  {
    id: 'NOTES_PROPRO',
    nom: 'Notes aux propriétaires',
    options: [
      { qte: 100, prix: 9.90 }, { qte: 200, prix: 9.00 }, { qte: 300, prix: 8.50 },
      { qte: 400, prix: 8.00 }, { qte: 500, prix: 7.50 }
    ]
  }
];

export default function PersoPage() {
  const [panier, setPanier] = useState<any[]>([]);

  const ajouterAuPanier = (produit: string, qte: number, prix: number) => {
    setPanier([...panier, { produit, qte, prix }]);
  };

  const totalHT = panier.reduce((acc, item) => acc + item.prix, 0);
  const totalTTC = totalHT * 1.20;

  return (
    <div className="min-h-screen bg-[#1e3a8a] text-white font-sans p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* RETOUR & TITRE */}
        <div className="flex justify-between items-center mb-12">
          <Link href="/" className="text-[10px] font-black uppercase tracking-widest border-b-2 border-white/20 pb-1 hover:border-white transition-all">
            ← Retour Accueil
          </Link>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Produits Personnalisables</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* LISTE DES PRODUITS */}
          <div className="lg:col-span-2 space-y-8">
            {PRODUITS_PERSO.map((prod) => (
              <div key={prod.id} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
                <h2 className="text-xl font-black uppercase mb-6 tracking-tight">{prod.nom}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {prod.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => ajouterAuPanier(prod.nom, opt.qte, opt.prix)}
                      className="bg-white/10 hover:bg-white hover:text-[#1e3a8a] py-4 rounded-xl transition-all flex flex-col items-center justify-center border border-white/5"
                    >
                      <span className="text-[10px] font-black uppercase opacity-60">Qté: {opt.qte}</span>
                      <span className="text-lg font-black">{opt.prix.toFixed(2)}€ <small className="text-[10px]">HT</small></span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* RÉCAPITULATIF COMMANDE */}
          <div className="relative">
            <div className="sticky top-12 bg-white text-slate-900 p-8 rounded-[2.5rem] shadow-2xl">
              <h2 className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase mb-8 border-b pb-4 text-center">Votre Sélection</h2>
              
              {panier.length === 0 ? (
                <p className="text-center py-10 text-slate-300 italic text-sm">Aucun produit sélectionné</p>
              ) : (
                <div className="space-y-4">
                  {panier.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase border-b border-slate-100 pb-2">
                      <div className="flex flex-col">
                        <span>{item.produit}</span>
                        <span className="text-blue-600">Quantité: {item.qte}</span>
                      </div>
                      <span>{item.prix.toFixed(2)}€</span>
                    </div>
                  ))}

                  <div className="mt-8 pt-6 border-t-4 border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total à régler TTC</p>
                    <div className="text-5xl font-black tracking-tighter mb-8">{totalTTC.toFixed(2)}€</div>
                    <button className="w-full bg-[#1e3a8a] text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-lg">
                      Passer la commande
                    </button>
                    <button onClick={() => setPanier([])} className="mt-4 text-[9px] font-bold text-slate-300 uppercase hover:text-red-500 transition-colors">
                      Vider le panier
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}