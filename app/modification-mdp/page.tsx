'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ChangerMotDePasse() {
  const [email, setEmail]                     = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  // Pré-remplir l'email si déjà connecté, mais pas de redirection forcée
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setEmail(user.email || '');
    };
    getUser();
  }, []);

  const passwordStrength = (pwd: string): { label: string; color: string; width: string } => {
    if (pwd.length === 0) return { label: '', color: '', width: '0%' };
    if (pwd.length < 6)   return { label: 'Trop court', color: 'bg-red-500', width: '25%' };
    if (pwd.length < 8)   return { label: 'Faible', color: 'bg-orange-500', width: '50%' };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: 'Moyen', color: 'bg-yellow-500', width: '75%' };
    return { label: 'Fort', color: 'bg-green-500', width: '100%' };
  };

  const strength          = passwordStrength(newPassword);
  const passwordsMatch    = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = newPassword && confirmPassword && newPassword !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit faire au moins 6 caractères.');
      return;
    }

    setLoading(true);

    // 1. Vérifier email + ancien mot de passe
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      setError('Email ou mot de passe actuel incorrect.');
      setLoading(false);
      return;
    }

    // 2. Mettre à jour avec le nouveau mot de passe
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError('Erreur : ' + updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const EyeButton = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-all"
      aria-label={show ? 'Masquer' : 'Afficher'}
    >
      {show ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-blue-500">
            Modifier le mot de passe
          </h1>
          <p className="text-[12px] font-black uppercase text-white/20 tracking-widest mt-2">
            Entrez vos informations de connexion actuelles
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 shadow-2xl backdrop-blur-xl">

          {/* Succès */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 mb-6 text-center space-y-3">
              <p className="text-green-400 font-black uppercase text-[13px]">✓ Mot de passe modifié avec succès !</p>
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[12px] hover:bg-blue-500 transition-all"
              >
                Se connecter →
              </Link>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 mb-6">
              <p className="text-red-400 font-black uppercase text-[13px]">{error}</p>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* EMAIL */}
              <div>
                <p className="text-[11px] font-black text-white/40 uppercase mb-2 tracking-widest ml-2">
                  Email du compte
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all"
                  placeholder="email@agence.com"
                  required
                />
              </div>

              {/* MOT DE PASSE ACTUEL */}
              <div>
                <p className="text-[11px] font-black text-white/40 uppercase mb-2 tracking-widest ml-2">
                  Mot de passe actuel
                </p>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-sm outline-none focus:border-blue-500 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <EyeButton show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />
                </div>
              </div>

              {/* NOUVEAU MOT DE PASSE */}
              <div>
                <p className="text-[11px] font-black text-white/40 uppercase mb-2 tracking-widest ml-2">
                  Nouveau mot de passe
                </p>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-sm outline-none focus:border-blue-500 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <EyeButton show={showNew} onToggle={() => setShowNew(!showNew)} />
                </div>
                {newPassword.length > 0 && (
                  <div className="mt-2 px-1">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <p className={`text-[11px] font-black uppercase mt-1 ml-1 ${
                      strength.label === 'Fort'   ? 'text-green-400'  :
                      strength.label === 'Moyen'  ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* CONFIRMER */}
              <div>
                <p className="text-[11px] font-black text-white/40 uppercase mb-2 tracking-widest ml-2">
                  Confirmer le nouveau mot de passe
                </p>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-white/5 border rounded-2xl p-4 pr-12 text-sm outline-none transition-all ${
                      passwordsMismatch ? 'border-red-500/50 focus:border-red-500'   :
                      passwordsMatch    ? 'border-green-500/50 focus:border-green-500' :
                                          'border-white/10 focus:border-blue-500'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  <EyeButton show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
                </div>
                {passwordsMismatch && (
                  <p className="text-[11px] font-black text-red-400 uppercase mt-1 ml-1">✗ Ne correspondent pas</p>
                )}
                {passwordsMatch && (
                  <p className="text-[11px] font-black text-green-400 uppercase mt-1 ml-1">✓ Correspondent</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !!passwordsMismatch}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[13px] tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </button>

            </form>
          )}
        </div>

        <div className="text-center">
          <Link href="/login" className="text-[11px] font-black uppercase text-white/20 hover:text-white/60 tracking-widest transition-all italic">
            ← Retour à la connexion
          </Link>
        </div>

      </div>
    </div>
  );
}