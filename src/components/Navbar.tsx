import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Sesión cerrada exitosamente');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Error al cerrar sesión');
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">ServiceMatch</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-purple-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/matches"
                  className="text-gray-700 hover:text-purple-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Matches
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-purple-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Perfil
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {profile?.full_name?.[0] || profile?.email?.[0] || '?'}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    {profile?.full_name || profile?.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-purple-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-purple-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  Crear Cuenta
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-purple-500 p-2 rounded-md"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Avatar"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {profile?.full_name?.[0] || profile?.email?.[0] || '?'}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {profile?.full_name || profile?.email}
                    </span>
                  </div>
                  <Link
                    to="/dashboard"
                    className="block text-gray-700 hover:text-purple-500 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/matches"
                    className="block text-gray-700 hover:text-purple-500 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Matches
                  </Link>
                  <Link
                    to="/profile"
                    className="block text-gray-700 hover:text-purple-500 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Perfil
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left text-gray-700 hover:text-purple-500 px-3 py-2 rounded-md text-base font-medium transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-gray-700 hover:text-purple-500 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/signup"
                    className="block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-md text-base font-medium hover:from-purple-600 hover:to-pink-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Crear Cuenta
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;