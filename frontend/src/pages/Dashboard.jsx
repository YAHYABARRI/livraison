import React from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Common/Layout';
import ClientDashboard from '../components/Dashboard/ClientDashboard';
import DriverDashboard from '../components/Dashboard/DriverDashboard';
import AdminDashboard from '../components/Dashboard/AdminDashboard';

const Dashboard = () => {
  const { user, isClient, isDriver, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFF6FF] dark:bg-[#090D16]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500">Chargement de votre session...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      {isClient && <ClientDashboard />}
      {isDriver && <DriverDashboard />}
      {isAdmin && <AdminDashboard />}
    </Layout>
  );
};

export default Dashboard;
