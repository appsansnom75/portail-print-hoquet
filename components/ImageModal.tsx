'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
}

export default function ImageModal({ isOpen, onClose, imageSrc, imageAlt }: ImageModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-10">
          {/* Fond sombre transparent */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-zoom-out"
          />
          
          {/* Image agrandie */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-full max-h-full flex items-center justify-center"
          >
            <img 
              src={imageSrc} 
              alt={imageAlt} 
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/10"
            />
            
            {/* Bouton fermer */}
            <button 
              onClick={onClose}
              className="absolute -top-12 right-0 text-white font-black uppercase text-[13px] tracking-widest hover:text-blue-500 transition-colors"
            >
              Fermer ×
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}