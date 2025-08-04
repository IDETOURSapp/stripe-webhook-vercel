import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsDashboard: React.FC = () => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [customRange, setCustomRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = customRange;

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        // Obtener estadísticas básicas
        const { data: statsData } = await supabase
          .rpc('get_provider_stats', {
            provider_id: user.id,
            time_range: timeRange,
            start_date: startDate?.toISOString(),
            end_date: endDate?.toISOString()
          });

        // Obtener datos para gráficos
        const { data: viewsData } = await supabase
          .from('profile_views')
          .select('created_at')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: true });

        const { data: matchesData } = await supabase
          .from('matches')
          .select('created_at, status')
          .eq('provider_id', user.id);

        setStats({
          summary: statsData?.[0] || {},
          views: viewsData || [],
          matches: matchesData || []
        });
      } catch (error) {
        toast.error('Error al cargar estadísticas');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.id, timeRange, startDate, endDate]);

  // Procesar datos para gráficos
  const processChartData = () => {
    if (!stats) return [];

    // Agrupar vistas por día
    const viewsByDay: Record<string, number> = {};
    stats.views.forEach((view: any) => {
      const date = new Date(view.created_at).toLocaleDateString();
      viewsByDay[date] = (viewsByDay[date] || 0) + 1;
    });

    return Object.entries(viewsByDay).map(([date, count]) => ({
      date,
      views: count
    }));
  };

  const processMatchesData = () => {
    if (!stats) return [];

    const statusCounts: Record<string, number> = {
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0
    };

    stats.matches.forEach((match: any) => {
      statusCounts[match.status] = (statusCounts[match.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">No hay datos disponibles</h2>
        <p className="text-gray-500">Tus estadísticas aparecerán aquí cuando tengas actividad</p>
      </div>
    );
  }

  const chartData = processChartData();
  const matchesData = processMatchesData();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analíticas de tu Perfil</h1>
        
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Rango:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="border rounded-md px-3 py-1 text-sm"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Personalizado:</span>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setCustomRange(update)}
              isClearable
              placeholderText="Selecciona rango"
              className="border rounded-md px-3 py-1 text-sm w-48"
            />
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Visitas totales</h3>
          <p className="text-3xl font-bold mt-2">{stats.summary.total_views || 0}</p>
          <p className={`text-sm mt-1 ${stats.summary.views_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stats.summary.views_change >= 0 ? '↑' : '↓'} {Math.abs(stats.summary.views_change || 0)}% vs período anterior
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Matches</h3>
          <p className="text-3xl font-bold mt-2">{stats.summary.total_matches || 0}</p>
          <p className={`text-sm mt-1 ${stats.summary.matches_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stats.summary.matches_change >= 0 ? '↑' : '↓'} {Math.abs(stats.summary.matches_change || 0)}% vs período anterior
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Tasa de conversión</h3>
          <p className="text-3xl font-bold mt-2">{stats.summary.conversion_rate || 0}%</p>
          <p className="text-sm text-gray-500 mt-1">Visitas a matches</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Ingresos estimados</h3>
          <p className="text-3xl font-bold mt-2">${stats.summary.estimated_earnings || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Basado en tus tarifas</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Visitas a tu perfil</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#8884d8" name="Visitas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Estado de tus matches</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={matchesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {matchesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla de matches recientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <h2 className="text-xl font-semibold p-6 pb-0">Matches Recientes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.matches.slice(0, 5).map((match: any) => (
                <tr key={match.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(match.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {match.client_name || 'Anónimo'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      match.status === 'completed' ? 'bg-green-100 text-green-800' :
                      match.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {match.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {match.service || 'No especificado'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;