import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import EditProfile from '../components/EditProfile';
import { 
  MapPinIcon, 
  CheckBadgeIcon, 
  SparklesIcon, 
  UserCircleIcon, 
  ChartBarIcon, 
  CogIcon, 
  CreditCardIcon, 
  ArrowPathIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

// ✅ Stripe init
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const ProviderDashboard: React.FC = () => {
  const { profile, user } = useAuth();
  const [membership, setMembership] = useState<{
    plan: string;
    status: string;
    expires_at: string;
    subscription_id?: string;
  } | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const location = useLocation();

  const fetchMembership = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('plan, status, expires_at, subscription_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setMembership(data);
    } catch (error) {
      console.error('Error fetching membership:', error);
      toast.error('Error al cargar información de membresía');
    }
  };

  useEffect(() => {
    fetchMembership();
    stripePromise.then((stripe) => {
      if (!stripe) {
        console.error('Stripe failed to initialize');
      }
    });
  }, [user?.id]);

  // ✅ Manejar éxito o cancelación en checkout
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'true') {
      toast.success('¡Pago exitoso! Tu membresía está activa.');
      fetchMembership();
    } else if (params.get('canceled') === 'true') {
      toast.error('El pago fue cancelado. Intenta nuevamente.');
    }

    // ✅ Limpiar los parámetros de la URL
    if (params.get('success') || params.get('canceled')) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location.search]);

// Actualiza las funciones relacionadas con Stripe en ProviderDashboard.tsx

