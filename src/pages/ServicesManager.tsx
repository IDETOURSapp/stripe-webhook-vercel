import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

// Lista de servicios específicos para acompañantes masculinos
const SERVICE_OPTIONS = [
  { id: 'private_dance', name: 'Show privado (baile erótico)' },
  { id: 'couples_show', name: 'Show para parejas' },
  { id: 'bachelor_party', name: 'Fiestas de despedida' },
  { id: 'event_hosting', name: 'Acompañamiento a eventos' },
  { id: 'dinner_date', name: 'Cena romántica' },
  { id: 'extended_company', name: 'Acompañamiento prolongado' },
  { id: 'themed_performance', name: 'Show temático (uniforme, rolplay)' },
  { id: 'virtual_show', name: 'Show virtual (webcam)' },
  { id: 'group_performance', name: 'Show grupal (con otros artistas)' },
  { id: 'luxury_escort', name: 'Acompañamiento de lujo' },
];

const ServicesManager: React.FC = () => {
  const { profile, user } = useAuth();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [rates, setRates] = useState<Record<string, string>>({});

  // Cargar servicios existentes al montar el componente
  useEffect(() => {
    const loadServices = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('services, service_rates')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data.services) {
          // Asegúrate de que siempre sea un array
          setSelectedServices(Array.isArray(data.services) ? data.services : []);
        }
        if (data.service_rates) {
          setRates(data.service_rates);
        }
      } catch (error) {
        toast.error('Error al cargar servicios');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, [user?.id]);

  // Manejar selección/deselección de servicios
  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Manejar cambio de tarifas
  const handleRateChange = (serviceId: string, value: string) => {
    setRates(prev => ({
      ...prev,
      [serviceId]: value
    }));
  };

  // Agregar servicio personalizado
  const handleAddCustomService = () => {
    if (customService.trim() && !selectedServices.includes(customService)) {
      setSelectedServices(prev => [...prev, customService]);
      setCustomService('');
    }
  };

  // Guardar servicios en la base de datos
  const handleSave = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          services: selectedServices,
          service_rates: rates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Servicios actualizados correctamente');
    } catch (error) {
      toast.error('Error al guardar servicios');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Servicios</h1>
        
        <div className="space-y-8">
          {/* Servicios predefinidos */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Selecciona tus servicios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SERVICE_OPTIONS.map(service => (
                <div key={service.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={service.id}
                    checked={selectedServices.includes(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                    className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor={service.id} className="text-gray-700">
                    {service.name}
                  </label>
                  {selectedServices.includes(service.id) && (
                    <input
                      type="text"
                      value={rates[service.id] || ''}
                      onChange={(e) => handleRateChange(service.id, e.target.value)}
                      placeholder="Tarifa (ej: $150)"
                      className="ml-2 px-3 py-1 border border-gray-300 rounded-md text-sm w-24"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Servicios personalizados */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Agregar servicio personalizado</h2>
            <div className="flex space-x-2">
              <input
                type="text"
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                placeholder="Ej: Clase de baile privada"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              />
              <button
                onClick={handleAddCustomService}
                disabled={!customService.trim()}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Servicios seleccionados */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Tus servicios seleccionados</h2>
            {selectedServices.length === 0 ? (
              <p className="text-gray-500">No has seleccionado ningún servicio aún</p>
            ) : (
              <div className="space-y-3">
                {selectedServices.map(serviceId => {
                  const service = SERVICE_OPTIONS.find(s => s.id === serviceId) || { 
                    id: serviceId, 
                    name: serviceId 
                  };
                  return (
                    <div key={serviceId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{service.name}</span>
                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={rates[serviceId] || ''}
                          onChange={(e) => handleRateChange(serviceId, e.target.value)}
                          placeholder="Tarifa"
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm w-24"
                        />
                        <button
                          onClick={() => handleServiceToggle(serviceId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botón de guardar */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Guardar Servicios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesManager;