import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  User,
  Users,
  Truck,
  ShieldCheck,
  Settings,
  FileText
} from 'lucide-react';

const Sidebar = () => {
  const { user, isClient, isDriver, isAdmin } = useAuth();

  const getLinks = () => {
    if (isClient) {
      return [
        { path: '/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
        { path: '/create-parcel', label: 'Créer un colis', icon: <PlusCircle size={20} /> },
        { path: '/my-parcels', label: 'Mes colis', icon: <Package size={20} /> },
        { path: '/profile', label: 'Mon Profil', icon: <User size={20} /> },
        { path: '/settings', label: 'Paramètres', icon: <Settings size={20} /> },
      ];
    }

    if (isDriver) {
      return [
        { path: '/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
        { path: '/driver/parcels', label: 'Colis assignés', icon: <Truck size={20} /> },
        { path: '/profile', label: 'Mon Profil', icon: <User size={20} /> },
        { path: '/settings', label: 'Paramètres', icon: <Settings size={20} /> },
      ];
    }

    if (isAdmin) {
      return [
        { path: '/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/users', label: 'Utilisateurs', icon: <Users size={20} /> },
        { path: '/admin/parcels', label: 'Gestion Colis', icon: <Package size={20} /> },
        { path: '/admin/reports', label: 'Rapports & Factures', icon: <FileText size={20} /> },
        { path: '/profile', label: 'Mon Profil', icon: <User size={20} /> },
        { path: '/settings', label: 'Paramètres', icon: <Settings size={20} /> },
      ];
    }

    return [];
  };

  const links = getLinks();

  return (
    <aside className="w-64 fixed left-0 top-16 bottom-0 z-30 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 px-4 py-6 transition-colors duration-200 hidden md:block">
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-1.5">
          <div className="px-3 mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
            Navigation
          </div>
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${isActive
                  ? 'bg-primary-50 dark:bg-slate-900 text-primary-600 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Info utilisateur badge en bas */}
        {user && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800/50 flex items-center gap-2">
            <div className="p-1.5 bg-primary-100 dark:bg-slate-800 rounded-lg text-primary-600 dark:text-primary-400">
              <ShieldCheck size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate text-slate-700 dark:text-slate-300">
                {user.email}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">
                Session active
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
