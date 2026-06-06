import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { registerSchema } from '../../utils/validators';
import { Box, Lock, Mail, User, Phone, CheckSquare, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CLIENT',
    }
  });

  const onSubmit = async (data) => {
    setError(null);
    try {
      await signup(data);
      toast.success("Votre compte QuickShip a été créé avec succès ! 🎉 Redirection...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Une erreur est survenue lors de la création de votre compte.";
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 py-12 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-8 group cursor-pointer">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md shadow-primary-500/10 group-hover:scale-105 transition-transform duration-200">
          <Box size={22} className="animate-pulse" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Quick<span className="text-primary-600">Ship</span>
        </span>
      </Link>

      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-premium shadow-premium p-8 space-y-6">
        
        {/* Header */}
        <div className="space-y-1.5 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Créer un compte
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Rejoignez QuickShip pour expédier ou livrer des colis
          </p>
        </div>

        {/* Global error alert */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="font-semibold text-left">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="firstName" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Prénom
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-slate-400">
                  <User size={18} />
                </span>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Jean"
                  className={`input-premium pl-10 ${errors.firstName ? 'border-red-400 focus:ring-red-400' : ''}`}
                  {...register('firstName')}
                />
              </div>
              {errors.firstName && (
                <p className="text-xs font-semibold text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lastName" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Nom
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-slate-400">
                  <User size={18} />
                </span>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Dupont"
                  className={`input-premium pl-10 ${errors.lastName ? 'border-red-400 focus:ring-red-400' : ''}`}
                  {...register('lastName')}
                />
              </div>
              {errors.lastName && (
                <p className="text-xs font-semibold text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Adresse email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-400">
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                className={`input-premium pl-10 ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-semibold text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Mot de passe
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`input-premium pl-10 pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-450 hover:text-slate-650 dark:text-slate-500 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-semibold text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Téléphone
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-slate-400">
                  <Phone size={18} />
                </span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="0612345678"
                  className={`input-premium pl-10 ${errors.phone ? 'border-red-400 focus:ring-red-400' : ''}`}
                  {...register('phone')}
                />
              </div>
              {errors.phone && (
                <p className="text-xs font-semibold text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Role select */}
          <div className="space-y-1.5">
            <label htmlFor="role" className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Type de compte
            </label>
            <select
              id="role"
              className={`input-premium appearance-none bg-no-repeat bg-right ${
                errors.role ? 'border-red-400 focus:ring-red-400' : ''
              }`}
              {...register('role')}
            >
              <option value="CLIENT">Client (Expéditeur)</option>
              <option value="DRIVER">Livreur (Chauffeur)</option>
              <option value="ADMIN">Administrateur (Gestionnaire)</option>
            </select>
            {errors.role && (
              <p className="text-xs font-semibold text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-750 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Création du compte...</span>
              </>
            ) : (
              <span>S'inscrire</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Vous avez déjà un compte ?{' '}
          <Link
            to="/login"
            className="font-bold text-primary-600 hover:text-primary-750 dark:text-primary-400 cursor-pointer"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
