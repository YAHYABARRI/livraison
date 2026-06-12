import React, { useState, useEffect } from 'react';
import { adminService, reportService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Layout from '../../components/Common/Layout';
import { 
  FileText, 
  Calendar, 
  User, 
  Users, 
  Download, 
  Eye, 
  RefreshCw, 
  X, 
  TrendingUp, 
  Coins, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  ChevronRight,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';

const AdminReports = () => {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  
  // Loaders
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Filters State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [driverId, setDriverId] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState([]);

  // Preview State
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewType, setPreviewType] = useState('custom');

  useEffect(() => {
    fetchStats();
    fetchMetadata();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const statsData = await reportService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error(err);
      toast.error("Erreur de chargement des statistiques.");
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchMetadata = async () => {
    setLoadingMetadata(true);
    try {
      const [driversData, usersData] = await Promise.all([
        adminService.getDrivers(),
        adminService.getUsers()
      ]);
      setDrivers(driversData);
      
      // Filter clients from all users
      const clientsData = usersData.filter(u => 
        u.roles.some(role => role.includes('CLIENT') || role === 'CLIENT')
      );
      setClients(clientsData);
    } catch (err) {
      console.error(err);
      toast.error("Erreur de chargement des livreurs ou clients.");
    } finally {
      setLoadingMetadata(false);
    }
  };



  const toggleClient = (clientId) => {
    if (selectedClientIds.includes(clientId)) {
      setSelectedClientIds(selectedClientIds.filter(id => id !== clientId));
    } else {
      setSelectedClientIds([...selectedClientIds, clientId]);
    }
  };

  const selectAllClients = () => {
    setSelectedClientIds(filteredClients.map(c => c.id));
  };

  const deselectAllClients = () => {
    setSelectedClientIds([]);
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setDriverId('');
    setSelectedClientIds([]);
    toast.success("Filtres réinitialisés.");
  };

  const getFilteredPayloadAndType = (type) => {
    let callType = type;
    let params = {};

    if (type === 'custom') {
      if (selectedClientIds.length > 1) {
        callType = 'by-clients';
        params = {
          startDate: startDate || null,
          endDate: endDate || null,
          driverId: driverId ? parseInt(driverId) : null,
          clientIds: selectedClientIds
        };
      } else {
        params = {
          startDate: startDate || null,
          endDate: endDate || null,
          driverId: driverId ? parseInt(driverId) : null
        };
        if (selectedClientIds.length === 1) {
          params.clientId = selectedClientIds[0];
        }
      }
    }
    return { callType, params };
  };

  const handleDownload = async (type) => {
    setGenerating(true);
    try {
      let blob;
      const { callType, params } = getFilteredPayloadAndType(type);

      if (callType === 'daily') {
        blob = await reportService.getDailyPdf();
      } else if (callType === 'weekly') {
        blob = await reportService.getWeeklyPdf();
      } else if (callType === 'monthly') {
        blob = await reportService.getMonthlyPdf();
      } else if (callType === 'by-clients') {
        blob = await reportService.getMultiClientsPdf(params);
      } else {
        // custom filter
        blob = await reportService.getCustomPdf(params);
      }

      const fileUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = `rapport_${callType}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(fileUrl);
      toast.success("Téléchargement du rapport PDF réussi.");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la génération ou du téléchargement du PDF.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = async (type) => {
    setGenerating(true);
    setPreviewType(type);
    try {
      // Clean previous URL
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }

      let blob;
      const { callType, params } = getFilteredPayloadAndType(type);

      if (callType === 'daily') {
        blob = await reportService.getDailyPdf();
      } else if (callType === 'weekly') {
        blob = await reportService.getWeeklyPdf();
      } else if (callType === 'monthly') {
        blob = await reportService.getMonthlyPdf();
      } else if (callType === 'by-clients') {
        blob = await reportService.getMultiClientsPdf(params);
      } else {
        blob = await reportService.getCustomPdf(params);
      }

      const fileUrl = URL.createObjectURL(blob);
      setPdfPreviewUrl(fileUrl);
      setShowPreview(true);
      toast.success("Aperçu du rapport PDF généré avec succès.");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la génération de l'aperçu PDF.");
    } finally {
      setGenerating(false);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
  };

  // Filter clients locally by search input
  const filteredClients = clients.filter(c => 
    c.firstName.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.lastName.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value || 0);
  };

  return (
    <Layout>
      <div className="space-y-8 text-left">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <span className="p-2 bg-primary-500/10 text-primary-500 rounded-xl">
                <FileText size={28} />
              </span>
              Rapports & Factures
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Générez des rapports d'activité consolidés au format PDF et suivez les indicateurs financiers de QuickShip.
            </p>
          </div>
          
          <button
            onClick={() => { fetchStats(); fetchMetadata(); }}
            disabled={loadingStats || loadingMetadata}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={16} className={(loadingStats || loadingMetadata) ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>

        {/* Stats Cards Row */}
        {loadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* CA Jour */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-premium shadow-premium hover:shadow-premium-hover transition-all duration-200 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-primary-500" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">CA Jour</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">{formatCurrency(stats.revenueToday)}</p>
                <div className="p-2 bg-primary-500/10 text-primary-500 rounded-lg">
                  <TrendingUp size={18} />
                </div>
              </div>
            </div>

            {/* CA Mois */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-premium shadow-premium hover:shadow-premium-hover transition-all duration-200 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-secondary-500" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">CA Mensuel</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">{formatCurrency(stats.revenueMonth)}</p>
                <div className="p-2 bg-secondary-500/10 text-secondary-500 rounded-lg">
                  <Coins size={18} />
                </div>
              </div>
            </div>

            {/* Livrés */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-premium shadow-premium hover:shadow-premium-hover transition-all duration-200 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-500" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Colis Livrés</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">{stats.deliveredCount}</p>
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                  <CheckCircle2 size={18} />
                </div>
              </div>
            </div>

            {/* En Attente */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-premium shadow-premium hover:shadow-premium-hover transition-all duration-200 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-500" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">En Attente</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">{stats.pendingCount}</p>
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                  <Clock size={18} />
                </div>
              </div>
            </div>

            {/* Retournés */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-premium shadow-premium hover:shadow-premium-hover transition-all duration-200 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-rose-500" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Retournés</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">{stats.returnedCount}</p>
                <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                  <XCircle size={18} />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Custom Filters Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium shadow-premium p-6 space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4 flex items-center gap-2">
                <Filter className="text-primary-500" size={20} />
                <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100">Filtres du Rapport Personnalisé</h2>
              </div>

              {/* Date pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Date de début</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input 
                      type="date" 
                      className="input-premium pl-10 py-2.5 text-sm"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Date de fin</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input 
                      type="date" 
                      className="input-premium pl-10 py-2.5 text-sm"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Driver Select */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Livreur Associé</label>
                <div className="relative">
                  <Truck className="absolute left-3 top-3 text-slate-400" size={16} />
                  <select 
                    className="input-premium pl-10 py-2.5 text-sm appearance-none cursor-pointer"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                  >
                    <option value="">Tous les livreurs</option>
                    {drivers.map(drv => (
                      <option key={drv.id} value={drv.id}>
                        {drv.firstName} {drv.lastName} ({drv.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clients selection list */}
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Sélection Clients (Multiples)</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={selectAllClients}
                      className="text-[10px] font-bold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer select-none"
                    >
                      Tout sélectionner
                    </button>
                    <span className="text-[10px] text-slate-300 dark:text-slate-700">|</span>
                    <button 
                      onClick={deselectAllClients}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer select-none"
                    >
                      Désélectionner
                    </button>
                  </div>
                </div>

                {/* Clients search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Filtrer la liste des clients..."
                    className="input-premium pl-9 py-2 text-xs"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                  />
                </div>

                {/* Clients List Wrapper */}
                <div className="h-44 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 divide-y divide-slate-100 dark:divide-slate-800/40">
                  {loadingMetadata ? (
                    <div className="p-4 text-center text-xs text-slate-400 animate-pulse">Chargement de la liste...</div>
                  ) : filteredClients.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">Aucun client trouvé</div>
                  ) : (
                    filteredClients.map(c => {
                      const isSelected = selectedClientIds.includes(c.id);
                      return (
                        <div 
                          key={c.id} 
                          onClick={() => toggleClient(c.id)}
                          className={`flex items-center gap-3 px-4 py-2 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 select-none transition-colors ${
                            isSelected ? 'bg-primary-50/40 dark:bg-primary-950/10' : ''
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {isSelected ? (
                              <CheckSquare className="text-primary-500" size={15} />
                            ) : (
                              <Square className="text-slate-400 dark:text-slate-700" size={15} />
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                              {c.firstName} {c.lastName}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {c.email}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-350 dark:text-slate-600 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800/80">
                            ID: #{c.id}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
                {selectedClientIds.length > 0 && (
                  <p className="text-[10px] font-semibold text-primary-500">
                    {selectedClientIds.length} client(s) sélectionné(s)
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Réinitialiser
                </button>
                <div className="flex gap-3">
                  <button
                    disabled={generating}
                    onClick={() => handlePreview('custom')}
                    className="px-5 py-2.5 border border-primary-500 text-primary-500 hover:bg-primary-500/5 text-xs font-semibold rounded-xl transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {generating ? 'Génération...' : 'Aperçu PDF'}
                  </button>
                  <button
                    disabled={generating}
                    onClick={() => handleDownload('custom')}
                    className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {generating ? 'Génération...' : 'Télécharger PDF'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Period Shortcuts Column */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium shadow-premium p-6 space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4 flex items-center gap-2">
                <TrendingUp className="text-secondary-500" size={20} />
                <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100">Bilan Périodique Standard</h2>
              </div>

              <div className="space-y-4">
                {/* Daily */}
                <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all group">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Aujourd'hui</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Rapport d'activité du jour</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handlePreview('daily')}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-400 hover:text-primary-500 rounded-lg cursor-pointer transition-colors"
                      title="Aperçu"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDownload('daily')}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-400 hover:text-primary-500 rounded-lg cursor-pointer transition-colors"
                      title="Télécharger"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>

                {/* Weekly */}
                <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all group">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Cette Semaine</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Bilan consolidé hebdomadaire</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handlePreview('weekly')}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-400 hover:text-primary-500 rounded-lg cursor-pointer transition-colors"
                      title="Aperçu"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDownload('weekly')}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-400 hover:text-primary-500 rounded-lg cursor-pointer transition-colors"
                      title="Télécharger"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>

                {/* Monthly */}
                <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all group">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Ce Mois</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Rapport de facturation mensuel</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handlePreview('monthly')}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-400 hover:text-primary-500 rounded-lg cursor-pointer transition-colors"
                      title="Aperçu"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDownload('monthly')}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-400 hover:text-primary-500 rounded-lg cursor-pointer transition-colors"
                      title="Télécharger"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Preview Backdrop Overlay Modal */}
        {showPreview && pdfPreviewUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
            <div className="relative w-full max-w-4xl h-[90vh] bg-white dark:bg-slate-900 rounded-premium border border-slate-100 dark:border-slate-800 shadow-premium-xl flex flex-col overflow-hidden text-left animate-in fade-in duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">Aperçu du Rapport PDF</h3>
                  <p className="text-xs text-slate-400">Génération et validation du document en temps réel</p>
                </div>
                <button
                  onClick={closePreview}
                  className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-xl cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body (PDF display inside iframe) */}
              <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2">
                <iframe
                  src={pdfPreviewUrl}
                  title="PDF Preview"
                  className="w-full h-full border-0 rounded-xl"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <button
                  onClick={closePreview}
                  className="px-5 py-2.5 border border-slate-250 dark:border-slate-750 text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => handleDownload(previewType)}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
                >
                  <Download size={14} />
                  Télécharger le PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminReports;
