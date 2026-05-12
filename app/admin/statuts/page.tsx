'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function StatusPage() {
  const [testLoading, setTestLoading] = useState(false);
  const [status, setStatus] = useState({
    supabase: 'chargement...',
    auth: 'chargement...',
    lastOrder: 'chargement...'
  });

  // 1. Vérification automatique au chargement
  useEffect(() => {
    checkHealth();
  }, []);

  async function checkHealth() {
    try {
      // Test Connexion Base de données
      const start = Date.now();
      const { error: dbError } = await supabase.from('products').select('id').limit(1);
      const latency = Date.now() - start;
      
      // Test Session Utilisateur
      const { data: sessionData } = await supabase.auth.getSession();

      // Récupérer la toute dernière commande pour voir si le flux est actif
      const { data: lastOrder } = await supabase.from('orders')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      setStatus({
        supabase: dbError ? '🔴 ERREUR DB' : `🟢 OPÉRATIONNEL (${latency}ms)`,
        auth: sessionData.session ? '🟢 SESSION ACTIVE' : '🟠 AUCUNE SESSION',
        lastOrder: lastOrder?.[0] 
          ? `🟢 DERNIÈRE : ${new Date(lastOrder[0].created_at).toLocaleString()}` 
          : '⚪ AUCUNE COMMANDE'
      });

    } catch (e) {
      console.error(e);
      setStatus(prev => ({ ...prev, supabase: '🔴 ÉCHEC CRITIQUE' }));
    }
  }

  // 2. Fonction de TEST RÉEL (Envoie une ligne fantôme vers Sheets)
  async function runRealTest() {
    setTestLoading(true);
    try {
      const { error } = await supabase.from('orders').insert([{
        agency_name: "⚠️ TEST SYSTÈME",
        client_email: "test-auto@guyhoquet.com",
        client_phone: "0000000000",
        delivery_address: "123 RUE DU TEST (A EFFACER)",
        zip_code: "00000",
        city: "TEST VILLE",
        siret: "00000000000000",
        produits_liste: "VÉRIFICATION FLUX MAKE",
        quantite_liste: "1",
        total_ht: 0,
        instructions: "Ceci est un test pour vérifier la liaison Supabase <> Make <> Sheets.",
        status: 'Test'
      }]);

      if (error) throw error;
      
      alert("✅ SIGNAL ENVOYÉ !\n\nLa ligne a été créée dans Supabase.\nRegarde ton Google Sheets : elle devrait apparaître dans quelques secondes.");
      checkHealth(); // Rafraîchir les stats
    } catch (e: any) {
      alert("❌ ÉCHEC DU TEST : " + e.message);
    } finally {
      setTestLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans p-8 md:p-20">
      <header className="max-w-4xl mx-auto mb-16 flex justify-between items-center">
        <div>
          <h1 className="text-[13px] font-black uppercase tracking-[0.5em] text-blue-500 mb-2">System Monitor v1.0</h1>
          <p className="text-2xl font-black italic uppercase tracking-tighter">État des services</p>
        </div>
        <Link href="/" className="text-[12px] font-black uppercase border border-white/20 px-6 py-3 rounded-full hover:bg-white hover:text-[#0f092e] transition-all">
          Retour Site
        </Link>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        {/* GRILLE DE STATUS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatusCard title="Connexion Supabase" value={status.supabase} />
          <StatusCard title="État Authentification" value={status.auth} />
          <StatusCard title="Flux de Commandes" value={status.lastOrder} />
        </div>

        {/* SECTION TEST DE TRANSMISSION */}
        <div className="mt-12 bg-white/[0.03] border border-blue-500/20 rounded-[50px] p-10 md:p-16 text-center">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-blue-400 mb-4">Test de bout en bout</h2>
          <p className="text-white/40 text-sm max-w-md mx-auto mb-10 uppercase font-bold italic leading-relaxed">
            Cliquez sur le bouton ci-dessous pour simuler une commande réelle et vérifier que Make.com transmet bien les infos à Google Sheets.
          </p>
          
          <button 
            onClick={runRealTest} 
            disabled={testLoading}
            className={`
              relative overflow-hidden group px-12 py-6 rounded-3xl font-black uppercase text-[11px] tracking-[0.2em] transition-all
              ${testLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.3)]'}
            `}
          >
            <span className={testLoading ? 'opacity-0' : 'opacity-100'}>
              {testLoading ? 'Transmission...' : 'Lancer le test de flux'}
            </span>
            {testLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </button>
        </div>

        {/* LOGS RAPIDES */}
        <div className="pt-10 text-center">
          <button onClick={checkHealth} className="text-[11px] font-black uppercase opacity-30 hover:opacity-100 transition-all tracking-[0.3em]">
            🔄 Rafraîchir les diagnostics
          </button>
        </div>
      </main>
    </div>
  );
}

// Composant Carte de Statut
function StatusCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[40px] hover:border-blue-500/30 transition-colors">
      <p className="text-[11px] font-black uppercase opacity-30 mb-3 tracking-widest">{title}</p>
      <p className="text-sm font-black uppercase italic tracking-tight">{value}</p>
    </div>
  );
}