import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isClient, isDriver, isAdmin, user } = useAuth();

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const getLinks = () => {
    if (isClient) {
      return [
        { path: '/dashboard', label: 'Tableau de bord' },
        { path: '/create-parcel', label: 'Créer un colis' },
        { path: '/my-parcels', label: 'Mes colis' },
        { path: '/profile', label: 'Mon Profil' },
        { path: '/settings', label: 'Paramètres' },
      ];
    }
    if (isDriver) {
      return [
        { path: '/dashboard', label: 'Tableau de bord' },
        { path: '/driver/parcels', label: 'Colis assignés' },
        { path: '/profile', label: 'Mon Profil' },
        { path: '/settings', label: 'Paramètres' },
      ];
    }
    if (isAdmin) {
      return [
        { path: '/dashboard', label: 'Tableau de bord' },
        { path: '/admin/users', label: 'Utilisateurs' },
        { path: '/admin/parcels', label: 'Gestion Colis' },
        { path: '/profile', label: 'Mon Profil' },
        { path: '/settings', label: 'Paramètres' },
      ];
    }
    return [];
  };

  const links = getLinks();

  return (
    <div className="min-h-screen flex flex-col bg-[#EFF6FF] dark:bg-[#090D16] transition-colors duration-200">
      <Navbar />

      {/* Mobile Sidebar Toggle Header */}
      <div className="md:hidden flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={toggleMobileSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 cursor-pointer"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="text-xs font-bold text-slate-500 uppercase">
          Espace {isAdmin ? 'Admin' : isDriver ? 'Livreur' : 'Client'}
        </span>
      </div>

      <div className="flex flex-1 relative">
        {/* Sidebar Bureau */}
        <Sidebar />

        {/* Sidebar Mobile Overlay */}
        {mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" 
              onClick={() => setMobileSidebarOpen(false)}
            ></div>

            {/* Content Drawer */}
            <div className="relative w-64 bg-white dark:bg-slate-950 h-full p-6 flex flex-col justify-between shadow-2xl border-r border-slate-200 dark:border-slate-800 animate-slide-right text-left">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white">Menu QuickShip</span>
                  <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400 hover:text-slate-900">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {links.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                      onClick={() => setMobileSidebarOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {user && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  <p className="text-xs font-bold truncate text-slate-700 dark:text-slate-300">
                    {user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 min-h-[calc(100vh-4rem)] p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