const handlePurchaseMembership = async (plan: string) => {
  if (!user) {
    toast.error('Debes iniciar sesión primero');
    return;
  }

  setLoading((prev) => ({ ...prev, [plan]: true }));

  try {
    const apiUrl = `${import.meta.env.VITE_API_URL}/create-subscription`.replace(/([^:]\/)\/+/g, '$1');
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) throw new Error('No se pudo obtener la sesión');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        userId: user.id,
        plan,
        customerEmail: user.email,
        metadata: {
          provider_id: user.id,
          provider_name: profile?.full_name || 'Proveedor',
          success_url: `${window.location.origin}/dashboard?success=true`,
          cancel_url: `${window.location.origin}/membership-cancel`
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error en la respuesta del servidor');
    }

    const { sessionId } = await response.json();
    const stripe = await stripePromise;

    if (!stripe) throw new Error('Stripe no se inicializó correctamente');

    const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
    if (stripeError) throw stripeError;
  } catch (error: any) {
    console.error('Error en compra:', error);
    toast.error(error.message || 'Error al procesar el pago');
  } finally {
    setLoading((prev) => ({ ...prev, [plan]: false }));
  }
};

  const handleCustomerPortal = async () => {
    if (!membership?.subscription_id) {
      toast.error('No hay suscripción activa para gestionar');
      return;
    }

    setLoading((prev) => ({ ...prev, portal: true }));

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('No se pudo obtener la sesión');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/create-customer-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          subscriptionId: membership.subscription_id,
          returnUrl: window.location.href
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al acceder al portal');
      }

      const { portalUrl } = await response.json();
      window.location.href = portalUrl;
    } catch (error: any) {
      console.error('Error en handleCustomerPortal:', error);
      toast.error(error.message || 'Error al gestionar la suscripción');
    } finally {
      setLoading((prev) => ({ ...prev, portal: false }));
    }
  };

  const membershipPlans = [
    { 
      plan: 'basic', 
      price: '$10', 
      features: [
        'Perfil básico', 
        'Hasta 3 fotos',
        'Visibilidad estándar'
      ],
      recommended: false
    },
    { 
      plan: 'premium', 
      price: '$20', 
      features: [
        'Perfil destacado', 
        'Hasta 10 fotos',
        'Estadísticas básicas',
        'Prioridad en búsquedas'
      ],
      recommended: true
    },
    { 
      plan: 'pro', 
      price: '$50', 
      features: [
        'Máxima visibilidad', 
        'Fotos ilimitadas',
        'Analítica avanzada',
        'Soporte prioritario',
        'Badge exclusivo'
      ],
      recommended: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <EditProfile onClose={() => setShowEditProfile(false)} />
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Proveedor</h1>
          <p className="text-purple-600 font-medium">
            {profile?.full_name || 'Perfil profesional'}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            membership?.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {membership?.status === 'active' 
              ? `Membresía ${membership.plan.charAt(0).toUpperCase() + membership.plan.slice(1)}` 
              : 'Sin Membresía'}
          </span>
          
          {membership?.status === 'active' && (
            <button
              onClick={handleCustomerPortal}
              disabled={loading.portal}
              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800"
            >
              {loading.portal ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <CreditCardIcon className="w-4 h-4" />
                  Gestionar suscripción
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <SparklesIcon className="w-6 h-6 mr-2" />
                {membership?.status === 'active'
                  ? `Tu Membresía ${membership.plan.charAt(0).toUpperCase() + membership.plan.slice(1)}`
                  : 'Potencia tu visibilidad'}
              </h2>
              <p className="opacity-90 max-w-lg">
                {membership?.status === 'active'
                  ? `Válida hasta ${new Date(membership.expires_at).toLocaleDateString()}`
                  : 'Actualiza tu plan para aparecer en primeros lugares y obtener más clientes'}
              </p>
            </div>
            
            <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
              membership?.status === 'active' 
                ? 'bg-white/20' 
                : 'bg-white/10 border border-white/20'
            }`}>
              {membership?.status === 'active' ? (
                <>
                  <CheckBadgeIcon className="w-4 h-4" />
                  <span>Activa</span>
                </>
              ) : (
                <>
                  <ClockIcon className="w-4 h-4" />
                  <span>Inactiva</span>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {membershipPlans.map((tier) => (
              <div 
                key={tier.plan} 
                className={`relative rounded-xl p-5 border transition-all ${
                  tier.recommended 
                    ? 'bg-white/20 border-white/30 shadow-lg' 
                    : 'bg-white/10 border-white/20'
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                    RECOMENDADO
                  </div>
                )}
                
                <h3 className="font-bold text-lg mb-2">
                  {tier.plan.charAt(0).toUpperCase() + tier.plan.slice(1)}
                </h3>
                
                <p className="text-2xl font-bold mb-3">
                  {tier.price}
                  <span className="text-sm font-normal opacity-80">/mes</span>
                </p>
                
                <ul className="space-y-2 text-sm mb-4">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckBadgeIcon className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {membership?.status === 'active' && membership.plan === tier.plan ? (
                  <div className="w-full bg-white/30 text-white py-2 rounded-lg text-center text-sm">
                    Plan Actual
                  </div>
                ) : (
                  <button
                    onClick={() => handlePurchaseMembership(tier.plan)}
                    disabled={loading[tier.plan]}
                    className={`w-full py-2 rounded-lg font-medium transition-all ${
                      tier.recommended
                        ? 'bg-white text-purple-600 hover:bg-gray-100'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    } flex items-center justify-center gap-2`}
                  >
                    {loading[tier.plan] ? (
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    ) : (
                      'Seleccionar Plan'
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-r from-purple-100 to-pink-50 p-6">
            <div className="flex items-center justify-between">
              <UserCircleIcon className="w-10 h-10 text-purple-600" />
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                {profile?.photos?.length >= 3 ? 'Completo' : 'En progreso'}
              </span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tu Perfil</h3>
            <p className="text-gray-600 mb-4">
              {profile?.photos?.length >= 3 
                ? 'Perfil completo y visible'
                : `Completa tu perfil (${profile?.photos?.length || 0}/3 fotos)`}
            </p>
            <button
              onClick={() => setShowEditProfile(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Editar Perfil
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-r from-green-100 to-teal-50 p-6">
            <div className="flex items-center justify-between">
              <CogIcon className="w-10 h-10 text-green-600" />
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {profile?.services ? profile.services.split(',').length : '0'} servicios
              </span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tus Servicios</h3>
            <p className="text-gray-600 mb-4">
              {profile?.services 
                ? 'Gestiona tus servicios y tarifas'
                : 'Añade tus primeros servicios'}
            </p>
            <button
              onClick={() => navigate('/services')}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 rounded-lg font-medium hover:from-green-600 hover:to-teal-600 transition-all"
            >
              Gestionar Servicios
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-r from-blue-100 to-cyan-50 p-6">
            <div className="flex items-center justify-between">
              <ChartBarIcon className="w-10 h-10 text-blue-600" />
              <span className={`text-xs px-2 py-1 rounded-full ${
                membership?.plan === 'premium' || membership?.plan === 'pro'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {membership?.plan === 'premium' || membership?.plan === 'pro' ? 'Disponible' : 'Premium'}
              </span>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Estadísticas</h3>
            <p className="text-gray-600 mb-4">
              {membership?.plan === 'premium' || membership?.plan === 'pro'
                ? 'Visualiza tu rendimiento y visitas'
                : 'Actualiza para acceder a métricas detalladas'}
            </p>
            <button
              onClick={() => membership?.plan === 'premium' ? navigate('/analytics') : handlePurchaseMembership('premium')}
              className={`w-full py-2 rounded-lg font-medium transition-all ${
                membership?.plan === 'premium' 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {membership?.plan === 'premium' ? 'Ver Estadísticas' : 'Actualizar Plan'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <UserCircleIcon className="w-5 h-5 mr-2 text-purple-500" />
            Vista Previa de tu Perfil
          </h2>
        </div>
        <div className="p-6">
          {profile?.photos?.length > 0 ? (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {profile.photos.slice(0, 3).map((photo, index) => (
                <div key={index} className="relative group aspect-square overflow-hidden rounded-xl">
                  <img 
                    src={photo} 
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-white text-sm">Foto {index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 h-48 rounded-xl flex flex-col items-center justify-center text-gray-500 mb-6">
              <UserCircleIcon className="w-12 h-12 mb-2" />
              <p>No hay fotos disponibles</p>
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">{profile?.full_name || 'Nombre no establecido'}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {profile?.age && <span>{profile.age} años</span>}
              {profile?.location && <span className="flex items-center"><MapPinIcon className="w-3 h-3 mr-1" />{profile.location}</span>}
            </div>
            <p className="text-gray-700 line-clamp-3">
              {profile?.description || 'Agrega una descripción atractiva para que los clientes te conozcan mejor.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;