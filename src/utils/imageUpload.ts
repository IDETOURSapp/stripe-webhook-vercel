// src/utils/imageUpload.ts
import { supabase } from '../config/supabase';

export const uploadImage = async (file: File, userId: string): Promise<string> => {
  // Generar nombre único para el archivo
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const fileName = `${userId}-${timestamp}.${fileExtension}`;
  
  const { data, error } = await supabase.storage
    .from('provider-photos')  // Usamos tu bucket provider-photos
    .upload(`public/${fileName}`, file);

  if (error) {
    console.error('Error uploading image:', error);
    throw new Error('Error al subir la imagen');
  }

  // Obtener URL pública (ya que el bucket es público)
  const publicURL = `${supabase.storage.url}/object/public/provider-photos/${data.path}`;
  
  return publicURL;
};

export const deleteImage = async (fileUrl: string) => {
  try {
    // Extraer el nombre del archivo de la URL
    const filePath = fileUrl.split('/provider-photos/')[1];
    
    const { error } = await supabase.storage
      .from('provider-photos')
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};