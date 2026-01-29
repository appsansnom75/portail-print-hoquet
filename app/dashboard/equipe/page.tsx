'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function GestionEquipe() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [roleChoisi, setRoleChoisi] = useState('collaborateur');
  const [membres, setMembres] = useState<any[]>([]);
  const [monAgencyId, setMonAgencyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Charger l'agence et la liste des membres
  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Récupérer mon agency_id
    const { data: profil } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single();

    if (profil?.agency_id) {
      setMonAgencyId(profil.agency_id);
      
      // Récupérer tous les membres de cette agence
      const { data: liste } = await supabase
        .from('profiles')
        .select('*')
        .eq('agency_id', profil.agency_id);
      
      setMembres(liste || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Créer un nouveau compte
  const creerCompte = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return alert(authError.message);

    if (authData.user && monAgencyId) {
      await supabase.from('profiles').insert([
        { id: authData.user.id, full_name: nom, role: roleChoisi, agency_id: monAgencyId }
      ]);
      alert("Membre ajouté !");
      setEmail(''); setPassword(''); setNom('');
      fetchData(); // Rafraîchir la liste
    }
  };

  // 3. Supprimer un membre (uniquement de la table profiles pour ce test)
  const supprimerMembre = async (id: string) => {
    if (confirm("Supprimer ce membre de l'agence ?")) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchData();
    }
  };

  if (loading) return <div className="p-20 text-white animate-pulse">Chargement de l'équipe...</div>;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* FORMULAIRE D'AJOUT */}
        <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl">
          <h2 className="text-xl font-black uppercase mb-6 text-blue-500">Ajouter un nouveau membre</h2>
          <form onSubmit={creerCompte} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Nom complet" value={nom} onChange={(e) => setNom(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500" required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500" required />
            <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500" required />
            <select value={roleChoisi} onChange={(e) => setRoleChoisi(e.target.value)} className="bg-[#1a133d] border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 uppercase text-[10px] font-black">
              <option value="collaborateur">Collaborateur</option>
              <option value="admin_agence">Admin Agence</option>
            </select>
            <button className="md:col-span-2 bg-blue-600 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all">Créer le compte membre</button>
          </form>
        </div>

        {/* LISTE DES MEMBRES */}
        <div className="space-y-4">
          <h2 className="text-xl font-black uppercase px-4">Membres de l'agence</h2>
          <div className="grid grid-cols-1 gap-2">
            {membres.map((membre) => (
              <div key={membre.id} className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-3xl hover:border-white/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`h-2 w-2 rounded-full ${membre.role === 'admin_agence' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-tight">{membre.full_name}</div>
                    <div className="text-[8px] font-bold uppercase text-white/30 tracking-widest">{membre.role}</div>
                  </div>
                </div>
                <button 
                  onClick={() => supprimerMembre(membre.id)}
                  className="text-[8px] font-black uppercase text-red-500/50 hover:text-red-500 px-4 py-2 transition-all"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}