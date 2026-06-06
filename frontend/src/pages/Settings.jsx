import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Common/Layout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Moon, 
  Sun, 
  Lock, 
  ShieldAlert, 
  Globe, 
  Loader2, 
  CheckCircle,
  Mail,
  Smartphone
} from 'lucide-react';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
  newPassword: z.string().min(6, "Le nouveau mot de passe doit faire au moins 6 caractères"),
  confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

const Settings = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [lang, setLang] = useState('fr');
  
  // Simulated alert toggles
  const [notifs, setNotifs] = useState({
    emailAlerts: true,
    smsAlerts: false,
    transitUpdates: true,
    weeklyReport: false,
  });

  const handleNotifToggle = (key) => {
    setNotifs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      toast.info("Préférences de notification mises à jour.");
      return next;
    });
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitPassword = async (data) => {
    // Simulate password change API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Votre mot de passe a été mis à jour avec succès ! Security audit logged.");
    reset();
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="space-y-8 text-left">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <SettingsIcon className="text-primary-600 dark:text-primary-400" size={32} />
            <span>Paramètres de la Plateforme</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Configurez vos préférences d'affichage, alertes de suivi et paramètres de sécurité
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu de Gauche: Préférences & Notifs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Display preferences */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium space-y-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sun size={20} className="text-primary-600 dark:text-primary-400" />
                <span>Affichage & Thème</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                {/* Language switcher */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Globe size={20} className="text-primary-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-850 dark:text-slate-200">Langue</p>
                      <p className="text-[11px] text-slate-400">Langue de l'interface</p>
                    </div>
                  </div>
                  <select
                    value={lang}
                    onChange={(e) => {
                      setLang(e.target.value);
                      toast.success(`Langue configurée sur : ${e.target.value === 'fr' ? 'Français' : 'English'}`);
                    }}
                    className="input-premium py-1 px-3 text-xs w-auto max-w-[120px]"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English (EN)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification preferences */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium space-y-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell size={20} className="text-primary-600 dark:text-primary-400" />
                <span>Alertes & Notifications</span>
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-slate-400" />
                    <div>
                      <p className="text-sm font-bold text-slate-850 dark:text-slate-200">Alertes par Email</p>
                      <p className="text-[11px] text-slate-400">Mises à jour par e-mail à chaque changement d'étape</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifs.emailAlerts}
                    onChange={() => handleNotifToggle('emailAlerts')}
                    className="h-5 w-5 rounded border-slate-350 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Smartphone size={18} className="text-slate-400" />
                    <div>
                      <p className="text-sm font-bold text-slate-850 dark:text-slate-200">Notifications SMS</p>
                      <p className="text-[11px] text-slate-400">Recevoir des SMS en temps réel lors de l'acheminement</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifs.smsAlerts}
                    onChange={() => handleNotifToggle('smsAlerts')}
                    className="h-5 w-5 rounded border-slate-350 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-slate-400" />
                    <div>
                      <p className="text-sm font-bold text-slate-850 dark:text-slate-200">Rapports d'activité hebdomadaires</p>
                      <p className="text-[11px] text-slate-400">Bilan récapitulatif de toutes vos expéditions du mois</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifs.weeklyReport}
                    onChange={() => handleNotifToggle('weeklyReport')}
                    className="h-5 w-5 rounded border-slate-350 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Menu de Droite: Sécurité & Changement de mot de passe */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium space-y-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock size={20} className="text-primary-600 dark:text-primary-400" />
                <span>Sécurité du Compte</span>
              </h2>

              <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="currentPassword" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mot de passe actuel
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    className={`input-premium text-sm py-2.5 ${errors.currentPassword ? 'border-red-400' : ''}`}
                    {...register('currentPassword')}
                  />
                  {errors.currentPassword && (
                    <p className="text-xs text-red-500 font-semibold">{errors.currentPassword.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="newPassword" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nouveau mot de passe
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    className={`input-premium text-sm py-2.5 ${errors.newPassword ? 'border-red-400' : ''}`}
                    {...register('newPassword')}
                  />
                  {errors.newPassword && (
                    <p className="text-xs text-red-500 font-semibold">{errors.newPassword.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className={`input-premium text-sm py-2.5 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 font-semibold">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-750 text-white font-semibold rounded-xl text-xs shadow-md transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-55"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Validation...</span>
                    </>
                  ) : (
                    <span>Mettre à jour</span>
                  )}
                </button>
              </form>
            </div>

            {/* Audit log panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium space-y-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <ShieldAlert size={18} className="text-amber-500" />
                <span>Activité & Audit</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Votre dernière connexion a eu lieu le <strong>{new Date().toLocaleDateString('fr-FR')}</strong> depuis l'adresse IP <strong>127.0.0.1</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
