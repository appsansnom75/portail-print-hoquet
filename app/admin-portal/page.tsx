'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
// 1. IMPORT DE LA LIB DE COMPRESSION
import imageCompression from 'browser-image-compression';

// 2. MODIFICATION DE L'INTERFACE VARIANTITEM (RECTO/VERSO)
interface VariantItem {
  id: string;
  name: string;
  prices: string;
  fileRecto?: File | null; // NOUVEAU
  fileVerso?: File | null; // NOUVEAU
  image_recto?: string;    // MODIFIÉ
  image_verso?: string;    // AJOUTÉ
}

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false); 
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Perso');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileVerso, setImageFileVerso] = useState<File | null>(null);
  const [quantities, setQuantities] = useState('500, 1000, 5000');
  const [basePrices, setBasePrices] = useState('100, 180, 500');
  const [hasVariants, setHasVariants] = useState(false);
  const [variantsList, setVariantsList] = useState<VariantItem[]>([]);
  const [existingProducts, setExistingProducts] = useState<any[]>([]);

  // FONCTION DE COMPRESSION RÉUTILISABLE
  const compressAndUpload = async (file: File, suffix: string) => {
    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      // Nettoyage du nom de fichier
      const cleanedName = file.name.replace(/\s/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
      const fileName = `${Date.now()}-${suffix}-${cleanedName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, compressedFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error("Erreur compression/upload:", error);
      throw error;
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setExistingProducts(data);
  };

  const checkAuth = () => {
    if (password === "123") { setIsAuthenticated(true); fetchProducts(); } 
    else { alert("Accès refusé"); }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('Perso');
    setImageFile(null);
    setImageFileVerso(null);
    setQuantities('500, 1000, 5000');
    setBasePrices('100, 180, 500');
    setHasVariants(false);
    setVariantsList([]);
    setIsUploading(false);
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setName(p.name);
    setCategory(p.category);
    setQuantities(p.config.quantities.join(', '));
    setHasVariants(p.has_variants);
    
    if (p.has_variants) {
      // 3. CHARGEMENT DES DONNÉES DE VARIANTE (RECTO/VERSO)
      setVariantsList(p.config.variants.map((v: any) => ({
        id: v.id,
        name: v.name,
        image_recto: v.image_recto, // MODIFIÉ
        image_verso: v.image_verso, // AJOUTÉ
        prices: p.config.prices[v.id]?.join(', ') || ""
      })));
    } else {
      setBasePrices(p.config.prices.default?.join(', ') || "");
      setVariantsList([]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProduct = async () => {
    if (!name) return alert("Nom requis");
    setIsUploading(true);

    try {
      // Récupération des anciennes URLs en mode édition
      const existingP = existingProducts.find(p => p.id === editingId);
      let mainUrl = existingP?.image_recto;
      let versoUrl = existingP?.image_verso;

      if (imageFile) {
        mainUrl = await compressAndUpload(imageFile, 'recto');
      }

      if (imageFileVerso) {
        versoUrl = await compressAndUpload(imageFileVerso, 'verso');
      }

      const qtyArray = quantities.split(',').map(n => Number(n.trim()));
      const finalPrices: any = {};
      const finalVariants: any[] = [];

      if (hasVariants) {
        // 4. BOUCLE DE SAUVEGARDE DES VARIANTES (RECTO/VERSO)
        for (const v of variantsList) {
          let vImgRecto = v.image_recto || mainUrl; // Par défaut: image principale recto
          let vImgVerso = v.image_verso || versoUrl; // Par défaut: image principale verso

          // Upload RECTO Variante
          if (v.fileRecto) {
            vImgRecto = await compressAndUpload(v.fileRecto, `v-${v.id}-recto`);
          }
          // Upload VERSO Variante
          if (v.fileVerso) {
            vImgVerso = await compressAndUpload(v.fileVerso, `v-${v.id}-verso`);
          }

          finalPrices[v.id] = v.prices.split(',').map(n => Number(n.trim()));
          
          // Construction de l'objet variante final
          finalVariants.push({ 
            id: v.id, 
            name: v.name, 
            image_recto: vImgRecto, // MODIFIÉ
            image_verso: vImgVerso  // AJOUTÉ
          });
        }
      } else {
        finalPrices['default'] = basePrices.split(',').map(n => Number(n.trim()));
      }

      const payload = {
        name,
        category,
        image_recto: mainUrl,
        image_verso: versoUrl || null,
        has_variants: hasVariants,
        config: { quantities: qtyArray, prices: finalPrices, variants: finalVariants }
      };

      const { error: dbError } = editingId 
        ? await supabase.from('products').update(payload).eq('id', editingId)
        : await supabase.from('products').insert([payload]);

      if (dbError) throw dbError;

      alert(editingId ? "Modification enregistrée !" : "Produit ajouté !");
      resetForm();
      fetchProducts();
    } catch (err: any) { 
      console.error(err);
      alert("Erreur de sauvegarde : " + err.message); 
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Supprimer définitivement ce produit ?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        alert("Erreur lors de la suppression : " + error.message);
      } else {
        fetchProducts(); 
      }
    }
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#0f092e] flex items-center justify-center p-6 text-white">
      <div className="bg-white/5 p-8 rounded-2xl border border-white/10 w-full max-w-md text-center shadow-2xl">
        <h2 className="font-black text-blue-500 uppercase tracking-widest mb-6 italic">Admin Dashboard</h2>
        <input type="password" placeholder="Mot de passe" className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl text-white outline-none mb-4 text-center" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkAuth()} />
        <button onClick={checkAuth} className="w-full bg-blue-500 py-4 rounded-xl font-black uppercase shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Connexion</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white p-10 font-sans relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* COLONNE GAUCHE : FORMULAIRE */}
        <div className="lg:col-span-5 space-y-8">
          <div className="flex justify-between items-center sticky top-10 z-40 bg-[#0f092e]/80 p-2 backdrop-blur-sm rounded-xl">
            <h1 className="text-3xl font-black uppercase text-blue-500 italic">
              {editingId ? 'Mode Édition' : 'Ajouter un produit'}
            </h1>
            {editingId && (
              <button onClick={resetForm} className="bg-red-500/20 text-red-500 px-4 py-2 rounded-full text-[9px] font-black uppercase border border-red-500/30 hover:bg-red-500 hover:text-white transition-all">
                Annuler
              </button>
            )}
          </div>
          
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl relative">
            {isUploading && (
              <div className="absolute inset-0 bg-[#0f092e]/80 backdrop-blur-sm z-[100] rounded-3xl flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black uppercase text-[10px] tracking-widest text-blue-400 text-center">Envoi et compression<br/>en cours...</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-white/40 block tracking-widest">Page de destination</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl outline-none text-white font-bold uppercase text-[11px]">
                <option value="Perso">Produits personnalisés (Bleu)</option>
                <option value="Signaletique">Produits sans personnalisation (Vert)</option>
                <option value="Vetements">Gamme Business (Orange)</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase">Titre du produit</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl outline-none text-sm" placeholder="Nom..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase">Image Recto principale</label>
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-[9px] block w-full file:bg-blue-500 file:border-0 file:text-white file:px-3 file:py-1 file:rounded file:font-black file:uppercase" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase">Image Verso principale</label>
                  <input type="file" accept="image/*" onChange={e => setImageFileVerso(e.target.files?.[0] || null)} className="text-[9px] block w-full file:bg-gray-500 file:border-0 file:text-white file:px-3 file:py-1 file:rounded file:font-black file:uppercase" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase">Quantités proposées</label>
              <input value={quantities} onChange={e => setQuantities(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl outline-none text-sm" placeholder="ex: 500, 1000" />
            </div>

            {!hasVariants && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase">Prix HT correspondants</label>
                <input value={basePrices} onChange={e => setBasePrices(e.target.value)} className="w-full bg-[#16103a] border border-white/10 p-4 rounded-xl outline-none text-sm" />
              </div>
            )}

            <button onClick={() => setHasVariants(!hasVariants)} className={`w-full py-4 border-2 border-dashed rounded-2xl text-[9px] font-black uppercase transition-all ${hasVariants ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 'border-white/10 text-white/30 hover:border-white/30'}`}>
              {hasVariants ? "✓ Plusieurs modèles activés" : "+ Configurer plusieurs modèles/options"}
            </button>

            {hasVariants && (
              <div className="space-y-6 border-l-2 border-blue-500 pl-6 py-2">
                {variantsList.map((v, idx) => (
                  <div key={idx} className="bg-white/5 p-5 rounded-2xl space-y-4 relative border border-white/5 shadow-inner">
                    <button onClick={() => setVariantsList(variantsList.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-red-500 text-[9px] font-black px-2 py-1 hover:bg-red-500/10 rounded-lg">SUPPRIMER</button>
                    <p className="font-black text-[12px] uppercase text-blue-500">{v.name}</p>
                    <input value={v.prices} onChange={(e) => { const c = [...variantsList]; c[idx].prices = e.target.value; setVariantsList(c); }} className="w-full bg-black/30 border border-white/5 p-3 rounded-lg text-xs outline-none" placeholder="Prix..." />
                    
                    {/* 5. GRILLE IMAGES RECTO/VERSO POUR LA VARIANTE */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-white/30 uppercase">Image Recto (Option)</label>
                            <input type="file" accept="image/*" onChange={(e) => { const c = [...variantsList]; c[idx].fileRecto = e.target.files?.[0] || null; setVariantsList(c); }} className="text-[8px] opacity-80 block w-full" />
                            {v.image_recto && <img src={v.image_recto} className="h-8 w-8 object-contain rounded bg-black/40 p-0.5 mt-1" />}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-white/30 uppercase">Image Verso (Option)</label>
                            <input type="file" accept="image/*" onChange={(e) => { const c = [...variantsList]; c[idx].fileVerso = e.target.files?.[0] || null; setVariantsList(c); }} className="text-[8px] opacity-80 block w-full" />
                            {v.image_verso && <img src={v.image_verso} className="h-8 w-8 object-contain rounded bg-black/40 p-0.5 mt-1" />}
                        </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => { const n = prompt("Nom de l'option :"); if(n) setVariantsList([...variantsList, { id: n.toLowerCase().replace(/\s/g, '').replace(/[^a-z0-9]/g, ''), name: n, prices: basePrices }]); }} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-blue-400 uppercase hover:bg-white/10 transition-all">+ Ajouter un modèle</button>
              </div>
            )}

            <button 
              disabled={isUploading}
              onClick={handleSaveProduct} 
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest ${isUploading ? 'bg-gray-700 cursor-not-allowed opacity-50' : (editingId ? 'bg-orange-600 hover:bg-orange-500' : 'bg-blue-600 hover:bg-blue-500')}`}
            >
              {editingId ? 'Enregistrer les modifications' : 'Publier sur le site'}
            </button>
          </div>
        </div>

        {/* COLONNE DROITE : LISTING */}
        <div className="lg:col-span-7 space-y-12">
          {[
            { id: 'Perso', name: 'Produits personnalisés', color: 'text-blue-500', bg: 'bg-blue-500' },
            { id: 'Signaletique', name: 'Produits sans personnalisation', color: 'text-green-500', bg: 'bg-green-500' },
            { id: 'Vetements', name: 'Gamme Business', color: 'text-orange-500', bg: 'bg-orange-500' }
          ].map(section => (
            <div key={section.id} className="space-y-4 sticky top-10">
              <div className="flex items-center gap-4 bg-[#0f092e] p-2 rounded-xl backdrop-blur-sm">
                <div className={`w-1 h-6 ${section.bg} rounded-full`}></div>
                <h2 className={`text-xl font-black uppercase italic tracking-tighter ${section.color}`}>{section.name}</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {existingProducts.filter(p => p.category === section.id).map(p => (
                  <div key={p.id} className="flex items-center gap-5 bg-white/[0.03] p-5 rounded-3xl border border-white/5 hover:bg-white/[0.06] transition-all group shadow-sm">
                    <div className="flex gap-1 bg-black/40 p-1.5 rounded-xl relative group-hover:scale-105 transition-transform">
                        <img src={p.image_recto} className="w-10 h-10 object-contain rounded-lg" alt="recto" />
                        {p.image_verso && <img src={p.image_verso} className="w-10 h-10 object-contain rounded-lg border-l border-white/10 pl-1" alt="verso" />}
                        {p.has_variants && (
                            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full">{p.config.variants?.length} mod.</span>
                        )}
                    </div>
                    <div className="flex-1">
                      <p className="font-black uppercase text-[11px] tracking-widest text-white/90">{p.name}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[7px] text-white/30 font-black uppercase">{p.config.quantities.length} Tarifs configurés</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(p)} className="bg-white text-[#0f092e] px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all active:scale-95">Modifier</button>
                      <button onClick={() => handleDelete(p.id)} className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Suppr.</button>
                    </div>
                  </div>
                ))}
                {existingProducts.filter(p => p.category === section.id).length === 0 && (
                  <p className="text-[9px] uppercase font-black text-white/10 italic ml-6">Aucun produit dans cette catégorie</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}