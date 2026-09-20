import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DrawerSectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * A collapsible section within the Add-to-Portfolio drawers. Sections start
 * collapsed unless `defaultOpen` is set, so users aren't confronted with
 * every field at once - only Basic details opens by default.
 */
export const DrawerSection: React.FC<DrawerSectionProps> = ({ title, description, defaultOpen = false, badge, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/60 hover:bg-slate-50 transition-colors text-left"
      >
        <span className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900">{title}</span>
          {badge}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </button>
      {open && (
        <div className="p-4 space-y-4 text-xs bg-white">
          {description && <p className="text-slate-500 -mt-1">{description}</p>}
          {children}
        </div>
      )}
    </div>
  );
};
