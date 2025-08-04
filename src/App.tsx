import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Matches from './pages/Matches';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import ServicesManager from './pages/ServicesManager';
import AdminPanel from './pages/AdminPanel';
import Analytics from './pages/Analytics';
import MembershipSuccess from './pages/MembershipSuccess';
import MembershipCancel from './pages/MembershipCancel';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  allowedRoles?: ('client' | 'provider' | 'admin')[];
}> = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificación de roles si se especifican
  if (allowedRoles && profile?.user_type && !allowedRoles.includes(profile.user_type)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notifications */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          success: {
            style: {
              background: '#10B981',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: 'white',
            },
          },
        }}
      />

      {/* Navigation */}
      <Navbar />

      {/* Main content */}
      <main className="pt-16 pb-8">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/membership/success" element={<MembershipSuccess />} />
          <Route path="/membership/cancel" element={<MembershipCancel />} />

          {/* Protected routes - all authenticated users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:conversationId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          {/* Provider-only routes */}
          <Route
            path="/services"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ServicesManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* Admin-only routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} ServiceMatch. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default App;