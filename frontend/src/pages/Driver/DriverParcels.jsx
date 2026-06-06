import React, { useState, useEffect } from 'react';
import { driverService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Layout from '../../components/Common/Layout';
import EmptyState from '../../components/Common/EmptyState';
import { SkeletonTable } from '../../components/Common/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Truck, 
  MapPin, 
  Clock, 
  Edit, 
  X, 
  Loader2, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Download
} from 'lucide-react';

const DriverParcels = () => {
  const toast = useToast();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;

  // Modal de mise à jour du statut
  const [updatingParcel, setUpdatingParcel] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  useEffect(() => {
    fetchParcels();
  }, []);

  // Reset page on filter/search change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, statusFilter]);

  const fetchParcels = async () => {
    setLoading(true);
    setError(null);
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
        return <span className="px-2.5 py-1 bg-sky-100 text-sky-800 dark:bg-sky-950/20 dark:text-sky-450 rounded-full text-xs font-semibold">Centre de tri</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400 rounded-full text-xs font-semibold">En livraison</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-full text-xs font-semibold">Livré</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const exportToJson = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(parcels, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "mes_courses_quickship.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("Courses exportées au format JSON ! 📥");
    } catch (err) {
      toast.error("Erreur lors de l'export.");
    }
  };

  const filteredParcels = parcels.filter(p => {
    const matchesSearch = 
      p.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = statusFilter === 'ALL' || p.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Calculate paginated list
  const totalPages = Math.ceil(filteredParcels.length / pageSize);
  const paginatedParcels = filteredParcels.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  return (
    <Layout>
      <div className="space-y-6 text-left animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Courses & Livraisons Assignées
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Gérez toutes vos courses de livraison et mettez à jour l'état de chaque colis
            </p>
          </div>
          <button
            onClick={exportToJson}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-sm self-start"
            title="Exporter mes courses au format JSON"
          >
            <Download size={16} />
            <span>Exporter</span>
          </button>
        </div>

        {/* Barre de Recherche et Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-premium shadow-premium">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-3.5 text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Rechercher par suivi #, destinataire, adresses..."
              className="input-premium pl-10 py-2.5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 min-w-[220px]">
            <Filter size={18} className="text-slate-400 shrink-0" />
            <select
              className="input-premium py-2.5 bg-no-repeat bg-right text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tous les statuts</option>
              <option value="ACCEPTED">Attribué / Accepté</option>
              <option value="PICKED_UP">Collecté</option>
              <option value="IN_TRANSIT">En transit</option>
              <option value="ARRIVED_AT_HUB">Au centre de tri</option>
              <option value="OUT_FOR_DELIVERY">En livraison</option>
              <option value="DELIVERED">Livré</option>
            </select>
          </div>
        </div>

        {/* Liste ou État vide */}
        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-premium text-red-600 dark:text-red-400 text-center font-semibold">
            {error}
          </div>
        ) : filteredParcels.length === 0 ? (
          <EmptyState
            title="Aucune course trouvée"
            description={searchTerm || statusFilter !== 'ALL' ? "Ajustez vos filtres pour voir d'autres colis." : "Aucun colis ne vous est assigné pour le moment."}
          />
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium shadow-premium overflow-hidden">
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
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {paginatedParcels.map((parcel) => (
                      <tr key={parcel.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-primary-600 dark:text-primary-400">{parcel.trackingId}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">{parcel.recipientName} ({parcel.recipientPhone})</td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-[150px] truncate" title={parcel.pickupAddress}>{parcel.pickupAddress}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-[150px] truncate" title={parcel.deliveryAddress}>{parcel.deliveryAddress}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{parcel.weight} kg</td>
                        <td className="px-6 py-4">{getStatusBadge(parcel.status)}</td>
                        <td className="px-6 py-4 text-right">
                          {parcel.status !== 'DELIVERED' ? (
                            <button
                              onClick={() => openUpdateModal(parcel)}
                              className="px-3 py-1.5 bg-primary-50 dark:bg-slate-800 hover:bg-primary-600 dark:hover:bg-primary-600 hover:text-white text-primary-600 dark:text-primary-400 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ml-auto"
                            >
                              <Edit size={12} />
                              <span>Statut</span>
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-500 font-bold flex items-center justify-end gap-1 select-none pr-3">
                              <CheckCircle2 size={12} />
                              <span>Livré</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium shadow-premium">
                <span className="text-xs font-semibold text-slate-500">
                  Page {currentPage + 1} sur {totalPages} ({filteredParcels.length} courses)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                        currentPage === i 
                          ? 'bg-primary-600 text-white' 
                          : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
                        Description de l'étape
                      </label>
                      <textarea
                        id="description"
                        rows="3"
                        className="input-premium text-sm"
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
                        <span>Valider</span>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default DriverParcels;
