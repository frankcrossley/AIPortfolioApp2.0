import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Network,
  Server,
  TrendingUp,
  Sliders,
  Settings,
  ShieldCheck,
  Sparkles,
  Cloud,
  CloudOff,
  RefreshCw,
  LogIn,
  LogOut,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { ActiveNav } from '../types';

export const Sidebar: React.FC = () => {
  const { activeNav, setActiveNav, metrics, isSyncing, isCloudSynced, seedInitialDataToCloud } = usePortfolio();
  const { user, signInWithGoogle, signOut, loading: authLoading } = useAuth();

  const navItems: {
    id: ActiveNav;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    soon?: boolean;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'map',
      label: 'AI Estate Map',
      icon: Network,
    },
    {
      id: 'portfolio',
      label: 'AI Portfolio',
      icon: Layers,
      badge: metrics.totalInitiatives,
    },
    {
      id: 'platforms',
      label: 'Platforms & Roll-ups',
      icon: Server,
    },
    {
      id: 'investment',
      label: 'Investment',
      icon: Sliders,
      soon: true,
    },
    {
      id: 'value-management',
      label: 'Value Management',
      icon: TrendingUp,
      soon: true,
    },
    {
      id: 'measurement',
      label: 'Measurement Standards',
      icon: ShieldCheck,
      soon: true,
    },
  ];

  return (
    <aside
      id="app-sidebar"
      className="w-64 bg-[#0a1122] text-slate-300 flex flex-col shrink-0 h-screen border-r border-slate-800/60 select-none"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm tracking-tight flex items-center gap-1.5">
            AI Portfolio
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              v1.2
            </span>
          </div>
          <div className="text-[11px] text-slate-400 leading-none mt-1">
            AI Estate • Investment • Outcomes
          </div>
        </div>
      </div>

      {/* Cloud Sync Status Pill */}
      <div className="mx-3 mt-3 px-3 py-2 rounded-md bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          {isSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          ) : user && isCloudSynced ? (
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <CloudOff className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="text-slate-300 font-medium">
            {isSyncing
              ? 'Syncing...'
              : user
              ? isCloudSynced
                ? 'Firestore Connected'
                : 'Cloud Ready'
              : 'Local Mode'}
          </span>
        </div>
        {user && !isCloudSynced && (
          <button
            onClick={() => seedInitialDataToCloud()}
            className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold underline"
          >
            Push to DB
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-3 px-2.5 space-y-1 overflow-y-auto">
        <div className="px-2 pb-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          Portfolio Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeNav === item.id || (item.id === 'portfolio' && activeNav === 'item-detail');
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    isActive
                      ? 'bg-blue-700/80 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
              {item.soon && (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-slate-800 text-slate-400 border border-slate-700/50">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Settings & User / Auth */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <button
          id="nav-settings"
          onClick={() => setActiveNav('settings')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
            activeNav === 'settings'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        {/* Auth / User profile section */}
        <div className="pt-2 border-t border-slate-800/60">
          {authLoading ? (
            <div className="px-2 py-1 text-xs text-slate-500">Checking auth...</div>
          ) : user ? (
            <div className="flex items-center justify-between px-2 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-slate-600 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs border border-slate-600 shrink-0">
                    {user.email ? user.email.slice(0, 2).toUpperCase() : 'US'}
                  </div>
                )}
                <div className="leading-tight truncate">
                  <div className="text-white text-xs font-medium truncate">
                    {user.displayName || user.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {user.email || 'Cloud User'}
                  </div>
                </div>
              </div>
              <button
                id="btn-sign-out"
                onClick={() => signOut()}
                title="Sign Out"
                className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="btn-sign-in"
              onClick={() => signInWithGoogle()}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
