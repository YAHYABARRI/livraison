import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Layout from '../../components/Common/Layout';
import { SkeletonTable } from '../../components/Common/Skeleton';
import EmptyState from '../../components/Common/EmptyState';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Eye, 
  X, 
  Truck, 
  Calendar, 
  Scale, 
  Clock, 
  CheckCircle,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

const AdminParcels = () => {
  const toast = useToast();
  const [parcels, setParcels] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;

  // Modal d'attribution de livreur
  const [assigningParcel, setAssigningParcel] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // Modal de détails
  const [selectedParcel, setSelectedParcel] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [parcelsData, driversData] = await Promise.all([
        adminService.getAllParcels(),
        adminService.getDrivers(),
      ]);
      setParcels(parcelsData);
      setDrivers(driversData);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les colis.");
      toast.error("Erreur de récupération des colis.");
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
      fetchData(); // Rafraîchir la liste
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
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 rounded-full text-xs font-semibold">Créé</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 rounded-full text-xs font-semibold">Accepté</span>;
      case 'PICKED_UP':
        return <span className="px-2.5 py-1 bg-teal-100 text-teal-800 dark:bg-teal-950/30 dark:text-teal-400 rounded-full text-xs font-semibold">Collecté</span>;
      case 'IN_TRANSIT':
        return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400 rounded-full text-xs font-semibold">En transit</span>;
      case 'ARRIVED_AT_HUB':
        return <span className="px-2.5 py-1 bg-sky-100 text-sky-800 dark:bg-sky-950/30 dark:text-sky-450 rounded-full text-xs font-semibold">Au centre de tri</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400 rounded-full text-xs font-semibold">En livraison</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-full text-xs font-semibold">Livré</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const getMapProgress = (status) => {
    switch (status) {
      case 'CREATED': return 0.15;
      case 'ACCEPTED': return 0.30;
      case 'PICKED_UP': return 0.50;
      case 'IN_TRANSIT': return 0.70;
      case 'ARRIVED_AT_HUB': return 0.80;
      case 'OUT_FOR_DELIVERY': return 0.90;
      case 'DELIVERED': return 1.0;
      default: return 0.15;
    }
  };

  const exportToJson = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(parcels, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "global_colis_quickship.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("Base de données exportée au format JSON ! 📁");
    } catch (err) {
      toast.error("Erreur lors de l'export.");
    }
  };

  const filteredParcels = parcels.filter(p => {
    const matchesSearch = 
      p.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.client && (p.client.firstName + " " + p.client.lastName).toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = statusFilter === 'ALL' || p.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

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
      <div className="space-y-6 text-left">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Gestion Générale des Colis
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Supervisez, affectez et suivez chaque envoi effectué sur la plateforme
            </p>
          </div>
          <button
            onClick={exportToJson}
            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-sm self-start"
          >
            <Download size={16} />
            <span>Exporter JSON</span>
          </button>
        </div>

        {/* Recherche et Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-premium shadow-premium">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-3.5 text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Rechercher par suivi #, client, destinataire, adresse..."
              className="input-premium pl-10 py-2.5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter size={18} className="text-slate-400 shrink-0" />
            <select
              className="input-premium py-2.5 bg-no-repeat bg-right"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tous les statuts</option>
              <option value="CREATED">Créé</option>
              <option value="ACCEPTED">Accepté / Assigné</option>
              <option value="PICKED_UP">Collecté</option>
              <option value="IN_TRANSIT">En transit</option>
              <option value="ARRIVED_AT_HUB">Au centre de tri</option>
              <option value="OUT_FOR_DELIVERY">En livraison</option>
              <option value="DELIVERED">Livré</option>
            </select>
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 rounded-premium text-center font-semibold">
            {error}
          </div>
        ) : filteredParcels.length === 0 ? (
          <EmptyState
            title="Aucun envoi trouvé"
            description="Modifiez vos mots clés ou filtres pour visualiser d'autres colis."
          />
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium shadow-premium overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-950/50">
                      <th className="px-6 py-4">N° Suivi</th>
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Destinataire</th>
                      <th className="px-6 py-4">Livraison</th>
                      <th className="px-6 py-4">Chauffeur</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {paginatedParcels.map((parcel) => (
                      <tr key={parcel.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="px-6 py-4 text-sm font-bold text-primary-600 dark:text-primary-400">{parcel.trackingId}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {parcel.client ? `${parcel.client.firstName} ${parcel.client.lastName}` : 'Client inconnu'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">{parcel.recipientName}</td>
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
                        <td className="px-6 py-4 text-right flex gap-2 justify-end">
                          <button
                            onClick={() => setSelectedParcel(parcel)}
                            className="p-2 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary-600 hover:border-primary-500 rounded-xl transition cursor-pointer"
                            title="Inspecter le colis"
                          >
                            <Eye size={14} />
                          </button>
                          {parcel.status !== 'DELIVERED' && (
                            <button
                              onClick={() => openAssignModal(parcel)}
                              className="p-2 border border-slate-200 dark:border-slate-800 text-slate-450 hover:text-amber-500 hover:border-amber-500 rounded-xl transition cursor-pointer"
                              title="Attribuer un livreur"
                            >
                              <UserPlus size={14} />
                            </button>
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
                  Page {currentPage + 1} sur {totalPages} ({filteredParcels.length} expéditions)
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

        {/* Modal attribution */}
        {assigningParcel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-premium border border-slate-100 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl animate-scale-up text-left">
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">Attribuer un livreur</h3>
                <button onClick={() => setAssigningParcel(null)} className="p-1 rounded text-slate-400 cursor-pointer"><X size={18}/></button>
              </div>
              <form onSubmit={handleAssignSubmit}>
                <div className="p-6 space-y-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 uppercase">Colis</p>
                    <p className="text-sm font-bold text-primary-600">{assigningParcel.trackingId}</p>
                    <p className="text-xs text-slate-500">Destinataire: {assigningParcel.recipientName}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Livreur</label>
                    <select
                      className="input-premium"
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      required
                    >
                      <option value="">-- Choisir un chauffeur --</option>
                      {drivers.map((drv) => (
                        <option key={drv.id} value={drv.id}>{drv.firstName} {drv.lastName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-right flex justify-end gap-3">
                  <button type="button" onClick={() => setAssigningParcel(null)} className="px-4 py-2 border rounded-xl cursor-pointer">Annuler</button>
                  <button type="submit" disabled={submittingAssign} className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl flex items-center gap-2 cursor-pointer">
                    {submittingAssign ? <Loader2 size={16} className="animate-spin" /> : 'Attribuer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de suivi interactif */}
        {selectedParcel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-premium border border-slate-100 dark:border-slate-800 w-full max-w-3xl overflow-hidden shadow-2xl animate-scale-up text-left">
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                    <span>Inspecter Colis</span>
                    <span className="text-primary-600">{selectedParcel.trackingId}</span>
                  </h3>
                  <p className="text-xs text-slate-400">Créé le {new Date(selectedParcel.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                <button onClick={() => setSelectedParcel(null)} className="p-1.5 rounded-lg border text-slate-400 cursor-pointer"><X size={18}/></button>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                
                {/* SVG Progress */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Progression logistique</h4>
                  <div className="relative h-24 w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden flex flex-col justify-center px-8">
                    <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 60 48 Q 300 20, 620 48" fill="transparent" stroke="#e2e8f0" strokeWidth="4" className="dark:stroke-slate-800" />
                      <path d="M 60 48 Q 300 20, 620 48" fill="transparent" stroke="#2563eb" strokeWidth="4" strokeDasharray="800" strokeDashoffset={800 - (800 * getMapProgress(selectedParcel.status))} className="transition-all duration-1000" />
                    </svg>
                    <div className="flex justify-between items-center relative">
                      <div className="flex flex-col items-center">
                        <div className="h-6 w-6 rounded-full border-4 border-primary-600 bg-white"></div>
                        <span className="text-[10px] font-bold text-slate-450 mt-1 uppercase">Départ</span>
                      </div>
                      <div className="absolute h-8 w-8 rounded-full bg-accent-500 text-white flex items-center justify-center transition-all duration-1000" style={{ left: `${5 + (getMapProgress(selectedParcel.status) * 85)}%`, top: '-8px' }}>
                        <Truck size={14} />
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`h-6 w-6 rounded-full border-4 ${selectedParcel.status === 'DELIVERED' ? 'border-emerald-500 bg-white' : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900'}`}></div>
                        <span className="text-[10px] font-bold text-slate-450 mt-1 uppercase">Arrivée</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Détails */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-xl space-y-3">
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">Fiche Logistique</h5>
                    <div className="text-sm space-y-2">
                      <p><span className="text-slate-400">Client :</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedParcel.client?.firstName} {selectedParcel.client?.lastName}</span></p>
                      <p><span className="text-slate-400">Destinataire :</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedParcel.recipientName} ({selectedParcel.recipientPhone})</span></p>
                      <p><span className="text-slate-400">Adresse Collecte :</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedParcel.pickupAddress}</span></p>
                      <p><span className="text-slate-400">Adresse Livraison :</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedParcel.deliveryAddress}</span></p>
                      <p><span className="text-slate-400">Poids :</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedParcel.weight} kg</span></p>
                    </div>
                  </div>

                  {/* Logs */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">Suivi d'étapes</h5>
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                      {selectedParcel.logs?.map((log) => (
                        <div key={log.id} className="relative">
                          <div className="absolute -left-6 top-1.5 h-2.5 w-2.5 rounded-full bg-primary-600 border border-white"></div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{log.description}</p>
                            <p className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString('fr-FR')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t text-right">
                <button onClick={() => setSelectedParcel(null)} className="px-5 py-2.5 bg-slate-200 hover:bg-slate-350 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-sm cursor-pointer">Fermer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminParcels;
