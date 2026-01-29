'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      router.push('/'); // Redirige vers l'accueil une fois connecté
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f092e] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-[40px] shadow-2xl">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-blue-500 mb-8 text-center">Connexion Portail</h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <p className="text-[8px] font-black text-white/40 uppercase mb-2 tracking-widest ml-2">Email Professionnel</p>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-colors"
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-[#0f092e] py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg active:scale-95"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}