import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  UserIcon, 
  Bars3Icon,
  HeartIcon
} from '@heroicons/react/24/outline';

const Layout: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  if (!user || !profile) return null;

  const navigation = [
    { name: 'Inicio', href: '/dashboard', icon: HomeIcon },
    { name: 'Matches', href: '/matches', icon: HeartIcon },
    { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'Perfil', href: '/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold text-gray-900">ServiceMatch</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hola, {profile.full_name || profile.email}
              </span>
              <button
                onClick={signOut}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;