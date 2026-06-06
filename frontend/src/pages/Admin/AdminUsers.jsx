import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Layout from '../../components/Common/Layout';
import { SkeletonTable } from '../../components/Common/Skeleton';
import EmptyState from '../../components/Common/EmptyState';
import { Search, Shield, User, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminUsers = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les utilisateurs.");
      toast.error("Erreur de récupération des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (roles) => {
    if (roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')) {
      return <span className="px-2.5 py-1 bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400 rounded-full text-xs font-bold">Admin</span>;
    }
    if (roles.includes('DRIVER') || roles.includes('ROLE_DRIVER')) {
      return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 rounded-full text-xs font-bold">Livreur</span>;
    }
    return <span className="px-2.5 py-1 bg-primary-100 text-primary-800 dark:bg-primary-950/20 dark:text-primary-400 rounded-full text-xs font-bold">Client</span>;
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

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
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Gestion des Utilisateurs
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Visualisez la liste complète des clients, livreurs et administrateurs enregistrés sur QuickShip
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-premium shadow-premium">
          <span className="absolute left-7 top-7.5 text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Rechercher un utilisateur par nom, prénom ou email..."
            className="input-premium pl-10 py-2.5"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tableau */}
        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 rounded-premium text-center">
            {error}
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title="Aucun utilisateur trouvé"
            description="Ajustez vos filtres de recherche pour afficher d'autres résultats."
          />
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium shadow-premium overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-950/50">
                      <th className="px-6 py-4">Utilisateur</th>
                      <th className="px-6 py-4">Adresse email</th>
                      <th className="px-6 py-4">Téléphone</th>
                      <th className="px-6 py-4">Type de compte</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {paginatedUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold">
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-850 dark:text-slate-200">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="text-xs text-slate-400">ID: #{u.id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Mail size={14} />
                            <span>{u.email}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Phone size={14} />
                            <span>{u.phone || 'Non renseigné'}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">{getRoleBadge(u.roles)}</td>
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
                  Page {currentPage + 1} sur {totalPages} ({filteredUsers.length} utilisateurs)
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
      </div>
    </Layout>
  );
};

export default AdminUsers;
