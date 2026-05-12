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

export default function ProfilPage() {
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const [agenceId, setAgenceId] = useState<string | null>(null);
  const [agenceData, setAgenceData] = useState({
    ville: '',
    adresse: '',
    code_postal: '',
    agence_telephone: '',
    phone_fix: '',
    agence_email: '',
    qr_code_url: '',
    siret: '',
    mentions_nom_societe: '',
    mentions_statut: '',
    mentions_capital: '',
    mentions_rcs: '',
    mentions_ape: '',
    mentions_carte_pro: '',
    mentions_carte_pro_delivree: '',
    mentions_caisse_garantie: '',
    mentions_caisse_garantie_adresse: '',
    mentions_tva: '',
    mentions_mail_rgpd: '',
  });

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
            mentions_carte_pro_delivree:      agence.mentions_carte_pro_delivree || '',
            mentions_caisse_garantie:         agence.mentions_caisse_garantie || '',
            mentions_caisse_garantie_adresse: agence.mentions_caisse_garantie_adresse || '',
            mentions_tva:                     agence.mentions_tva || '',
            mentions_mail_rgpd:               agence.mentions_mail_rgpd || '',
          });
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
      mentions_caisse_garantie: nomCaisse,
      mentions_caisse_garantie_adresse: found?.adresse || '',
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agenceId) return;
    setUpdating(true);
    const { error } = await supabase.from('agencies').update({
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
      mentions_carte_pro_delivree:      agenceData.mentions_carte_pro_delivree,
      mentions_caisse_garantie:         agenceData.mentions_caisse_garantie,
      mentions_caisse_garantie_adresse: agenceData.mentions_caisse_garantie_adresse,
      mentions_tva:                     agenceData.mentions_tva,
      mentions_mail_rgpd:               agenceData.mentions_mail_rgpd,
    }).eq('id', agenceId);
    if (error) alert("Erreur : " + error.message);
    else alert("Infos agence mises à jour !");
    setUpdating(false);
  };

  const field = (
    label: string,
    key: keyof typeof agenceData,
    placeholder: string,
    type = 'text'
  ) => (
    <div className="space-y-1">
      <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-2 block">{label}</label>
      <input
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

        {/* EN-TÊTE */}
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

            {/* VILLE — affiché en titre centré en haut du bloc */}
            <div className="flex flex-col items-center pb-6 border-b border-white/5 space-y-2">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Guy Hoquet</p>
              <input
                type="text"
                value={agenceData.ville}
                onChange={(e) => setAgenceData({ ...agenceData, ville: e.target.value })}
                placeholder="Ville de l'agence"
                className="bg-transparent border-b border-white/10 focus:border-blue-500 outline-none text-center text-xl font-black uppercase tracking-tight text-white w-full transition-all placeholder:text-white/15 pb-1"
              />
              <p className="text-[10px] font-bold text-white/15 uppercase tracking-widest">Nom affiché sous le logo Guy Hoquet</p>
            </div>

            {field('Adresse', 'adresse', 'Ex: 12 rue de la Paix')}
            <div className="grid grid-cols-2 gap-4">
              {field('Code Postal', 'code_postal', 'Ex: 49000')}
              {field('Ville', 'ville', 'Ex: Angers')}
            </div>
            {field('Téléphone Mobile Agence', 'agence_telephone', 'Ex: 06 00 00 00 00', 'tel')}
            {field('Téléphone Fixe Agence', 'phone_fix', 'Ex: 02 41 87 00 78', 'tel')}
            {field('Email Agence', 'agence_email', 'Ex: contact@agence.com', 'email')}

            {/* QR CODE URL */}
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

            {/* SIRET */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-2 block">Numéro SIRET</label>
              <input
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
            {field('Statut Juridique', 'mentions_statut', 'Ex: SARL, SAS, EI...')}
            {field('Capital Social (€)', 'mentions_capital', 'Ex: 10 000')}
            {field('RCS', 'mentions_rcs', 'Ex: Angers 123 456 789')}
            {field('Code APE', 'mentions_ape', 'Ex: 6831Z')}
            <div className="grid grid-cols-2 gap-4">
              {field('N° Carte Professionnelle', 'mentions_carte_pro', 'Ex: CPI 7501 2016 000 012 345')}
              {field('Délivrée par la CCI de', 'mentions_carte_pro_delivree', 'Ex: Paris Île-de-France')}
            </div>

            {/* CAISSE DE GARANTIE */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-2 block">
                  Caisse de Garantie
                </label>
                <select
                  value={agenceData.mentions_caisse_garantie}
                  onChange={(e) => handleCaisseChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm text-white cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center',
                  }}
                >
                  <option value="" className="bg-[#0f092e]">— Sélectionner une caisse —</option>
                  {CAISSES_GARANTIE.map((c) => (
                    <option key={c.nom} value={c.nom} className="bg-[#0f092e]">
                      {c.nom}
                    </option>
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
            {field('Mail Informatique & Libertés', 'mentions_mail_rgpd', 'Ex: informatique-et-libertes-0000@guy-hoquet.com', 'email')}

            {/* APERÇU MENTIONS */}
            {agenceData.mentions_nom_societe && (
              <div className="bg-black/30 border border-white/5 rounded-2xl p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3">Aperçu</p>
                <p className="text-[12px] text-white/50 font-medium leading-relaxed">
                  {agenceData.mentions_nom_societe}
                  {agenceData.adresse && ` — ${agenceData.adresse}`}
                  {agenceData.ville && ` ${agenceData.ville}`}
                  {agenceData.mentions_statut && ` — ${agenceData.mentions_statut}`}
                  {agenceData.mentions_capital && ` au capital de ${agenceData.mentions_capital} euros`}
                  {agenceData.mentions_rcs && ` — RCS ${agenceData.mentions_rcs}`}
                  {agenceData.mentions_ape && ` — APE ${agenceData.mentions_ape}`}
                  {agenceData.mentions_carte_pro && ` — Carte professionnelle n° ${agenceData.mentions_carte_pro}`}
                  {agenceData.mentions_carte_pro_delivree && ` délivrée par la CCI de ${agenceData.mentions_carte_pro_delivree}`}
                  {agenceData.mentions_caisse_garantie && agenceData.mentions_caisse_garantie !== 'Néant' && ` — Caisse de garantie ${agenceData.mentions_caisse_garantie}`}
                  {agenceData.mentions_caisse_garantie_adresse && ` — ${agenceData.mentions_caisse_garantie_adresse}`}
                  {agenceData.mentions_tva && ` — TVA intracommunautaire n° ${agenceData.mentions_tva}`}
                  {agenceData.mentions_mail_rgpd && ` — Informatique & Libertés : ${agenceData.mentions_mail_rgpd}`}
                </p>
              </div>
            )}
          </div>

          {/* ── BOUTON SAVE ── */}
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