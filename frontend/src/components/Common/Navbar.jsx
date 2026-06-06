import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, LogOut, User, Box, Settings, Bell, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/api';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      console.error("Erreur de récupération des notifications", err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Force light mode
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-200">
      <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto w-full">
        
        {/* Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 cursor-pointer group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md shadow-primary-500/10 group-hover:scale-105 transition-transform duration-200">
            <Box size={22} className="animate-pulse" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Quick<span className="text-primary-600">Ship</span>
          </span>
        </Link>

        {/* Liens publics si non connecté */}
        {!isAuthenticated && (
          <nav className="hidden lg:flex items-center gap-8 font-semibold text-sm text-slate-600 dark:text-slate-300">
            <Link to="/" className="hover:text-primary-600 transition-colors">Accueil</Link>
            <Link to="/track" className="hover:text-primary-600 transition-colors">Suivi public</Link>
          </nav>
        )}

        {/* Actions de droite */}
        <div className="flex items-center gap-3">
          {/* Notifications Bell (Only if authenticated) */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer relative"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-600 text-white rounded-full flex items-center justify-center text-[10px] font-black animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  {/* Backdrop to close */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                  
                  {/* Dropdown Panel */}
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium shadow-xl py-2 z-50 animate-scale-up text-left">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-150 dark:border-slate-800/80">
                      <span className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[10px] font-bold text-primary-600 hover:text-primary-750 dark:text-primary-400 cursor-pointer"
                        >
                          Tout lire
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400 italic">
                          Aucune notification
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (!n.read) handleMarkAsRead(n.id);
                              setShowNotifications(false);
                              navigate('/my-parcels');
                            }}
                            className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-950/45 cursor-pointer transition-colors ${!n.read ? 'bg-primary-50/10 dark:bg-slate-850/10 font-bold' : ''}`}
                          >
                            <p className="text-xs text-slate-750 dark:text-slate-300">{n.message}</p>
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleString('fr-FR')}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}



          {/* Boutons d'accès si non connecté */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link 
                to="/register" 
                className="hidden sm:inline-flex px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer border border-slate-200 dark:border-slate-800"
              >
                Inscription
              </Link>
              <Link 
                to="/login" 
                className="px-4 py-2 bg-primary-600 hover:bg-primary-750 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <User size={14} />
                <span>Espace Client</span>
              </Link>
            </div>
          ) : (
            /* Profil Utilisateur si connecté */
            user && (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-600 font-medium">
                    {user.roles.includes('ADMIN') ? 'Administrateur' : user.roles.includes('DRIVER') ? 'Livreur' : 'Client'}
                  </span>
                </div>
                
                <Link to="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-slate-700 cursor-pointer" title="Voir mon profil">
                  <User size={18} />
                </Link>

                {/* Settings shortcut */}
                <Link
                  to="/settings"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-900/50 transition-all duration-200 cursor-pointer"
                  title="Paramètres"
                >
                  <Settings size={18} />
                </Link>

                {/* Bouton déconnexion */}
                <button
                  onClick={handleLogout}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
                  title="Se déconnecter"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
