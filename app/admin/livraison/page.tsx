'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

type ShippingTier = {
  id: string;
  min_amount: number | string;
  max_amount: number | null | string;
  price: number | string;
  label: string;
};

const emptyTier = (): ShippingTier => ({
  id: crypto.randomUUID(),
  min_amount: '',
  max_amount: null,
  price: '',
  label: '',
});

export default function AdminLivraisonPage() {
  const [paliers, setPaliers] = useState<ShippingTier[]>([]);
  const [configId, setConfigId] = useState<string | null>(null);
  const [offerteActive, setOfferteActive] = useState(false);
  const [offerteDate, setOfferteDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ─── CHARGEMENT ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('shipping_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (data) {
        setConfigId(data.id);
        setPaliers(
          (data.paliers || []).map((p: any) => ({ ...p, id: p.id || crypto.randomUUID() }))
        );
        setOfferteActive(!!data.livraison_offerte_active);
        setOfferteDate(data.livraison_offerte_date || '');
      }

      setLoading(false);
    };

    load();
  }, []);

  // ─── SAUVEGARDE ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!configId) return;
    setSaving(true);

    const paliersClean = paliers.map(({ id, min_amount, max_amount, price, label }) => ({
      id,
      label,
      min_amount: Number(min_amount) || 0,
      max_amount: max_amount === '' || max_amount === null ? null : Number(max_amount),
      price: Number(price) || 0,
    }));

    const { error } = await supabase
      .from('shipping_config')
      .update({
        paliers: paliersClean,
        livraison_offerte_active: offerteActive,
        livraison_offerte_date: offerteDate || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', configId);

    setSaving(false);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert('Erreur lors de la sauvegarde : ' + error.message);
    }
  };

  // ─── ACTIONS PALIERS ────────────────────────────────────────────────────────
  const addTier = () => setPaliers((prev) => [...prev, emptyTier()]);

  const removeTier = (id: string) =>
    setPaliers((prev) => prev.filter((p) => p.id !== id));

  const updateTier = (id: string, field: keyof ShippingTier, value: any) =>
    setPaliers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );

  const moveTier = (index: number, direction: 'up' | 'down') => {
    const next = [...paliers];
    const swap = direction === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setPaliers(next);
  };

  const todayISO = new Date().toLocaleDateString('en-CA');
  const offerteAujourdhui = offerteActive && offerteDate === todayISO;
  const fmt = (n: number) => n.toFixed(2).replace('.', ',');

  if (loading) return (
    <div className="min-h-screen bg-[#0f092e] flex items-center justify-center text-white text-[13px] font-black uppercase italic animate-pulse">
      Chargement de la configuration...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f092e] text-white pb-24">
      {/* ── HEADER ────────────────────────────────────────────────────────────── */}
      <header className="py-10 px-6 max-w-4xl mx-auto flex justify-between items-center border-b border-white/10 mb-12">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 italic mb-1">Super Admin</p>
          <h1 className="text-[22px] font-black uppercase italic tracking-tighter">
            Frais de Livraison
          </h1>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-8 py-4 rounded-full font-black uppercase text-[12px] tracking-widest transition-all shadow-xl ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40'
          }`}
        >
          {saving ? 'Sauvegarde...' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 space-y-10">

        {/* ── LIVRAISON OFFERTE ─────────────────────────────────────────────── */}
        <section className="bg-white/[0.03] border border-white/10 rounded-[40px] p-10 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-[11px] font-black uppercase tracking-widest text-white/60 italic">
                Livraison offerte
              </h2>
              <p className="text-[11px] font-black text-white/20 uppercase tracking-widest mt-1">
                Ce jour-ci, les frais de livraison sont automatiquement à 0€ pour tous les comptes
              </p>
            </div>

            {/* Toggle */}
            <button
              type="button"
              onClick={() => setOfferteActive(!offerteActive)}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                offerteActive ? 'bg-green-500' : 'bg-white/10'
              }`}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${
                offerteActive ? 'left-8' : 'left-1'
              }`} />
            </button>
          </div>

          <AnimatePresence>
            {offerteActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 pt-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-2 block">
                    Date de livraison offerte
                  </label>
                  <input
                    type="date"
                    value={offerteDate}
                    onChange={(e) => setOfferteDate(e.target.value)}
                    className="bg-black/40 border border-white/10 focus:border-green-500 rounded-2xl p-5 text-[13px] font-black outline-none transition-all text-white w-full max-w-xs"
                  />

                  {offerteDate && (
                    <p className={`text-[11px] font-black uppercase italic ml-2 ${
                      offerteAujourdhui ? 'text-green-400' : 'text-white/30'
                    }`}>
                      {offerteAujourdhui
                        ? '✓ Livraison offerte AUJOURD\'HUI — actif pour tous les comptes'
                        : `Livraison offerte le ${new Date(offerteDate + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                      }
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── PALIERS ───────────────────────────────────────────────────────── */}
        <section className="bg-white/[0.03] border border-white/10 rounded-[40px] p-10 space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-[11px] font-black uppercase tracking-widest text-white/60 italic">
                Paliers de frais de livraison
              </h2>
              <p className="text-[11px] font-black text-white/20 uppercase tracking-widest mt-1">
                S&apos;appliquent à tous les comptes selon le montant HT du panier produits
              </p>
            </div>

            <button
              type="button"
              onClick={addTier}
              className="flex items-center gap-2 px-5 py-3 rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-400 text-[11px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all"
            >
              + Ajouter un palier
            </button>
          </div>

          {/* Légende */}
          {paliers.length > 0 && (
            <div className="grid grid-cols-[1fr_1fr_1fr_2fr_80px] gap-4 px-2">
              {['Min panier (€)', 'Max panier (€)', 'Frais HT (€)', 'Label (optionnel)', ''].map((h, i) => (
                <span key={i} className="text-[10px] font-black uppercase tracking-widest text-white/20">{h}</span>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <AnimatePresence>
              {paliers.map((palier, index) => (
                <motion.div
                  key={palier.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.2 }}
                  className="bg-black/30 border border-white/5 rounded-[24px] p-5"
                >
                  <div className="grid grid-cols-[1fr_1fr_1fr_2fr_80px] gap-4 items-center">
                    {/* Min */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-white/20 ml-1">Min (€)</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={palier.min_amount === '' ? '' : palier.min_amount}
                        onChange={(e) => updateTier(palier.id, 'min_amount', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl p-3 text-[13px] font-black outline-none text-white transition-all"
                      />
                    </div>

                    {/* Max */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-white/20 ml-1">Max (€)</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="Illimité"
                        value={palier.max_amount === null || palier.max_amount === '' ? '' : palier.max_amount}
                        onChange={(e) =>
                          updateTier(palier.id, 'max_amount', e.target.value === '' ? null : e.target.value)
                        }
                        className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl p-3 text-[13px] font-black outline-none text-white transition-all"
                      />
                    </div>

                    {/* Prix */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-white/20 ml-1">Frais (€)</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={palier.price === '' ? '' : palier.price}
                        onChange={(e) => updateTier(palier.id, 'price', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl p-3 text-[13px] font-black outline-none text-white transition-all"
                      />
                    </div>

                    {/* Label */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-white/20 ml-1">Label</label>
                      <input
                        type="text"
                        placeholder="Ex: Commande standard"
                        value={palier.label}
                        onChange={(e) => updateTier(palier.id, 'label', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl p-3 text-[13px] font-black outline-none text-white transition-all"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 items-center">
                      <button
                        type="button"
                        onClick={() => moveTier(index, 'up')}
                        disabled={index === 0}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-10 transition-all text-sm font-black"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTier(index, 'down')}
                        disabled={index === paliers.length - 1}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-10 transition-all text-sm font-black"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTier(palier.id)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all text-sm font-black"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {/* Résumé du palier */}
                  <div className="mt-3 ml-1">
                    <p className="text-[10px] font-black uppercase text-white/20 italic">
                      {Number(palier.min_amount) >= 0 && palier.price !== ''
                        ? palier.max_amount === null || palier.max_amount === ''
                          ? `Panier ≥ ${fmt(Number(palier.min_amount))}€ → ${fmt(Number(palier.price))}€ de frais`
                          : `Panier de ${fmt(Number(palier.min_amount))}€ à ${fmt(Number(palier.max_amount))}€ → ${fmt(Number(palier.price))}€ de frais`
                        : 'Remplir les champs pour voir le résumé'
                      }
                      {palier.label ? ` · ${palier.label}` : ''}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {paliers.length === 0 && (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-[24px]">
                <p className="text-[13px] font-black uppercase text-white/20 italic">
                  Aucun palier configuré
                </p>
                <p className="text-[11px] font-black text-white/10 uppercase mt-2">
                  Les frais de livraison seront 0€ par défaut
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── PRÉVISUALISATION ──────────────────────────────────────────────── */}
        {paliers.length > 0 && (
          <section className="bg-blue-600/5 border border-blue-500/20 rounded-[40px] p-10 space-y-4">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-blue-400 italic">
              Prévisualisation des règles
            </h2>

            <div className="space-y-2">
              {[...paliers]
                .sort((a, b) => Number(a.min_amount || 0) - Number(b.min_amount || 0))
                .map((palier) => (
                  <div
                    key={palier.id}
                    className="flex items-center justify-between bg-black/20 rounded-2xl px-5 py-3 gap-4"
                  >
                    <span className="text-[12px] font-black uppercase text-white/50 italic">
                      {palier.max_amount === null || palier.max_amount === ''
                        ? `Panier ≥ ${fmt(Number(palier.min_amount || 0))}€`
                        : `Panier ${fmt(Number(palier.min_amount || 0))}€ → ${fmt(Number(palier.max_amount))}€`
                      }
                    </span>
                    <span className="text-[13px] font-black text-blue-400 tabular-nums">
                      {Number(palier.price) === 0 ? 'GRATUIT' : `${fmt(Number(palier.price))}€ HT`}
                    </span>
                  </div>
                ))}
            </div>

            {offerteActive && offerteDate && (
              <div className={`flex items-center justify-between rounded-2xl px-5 py-3 gap-4 border ${
                offerteAujourdhui
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-white/5 border-white/10'
              }`}>
                <span className={`text-[12px] font-black uppercase italic ${
                  offerteAujourdhui ? 'text-green-400' : 'text-white/30'
                }`}>
                  {offerteAujourdhui ? '✓ Livraison offerte AUJOURD\'HUI' : `Livraison offerte le ${new Date(offerteDate + 'T00:00:00').toLocaleDateString('fr-FR')}`}
                </span>
                <span className="text-[13px] font-black text-green-400 tabular-nums">0,00€</span>
              </div>
            )}
          </section>
        )}

        {/* ── BOUTON SAVE BAS ───────────────────────────────────────────────── */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-10 py-5 rounded-full font-black uppercase text-[12px] tracking-widest transition-all shadow-xl ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40'
            }`}
          >
            {saving ? 'Sauvegarde...' : saved ? '✓ Sauvegardé' : 'Sauvegarder la configuration'}
          </button>
        </div>
      </main>
    </div>
  );
}