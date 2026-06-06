import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parcelService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Layout from '../../components/Common/Layout';
import EmptyState from '../../components/Common/EmptyState';
import { SkeletonTable } from '../../components/Common/Skeleton';
import { 
  Search, 
  Filter, 
  MapPin, 
  Truck, 
  Calendar, 
  Scale, 
  Clock, 
  X, 
  CheckCircle,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const MyParcels = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;

  // Colis sélectionné pour affichage des détails (Modal)
  const [selectedParcel, setSelectedParcel] = useState(null);

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
      // Call unpaginated endpoint to get all list items for client-side sorting/filtering
      const data = await parcelService.getAllMyParcels();
      setParcels(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger vos colis.");
      toast.error("Erreur de récupération des colis.");
    } finally {
      setLoading(false);
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
        return <span className="px-2.5 py-1 bg-sky-100 text-sky-800 dark:bg-sky-950/30 dark:text-sky-450 rounded-full text-xs font-semibold">Centre de tri</span>;
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

  const calculateRemainingDays = (dateStr, status) => {
    if (status === 'DELIVERED') return 0;
    const est = new Date(dateStr);
    const now = new Date();
    const diffTime = est - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleDownloadInvoice = async (trackingId) => {
    try {
      const blobData = await parcelService.downloadInvoice(trackingId);
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${trackingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Facture téléchargée avec succès ! 📄");
    } catch (err) {
      console.error(err);
      toast.error("Impossible de télécharger la facture.");
    }
  };

  const exportToJson = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(parcels, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "mes_colis_quickship.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("Données exportées avec succès au format JSON ! 📥");
    } catch (err) {
      toast.error("Erreur lors de l'export.");
    }
  };

  const filteredParcels = parcels.filter(p => {
    const matchesSearch = 
      p.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      <div className="space-y-6 text-left">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Mes Expéditions
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Consultez l'état et l'historique de tous vos colis envoyés
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToJson}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-sm"
              title="Exporter au format JSON"
            >
              <Download size={16} />
              <span>Exporter</span>
            </button>
            <button
              onClick={() => navigate('/create-parcel')}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              Nouveau colis
            </button>
          </div>
        </div>

        {/* Barre de Recherche et Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-premium shadow-premium">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-3.5 text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Rechercher par numéro de suivi, destinataire, adresse..."
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
              <option value="PENDING">En attente</option>
              <option value="ASSIGNED">Assignés</option>
              <option value="PICKED_UP">Collectés</option>
              <option value="IN_TRANSIT">En transit</option>
              <option value="DELIVERED">Livrés</option>
            </select>
          </div>
        </div>

        {/* Loader, Error, ou Contenu */}
        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-premium text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        ) : filteredParcels.length === 0 ? (
          <EmptyState
            title="Aucun colis trouvé"
            description={searchTerm || statusFilter !== 'ALL' ? "Ajustez vos filtres de recherche pour afficher d'autres résultats." : "Vous n'avez pas encore envoyé de colis."}
            actionText={!(searchTerm || statusFilter !== 'ALL') ? "Expédier un colis" : null}
            onAction={() => navigate('/create-parcel')}
          />
        ) : (
          /* Tableau */
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium shadow-premium overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">Numéro de suivi</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">Destinataire</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">Adresse de livraison</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">Poids</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">Statut</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">Date d'enregistrement</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {paginatedParcels.map((parcel) => (
                      <tr key={parcel.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-primary-600 dark:text-primary-400">{parcel.trackingId}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">{parcel.recipientName}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{parcel.deliveryAddress}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{parcel.weight} kg</td>
                        <td className="px-6 py-4">{getStatusBadge(parcel.status)}</td>
                        <td className="px-6 py-4 text-xs text-slate-400 dark:text-slate-600 font-medium">
                          {new Date(parcel.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownloadInvoice(parcel.trackingId)}
                            className="p-2 border border-slate-200 dark:border-slate-800 hover:border-orange-500 hover:text-orange-500 rounded-xl transition-all duration-200 cursor-pointer"
                            title="Télécharger la facture"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => setSelectedParcel(parcel)}
                            className="p-2 border border-slate-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-all duration-200 cursor-pointer"
                            title="Voir le suivi"
                          >
                            <Eye size={16} />
                          </button>
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
                  Page {currentPage + 1} sur {totalPages} ({filteredParcels.length} colis)
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

        {/* Modal de suivi interactif */}
        {selectedParcel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-premium border border-slate-100 dark:border-slate-800 w-full max-w-4xl overflow-hidden shadow-2xl animate-scale-up text-left">
              {/* Header Modal */}
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                    <span>Détails & Suivi</span>
                    <span className="text-primary-600 dark:text-primary-400">{selectedParcel.trackingId}</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Créé le {new Date(selectedParcel.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedParcel(null)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-950 dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Contenu Modal */}
              <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
                
                {/* Visual Progress Map (Stepped Progress Bar) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Progression globale</h4>
                  <div className="relative h-24 w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 rounded-xl overflow-hidden flex flex-col justify-center px-8">
                    
                    {/* SVG Map Lines */}
                    <svg className="absolute inset-0 h-full w-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M 60 48 Q 400 15, 740 48"
                        fill="transparent"
                        stroke="#e2e8f0"
                        strokeWidth="4"
                        className="dark:stroke-slate-800"
                      />
                      <path
                        d="M 60 48 Q 400 15, 740 48"
                        fill="transparent"
                        stroke="#2563eb"
                        strokeWidth="4"
                        strokeDasharray="800"
                        strokeDashoffset={800 - (800 * getMapProgress(selectedParcel.status))}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    {/* Nodes and Truck */}
                    <div className="flex justify-between items-center relative">
                      {/* Départ */}
                      <div className="flex flex-col items-center z-10">
                        <div className="h-6 w-6 rounded-full border-4 border-primary-600 bg-white dark:bg-slate-900 shadow"></div>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Collecte</span>
                      </div>

                      {/* Truck position icon */}
                      <div 
                        className="absolute h-8 w-8 rounded-full bg-accent-500 border-2 border-white dark:border-slate-900 shadow-lg text-white flex items-center justify-center transition-all duration-1000 ease-out z-20"
                        style={{
                          left: `${5 + (getMapProgress(selectedParcel.status) * 85)}%`,
                          top: `${selectedParcel.status === 'CREATED' ? '-8px' : selectedParcel.status === 'DELIVERED' ? '-8px' : '-22px'}`
                        }}
                      >
                        <Truck size={14} className="animate-pulse" />
                      </div>

                      {/* Arrivée */}
                      <div className="flex flex-col items-center z-10">
                        <div className={`h-6 w-6 rounded-full border-4 shadow ${selectedParcel.status === 'DELIVERED' ? 'border-emerald-500 bg-white dark:bg-slate-900' : 'border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900'}`}></div>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Livraison</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Estimations, QR Code, and Invoice */}
                  <div className="space-y-6">
                    {/* Delivery Estimation Card */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 p-5 rounded-xl space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>Estimation de Livraison</span>
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Date Prévue</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {selectedParcel.estimatedDelivery ? new Date(selectedParcel.estimatedDelivery).toLocaleDateString('fr-FR') : 'Non planifiée'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Temps Restant</p>
                          <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                            {selectedParcel.status === 'DELIVERED' ? (
                              <span className="text-emerald-550">Livré</span>
                            ) : (
                              `${calculateRemainingDays(selectedParcel.estimatedDelivery, selectedParcel.status)} jours`
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1 pt-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-400">Avancement</span>
                          <span className="text-primary-600">{(getMapProgress(selectedParcel.status) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-600 rounded-full transition-all duration-1000"
                            style={{ width: `${getMapProgress(selectedParcel.status) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* QR Code and Actions Card */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 p-5 rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-850 dark:text-white">QR Code de Suivi</h4>
                          <p className="text-xs text-slate-450 dark:text-slate-500 font-medium">Scannez pour suivre en déplacement</p>
                        </div>
                        <button
                          onClick={() => handleDownloadInvoice(selectedParcel.trackingId)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                        >
                          <Download size={14} />
                          <span>Télécharger Facture</span>
                        </button>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent("http://localhost:5173/track/" + selectedParcel.trackingId)}`}
                          alt="Tracking QR Code"
                          className="h-24 w-24 object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Timeline & Shipment Info */}
                  <div className="space-y-6">
                    {/* Detailed Shipment Status Timeline */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 p-5 rounded-xl space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Timeline d'acheminement</h4>
                      
                      <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-850">
                        {[
                          { key: 'CREATED', label: 'Enregistré', desc: 'Le colis a été enregistré par l\'expéditeur.' },
                          { key: 'ACCEPTED', label: 'Accepté / Assigné', desc: 'Prise en charge validée par l\'équipe.' },
                          { key: 'PICKED_UP', label: 'Collecté', desc: 'Le livreur a récupéré le colis.' },
                          { key: 'IN_TRANSIT', label: 'En transit', desc: 'Le colis est en route.' },
                          { key: 'ARRIVED_AT_HUB', label: 'Centre de tri', desc: 'Le colis est arrivé au hub régional.' },
                          { key: 'OUT_FOR_DELIVERY', label: 'En cours de livraison', desc: 'Le colis est chargé pour distribution.' },
                          { key: 'DELIVERED', label: 'Livré', desc: 'Le colis a été remis au destinataire.' }
                        ].map((step) => {
                          const statusOrder = ['CREATED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_HUB', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                          const currentStatusIndex = statusOrder.indexOf(selectedParcel.status);
                          const stepIndex = statusOrder.indexOf(step.key);
                          const isCompleted = stepIndex <= currentStatusIndex;
                          
                          // Find timestamp in logs
                          const log = selectedParcel.logs?.find(l => l.status === step.key);
                          const timestamp = log ? new Date(log.timestamp).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : null;

                          return (
                            <div key={step.key} className="relative">
                              {/* Node indicator */}
                              <div className={`absolute -left-6 top-1 h-3 w-3 rounded-full border-2 ${
                                isCompleted 
                                  ? 'bg-primary-600 border-primary-600 dark:bg-primary-400 dark:border-primary-400 shadow-sm' 
                                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800'
                              }`}></div>
                              
                              <div className={isCompleted ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}>
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <span>{step.label}</span>
                                  {timestamp && <span className="text-[10px] font-medium text-slate-400">{timestamp}</span>}
                                </div>
                                <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                                  {log ? log.description : step.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Fiche Logistique (Details Card) */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 p-5 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Spécifications Colis</h4>
                      
                      <div className="text-xs space-y-2">
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-1.5">
                          <span className="text-slate-400 font-bold">Destinataire :</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedParcel.recipientName} ({selectedParcel.recipientPhone})</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-1.5">
                          <span className="text-slate-400 font-bold">Poids :</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedParcel.weight} kg</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-1.5">
                          <span className="text-slate-400 font-bold">Type de Colis :</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedParcel.parcelType || 'Standard'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-1.5">
                          <span className="text-slate-400 font-bold">Prix de Livraison :</span>
                          <span className="font-bold text-slate-850 dark:text-white">
                            {selectedParcel.shippingPrice ? `${selectedParcel.shippingPrice.toFixed(2)} €` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-400 font-bold mb-0.5">Collecte :</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{selectedParcel.pickupAddress}</span>
                        </div>
                        <div className="flex flex-col pt-1">
                          <span className="text-slate-400 font-bold mb-0.5">Livraison :</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{selectedParcel.deliveryAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-right">
                <button
                  onClick={() => setSelectedParcel(null)}
                  className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-350 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-sm cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyParcels;
