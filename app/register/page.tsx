'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'form' | 'confirm' | 'success';

export default function RegisterPage() {
  const [step, setStep]           = useState<Step>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]         = useState('');

  const [agencyName, setAgencyName]         = useState('');
  const [email, setEmail]                   = useState('');
  const [emailConfirm, setEmailConfirm]     = useState('');
  const [password, setPassword]             = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPass, setShowPass]             = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);

  // ── VALIDATION ────────────────────────────────────────────────
  const emailMatch    = email.length > 0 && emailConfirm.length > 0 && email === emailConfirm;
  const emailMismatch = emailConfirm.length > 0 && email !== emailConfirm;
  const passStrong    = password.length >= 8;
  const passMatch     = password.length > 0 && passwordConfirm.length > 0 && password === passwordConfirm;
  const passMismatch  = passwordConfirm.length > 0 && password !== passwordConfirm;

  const formValid =
    agencyName.trim().length >= 2 &&
    emailMatch &&
    passStrong &&
    passMatch;

  const passStrength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;

  // ── SOUMISSION ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Créer l'utilisateur Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { agency_name: agencyName } },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Utilisateur non créé');

      const userId = authData.user.id;

      // 2. Créer l'agence
      const { data: agency, error: agencyError } = await supabase
        .from('agencies')
        .insert([{
          name:         agencyName,
          agence_email: email,
        }])
        .select('id')
        .single();

      if (agencyError) throw agencyError;

      // 3. Créer le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([{
          id:        userId,
          agency_id: agency.id,
          email:     email,
          full_name: agencyName,
          role:      'admin_agence',
        }]);

      if (profileError) throw profileError;

      setStep('success');

    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes('already registered')) {
        setError('Cet email est déjà utilisé. Essaie de te connecter.');
      } else {
        setError(err?.message || 'Une erreur est survenue. Réessaie.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── PAGE ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f092e] flex items-center justify-center p-6">

      {/* Déco background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-900/10 blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">

        {/* ── ÉTAPE 1 : FORMULAIRE ─────────────────────────────── */}
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-lg"
          >
            <div className="text-center mb-10">
              <Link
                href="/login"
                className="inline-block text-[9px] font-black uppercase opacity-30 hover:opacity-60 italic mb-8 tracking-widest transition-all"
              >
                ← Retour connexion
              </Link>
              <h1 className="text-4xl font-black italic tracking-tighter text-white">
                Créer une agence
              </h1>
              <p className="text-[10px] font-black uppercase opacity-30 mt-3 tracking-[0.3em]">
                Ouverture d'un nouveau compte
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-[45px] p-10 space-y-6">

              {/* Nom de l'agence */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase opacity-30 ml-3 tracking-widest block">
                  Nom de l'agence <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="Ex: GUY HOQUET PARIS 1"
                  className={`w-full bg-black/40 border rounded-2xl px-5 py-4 text-[11px] font-black uppercase outline-none transition-all placeholder:opacity-20 placeholder:normal-case ${
                    agencyName.length >= 2
                      ? 'border-blue-500/40 focus:border-blue-500'
                      : 'border-white/10 focus:border-white/30'
                  }`}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase opacity-30 ml-3 tracking-widest block">
                  Email de l'agence <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@agence.com"
                  className={`w-full bg-black/40 border rounded-2xl px-5 py-4 text-[11px] font-black outline-none transition-all placeholder:opacity-20 placeholder:font-normal ${
                    emailMatch
                      ? 'border-blue-500/40 focus:border-blue-500'
                      : 'border-white/10 focus:border-white/30'
                  }`}
                />
              </div>

              {/* Confirmation email */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase opacity-30 ml-3 tracking-widest block">
                  Confirmer l'email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={emailConfirm}
                  onChange={(e) => setEmailConfirm(e.target.value)}
                  placeholder="contact@agence.com"
                  className={`w-full bg-black/40 border rounded-2xl px-5 py-4 text-[11px] font-black outline-none transition-all placeholder:opacity-20 placeholder:font-normal ${
                    emailMismatch
                      ? 'border-red-500/60 focus:border-red-500'
                      : emailMatch
                        ? 'border-blue-500/40 focus:border-blue-500'
                        : 'border-white/10 focus:border-white/30'
                  }`}
                />
                {emailMismatch && (
                  <p className="text-[9px] font-black text-red-400 ml-3 italic">
                    Les emails ne correspondent pas
                  </p>
                )}
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase opacity-30 ml-3 tracking-widest block">
                  Mot de passe <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8 caractères minimum"
                    className={`w-full bg-black/40 border rounded-2xl px-5 py-4 pr-16 text-[11px] font-black outline-none transition-all placeholder:opacity-20 placeholder:font-normal ${
                      passStrong
                        ? 'border-blue-500/40 focus:border-blue-500'
                        : 'border-white/10 focus:border-white/30'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase opacity-30 hover:opacity-70 transition-all"
                  >
                    {showPass ? 'CACHER' : 'VOIR'}
                  </button>
                </div>
                {/* Barre de force */}
                {password.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 ml-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          level <= passStrength
                            ? passStrength === 1 ? 'bg-red-500'
                            : passStrength === 2 ? 'bg-yellow-400'
                            : 'bg-blue-500'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                    <span className="text-[8px] font-black uppercase ml-1 opacity-40 whitespace-nowrap">
                      {passStrength === 1 ? 'Trop court' : passStrength === 2 ? 'Bon' : 'Fort'}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirmation mot de passe */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase opacity-30 ml-3 tracking-widest block">
                  Confirmer le mot de passe <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassConfirm ? 'text' : 'password'}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Répéter le mot de passe"
                    className={`w-full bg-black/40 border rounded-2xl px-5 py-4 pr-16 text-[11px] font-black outline-none transition-all placeholder:opacity-20 placeholder:font-normal ${
                      passMismatch
                        ? 'border-red-500/60 focus:border-red-500'
                        : passMatch
                          ? 'border-blue-500/40 focus:border-blue-500'
                          : 'border-white/10 focus:border-white/30'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassConfirm(!showPassConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase opacity-30 hover:opacity-70 transition-all"
                  >
                    {showPassConfirm ? 'CACHER' : 'VOIR'}
                  </button>
                </div>
                {passMismatch && (
                  <p className="text-[9px] font-black text-red-400 ml-3 italic">
                    Les mots de passe ne correspondent pas
                  </p>
                )}
                {passMatch && (
                  <p className="text-[9px] font-black text-blue-400 ml-3 italic">
                    ✓ Mots de passe identiques
                  </p>
                )}
              </div>

              {/* Erreur API */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4">
                  <p className="text-[10px] font-black text-red-400 italic">{error}</p>
                </div>
              )}

              {/* Bouton */}
              <button
                type="button"
                onClick={() => formValid && setStep('confirm')}
                disabled={!formValid}
                className="w-full mt-2 py-6 bg-blue-600 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/30 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                Vérifier les informations →
              </button>

              <p className="text-center text-[9px] font-black uppercase opacity-20 pt-2">
                Déjà un compte ?{' '}
                <Link href="/login" className="text-blue-400 opacity-100 hover:underline">
                  Se connecter
                </Link>
              </p>
            </div>
          </motion.div>
        )}

        {/* ── ÉTAPE 2 : CONFIRMATION ───────────────────────────── */}
        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-lg"
          >
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black italic tracking-tighter text-white">
                Tout est correct ?
              </h1>
              <p className="text-[10px] font-black uppercase opacity-30 mt-3 tracking-[0.3em]">
                Vérification finale avant création
              </p>
            </div>

            <div className="relative bg-white rounded-[45px] p-10 text-[#0f092e] space-y-6 shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-600 rounded-t-[45px]" />

              <div className="space-y-5 pt-2">
                <ConfirmRow label="Nom de l'agence" value={agencyName} highlight />
                <ConfirmRow label="Email"           value={email} />
                <ConfirmRow label="Mot de passe"    value={'•'.repeat(Math.min(password.length, 20))} />
              </div>

              <div className="bg-blue-50 rounded-2xl px-6 py-4">
                <p className="text-[9px] font-black uppercase text-blue-600 italic leading-relaxed">
                  Un compte administrateur sera créé avec ces informations.
                  Tu pourras compléter le profil de l'agence et ajouter des collaborateurs après connexion.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                  <p className="text-[10px] font-black text-red-500 italic">{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-6 bg-[#0f092e] text-white rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Création en cours...' : '✓ Créer le compte'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('form'); setError(''); }}
                className="w-full text-[9px] font-black uppercase opacity-30 hover:opacity-70 italic transition-all"
              >
                ← Modifier les informations
              </button>
            </div>
          </motion.div>
        )}

        {/* ── ÉTAPE 3 : SUCCÈS ─────────────────────────────────── */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, type: 'spring' }}
            className="text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
              className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-2xl shadow-blue-900/50"
            >
              ✓
            </motion.div>

            <h2 className="text-5xl font-black italic tracking-tighter text-white mb-4">
              Compte créé !
            </h2>
            <p className="text-[10px] font-black uppercase opacity-40 tracking-[0.3em] mb-6">
              {agencyName} est maintenant enregistrée
            </p>
            <p className="text-[11px] text-white/30 font-black italic mb-10 leading-relaxed">
              Un email de confirmation a été envoyé à{' '}
              <span className="text-blue-400">{email}</span>.{' '}
              Vérifie ta boîte mail pour activer ton compte.
            </p>

            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white px-12 py-6 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/30"
            >
              Se connecter →
            </Link>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// ── Composant ConfirmRow ──────────────────────────────────────────────────
function ConfirmRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center border-b border-gray-100 pb-4 last:border-0 last:pb-0 gap-4">
      <span className="text-[9px] font-black uppercase opacity-40 tracking-widest shrink-0">
        {label}
      </span>
      <span className={`text-[12px] font-black italic text-right truncate ${highlight ? 'text-blue-600' : 'text-[#0f092e]'}`}>
        {value}
      </span>
    </div>
  );
}