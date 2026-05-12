'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


// ── Composant Field EN DEHORS du composant principal ──
const Field = ({
  label, value, onChange, placeholder, type = 'text', span2 = false, prefilled = false
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string; span2?: boolean; prefilled?: boolean;
}) => (
  <div className={span2 ? 'md:col-span-2' : ''}>
    <label className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-white/30 mb-1.5 ml-1">
      {label}
      {prefilled && value && (
        <span className="text-blue-400/50 normal-case font-bold tracking-normal text-[7px]">· agence</span>
      )}
    </label>
    <input
      type={type} value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/[0.06] border border-white/10 px-4 py-3.5 rounded-2xl outline-none focus:border-blue-500 focus:bg-white/[0.09] transition-all text-sm text-white font-medium placeholder:text-white/20"
    />
  </div>
);


export default function GestionEquipe() {
  const router = useRouter();

  // ── Champs formulaire ajout ──
  const [email, setEmail]           = useState('');
  const [prenom, setPrenom]         = useState('');
  const [nom, setNom]               = useState('');
  const [fonction, setFonction]     = useState('');
  const [phone, setPhone]           = useState('');
  const [phoneFix, setPhoneFix]     = useState('');
  const [adresse, setAdresse]       = useState('');
  const [ville, setVille]           = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [rsac, setRsac]             = useState('');
  const [avatarFile, setAvatarFile]             = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview]       = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── State global ──
  const [membres, setMembres]           = useState<any[]>([]);
  const [monAgencyId, setMonAgencyId]   = useState<string | null>(null);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);

  // ── Edition inline ──
  const [editId, setEditId]                       = useState<string | null>(null);
  const [editData, setEditData]                   = useState<any>({});
  const [editAvatarFile, setEditAvatarFile]       = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // ── Données agence pour pré-remplissage ──
  const [agencyDefaults, setAgencyDefaults] = useState({
    phone_fix: '',
    adresse: '',
    ville: '',
    code_postal: '',
  });


  // ─────────────────────────────────────────
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) { const r = Math.min(MAX/w, MAX/h); w = Math.round(w*r); h = Math.round(h*r); }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => {
          if (!blob || blob.size < 100) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' }));
        }, 'image/webp', 0.85);
      };
    });
  };

  const getCleanFileName = (file: File) =>
    `${Date.now()}-${file.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]/g,'-')}`;

  const uploadAvatar = async (file: File): Promise<string> => {
    const compressed = await compressImage(file);
    const fileName = getCleanFileName(compressed);
    const { error } = await supabase.storage.from('avatars').upload(fileName, compressed);
    if (error) return '';
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
  };


  // ─────────────────────────────────────────
  const chargerEquipe = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profilAdmin } = await supabase
      .from('profiles').select('agency_id').eq('id', user.id).single();

    if (profilAdmin?.agency_id) {
      setMonAgencyId(profilAdmin.agency_id);

      const { data: agence } = await supabase
        .from('agencies')
        .select('phone_fix, adresse, ville, code_postal')
        .eq('id', profilAdmin.agency_id)
        .single();

      if (agence) {
        const defaults = {
          phone_fix:   agence.phone_fix   || '',
          adresse:     agence.adresse     || '',
          ville:       agence.ville       || '',
          code_postal: agence.code_postal || '',
        };
        setAgencyDefaults(defaults);
        setPhoneFix(defaults.phone_fix);
        setAdresse(defaults.adresse);
        setVille(defaults.ville);
        setCodePostal(defaults.code_postal);
      }

      const { data: collabs } = await supabase
        .from('collaborateurs')
        .select('*')
        .eq('agency_id', profilAdmin.agency_id);

      setMembres((collabs || []).map(m => ({ ...m, _source: 'collaborateurs' })));
    }
    setLoading(false);
  };

  useEffect(() => { chargerEquipe(); }, []);


  // ─────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file));
  };
  const handleEditAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setEditAvatarFile(file); setEditAvatarPreview(URL.createObjectURL(file));
  };


  // ─────────────────────────────────────────
  const ajouterCollaborateur = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monAgencyId) return;
    setSubmitting(true);
    const avatarUrl = avatarFile ? await uploadAvatar(avatarFile) : '';
    const { error } = await supabase.from('collaborateurs').insert([{
      first_name:  prenom,
      last_name:   nom,
      full_name:   `${prenom} ${nom}`,
      email,
      fonction,
      phone,
      phone_fix:   phoneFix,
      adresse,
      ville,
      code_postal: codePostal,
      rsac,
      avatar_url:  avatarUrl,
      agency_id:   monAgencyId,
    }]);
    if (!error) {
      setEmail(''); setPrenom(''); setNom(''); setFonction(''); setPhone(''); setRsac('');
      setAvatarFile(null); setAvatarPreview(null);
      setPhoneFix(agencyDefaults.phone_fix);
      setAdresse(agencyDefaults.adresse);
      setVille(agencyDefaults.ville);
      setCodePostal(agencyDefaults.code_postal);
      chargerEquipe();
    } else { alert("Erreur : " + error.message); }
    setSubmitting(false);
  };


  // ─────────────────────────────────────────
  const ouvrirEdition = (m: any) => {
    setEditId(m.id);
    setEditData({
      first_name:  m.first_name  || '',
      last_name:   m.last_name   || '',
      email:       m.email       || '',
      phone:       m.phone       || '',
      phone_fix:   m.phone_fix   || agencyDefaults.phone_fix,
      fonction:    m.fonction    || '',
      adresse:     m.adresse     || agencyDefaults.adresse,
      ville:       m.ville       || agencyDefaults.ville,
      code_postal: m.code_postal || agencyDefaults.code_postal,
      rsac:        m.rsac        || '',
      avatar_url:  m.avatar_url  || '',
    });
    setEditAvatarFile(null);
    setEditAvatarPreview(m.avatar_url || null);
  };

  const sauvegarderEdition = async (id: string) => {
    let avatarUrl = editData.avatar_url;
    if (editAvatarFile) { const u = await uploadAvatar(editAvatarFile); if (u) avatarUrl = u; }
    const { error } = await supabase.from('collaborateurs').update({
      first_name:  editData.first_name,
      last_name:   editData.last_name,
      full_name:   `${editData.first_name} ${editData.last_name}`,
      email:       editData.email,
      phone:       editData.phone,
      phone_fix:   editData.phone_fix,
      fonction:    editData.fonction,
      adresse:     editData.adresse,
      ville:       editData.ville,
      code_postal: editData.code_postal,
      rsac:        editData.rsac,
      avatar_url:  avatarUrl,
    }).eq('id', id);
    if (!error) { setEditId(null); chargerEquipe(); }
    else alert("Erreur : " + error.message);
  };

  const supprimerMembre = async (id: string) => {
    if (!confirm("Supprimer ce collaborateur définitivement ?")) return;
    const { error } = await supabase.from('collaborateurs').delete().eq('id', id);
    if (!error) setMembres(membres.filter(m => m.id !== id));
    else alert("Erreur : " + error.message);
  };


  // ─────────────────────────────────────────
  if (loading) return (
    <div className="p-20 text-white font-black uppercase text-[10px] tracking-widest animate-pulse">
      Chargement de l'agence...
    </div>
  );

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


        {/* ── FORMULAIRE AJOUT ── */}
        <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl shadow-2xl">
          <h2 className="text-xl font-black uppercase mb-8 text-blue-500 tracking-tighter italic">Nouveau Collaborateur</h2>

          <form onSubmit={ajouterCollaborateur} className="space-y-8">

            {/* PHOTO */}
            <div className="flex items-center gap-6">
              <div onClick={() => fileInputRef.current?.click()}
                className="h-20 w-20 rounded-full border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all overflow-hidden shrink-0">
                {avatarPreview
                  ? <img src={avatarPreview} className="h-full w-full object-cover" alt="preview" />
                  : <span className="text-2xl">📷</span>}
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Photo de profil <span className="text-white/20 normal-case font-medium">(optionnelle)</span></p>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="text-[9px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors">
                  Choisir une photo →
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>

            {/* SECTION IDENTITÉ */}
            <div className="space-y-4">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2">
                <span className="w-4 h-px bg-white/20"></span> Identité
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Prénom" value={prenom} onChange={setPrenom} placeholder="Prénom" />
                <Field label="Nom" value={nom} onChange={setNom} placeholder="Nom" />
                <Field label="Fonction" value={fonction} onChange={setFonction} placeholder="Négociateur, Directeur..." />
                <Field label="RSAC" value={rsac} onChange={setRsac} placeholder="Ex: 123 456 789" />
              </div>
            </div>

            {/* SECTION CONTACT */}
            <div className="space-y-4">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2">
                <span className="w-4 h-px bg-white/20"></span> Contact
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Email professionnel" value={email} onChange={setEmail} placeholder="prenom@agence.com" type="email" />
                <Field label="Téléphone mobile" value={phone} onChange={setPhone} placeholder="06 00 00 00 00" type="tel" />
                <Field label="Téléphone fixe agence" value={phoneFix} onChange={setPhoneFix}
                  placeholder="02 00 00 00 00" type="tel" prefilled span2 />
              </div>
            </div>

            {/* SECTION ADRESSE */}
            <div className="space-y-4">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2">
                <span className="w-4 h-px bg-white/20"></span> Adresse
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Adresse" value={adresse} onChange={setAdresse} placeholder="12 rue de la Paix" prefilled span2 />
                <Field label="Ville" value={ville} onChange={setVille} placeholder="Angers" prefilled />
                <Field label="Code postal" value={codePostal} onChange={setCodePostal} placeholder="49000" prefilled />
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full bg-blue-600 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50">
              {submitting ? 'Compression & ajout en cours...' : 'Ajouter au répertoire →'}
            </button>
          </form>
        </div>


        {/* ── LISTE ── */}
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
                    <div className="flex items-center gap-5 shrink-0">
                      <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center shadow-2xl shrink-0">
                        {m.avatar_url
                          ? <img src={m.avatar_url} alt={m.first_name} className="h-full w-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          : <span className="text-xs font-black text-white/30 uppercase">{m.first_name?.[0]}{m.last_name?.[0]}</span>}
                      </div>
                      <div>
                        <div className="text-sm font-black uppercase tracking-tight">{m.first_name} {m.last_name}</div>
                        <div className="text-[9px] font-bold text-blue-400/60 uppercase tracking-widest mt-0.5">{m.fonction || '—'}</div>
                        {m.rsac && <div className="text-[8px] text-white/20 font-bold mt-0.5">RSAC {m.rsac}</div>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-grow px-0 md:px-8">
                      {[
                        { label: 'Email',  val: m.email },
                        { label: 'Mobile', val: m.phone },
                        { label: 'Fixe',   val: m.phone_fix },
                        { label: 'Ville',  val: m.ville },
                      ].map(({ label, val }) => (
                        <div key={label} className="flex flex-col gap-0.5">
                          <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">{label}</span>
                          <span className="text-[10px] font-medium text-white/60 truncate max-w-[140px]">{val || '—'}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button onClick={() => ouvrirEdition(m)}
                        className="bg-white/5 hover:bg-blue-600 text-white/50 hover:text-white text-[8px] font-black uppercase px-5 py-3 rounded-xl transition-all border border-white/10 hover:border-blue-500">
                        Modifier
                      </button>
                      <button onClick={() => supprimerMembre(m.id)}
                        className="bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white text-[8px] font-black uppercase px-5 py-3 rounded-xl transition-all border border-red-500/20">
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}

                {/* FORMULAIRE ÉDITION INLINE */}
                {editId === m.id && (
                  <div className="p-6 space-y-6 bg-white/[0.03]">
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Modifier le collaborateur</p>

                    {/* Photo */}
                    <div className="flex items-center gap-4">
                      <div onClick={() => editFileInputRef.current?.click()}
                        className="h-16 w-16 rounded-full border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all overflow-hidden shrink-0">
                        {editAvatarPreview
                          ? <img src={editAvatarPreview} className="h-full w-full object-cover" alt="preview"
                              onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                          : <span className="text-xl">📷</span>}
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Photo de profil <span className="text-white/20 normal-case font-medium">(optionnelle)</span></p>
                        <button type="button" onClick={() => editFileInputRef.current?.click()}
                          className="text-[9px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors">
                          Changer la photo →
                        </button>
                      </div>
                      <input ref={editFileInputRef} type="file" accept="image/*" onChange={handleEditAvatarChange} className="hidden" />
                    </div>

                    {/* Identité */}
                    <div className="space-y-3">
                      <p className="text-[7px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2">
                        <span className="w-3 h-px bg-white/20"></span> Identité
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(['first_name','last_name','fonction','rsac'] as const).map((k) => (
                          <div key={k}>
                            <label className="text-[7px] font-black uppercase tracking-[0.2em] text-white/25 mb-1 block ml-1">
                              {k === 'first_name' ? 'Prénom' : k === 'last_name' ? 'Nom' : k === 'fonction' ? 'Fonction' : 'RSAC'}
                            </label>
                            <input type="text" value={editData[k] || ''}
                              onChange={(e) => setEditData({ ...editData, [k]: e.target.value })}
                              className="w-full bg-white/[0.06] border border-white/10 px-4 py-3 rounded-2xl outline-none focus:border-blue-500 text-sm text-white font-medium placeholder:text-white/20 transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-3">
                      <p className="text-[7px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2">
                        <span className="w-3 h-px bg-white/20"></span> Contact
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { k: 'email',     label: 'Email',            type: 'email' },
                          { k: 'phone',     label: 'Mobile',           type: 'tel' },
                          { k: 'phone_fix', label: 'Téléphone fixe',   type: 'tel' },
                        ].map(({ k, label, type }) => (
                          <div key={k} className={k === 'phone_fix' ? 'md:col-span-2' : ''}>
                            <label className="text-[7px] font-black uppercase tracking-[0.2em] text-white/25 mb-1 block ml-1">{label}</label>
                            <input type={type} value={editData[k] || ''}
                              onChange={(e) => setEditData({ ...editData, [k]: e.target.value })}
                              className="w-full bg-white/[0.06] border border-white/10 px-4 py-3 rounded-2xl outline-none focus:border-blue-500 text-sm text-white font-medium transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Adresse */}
                    <div className="space-y-3">
                      <p className="text-[7px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2">
                        <span className="w-3 h-px bg-white/20"></span> Adresse
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { k: 'adresse',     label: 'Adresse',      span2: true },
                          { k: 'ville',       label: 'Ville',        span2: false },
                          { k: 'code_postal', label: 'Code postal',  span2: false },
                        ].map(({ k, label, span2 }) => (
                          <div key={k} className={span2 ? 'md:col-span-2' : ''}>
                            <label className="text-[7px] font-black uppercase tracking-[0.2em] text-white/25 mb-1 block ml-1">{label}</label>
                            <input type="text" value={editData[k] || ''}
                              onChange={(e) => setEditData({ ...editData, [k]: e.target.value })}
                              className="w-full bg-white/[0.06] border border-white/10 px-4 py-3 rounded-2xl outline-none focus:border-blue-500 text-sm text-white font-medium transition-all" />
                          </div>
                        ))}
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