import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Info,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Header } from '../components/Header';
import { formatGBPCompact } from '../lib/valueCalculations';

export const OverviewView: React.FC = () => {
  const {
    metrics,
    gaps,
    compositionByType,
    investmentByDepartment,
    investmentByPlatform,
    benefitByCategory,
    benefitByDepartment,
    compositionByLifecycle,
    applyGapFilter,
    setActiveNav,
    setFilters,
    goToPortfolioView,
  } = usePortfolio();

  const [compositionTab, setCompositionTab] = useState<'type' | 'department' | 'platform'>('type');
  const [valueTab, setValueTab] = useState<'category' | 'department'>('category');

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-y-auto">
      <Header title="Portfolio Overview" />

      <div className="p-6 max-w-7xl w-full mx-auto space-y-5">
        {/* Top 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1 */}
          <div
            id="kpi-total-initiatives"
            onClick={() => goToPortfolioView('all')}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
              <span>Total AI Initiatives</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">
              {metrics.totalInitiatives}
            </div>
            <div className="text-xs text-slate-500 mt-2 font-medium">
              Across all platforms, agents and initiatives
            </div>
          </div>

          {/* KPI 2: Investment */}
          <div
            id="kpi-annual-cost"
            onClick={() => goToPortfolioView('investment')}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
              <span>Total estimated annual investment</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">
              {formatGBPCompact(metrics.annualEstimatedCost)}
            </div>
            <div className="text-xs text-slate-500 mt-2 font-medium">
              {formatGBPCompact(metrics.confirmedCost)} confirmed |{' '}
              {formatGBPCompact(metrics.estimatedCost)} estimated
            </div>
          </div>

          {/* KPI 3 */}
          <div
            id="kpi-production-agents"
            onClick={() => {
              setFilters((prev) => ({ ...prev, type: 'Agent', lifecycleStage: 'Production' }));
              setActiveNav('portfolio');
            }}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
              <span>Production agents</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">
              {metrics.productionAgents}
            </div>
            <div className="text-xs text-slate-500 mt-2 font-medium">
              Agents and embedded AI live in production
            </div>
          </div>

          {/* KPI 4: Estimated annual benefit (replaces "Value evidence available") */}
          <div
            id="kpi-estimated-benefit"
            onClick={() => goToPortfolioView('value')}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
              <span>Estimated annual benefit</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">
              {formatGBPCompact(metrics.totalEstimatedAnnualBenefit)}
            </div>
            <div className="text-xs text-slate-500 mt-2 font-medium">
              {formatGBPCompact(metrics.validatedAnnualBenefit)} validated |{' '}
              {formatGBPCompact(metrics.estimatedOnlyAnnualBenefit)} estimated
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
              <Info className="w-3 h-3 shrink-0" />
              <span>
                {metrics.benefitContributingCount} of {metrics.totalInitiatives} initiatives quantified · estimated, not guaranteed or realised
              </span>
            </div>
          </div>
        </div>

        {/* Row 1: Portfolio composition (Investing) | Management attention */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Portfolio Composition - covers "what are we investing in" */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">What are we investing in?</h2>
                <p className="text-xs text-slate-500">Portfolio composition and investment distribution</p>
              </div>

              {/* Pill Tabs */}
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium">
                <button
                  onClick={() => setCompositionTab('type')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    compositionTab === 'type'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  By AI type
                </button>
                <button
                  onClick={() => setCompositionTab('department')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    compositionTab === 'department'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  By department
                </button>
                <button
                  onClick={() => setCompositionTab('platform')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    compositionTab === 'platform'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  By platform
                </button>
              </div>
            </div>

            {/* Tab: By AI Type (Interactive Donut) */}
            {compositionTab === 'type' && (
              <div className="pt-6 flex flex-col md:flex-row items-center justify-around gap-5 flex-1">
                <DonutChart
                  data={compositionByType}
                  total={metrics.totalInitiatives}
                  onSliceClick={(type) => {
                    const mappedType = type === 'Experiments' ? 'Experiment' : type.replace(/s$/, '');
                    setFilters((prev) => ({ ...prev, type: mappedType }));
                    setActiveNav('portfolio');
                  }}
                />

                <div className="flex-1 w-full space-y-2.5 max-w-xs">
                  {compositionByType.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => {
                        const mappedType = item.type === 'Experiments' ? 'Experiment' : item.type.replace(/s$/, '');
                        setFilters((prev) => ({ ...prev, type: mappedType }));
                        setActiveNav('portfolio');
                      }}
                      className="w-full flex items-center justify-between text-xs py-1 px-2 rounded-md hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-700 font-medium group-hover:text-blue-600 transition-colors">
                          {item.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{item.count}</span>
                        <span className="text-slate-400 text-[11px] w-10 text-right">({item.percentage}%)</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: By Department */}
            {compositionTab === 'department' && (
              <div className="pt-6 space-y-3.5 flex-1">
                {investmentByDepartment.map((dept) => {
                  const maxCost = investmentByDepartment[0]?.cost || 1;
                  const pct = Math.round((dept.cost / maxCost) * 100);
                  return (
                    <div
                      key={dept.department}
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, department: dept.department }));
                        setActiveNav('portfolio');
                      }}
                      className="group cursor-pointer"
                    >
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700 group-hover:text-blue-600">
                          {dept.department}
                        </span>
                        <div className="flex gap-2">
                          <span className="text-slate-400 font-normal">{dept.count} items</span>
                          <span className="font-semibold text-slate-900">{formatGBPCompact(dept.cost)}</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500 group-hover:bg-blue-700"
                          style={{ width: `${Math.max(pct, 6)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab: By Platform */}
            {compositionTab === 'platform' && (
              <div className="pt-6 space-y-3.5 flex-1">
                {investmentByPlatform.length === 0 && (
                  <p className="text-xs text-slate-400">No platform-attributed investment yet.</p>
                )}
                {investmentByPlatform.map((plt) => {
                  const maxCost = investmentByPlatform[0]?.cost || 1;
                  const pct = Math.round((plt.cost / maxCost) * 100);
                  return (
                    <div
                      key={plt.platform}
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, platform: plt.platform }));
                        setActiveNav('portfolio');
                      }}
                      className="group cursor-pointer"
                    >
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700 group-hover:text-blue-600">{plt.platform}</span>
                        <div className="flex gap-2">
                          <span className="text-slate-400 font-normal">{plt.count} items</span>
                          <span className="font-semibold text-slate-900">{formatGBPCompact(plt.cost)}</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500 group-hover:bg-indigo-700"
                          style={{ width: `${Math.max(pct, 6)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Management attention - covers "where does attention need to be focused" */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Where does management attention need to be focused?</h2>
                  <p className="text-xs text-slate-500">Information gaps affecting portfolio defensibility</p>
                </div>
                <button
                  id="view-all-gaps-btn"
                  onClick={() => applyGapFilter('all-gaps')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline shrink-0"
                >
                  View all
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 mt-2">
                <AttentionRow
                  id="gap-no-value-hypothesis"
                  label="Investment without value hypothesis"
                  count={gaps.noValueHypothesis.length}
                  onClick={() => applyGapFilter('no-value-hypothesis')}
                />
                <AttentionRow
                  id="gap-no-owner"
                  label="No business owner"
                  count={gaps.missingOwner.length}
                  onClick={() => applyGapFilter('no-owner')}
                />
                <AttentionRow
                  id="gap-estimated-cost"
                  label="Estimated cost only"
                  count={gaps.estimatedCostOnly.length}
                  onClick={() => applyGapFilter('estimated-cost-only')}
                />
                <AttentionRow
                  id="gap-missing-outcome"
                  label="No intended outcome"
                  count={gaps.missingOutcome.length}
                  onClick={() => applyGapFilter('no-outcome')}
                />
                <AttentionRow
                  id="gap-no-platform"
                  label="No platform relationship"
                  count={gaps.noPlatform.length}
                  onClick={() => applyGapFilter('no-platform')}
                />
                <AttentionRow
                  id="gap-not-updated-90-days"
                  label="Overdue measurement update"
                  count={gaps.notUpdated90Days.length}
                  onClick={() => applyGapFilter('not-updated-90-days')}
                />
              </div>
            </div>

            <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
              <span>
                Resolving these gaps directly increases AI governance audit scores and defensibility for executive committees.
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Value & outcomes (Achieving) | Lifecycle progress (Progressing) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Value & Outcomes */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">What are we trying to achieve?</h2>
                <p className="text-xs text-slate-500">Estimated annual benefit by category and department</p>
              </div>
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium">
                <button
                  onClick={() => setValueTab('category')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    valueTab === 'category'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  By category
                </button>
                <button
                  onClick={() => setValueTab('department')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    valueTab === 'department'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  By department
                </button>
              </div>
            </div>

            <div
              onClick={() => goToPortfolioView('value')}
              className="mt-4 mb-1 p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors group"
            >
              <span>
                <strong>{metrics.initiativesWithValueHypothesis}</strong> of {metrics.totalInitiatives} initiatives have a
                documented value hypothesis
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-600 shrink-0" />
            </div>

            <div className="pt-4 space-y-3.5 flex-1">
              {(valueTab === 'category' ? benefitByCategory : benefitByDepartment).length === 0 && (
                <p className="text-xs text-slate-400">No quantified benefit yet.</p>
              )}
              {valueTab === 'category' &&
                benefitByCategory.map((cat) => {
                  const maxBenefit = benefitByCategory[0]?.benefit || 1;
                  const pct = Math.round((cat.benefit / maxBenefit) * 100);
                  return (
                    <div key={cat.category}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">{cat.category}</span>
                        <div className="flex gap-2">
                          <span className="text-slate-400 font-normal">{cat.count} initiatives</span>
                          <span className="font-semibold text-slate-900">{formatGBPCompact(cat.benefit)}</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 6)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {valueTab === 'department' &&
                benefitByDepartment.map((dept) => {
                  const maxBenefit = benefitByDepartment[0]?.benefit || 1;
                  const pct = Math.round((dept.benefit / maxBenefit) * 100);
                  return (
                    <div
                      key={dept.department}
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, department: dept.department }));
                        goToPortfolioView('value');
                      }}
                      className="group cursor-pointer"
                    >
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700 group-hover:text-blue-600">{dept.department}</span>
                        <div className="flex gap-2">
                          <span className="text-slate-400 font-normal">{dept.count} initiatives</span>
                          <span className="font-semibold text-slate-900">{formatGBPCompact(dept.benefit)}</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 6)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>Figures reflect estimated and validated value hypotheses only. Initiatives without a quantified benefit are excluded, not counted as £0.</span>
            </div>
          </div>

          {/* Right: Lifecycle progress */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">What is progressing?</h2>
              <p className="text-xs text-slate-500">Delivery lifecycle stage - not a measure of value performance</p>
            </div>

            <div className="pt-6 space-y-3.5 flex-1">
              {compositionByLifecycle.map((stage) => {
                let barColor = 'bg-slate-400';
                if (stage.stage === 'Production') barColor = 'bg-emerald-500';
                else if (stage.stage === 'Development' || stage.stage === 'In progress') barColor = 'bg-blue-500';
                else if (stage.stage === 'Pilot') barColor = 'bg-amber-500';
                else if (stage.stage === 'Evaluation') barColor = 'bg-purple-500';

                return (
                  <div
                    key={stage.stage}
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, lifecycleStage: stage.stage }));
                      setActiveNav('portfolio');
                    }}
                    className="group cursor-pointer"
                  >
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 group-hover:text-blue-600">{stage.stage}</span>
                      <div className="flex gap-2">
                        <span className="font-semibold text-slate-900">{stage.count} items</span>
                        <span className="text-slate-400">({stage.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(stage.percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>A Production initiative may still have no validated benefit - check the Value & Outcomes panel above.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AttentionRow: React.FC<{ id: string; label: string; count: number; onClick: () => void }> = ({
  id,
  label,
  count,
  onClick,
}) => (
  <button
    id={id}
    onClick={onClick}
    className="w-full py-3 px-2 flex items-center justify-between text-xs hover:bg-slate-50 rounded-lg transition-colors group text-left"
  >
    <span className="text-slate-700 font-medium group-hover:text-blue-600">{label}</span>
    <div className="flex items-center gap-2">
      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
        {count}
      </span>
      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
    </div>
  </button>
);

const DonutChart: React.FC<{
  data: { type: string; count: number; percentage: number; color: string }[];
  total: number;
  onSliceClick: (type: string) => void;
}> = ({ data, total, onSliceClick }) => {
  let accumulatedAngle = 0;
  const radius = 68;
  const strokeWidth = 26;
  const center = 85;

  return (
    <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 170 170" className="w-full h-full transform -rotate-90">
        {data.map((item, idx) => {
          const angle = (item.count / (total || 1)) * 360;
          const startAngle = accumulatedAngle;
          const endAngle = accumulatedAngle + angle;
          accumulatedAngle = endAngle;
          if (item.count === 0) return null;

          const startRad = ((startAngle - 90) * Math.PI) / 180;
          const endRad = ((endAngle - 90) * Math.PI) / 180;
          const x1 = center + radius * Math.cos(startRad);
          const y1 = center + radius * Math.sin(startRad);
          const x2 = center + radius * Math.cos(endRad);
          const y2 = center + radius * Math.sin(endRad);
          const largeArcFlag = angle > 180 ? 1 : 0;
          const pathData = [`M ${x1} ${y1}`, `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`].join(' ');

          return (
            <path
              key={idx}
              d={pathData}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              className="transition-all duration-300 hover:opacity-80 cursor-pointer"
              onClick={() => onSliceClick(item.type)}
            >
              <title>{`${item.type}: ${item.count} (${item.percentage}%)`}</title>
            </path>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-2xl font-bold text-slate-900 leading-none">{total}</span>
        <span className="text-[11px] text-slate-400 font-medium mt-0.5">initiatives</span>
      </div>
    </div>
  );
};
