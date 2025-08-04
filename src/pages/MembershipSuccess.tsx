import React from 'react';
import { Link } from 'react-router-dom';

const MembershipSuccess: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Membresía Activada!</h2>
        <p className="text-gray-600 mb-6">Tu membresía ha sido activada exitosamente. Ahora eres visible para los clientes.</p>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Ir al Dashboard
        </Link>
      </div>
    </div>
  );
};

export default MembershipSuccess;