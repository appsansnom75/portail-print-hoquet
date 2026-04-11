import imageCompression from 'browser-image-compression';
import { supabase } from './supabase'; // Vérifie que le chemin vers ton client supabase est bon

export async function compressAndUploadImage(file: File, bucket = 'products') {
  if (!file) return null;

  // Configuration de la compression
  const options = {
    maxSizeMB: 0.7,          // Moins de 700 Ko pour un chargement rapide
    maxWidthOrHeight: 1200,  // Redimensionne si l'image est trop grande
    useWebWorker: true,
  };

  try {
    // 1. Compression
    const compressedFile = await imageCompression(file, options);
    
    // 2. Création d'un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 3. Upload sur Supabase
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, compressedFile);

    if (uploadError) throw uploadError;

    // 4. Récupération de l'URL publique
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Erreur compression/upload:', error);
    return null;
  }
}