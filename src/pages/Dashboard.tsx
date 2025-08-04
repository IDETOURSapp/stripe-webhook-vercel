import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ClientDashboard from './ClientDashboard';
import ProviderDashboard from './ProviderDashboard';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  return profile?.user_type === 'provider' ? <ProviderDashboard /> : <ClientDashboard />;
};

export default Dashboard;