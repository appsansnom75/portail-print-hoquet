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

    const { data: profilAdmin } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single();

    if (profilAdmin?.agency_id) {
      setMonAgencyId(profilAdmin.agency_id);
      
      const { data: liste } = await supabase
        .from('profiles')
        .select('*')
        .eq('agency_id', profilAdmin.agency_id)
        .order('role', { ascending: true });
      
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
            agency_id: monAgencyId,
            phone: '', // Initialisé vide
            siret: ''  // Initialisé vide
        }]);

      if (!profileError) {
        alert("Nouveau membre ajouté !");
        setEmail(''); setPassword(''); setPrenom(''); setNom('');
        chargerEquipe();
      }
    }
  };

  const supprimerMembre = async (id: string) => {
    if (id === monId) return alert("Opération impossible sur votre compte.");
    if (confirm("Supprimer ce membre définitivement ?")) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) chargerEquipe();
    }
  };

  if (loading) return <div className="p-20 text-white font-black uppercase text-[10px]">Chargement de l'agence...</div>;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* FORMULAIRE D'AJOUT */}
        <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl">
          <h2 className="text-xl font-black uppercase mb-6 text-blue-500 tracking-tighter italic">Nouveau Collaborateur</h2>
          <form onSubmit={creerCompte} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input type="text" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 text-sm" required />
            <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 text-sm" required />
            <input type="email" placeholder="Email professionnel" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 text-sm" required />
            <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 text-sm" required />
            <select value={roleChoisi} onChange={(e) => setRoleChoisi(e.target.value)} className="bg-[#1a133d] border border-white/10 p-4 rounded-2xl outline-none text-[10px] font-black uppercase">
              <option value="collaborateur">Collaborateur</option>
              <option value="admin_agence">Administrateur</option>
            </select>
            <button className="bg-blue-600 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">Créer le compte</button>
          </form>
        </div>

        {/* LISTE DÉTAILLÉE DE L'ÉQUIPE */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/30 italic">Répertoire de l'agence</h2>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">{membres.length} Membres</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {membres.map((m) => (
              <div key={m.id} className="relative group overflow-hidden bg-white/5 border border-white/5 p-6 rounded-[35px] hover:bg-white/[0.07] transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Identité */}
                  <div className="flex items-start gap-5">
                    <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${m.role === 'admin_agence' ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]'}`}></div>
                    <div className="space-y-1">
                      <div className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                        {m.first_name} {m.last_name}
                        {m.id === monId && <span className="text-[7px] bg-blue-500 text-white px-2 py-0.5 rounded-md font-black">VOUS</span>}
                      </div>
                      <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                        {m.role === 'admin_agence' ? 'Administrateur Agence' : 'Collaborateur'}
                      </div>
                    </div>
                  </div>

                  {/* Coordonnées */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow px-0 md:px-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Contact</span>
                      <span className="text-[10px] font-medium text-white/70">{m.email || 'Pas d\'email'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Téléphone</span>
                      <span className="text-[10px] font-medium text-white/70">{m.phone || '—'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">N° SIRET</span>
                      <span className="text-[10px] font-medium text-white/70 tracking-widest font-mono">{m.siret || '—'}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  {m.id !== monId && (
                    <button 
                      onClick={() => supprimerMembre(m.id)} 
                      className="shrink-0 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[8px] font-black uppercase px-4 py-2 rounded-xl transition-all"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}