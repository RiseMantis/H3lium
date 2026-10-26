'use client';

import React from 'react';
import { useHeliumStore } from '@/lib/store';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X,
  RotateCcw,
} from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useHeliumStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: CheckCircle2,
          warning: AlertTriangle,
          error: XCircle,
          info: Info,
        };
        const Icon = icons[toast.type] || Info;

        const borderColors = {
          success: 'border-teal-500/50 bg-white dark:bg-slate-900',
          warning: 'border-amber-500/50 bg-white dark:bg-slate-900',
          error: 'border-rose-500/50 bg-white dark:bg-slate-900',
          info: 'border-purple-500/50 bg-white dark:bg-slate-900',
        };

        const iconColors = {
          success: 'text-teal-500',
          warning: 'text-amber-500',
          error: 'text-rose-500',
          info: 'text-purple-500',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-lg border shadow-xl p-3.5 transition-all flex items-start gap-3 ${borderColors[toast.type]}`}
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColors[toast.type]}`} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {toast.title}
              </div>
              {toast.description && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {toast.description}
                </div>
              )}
              {toast.undoAction && (
                <button
                  onClick={() => {
                    toast.undoAction?.();
                    removeToast(toast.id);
                  }}
                  className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{toast.undoLabel || 'Undo'}</span>
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
