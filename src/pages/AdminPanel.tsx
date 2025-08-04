import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

const AdminPanel: React.FC = () => {
  const { profile } = useAuth();
  const [users, setUsers] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (!error) setUsers(data || []);
    };
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ user_type: newRole })
      .eq('id', userId);
    
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, user_type: newRole } : u));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.user_type}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="client">Cliente</option>
                    <option value="provider">Proveedor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-red-500 hover:text-red-700">
                    Banear
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;