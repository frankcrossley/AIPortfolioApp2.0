import React from 'react';
import { Download, ArrowLeft } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { AddToPortfolioMenu } from './AddToPortfolioMenu';

interface HeaderProps {
  title: string;
  breadcrumbs?: { label: string; action?: () => void }[];
  showExport?: boolean;
  showRegister?: boolean;
  customActions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  breadcrumbs,
  showExport = true,
  showRegister = true,
  customActions,
}) => {
  const { showToast, items } = usePortfolio();

  const handleExport = () => {
    const jsonStr = JSON.stringify(items, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-portfolio-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exported AI Portfolio dataset as JSON');
  };

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-6 shrink-0">
      {/* Optional Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-medium">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-400">/</span>}
                {crumb.action && !isLast ? (
                  <button
                    onClick={crumb.action}
                    className="hover:text-blue-600 transition-colors flex items-center gap-1"
                  >
                    {idx === 0 && <ArrowLeft className="w-3 h-3 inline mr-0.5" />}
                    {crumb.label}
                  </button>
                ) : (
                  <span className={isLast ? 'text-slate-900 font-semibold' : ''}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-tight font-extrabold text-slate-900 tracking-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-2.5">
          {customActions}

          {showExport && (
            <button
              id="header-export-btn"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          )}

          {showRegister && <AddToPortfolioMenu />}

          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

          {/* User status avatar matching screenshot */}
          <div className="relative cursor-pointer group hidden sm:block">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-medium text-xs shadow-xs">
              ER
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
        </div>
      </div>
    </header>
  );
};
