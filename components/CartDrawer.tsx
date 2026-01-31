'use client';
import React from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { cart, removeFromCart } = useCart();
  const router = useRouter();
  const totalHT = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0f092e] h-full shadow-2xl flex flex-col border-l border-white/10">
        <div className="p-8 flex justify-between items-center border-b border-white/5">
          <h2 className="text-xl font-black italic uppercase text-white">Votre <span className="text-blue-500">Panier</span></h2>
          <button onClick={onClose} className="text-[10px] font-black uppercase opacity-40">Fermer</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.map((item: any) => (
            <div key={item.id} className="bg-white/5 rounded-3xl p-5 border border-white/5 flex justify-between items-center">
              <div>
                <p className={`text-[11px] font-black uppercase ${item.color}`}>{item.name}</p>
                <p className="text-[9px] opacity-50 font-bold uppercase">{item.qty} ex.</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-white">{(item.price * item.qty).toFixed(2)}€</p>
                <button onClick={() => removeFromCart(item.id)} className="text-[8px] text-red-500 font-black uppercase">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-8 border-t border-white/10 bg-black/20">
          <div className="flex justify-between items-end mb-8 text-white">
            <span className="text-[10px] font-black uppercase opacity-40">Total HT</span>
            <span className="text-4xl font-black italic tracking-tighter">{totalHT.toFixed(2)}€</span>
          </div>
          <button onClick={() => { onClose(); router.push('/panier'); }} className="w-full py-6 bg-blue-600 text-white rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:bg-blue-500 transition-all">
            Voir mon panier
          </button>
        </div>
      </div>
    </div>
  );
}