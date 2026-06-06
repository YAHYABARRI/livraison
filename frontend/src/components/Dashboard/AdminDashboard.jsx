import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Truck, 
  Package, 
  DollarSign, 
  UserPlus, 
  Eye, 
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { SkeletonStats, SkeletonTable } from '../Common/Skeleton';

const AdminDashboard = () => {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal d'attribution de livreur
  const [assigningParcel, setAssigningParcel] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, parcelsData, driversData] = await Promise.all([
        adminService.getStats(),
        adminService.getAllParcels(),
        adminService.getDrivers(),
      ]);
      setStats(statsData);
      setParcels(parcelsData);
      setDrivers(driversData);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données d'administration.");
      toast.error("Erreur de récupération des données administrateur.");
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = (parcel) => {
    setAssigningParcel(parcel);
    setSelectedDriverId(parcel.driver?.id || '');
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assigningParcel || !selectedDriverId) return;

    setSubmittingAssign(true);
    setError(null);

    try {
      await adminService.assignDriver({
        parcelId: assigningParcel.id,
        driverId: parseInt(selectedDriverId),
      });
      toast.success("Le colis a été attribué avec succès ! 📦");
      setAssigningParcel(null);
      loadDashboardData(); // Recharger les statistiques et la liste
    } catch (err) {
      console.error(err);
      toast.error("Erreur d'attribution du livreur.");
    } finally {
      setSubmittingAssign(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CREATED':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 rounded-full text-xs font-semibold">Créé</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400 rounded-full text-xs font-semibold">Accepté</span>;
      case 'PICKED_UP':
        return <span className="px-2.5 py-1 bg-teal-100 text-teal-800 dark:bg-teal-950/20 dark:text-teal-400 rounded-full text-xs font-semibold">Collecté</span>;
      case 'IN_TRANSIT':
        return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950/20 dark:text-indigo-400 rounded-full text-xs font-semibold">En transit</span>;
      case 'ARRIVED_AT_HUB':
        return <span className="px-2.5 py-1 bg-sky-100 text-sky-800 dark:bg-sky-950/20 dark:text-sky-450 rounded-full text-xs font-semibold">Au centre de tri</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400 rounded-full text-xs font-semibold">En livraison</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-full text-xs font-semibold">Livré</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-semibold">{status}</span>;
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
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 text-left"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Console d'Administration
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Supervisez l'activité logistique globale, gérez l'attribution des colis et analysez vos indicateurs de performance
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-semibold">
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Widgets Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium flex items-center justify-between hover:shadow-lg transition-shadow">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clients actifs</p>
              <p className="text-3xl font-black text-slate-850 dark:text-white">{stats.totalClients}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary-50 dark:bg-slate-800/80 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <Users size={22} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium flex items-center justify-between hover:shadow-lg transition-shadow">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Livreurs</p>
              <p className="text-3xl font-black text-slate-850 dark:text-white">{stats.totalDrivers}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500">
              <Truck size={22} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium flex items-center justify-between hover:shadow-lg transition-shadow">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Colis en transit (total)</p>
              <p className="text-3xl font-black text-slate-850 dark:text-white">{stats.totalParcels}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-500">
              <Package size={22} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium flex items-center justify-between hover:shadow-lg transition-shadow">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chiffre d'Affaires</p>
              <p className="text-3xl font-black text-slate-850 dark:text-white">{stats.simulatedRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500">
              <DollarSign size={22} />
            </div>
          </motion.div>
        </div>
      )}

      {/* Liste globale des Colis */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium shadow-premium overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">Suivi Global des Envois</h3>
        </div>

        {parcels.length === 0 ? (
          <div className="py-12 text-center text-slate-400 italic">
            Aucun colis n'a été créé sur la plateforme.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-950/50">
                  <th className="px-6 py-4">Suivi N°</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Destinataire</th>
                  <th className="px-6 py-4">Adresse livraison</th>
                  <th className="px-6 py-4">Livreur assigné</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {parcels.slice(0, 5).map((parcel) => (
                  <tr key={parcel.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="px-6 py-4 text-sm font-bold text-primary-600 dark:text-primary-400">{parcel.trackingId}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {parcel.client ? `${parcel.client.firstName} ${parcel.client.lastName}` : 'Client Inconnu'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-850 dark:text-slate-200">
                      {parcel.recipientName}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-[150px] truncate">{parcel.deliveryAddress}</td>
                    <td className="px-6 py-4 text-sm">
                      {parcel.driver ? (
                        <span className="font-bold text-primary-600 dark:text-primary-400">
                          {parcel.driver.firstName} {parcel.driver.lastName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Non attribué</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(parcel.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {parcel.status !== 'DELIVERED' ? (
                        <button
                          onClick={() => openAssignModal(parcel)}
                          className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <UserPlus size={12} />
                          <span>Attribuer</span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-500 font-bold">Livré</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal d'attribution de livreur */}
      <AnimatePresence>
        {assigningParcel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-premium border border-slate-100 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl text-left"
            >
              
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                  Attribuer un livreur
                </h3>
                <button
                  onClick={() => setAssigningParcel(null)}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-950 dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAssignSubmit}>
                <div className="p-6 space-y-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 uppercase">Colis sélectionné</p>
                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{assigningParcel.trackingId}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Destinataire : {assigningParcel.recipientName}</p>
                    <p className="text-xs text-slate-500 font-medium">Destination : {assigningParcel.deliveryAddress}</p>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="driver" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Sélectionner le livreur
                    </label>
                    <select
                      id="driver"
                      className="input-premium bg-no-repeat bg-right"
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      required
                    >
                      <option value="">-- Choisir un chauffeur --</option>
                      {drivers.map((drv) => {
                        // Calculate active deliveries count
                        const activeCount = parcels.filter(p => p.driver && p.driver.id === drv.id && p.status !== 'DELIVERED').length;
                        return (
                          <option key={drv.id} value={drv.id}>
                            {drv.firstName} {drv.lastName} ({activeCount} livraison(s) en cours)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-right flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAssigningParcel(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 rounded-xl text-sm font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAssign || !selectedDriverId}
                    className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-55"
                  >
                    {submittingAssign ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Attribution...</span>
                      </>
                    ) : (
                      <span>Confirmer l'attribution</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDashboard;
