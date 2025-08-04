import React from 'react';
import { useMatches } from '../hooks/useProviders';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const Matches: React.FC = () => {
  const { data: matches, isLoading } = useMatches();
  const { profile } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const acceptedMatches = matches?.filter(match => match.status === 'accepted') || [];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tus Matches</h1>

      {acceptedMatches.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">No tienes matches aún</h2>
          <p className="text-gray-600 mb-6">
            Empieza a explorar proveedores para crear tus primeros matches
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Explorar Proveedores
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {acceptedMatches.map((match) => {
            const otherUser = profile?.user_type === 'client' ? match.provider : match.client;
            
            return (
              <div key={match.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {otherUser?.full_name?.[0] || otherUser?.email?.[0] || '?'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {otherUser?.full_name || otherUser?.email}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {profile?.user_type === 'client' ? 'Proveedor' : 'Cliente'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Link
                      to={`/chat/${match.id}`}
                      className="flex-1 flex items-center justify-center space-x-2 bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      <span>Chat</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Matches;