import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CreateParcel from './pages/Client/CreateParcel';
import MyParcels from './pages/Client/MyParcels';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import TrackParcel from './pages/TrackParcel';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminParcels from './pages/Admin/AdminParcels';
import AdminReports from './pages/Admin/AdminReports';
import DriverParcels from './pages/Driver/DriverParcels';

// Wrapper pour sécuriser les routes
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFF6FF] dark:bg-[#090D16]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500">Validation de sécurité...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const hasRole = user.roles.some((r) => allowedRoles.includes(r.replace('ROLE_', '')));
    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/track" element={<TrackParcel />} />
            <Route path="/track/:trackingNumber" element={<TrackParcel />} />

            {/* Protected General Routes */}
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
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Client Routes */}
            <Route
              path="/create-parcel"
              element={
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <CreateParcel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-parcels"
              element={
                <ProtectedRoute allowedRoles={['CLIENT']}>
                  <MyParcels />
                </ProtectedRoute>
              }
            />

            {/* Driver Routes */}
            <Route
              path="/driver/parcels"
              element={
                <ProtectedRoute allowedRoles={['DRIVER']}>
                  <DriverParcels />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/parcels"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminParcels />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminReports />
                </ProtectedRoute>
              }
            />

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
