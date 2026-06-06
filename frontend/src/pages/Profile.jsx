import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/api';
import Layout from '../components/Common/Layout';
import { User, Phone, Mail, Shield, Moon, Sun, CheckCircle, Edit3, Save, X, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone) {
      toast.warning("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    try {
      await authService.updateProfile({ firstName, lastName, phone });
      await refreshUser();
      setIsEditing(false);
      toast.success("Profil mis à jour avec succès ! ✨");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour du profil.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Mon Profil
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Gérez vos informations personnelles et préférences de compte
            </p>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-750 text-white font-semibold rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              <Edit3 size={14} />
              <span>Modifier le profil</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold rounded-xl text-xs hover:bg-slate-50 cursor-pointer shadow-sm"
              >
                <X size={14} />
                <span>Annuler</span>
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Enregistrer</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Carte Identité */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 lg:p-8 shadow-premium space-y-6">
            <h2 className="text-xl font-bold text-slate-850 dark:text-white">Informations Générales</h2>
            
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prénom</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-400">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input-premium pl-10 disabled:bg-slate-50 dark:disabled:bg-slate-950/40 disabled:text-slate-500 disabled:cursor-not-allowed"
                    placeholder="Prénom"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nom</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-400">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input-premium pl-10 disabled:bg-slate-50 dark:disabled:bg-slate-950/40 disabled:text-slate-500 disabled:cursor-not-allowed"
                    placeholder="Nom de famille"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Adresse email</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-450">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="input-premium pl-10 bg-slate-50 dark:bg-slate-950/40 text-slate-450 cursor-not-allowed"
                    placeholder="Email"
                  />
                </div>
                <p className="text-[10px] text-slate-400">L'adresse email sert d'identifiant et ne peut être modifiée.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Téléphone</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-450">
                    <Phone size={18} />
                  </span>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-premium pl-10 disabled:bg-slate-50 dark:disabled:bg-slate-950/40 disabled:text-slate-500 disabled:cursor-not-allowed"
                    placeholder="06XXXXXXXX"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Préférences */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 lg:p-8 shadow-premium space-y-6">
            <h2 className="text-xl font-bold text-slate-850 dark:text-white">Paramètres rapides</h2>
            
            <div className="space-y-4">
              {/* Type de rôle badge */}
              <div className="p-4 bg-primary-50/50 dark:bg-slate-950 border border-primary-100/30 dark:border-slate-800 rounded-xl flex items-center gap-3">
                <Shield size={22} className="text-primary-600 dark:text-primary-400" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Rôle attribué</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {user.roles.includes('ADMIN') ? 'Administrateur' : user.roles.includes('DRIVER') ? 'Livreur' : 'Client'}
                  </p>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
