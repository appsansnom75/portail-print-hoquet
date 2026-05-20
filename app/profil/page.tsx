'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';



const CAISSES_GARANTIE = [
  { nom: 'ASCO', adresse: '6 Boulevard Malesherbes - 75008 PARIS' },
  { nom: 'AXA FRANCE I.A.R.D.', adresse: "313 Terrasses de l'Arche - 92727 NANTERRE Cedex" },
  { nom: 'CEGC', adresse: '59 avenue Pierre Mendès France - 75013 Paris' },
  { nom: 'CEGI', adresse: '128 rue de la Boétie - 75378 Paris cedex 08' },
  { nom: 'GALIAN', adresse: '89 Rue la Boétie - 75008 Paris' },
  { nom: "LLOYD'S", adresse: '8-10 rue Lammenais - 75008 Paris' },
  { nom: 'LSME', adresse: '42 rue Washington - 75008 PARIS' },
  { nom: 'SEGAP', adresse: '11 rue de Grenelle - 75007 Paris' },
  { nom: 'SMA SA', adresse: '8 rue Louis Armand - CS 71201 - 75738 PARIS CEDEX 15' },
  { nom: 'SOCAF', adresse: '26 avenue de Suffren - 75015 Paris' },
  { nom: 'AXELLIANCE', adresse: '92 Cours Vitton - Immeuble Les Topazes - 69456 LYON CEDEX 06' },
  { nom: 'Néant', adresse: '' },
];

const STATUTS_JURIDIQUES = ['SARL', 'EURL', 'SELARL', 'SA', 'SASU', 'SNC', 'SCP', 'SAS'];
const DELIVREE_PAR_OPTIONS = ['la CCI de', 'la préfecture de'];

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 16px center',
};


