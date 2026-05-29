'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import CartDrawer from '@/components/CartDrawer';


export default function HomePage() {
  const [agencyName, setAgencyName] = useState("");
  const [userName, setUserName]     = useState("");
  const [role, setRole]             = useState("");
  const [loading, setLoading]       = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();
  const router = useRouter();

  const hasItems = cart.length > 0;

  useEffect(() => {
    const fetchUserAndAgency = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase
        .from('profiles')
        .select(`full_name, role, agencies ( name )`)
        .eq('id', user.id)
        .single();

      if (data) {
        setUserName(data.full_name);
        setRole(data.role);
        // @ts-ignore
        setAgencyName(data.agencies?.name || "Agence Indépendante");
      }
      setLoading(false);
    };
    fetchUserAndAgency();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col selection:bg-blue-500/30">

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* HEADER LOGOS */}
      <header className="py-10 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-8 md:gap-16">
          <img src="/logo-imprimeur.png" alt="Mon Imprimerie" className="h-10 md:h-14 object-contain" />
          <div className="w-px h-10 bg-white/10 rotate-[20deg]"></div>
          <img src="/logo-hoquet.png" alt="Guy Hoquet" className="h-12 md:h-16 object-contain" />
        </div>
      </header>

      {/* BANNER */}
      <section className="w-full relative overflow-hidden">
        <div className="h-[180px] md:h-[280px] w-full relative">
          <img src="/banner-1.jpg" alt="Bannière" className="w-full h-full object-cover opacity-[0.07] scale-110" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f092e] via-transparent to-[#0f092e]"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
              Catalogue <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Print</span>
            </h2>
          </div>
        </div>
      </section>

      {/* NAV STICKY */}
      <div className="sticky top-0 z-50 border-y border-white/5 bg-[#0f092e]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">

            <div className="flex items-center gap-4 bg-white/[0.03] px-5 py-2.5 rounded-full border border-white/5">
              <span className={`h-2 w-2 rounded-full ${loading ? 'bg-white/20' : 'bg-green-500 shadow-[0_0_10px_#22c55e]'}`}></span>
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-black uppercase tracking-widest text-white/30 italic">Session :</span>
                {loading ? (
                  <span className="text-[13px] font-black uppercase text-white/20 animate-pulse italic">Initialisation...</span>
                ) : (
                  <span className="text-[13px] font-black uppercase text-white/90 tracking-tight">
                    {userName} <span className="text-blue-500/50 mx-1">@</span> <span className="text-blue-400">{agencyName}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-3">
              {!loading && (
                <>
                  {role === 'super_admin' && (
                    <Link href="/admin-portal" className="bg-white text-[#0f092e] hover:bg-blue-500 hover:text-white text-[12px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-xl active:scale-95 border border-white">
                      Dashboard Produits
                    </Link>
                  )}
                  {role === 'super_admin' && (
                    <Link href="/profil" className="bg-white/5 border border-white/10 hover:border-blue-500/50 text-white/70 hover:text-white text-[12px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all active:scale-95">
                      Mon Profil Admin
                    </Link>
                  )}
                  {role === 'admin_agence' && (
                    <Link href="/profil" className="bg-white/5 border border-white/10 hover:border-blue-500/50 text-white/70 hover:text-white text-[12px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all active:scale-95">
                      Infos Agence
                    </Link>
                  )}
                  {role !== 'super_admin' && (
                    <Link href="/dashboard/equipe" className="bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-blue-400 text-[12px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all">
                      Équipe
                    </Link>
                  )}
                </>
              )}

              <Link href="/panier" className="relative bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[12px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all">
                Panier ({cart.length})
                {hasItems && <span className="absolute -top-1.5 -right-1.5 h-3 w-3 bg-green-500 rounded-full border-2 border-[#0f092e] animate-bounce"></span>}
              </Link>

              {/* MODIFIER MOT DE PASSE */}
              <Link
                href="https://guyhoquet-print.fr/modification-mdp"
                className="text-[12px] font-black uppercase tracking-widest text-white/40 hover:text-white px-2 py-3 transition-colors"
              >
                Modifier mon mot de passe
              </Link>

              {/* DÉCONNEXION */}
              <button
                onClick={handleLogout}
                className="text-[12px] font-black uppercase tracking-widest text-red-500/40 hover:text-red-500 px-2 py-3 transition-colors"
              >
                Déconnexion
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* GRILLE — 2 en haut, 3 en bas */}
      <main className="flex-grow container mx-auto max-w-5xl px-6 py-20 space-y-8">

        {/* LIGNE 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <Link href="/perso" className="group">
            <div className="h-44 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 rounded-3xl flex flex-col items-center justify-center p-8 text-center transition-all duration-500 group-hover:bg-blue-600/10 group-hover:border-blue-500/40 group-hover:-translate-y-1 shadow-2xl">
              <span className="font-black text-xs uppercase tracking-widest text-white/80 group-hover:text-blue-400 transition-colors">Produits personnalisables</span>
              <div className="h-[2px] w-6 bg-blue-500 my-4 group-hover:w-20 transition-all duration-700"></div>
              <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] group-hover:text-blue-500/50">Sur-Mesure</span>
            </div>
          </Link>

          <Link href="/stock" className="group">
            <div className="h-44 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 rounded-3xl flex flex-col items-center justify-center p-8 text-center transition-all duration-500 group-hover:bg-green-600/10 group-hover:border-green-500/40 group-hover:-translate-y-1 shadow-2xl">
              <span className="font-black text-xs uppercase tracking-widest text-white/80 group-hover:text-green-400 transition-colors">Produits non personnalisés</span>
              <div className="h-[2px] w-6 bg-green-500 my-4 group-hover:w-20 transition-all duration-700"></div>
              <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] group-hover:text-green-500/50">Catalogue Direct</span>
            </div>
          </Link>

        </div>

        {/* LIGNE 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <Link href="/hoquet" className="group">
            <div className="h-44 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 rounded-3xl flex flex-col items-center justify-center p-8 text-center transition-all duration-500 group-hover:bg-orange-600/10 group-hover:border-orange-500/40 group-hover:-translate-y-1 shadow-2xl">
              <span className="font-black text-xs uppercase tracking-widest text-white/80 group-hover:text-orange-400 transition-colors">Gamme Business</span>
              <div className="h-[2px] w-6 bg-orange-500 my-4 group-hover:w-20 transition-all duration-700"></div>
              <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] group-hover:text-orange-500/50">Guy Hoquet Exclusive</span>
            </div>
          </Link>

          <Link href="/signaletique" className="group">
            <div className="h-44 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 rounded-3xl flex flex-col items-center justify-center p-8 text-center transition-all duration-500 group-hover:bg-cyan-600/10 group-hover:border-cyan-400/40 group-hover:-translate-y-1 shadow-2xl">
              <span className="font-black text-xs uppercase tracking-widest text-white/80 group-hover:text-cyan-400 transition-colors">Signalétique</span>
              <div className="h-[2px] w-6 bg-cyan-400 my-4 group-hover:w-20 transition-all duration-700"></div>
              <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] group-hover:text-cyan-400/50">Supports & Affichage</span>
            </div>
          </Link>

          <Link href="/operations" className="group">
            <div className="h-44 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 rounded-3xl flex flex-col items-center justify-center p-8 text-center transition-all duration-500 group-hover:bg-purple-600/15 group-hover:border-purple-500/50 group-hover:-translate-y-1 shadow-2xl">
              <span className="font-black text-xs uppercase tracking-widest text-white/80 group-hover:text-purple-400 transition-colors">Opérations du moment</span>
              <div className="h-[2px] w-6 bg-purple-500 my-4 group-hover:w-20 transition-all duration-700"></div>
              <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] group-hover:text-purple-500/50">Offres Ephémères</span>
            </div>
          </Link>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 bg-black/20 mt-auto">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center gap-4 text-center">
          <p className="text-xs font-bold text-white leading-relaxed">
            Besoin d'aide ? Suivi de commande, facturation, devis, fichiers ou toute autre question ?
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <a href="tel:0241870078" className="text-sm font-black text-white hover:text-blue-400 transition-colors tracking-widest">
              02 41 87 00 78
            </a>
            <span className="hidden sm:block w-px h-4 bg-white/20"></span>
            <a href="mailto:webtoprint@imprimerie-connivence.com" className="text-xs font-bold text-white hover:text-blue-400 transition-colors">
              webtoprint@imprimerie-connivence.com
            </a>
          </div>
        </div>
      </footer>

      {/* BOUTON PANIER FLOTTANT */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-white rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center z-[100] transition-all hover:scale-110 active:scale-90 group"
      >
        <div className="relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f092e" strokeWidth="2.5" className="group-hover:stroke-blue-500 transition-colors">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
            <path d="M3 6h18"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {cart.length > 0 && (
            <span className="absolute -top-3 -right-3 bg-blue-500 text-white text-[12px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-[#0f092e]">
              {cart.length}
            </span>
          )}
        </div>
      </button>

    </div>
  );
}