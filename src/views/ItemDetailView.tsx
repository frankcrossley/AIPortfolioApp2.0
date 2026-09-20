import React, { useState, useEffect } from 'react';
import {
  Edit3,
  MoreHorizontal,
  Bot,
  Server,
  Layers,
  Sparkles,
  Kanban,
  Beaker,
  ExternalLink,
  DollarSign,
  Target,
  Clock,
  Trash2,
  Copy,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Header } from '../components/Header';
import { StatusBadge, TypeBadge } from '../components/StatusBadge';
import {
  EstateItem,
  EstateItemType,
  LifecycleStage,
  ItemStatus,
  Priority,
  DataClassification,
  ValueEvidenceStatus,
} from '../types';

interface ItemDetailViewProps {
  itemId: string;
}

export const ItemDetailView: React.FC<ItemDetailViewProps> = ({ itemId }) => {
  const {
    items,
    relationships,
    viewItem,
    viewPlatform,
    setActiveNav,
    deleteItem,
    showToast,
    updateItem,
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<'overview' | 'cost' | 'outcomes' | 'relationships' | 'history'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Find target item
  const item: EstateItem | undefined = items.find((i) => i.id === itemId) || items.find((i) => i.id === 'agt-1') || items[0];

  // Editable state
  const [formData, setFormData] = useState({
    name: item?.name || '',
    subtitle: item?.subtitle || '',
    description: item?.description || '',
    department: item?.department || '',
    businessOwner: item?.businessOwner || '',
    technicalOwner: item?.technicalOwner || '',
    businessFunction: item?.businessFunction || '',
    priority: item?.priority || 'High',
    annualCost: item?.annualCost || 0,
    devCost: item?.devCost || 0,
    opsCost: item?.opsCost || 0,
    sharedCost: item?.sharedCost || 0,
    intendedOutcome: item?.intendedOutcome || '',
    valueEvidenceStatus: item?.valueEvidenceStatus || 'Documented',
    lifecycleStage: item?.lifecycleStage || 'Production',
    status: item?.status || 'Active',
    dataClassification: item?.dataClassification || 'Internal',
  });

  // Sync formData whenever target item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        subtitle: item.subtitle || '',
        description: item.description || '',
        department: item.department || '',
        businessOwner: item.businessOwner || '',
        technicalOwner: item.technicalOwner || '',
        businessFunction: item.businessFunction || '',
        priority: item.priority || 'High',
        annualCost: item.annualCost || 0,
        devCost: item.devCost || 0,
        opsCost: item.opsCost || 0,
        sharedCost: item.sharedCost || 0,
        intendedOutcome: item.intendedOutcome || '',
        valueEvidenceStatus: item.valueEvidenceStatus || 'Documented',
        lifecycleStage: item.lifecycleStage || 'Production',
        status: item.status || 'Active',
        dataClassification: item.dataClassification || 'Internal',
      });
      setIsEditing(false);
    }
  }, [item?.id]);

  if (!item) {
    return (
      <div className="flex-1 p-8 text-center text-slate-500">
        Item not found.{' '}
        <button onClick={() => setActiveNav('portfolio')} className="text-blue-600 underline">
          Return to portfolio
        </button>
      </div>
    );
  }

  // Related items lookup
  const incomingRels = relationships.filter((r) => r.targetId === item.id);
  const outgoingRels = relationships.filter((r) => r.sourceId === item.id);

  // Find platform item if any
  const platformItem = items.find(
    (i) => i.id === item.platformId || (i.type === 'Platform' && i.name === item.platformName)
  );

  // Find related application
  const appItem = items.find(
    (i) => i.id === item.applicationId || (i.type === 'Application' && i.name === item.applicationName)
  );

  // Find related initiative
  const initiativeItem = items.find(
    (i) => i.id === item.initiativeId || (i.type === 'Initiative' && i.name === item.initiativeName)
  );

  const getItemIcon = (type: EstateItemType) => {
    switch (type) {
      case 'Platform':
        return <Server className="w-5 h-5 text-blue-600" />;
      case 'Application':
        return <Layers className="w-5 h-5 text-sky-600" />;
      case 'Agent':
        return <Bot className="w-5 h-5 text-indigo-600" />;
      case 'Embedded AI':
        return <Sparkles className="w-5 h-5 text-emerald-600" />;
      case 'Initiative':
        return <Kanban className="w-5 h-5 text-purple-600" />;
      case 'Experiment':
        return <Beaker className="w-5 h-5 text-amber-600" />;
    }
  };

  const handleSaveEdit = () => {
    updateItem(item.id, {
      name: formData.name,
      subtitle: formData.subtitle,
      description: formData.description,
      department: formData.department,
      businessOwner: formData.businessOwner,
      technicalOwner: formData.technicalOwner,
      businessFunction: formData.businessFunction,
      priority: formData.priority as Priority,
      annualCost: Number(formData.annualCost),
      devCost: Number(formData.devCost),
      opsCost: Number(formData.opsCost),
      sharedCost: Number(formData.sharedCost),
      intendedOutcome: formData.intendedOutcome,
      valueEvidenceStatus: formData.valueEvidenceStatus as ValueEvidenceStatus,
      lifecycleStage: formData.lifecycleStage as LifecycleStage,
      status: formData.status as ItemStatus,
      dataClassification: formData.dataClassification as DataClassification,
    });
    setIsEditing(false);
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText(item.id);
    showToast(`Copied ID "${item.id}" to clipboard`);
    setShowMoreMenu(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-y-auto">
      {/* Header with Breadcrumb matching screenshot 4 */}
      <Header
        title=""
        breadcrumbs={[
          { label: 'AI Portfolio', action: () => setActiveNav('portfolio') },
          { label: item.name },
        ]}
        showExport={false}
        showRegister={false}
        customActions={
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md shadow-xs hover:bg-slate-50 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit'}</span>
            </button>

            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1.5 text-slate-600 bg-white border border-slate-200 rounded-md shadow-xs hover:bg-slate-50 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-10 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 text-xs">
                <button
                  onClick={handleCopyId}
                  className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Object ID</span>
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button
                  onClick={() => {
                    deleteItem(item.id);
                    setActiveNav('portfolio');
                  }}
                  className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>
              </div>
            )}
          </div>
        }
      />

      {/* Item Title Bar matching screenshot 4 */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center shrink-0">
              {getItemIcon(item.type)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {item.name}
                </h1>
                <TypeBadge type={item.type} size="md" />
                <StatusBadge status={item.lifecycleStage} size="md" />
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                {item.subtitle || item.description}
              </p>
            </div>
          </div>
        </div>

        {/* 5 Tab Navigation matching specification */}
        <div className="max-w-7xl mx-auto flex items-center gap-6 mt-6 -mb-5 text-xs font-medium border-b border-slate-200">
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'cost', label: 'Cost' },
              { id: 'outcomes', label: 'Outcomes' },
              { id: 'relationships', label: 'Relationships' },
              { id: 'history', label: 'History' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 font-semibold transition-colors relative ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Body */}
      <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Inline Edit Mode */}
        {isEditing && (
          <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Editing Record: {item.name}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 border border-slate-200 rounded text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Business Owner</label>
                <input
                  type="text"
                  value={formData.businessOwner}
                  onChange={(e) => setFormData({ ...formData, businessOwner: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Technical Owner</label>
                <input
                  type="text"
                  value={formData.technicalOwner}
                  onChange={(e) => setFormData({ ...formData, technicalOwner: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Business Function</label>
                <input
                  type="text"
                  value={formData.businessFunction}
                  onChange={(e) => setFormData({ ...formData, businessFunction: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Annual Cost (£)</label>
                <input
                  type="number"
                  value={formData.annualCost}
                  onChange={(e) => setFormData({ ...formData, annualCost: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Lifecycle Stage</label>
                <select
                  value={formData.lifecycleStage}
                  onChange={(e) => setFormData({ ...formData, lifecycleStage: e.target.value as LifecycleStage })}
                  className="w-full p-2 border border-slate-200 rounded-md bg-white"
                >
                  <option value="Ideation">Ideation</option>
                  <option value="Evaluation">Evaluation</option>
                  <option value="Development">Development</option>
                  <option value="Pilot">Pilot</option>
                  <option value="Production">Production</option>
                  <option value="In progress">In progress</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ItemStatus })}
                  className="w-full p-2 border border-slate-200 rounded-md bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="In progress">In progress</option>
                  <option value="Planning">Planning</option>
                  <option value="Under Review">Under Review</option>
                  <option value="On hold">On hold</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                  className="w-full p-2 border border-slate-200 rounded-md bg-white"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Data Classification</label>
                <select
                  value={formData.dataClassification}
                  onChange={(e) => setFormData({ ...formData, dataClassification: e.target.value as DataClassification })}
                  className="w-full p-2 border border-slate-200 rounded-md bg-white"
                >
                  <option value="Internal">Internal</option>
                  <option value="Confidential">Confidential</option>
                  <option value="Restricted">Restricted</option>
                  <option value="Public">Public</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-md"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW matching screenshot 4 */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Key Information card */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Key information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Owner</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                    {item.businessOwner || (
                      <span className="text-amber-600 font-medium">Not specified</span>
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Technical Owner</span>
                  <span className="font-semibold text-slate-900">
                    {item.technicalOwner || 'David Chen'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Department</span>
                  <span className="font-semibold text-slate-900">{item.department}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Platform</span>
                  {platformItem ? (
                    <button
                      onClick={() => viewPlatform(platformItem.id)}
                      className="font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 hover:underline"
                    >
                      {platformItem.name}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : item.platformName ? (
                    <span className="font-semibold text-blue-600">{item.platformName}</span>
                  ) : (
                    <span className="text-slate-400">Standalone / None</span>
                  )}
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Lifecycle stage</span>
                  <StatusBadge status={item.lifecycleStage} />
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Status</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {item.status}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Business function</span>
                  <span className="font-semibold text-slate-900">
                    {item.businessFunction || 'Customer Support Operations'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Data classification</span>
                  <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {item.dataClassification || 'Internal'}
                  </span>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block mb-1">Description</span>
                  <p className="text-slate-700 leading-relaxed text-xs">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Relationships & Cost Cards matching screenshot 4 */}
            <div className="lg:col-span-5 space-y-6">
              {/* Relationships Card */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
                <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">Relationships</h2>
                  <span className="text-[11px] text-slate-400">Connected entities</span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Built on */}
                  <div
                    onClick={() => platformItem && viewPlatform(platformItem.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 transition-colors ${
                      platformItem ? 'hover:bg-blue-50/70 hover:border-blue-200 cursor-pointer group' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-16">
                        Built on
                      </span>
                      <Server className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {platformItem?.name || item.platformName || 'Azure AI Foundry'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Platform</span>
                  </div>

                  {/* Delivered through / Part of */}
                  <div
                    onClick={() => initiativeItem && viewItem(initiativeItem.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 transition-colors ${
                      initiativeItem ? 'hover:bg-purple-50/70 hover:border-purple-200 cursor-pointer group' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-16">
                        Part of
                      </span>
                      <Kanban className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="font-semibold text-slate-800 group-hover:text-purple-600 transition-colors">
                        {initiativeItem?.name || item.initiativeName || 'Customer Service Transformation'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Project</span>
                  </div>

                  {/* Uses */}
                  <div
                    onClick={() => appItem && viewItem(appItem.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 transition-colors ${
                      appItem ? 'hover:bg-sky-50/70 hover:border-sky-200 cursor-pointer group' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-16">
                        Uses
                      </span>
                      <Layers className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">
                        {appItem?.name || item.applicationName || 'Salesforce'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Application</span>
                  </div>

                  {/* Supported by / Depends on */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-16">
                        Team
                      </span>
                      <span className="font-semibold text-slate-800">
                        {item.team || 'IT Support Team'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Team</span>
                  </div>
                </div>
              </div>

              {/* Annual Cost (Attributed) Card matching screenshot 4 */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-sm font-bold text-slate-900">
                    Annual cost (attributed)
                  </h2>
                </div>

                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  £{(item.annualCost || 155000).toLocaleString()}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
                  <span>£{Math.round((item.devCost || 90000) / 1000)}k development</span>
                  <span>•</span>
                  <span>£{Math.round((item.opsCost || 45000) / 1000)}k operational</span>
                  <span>•</span>
                  <span>£{Math.round((item.sharedCost || 20000) / 1000)}k shared</span>
                </div>

                <div className="mt-4 p-2.5 rounded bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                  Estimated prototype figure based on allocated runtime compute and seat licenses.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COST */}
        {activeTab === 'cost' && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Cost & Budget Allocation</h2>
              <p className="text-xs text-slate-500">Prototype cost breakdown across development, hosting, and platform consumption.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500">Development Cost</div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  £{(item.devCost || 90000).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">One-off engineering & prompt validation</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500">Operational & Cloud Run</div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  £{(item.opsCost || 45000).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Token throughput and infrastructure maintenance</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500">Shared Platform Fee</div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  £{(item.sharedCost || 20000).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Attributed enterprise platform licensing</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OUTCOMES */}
        {activeTab === 'outcomes' && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Target Business Outcomes & Evidence</h2>
              <p className="text-xs text-slate-500">Strategic goals, documented business metrics, and ROI validation.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1">
                  <Target className="w-4 h-4 text-blue-600" />
                  Intended Business Outcome
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {item.intendedOutcome ||
                    'Resolve 38% of Tier-1 inbound support inquiries without human escalation while maintaining CSAT > 92%.'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="font-semibold text-slate-900">Value Evidence Status</div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-semibold text-xs">
                    {item.valueEvidenceStatus}
                  </span>
                  <span className="text-slate-500">
                    Quarterly business review documented with Head of Customer Support.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RELATIONSHIPS */}
        {activeTab === 'relationships' && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Data Flows & System Graph</h2>
              <p className="text-xs text-slate-500">Structured integration dependencies and data flows.</p>
            </div>

            <div className="space-y-3">
              {outgoingRels.concat(incomingRels).map((rel) => {
                const isOut = rel.sourceId === item.id;
                const peerId = isOut ? rel.targetId : rel.sourceId;
                const peerItem = items.find((i) => i.id === peerId);

                return (
                  <div
                    key={rel.id}
                    onClick={() => peerItem && viewItem(peerItem.id)}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-300 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[10px] uppercase">
                          {rel.type}
                        </span>
                        <span className="font-bold text-slate-900">
                          {peerItem?.name || 'Unknown Item'}
                        </span>
                        {peerItem && <TypeBadge type={peerItem.type} />}
                      </div>
                      {rel.dataFlowDetails && (
                        <div className="text-[11px] text-slate-500 mt-1.5 space-x-3">
                          <span>
                            <strong>Data:</strong> {rel.dataFlowDetails.dataExchanged}
                          </span>
                          <span>
                            <strong>Protocol:</strong> {rel.dataFlowDetails.integrationType}
                          </span>
                        </div>
                      )}
                    </div>

                    <span className="text-blue-600 font-semibold text-xs flex items-center gap-1 shrink-0">
                      View node <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Audit Trail & Governance History</h2>
              <p className="text-xs text-slate-500">Record lifecycle changes, approvals, and ownership handoffs.</p>
            </div>

            <div className="space-y-4 text-xs border-l-2 border-slate-200 pl-4 ml-2">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[21px] top-1" />
                <div className="font-semibold text-slate-900">Promoted to Production</div>
                <div className="text-slate-500 text-[11px]">10 Nov 2025 by Elena Rostova (Governance Sign-off)</div>
              </div>

              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 absolute -left-[21px] top-1" />
                <div className="font-semibold text-slate-900">Assigned Platform: Azure AI Foundry</div>
                <div className="text-slate-500 text-[11px]">15 Oct 2025 by David Chen</div>
              </div>

              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400 absolute -left-[21px] top-1" />
                <div className="font-semibold text-slate-900">Initial Registration into AI Portfolio</div>
                <div className="text-slate-500 text-[11px]">01 Aug 2025 by Jonathan Vance</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
