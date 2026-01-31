'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true); // Actif par défaut
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  // VERIFICATION : Si déjà connecté, on dégage vers l'accueil
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      } else {
        setCheckingSession(false);
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Erreur : " + error.message);
      setLoading(false);
    } else {
      router.push('/'); 
    }
  };

  if (checkingSession) return <div className="min-h-screen bg-[#0f092e] flex items-center justify-center text-white font-black uppercase text-[10px] animate-pulse">Vérification de la session...</div>;

  return (
    <div className="min-h-screen bg-[#0f092e] text-white flex items-center justify-center p-6 selection:bg-blue-500/30">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-[40px] shadow-2xl backdrop-blur-xl">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-blue-500 mb-8 text-center italic">Connexion Portail</h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <p className="text-[8px] font-black text-white/40 uppercase mb-2 tracking-widest ml-2">Email Professionnel</p>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all"
              placeholder="email@agence.com"
              required
            />
          </div>

          <div>
            <p className="text-[8px] font-black text-white/40 uppercase mb-2 tracking-widest ml-2">Mot de passe</p>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {/* TOGGLE RESTER CONNECTÉ */}
          <div className="flex items-center gap-3 px-2 py-2">
            <label className="relative flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
            </label>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Rester connecté</span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-[7px] font-black uppercase tracking-[0.3em] text-white/10 italic">Accès réservé aux agences Guy Hoquet</p>
        </div>
      </div>
    </div>
  );
}