import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { parcelService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Search, 
  Truck, 
  MapPin, 
  Calendar, 
  Scale, 
  Clock, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle,
  Box,
  CornerDownRight,
  ShieldCheck
} from 'lucide-react';

const TrackParcel = () => {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [searchVal, setSearchVal] = useState(trackingNumber || '');
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (trackingNumber) {
      handleTrack(trackingNumber);
    } else {
      setParcel(null);
      setError(null);
    }
  }, [trackingNumber]);

  const handleTrack = async (num) => {
    if (!num || num.trim() === '') {
      toast.warning("Veuillez saisir un numéro de suivi valide.");
      return;
    }
    setLoading(true);
    setError(null);
    setParcel(null);
    try {
      const data = await parcelService.track(num.trim());
      setParcel(data);
    } catch (err) {
      console.error(err);
      setError("Numéro de suivi introuvable. Veuillez vérifier votre saisie.");
      toast.error("Colis introuvable.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim() !== '') {
      navigate(`/track/${searchVal.trim()}`);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CREATED':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 rounded-full text-xs font-bold">Créé</span>;
      case 'ACCEPTED':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 rounded-full text-xs font-bold">Accepté</span>;
      case 'PICKED_UP':
        return <span className="px-3 py-1 bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400 rounded-full text-xs font-bold">Collecté</span>;
      case 'IN_TRANSIT':
        return <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-full text-xs font-bold">En transit</span>;
      case 'ARRIVED_AT_HUB':
        return <span className="px-3 py-1 bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-455 rounded-full text-xs font-bold">Centre de tri</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 rounded-full text-xs font-bold">En livraison</span>;
      case 'DELIVERED':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full text-xs font-bold">Livré</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#EFF6FF] dark:bg-[#090D16] transition-colors duration-200 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8 text-left">
        
        {/* Navigation retour */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-750 dark:text-primary-450 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Retour à l'accueil</span>
          </Link>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            QuickShip Portal
          </span>
        </div>

        {/* Formulaire de recherche principal */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-premium shadow-premium p-8 space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-950 dark:text-white">
              Suivi d'expédition en temps réel
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Saisissez le numéro de suivi QuickShip (ex: QS-754910) pour visualiser l'avancement
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-3.5 text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Numéro de suivi du colis..."
                className="input-premium pl-10 py-3 text-base"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition duration-200 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </form>
        </div>

        {/* Affichage des états */}
        {loading && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-premium shadow-premium flex flex-col items-center justify-center gap-4 py-16 animate-pulse">
            <div className="h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-400">Récupération des logs d'acheminement...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-6 rounded-premium shadow-premium flex items-start gap-3 text-red-600 dark:text-red-400">
            <AlertCircle size={24} className="shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Une erreur est survenue</h4>
              <p className="text-xs mt-1 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Fiche details du colis */}
        {parcel && !loading && (
          <div className="space-y-6">
            
            {/* Progression logistique */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Colis suivi</p>
                  <h3 className="text-lg font-black text-primary-600 dark:text-primary-400">{parcel.trackingId}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-450 dark:text-slate-500 font-bold">Statut :</span>
                  {getStatusBadge(parcel.status)}
                </div>
              </div>

              {/* Progress Bar SVG Map */}
              <div className="relative h-28 w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col justify-center px-8">
                <svg className="absolute inset-0 h-full w-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 60 56 Q 300 20, 720 56" fill="transparent" stroke="#e2e8f0" strokeWidth="4" className="dark:stroke-slate-800" />
                  <path d="M 60 56 Q 300 20, 720 56" fill="transparent" stroke="#2563eb" strokeWidth="4" strokeDasharray="800" strokeDashoffset={800 - (800 * getMapProgress(parcel.status))} className="transition-all duration-1000 ease-out" />
                </svg>

                <div className="flex justify-between items-center relative">
                  <div className="flex flex-col items-center z-10">
                    <div className="h-6.5 w-6.5 rounded-full border-4 border-primary-600 bg-white dark:bg-slate-900 shadow"></div>
                    <span className="text-[10px] font-bold text-slate-450 mt-1 uppercase">Départ</span>
                  </div>

                  <div 
                    className="absolute h-8 w-8 rounded-full bg-accent-500 text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg transition-all duration-1000 ease-out z-20" 
                    style={{
                      left: `${5 + (getMapProgress(parcel.status) * 85)}%`,
                      top: `${parcel.status === 'CREATED' ? '-8px' : parcel.status === 'DELIVERED' ? '-8px' : '-22px'}`
                    }}
                  >
                    <Truck size={14} className="animate-pulse" />
                  </div>

                  <div className="flex flex-col items-center z-10">
                    <div className={`h-6.5 w-6.5 rounded-full border-4 ${parcel.status === 'DELIVERED' ? 'border-emerald-500 bg-white dark:bg-slate-900' : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900'}`}></div>
                    <span className="text-[10px] font-bold text-slate-450 mt-1 uppercase">Arrivée</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Details & Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Infos Expedition */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium space-y-5">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Fiche logistique
                </h4>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Adresse de Collecte</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{parcel.pickupAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Adresse de Livraison</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{parcel.deliveryAddress}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50 dark:border-slate-800/60">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Scale size={12} />
                        <span>Poids</span>
                      </span>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{parcel.weight} kg</p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Calendar size={12} />
                        <span>Estimation</span>
                      </span>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {parcel.estimatedDelivery ? new Date(parcel.estimatedDelivery).toLocaleDateString('fr-FR') : 'Non planifiée'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historique Timeline */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Suivi d'acheminement
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
                  {parcel.logs && parcel.logs.length > 0 ? (
                    parcel.logs.map((log) => (
                      <div key={log.id} className="relative">
                        <div className="absolute -left-6 top-1.5 h-2.5 w-2.5 rounded-full bg-primary-600 border border-white dark:border-slate-900 shadow"></div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {log.description}
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <Clock size={10} />
                            <span>{new Date(log.timestamp).toLocaleString('fr-FR')}</span>
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-slate-400 italic text-sm">
                      Aucune étape enregistrée pour le moment.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackParcel;
