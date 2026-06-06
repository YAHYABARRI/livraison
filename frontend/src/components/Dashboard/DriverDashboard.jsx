import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { driverService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Edit,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import { SkeletonStats, SkeletonTable } from '../Common/Skeleton';

const DriverDashboard = () => {
  const toast = useToast();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal de mise à jour du statut
  const [updatingParcel, setUpdatingParcel] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  useEffect(() => {
    fetchParcels();
  }, []);

  const fetchParcels = async () => {
    setLoading(true);
    try {
      const data = await driverService.getAssignedParcels();
      setParcels(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les colis assignés.");
      toast.error("Erreur de récupération des courses.");
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (parcel) => {
    setUpdatingParcel(parcel);
    setSelectedStatus(parcel.status);
    setUpdateDescription('');
  };

  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updatingParcel) return;
    
    setSubmittingUpdate(true);
    setError(null);

    try {
      await driverService.updateStatus(updatingParcel.id, {
        status: selectedStatus,
        description: updateDescription
      });
      toast.success(`Statut du colis ${updatingParcel.trackingId} mis à jour ! 🚚`);
      setUpdatingParcel(null);
      fetchParcels();
    } catch (err) {
      console.error(err);
      toast.error("Erreur de mise à jour du statut.");
    } finally {
      setSubmittingUpdate(false);
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

  const getStats = () => {
    const total = parcels.length;
    const assigned = parcels.filter(p => p.status === 'ACCEPTED').length;
    const active = parcels.filter(p => ['PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_HUB', 'OUT_FOR_DELIVERY'].includes(p.status)).length;
    const delivered = parcels.filter(p => p.status === 'DELIVERED').length;
    return { total, assigned, active, delivered };
  };

  const stats = getStats();

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
          Espace Livreur
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Gerez vos livraisons assignées et mettez à jour leur statut d'acheminement
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-semibold">
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium flex items-center justify-between hover:shadow-lg transition-shadow">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Colis</p>
            <p className="text-3xl font-black text-slate-850 dark:text-white">{stats.total}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary-50 dark:bg-slate-800/80 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Truck size={22} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium flex items-center justify-between hover:shadow-lg transition-shadow">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assignés</p>
            <p className="text-3xl font-black text-slate-850 dark:text-white">{stats.assigned}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500">
            <Clock size={22} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium flex items-center justify-between hover:shadow-lg transition-shadow">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">En cours</p>
            <p className="text-3xl font-black text-slate-850 dark:text-white">{stats.active}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-500">
            <Truck size={22} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium flex items-center justify-between hover:shadow-lg transition-shadow">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Livrés</p>
            <p className="text-3xl font-black text-slate-850 dark:text-white">{stats.delivered}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={22} />
          </div>
        </motion.div>
      </div>

      {/* Liste des Colis Assignés */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium shadow-premium overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">Courses Récentes (Actives)</h3>
          <Link
            to="/driver/parcels"
            className="text-xs font-bold text-primary-600 hover:text-primary-750 dark:text-primary-450 dark:hover:text-primary-400 flex items-center gap-1 cursor-pointer"
          >
            <span>Voir tout</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
        
        {parcels.filter(p => p.status !== 'DELIVERED').length === 0 ? (
          <div className="py-12 text-center text-slate-400 italic">
            Aucun colis actif ne vous est attribué pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-950/50">
                  <th className="px-6 py-4">N° Suivi</th>
                  <th className="px-6 py-4">Destinataire</th>
                  <th className="px-6 py-4">Collecte</th>
                  <th className="px-6 py-4">Livraison</th>
                  <th className="px-6 py-4">Poids</th>
                  <th className="px-6 py-4">Statut actuel</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {parcels.filter(p => p.status !== 'DELIVERED').slice(0, 3).map((parcel) => (
                  <tr key={parcel.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="px-6 py-4 text-sm font-bold text-primary-600 dark:text-primary-400">{parcel.trackingId}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">{parcel.recipientName} ({parcel.recipientPhone})</td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-[150px] truncate">{parcel.pickupAddress}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-[150px] truncate">{parcel.deliveryAddress}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{parcel.weight} kg</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(parcel.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openUpdateModal(parcel)}
                        className="px-3 py-1.5 bg-primary-50 dark:bg-slate-800 hover:bg-primary-600 dark:hover:bg-primary-600 hover:text-white text-primary-600 dark:text-primary-400 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ml-auto"
                      >
                        <Edit size={12} />
                        <span>Statut</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal de Mise à jour de Statut */}
      <AnimatePresence>
        {updatingParcel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-premium border border-slate-100 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl text-left"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                  Mettre à jour le statut
                </h3>
                <button
                  onClick={() => setUpdatingParcel(null)}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-950 dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleStatusUpdateSubmit}>
                <div className="p-6 space-y-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 uppercase">Colis concerné</p>
                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{updatingParcel.trackingId}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Destinataire : {updatingParcel.recipientName}</p>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="status" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Nouveau statut
                    </label>
                    <select
                      id="status"
                      className="input-premium appearance-none bg-no-repeat bg-right"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="ACCEPTED">Attribué (En attente de collecte)</option>
                      <option value="PICKED_UP">Collecté chez l'expéditeur</option>
                      <option value="IN_TRANSIT">En cours de transport / En transit</option>
                      <option value="ARRIVED_AT_HUB">Arrivé au centre de tri</option>
                      <option value="OUT_FOR_DELIVERY">En cours de livraison</option>
                      <option value="DELIVERED">Livré avec succès</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="description" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Description de l'étape (en français)
                    </label>
                    <textarea
                      id="description"
                      rows="3"
                      className="input-premium"
                      placeholder="Ex: Le colis a été remis en main propre contre signature."
                      value={updateDescription}
                      onChange={(e) => setUpdateDescription(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                {/* Footer Modal */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-right flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setUpdatingParcel(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 rounded-xl text-sm font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingUpdate}
                    className="px-5 py-2.5 bg-primary-600 hover:bg-primary-750 text-white font-semibold rounded-xl text-sm shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    {submittingUpdate ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <span>Valider la modification</span>
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

export default DriverDashboard;
