import React from 'react';
import { ProviderProfile } from '../types/database';
import { StarIcon, MapPinIcon, CheckBadgeIcon, ClockIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/solid';

interface ProviderCardProps {
  provider: ProviderProfile & { profile: any };
  onLike: () => void;
  onPass: () => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onLike, onPass }) => {
  // Función para obtener el badge de membresía con estilos
  const getMembershipBadge = (type: string) => {
    const badges = {
      basic: { 
        color: 'bg-gray-100 text-gray-800 border-gray-300', 
        text: 'Básico',
        icon: null
      },
      gold: { 
        color: 'bg-amber-50 text-amber-800 border-amber-300', 
        text: 'Oro',
        icon: <StarIcon className="w-3 h-3 ml-1" />
      },
      platinum: { 
        color: 'bg-purple-50 text-purple-800 border-purple-300', 
        text: 'Platino',
        icon: <CheckBadgeIcon className="w-3 h-3 ml-1 text-purple-400" />
      },
      diamond: { 
        color: 'bg-blue-50 text-blue-800 border-blue-300', 
        text: 'Diamante',
        icon: <div className="ml-1 text-blue-400">💎</div>
      },
    };
    return badges[type as keyof typeof badges] || badges.basic;
  };

  const badge = getMembershipBadge(provider.membership_type);
  const mainImage = provider.portfolio_images?.[0];
  const providerName = provider.business_name || provider.profile?.full_name || 'Proveedor';
  const initials = providerName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-sm mx-auto border border-gray-100"
    >
      {/* Header with Image */}
      <div className="relative h-72 bg-gradient-to-br from-gray-50 to-gray-100">
        {mainImage ? (
          <img
            src={mainImage}
            alt={providerName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-4xl font-bold text-white">
                {initials}
              </span>
            </div>
          </div>
        )}

        {/* Membership Badge */}
        <div className="absolute top-4 right-4 flex items-center">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center ${badge.color}`}>
            {badge.text}
            {badge.icon}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          <div className="flex items-center space-x-1">
            <StarIcon className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-gray-800">
              {(provider.rating ?? 0).toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              ({provider.total_reviews ?? 0})
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Name and Verification */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              {providerName}
              {provider.is_verified && (
                <CheckBadgeIcon className="w-5 h-5 ml-1 text-blue-500" />
              )}
            </h3>
            {provider.profession && (
              <p className="text-sm text-purple-600 font-medium">{provider.profession}</p>
            )}
          </div>
        </div>

        {/* Location and Experience */}
        <div className="flex flex-wrap gap-y-2 gap-x-4 mb-4">
          {provider.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
              <span>{provider.location}</span>
            </div>
          )}
          {provider.experience_years && (
            <div className="flex items-center text-sm text-gray-600">
              <ClockIcon className="w-4 h-4 mr-1 text-gray-400" />
              <span>{provider.experience_years}+ años de experiencia</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {provider.description || 'Este profesional no ha añadido una descripción todavía.'}
        </p>

        {/* Services */}
        {Array.isArray(provider.services) && provider.services.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Servicios destacados</h4>
            <div className="flex flex-wrap gap-2">
              {provider.services.slice(0, 4).map((service, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-50 text-gray-700 text-xs rounded-full border border-gray-200"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-medium text-gray-500">Tarifa por hora</span>
            <p className="text-lg font-bold text-gray-900">
              ${provider.hourly_rate?.toLocaleString() ?? '0'}
              <span className="text-sm font-normal text-gray-500">/hora</span>
            </p>
          </div>
          {provider.minimum_hours && (
            <div className="text-right">
              <span className="text-xs font-medium text-gray-500">Mínimo de horas</span>
              <p className="text-sm font-medium text-gray-900">{provider.minimum_hours} horas</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onPass}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <span>Pasar</span>
          </button>
          <button
            onClick={onLike}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-colors shadow-sm"
          >
            <span>Me Gusta</span>
            <HeartIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProviderCard;