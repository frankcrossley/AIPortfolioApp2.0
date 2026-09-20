import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, Plus, X } from 'lucide-react';

export interface SearchableSelectOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  value?: string;
  onChange: (id: string | undefined) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  emptyLabel?: string;
  addNewLabel?: string;
  onAddNew?: (name: string) => SearchableSelectOption | void;
  disabled?: boolean;
}

/**
 * A controlled, searchable dropdown for repeatable organisational entities
 * (business units, people, teams, platforms, applications, initiatives).
 * Typing filters the existing master-data list; an optional "+ Add new"
 * row creates a fresh record deliberately, rather than auto-creating one
 * from every free-text entry (which would produce duplicates).
 */
export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Search...',
  emptyLabel = 'Not assigned',
  addNewLabel,
  onAddNew,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pendingOption, setPendingOption] = useState<SearchableSelectOption | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value) || (value && pendingOption?.id === value ? pendingOption : undefined);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()));

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setQuery('');
  };

  const handleAddNew = () => {
    if (!query.trim() || !onAddNew) return;
    const created = onAddNew(query.trim());
    if (created) {
      setPendingOption(created);
      onChange(created.id);
    }
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-slate-200 rounded-lg text-left text-xs bg-white hover:border-slate-300 focus:outline-none focus:border-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-400"
      >
        <span className={`truncate ${selected ? 'text-slate-900' : 'text-slate-400'}`}>
          {selected ? selected.label : emptyLabel}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {selected && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
              className="p-0.5 text-slate-300 hover:text-slate-500"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-xs text-slate-400">No matches</div>
            )}
            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => handleSelect(o.id)}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 transition-colors ${
                  o.id === value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                }`}
              >
                <div className="truncate">{o.label}</div>
                {o.sublabel && <div className="text-[10px] text-slate-400 truncate">{o.sublabel}</div>}
              </button>
            ))}
          </div>
          {onAddNew && query.trim() && (
            <button
              type="button"
              onClick={handleAddNew}
              className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-600 border-t border-slate-100 hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {addNewLabel || 'Add new'} &quot;{query.trim()}&quot;
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
