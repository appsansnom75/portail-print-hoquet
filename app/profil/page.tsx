'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function ProfilPage() {
  // Simulation de données (plus tard, ça viendra d'une base de données)
  const [agency, setAgency] = useState({
    name: "Guy Hoquet PARIS 10 BONNE NOUVELLE",
    manager: "Jean Dupont",
    email: "paris10@guyhoquet.com",
    phone: "01 45 23 67 89",
    address: "12 Rue de la Lune, 75010 Paris",
    siret: "123 456 789 00012"
  });

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col">
      
      {/* HEADER RAPIDE */}
      <header className="py-6 px-6 border-b border-white/10 flex justify-between items-center">
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">
          ← Retour Accueil
        </Link>
        <h1 className="text-xs font-black uppercase tracking-[0.3em]">Mon Profil Agence</h1>
        <div className="w-20"></div> {/* Équilibre visuel */}
      </header>

      <main className="max-w-3xl mx-auto w-full py-12 px-6">
        <div className="bg-white rounded-2xl p-8 text-[#0f092e] shadow-2xl">
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-2xl">
              {agency.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-black text-xl uppercase tracking-tight">{agency.name}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Franchisé certifié</p>
            </div>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Nom du Responsable</label>
              <input type="text" defaultValue={agency.manager} className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Email de contact</label>
              <input type="email" defaultValue={agency.email} className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors" />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Adresse de livraison par défaut</label>
              <textarea defaultValue={agency.address} className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold h-24 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Téléphone</label>
              <input type="text" defaultValue={agency.phone} className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">N° SIRET</label>
              <input type="text" readOnly value={agency.siret} className="bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-400 cursor-not-allowed" />
            </div>
          </form>

          <button className="w-full mt-10 bg-[#0f092e] text-white font-black uppercase text-xs tracking-[0.2em] py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg">
            Mettre à jour mes informations
          </button>
        </div>

        <p className="mt-6 text-center text-[9px] text-white/20 uppercase font-bold tracking-widest">
          Ces informations seront utilisées pour vos factures et livraisons.
        </p>
      </main>
    </div>
  );
}