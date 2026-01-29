'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function GestionEquipe() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [roleChoisi, setRoleChoisi] = useState('collaborateur'); // Par défaut
  const [monAgencyId, setMonAgencyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgency = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('profiles').select('agency_id').eq('id', user?.id).single();
      if (data) setMonAgencyId(data.agency_id);
    };
    fetchAgency();
  }, []);

  const creerCompte = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Créer le compte dans l'Auth de Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return alert(authError.message);

    if (authData.user && monAgencyId) {
      // 2. Créer le profil avec le rôle sélectionné
      const { error: profileError } = await supabase.from('profiles').insert([
        { 
          id: authData.user.id, 
          full_name: nom, 
          role: roleChoisi, // ICI on utilise la variable de l'état
          agency_id: monAgencyId 
        }
      ]);

      if (profileError) alert(profileError.message);
      else alert(`Compte ${roleChoisi} créé avec succès !`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-10">
      <div className="max-w-md mx-auto bg-white/5 p-8 rounded-3xl border border-white/10">
        <h1 className="text-xl font-black uppercase mb-6">Ajouter un membre</h1>
        <form onSubmit={creerCompte} className="space-y-4">
          <input type="text" placeholder="Nom complet" onChange={(e) => setNom(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500" required />
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500" required />
          <input type="password" placeholder="Mot de passe" onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500" required />
          
          {/* LE CHOIX DU RÔLE */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/30">Attribuer un rôle :</label>
            <select 
              value={roleChoisi} 
              onChange={(e) => setRoleChoisi(e.target.value)}
              className="w-full bg-[#1a133d] border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500 text-sm"
            >
              <option value="collaborateur">Collaborateur (Accès simple)</option>
              <option value="admin_agence">Admin Agence (Peut gérer l'équipe)</option>
            </select>
          </div>

          <button className="w-full bg-blue-600 p-4 rounded-xl font-bold uppercase text-[10px] tracking-widest mt-4">Créer le compte</button>
        </form>
      </div>
    </div>
  );
}