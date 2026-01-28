'use client';
import React from 'react';
import Link from 'next/link';

export default function ProduitsSansPersoPage() {
  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-10">
      <Link href="/" className="text-blue-400 hover:underline">← Retour</Link>
      <h1 className="text-2xl font-black mt-8 uppercase">Produits Sans Personnalisation</h1>
      <p className="mt-4 opacity-50 italic">Page en cours de construction...</p>
    </div>
  );
}