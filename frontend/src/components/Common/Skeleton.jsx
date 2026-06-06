import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 space-y-4 shadow-premium animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
        <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/80 rounded-md"></div>
        <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800/80 rounded-md"></div>
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
      </div>
    </div>
  );
};

export const SkeletonTable = () => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 items-center border-b border-slate-100 dark:border-slate-800/50 pb-3">
            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            <div className="flex-1 space-y-1">
              <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800/50 rounded-md"></div>
            </div>
            <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-premium p-6 shadow-premium flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
            <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
          </div>
          <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
      ))}
    </div>
  );
};
