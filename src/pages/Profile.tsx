import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      toast.success('Perfil actualizado exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {formData.full_name?.[0] || profile?.email?.[0] || '?'}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {profile?.full_name || profile?.email}
              </h3>
              <p className="text-gray-600 capitalize">{profile?.user_type}</p>
            </div>
          </div>

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 mb-2">
              URL de Avatar
            </label>
            <input
              id="avatar_url"
              name="avatar_url"
              type="url"
              value={formData.avatar_url}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="https://ejemplo.com/tu-foto.jpg"
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 mb-2">Información de Cuenta</h4>
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {profile?.email}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Tipo de usuario:</strong> {profile?.user_type === 'client' ? 'Cliente' : 'Proveedor'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Miembro desde:</strong> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;