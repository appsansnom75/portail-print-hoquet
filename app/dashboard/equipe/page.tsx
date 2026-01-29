'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function GestionEquipe() {
  // Formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [roleChoisi, setRoleChoisi] = useState('collaborateur');
  
  // Données
  const [membres, setMembres] = useState<any[]>([]);
  const [monAgencyId, setMonAgencyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger les membres au démarrage
  const chargerEquipe = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Récupérer l'ID d'agence de l'admin
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
        .order('created_at', { ascending: false }); // Les nouveaux en haut
      
      setMembres(liste || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    chargerEquipe();
  }, []);

  const creerCompte = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Création dans l'Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return alert("Erreur Auth : " + authError.message);

    if (authData.user && monAgencyId) {
      // 2. Création dans la table Profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: authData.user.id, 
            first_name: prenom, 
            last_name: nom,
            full_name: `${prenom} ${nom}`,
            role: roleChoisi, 
            agency_id: monAgencyId 
          }
        ]);

      if (profileError) {
        alert("Erreur Profil : " + profileError.message);
      } else {
        alert("Utilisateur créé et ajouté à l'équipe !");
        
        // 3. RÉINITIALISER LE FORMULAIRE
        setEmail('');
        setPassword('');
        setPrenom('');
        setNom('');

        // 4. METTRE À JOUR LA LISTE IMMÉDIATEMENT
        // On relance la fonction de chargement pour voir le nouveau membre
        chargerEquipe();
      }
    }
  };

  if (loading) return <div className="p-20 text-white font-black uppercase text-[10px] animate-pulse">Chargement de l'équipe...</div>;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* FORMULAIRE */}
        <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl">
          <h1 className="text-xl font-black uppercase mb-6 tracking-tighter">Ajouter un collaborateur</h1>
          <form onSubmit={creerCompte} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500" required />
            <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500" required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500" required />
            <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500" required />
            
            <select value={roleChoisi} onChange={(e) => setRoleChoisi(e.target.value)} className="bg-[#1a133d] border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 font-bold text-[10px] uppercase">
              <option value="collaborateur">Collaborateur</option>
              <option value="admin_agence">Admin Agence</option>
            </select>

            <button type="submit" className="md:col-span-2 bg-blue-600 hover:bg-blue-500 p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">
              Créer le compte
            </button>
          </form>
        </div>

        {/* LISTE DES MEMBRES */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest px-4 text-white/40">Membres actuels</h2>
          <div className="space-y-2">
            {membres.length === 0 ? (
              <p className="px-4 text-xs text-white/20 uppercase font-bold">Aucun membre trouvé.</p>
            ) : (
              membres.map((m) => (
                <div key={m.id} className="flex items-center justify-between bg-white/5 border border-white/5 p-5 rounded-[30px] hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`h-2 w-2 rounded-full ${m.role === 'admin_agence' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-green-500'}`}></div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-tight text-white/90">{m.first_name} {m.last_name}</div>
                      <div className="text-[7px] font-bold uppercase text-white/20 tracking-[0.2em]">{m.role}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}