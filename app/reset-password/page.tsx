'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword]         = useState('');
  const [confirm, setConfirm]           = useState('');
  const [loading, setLoading]           = useState(false);
  const [done, setDone]                 = useState(false);
  const [error, setError]               = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();

  // Supabase injecte le token dans le hash de l'URL (#access_token=...)
  // On doit attendre qu'il soit traité avant de pouvoir appeler updateUser
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push('/login'), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0f092e] text-white font-sans flex flex-col items-center justify-center px-4">

      {/* LOGO */}
      <div className="mb-10 flex items-center gap-6">
        <img src="/logo-imprimeur.png" alt="Imprimerie" className="h-6 object-contain" />
        <div className="w-px h-5 bg-white/10 rotate-[20deg]"></div>
        <img src="/logo-hoquet.png" alt="Guy Hoquet" className="h-8 object-contain" />
      </div>

      <div className="w-full max-w-sm bg-white/[0.03] border border-white/5 rounded-3xl p-8 shadow-2xl">

        {done ? (
          /* SUCCÈS */
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <h1 className="font-black text-sm uppercase tracking-widest text-white">Mot de passe mis à jour !</h1>
            <p className="text-[13px] text-white/30 font-bold uppercase tracking-wider">Redirection en cours...</p>
          </div>

        ) : !sessionReady ? (
          /* EN ATTENTE DU TOKEN */
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <p className="text-[13px] text-white/30 font-bold uppercase tracking-wider">Vérification du lien...</p>
          </div>

        ) : (
          /* FORMULAIRE */
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <h1 className="font-black text-sm uppercase tracking-widest text-white mb-1">
                Nouveau mot de passe
              </h1>
              <p className="text-[12px] font-bold text-white/20 uppercase tracking-wider">
                Choisissez un mot de passe sécurisé
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-black uppercase tracking-widest text-white/30">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-black uppercase tracking-widest text-white/30">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 transition-colors"
                />
              </div>
            </div>

            {/* ERREUR */}
            {error && (
              <p className="text-[12px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-white text-[#0f092e] hover:bg-blue-500 hover:text-white text-[12px] font-black uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all shadow-xl active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Mise à jour...' : 'Confirmer le nouveau mot de passe'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}