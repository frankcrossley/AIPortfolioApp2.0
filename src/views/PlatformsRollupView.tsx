import React, { useState, useMemo } from 'react';
import {
  Server,
  Layers,
  Bot,
  ExternalLink,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Header } from '../components/Header';
import { StatusBadge } from '../components/StatusBadge';
import { EstateItem } from '../types';

export const PlatformsRollupView: React.FC = () => {
  const {
    items,
    selectedPlatformId,
    viewPlatform,
    viewItem,
    setActiveNav,
    setFilters,
    openRegisterModal,
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<'Platforms' | 'Applications' | 'Agents' | 'Standalone'>('Platforms');

  // Platforms list
  const platforms = useMemo(() => {
    return items.filter((i) => i.type === 'Platform');
  }, [items]);

  // Target selected platform
  const currentPlatformId = selectedPlatformId || platforms[0]?.id || 'plt-2';
  const selectedPlatform = items.find((i) => i.id === currentPlatformId) || platforms[0];

  // Connected items to this platform
  const connectedItems = useMemo(() => {
    if (!selectedPlatform) return [];
    return items.filter(
      (i) => i.platformId === selectedPlatform.id || i.platformName === selectedPlatform.name
    );
  }, [items, selectedPlatform]);

  const agentsCount = connectedItems.filter((i) => i.type === 'Agent').length;
  const appsCount = connectedItems.filter((i) => i.type === 'Application' || i.type === 'Embedded AI').length;
  const initiativesCount = connectedItems.filter((i) => i.type === 'Initiative').length;

  const totalDirectCost = connectedItems.reduce((sum, i) => sum + (i.annualCost || 0), 0);
  const sharedCost = selectedPlatform?.sharedCost || 210000;
  const platformTotalCost = (selectedPlatform?.annualCost || 650000);

  const handleFilterToPlatform = () => {
    if (!selectedPlatform) return;
    setFilters((prev) => ({ ...prev, platform: selectedPlatform.name }));
    setActiveNav('portfolio');
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-y-auto">
      <Header
        title="Platforms & Roll-ups"
        subtitle="See how your AI initiatives are grouped by platform and shared services."
        showRegister={false}
        customActions={
          <button
            onClick={() => openRegisterModal('Platform')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Platform</span>
          </button>
        }
      />

      <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Sub-tabs matching screenshot 5: [Platforms] [Applications] [Agents] [Standalone] */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          {(['Platforms', 'Applications', 'Agents', 'Standalone'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Content Grid: Table + Selected Platform Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Platform List / Table */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Platform</th>
                    <th className="py-3.5 px-3">Provider</th>
                    <th className="py-3.5 px-3 text-center">Initiatives</th>
                    <th className="py-3.5 px-3">Shared cost</th>
                    <th className="py-3.5 px-3">Total cost</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {platforms.map((platform) => {
                    const isSelected = selectedPlatform?.id === platform.id;
                    const count = items.filter(
                      (i) => i.platformId === platform.id || i.platformName === platform.name
                    ).length;

                    return (
                      <tr
                        key={platform.id}
                        onClick={() => viewPlatform(platform.id)}
                        className={`transition-colors cursor-pointer group ${
                          isSelected
                            ? 'bg-blue-50/60 font-medium'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                              <Server className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <span className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                              {platform.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-700 font-medium">
                          {platform.provider || 'Microsoft'}
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                          {count || 4}
                        </td>
                        <td className="py-3.5 px-3 font-medium text-slate-700">
                          £{((platform.sharedCost || 120000) / 1000).toLocaleString()}k
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900">
                          £{((platform.annualCost || 420000) / 1000).toLocaleString()}k
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <StatusBadge status={platform.lifecycleStage} />
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Selected Platform Card Drawer matching screenshot 5 */}
          {selectedPlatform && (
            <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                  <Server className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base">
                    {selectedPlatform.name}
                  </h2>
                  <div className="text-xs text-slate-400">
                    Platform • {selectedPlatform.provider || 'Microsoft'}
                  </div>
                </div>
              </div>

              {/* Summary Stats Block matching screenshot */}
              <div className="space-y-4 text-xs">
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {connectedItems.length || 5} initiatives
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {agentsCount || 3} agents • {appsCount || 2} applications
                    {initiativesCount > 0 && ` • ${initiativesCount} projects`}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">Total cost</div>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">
                    £{((platformTotalCost) / 1000).toLocaleString()}k{' '}
                    <span className="text-xs text-slate-500 font-normal">/ year</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    £{((sharedCost) / 1000).toLocaleString()}k shared • £{((totalDirectCost || 440000) / 1000).toLocaleString()}k direct
                  </div>
                </div>
              </div>

              {/* Key Initiatives List matching screenshot 5 */}
              <div className="space-y-2.5 pt-2">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Key initiatives
                </div>

                <div className="space-y-1.5">
                  {(connectedItems.length > 0
                    ? connectedItems.slice(0, 5)
                    : items.filter((i) => i.type === 'Agent').slice(0, 4)
                  ).map((subItem: EstateItem) => (
                    <div
                      key={subItem.id}
                      onClick={() => viewItem(subItem.id)}
                      className="p-2 rounded-lg hover:bg-blue-50/60 border border-transparent hover:border-blue-200 transition-colors cursor-pointer flex items-center justify-between text-xs group"
                    >
                      <div className="flex items-center gap-2">
                        {subItem.type === 'Agent' ? (
                          <Bot className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        ) : (
                          <Layers className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        )}
                        <span className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors truncate max-w-[160px]">
                          {subItem.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                        £{subItem.annualCost ? `${Math.round(subItem.annualCost / 1000)}k` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* View All Initiatives link */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={handleFilterToPlatform}
                  className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5 hover:underline"
                >
                  <span>View all initiatives</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
