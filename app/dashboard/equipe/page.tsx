'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GestionEquipe() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [fonction, setFonction] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneFix, setPhoneFix] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [rsac, setRsac] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [membres, setMembres] = useState<any[]>([]);
  const [monAgencyId, setMonAgencyId] = useState<string | null>(null);
  const [monId, setMonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Téléphone fixe de l'agence (pré-rempli)
  const [agencyPhoneFix, setAgencyPhoneFix] = useState('');

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 800;
        let width = img.width;
        let height = img.height;
        if (width > MAX || height > MAX) {
          const ratio = Math.min(MAX / width, MAX / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size < 100) { resolve(file); return; }
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' }));
          },
          'image/webp',
          0.85
        );
      };
    });
  };

  const getCleanFileName = (file: File): string => {
    return `${Date.now()}-${file.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '-')}`;
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    const compressed = await compressImage(file);
    const fileName = getCleanFileName(compressed);
    const { error } = await supabase.storage.from('avatars').upload(fileName, compressed);
    if (error) return '';
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const chargerEquipe = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setMonId(user.id);

    const { data: profilAdmin } = await supabase
      .from('profiles').select('agency_id').eq('id', user.id).single();

    if (profilAdmin?.agency_id) {
      setMonAgencyId(profilAdmin.agency_id);

      // Récupère le téléphone fixe de l'agence pour pré-remplir
      const { data: agencyData } = await supabase
        .from('agencies')
        .select('phone_fix')
        .eq('id', profilAdmin.agency_id)
        .single();

      if (agencyData?.phone_fix) {
        setAgencyPhoneFix(agencyData.phone_fix);
        setPhoneFix(agencyData.phone_fix);
      }

      const { data: collabs } = await supabase
        .from('collaborateurs')
        .select('*')
        .eq('agency_id', profilAdmin.agency_id);

      const collabsTagged = (collabs || []).map(m => ({ ...m, _source: 'collaborateurs' }));
      setMembres(collabsTagged);
    }
    setLoading(false);
  };

  useEffect(() => { chargerEquipe(); }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleEditAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditAvatarFile(file);
    setEditAvatarPreview(URL.createObjectURL(file));
  };

  const ajouterCollaborateur = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monAgencyId) return;
    setSubmitting(true);

    const avatarUrl = avatarFile ? await uploadAvatar(avatarFile) : '';

    const { error } = await supabase.from('collaborateurs').insert([{
      first_name: prenom,
      last_name: nom,
      full_name: `${prenom} ${nom}`,
      email,
      fonction,
      phone,
      phone_fix: phoneFix,
      adresse,
      ville,
      code_postal: codePostal,
      rsac,
      avatar_url: avatarUrl,
      agency_id: monAgencyId,
    }]);

    if (!error) {
      setEmail(''); setPrenom(''); setNom(''); setFonction(''); setPhone('');
      setAdresse(''); setVille(''); setCodePostal(''); setRsac('');
      setPhoneFix(agencyPhoneFix); // remet le fixe de l'agence
      setAvatarFile(null); setAvatarPreview(null);
      chargerEquipe();
    } else {
      alert("Erreur : " + error.message);
    }
    setSubmitting(false);
  };

  const ouvrirEdition = (m: any) => {
    setEditId(m.id);
    setEditData({
      first_name: m.first_name || '',
      last_name: m.last_name || '',
      email: m.email || '',
      phone: m.phone || '',
      phone_fix: m.phone_fix || agencyPhoneFix,
      adresse: m.adresse || '',
      ville: m.ville || '',
      code_postal: m.code_postal || '',
      rsac: m.rsac || '',
      fonction: m.fonction || '',
      avatar_url: m.avatar_url || '',
    });
    setEditAvatarFile(null);
    setEditAvatarPreview(m.avatar_url || null);
  };

  const sauvegarderEdition = async (id: string) => {
    let avatarUrl = editData.avatar_url;
    if (editAvatarFile) {
      const newUrl = await uploadAvatar(editAvatarFile);
      if (newUrl) avatarUrl = newUrl;
    }

    const { error } = await supabase.from('collaborateurs').update({
      first_name: editData.first_name,
      last_name: editData.last_name,
      full_name: `${editData.first_name} ${editData.last_name}`,
      email: editData.email,
      phone: editData.phone,
      phone_fix: editData.phone_fix,
      adresse: editData.adresse,
      ville: editData.ville,
      code_postal: editData.code_postal,
      rsac: editData.rsac,
      fonction: editData.fonction,
      avatar_url: avatarUrl,
    }).eq('id', id);

    if (!error) {
      setEditId(null);
      chargerEquipe();
    } else {
      alert("Erreur : " + error.message);
    }
  };

  const supprimerMembre = async (id: string) => {
    if (confirm("Supprimer ce collaborateur définitivement ?")) {
      const { error } = await supabase.from('collaborateurs').delete().eq('id', id);
      if (!error) setMembres(membres.filter(m => m.id !== id));
      else alert("Erreur : " + error.message);
    }
  };

  if (loading) return (
    <div className="p-20 text-white font-black uppercase text-[10px] tracking-widest animate-pulse">
      Chargement de l'agence...
    </div>
  );

  const inputClass = "bg-white/10 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 text-sm transition-all text-white placeholder:text-white/20";
  const editInputClass = "bg-white/10 border border-white/10 p-3 rounded-2xl outline-none focus:border-blue-500 text-sm text-white placeholder:text-white/20";
  const labelClass = "text-[8px] font-black uppercase tracking-widest text-white/30 mb-1 block";

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-6 md:p-12 selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* EN-TÊTE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-blue-400 transition-all group w-fit">
            <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Retour
          </button>
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            <button className="bg-blue-600 px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter shadow-lg shadow-blue-900/40">Équipe</button>
            <Link href="/dashboard/commandes" className="px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter text-white/40 hover:text-white transition-colors">Historique Achats</Link>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">Espace Agence</h1>
            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.3em]">Équipe & Collaborateurs</p>
          </div>
        </div>

        {/* FORMULAIRE AJOUT */}
        <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl shadow-2xl">
          <h2 className="text-xl font-black uppercase mb-6 text-blue-500 tracking-tighter italic">Nouveau Collaborateur</h2>
          <form onSubmit={ajouterCollaborateur} className="space-y-6">

            {/* AVATAR */}
            <div className="flex items-center gap-6">
              <div onClick={() => fileInputRef.current?.click()} className="h-20 w-20 rounded-full border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all overflow-hidden shrink-0">
                {avatarPreview
                  ? <img src={avatarPreview} className="h-full w-full object-cover" alt="preview" />
                  : <span className="text-2xl">📷</span>
                }
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Photo de profil</p>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 text-[9px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors">
                  Choisir une photo →
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>

            {/* IDENTITÉ */}
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-3">— Identité</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClass}>Prénom</label>
                  <input type="text" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} className={inputClass} required /></div>
                <div><label className={labelClass}>Nom</label>
                  <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} className={inputClass} required /></div>
                <div><label className={labelClass}>Fonction</label>
                  <input type="text" placeholder="Négociateur, Directeur..." value={fonction} onChange={(e) => setFonction(e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>RSAC</label>
                  <input type="text" placeholder="Ex: 123 456 789" value={rsac} onChange={(e) => setRsac(e.target.value)} className={inputClass} /></div>
              </div>
            </div>

            {/* CONTACT */}
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-3">— Contact</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClass}>Email professionnel</label>
                  <input type="email" placeholder="prenom@agence.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required /></div>
                <div><label className={labelClass}>Téléphone mobile</label>
                  <input type="tel" placeholder="06 00 00 00 00" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} /></div>
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Téléphone fixe agence
                    {agencyPhoneFix && <span className="ml-2 text-blue-400/60 normal-case font-bold tracking-normal">pré-rempli depuis l'agence</span>}
                  </label>
                  <input type="tel" placeholder="02 00 00 00 00" value={phoneFix} onChange={(e) => setPhoneFix(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            {/* ADRESSE */}
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-3">— Adresse</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className={labelClass}>Adresse</label>
                  <input type="text" placeholder="12 rue de la Paix" value={adresse} onChange={(e) => setAdresse(e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Ville</label>
                  <input type="text" placeholder="Angers" value={ville} onChange={(e) => setVille(e.target.value)} className={inputClass} /></div>
                <div><label className={labelClass}>Code postal</label>
                  <input type="text" placeholder="49000" value={codePostal} onChange={(e) => setCodePostal(e.target.value)} className={inputClass} /></div>
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full bg-blue-600 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50">
              {submitting ? 'Compression & ajout en cours...' : 'Ajouter au répertoire'}
            </button>
          </form>
        </div>

        {/* LISTE */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/30 italic">Répertoire de l'agence</h2>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
              {membres.length} Membres
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {membres.length === 0 && (
              <div className="text-center py-16 text-white/20 font-black uppercase text-[10px] tracking-widest">
                Aucun collaborateur — ajoutez-en un ci-dessus
              </div>
            )}

            {membres.map((m) => (
              <div key={m.id} className="bg-white/5 border border-white/5 rounded-[35px] overflow-hidden shadow-xl transition-all duration-300 hover:border-white/20">

                {/* LIGNE NORMALE */}
                {editId !== m.id && (
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center shadow-2xl shrink-0">
                        {m.avatar_url
                          ? <img src={m.avatar_url} alt={m.first_name} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          : <span className="text-xs font-black text-white/20 uppercase">{m.first_name?.[0]}{m.last_name?.[0]}</span>
                        }
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-black uppercase tracking-tight">{m.first_name} {m.last_name}</div>
                        <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{m.fonction || '—'}</div>
                        {m.rsac && <div className="text-[8px] font-bold text-blue-400/50 uppercase tracking-widest">RSAC {m.rsac}</div>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-grow px-0 md:px-8">
                      <div className="flex flex-col gap-1">
                        <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Email</span>
                        <span className="text-[10px] font-medium text-white/70 truncate max-w-[140px]">{m.email || '—'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Mobile</span>
                        <span className="text-[10px] font-medium text-white/70">{m.phone || '—'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Fixe</span>
                        <span className="text-[10px] font-medium text-white/70">{m.phone_fix || '—'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Ville</span>
                        <span className="text-[10px] font-medium text-white/70">{m.ville ? `${m.ville}${m.code_postal ? ` (${m.code_postal})` : ''}` : '—'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button onClick={() => ouvrirEdition(m)}
                        className="bg-white/5 hover:bg-blue-600 text-white/50 hover:text-white text-[8px] font-black uppercase px-5 py-3 rounded-xl transition-all border border-white/10 hover:border-blue-500">
                        Modifier
                      </button>
                      <button onClick={() => supprimerMembre(m.id)}
                        className="bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white text-[8px] font-black uppercase px-5 py-3 rounded-xl transition-all border border-red-500/20">
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}

                {/* FORMULAIRE ÉDITION INLINE */}
                {editId === m.id && (
                  <div className="p-6 space-y-5 bg-white/[0.03]">
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Modifier le collaborateur</p>

                    {/* AVATAR EDIT */}
                    <div className="flex items-center gap-4">
                      <div onClick={() => editFileInputRef.current?.click()}
                        className="h-16 w-16 rounded-full border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all overflow-hidden shrink-0">
                        {editAvatarPreview
                          ? <img src={editAvatarPreview} className="h-full w-full object-cover" alt="preview" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          : <span className="text-xl">📷</span>
                        }
                      </div>
                      <button type="button" onClick={() => editFileInputRef.current?.click()}
                        className="text-[9px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors">
                        Changer la photo →
                      </button>
                      <input ref={editFileInputRef} type="file" accept="image/*" onChange={handleEditAvatarChange} className="hidden" />
                    </div>

                    {/* IDENTITÉ EDIT */}
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-2">— Identité</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="text" placeholder="Prénom" value={editData.first_name}
                          onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                          className={editInputClass} />
                        <input type="text" placeholder="Nom" value={editData.last_name}
                          onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                          className={editInputClass} />
                        <input type="text" placeholder="Fonction" value={editData.fonction}
                          onChange={(e) => setEditData({ ...editData, fonction: e.target.value })}
                          className={editInputClass} />
                        <input type="text" placeholder="RSAC (ex: 123 456 789)" value={editData.rsac}
                          onChange={(e) => setEditData({ ...editData, rsac: e.target.value })}
                          className={editInputClass} />
                      </div>
                    </div>

                    {/* CONTACT EDIT */}
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-2">— Contact</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="email" placeholder="Email" value={editData.email}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          className={editInputClass} />
                        <input type="tel" placeholder="Téléphone mobile" value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          className={editInputClass} />
                        <input type="tel" placeholder="Téléphone fixe" value={editData.phone_fix}
                          onChange={(e) => setEditData({ ...editData, phone_fix: e.target.value })}
                          className={`${editInputClass} md:col-span-2`} />
                      </div>
                    </div>

                    {/* ADRESSE EDIT */}
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-2">— Adresse</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="text" placeholder="Adresse" value={editData.adresse}
                          onChange={(e) => setEditData({ ...editData, adresse: e.target.value })}
                          className={`${editInputClass} md:col-span-2`} />
                        <input type="text" placeholder="Ville" value={editData.ville}
                          onChange={(e) => setEditData({ ...editData, ville: e.target.value })}
                          className={editInputClass} />
                        <input type="text" placeholder="Code postal" value={editData.code_postal}
                          onChange={(e) => setEditData({ ...editData, code_postal: e.target.value })}
                          className={editInputClass} />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => sauvegarderEdition(m.id)}
                        className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">
                        Sauvegarder
                      </button>
                      <button onClick={() => setEditId(null)}
                        className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white/50 transition-all">
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}