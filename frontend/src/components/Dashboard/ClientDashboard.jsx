import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { parcelService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  ArrowUpRight, 
  Plus,
  Eye,
  Euro,
  ArrowRight,
  Search
} from 'lucide-react';
import { SkeletonStats, SkeletonTable } from '../Common/Skeleton';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await parcelService.getAllMyParcels();
        setParcels(data);
      } catch (err) {
        console.error(err);
        toast.error("Impossible de charger les données du tableau de bord.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [toast]);

  const getStats = () => {
    const total = parcels.length;
    const pending = parcels.filter(p => p.status !== 'DELIVERED').length;
    const delivered = parcels.filter(p => p.status === 'DELIVERED').length;
    
    // Monthly spending (current calendar month)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthlySpending = parcels
      .filter(p => {
        const d = new Date(p.createdAt);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((sum, p) => sum + (p.shippingPrice || 0), 0);

    return { total, pending, delivered, monthlySpending };
  };

  const stats = getStats();
  const [quickTrackId, setQuickTrackId] = useState('');

  const handleQuickTrackSubmit = (e) => {
    e.preventDefault();
    if (quickTrackId.trim()) {
      navigate(`/track/${quickTrackId.trim()}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 text-left">
        <SkeletonStats />
        <SkeletonTable />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CREATED':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 rounded-full font-semibold">Créé</span>;
      case 'ACCEPTED':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400 rounded-full font-semibold">Accepté</span>;
      case 'PICKED_UP':
        return <span className="px-2 py-0.5 bg-teal-100 text-teal-800 dark:bg-teal-950/20 dark:text-teal-400 rounded-full font-semibold">Collecté</span>;
      case 'IN_TRANSIT':
        return <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-950/20 dark:text-indigo-400 rounded-full font-semibold">En transit</span>;
      case 'ARRIVED_AT_HUB':
        return <span className="px-2 py-0.5 bg-sky-100 text-sky-800 dark:bg-sky-950/20 dark:text-sky-450 rounded-full font-semibold">Au centre de tri</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400 rounded-full font-semibold">En livraison</span>;
      case 'DELIVERED':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-full font-semibold">Livré</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full font-semibold">{status}</span>;
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 text-left"
    >
      {/* Salutations */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Tableau de Bord
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Bonjour ! Suivez l'activité de vos envois de colis en temps réel
          </p>
        </div>
      </div>

      {/* Widget Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Colis */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium flex items-center justify-between hover:shadow-lg transition-all"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Colis</p>
            <p className="text-3xl font-black text-slate-850 dark:text-white">{stats.total}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary-50 dark:bg-slate-800 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Package size={22} />
          </div>
        </motion.div>

        {/* Livrés */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium flex items-center justify-between hover:shadow-lg transition-all"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Colis Livrés</p>
            <p className="text-3xl font-black text-slate-850 dark:text-white">{stats.delivered}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500">
            <CheckCircle size={22} />
          </div>
        </motion.div>

        {/* En attente */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium flex items-center justify-between hover:shadow-lg transition-all"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">En cours / Attente</p>
            <p className="text-3xl font-black text-slate-850 dark:text-white">{stats.pending}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500">
            <Clock size={22} />
          </div>
        </motion.div>

        {/* Dépenses Mensuelles */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium flex items-center justify-between hover:shadow-lg transition-all"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dépenses ce mois</p>
            <p className="text-3xl font-black text-slate-850 dark:text-white">{stats.monthlySpending.toFixed(2)} €</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-500">
            <Euro size={22} />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Chart and Quick Actions */}
        <div className="space-y-8 lg:col-span-1">
          {/* Chart */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-white mb-1">
                Statistiques Mensuelles
              </h3>
              <p className="text-xs text-slate-400 font-medium mb-6">
                Nombre d'expéditions réalisées sur les derniers mois
              </p>
            </div>
            
            <div className="h-40 w-full flex items-end justify-between px-2 gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              {[
                { month: 'Jan', count: 4 },
                { month: 'Fév', count: 7 },
                { month: 'Mar', count: 12 },
                { month: 'Avr', count: 9 },
                { month: 'Mai', count: 15 },
                { month: 'Juin', count: stats.total || 3 },
              ].map((d, i) => {
                const maxCount = 20;
                const percent = (d.count / maxCount) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-bold text-primary-650 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.count}
                    </div>
                    <div 
                      className="w-full bg-primary-100 hover:bg-primary-500 dark:bg-slate-800 dark:hover:bg-primary-500 rounded-t-lg transition-all duration-350 cursor-pointer"
                      style={{ height: `${percent}%`, minHeight: '10%' }}
                    ></div>
                    <span className="text-xs font-bold text-slate-400">{d.month}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium space-y-4"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-white mb-1">
                Actions Rapides
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Accédez rapidement aux outils principaux
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link 
                to="/create-parcel"
                className="flex items-center justify-between p-3.5 border border-slate-100 dark:border-slate-800 hover:border-primary-550 dark:hover:border-primary-550 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    <Plus size={16} />
                  </span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Expédier un nouveau colis</span>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-primary-600 transition-colors" />
              </Link>

              <Link 
                to="/my-parcels"
                className="flex items-center justify-between p-3.5 border border-slate-100 dark:border-slate-800 hover:border-primary-550 dark:hover:border-primary-550 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                    <Package size={16} />
                  </span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Voir toutes mes factures</span>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-primary-600 transition-colors" />
              </Link>

              {/* Quick Tracking input */}
              <div className="p-3.5 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-950/20">
                <p className="text-xs font-bold text-slate-500 mb-2">Suivi express de colis</p>
                <form onSubmit={handleQuickTrackSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-3 text-slate-400">
                      <Search size={14} />
                    </span>
                    <input 
                      type="text"
                      placeholder="Identifiant de suivi (Ex: QS-...)"
                      className="w-full pl-8 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      value={quickTrackId}
                      onChange={(e) => setQuickTrackId(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="px-3 py-2 bg-primary-600 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-primary-700 transition-colors"
                  >
                    Go
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right column: Recent shipments */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium space-y-4 self-start"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-white mb-1">
                Dernières Expéditions
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Vos 5 expéditions les plus récentes
              </p>
            </div>
            <Link
              to="/my-parcels"
              className="text-xs font-bold text-primary-600 hover:text-primary-750 dark:text-primary-450 dark:hover:text-primary-400 flex items-center gap-1 cursor-pointer"
            >
              <span>Voir tout</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {parcels.length === 0 ? (
            <div className="py-12 text-center text-slate-450 dark:text-slate-650 italic">
              Aucun colis enregistré pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">
                    <th className="pb-3">Numéro de Suivi</th>
                    <th className="pb-3">Destinataire</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Prix</th>
                    <th className="pb-3">Statut</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                  {parcels.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="py-3 text-sm font-bold text-primary-600 dark:text-primary-400">{p.trackingId}</td>
                      <td className="py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">{p.recipientName}</td>
                      <td className="py-3 text-xs text-slate-500">{p.parcelType || 'Colis'}</td>
                      <td className="py-3 text-sm font-bold text-slate-700 dark:text-slate-300">{p.shippingPrice ? `${p.shippingPrice.toFixed(2)} €` : 'N/A'}</td>
                      <td className="py-3 text-xs">
                        {getStatusBadge(p.status)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => navigate('/my-parcels')}
                          className="p-1.5 border border-slate-100 dark:border-slate-800 hover:border-primary-500 rounded-lg text-slate-400 hover:text-primary-650 cursor-pointer"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ClientDashboard;
