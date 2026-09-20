import React, { useEffect, useRef, useState } from 'react';
import { Plus, Kanban, Server } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

/**
 * The "+ Add to Portfolio" button and its two-option menu: Add Initiative
 * (a business/delivery effort) vs Add Estate Item (a technical/operational
 * record). Only Add Estate Item is fully implemented this iteration; Add
 * Initiative opens a lighter drawer backed by its own data model.
 */
export const AddToPortfolioMenu: React.FC = () => {
  const { openEstateItemDrawer, openInitiativeDrawer } = usePortfolio();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        id="header-add-to-portfolio-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md shadow-xs hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add to Portfolio</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1.5 text-left animate-in fade-in zoom-in-95 duration-150">
          <button
            id="add-menu-initiative"
            onClick={() => {
              setIsOpen(false);
              openInitiativeDrawer();
            }}
            className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-start gap-2.5"
          >
            <Kanban className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-slate-900">Add Initiative</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                A business or delivery effort, such as Customer Service AI Transformation.
              </div>
            </div>
          </button>
          <div className="h-px bg-slate-100 mx-2" />
          <button
            id="add-menu-estate-item"
            onClick={() => {
              setIsOpen(false);
              openEstateItemDrawer();
            }}
            className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-start gap-2.5"
          >
            <Server className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-slate-900">Add Estate Item</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                A technical or operational item, such as an Agent, Application, Platform or Embedded AI capability.
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
