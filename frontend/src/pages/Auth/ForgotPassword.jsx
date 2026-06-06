import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { Box, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || email.trim() === '') {
      setError("Veuillez saisir votre adresse email.");
      toast.warning("L'email est requis.");
      return;
    }
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const msg = "Un lien de réinitialisation de mot de passe a été envoyé à l'adresse : " + email;
      setSuccess(msg);
      toast.success("E-mail envoyé avec succès ! Checkez votre boîte.");
    }, 1500);
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

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-premium shadow-premium p-8 space-y-6">
        
        {/* Header */}
        <div className="space-y-1.5 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Mot de passe oublié
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Saisissez votre email pour réinitialiser votre mot de passe
          </p>
        </div>

        {/* Bannières d'information */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="font-medium text-left">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-sm">
            <CheckCircle2 size={20} className="shrink-0 mt-0.5 animate-pulse" />
            <p className="font-medium text-left">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
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
                className="input-premium pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Envoi en cours...</span>
              </>
            ) : (
              <span>Envoyer le lien</span>
            )}
          </button>
        </form>

        {/* Navigation */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Retourner à la{' '}
          <Link
            to="/login"
            className="font-bold text-primary-600 hover:text-primary-750 dark:text-primary-400 cursor-pointer"
          >
            Connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
