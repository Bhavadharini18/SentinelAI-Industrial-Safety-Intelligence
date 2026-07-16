import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

// Pages imports (we will write these next)
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import PlantLayout from '../pages/PlantLayout';
import Sensors from '../pages/Sensors';
import Workers from '../pages/Workers';
import Machines from '../pages/Machines';
import Alerts from '../pages/Alerts';
import Reports from '../pages/Reports';
import Emergency from '../pages/Emergency';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-darkest flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
          <p className="text-brand-textMuted text-sm font-mono">AUTHENTICATING_USER...</p>
        </div>
      </div>
    );
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

const AppRoutes = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-darkest flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Route */}
      <Route 
        path="/login" 
        element={token ? <Navigate to="/" replace /> : <Login />} 
      />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/layout" element={<ProtectedRoute><PlantLayout /></ProtectedRoute>} />
      <Route path="/sensors" element={<ProtectedRoute><Sensors /></ProtectedRoute>} />
      <Route path="/workers" element={<ProtectedRoute><Workers /></ProtectedRoute>} />
      <Route path="/machines" element={<ProtectedRoute><Machines /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
