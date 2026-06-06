import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { parcelService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { parcelSchema } from '../../utils/validators';
import Layout from '../../components/Common/Layout';
import { 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  Scale, 
  Calendar, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

const CreateParcel = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(parcelSchema),
    defaultValues: {
      description: '',
      weight: '',
      estimatedDelivery: '',
    }
  });

  const onSubmit = async (data) => {
    setError(null);
    
    // Nettoyer estimatedDelivery si vide
    const payload = { ...data };
    if (!payload.estimatedDelivery) {
      delete payload.estimatedDelivery;
    } else {
      payload.estimatedDelivery = new Date(payload.estimatedDelivery).toISOString();
    }

    try {
      const response = await parcelService.create(payload);
      toast.success(`Colis créé avec succès ! Suivi # : ${response.trackingNumber}`);
      setTimeout(() => {
        navigate('/my-parcels');
      }, 2000);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Une erreur est survenue lors de l'enregistrement du colis.";
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 text-left">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Expédier un Colis
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Saisissez les détails pour enregistrer et programmer votre expédition
          </p>
        </div>

        {/* Global error alert */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 lg:p-8 shadow-premium">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Informations Destinataire */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Destinataire
                </h3>

                <div className="space-y-1.5">
                  <label htmlFor="recipientName" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Nom du destinataire
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-slate-400">
                      <User size={18} />
                    </span>
                    <input
                      id="recipientName"
                      type="text"
                      placeholder="Jean Martin"
                      className={`input-premium pl-10 ${errors.recipientName ? 'border-red-400 focus:ring-red-400' : ''}`}
                      {...register('recipientName')}
                    />
                  </div>
                  {errors.recipientName && (
                    <p className="text-xs font-semibold text-red-500">{errors.recipientName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="recipientPhone" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Téléphone
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-slate-400">
                      <Phone size={18} />
                    </span>
                    <input
                      id="recipientPhone"
                      type="tel"
                      placeholder="0612345678"
                      className={`input-premium pl-10 ${errors.recipientPhone ? 'border-red-400 focus:ring-red-400' : ''}`}
                      {...register('recipientPhone')}
                    />
                  </div>
                  {errors.recipientPhone && (
                    <p className="text-xs font-semibold text-red-500">{errors.recipientPhone.message}</p>
                  )}
                </div>
              </div>

              {/* Détails du Colis */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Spécifications du colis
                </h3>

                <div className="space-y-1.5">
                  <label htmlFor="weight" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Poids (en kg)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-slate-400">
                      <Scale size={18} />
                    </span>
                    <input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="1.5"
                      className={`input-premium pl-10 ${errors.weight ? 'border-red-400 focus:ring-red-400' : ''}`}
                      {...register('weight')}
                    />
                  </div>
                  {errors.weight && (
                    <p className="text-xs font-semibold text-red-500">{errors.weight.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="estimatedDelivery" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Date souhaitée de livraison (optionnelle)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-slate-400">
                      <Calendar size={18} />
                    </span>
                    <input
                      id="estimatedDelivery"
                      type="date"
                      className={`input-premium pl-10 ${errors.estimatedDelivery ? 'border-red-400 focus:ring-red-400' : ''}`}
                      {...register('estimatedDelivery')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Adresses et Description */}
            <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white pb-2">
                Logistique d'expédition
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label htmlFor="pickupAddress" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Adresse de collecte (Départ)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-slate-400">
                      <MapPin size={18} />
                    </span>
                    <input
                      id="pickupAddress"
                      type="text"
                      placeholder="12 Rue de la Paix, 75002 Paris"
                      className={`input-premium pl-10 ${errors.pickupAddress ? 'border-red-400 focus:ring-red-400' : ''}`}
                      {...register('pickupAddress')}
                    />
                  </div>
                  {errors.pickupAddress && (
                    <p className="text-xs font-semibold text-red-500">{errors.pickupAddress.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="deliveryAddress" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Adresse de livraison (Destination)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-slate-400">
                      <MapPin size={18} />
                    </span>
                    <input
                      id="deliveryAddress"
                      type="text"
                      placeholder="45 Avenue des Champs-Élysées, 75008 Paris"
                      className={`input-premium pl-10 ${errors.deliveryAddress ? 'border-red-400 focus:ring-red-400' : ''}`}
                      {...register('deliveryAddress')}
                    />
                  </div>
                  {errors.deliveryAddress && (
                    <p className="text-xs font-semibold text-red-500">{errors.deliveryAddress.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="description" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Description du contenu (optionnelle)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-400">
                    <FileText size={18} />
                  </span>
                  <textarea
                    id="description"
                    rows="3"
                    placeholder="Contenu fragile, documents importants, etc."
                    className="input-premium pl-10"
                    {...register('description')}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate('/my-parcels')}
                className="px-5 py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all duration-200 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-premium-primary flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Création du colis...</span>
                  </>
                ) : (
                  <span>Confirmer l'expédition</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateParcel;
