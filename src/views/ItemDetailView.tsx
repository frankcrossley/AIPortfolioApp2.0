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
  Target,
  Trash2,
  Copy,
  Pencil,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Header } from '../components/Header';
import { StatusBadge, TypeBadge, ValueStatusBadge, ConfidenceBadge } from '../components/StatusBadge';
import { ValueHypothesisForm } from '../components/ValueHypothesisForm';
import {
  EstateItem,
  EstateItemType,
  LifecycleStage,
  ItemStatus,
  Priority,
  DataClassification,
  ValueEvidenceStatus,
  ValueHypothesis,
  IntendedOutcome,
} from '../types';
import { formatGBP, calculationBasisText, calculationMethodLabel } from '../lib/valueCalculations';

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
  const [isEditingOutcome, setIsEditingOutcome] = useState(false);
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
    annualCost: item?.annualCost ?? undefined as number | undefined,
    devCost: item?.devCost ?? undefined as number | undefined,
    opsCost: item?.opsCost ?? undefined as number | undefined,
    sharedCost: item?.sharedCost ?? undefined as number | undefined,
    externalConsultancyCost: item?.externalConsultancyCost ?? undefined as number | undefined,
    internalTeamCost: item?.internalTeamCost ?? undefined as number | undefined,
    costCalculationBasis: item?.costCalculationBasis || '',
    isCostEstimated: item?.isCostEstimated ?? false,
    intendedOutcome: item?.intendedOutcome || '',
    valueEvidenceStatus: item?.valueEvidenceStatus || 'Documented',
    lifecycleStage: item?.lifecycleStage || 'Production',
    status: item?.status || 'Active',
    dataClassification: item?.dataClassification || 'Internal',
  });

  // Value hypothesis + outcome editable state (Outcomes tab)
  const [outcomeDraft, setOutcomeDraft] = useState<IntendedOutcome>(
    item?.outcome || { name: '', category: '' }
  );
  const [valueHypothesisDraft, setValueHypothesisDraft] = useState<ValueHypothesis>(
    item?.valueHypothesis || { status: 'Not defined' }
  );

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
        annualCost: item.annualCost,
        devCost: item.devCost,
        opsCost: item.opsCost,
        sharedCost: item.sharedCost,
        externalConsultancyCost: item.externalConsultancyCost,
        internalTeamCost: item.internalTeamCost,
        costCalculationBasis: item.costCalculationBasis || '',
        isCostEstimated: item.isCostEstimated ?? false,
        intendedOutcome: item.intendedOutcome || '',
        valueEvidenceStatus: item.valueEvidenceStatus || 'Documented',
        lifecycleStage: item.lifecycleStage || 'Production',
        status: item.status || 'Active',
        dataClassification: item.dataClassification || 'Internal',
      });
      setOutcomeDraft(item.outcome || { name: '', category: '' });
      setValueHypothesisDraft(item.valueHypothesis || { status: 'Not defined' });
      setIsEditing(false);
      setIsEditingOutcome(false);
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
      annualCost: formData.annualCost === undefined ? undefined : Number(formData.annualCost),
      devCost: formData.devCost === undefined ? undefined : Number(formData.devCost),
      opsCost: formData.opsCost === undefined ? undefined : Number(formData.opsCost),
      sharedCost: formData.sharedCost === undefined ? undefined : Number(formData.sharedCost),
      externalConsultancyCost:
        formData.externalConsultancyCost === undefined ? undefined : Number(formData.externalConsultancyCost),
      internalTeamCost: formData.internalTeamCost === undefined ? undefined : Number(formData.internalTeamCost),
      costCalculationBasis: formData.costCalculationBasis,
      isCostEstimated: formData.isCostEstimated,
      intendedOutcome: formData.intendedOutcome,
      valueEvidenceStatus: formData.valueEvidenceStatus as ValueEvidenceStatus,
      lifecycleStage: formData.lifecycleStage as LifecycleStage,
      status: formData.status as ItemStatus,
      dataClassification: formData.dataClassification as DataClassification,
    });
    setIsEditing(false);
  };

  const handleSaveOutcome = () => {
    updateItem(item.id, {
      outcome: outcomeDraft,
      valueHypothesis: valueHypothesisDraft,
    });
    setIsEditingOutcome(false);
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
                  value={formData.annualCost ?? ''}
                  onChange={(e) => setFormData({ ...formData, annualCost: e.target.value === '' ? undefined : Number(e.target.value) })}
                  placeholder="Not provided"
                  className="w-full p-2 border border-slate-200 rounded-md"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="edit-isCostEstimated"
                  checked={formData.isCostEstimated}
                  onChange={(e) => setFormData({ ...formData, isCostEstimated: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="edit-isCostEstimated" className="text-slate-700 font-medium">
                  Cost is estimated (not confirmed)
                </label>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Development Cost (£)</label>
                <input
                  type="number"
                  value={formData.devCost ?? ''}
                  onChange={(e) => setFormData({ ...formData, devCost: e.target.value === '' ? undefined : Number(e.target.value) })}
                  placeholder="Not provided"
                  className="w-full p-2 border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Platform / Shared Cost (£)</label>
                <input
                  type="number"
                  value={formData.sharedCost ?? ''}
                  onChange={(e) => setFormData({ ...formData, sharedCost: e.target.value === '' ? undefined : Number(e.target.value) })}
                  placeholder="Not provided"
                  className="w-full p-2 border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Operational Cost (£)</label>
                <input
                  type="number"
                  value={formData.opsCost ?? ''}
                  onChange={(e) => setFormData({ ...formData, opsCost: e.target.value === '' ? undefined : Number(e.target.value) })}
                  placeholder="Not provided"
                  className="w-full p-2 border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">External Consultancy (£)</label>
                <input
                  type="number"
                  value={formData.externalConsultancyCost ?? ''}
                  onChange={(e) => setFormData({ ...formData, externalConsultancyCost: e.target.value === '' ? undefined : Number(e.target.value) })}
                  placeholder="Not provided"
                  className="w-full p-2 border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Internal Team Cost (£)</label>
                <input
                  type="number"
                  value={formData.internalTeamCost ?? ''}
                  onChange={(e) => setFormData({ ...formData, internalTeamCost: e.target.value === '' ? undefined : Number(e.target.value) })}
                  placeholder="Not provided"
                  className="w-full p-2 border border-slate-200 rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Cost calculation basis</label>
                <input
                  type="text"
                  placeholder="e.g. Allocated runtime compute + seat licenses, prorated"
                  value={formData.costCalculationBasis}
                  onChange={(e) => setFormData({ ...formData, costCalculationBasis: e.target.value })}
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
                    {item.technicalOwner || <span className="text-amber-600 font-medium">Not specified</span>}
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
                    {item.businessFunction || <span className="text-slate-400 font-normal">Not provided</span>}
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
                        {platformItem?.name || item.platformName || <span className="text-slate-400 font-normal">None</span>}
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
                        {initiativeItem?.name || item.initiativeName || <span className="text-slate-400 font-normal">None</span>}
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
                        {appItem?.name || item.applicationName || <span className="text-slate-400 font-normal">None</span>}
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
                        {item.team || <span className="text-slate-400 font-normal">Not specified</span>}
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
                  {formatGBP(item.annualCost)}
                  {item.annualCost !== undefined && item.isCostEstimated && (
                    <span className="text-xs font-medium text-amber-600 ml-2 align-middle">(estimated)</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-2 font-medium">
                  <span>{formatGBP(item.devCost)} development</span>
                  <span>•</span>
                  <span>{formatGBP(item.opsCost)} operational</span>
                  <span>•</span>
                  <span>{formatGBP(item.sharedCost)} platform/shared</span>
                </div>

                <div className="mt-4 p-2.5 rounded bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                  {item.costCalculationBasis ||
                    'Basic estimated costing. No detailed cost allocation model has been applied yet.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COST */}
        {activeTab === 'cost' && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Cost & Budget Allocation</h2>
                <p className="text-xs text-slate-500">
                  Basic estimated costing model. No detailed cost allocation ledger has been implemented yet.
                </p>
              </div>
              {item.annualCost !== undefined && (
                <span
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                    item.isCostEstimated
                      ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                  }`}
                >
                  {item.isCostEstimated ? 'Estimated' : 'Confirmed'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CostTile label="Development cost" value={item.devCost} note="One-off build and prompt validation effort" />
              <CostTile label="Platform / shared cost" value={item.sharedCost} note="Attributed enterprise platform licensing" />
              <CostTile label="Operational cost" value={item.opsCost} note="Ongoing run and infrastructure maintenance" />
              <CostTile label="External consultancy" value={item.externalConsultancyCost} note="Third-party delivery spend" />
              <CostTile label="Internal team cost" value={item.internalTeamCost} note="Internal resourcing at blended rate" />
              <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-200/80">
                <div className="text-xs text-blue-900 font-semibold">Total estimated annual cost</div>
                <div className="text-xl font-bold text-blue-900 mt-1">{formatGBP(item.annualCost)}</div>
                <p className="text-[11px] text-blue-800/80 mt-1">
                  {item.isCostEstimated ? 'Estimated, not yet confirmed' : 'Confirmed figure'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-700">Calculation basis: </span>
              {item.costCalculationBasis || 'Not provided - no calculation basis has been recorded for this figure.'}
            </div>
          </div>
        )}

        {/* TAB 3: OUTCOMES */}
        {activeTab === 'outcomes' && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Intended Outcome & Value Hypothesis</h2>
                <p className="text-xs text-slate-500">
                  What this investment is intended to achieve, how the benefit is calculated, and how confident we are.
                </p>
              </div>
              <button
                onClick={() => {
                  if (isEditingOutcome) {
                    setOutcomeDraft(item.outcome || { name: '', category: '' });
                    setValueHypothesisDraft(item.valueHypothesis || { status: 'Not defined' });
                  }
                  setIsEditingOutcome(!isEditingOutcome);
                }}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md shadow-xs hover:bg-slate-50 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
                <span>{isEditingOutcome ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            {isEditingOutcome ? (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Intended outcome</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Outcome name</label>
                      <input
                        type="text"
                        value={outcomeDraft.name}
                        onChange={(e) => setOutcomeDraft({ ...outcomeDraft, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Strategic objective</label>
                      <input
                        type="text"
                        value={outcomeDraft.strategicObjective || ''}
                        onChange={(e) => setOutcomeDraft({ ...outcomeDraft, strategicObjective: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={outcomeDraft.description || ''}
                        onChange={(e) => setOutcomeDraft({ ...outcomeDraft, description: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Measurement unit</label>
                      <input
                        type="text"
                        placeholder="e.g. % tickets auto-resolved"
                        value={outcomeDraft.measurementUnit || ''}
                        onChange={(e) => setOutcomeDraft({ ...outcomeDraft, measurementUnit: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div />
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Baseline value</label>
                      <input
                        type="text"
                        value={outcomeDraft.baselineValue || ''}
                        onChange={(e) => setOutcomeDraft({ ...outcomeDraft, baselineValue: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Target value</label>
                      <input
                        type="text"
                        value={outcomeDraft.targetValue || ''}
                        onChange={(e) => setOutcomeDraft({ ...outcomeDraft, targetValue: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Value hypothesis</div>
                  <ValueHypothesisForm value={valueHypothesisDraft} onChange={setValueHypothesisDraft} />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingOutcome(false)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveOutcome}
                    className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                  >
                    Save value hypothesis
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1">
                    <Target className="w-4 h-4 text-blue-600" />
                    Intended Outcome
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {item.outcome?.description || item.intendedOutcome || (
                      <span className="text-slate-400">Not defined - this is an information gap.</span>
                    )}
                  </p>
                  {item.outcome && (item.outcome.baselineValue || item.outcome.targetValue) && (
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-blue-100 text-[11px] text-blue-900">
                      {item.outcome.measurementUnit && <span className="font-semibold">{item.outcome.measurementUnit}</span>}
                      {item.outcome.baselineValue && <span>Baseline: {item.outcome.baselineValue}</span>}
                      {item.outcome.targetValue && <span>Target: {item.outcome.targetValue}</span>}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Value status</span>
                    <ValueStatusBadge status={item.valueHypothesis?.status || 'Not defined'} size="md" />
                  </div>

                  {item.valueHypothesis?.expectedBenefit && (
                    <p className="text-slate-600">{item.valueHypothesis.expectedBenefit}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Benefit category</span>
                      <span className="font-semibold text-slate-800">
                        {item.valueHypothesis?.benefitCategory || 'Not set'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Confidence level</span>
                      <ConfidenceBadge level={item.valueHypothesis?.confidenceLevel} />
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Estimated annual benefit</span>
                      <span className="font-bold text-slate-900">
                        {item.valueHypothesis?.estimatedAnnualBenefit !== undefined
                          ? formatGBP(item.valueHypothesis.estimatedAnnualBenefit)
                          : 'Not quantified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Calculation method</span>
                      <span className="font-semibold text-slate-800">
                        {calculationMethodLabel(item.valueHypothesis?.calculationMethod)}
                      </span>
                    </div>
                  </div>

                  {calculationBasisText(item.valueHypothesis) && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-400 block mb-0.5">Calculation basis</span>
                      <span className="text-slate-700">{calculationBasisText(item.valueHypothesis)}</span>
                    </div>
                  )}

                  {item.valueHypothesis?.assumptions && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-400 block mb-0.5">Assumptions</span>
                      <span className="text-slate-700">{item.valueHypothesis.assumptions}</span>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-200">
                    This is an estimate based on stated assumptions, not a guaranteed or realised outcome, unless
                    status is "Validated" or "Realised".
                  </p>
                </div>

                {item.measurement && (
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="font-semibold text-slate-900">Measurement status</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Baseline</span>
                        <span className="font-semibold text-slate-800">{item.measurement.baseline || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Current</span>
                        <span className="font-semibold text-slate-800">{item.measurement.current || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Target</span>
                        <span className="font-semibold text-slate-800">{item.measurement.target || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Evidence status</span>
                        <span className="font-semibold text-slate-800">{item.measurement.evidenceStatus || '—'}</span>
                      </div>
                    </div>
                    {item.measurement.lastMeasuredDate && (
                      <p className="text-slate-500 pt-2 border-t border-slate-200">
                        Last measured {item.measurement.lastMeasuredDate}
                        {(item.measurement.lastMeasuredDaysAgo ?? 0) >= 90 && (
                          <span className="text-amber-600 font-medium"> · overdue for a refresh</span>
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
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

const CostTile: React.FC<{ label: string; value?: number; note: string }> = ({ label, value, note }) => (
  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
    <div className="text-xs text-slate-500">{label}</div>
    <div className={`text-xl font-bold mt-1 ${value === undefined ? 'text-slate-400 text-base font-medium' : 'text-slate-900'}`}>
      {formatGBP(value)}
    </div>
    <p className="text-[11px] text-slate-400 mt-1">{note}</p>
  </div>
);
