import React, { useState } from 'react';
import { useProviders, useCreateMatch } from '../hooks/useProviders';
import ProviderCard from '../components/ProviderCard';
import { motion } from 'framer-motion';
import { HeartIcon, XMarkIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const ClientDashboard: React.FC = () => {
  const { data: providers, isLoading, error } = useProviders();
  const createMatch = useCreateMatch();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

  const handleLike = async (providerId: string) => {
    try {
      await createMatch.mutateAsync({ providerId });
      toast.success('¡Match creado!');
      setCurrentIndex(prev => prev + 1);
    } catch (error: any) {
      toast.error(error.message || 'Error al crear match');
    }
  };

  const handlePass = () => setCurrentIndex(prev => prev + 1);

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>;
  if (error) return <div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar proveedores</h2></div>;

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Descubre Profesionales</h1>
        <p className="text-gray-600">Desliza para encontrar el servicio perfecto</p>
      </div>

      {!providers?.length ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No hay proveedores disponibles</h2>
          <p className="text-gray-600">Vuelve más tarde para ver nuevos profesionales</p>
        </div>
      ) : providers[currentIndex] ? (
        <div className="relative">
          <motion.div
            key={currentIndex}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) {
                setDragDirection('right');
                handleLike(providers[currentIndex].id);
              } else if (info.offset.x < -100) {
                setDragDirection('left');
                handlePass();
              }
              setTimeout(() => setDragDirection(null), 300);
            }}
            whileTap={{ scale: 0.95 }}
            className="cursor-grab"
          >
            <ProviderCard 
              provider={providers[currentIndex]} 
              onLike={() => handleLike(providers[currentIndex].id)} 
              onPass={handlePass} 
            />
          </motion.div>

          {dragDirection === 'right' && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-xl border-2 border-green-500 flex items-center justify-center pointer-events-none">
              <HeartIcon className="h-16 w-16 text-green-500" />
            </div>
          )}
          {dragDirection === 'left' && (
            <div className="absolute inset-0 bg-red-500 bg-opacity-20 rounded-xl border-2 border-red-500 flex items-center justify-center pointer-events-none">
              <XMarkIcon className="h-16 w-16 text-red-500" />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Has visto todos los proveedores!</h2>
          <button
            onClick={() => setCurrentIndex(0)}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Ver de nuevo
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;