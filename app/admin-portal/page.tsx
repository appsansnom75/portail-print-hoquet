'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Champs Formulaire
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [quantities, setQuantities] = useState('500, 1000, 5000');
  const [prices, setPrices] = useState('100, 180, 500');
  const [existingProducts, setExistingProducts] = useState<any[]>([]);

  const checkAuth = () => {
    if (password === "admin") { // REMPLACE PAR TON MDP
      setIsAuthenticated(true);
      fetchProducts();
    } else {
      alert("Accès refusé");
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setExistingProducts(data);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer ce produit ?")) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  };

  const handleUpload = async () => {
    if (!name || !imageFile) return alert("Nom et Image requis");

    // 1. Upload Image
    const fileName = `${Date.now()}-${imageFile.name}`;
    const { data: imgData } = await supabase.storage.from('product-images').upload(fileName, imageFile);
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);

    // 2. Insert Data
    const config = {
      quantities: quantities.split(',').map(n => Number(n.trim())),
      prices: { default: prices.split(',').map(n => Number(n.trim())) },
      variants: [] // Tu pourras étendre cela plus tard
    };

    const { error } = await supabase.from('products').insert([
      { name, image_url: urlData.publicUrl, category: 'Perso', config }
    ]);

    if (!error) {
      alert("Produit ajouté !");
      setName('');
      fetchProducts();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f092e] flex items-center justify-center p-6">
        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-md text-center">
          <h2 className="font-black text-blue-500 uppercase tracking-widest mb-6">Accès Sécurisé</h2>
          <input 
            type="password" 
            placeholder="Mot de passe" 
            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-blue-500 mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={checkAuth} className="w-full bg-blue-500 py-4 rounded-xl font-black uppercase">Entrer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-10 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* FORMULAIRE D'AJOUT */}
        <div className="space-y-8">
          <h1 className="text-3xl font-black uppercase text-blue-500 italic">Ajouter Produit</h1>
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-white/40 block mb-2">Nom du produit</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-white/40 block mb-2">Fichier Image (PNG/JPG)</label>
              <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-xs text-white/40" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-white/40 block mb-2">Quantités (virgules)</label>
                <input value={quantities} onChange={e => setQuantities(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-white/40 block mb-2">Prix HT (virgules)</label>
                <input value={prices} onChange={e => setPrices(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-blue-500" />
              </div>
            </div>
            <button onClick={handleUpload} className="w-full bg-blue-500 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-400 transition-all">Enregistrer</button>
          </div>
        </div>

        {/* LISTE ACTUELLE */}
        <div className="space-y-8">
          <h1 className="text-3xl font-black uppercase text-white/20 italic">Produits Actifs</h1>
          <div className="space-y-4">
            {existingProducts.map(p => (
              <div key={p.id} className="flex items-center gap-6 bg-white/5 p-4 rounded-2xl border border-white/5">
                <img src={p.image_url} className="w-16 h-16 object-contain" />
                <div className="flex-1">
                  <p className="font-black uppercase text-xs">{p.name}</p>
                  <p className="text-[8px] text-white/40 uppercase tracking-widest">{p.config.quantities.length} paliers prix</p>
                </div>
                <button onClick={() => handleDelete(p.id)} className="text-red-500 font-black text-[9px] uppercase border border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all">Supprimer</button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}