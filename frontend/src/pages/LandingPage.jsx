import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  User, 
  Clock, 
  Shield, 
  MapPin, 
  Truck, 
  Phone, 
  ArrowRight, 
  Search, 
  ThumbsUp, 
  CheckCircle,
  HelpCircle,
  Coins,
  MessageCircle,
  X,
  Play,
  TrendingUp,
  Award,
  Users,
  Building,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import Navbar from '../components/Common/Navbar';
import { parcelService } from '../services/api';

const LandingPage = () => {
  // Tracking
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackedParcel, setTrackedParcel] = useState(null);
  const [trackingError, setTrackingError] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Video modal
  const [videoOpen, setVideoOpen] = useState(false);

  // Accordion state
  const [openFaq, setOpenFaq] = useState(0);

  // Rates search state
  const [rateSearch, setRateSearch] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  // Mock agencies & cities for Morocco rates calculation
  const agencies = [
    { id: 'CAS', name: 'Casablanca Agence' },
    { id: 'RAB', name: 'Rabat Agence' },
    { id: 'MAR', name: 'Marrakech Agence' },
    { id: 'AGA', name: 'Agadir Agence' },
    { id: 'FES', name: 'Fès Agence' },
    { id: 'TAN', name: 'Tanger Agence' },
  ];

  const cities = [
    { id: 'CAS', name: 'Casablanca' },
    { id: 'RAB', name: 'Rabat' },
    { id: 'MAR', name: 'Marrakech' },
    { id: 'AGA', name: 'Agadir' },
    { id: 'FES', name: 'Fès' },
    { id: 'TAN', name: 'Tanger' },
    { id: 'OUJ', name: 'Oujda' },
    { id: 'Mek', name: 'Meknès' },
  ];

  const rates = [
    { from: 'Casablanca Agence', to: 'Casablanca', price: '25 DH', time: '24h' },
    { from: 'Casablanca Agence', to: 'Rabat', price: '35 DH', time: '24h' },
    { from: 'Casablanca Agence', to: 'Marrakech', price: '35 DH', time: '24h' },
    { from: 'Casablanca Agence', to: 'Fès', price: '40 DH', time: '24h' },
    { from: 'Casablanca Agence', to: 'Agadir', price: '40 DH', time: '48h' },
    { from: 'Casablanca Agence', to: 'Tanger', price: '40 DH', time: '48h' },
    { from: 'Casablanca Agence', to: 'Oujda', price: '45 DH', time: '72h' },
    { from: 'Rabat Agence', to: 'Rabat', price: '25 DH', time: '24h' },
    { from: 'Rabat Agence', to: 'Casablanca', price: '35 DH', time: '24h' },
    { from: 'Rabat Agence', to: 'Tanger', price: '40 DH', time: '24h' },
    { from: 'Marrakech Agence', to: 'Marrakech', price: '25 DH', time: '24h' },
    { from: 'Marrakech Agence', to: 'Agadir', price: '35 DH', time: '24h' },
  ];

  const filteredRates = rates.filter(r => {
    const matchesSearch = 
      r.from.toLowerCase().includes(rateSearch.toLowerCase()) ||
      r.to.toLowerCase().includes(rateSearch.toLowerCase());
      
    const matchesAgency = selectedAgency === 'ALL' || r.from.includes(selectedAgency);
    const matchesCity = selectedCity === 'ALL' || r.to === selectedCity;

    return matchesSearch && matchesAgency && matchesCity;
  });

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    
    setTrackingLoading(true);
    setTrackingError(null);
    setTrackedParcel(null);

    try {
      const data = await parcelService.track(trackingNumber.trim());
      setTrackedParcel(data);
    } catch (err) {
      console.error(err);
      setTrackingError("Aucun colis trouvé avec ce numéro de suivi. Veuillez vérifier le code.");
    } finally {
      setTrackingLoading(false);
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'CREATED': return 'Créé';
      case 'ACCEPTED': return 'Accepté';
      case 'PICKED_UP': return 'Collecté';
      case 'IN_TRANSIT': return 'En transit';
      case 'ARRIVED_AT_HUB': return 'Au centre de tri';
      case 'OUT_FOR_DELIVERY': return 'En cours de livraison';
      case 'DELIVERED': return 'Livré';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-200">
      <Navbar />

      {/* 1. Hero Section (Inspirée de foxlivraison.ma) */}
      <section 
        className="relative min-h-[80vh] flex items-center justify-center px-6 py-20 text-white bg-cover bg-center"
        style={{ 
          backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80')" 
        }}
      >
        <div className="max-w-4xl mx-auto text-center space-y-8 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-600/30 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-wider"
          >
            <TrendingUp size={14} />
            <span>Livraison rapide & sûre</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight"
          >
            La livraison e-commerce pensée par et pour les e-commerçants!
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto"
          >
            Nous ramassons, stockons, emballons et livrons vos colis partout en France sous les meilleurs délais.
          </motion.p>

          {/* Formulaire de Suivi Bar */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row items-stretch gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl sm:rounded-full shadow-2xl border border-white/10">
              <div className="flex-1 flex items-center px-3 gap-2">
                <Search className="text-slate-400 shrink-0" size={20} />
                <input
                  type="text"
                  placeholder="Code de suivi (ex: QS-...)"
                  className="w-full py-3 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm font-semibold"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={trackingLoading}
                className="px-6 py-3.5 bg-secondary-500 hover:bg-secondary-600 active:scale-95 text-white font-bold rounded-lg sm:rounded-full transition-all text-sm cursor-pointer shrink-0"
              >
                {trackingLoading ? 'Recherche...' : 'Suivre mon colis'}
              </button>
            </form>
            {trackingError && (
              <p className="text-red-400 text-xs font-semibold mt-2 bg-red-950/20 py-1.5 px-3 rounded-lg inline-block border border-red-900/50">
                {trackingError}
              </p>
            )}
          </motion.div>

          {/* WhatsApp & Register Buttons */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <a 
              href="https://wa.me/212701212524" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <MessageCircle size={20} className="fill-current" />
              <span>WhatsApp Support</span>
            </a>
            <Link 
              to="/register" 
              className="px-6 py-3 bg-primary-600 hover:bg-primary-750 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              Créer mon compte
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Services Section (2 colonnes, vidéo et cards) */}
      <section id="service" className="py-24 px-6 max-w-7xl mx-auto w-full space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-primary-600">Notre savoir-faire</h2>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Nos <span className="text-primary-600">Services</span> Logistiques
          </p>
          <div className="h-1 w-12 bg-primary-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Vidéo Mockup avec lecture Modal */}
          <div className="lg:col-span-5">
            <div 
              onClick={() => setVideoOpen(true)}
              className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl group cursor-pointer border border-slate-200 dark:border-slate-800"
            >
              <img 
                src="https://images.unsplash.com/photo-1501862700950-18e335c436a0?auto=format&fit=crop&w=600&q=80" 
                alt="QuickShip Services Video" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/50 transition-colors flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Play size={24} className="fill-current ml-1" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-xs font-bold text-white uppercase tracking-widest bg-slate-900/60 py-1.5 px-3 rounded-full backdrop-blur-sm inline-block">
                  Découvrez Fox Livraison en vidéo
                </p>
              </div>
            </div>
          </div>

          {/* Cards Services */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium shadow-premium hover:shadow-premium-hover transition-all duration-200">
              <div className="h-12 w-12 rounded-xl bg-primary-50 dark:bg-slate-800/80 text-primary-600 flex items-center justify-center mb-4">
                <Building size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Ramassage gratuit</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Nous nous déplaçons directement dans vos entrepôts ou boutiques pour collecter vos colis à expédier.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium shadow-premium hover:shadow-premium-hover transition-all duration-200">
              <div className="h-12 w-12 rounded-xl bg-primary-50 dark:bg-slate-800/80 text-primary-600 flex items-center justify-center mb-4">
                <Box size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Stockage sécurisé</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Profitez de nos espaces de stockage tempérés et hautement surveillés pour vos inventaires e-commerce.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium shadow-premium hover:shadow-premium-hover transition-all duration-200">
              <div className="h-12 w-12 rounded-xl bg-primary-50 dark:bg-slate-800/80 text-primary-600 flex items-center justify-center mb-4">
                <Award size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Packaging sur-mesure</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Emballage professionnel adapté pour protéger les articles fragiles et valoriser votre marque.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium shadow-premium hover:shadow-premium-hover transition-all duration-200">
              <div className="h-12 w-12 rounded-xl bg-primary-50 dark:bg-slate-800/80 text-primary-600 flex items-center justify-center mb-4">
                <Truck size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Livraison & COD</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Acheminement rapide, encaissement des fonds à la livraison (Cash on Delivery) et virements sous 48h.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Comment ça marche ? (3 étapes) */}
      <section className="py-24 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-primary-600">Simplicité</h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Comment ça marche ?
            </p>
            <div className="h-1 w-12 bg-primary-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-premium text-center space-y-4 shadow-sm">
              <div className="h-16 w-16 mx-auto bg-primary-100 dark:bg-slate-800 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold">
                01
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Créez votre compte</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Inscrivez-vous gratuitement et accédez à votre tableau de bord expéditeur intuitif.
              </p>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-premium text-center space-y-4 shadow-sm">
              <div className="h-16 w-16 mx-auto bg-primary-100 dark:bg-slate-800 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold">
                02
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Déposez vos colis</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enregistrez vos envois en ligne. Planifiez un ramassage gratuit à votre domicile ou point relais.
              </p>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-premium text-center space-y-4 shadow-sm">
              <div className="h-16 w-16 mx-auto bg-primary-100 dark:bg-slate-800 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold">
                03
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Suivi & Encaissement</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Suivez les livraisons en temps réel. Recevez vos paiements clients en toute transparence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Statistiques Section (Chiffres Clés sur fond bleu #164b83) */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto bg-secondary-500 text-white rounded-3xl p-8 lg:p-16 shadow-2xl relative overflow-hidden">
          {/* Background shapes */}
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-5 text-left space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-primary-400">Notre force en chiffres</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                Ce qui fait notre succès chez QuickShip
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed max-w-sm">
                Des milliers d'expéditeurs nous font confiance pour expédier et gérer leurs encaissements au quotidien.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-primary-400 shrink-0">
                  <Truck size={24} />
                </div>
                <div>
                  <h4 className="text-3xl font-black">198,521</h4>
                  <p className="text-xs text-slate-200 font-medium">Colis livrés avec succès</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-primary-400 shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="text-3xl font-black">2,720</h4>
                  <p className="text-xs text-slate-200 font-medium">Clients actifs mensuels</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-primary-400 shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="text-3xl font-black">405</h4>
                  <p className="text-xs text-slate-200 font-medium">Villes et communes couvertes</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-primary-400 shrink-0">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h4 className="text-3xl font-black">99%</h4>
                  <p className="text-xs text-slate-200 font-medium">Taux de livraison à temps</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Tarifs Section (Simulateur interactif) */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-primary-600">Simulateur de coûts</h2>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Nos <span className="text-primary-600">Tarifs</span> Transparent
          </p>
          <div className="h-1 w-12 bg-primary-600 mx-auto rounded-full"></div>
        </div>

        {/* Inputs de filtrage */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-premium shadow-premium grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chercher ici</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Ex: Paris, Lyon..."
                className="input-premium pl-10 py-2.5 text-sm"
                value={rateSearch}
                onChange={(e) => setRateSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Agence de départ</label>
            <select
              className="input-premium py-2.5 text-sm"
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
            >
              <option value="ALL">Sélectionner Agence (Toutes)</option>
              {agencies.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ville de destination</label>
            <select
              className="input-premium py-2.5 text-sm"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="ALL">Sélectionner Ville (Toutes)</option>
              {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Table de Tarifs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium shadow-premium overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600">
                  <th className="px-6 py-4">Agence de départ</th>
                  <th className="px-6 py-4">Ville de destination</th>
                  <th className="px-6 py-4">Délai estimé</th>
                  <th className="px-6 py-4 text-right">Tarif de livraison</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredRates.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400 italic">
                      Aucun tarif ne correspond à vos critères de recherche.
                    </td>
                  </tr>
                ) : (
                  filteredRates.map((rate, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">{rate.from}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-850 dark:text-slate-100">{rate.to}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-450 uppercase flex items-center gap-1.5 pt-4.5">
                        <Clock size={12} className="text-primary-600" />
                        <span>{rate.time}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-primary-600 text-right">{rate.price}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800/80">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-primary-600">FAQ</h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Questions Fréquentes
            </p>
            <div className="h-1 w-12 bg-primary-600 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-4 text-left">
            {[
              {
                q: "Quels sont vos délais de livraison ?",
                a: "Nous livrons partout en France sous 24h à 72h selon la distance géographique. Les expéditions interurbaines majeures (ex: Paris -> Lyon) s'effectuent généralement en 24h."
              },
              {
                q: "Comment suivre l'acheminement de mon colis ?",
                a: "Il vous suffit de saisir le numéro de suivi (ex: QS-...) dans la barre de recherche en haut de cette page. Vous pourrez suivre la progression en temps réel sur notre carte interactive."
              },
              {
                q: "Proposez-vous le Cash on Delivery (Paiement à la livraison) ?",
                a: "Oui, tout à fait. Nos livreurs collectent les règlements de vos clients (espèces ou chèque) et nous créditons votre compte sous 48h ouvrées après livraison."
              }
            ].map((faq, i) => (
              <div 
                key={i} 
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full flex items-center justify-between p-6 font-bold text-slate-850 dark:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-primary-600 font-bold text-lg">{openFaq === i ? '−' : '+'}</span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800/50 pt-4">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Call to Action (Orange background #ff823f) */}
      <section className="py-20 px-6 bg-primary-600 text-white text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-black">Prêt à simplifier vos expéditions ?</h2>
          <p className="text-orange-50 font-medium">
            Rejoignez des centaines de e-commerçants et confiez-nous votre logistique dès aujourd'hui.
          </p>
          <Link 
            to="/register" 
            className="inline-block px-8 py-4 bg-secondary-500 hover:bg-secondary-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 cursor-pointer"
          >
            Créer mon compte
          </Link>
        </div>
      </section>

      {/* 8. Footer (Bleu Corporate #164b83) */}
      <footer className="bg-secondary-500 text-slate-200 border-t border-secondary-600 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md">
              <Box size={22} />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              Quick<span className="text-primary-600">Ship</span>
            </span>
          </div>

          <p className="text-xs text-slate-350">
            &copy; {new Date().getFullYear()} QuickShip SAS. Tous droits réservés. Inspiré par Fox Livraison.
          </p>

          <div className="flex gap-6 text-xs font-bold text-slate-105">
            <a href="#" className="hover:text-white transition-colors">Conditions</a>
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Assistance</a>
          </div>
        </div>
      </footer>

      {/* --- MODAL VIDEO DE DEMONSTRATION --- */}
      {videoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <button 
              onClick={() => setVideoOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-900/60 text-white rounded-full hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="aspect-video w-full">
              {/* Simulated iframe player, or using Unsplash video placeholders */}
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                title="Fox Livraison Video Presentation"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE SUIVI DYNAMIQUE --- */}
      {trackedParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-premium border border-slate-100 dark:border-slate-800 w-full max-w-3xl overflow-hidden shadow-2xl animate-scale-up text-left">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  <span>Suivi de colis</span>
                  <span className="text-primary-600">{trackedParcel.trackingId}</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Statut : {getStatusLabel(trackedParcel.status)}
                </p>
              </div>
              <button
                onClick={() => setTrackedParcel(null)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-950 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              
              {/* Animated Map Route */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Progression du colis</h4>
                <div className="relative h-28 w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden flex flex-col justify-center px-8">
                  <svg className="absolute inset-0 h-full w-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 60 56 Q 300 20, 620 56" fill="transparent" stroke="#e2e8f0" strokeWidth="4" className="dark:stroke-slate-800" />
                    <path d="M 60 56 Q 300 20, 620 56" fill="transparent" stroke="#ff823f" strokeWidth="4" strokeDasharray="600" strokeDashoffset={600 - (600 * getMapProgress(trackedParcel.status))} className="transition-all duration-1000 ease-out" />
                  </svg>
                  <div className="flex justify-between items-center relative">
                    <div className="flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full border-4 border-primary-600 bg-white"></div>
                      <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Départ</span>
                    </div>
                    <div className="absolute h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center transition-all duration-1000 ease-out" style={{ left: `${5 + (getMapProgress(trackedParcel.status) * 85)}%`, top: '-8px' }}>
                      <Truck size={14} />
                    </div>
                    <div className="flex flex-col items-center">
                      <div className={`h-6 w-6 rounded-full border-4 ${trackedParcel.status === 'DELIVERED' ? 'border-emerald-500 bg-white' : 'border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900'}`}></div>
                      <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Arrivée</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Log History list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Détails d'envoi</h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-xl space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <p><span className="text-slate-450 font-medium">Expéditeur :</span> <span className="font-bold">{trackedParcel.client?.firstName} {trackedParcel.client?.lastName}</span></p>
                    <p><span className="text-slate-450 font-medium">Destinataire :</span> <span className="font-bold">{trackedParcel.recipientName}</span></p>
                    <p><span className="text-slate-450 font-medium">Adresse de collecte :</span> <span className="font-bold">{trackedParcel.pickupAddress}</span></p>
                    <p><span className="text-slate-450 font-medium">Adresse de livraison :</span> <span className="font-bold">{trackedParcel.deliveryAddress}</span></p>
                    <p><span className="text-slate-450 font-medium">Poids :</span> <span className="font-bold">{trackedParcel.weight} kg</span></p>
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Étapes franchies</h4>
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                    {trackedParcel.logs?.map((log) => (
                      <div key={log.id} className="relative">
                        <div className="absolute -left-6 top-1.5 h-2.5 w-2.5 rounded-full bg-primary-600 border border-white"></div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{log.description}</p>
                          <p className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString('fr-FR')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-right">
              <button
                onClick={() => setTrackedParcel(null)}
                className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-sm cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
