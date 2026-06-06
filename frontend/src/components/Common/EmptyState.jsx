import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title, description, actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium shadow-premium text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 mb-4">
        <Inbox size={32} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
        {title || 'Aucune donnée disponible'}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description || "Il n'y a pas d'éléments à afficher pour le moment."}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
