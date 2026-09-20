import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Server,
  Layers,
  Bot,
  Sparkles,
  ExternalLink,
  X,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { StatusBadge, TypeBadge } from '../components/StatusBadge';
import { EstateItem } from '../types';

const MAX_NODES_PER_TIER = 8;

export const EstateMapView: React.FC = () => {
  const { items, relationships, viewItem, setActiveNav } = usePortfolio();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeGrouping, setActiveGrouping] = useState<'Technology' | 'Ownership' | 'Lifecycle'>('Technology');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('agt-1'); // Default select Customer Support Agent
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [lifecycleFilter, setLifecycleFilter] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expandedPlatforms, setExpandedPlatforms] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [edges, setEdges] = useState<
    { id: string; x1: number; y1: number; x2: number; y2: number; active: boolean }[]
  >([]);

  const departments = useMemo(() => Array.from(new Set(items.map((i) => i.department))).sort(), [items]);

  // Filter items based on search, category, department and lifecycle
  const filteredMapItems = useMemo(() => {
    return items.filter((item) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.name.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q) ||
          item.businessOwner?.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (departmentFilter && item.department !== departmentFilter) return false;
      if (lifecycleFilter && item.lifecycleStage !== lifecycleFilter) return false;

      if (selectedFilterCategory !== 'All') {
        if (selectedFilterCategory === 'Platforms' && item.type !== 'Platform') return false;
        if (selectedFilterCategory === 'Applications' && item.type !== 'Application') return false;
        if (selectedFilterCategory === 'Agents' && item.type !== 'Agent' && item.type !== 'Embedded AI') return false;
        if (selectedFilterCategory.startsWith('plt-') && item.platformId !== selectedFilterCategory && item.id !== selectedFilterCategory) {
          return false;
        }
      }

      return true;
    });
  }, [items, searchQuery, selectedFilterCategory, departmentFilter, lifecycleFilter]);

  // Platforms to show in top tier (respects active filters/search)
  const allPlatformNodes = useMemo(() => filteredMapItems.filter((i) => i.type === 'Platform'), [filteredMapItems]);
  const platformNodes = allPlatformNodes.slice(0, MAX_NODES_PER_TIER);

  // Agents + embedded AI to show in middle tier
  const allAgentNodes = useMemo(
    () => filteredMapItems.filter((i) => i.type === 'Agent' || i.type === 'Embedded AI'),
    [filteredMapItems]
  );
  const agentNodes = allAgentNodes.slice(0, MAX_NODES_PER_TIER);

  // Applications to show in bottom tier
  const allAppNodes = useMemo(() => filteredMapItems.filter((i) => i.type === 'Application'), [filteredMapItems]);
  const appNodes = allAppNodes.slice(0, MAX_NODES_PER_TIER);

  // Currently selected item for the side drawer
  const selectedNode = items.find((i) => i.id === selectedNodeId);

  // Connected nodes
  const connectedNodeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const ids = new Set<string>();
    ids.add(selectedNodeId);

    relationships.forEach((rel) => {
      if (rel.sourceId === selectedNodeId) ids.add(rel.targetId);
      if (rel.targetId === selectedNodeId) ids.add(rel.sourceId);
    });

    return ids;
  }, [selectedNodeId, relationships]);

  // Recompute connector positions whenever the rendered node set changes.
  // Measures actual DOM node positions instead of hand-drawn pixel paths,
  // so connectors stay correct for any filtered subset of the estate.
  useEffect(() => {
    const computeEdges = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const canvasRect = canvas.getBoundingClientRect();
      const newEdges: { id: string; x1: number; y1: number; x2: number; y2: number; active: boolean }[] = [];

      relationships.forEach((rel) => {
        const sourceEl = nodeRefs.current.get(rel.sourceId);
        const targetEl = nodeRefs.current.get(rel.targetId);
        if (!sourceEl || !targetEl) return;
        const s = sourceEl.getBoundingClientRect();
        const t = targetEl.getBoundingClientRect();

        newEdges.push({
          id: rel.id,
          x1: (s.left + s.width / 2 - canvasRect.left) / zoomLevel,
          y1: (s.top + s.height - canvasRect.top) / zoomLevel,
          x2: (t.left + t.width / 2 - canvasRect.left) / zoomLevel,
          y2: (t.top - canvasRect.top) / zoomLevel,
          active: connectedNodeIds.has(rel.sourceId) && connectedNodeIds.has(rel.targetId),
        });
      });

      setEdges(newEdges);
    };

    computeEdges();
    const raf = requestAnimationFrame(computeEdges);
    window.addEventListener('resize', computeEdges);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', computeEdges);
    };
    // filteredMapItems is memoized and fully determines the node slices below,
    // so depending on it (rather than the freshly-sliced arrays, which get a
    // new reference every render) avoids re-triggering this effect forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredMapItems, relationships, zoomLevel, connectedNodeIds]);

  const registerNodeRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.6), 1.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div
      ref={containerRef}
      className={`flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#f8fafc]' : ''
      }`}
    >
      {/* Header matching screenshot 2 */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Estate</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore how your AI initiatives, platforms and agents are connected.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, owner or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Department filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="">Department: All</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Lifecycle filter */}
            <select
              value={lifecycleFilter}
              onChange={(e) => setLifecycleFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="">Lifecycle: All</option>
              <option value="Production">Production</option>
              <option value="Development">Development</option>
              <option value="Pilot">Pilot</option>
              <option value="In progress">In progress</option>
              <option value="Evaluation">Evaluation</option>
              <option value="Ideation">Ideation</option>
              <option value="Retired">Retired</option>
            </select>

            {/* View Switcher pills: [Map view] [Table view] */}
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium">
              <button className="px-3 py-1 bg-white text-slate-900 font-semibold rounded-md shadow-xs">
                Map view
              </button>
              <button
                onClick={() => setActiveNav('portfolio')}
                className="px-3 py-1 text-slate-600 hover:text-slate-900 rounded-md transition-colors"
              >
                Table view
              </button>
            </div>
          </div>
        </div>

        {/* Secondary grouping pills matching screenshot 2: [Ownership] [Lifecycle] [Technology] */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1">View lens:</span>
          {(['Technology', 'Ownership', 'Lifecycle'] as const).map((lens) => (
            <button
              key={lens}
              onClick={() => setActiveGrouping(lens)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeGrouping === lens
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {lens}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Layout: Left Explorer Panel + Center Map Canvas + Right Inspector */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Left Side Hierarchy Filter matching screenshot 2 */}
        <div className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto p-3 text-xs select-none">
          <div className="px-2 py-1.5 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
            Estate Hierarchy
          </div>

          <div className="space-y-1 mt-1">
            <button
              onClick={() => setSelectedFilterCategory('All')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left font-medium transition-colors ${
                selectedFilterCategory === 'All'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>All Entities</span>
              <span className="text-slate-400 font-semibold text-[11px]">
                {items.length}
              </span>
            </button>

            {/* Platforms Category */}
            <div>
              <button
                onClick={() => setExpandedPlatforms(!expandedPlatforms)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  {expandedPlatforms ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>Platforms</span>
                </div>
                <span className="text-blue-600 font-bold text-[11px] bg-blue-50 px-1.5 py-0.2 rounded">
                  {items.filter((i) => i.type === 'Platform').length}
                </span>
              </button>

              {expandedPlatforms && (
                <div className="pl-4 pr-1 py-1 space-y-0.5">
                  {items
                    .filter((i) => i.type === 'Platform')
                    .map((plt) => {
                      const count = items.filter(
                        (i) => i.platformId === plt.id || i.platformName === plt.name
                      ).length;
                      return (
                        <button
                          key={plt.id}
                          onClick={() => {
                            setSelectedFilterCategory(plt.id);
                            setSelectedNodeId(plt.id);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded text-left text-[11px] transition-colors ${
                            selectedFilterCategory === plt.id
                              ? 'bg-blue-100/70 text-blue-900 font-semibold'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{plt.name}</span>
                          <span className="text-slate-400 text-[10px] ml-1">{count}</span>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Applications */}
            <button
              onClick={() => setSelectedFilterCategory('Applications')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left font-medium transition-colors ${
                selectedFilterCategory === 'Applications'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Applications</span>
              <span className="text-slate-500 font-semibold text-[11px]">
                {items.filter((i) => i.type === 'Application').length}
              </span>
            </button>

            {/* Agents */}
            <button
              onClick={() => setSelectedFilterCategory('Agents')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left font-medium transition-colors ${
                selectedFilterCategory === 'Agents'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Agents</span>
              <span className="text-slate-500 font-semibold text-[11px]">
                {items.filter((i) => i.type === 'Agent').length}
              </span>
            </button>

            {/* Other */}
            <button
              onClick={() => setSelectedFilterCategory('Other')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left font-medium transition-colors ${
                selectedFilterCategory === 'Other'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Other</span>
              <span className="text-slate-500 font-semibold text-[11px]">
                {items.filter((i) => i.type === 'Initiative' || i.type === 'Experiment').length}
              </span>
            </button>
          </div>

          <div className="mt-auto pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Click any node to inspect dependencies and metadata.
          </div>
        </div>

        {/* Center: Graph Canvas */}
        <div className="flex-1 bg-[#f8fafc] relative overflow-auto p-8 flex items-center justify-center min-h-[600px]">
          {(allPlatformNodes.length > MAX_NODES_PER_TIER ||
            allAgentNodes.length > MAX_NODES_PER_TIER ||
            allAppNodes.length > MAX_NODES_PER_TIER) && (
            <div className="absolute top-5 left-5 z-10 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-xs text-[11px] text-slate-500">
              Showing up to {MAX_NODES_PER_TIER} nodes per tier to keep the map readable.{' '}
              <button onClick={() => setActiveNav('portfolio')} className="text-blue-600 font-semibold hover:underline">
                See all in Table view
              </button>
            </div>
          )}

          {/* Zoom & Canvas Controls Overlay matching screenshot */}
          <div className="absolute top-5 right-5 z-10 flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
            <button
              onClick={() => handleZoom(0.1)}
              title="Zoom In"
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(-0.1)}
              title="Zoom Out"
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset View"
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5" />
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Interactive Tier Canvas */}
          <div
            ref={canvasRef}
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full max-w-4xl relative select-none py-6"
          >
            {/* Dynamically computed connecting edges - measured from actual node positions */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#94a3b8" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#2563eb" />
                </marker>
              </defs>

              {edges.map((edge) => {
                const midY = (edge.y1 + edge.y2) / 2;
                const d = `M ${edge.x1} ${edge.y1} C ${edge.x1} ${midY}, ${edge.x2} ${midY}, ${edge.x2} ${edge.y2}`;
                return (
                  <path
                    key={edge.id}
                    d={d}
                    fill="none"
                    stroke={edge.active ? '#2563eb' : '#cbd5e1'}
                    strokeWidth={edge.active ? 2.5 : 1.5}
                    strokeDasharray={edge.active ? 'none' : '4 3'}
                    markerEnd={edge.active ? 'url(#arrow-active)' : 'url(#arrow)'}
                  />
                );
              })}
            </svg>

            {/* TIER 1: PLATFORMS ROW */}
            <div
              className="relative z-10 grid gap-4 mb-20"
              style={{ gridTemplateColumns: `repeat(${Math.min(platformNodes.length, 4) || 1}, minmax(0, 1fr))` }}
            >
              {platformNodes.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center col-span-full">No platforms match the current filters.</p>
              )}
              {platformNodes.map((platform) => {
                const isSelected = selectedNodeId === platform.id;
                const isConnected = connectedNodeIds.has(platform.id);
                const relatedCount = items.filter(
                  (i) => i.platformId === platform.id || i.platformName === platform.name
                ).length;

                return (
                  <div
                    key={platform.id}
                    id={`map-node-${platform.id}`}
                    ref={registerNodeRef(platform.id)}
                    onClick={() => setSelectedNodeId(platform.id)}
                    className={`bg-white rounded-xl border p-3.5 shadow-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                        : isConnected
                        ? 'border-blue-300 bg-blue-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                        <Server className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {platform.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium truncate">
                          Platform • {platform.provider}
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between border-t border-slate-100 pt-2">
                      <span>{relatedCount || 3} initiatives</span>
                      <span className="text-blue-600 font-semibold">Active</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TIER 2: AGENTS ROW */}
            <div
              className="relative z-10 grid gap-4 mb-20"
              style={{ gridTemplateColumns: `repeat(${Math.min(agentNodes.length, 4) || 1}, minmax(0, 1fr))` }}
            >
              {agentNodes.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center col-span-full">No agents match the current filters.</p>
              )}
              {agentNodes.map((agent) => {
                const isSelected = selectedNodeId === agent.id;
                const isConnected = connectedNodeIds.has(agent.id);

                return (
                  <div
                    key={agent.id}
                    id={`map-node-${agent.id}`}
                    ref={registerNodeRef(agent.id)}
                    onClick={() => setSelectedNodeId(agent.id)}
                    className={`bg-white rounded-xl border p-3.5 shadow-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                        : isConnected
                        ? 'border-blue-300 bg-blue-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {agent.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium truncate">
                          Agent
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium flex items-center justify-between border-t border-slate-100 pt-2">
                      <span className="truncate">{agent.department}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TIER 3: APPLICATIONS ROW */}
            <div
              className="relative z-10 grid gap-6 max-w-2xl mx-auto"
              style={{ gridTemplateColumns: `repeat(${Math.min(appNodes.length, 3) || 1}, minmax(0, 1fr))` }}
            >
              {appNodes.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center col-span-full">No applications match the current filters.</p>
              )}
              {appNodes.map((app) => {
                const isSelected = selectedNodeId === app.id;
                const isConnected = connectedNodeIds.has(app.id);

                return (
                  <div
                    key={app.id}
                    id={`map-node-${app.id}`}
                    ref={registerNodeRef(app.id)}
                    onClick={() => setSelectedNodeId(app.id)}
                    className={`bg-white rounded-xl border p-3.5 shadow-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                        : isConnected
                        ? 'border-blue-300 bg-blue-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                        <Layers className="w-3.5 h-3.5 text-sky-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {app.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium truncate">
                          Application
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium border-t border-slate-100 pt-2 truncate">
                      {app.department}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map Legend Overlay matching screenshot */}
            <div className="absolute bottom-1 right-2 bg-white/95 border border-slate-200 rounded-lg p-2.5 shadow-xs text-[11px] flex items-center gap-4 text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Platform</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span>Application</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Agent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-slate-400 inline-block" />
                <span>Connection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Detail Inspector Drawer when node selected */}
        {selectedNode && (
          <div className="w-72 bg-white border-l border-slate-200 p-5 shrink-0 flex flex-col justify-between text-xs overflow-y-auto shadow-xs">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <TypeBadge type={selectedNode.type} />
                  <h3 className="font-bold text-slate-900 text-sm mt-1.5">
                    {selectedNode.name}
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {selectedNode.department}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5 border-t border-slate-100 pt-3">
                <div>
                  <span className="text-slate-400 text-[11px] block">Lifecycle Stage</span>
                  <StatusBadge status={selectedNode.lifecycleStage} />
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Business Owner</span>
                  <span className="font-medium text-slate-800">
                    {selectedNode.businessOwner || 'Unassigned'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Estimated Annual Cost</span>
                  <span className="font-semibold text-slate-900">
                    {selectedNode.annualCost ? `£${selectedNode.annualCost.toLocaleString()}` : 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Description</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-3">
                    {selectedNode.description}
                  </p>
                </div>
              </div>

              {/* Connected Relationships in Inspector */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block mb-2">
                  Connected Entities
                </span>
                <div className="space-y-1.5">
                  {relationships
                    .filter((r) => r.sourceId === selectedNode.id || r.targetId === selectedNode.id)
                    .map((rel) => {
                      const peerId = rel.sourceId === selectedNode.id ? rel.targetId : rel.sourceId;
                      const peer = items.find((i) => i.id === peerId);
                      if (!peer) return null;
                      return (
                        <button
                          key={rel.id}
                          onClick={() => setSelectedNodeId(peer.id)}
                          className="w-full p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200/80 rounded flex items-center justify-between text-left transition-colors"
                        >
                          <div className="truncate pr-1">
                            <span className="text-[10px] text-blue-600 font-semibold uppercase block">
                              {rel.type}
                            </span>
                            <span className="font-medium text-slate-800 text-[11px]">
                              {peer.name}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Bottom action button */}
            <div className="pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => viewItem(selectedNode.id)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Open Item Record</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
