// src/components/editprofile.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';
import { uploadImage, deleteImage } from '../utils/imageUpload';

interface EditProfileProps {
  onClose?: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ onClose }) => {
  const { profile, user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    location: '',
    description: '',
    services: '',
    rates: '',
    availability: '',
    measurements: '',
    languages: '',
    photos: [] as string[],
  });
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        age: profile.age || '',
        location: profile.location || '',
        description: profile.description || '',
        services: profile.services || '',
        rates: profile.rates || '',
        availability: profile.availability || '',
        measurements: profile.measurements || '',
        languages: profile.languages || '',
        photos: profile.photos || [],
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user?.id) return;
    
    setUploading(true);
    try {
      const file = e.target.files[0];
      const photoUrl = await uploadImage(file, user.id);
      
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, photoUrl]
      }));
      toast.success('Foto subida correctamente');
    } catch (error) {
      toast.error('Error al subir la foto');
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = ''; // Resetear input para permitir la misma foto otra vez
    }
  };

  const removePhoto = async (index: number) => {
    const photoToRemove = formData.photos[index];
    try {
      // Eliminar de Supabase Storage
      await deleteImage(photoToRemove);
      
      // Eliminar del estado local
      setFormData(prev => ({
        ...prev,
        photos: prev.photos.filter((_, i) => i !== index)
      }));
      toast.success('Foto eliminada');
    } catch (error) {
      toast.error('Error al eliminar la foto');
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success('Perfil actualizado correctamente');
      if (onClose) onClose(); // Cerrar modal si está en uno
    } catch (error) {
      toast.error('Error al actualizar el perfil');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Editar Perfil</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección de Fotos */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Fotos del Perfil</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {formData.photos.map((photo, index) => (
              <div key={index} className="relative group h-40">
                <img
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
            <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-40 cursor-pointer hover:border-purple-500 transition-colors">
              <input
                type="file"
                onChange={handlePhotoUpload}
                className="hidden"
                accept="image/*"
                disabled={uploading}
              />
              {uploading ? (
                <span className="text-gray-500">Subiendo...</span>
              ) : (
                <div className="text-center p-2">
                  <div className="text-2xl mb-1">+</div>
                  <div className="text-sm text-gray-500">Añadir foto</div>
                </div>
              )}
            </label>
          </div>
          <p className="text-sm text-gray-500">Mínimo 3 fotos para un perfil completo</p>
        </div>

        {/* Información Básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre artístico*</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Edad*</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              min="18"
              max="99"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación*</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Idiomas</label>
            <input
              type="text"
              name="languages"
              value={formData.languages}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              placeholder="Español, Inglés..."
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción*</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            placeholder="Describe tu personalidad, estilo y lo que ofreces..."
            required
          />
        </div>

        {/* Servicios y Tarifas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Servicios ofrecidos*</label>
            <textarea
              name="services"
              value={formData.services}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              placeholder="Ej: Citas sociales, acompañamiento a eventos..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tarifas*</label>
            <textarea
              name="rates"
              value={formData.rates}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              placeholder="Ej: 200€/hora, 500€/noche..."
              required
            />
          </div>
        </div>

        {/* Detalles Adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medidas físicas</label>
            <input
              type="text"
              name="measurements"
              value={formData.measurements}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              placeholder="Ej: Altura: 1.85m, Peso: 80kg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidad</label>
            <input
              type="text"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              placeholder="Ej: 24/7, Solo fines de semana..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;