export default function ProfilPage() {
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const [agenceId, setAgenceId] = useState<string | null>(null);
  const [agenceData, setAgenceData] = useState({
    nom_affiche:                      '',
    ville:                            '',
    adresse:                          '',
    code_postal:                      '',
    agence_telephone:                 '',
    phone_fix:                        '',
    agence_email:                     '',
    qr_code_url:                      '',
    siret:                            '',
    mentions_nom_societe:             '',
    mentions_statut:                  '',
    mentions_capital:                 '',
    mentions_rcs:                     '',
    mentions_ape:                     '',
    mentions_carte_pro:               '',
    mentions_carte_pro_delivree_type: 'la CCI de',
    mentions_carte_pro_delivree:      '',
    mentions_caisse_garantie:         '',
    mentions_caisse_garantie_adresse: '',
    mentions_tva:                     '',
  });

  // ✅ State séparé pour le code RGPD uniquement
  const [mentionsMailRgpdCode, setMentionsMailRgpdCode] = useState('');


  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('id', user.id)
        .single();

      if (profile?.agency_id) {
        setAgenceId(profile.agency_id);
        const { data: agence } = await supabase
          .from('agencies')
          .select('*')
          .eq('id', profile.agency_id)
          .single();

        if (agence) {
          setAgenceData({
            nom_affiche:                      agence.nom_affiche || '',
            ville:                            agence.ville || '',
            adresse:                          agence.adresse || '',
            code_postal:                      agence.code_postal || '',
            agence_telephone:                 agence.agence_telephone || '',
            phone_fix:                        agence.phone_fix || '',
            agence_email:                     agence.agence_email || '',
            qr_code_url:                      agence.qr_code_url || '',
            siret:                            agence.siret || '',
            mentions_nom_societe:             agence.mentions_nom_societe || '',
            mentions_statut:                  agence.mentions_statut || '',
            mentions_capital:                 agence.mentions_capital || '',
            mentions_rcs:                     agence.mentions_rcs || '',
            mentions_ape:                     agence.mentions_ape || '',
            mentions_carte_pro:               agence.mentions_carte_pro || '',
            mentions_carte_pro_delivree_type: agence.mentions_carte_pro_delivree_type || 'la CCI de',
            mentions_carte_pro_delivree:      agence.mentions_carte_pro_delivree || '',
            mentions_caisse_garantie:         agence.mentions_caisse_garantie || '',
            mentions_caisse_garantie_adresse: agence.mentions_caisse_garantie_adresse || '',
            mentions_tva:                     agence.mentions_tva || '',
          });

          // ✅ Extraire uniquement le code depuis la valeur stockée
          const rgpdStored = agence.mentions_mail_rgpd || '';
          const rgpdCode = rgpdStored
            .replace('informatique-et-libertes-', '')
            .replace('@guyhoquet.com', '');
          setMentionsMailRgpdCode(rgpdCode);
        }
      }
      setLoading(false);
    };
    getProfile();
  }, [router]);


  const handleCaisseChange = (nomCaisse: string) => {
    const found = CAISSES_GARANTIE.find(c => c.nom === nomCaisse);
    setAgenceData(prev => ({
      ...prev,
      mentions_caisse_garantie:         nomCaisse,
      mentions_caisse_garantie_adresse: found?.adresse || '',
    }));
  };


  const validate = (): string | null => {
    const required: [keyof typeof agenceData, string][] = [
      ['nom_affiche',             'Nom affiché sous le logo'],
      ['adresse',                 'Adresse'],
      ['code_postal',             'Code postal'],
      ['ville',                   'Ville'],
      ['agence_telephone',        'Téléphone mobile agence'],
      ['phone_fix',               'Téléphone fixe agence'],
      ['agence_email',            'Email agence'],
      ['siret',                   'Numéro SIRET'],
      ['mentions_nom_societe',    'Nom société'],
      ['mentions_statut',         'Statut juridique'],
      ['mentions_capital',        'Capital social'],
      ['mentions_rcs',            'RCS'],
      ['mentions_ape',            'Code APE'],
      ['mentions_carte_pro',      'N° Carte professionnelle'],
      ['mentions_carte_pro_delivree', 'Délivrée par'],
      ['mentions_caisse_garantie','Caisse de garantie'],
      ['mentions_tva',            'N° TVA intracommunautaire'],
    ];
    for (const [key, label] of required) {
      if (!agenceData[key]?.trim()) return `Le champ « ${label} » est obligatoire.`;
    }
    if (!mentionsMailRgpdCode.trim()) return `Le champ « Mail Informatique & Libertés » est obligatoire.`;
    return null;
  };


  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agenceId) return;
    const err = validate();
    if (err) { alert(err); return; }
    setUpdating(true);
    const { error } = await supabase.from('agencies').update({
      nom_affiche:                      agenceData.nom_affiche,
      ville:                            agenceData.ville,
      adresse:                          agenceData.adresse,
      code_postal:                      agenceData.code_postal,
      agence_telephone:                 agenceData.agence_telephone,
      phone_fix:                        agenceData.phone_fix,
      agence_email:                     agenceData.agence_email,
      qr_code_url:                      agenceData.qr_code_url,
      siret:                            agenceData.siret,
      mentions_nom_societe:             agenceData.mentions_nom_societe,
      mentions_statut:                  agenceData.mentions_statut,
      mentions_capital:                 agenceData.mentions_capital,
      mentions_rcs:                     agenceData.mentions_rcs,
      mentions_ape:                     agenceData.mentions_ape,
      mentions_carte_pro:               agenceData.mentions_carte_pro,
      mentions_carte_pro_delivree_type: agenceData.mentions_carte_pro_delivree_type,
      mentions_carte_pro_delivree:      agenceData.mentions_carte_pro_delivree,
      mentions_caisse_garantie:         agenceData.mentions_caisse_garantie,
      mentions_caisse_garantie_adresse: agenceData.mentions_caisse_garantie_adresse,
      mentions_tva:                     agenceData.mentions_tva,
      // ✅ Sauvegarde le mail complet
      mentions_mail_rgpd: `informatique-et-libertes-${mentionsMailRgpdCode}@guyhoquet.com`,
    }).eq('id', agenceId);
    if (error) alert('Erreur : ' + error.message);
    else alert('Infos agence mises à jour !');
    setUpdating(false);
  };


  const field = (
    label: string,
    key: keyof typeof agenceData,
    placeholder: string,
    type = 'text'
  ) => (
    <div className="space-y-1">
      <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-2 block flex items-center gap-1">
        {label} <span className="text-red-400">*</span>
      </label>
      <input
        required
        type={type}
        value={agenceData[key] as string}
        onChange={(e) => setAgenceData({ ...agenceData, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm text-white placeholder:text-white/20"
      />
    </div>
  );


  if (loading) return (
    <div className="min-h-screen bg-[#0f092e] flex items-center justify-center text-white font-black uppercase tracking-widest animate-pulse text-xs">
      Chargement...
    </div>
  );


  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-6 md:p-12 selection:bg-blue-500/30">
      <div className="max-w-xl mx-auto">

        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-black uppercase tracking-tighter italic text-blue-500">
            Infos Agence
          </h1>
          <button
            onClick={() => router.push('/')}
            className="text-[12px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
          >
            Retour
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">

          {/* ── BLOC 1 : INFOS PRINCIPALES ── */}
          <div className="space-y-6 bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl shadow-2xl">

            <div className="flex flex-col items-center pb-6 border-b border-white/5 space-y-2">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Guy Hoquet</p>
              <input
                required
                type="text"
                value={agenceData.nom_affiche}
                onChange={(e) => setAgenceData({ ...agenceData, nom_affiche: e.target.value })}
                placeholder="Ex: Angers Centre ou Bordeaux Chartrons"
                className="bg-transparent border-b border-white/10 focus:border-blue-500 outline-none text-center text-xl font-black uppercase tracking-tight text-white w-full transition-all placeholder:text-white/15 pb-1"
              />
              <p className="text-[10px] font-bold text-white/15 uppercase tracking-widest">
                Nom affiché sous le logo Guy Hoquet (ville, quartier, etc.)
              </p>
            </div>

            {field('Adresse', 'adresse', 'Ex: 12 rue de la Paix')}
            <div className="grid grid-cols-2 gap-4">
              {field('Code Postal', 'code_postal', 'Ex: 49000')}
              {field('Ville', 'ville', 'Ex: Angers')}
            </div>
            {field('Téléphone Mobile Agence', 'agence_telephone', 'Ex: 06 00 00 00 00', 'tel')}
            {field('Téléphone Fixe Agence', 'phone_fix', 'Ex: 02 41 87 00 78', 'tel')}
            {field('Email Agence', 'agence_email', 'Ex: contact@agence.com', 'email')}

            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-2 block">QR Code (URL)</label>
              <input
                type="url"
                value={agenceData.qr_code_url}
                onChange={(e) => setAgenceData({ ...agenceData, qr_code_url: e.target.value })}
                placeholder="Ex: https://g.page/mon-agence"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm text-white placeholder:text-white/20"
              />
              {agenceData.qr_code_url && (
                <p className="text-[11px] text-blue-400/60 font-bold ml-2 mt-1 truncate">✓ {agenceData.qr_code_url}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-2 block flex items-center gap-1">
                Numéro SIRET <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="text"
                value={agenceData.siret}
                onChange={(e) => setAgenceData({ ...agenceData, siret: e.target.value })}
                placeholder="Ex: 123 456 789 00012"
                maxLength={17}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm text-white placeholder:text-white/20"
              />
            </div>
          </div>

          {/* ── BLOC 2 : MENTIONS LÉGALES ── */}
          <div className="space-y-6 bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="pb-4 border-b border-white/5">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60 italic">Mentions Légales</h2>
              <p className="text-[11px] font-bold text-white/20 uppercase tracking-widest mt-1">
                Utilisées sur les documents officiels
              </p>
            </div>

            {field('Nom Société', 'mentions_nom_societe', 'Ex: GUY HOQUET ANGERS')}

            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-2 block flex items-center gap-1">
                Statut Juridique <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={agenceData.mentions_statut}
                onChange={(e) => setAgenceData({ ...agenceData, mentions_statut: e.target.value })}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm text-white cursor-pointer appearance-none"
                style={selectStyle}
              >
                <option value="" className="bg-[#0f092e]">— Sélectionner un statut —</option>
                {STATUTS_JURIDIQUES.map(s => (
                  <option key={s} value={s} className="bg-[#0f092e]">{s}</option>
                ))}
              </select>
            </div>

            {field('Capital Social (€)', 'mentions_capital', 'Ex: 10 000')}
            {field('RCS', 'mentions_rcs', 'Ex: Angers 123 456 789')}
            {field('Code APE', 'mentions_ape', 'Ex: 6831Z')}

            <div className="space-y-4">
              {field('N° Carte Professionnelle', 'mentions_carte_pro', 'Ex: CPI 7501 2016 000 012 345')}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-2 block flex items-center gap-1">
                  Délivrée par <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={agenceData.mentions_carte_pro_delivree_type}
                    onChange={(e) => setAgenceData({ ...agenceData, mentions_carte_pro_delivree_type: e.target.value })}
                    className="bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm text-white cursor-pointer appearance-none shrink-0"
                    style={selectStyle}
                  >
                    {DELIVREE_PAR_OPTIONS.map(opt => (
                      <option key={opt} value={opt} className="bg-[#0f092e]">{opt}</option>
                    ))}
                  </select>
                  <input
                    required
                    type="text"
                    value={agenceData.mentions_carte_pro_delivree}
                    onChange={(e) => setAgenceData({ ...agenceData, mentions_carte_pro_delivree: e.target.value })}
                    placeholder="Ex: Paris Île-de-France"
                    className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm text-white placeholder:text-white/20"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-2 block flex items-center gap-1">
                  Caisse de Garantie <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={agenceData.mentions_caisse_garantie}
                  onChange={(e) => handleCaisseChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm text-white cursor-pointer appearance-none"
                  style={selectStyle}
                >
                  <option value="" className="bg-[#0f092e]">— Sélectionner une caisse —</option>
                  {CAISSES_GARANTIE.map((c) => (
                    <option key={c.nom} value={c.nom} className="bg-[#0f092e]">{c.nom}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-2 block">
                  Adresse Caisse de Garantie
                  {agenceData.mentions_caisse_garantie && agenceData.mentions_caisse_garantie !== 'Néant' && (
                    <span className="ml-2 text-blue-400/60 normal-case font-bold tracking-normal">pré-rempli</span>
                  )}
                </label>
                <input
                  type="text"
                  value={agenceData.mentions_caisse_garantie_adresse}
                  onChange={(e) => setAgenceData({ ...agenceData, mentions_caisse_garantie_adresse: e.target.value })}
                  placeholder="Adresse de la caisse sélectionnée"
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm text-white placeholder:text-white/20"
                />
              </div>
            </div>

            {field('N° TVA Intracommunautaire', 'mentions_tva', 'Ex: FR 12 123456789')}

            {/* ✅ MAIL RGPD — champ splitté */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-2 block flex items-center gap-1">
                Mail Informatique &amp; Libertés <span className="text-red-400">*</span>
              </label>
              <div className={`flex items-center bg-white/5 border rounded-2xl overflow-hidden transition-all ${
                !mentionsMailRgpdCode.trim() ? 'border-red-500/30' : 'border-white/10 focus-within:border-blue-500'
              }`}>
                <span className="text-[11px] font-mono text-white/30 pl-4 pr-1 shrink-0 select-none whitespace-nowrap">
                  informatique-et-libertes-
                </span>
                <input
                  value={mentionsMailRgpdCode}
                  onChange={(e) => setMentionsMailRgpdCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  placeholder="XXXX"
                  maxLength={20}
                  className="flex-1 bg-transparent py-4 text-[13px] font-black outline-none text-white min-w-0 placeholder:text-white/20"
                />
                <span className="text-[11px] font-mono text-white/30 pr-4 pl-1 shrink-0 select-none whitespace-nowrap">
                  @guyhoquet.com
                </span>
              </div>
              {mentionsMailRgpdCode.trim() && (
                <p className="text-[11px] text-blue-400/60 font-bold ml-2 mt-1">
                  ✓ informatique-et-libertes-{mentionsMailRgpdCode}@guyhoquet.com
                </p>
              )}
            </div>

            {/* APERÇU MENTIONS */}
            {agenceData.mentions_nom_societe && (
              <div className="bg-black/30 border border-white/5 rounded-2xl p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3">Aperçu</p>
                <p className="text-[12px] text-white/50 font-medium leading-relaxed">
                  {agenceData.mentions_nom_societe}
                  {agenceData.adresse && ` — ${agenceData.adresse}`}
                  {(agenceData.code_postal || agenceData.ville) && ` ${agenceData.code_postal} ${agenceData.ville}`.trim()}
                  {agenceData.mentions_statut && ` — ${agenceData.mentions_statut}`}
                  {agenceData.mentions_capital && ` au capital de ${agenceData.mentions_capital} euros`}
                  {agenceData.mentions_rcs && ` — RCS ${agenceData.mentions_rcs}`}
                  {agenceData.mentions_ape && ` — APE ${agenceData.mentions_ape}`}
                  {agenceData.mentions_carte_pro && ` — Carte professionnelle n° ${agenceData.mentions_carte_pro}`}
                  {agenceData.mentions_carte_pro_delivree && ` délivrée par ${agenceData.mentions_carte_pro_delivree_type} ${agenceData.mentions_carte_pro_delivree}`}
                  {agenceData.mentions_caisse_garantie && agenceData.mentions_caisse_garantie !== 'Néant' && ` — Caisse de garantie ${agenceData.mentions_caisse_garantie}`}
                  {agenceData.mentions_caisse_garantie_adresse && ` — ${agenceData.mentions_caisse_garantie_adresse}`}
                  {agenceData.mentions_tva && ` — TVA intracommunautaire n° ${agenceData.mentions_tva}`}
                  {mentionsMailRgpdCode && ` — Informatique & Libertés : informatique-et-libertes-${mentionsMailRgpdCode}@guyhoquet.com`}
                </p>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={updating}
              className="w-full bg-blue-600 hover:bg-blue-500 p-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[13px] transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] disabled:opacity-50"
            >
              {updating ? 'Enregistrement...' : 'Mettre à jour les infos agence'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}