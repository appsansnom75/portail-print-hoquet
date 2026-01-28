'use client';
import React from 'react';
import Link from 'next/link';

// On définit quelques produits de démo pour ton client
const products = [
  {
    id: 1,
    title: "Cartes de Visite",
    description: "Finition Soft Touch - Recto/Verso",
    image: "/produit-carte.jpg", // Prépare une image ou laisse le placeholder
    badge: "Populaire"
  },
  {
    id: 2,
    title: "Panneaux Immobiliers",
    description: "Akilux 3.5mm - Pose œillets",
    image: "/produit-panneau.jpg",
    badge: "Sur-mesure"
  },
  {
    id: 3,
    title: "Flyers A5 Agence",
    description: "Papier 135g brillant - 100% Custom",
    image: "/produit-flyer.jpg",
    badge: "Indispensable"
  }
];

export default function PersoPage() {
  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col">
      
      {/* HEADER NAVIGATION */}
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center bg-[#0f092e]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">
          ← Retour Accueil
        </Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em]">Produits Personnalisables</h1>
        <div className="w-20"></div>
      </header>

      <main className="max-w-6xl mx-auto w-full py-12 px-6">
        {/* TITRE DE SECTION */}
        <div className="mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Configurez vos supports</h2>
          <p className="text-blue-300/60 text-xs font-bold uppercase tracking-widest mt-2">Éléments de personnalisation automatique inclus</p>
        </div>

        {/* GRILLE DE PRODUITS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-500 shadow-2xl">
              
              {/* IMAGE PRODUIT */}
              <div className="h-56 bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-center justify-center overflow-hidden">
                <span className="text-[10px] font-black uppercase text-white/10 tracking-[1em] rotate-12 absolute">Aperçu</span>
                <div className="absolute top-4 left-4 bg-blue-600 text-[8px] font-black uppercase px-2 py-1 rounded">
                  {product.badge}
                </div>
                {/* Une fois que tu auras les images, décommente la ligne suivante : */}
                {/* <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.title} /> */}
              </div>

              {/* INFOS PRODUIT */}
              <div className="p-6">
                <h3 className="font-black text-xl uppercase tracking-tight">{product.title}</h3>
                <p className="text-white/40 text-xs mt-2 font-medium">{product.description}</p>
                
                <button className="w-full mt-6 bg-white text-[#0f092e] py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 hover:text-white transition-all transform group-hover:translate-y-[-2px]">
                  Lancer le configurateur
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* INFO BOX */}
        <div className="mt-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="text-3xl italic font-black text-blue-500">i</div>
          <p className="text-xs font-bold leading-relaxed text-blue-200/70 uppercase tracking-wide text-center md:text-left">
            Vos coordonnées (Logo agence, téléphone, adresse) sont automatiquement récupérées depuis votre <Link href="/profil" className="text-blue-400 underline">Profil Agence</Link> pour gagner du temps lors de la création.
          </p>
        </div>
      </main>

    </div>
  );
}