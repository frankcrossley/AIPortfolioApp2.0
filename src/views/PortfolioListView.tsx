import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronRight,
  Filter,
  X,
  Server,
  Layers,
  Bot,
  Sparkles,
  Kanban,
  Beaker,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Header } from '../components/Header';
import { StatusBadge, TypeBadge, ValueStatusBadge, ConfidenceBadge } from '../components/StatusBadge';
import { EstateItem, EstateItemType, PortfolioViewMode } from '../types';
import { formatGBPCompact, isQuantified } from '../lib/valueCalculations';

const VIEW_LABELS: Record<PortfolioViewMode, string> = {
  all: 'All Items',
  investment: 'Investment View',
  value: 'Value View',
  quality: 'Data Quality View',
};

export const PortfolioListView: React.FC = () => {
  const {
    items,
    filters,
    setFilters,
    resetFilters,
    viewItem,
    portfolioViewMode,
    setPortfolioViewMode,
  } = usePortfolio();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Extract unique departments and owners for dropdowns
  const departments = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.department) set.add(i.department);
    });
    return Array.from(set).sort();
  }, [items]);

  const owners = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.businessOwner) set.add(i.businessOwner);
    });
    return Array.from(set).sort();
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesSubtitle = item.subtitle?.toLowerCase().includes(query) ?? false;
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesOwner = item.businessOwner?.toLowerCase().includes(query) ?? false;
        const matchesDept = item.department.toLowerCase().includes(query);
        if (!matchesName && !matchesSubtitle && !matchesDesc && !matchesOwner && !matchesDept) {
          return false;
        }
      }

      // Type
      if (filters.type && item.type !== filters.type) {
        return false;
      }

      // Department
      if (filters.department && item.department !== filters.department) {
        return false;
      }

      // Lifecycle stage
      if (filters.lifecycleStage && item.lifecycleStage !== filters.lifecycleStage) {
        return false;
      }

      // Status
      if (filters.status && item.status !== filters.status) {
        return false;
      }

      // Owner
      if (filters.owner && item.businessOwner !== filters.owner) {
        return false;
      }

      // Platform
      if (filters.platform && item.platformId !== filters.platform && item.platformName !== filters.platform) {
        return false;
      }

      // Specific Gap filter
      if (filters.gapType) {
        if (filters.gapType === 'no-owner' && item.businessOwner && item.businessOwner.trim() !== '') return false;
        if (filters.gapType === 'estimated-cost-only' && !item.isCostEstimated) return false;
        if (filters.gapType === 'no-outcome' && item.intendedOutcome && item.intendedOutcome.trim() !== '') return false;
        if (filters.gapType === 'no-platform' && (item.type !== 'Agent' || item.platformId || item.platformName)) return false;
        if (filters.gapType === 'not-updated-90-days' && (item.lastUpdatedDaysAgo ?? 0) < 90) return false;
        if (
          filters.gapType === 'no-value-hypothesis' &&
          item.valueHypothesis &&
          item.valueHypothesis.status !== 'Not defined'
        ) {
          return false;
        }
        if (filters.gapType === 'all-gaps') {
          const hasGap =
            !item.businessOwner ||
            item.isCostEstimated ||
            !item.intendedOutcome ||
            (item.type === 'Agent' && !item.platformId && !item.platformName) ||
            (item.lastUpdatedDaysAgo ?? 0) >= 90 ||
            !item.valueHypothesis ||
            item.valueHypothesis.status === 'Not defined';
          if (!hasGap) return false;
        }
      }

      return true;
    });
  }, [items, filters]);

  // Reset pagination when filter or view changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters, portfolioViewMode]);

  // Paginated records
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const getItemIcon = (type: EstateItemType) => {
    switch (type) {
      case 'Platform':
        return <Server className="w-4 h-4 text-blue-600" />;
      case 'Application':
        return <Layers className="w-4 h-4 text-sky-600" />;
      case 'Agent':
        return <Bot className="w-4 h-4 text-indigo-600" />;
      case 'Embedded AI':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'Initiative':
        return <Kanban className="w-4 h-4 text-purple-600" />;
      case 'Experiment':
        return <Beaker className="w-4 h-4 text-amber-600" />;
    }
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.type) ||
    Boolean(filters.department) ||
    Boolean(filters.lifecycleStage) ||
    Boolean(filters.status) ||
    Boolean(filters.owner) ||
    Boolean(filters.platform) ||
    Boolean(filters.gapType);

  const ownerCell = (item: EstateItem) =>
    item.businessOwner ? (
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[10px] flex items-center justify-center shrink-0">
          {item.businessOwner.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </span>
        <span className="font-medium text-slate-800 truncate max-w-[120px]">{item.businessOwner}</span>
      </div>
    ) : (
      <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
        Unassigned
      </span>
    );

  const costCell = (item: EstateItem) =>
    item.annualCost !== undefined ? (
      <span className="font-semibold text-slate-900">
        {formatGBPCompact(item.annualCost)}
        {item.isCostEstimated && <span className="text-[10px] text-slate-400 font-normal ml-1">(est.)</span>}
      </span>
    ) : (
      <span className="text-slate-400 text-xs font-normal">Not provided</span>
    );

  const missingBadge = (isMissing: boolean) =>
    isMissing ? (
      <span className="inline-flex items-center gap-1 text-amber-600">
        <XCircle className="w-3.5 h-3.5" /> Missing
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-emerald-600">
        <CheckCircle2 className="w-3.5 h-3.5" /> Present
      </span>
    );

  type Column = { header: string; align?: 'right'; render: (item: EstateItem) => React.ReactNode };

  const columns: Column[] = useMemo(() => {
    if (portfolioViewMode === 'investment') {
      return [
        { header: 'Type', render: (item) => <TypeBadge type={item.type} /> },
        { header: 'Department', render: (item) => <span className="font-medium text-slate-700">{item.department}</span> },
        { header: 'Annual cost', render: costCell },
        {
          header: 'Cost confidence',
          render: (item) =>
            item.annualCost === undefined ? (
              <span className="text-slate-400">Not provided</span>
            ) : item.isCostEstimated ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80">Estimated</span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">Confirmed</span>
            ),
        },
        { header: 'Platform', render: (item) => <span className="text-slate-700">{item.platformName || '—'}</span> },
        { header: 'Lifecycle', render: (item) => <StatusBadge status={item.lifecycleStage} /> },
      ];
    }

    if (portfolioViewMode === 'value') {
      return [
        { header: 'Department', render: (item) => <span className="font-medium text-slate-700">{item.department}</span> },
        {
          header: 'Intended outcome',
          render: (item) => (
            <span className="text-slate-700 line-clamp-2 max-w-xs block">
              {item.outcome?.name || item.intendedOutcome || <span className="text-slate-400">Not defined</span>}
            </span>
          ),
        },
        {
          header: 'Estimated annual benefit',
          render: (item) =>
            isQuantified(item.valueHypothesis) ? (
              <span className="font-semibold text-slate-900">{formatGBPCompact(item.valueHypothesis!.estimatedAnnualBenefit)}</span>
            ) : (
              <span className="text-slate-400">Not quantified</span>
            ),
        },
        {
          header: 'Benefit status',
          render: (item) => <ValueStatusBadge status={item.valueHypothesis?.status || 'Not defined'} />,
        },
        { header: 'Confidence', render: (item) => <ConfidenceBadge level={item.valueHypothesis?.confidenceLevel} /> },
        { header: 'Owner', render: ownerCell },
      ];
    }

    if (portfolioViewMode === 'quality') {
      return [
        { header: 'Missing owner', render: (item) => missingBadge(!item.businessOwner) },
        { header: 'Missing cost', render: (item) => missingBadge(item.annualCost === undefined) },
        { header: 'Missing outcome', render: (item) => missingBadge(!item.intendedOutcome && !item.outcome) },
        {
          header: 'Missing platform link',
          render: (item) => missingBadge(item.type === 'Agent' && !item.platformId && !item.platformName),
        },
        {
          header: 'Last updated',
          render: (item) => (
            <span className={(item.lastUpdatedDaysAgo ?? 0) >= 90 ? 'text-amber-600 font-medium' : 'text-slate-500'}>
              {item.lastUpdated}
            </span>
          ),
        },
      ];
    }

    // 'all' - default readable view
    return [
      { header: 'Type', render: (item) => <TypeBadge type={item.type} /> },
      { header: 'Department', render: (item) => <span className="font-medium text-slate-700">{item.department}</span> },
      { header: 'Owner', render: ownerCell },
      { header: 'Lifecycle', render: (item) => <StatusBadge status={item.lifecycleStage} /> },
      { header: 'Annual cost', render: costCell },
      { header: 'Last updated', render: (item) => <span className="text-slate-500 text-[11px]">{item.lastUpdated}</span> },
    ];
  }, [portfolioViewMode]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-y-auto">
      <Header title="AI Portfolio" />

      <div className="p-8 max-w-7xl w-full mx-auto space-y-5">
        {/* Active Gap Banner if filtered by a gap */}
        {filters.gapType && (
          <div className="flex items-center justify-between p-3.5 bg-blue-50/80 border border-blue-200 rounded-lg text-xs text-blue-900">
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>
                Filtered by Information Gap:{' '}
                <strong className="capitalize">
                  {filters.gapType.replace(/-/g, ' ')}
                </strong>{' '}
                ({filteredItems.length} matching items)
              </span>
            </div>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, gapType: undefined }))}
              className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 hover:underline"
            >
              Clear gap filter
            </button>
          </div>
        )}

        {/* Portfolio view selector */}
        <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium">
          {(Object.keys(VIEW_LABELS) as PortfolioViewMode[]).map((mode) => (
            <button
              key={mode}
              id={`portfolio-view-${mode}`}
              onClick={() => setPortfolioViewMode(mode)}
              className={`px-3.5 py-1.5 rounded-md transition-all ${
                portfolioViewMode === mode
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {VIEW_LABELS[mode]}
            </button>
          ))}
        </div>

        {/* Filter Controls Card matching screenshot */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
          {/* Top Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="portfolio-search-input"
              type="text"
              placeholder="Search by name, owner or description..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {filters.search && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
            {/* AI Type */}
            <select
              id="filter-type-select"
              value={filters.type}
              onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="">AI type: All</option>
              <option value="Platform">Platform</option>
              <option value="Agent">Agent</option>
              <option value="Application">Application</option>
              <option value="Embedded AI">Embedded AI</option>
              <option value="Initiative">Initiative</option>
              <option value="Experiment">Experiment</option>
            </select>

            {/* Department */}
            <select
              id="filter-dept-select"
              value={filters.department}
              onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="">Department: All</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Lifecycle stage */}
            <select
              id="filter-lifecycle-select"
              value={filters.lifecycleStage}
              onChange={(e) => setFilters((prev) => ({ ...prev, lifecycleStage: e.target.value }))}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="">Lifecycle stage: All</option>
              <option value="Production">Production</option>
              <option value="Development">Development</option>
              <option value="Pilot">Pilot</option>
              <option value="In progress">In progress</option>
              <option value="Evaluation">Evaluation</option>
              <option value="Ideation">Ideation</option>
            </select>

            {/* Owner */}
            <select
              id="filter-owner-select"
              value={filters.owner}
              onChange={(e) => setFilters((prev) => ({ ...prev, owner: e.target.value }))}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="">Owner: All</option>
              {owners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>

            {/* Reset / Clear */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium hover:bg-rose-50 rounded-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset filters</span>
              </button>
            )}

            <div className="ml-auto text-xs text-slate-400 font-medium">
              Showing {filteredItems.length} of {items.length} items
            </div>
          </div>
        </div>

        {/* Enterprise Data Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Name</th>
                  {columns.map((col) => (
                    <th key={col.header} className={`py-3.5 px-3 font-semibold ${col.align === 'right' ? 'text-right' : ''}`}>
                      {col.header}
                    </th>
                  ))}
                  <th className="py-3.5 px-4 font-semibold text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="py-12 text-center text-slate-500">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Filter className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-800">No items match your filters</p>
                        <p className="text-xs text-slate-500">
                          Try adjusting your search terms or clearing current filter selections.
                        </p>
                        <button
                          onClick={resetFilters}
                          className="mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => (
                    <tr
                      key={item.id}
                      id={`portfolio-row-${item.id}`}
                      onClick={() => viewItem(item.id)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Name & Subtitle (always shown) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 group-hover:border-blue-300 transition-colors">
                            {getItemIcon(item.type)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                              {item.name}
                            </div>
                            {item.subtitle && (
                              <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {columns.map((col) => (
                        <td key={col.header} className={`py-3.5 px-3 ${col.align === 'right' ? 'text-right' : ''}`}>
                          {col.render(item)}
                        </td>
                      ))}

                      {/* View Action link (always shown) */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-700 group-hover:underline">
                          View
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredItems.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length}
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
