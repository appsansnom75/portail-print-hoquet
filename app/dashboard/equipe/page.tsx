'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function GestionEquipe() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [roleChoisi, setRoleChoisi] = useState('collaborateur');
  
  const [membres, setMembres] = useState<any[]>([]);
  const [monAgencyId, setMonAgencyId] = useState<string | null>(null);
  const [monId, setMonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const chargerEquipe = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setMonId(user.id);

    // 1. Récupérer l'ID d'agence de l'admin connecté
    const { data: profilAdmin } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single();

    if (profilAdmin?.agency_id) {
      setMonAgencyId(profilAdmin.agency_id);
      
      // 2. Récupérer TOUS les profils (Admins ET Collaborateurs) de cette agence
      const { data: liste } = await supabase
        .from('profiles')
        .select('*')
        .eq('agency_id', profilAdmin.agency_id)
        .order('role', { ascending: true }); // Trie pour mettre les admins en haut
      
      setMembres(liste || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    chargerEquipe();
  }, []);

  const creerCompte = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return alert(authError.message);

    if (authData.user && monAgencyId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
            id: authData.user.id, 
            first_name: prenom, 
            last_name: nom,
            full_name: `${prenom} ${nom}`,
            role: roleChoisi, 
            agency_id: monAgencyId 
        }]);

      if (!profileError) {
        alert("Nouveau membre ajouté !");
        setEmail(''); setPassword(''); setPrenom(''); setNom('');
        chargerEquipe(); // Recharge la liste incluant le nouveau
      }
    }
  };

  const supprimerMembre = async (id: string) => {
    if (id === monId) return alert("Vous ne pouvez pas vous supprimer vous-même !");
    if (confirm("Supprimer ce membre définitivement ?")) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) chargerEquipe();
    }
  };

  if (loading) return <div className="p-20 text-white font-black uppercase text-[10px]">Chargement de l'agence...</div>;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* FORMULAIRE D'AJOUT */}
        <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl">
          <h2 className="text-xl font-black uppercase mb-6 text-blue-500 tracking-tighter">Ajouter un Membre</h2>
          <form onSubmit={creerCompte} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 font-medium" required />
            <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 font-medium" required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 font-medium" required />
            <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 font-medium" required />
            <select value={roleChoisi} onChange={(e) => setRoleChoisi(e.target.value)} className="bg-[#1a133d] border border-white/10 p-4 rounded-2xl outline-none text-[10px] font-black uppercase">
              <option value="collaborateur">Collaborateur</option>
              <option value="admin_agence">Administrateur</option>
            </select>
            <button className="md:col-span-2 bg-blue-600 p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">Créer le compte</button>
          </form>
        </div>

        {/* LISTE TOUTE L'ÉQUIPE */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/30 px-4 italic">Membres de l'agence</h2>
          <div className="grid grid-cols-1 gap-3">
            {membres.map((m) => (
              <div key={m.id} className="flex items-center justify-between bg-white/5 border border-white/5 p-6 rounded-[35px] hover:border-white/20 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`h-2.5 w-2.5 rounded-full ${m.role === 'admin_agence' ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]' : 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]'}`}></div>
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-tight flex items-center gap-2">
                      {m.first_name} {m.last_name}
                      {m.id === monId && <span className="text-[7px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 font-bold ml-2">MOI</span>}
                    </div>
                    <div className="text-[8px] font-bold uppercase text-white/20 tracking-widest mt-1">
                      {m.role === 'admin_agence' ? 'Administrateur Agence' : 'Collaborateur'}
                    </div>
                  </div>
                </div>
                
                {m.id !== monId && (
                  <button onClick={() => supprimerMembre(m.id)} className="text-[9px] font-black uppercase text-red-500/40 hover:text-red-500 transition-colors px-4">
                    Supprimer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}