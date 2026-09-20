import React from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  supportingText?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * A right-hand slide-in drawer used for progressive data entry. Unlike the
 * old full-screen modal, the underlying page stays visible (a light scrim
 * only) and closing never discards anything already saved.
 */
export const Drawer: React.FC<DrawerProps> = ({ open, onClose, title, supportingText, children, footer }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/10" onClick={onClose} />
      <div className="relative h-full w-[600px] max-w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
            {supportingText && <p className="text-xs text-slate-500 mt-1 max-w-md">{supportingText}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">{children}</div>

        {footer && <div className="px-6 py-4 border-t border-slate-100 shrink-0 bg-white">{footer}</div>}
      </div>
    </div>
  );
};
