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
  X,
  UsersRound,
  Link2,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Header } from '../components/Header';
import { StatusBadge, TypeBadge, ValueStatusBadge, ConfidenceBadge } from '../components/StatusBadge';
import { ValueHypothesisForm } from '../components/ValueHypothesisForm';
import { CostRecordForm } from '../components/CostRecordForm';
import { SearchableSelect } from '../components/SearchableSelect';
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
  CostRecord,
} from '../types';
import {
  formatGBP,
  calculationBasisText,
  firstYearCostTotal,
  developmentCostTotal,
} from '../lib/valueCalculations';
import { getRecommendedActions } from '../lib/recommendations';
import { getCompleteness } from '../lib/completeness';

interface ItemDetailViewProps {
  itemId: string;
}

/**
 * Legacy records only carry flat devCost/opsCost/sharedCost fields, not a
 * costRecord. To give every record the same Development/Operating view,
 * derive an equivalent CostRecord from those flat fields when needed -
 * legacy annualCost is exactly devCost + opsCost + sharedCost, so the
 * mapping is lossless.
 */
function deriveDisplayCostRecord(item: EstateItem): CostRecord {
  if (item.costRecord) return item.costRecord;
  const hasOperating = item.opsCost !== undefined || item.sharedCost !== undefined;
  const confirmed = item.annualCost !== undefined ? !item.isCostEstimated : undefined;
  return {
    developmentCost: item.devCost,
    developmentBreakdown: {
      internalEffort: item.internalTeamCost,
      externalConsultancy: item.externalConsultancyCost,
    },
    developmentConfirmed: confirmed,
    operatingCost: hasOperating ? (item.opsCost ?? 0) + (item.sharedCost ?? 0) : undefined,
    operatingBreakdown: {
      platformLicensing: item.sharedCost,
    },
    operatingConfirmed: confirmed,
    sourceNotes: item.costCalculationBasis,
  };
}

export const ItemDetailView: React.FC<ItemDetailViewProps> = ({ itemId }) => {
  const {
    items,
    allRecords,
    teams,
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
  const [isEditingCost, setIsEditingCost] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Find target item (may be an Estate Item or an Initiative adapted for display)
  const item: EstateItem | undefined =
    allRecords.find((i) => i.id === itemId) || allRecords.find((i) => i.id === 'agt-1') || allRecords[0];

  const recommendedActions = item ? getRecommendedActions(item) : [];
  const completeness = item ? getCompleteness(item) : null;

  // Basic details editable state (entity-conditional fields included)
  const [formData, setFormData] = useState({
    name: item?.name || '',
    subtitle: item?.subtitle || '',
    description: item?.description || '',
    department: item?.department || '',
    businessOwner: item?.businessOwner || '',
    technicalOwner: item?.technicalOwner || '',
    businessFunction: item?.businessFunction || '',
    priority: item?.priority || 'High',
    intendedOutcome: item?.intendedOutcome || '',
    valueEvidenceStatus: item?.valueEvidenceStatus || 'Documented',
    lifecycleStage: item?.lifecycleStage || 'Production',
    status: item?.status || 'Active',
    dataClassification: item?.dataClassification || 'Internal',
    provider: item?.provider || '',
    productName: item?.productName || '',
    licensingModel: item?.licensingModel || '',
    contractRenewalDate: item?.contractRenewalDate || '',
    sponsor: item?.sponsor || '',
    deliveryOwner: item?.deliveryOwner || '',
    startDate: item?.startDate || '',
    targetEndDate: item?.targetEndDate || '',
    budget: item?.budget ?? undefined as number | undefined,
  });

  // Cost tab draft
  const [costDraft, setCostDraft] = useState<CostRecord>(item ? deriveDisplayCostRecord(item) : { developmentCost: undefined });

  // Value hypothesis + outcome editable state (Purpose & Outcomes tab)
  const [outcomeDraft, setOutcomeDraft] = useState<IntendedOutcome>(
    item?.outcome || { name: '', category: '' }
  );
  const [valueHypothesisDraft, setValueHypothesisDraft] = useState<ValueHypothesis>(
    item?.valueHypothesis || { status: 'Not defined' }
  );

  // Sync all draft/form state whenever target item changes
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
        intendedOutcome: item.intendedOutcome || '',
        valueEvidenceStatus: item.valueEvidenceStatus || 'Documented',
        lifecycleStage: item.lifecycleStage || 'Production',
        status: item.status || 'Active',
        dataClassification: item.dataClassification || 'Internal',
        provider: item.provider || '',
        productName: item.productName || '',
        licensingModel: item.licensingModel || '',
        contractRenewalDate: item.contractRenewalDate || '',
        sponsor: item.sponsor || '',
        deliveryOwner: item.deliveryOwner || '',
        startDate: item.startDate || '',
        targetEndDate: item.targetEndDate || '',
        budget: item.budget,
      });
      setOutcomeDraft(item.outcome || { name: '', category: '' });
      setValueHypothesisDraft(item.valueHypothesis || { status: 'Not defined' });
      setCostDraft(deriveDisplayCostRecord(item));
      setIsEditing(false);
      setIsEditingOutcome(false);
      setIsEditingCost(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const isPlatform = item.type === 'Platform';
  const isProjectOrProgramme = item.type === 'Initiative';

  // Related items lookup
  const platformItem = items.find(
    (i) => i.id === item.platformId || (i.type === 'Platform' && i.name === item.platformName)
  );
  const appItem = items.find(
    (i) => i.id === item.applicationId || (i.type === 'Application' && i.name === item.applicationName)
  );
  const initiativeItem = allRecords.find(
    (i) => i.id === item.initiativeId || (i.type === 'Initiative' && i.name === item.initiativeName)
  );
  const dependsOnItems = (item.relatedEstateItemIds || [])
    .map((id) => allRecords.find((i) => i.id === id))
    .filter((i): i is EstateItem => !!i);

  // Platform-only: what uses this platform
  const usingItems = isPlatform ? allRecords.filter((i) => i.platformId === item.id || i.platformName === item.name) : [];
  const usingTeams = Array.from(new Set(usingItems.map((i) => i.team).filter((t): t is string => !!t)));

  // Programme-only: assets it is delivering
  const deliveredAssets = isProjectOrProgramme
    ? allRecords.filter((i) => i.initiativeId === item.id || i.initiativeName === item.name)
    : [];

  const platformOptions = items.filter((i) => i.type === 'Platform').map((p) => ({ id: p.id, label: p.name }));
  const applicationOptions = items.filter((i) => i.type === 'Application').map((a) => ({ id: a.id, label: a.name }));
  const initiativeOptions = allRecords.filter((i) => i.type === 'Initiative').map((p) => ({ id: p.id, label: p.name }));
  const teamOptions = teams.filter((t) => t.status === 'Active').map((t) => ({ id: t.id, label: t.name }));
  const dependencyOptions = allRecords
    .filter((i) => i.id !== item.id && !(item.relatedEstateItemIds || []).includes(i.id))
    .map((i) => ({ id: i.id, label: i.name, sublabel: i.type }));

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
      intendedOutcome: formData.intendedOutcome,
      valueEvidenceStatus: formData.valueEvidenceStatus as ValueEvidenceStatus,
      lifecycleStage: formData.lifecycleStage as LifecycleStage,
      status: formData.status as ItemStatus,
      dataClassification: formData.dataClassification as DataClassification,
      provider: isPlatform ? formData.provider : item.provider,
      productName: isPlatform ? formData.productName : item.productName,
      licensingModel: isPlatform ? formData.licensingModel : item.licensingModel,
      contractRenewalDate: isPlatform ? formData.contractRenewalDate : item.contractRenewalDate,
      sponsor: isProjectOrProgramme ? formData.sponsor : item.sponsor,
      deliveryOwner: isProjectOrProgramme ? formData.deliveryOwner : item.deliveryOwner,
      startDate: isProjectOrProgramme ? formData.startDate : item.startDate,
      targetEndDate: isProjectOrProgramme ? formData.targetEndDate : item.targetEndDate,
      budget: isProjectOrProgramme ? formData.budget : item.budget,
    });
    setIsEditing(false);
  };

  const handleSaveOutcome = () => {
    updateItem(item.id, {
      outcome: outcomeDraft,
      valueHypothesis: valueHypothesisDraft,
      intendedOutcome: outcomeDraft.description || item.intendedOutcome,
    });
    setIsEditingOutcome(false);
  };

  const handleSaveCost = () => {
    const bothConfirmed = !!costDraft.developmentConfirmed && !!costDraft.operatingConfirmed;
    updateItem(item.id, {
      costRecord: costDraft,
      annualCost: firstYearCostTotal(costDraft),
      devCost: developmentCostTotal(costDraft),
      opsCost: costDraft.operatingCost,
      sharedCost: costDraft.operatingBreakdown?.platformLicensing,
      externalConsultancyCost: costDraft.developmentBreakdown?.externalConsultancy,
      internalTeamCost: costDraft.developmentBreakdown?.internalEffort,
      isCostEstimated: !bothConfirmed,
    });
    setIsEditingCost(false);
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText(item.id);
    showToast(`Copied ID "${item.id}" to clipboard`);
    setShowMoreMenu(false);
  };

  const setRelationship = (field: 'platformId' | 'applicationId' | 'initiativeId', options: { id: string; label: string }[]) =>
    (id: string | undefined) => {
      const picked = options.find((o) => o.id === id);
      if (field === 'platformId') {
        updateItem(item.id, { platformId: id, platformName: picked?.label });
      } else if (field === 'applicationId') {
        updateItem(item.id, { applicationId: id, applicationName: picked?.label });
      } else {
        updateItem(item.id, { initiativeId: id, initiativeName: picked?.label });
      }
    };

  const setTeam = (id: string | undefined) => {
    const picked = teamOptions.find((o) => o.id === id);
    updateItem(item.id, { teamId: id, team: picked?.label });
  };

  const addDependency = (id: string | undefined) => {
    if (!id) return;
    updateItem(item.id, { relatedEstateItemIds: [...(item.relatedEstateItemIds || []), id] });
  };

  const removeDependency = (id: string) => {
    updateItem(item.id, { relatedEstateItemIds: (item.relatedEstateItemIds || []).filter((d) => d !== id) });
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-y-auto">
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

      {/* Item Title Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center shrink-0">
              {getItemIcon(item.type)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {item.name}
                </h1>
                <TypeBadge type={item.type} size="md" />
                <StatusBadge status={item.lifecycleStage} size="md" />
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl truncate">
                {item.subtitle || item.description}
              </p>
            </div>
          </div>

          {/* Completeness indicator - prominent but compact, never blocks saving */}
          {completeness && (
            <div className="shrink-0 flex items-center gap-2.5 pl-1 md:pl-0">
              <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    completeness.percent >= 100
                      ? 'bg-emerald-500'
                      : completeness.percent >= 70
                      ? 'bg-blue-500'
                      : completeness.percent >= 40
                      ? 'bg-amber-500'
                      : 'bg-rose-400'
                  }`}
                  style={{ width: `${completeness.percent}%` }}
                />
              </div>
              <div className="text-[11px] leading-tight">
                <div className="font-bold text-slate-800">{completeness.percent}% complete</div>
                <div className="text-slate-400">{completeness.label}</div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto flex items-center gap-6 mt-5 -mb-4 text-xs font-medium border-b border-slate-200">
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'cost', label: 'Costs' },
              { id: 'outcomes', label: 'Purpose & Outcomes' },
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
      <div className="p-6 max-w-7xl w-full mx-auto space-y-5">
        {/* Contextual recommendations - concrete next steps for what's missing */}
        {completeness && completeness.percent < 100 && recommendedActions.length > 0 && (
          <div className="bg-amber-50/60 rounded-xl border border-amber-200/80 px-5 py-3.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              {completeness.label} — a few things would make this more useful
            </div>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {recommendedActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    setActiveTab(action.tab);
                    if (action.openEdit) setIsEditing(true);
                    if (action.tab === 'outcomes') setIsEditingOutcome(true);
                    if (action.tab === 'cost') setIsEditingCost(true);
                  }}
                  className="px-2.5 py-1.5 rounded-md bg-white border border-amber-200 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Inline Edit Mode - basic details, entity-conditional fields only */}
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
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-md"
                />
              </div>

              {isPlatform && (
                <>
                  <div className="md:col-span-2 pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Platform details
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Provider</label>
                    <input
                      type="text"
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Product name</label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Licensing model</label>
                    <input
                      type="text"
                      placeholder="e.g. Per-seat subscription"
                      value={formData.licensingModel}
                      onChange={(e) => setFormData({ ...formData, licensingModel: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Contract / renewal date</label>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={formData.contractRenewalDate}
                      onChange={(e) => setFormData({ ...formData, contractRenewalDate: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-md"
                    />
                  </div>
                </>
              )}

              {isProjectOrProgramme && (
                <>
                  <div className="md:col-span-2 pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Programme details
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Sponsor</label>
                    <input
                      type="text"
                      value={formData.sponsor}
                      onChange={(e) => setFormData({ ...formData, sponsor: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Delivery owner</label>
                    <input
                      type="text"
                      value={formData.deliveryOwner}
                      onChange={(e) => setFormData({ ...formData, deliveryOwner: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Start date</label>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Target end date</label>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={formData.targetEndDate}
                      onChange={(e) => setFormData({ ...formData, targetEndDate: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Budget (£)</label>
                    <input
                      type="number"
                      placeholder="Not provided"
                      value={formData.budget ?? ''}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value === '' ? undefined : Number(e.target.value) })}
                      className="w-full p-2 border border-slate-200 rounded-md"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-2.5">
                  <h2 className="text-sm font-bold text-slate-900">Key information</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Owner</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {item.businessOwner || (
                        <span className="text-amber-600 font-medium">Not assigned</span>
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Technical Owner</span>
                    <span className="font-semibold text-slate-900">
                      {item.technicalOwner || <span className="text-amber-600 font-medium">Not assigned</span>}
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

              {/* Platform-specific detail card */}
              {isPlatform && (
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-2.5">
                    <h2 className="text-sm font-bold text-slate-900">Platform details</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Provider</span>
                      <span className="font-semibold text-slate-900">
                        {item.provider || <span className="text-slate-400 font-normal">Not provided</span>}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Product name</span>
                      <span className="font-semibold text-slate-900">
                        {item.productName || <span className="text-slate-400 font-normal">Not provided</span>}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Licensing model</span>
                      <span className="font-semibold text-slate-900">
                        {item.licensingModel || <span className="text-slate-400 font-normal">Not provided</span>}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Contract / renewal date</span>
                      <span className="font-semibold text-slate-900">
                        {item.contractRenewalDate || <span className="text-slate-400 font-normal">Not provided</span>}
                      </span>
                    </div>
                    <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                      <span className="text-slate-400 block mb-1">Used by ({usingItems.length})</span>
                      {usingItems.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {usingItems.slice(0, 8).map((u) => (
                            <button
                              key={u.id}
                              onClick={() => viewItem(u.id)}
                              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[11px] font-medium transition-colors"
                            >
                              {u.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-normal">Not used by any other record yet</span>
                      )}
                      {usingTeams.length > 0 && (
                        <p className="text-[11px] text-slate-400 mt-1.5">Teams: {usingTeams.join(', ')}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Programme-specific detail card */}
              {isProjectOrProgramme && (
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-2.5">
                    <h2 className="text-sm font-bold text-slate-900">Programme details</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Sponsor</span>
                      <span className="font-semibold text-slate-900">
                        {item.sponsor || <span className="text-amber-600 font-medium">Not assigned</span>}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Delivery owner</span>
                      <span className="font-semibold text-slate-900">
                        {item.deliveryOwner || <span className="text-slate-400 font-normal">Not assigned</span>}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Start date</span>
                      <span className="font-semibold text-slate-900">
                        {item.startDate || <span className="text-slate-400 font-normal">Not provided</span>}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Target end date</span>
                      <span className="font-semibold text-slate-900">
                        {item.targetEndDate || <span className="text-slate-400 font-normal">Not provided</span>}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Budget</span>
                      <span className="font-semibold text-slate-900">{formatGBP(item.budget)}</span>
                    </div>
                    <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                      <span className="text-slate-400 block mb-1">Connected assets being delivered ({deliveredAssets.length})</span>
                      {deliveredAssets.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {deliveredAssets.map((a) => (
                            <button
                              key={a.id}
                              onClick={() => viewItem(a.id)}
                              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 text-[11px] font-medium transition-colors"
                            >
                              {a.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-normal">No assets linked yet</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Relationships & Cost summary */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                <div className="border-b border-slate-100 pb-2.5 mb-3.5 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">Relationships</h2>
                  <button
                    onClick={() => setActiveTab('relationships')}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    Manage
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
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
                  </div>

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
                  </div>

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
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-16">
                        Team
                      </span>
                      <span className="font-semibold text-slate-800">
                        {item.team || <span className="text-slate-400 font-normal">Not assigned</span>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost summary card */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                <div className="border-b border-slate-100 pb-2.5 mb-3.5 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">Cost summary</h2>
                  <button
                    onClick={() => setActiveTab('cost')}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    Details
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Total first-year</div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">{formatGBP(firstYearCostTotal(costDraft))}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Recurring annual</div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">
                      {costDraft.operatingCost !== undefined ? formatGBP(costDraft.operatingCost) : (
                        <span className="text-base font-semibold text-slate-400">Not yet estimated</span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                  Development cost is one-off; operating cost recurs every year.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COSTS */}
        {activeTab === 'cost' && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Costs</h2>
                <p className="text-xs text-slate-500">
                  Development cost is a one-off spend. Operating cost recurs every year. Figures are only "Confirmed" once someone marks them so.
                </p>
              </div>
              <button
                onClick={() => {
                  if (isEditingCost) setCostDraft(deriveDisplayCostRecord(item));
                  else setCostDraft(deriveDisplayCostRecord(item));
                  setIsEditingCost(!isEditingCost);
                }}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md shadow-xs hover:bg-slate-50 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
                <span>{isEditingCost ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            {isEditingCost ? (
              <div className="space-y-4">
                <CostRecordForm value={costDraft} onChange={setCostDraft} />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingCost(false)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCost}
                    className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                  >
                    Save costs
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Development cost card */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Development · one-off</div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          costDraft.developmentConfirmed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                            : 'bg-amber-50 text-amber-700 border-amber-200/80'
                        }`}
                      >
                        {costDraft.developmentConfirmed ? 'Confirmed' : 'Estimated'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{formatGBP(developmentCostTotal(costDraft))}</div>
                    <div className="grid grid-cols-1 gap-1.5 text-[11px] pt-2 border-t border-slate-200">
                      <CostLine label="Internal team effort" value={costDraft.developmentBreakdown?.internalEffort} />
                      <CostLine label="External consultancy" value={costDraft.developmentBreakdown?.externalConsultancy} />
                      <CostLine label="Other" value={costDraft.developmentBreakdown?.other} />
                    </div>
                    {costDraft.developmentBasis && (
                      <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">{costDraft.developmentBasis}</p>
                    )}
                  </div>

                  {/* Operating cost card */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operating · recurring annual</div>
                      {costDraft.operatingCost !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            costDraft.operatingConfirmed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                              : 'bg-amber-50 text-amber-700 border-amber-200/80'
                          }`}
                        >
                          {costDraft.operatingConfirmed ? 'Confirmed' : 'Estimated'}
                        </span>
                      )}
                    </div>
                    <div className={`text-2xl font-bold ${costDraft.operatingCost === undefined ? 'text-slate-400 text-lg font-semibold' : 'text-slate-900'}`}>
                      {costDraft.operatingCost !== undefined ? formatGBP(costDraft.operatingCost) : 'Not yet estimated'}
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 text-[11px] pt-2 border-t border-slate-200">
                      <CostLine label="Platform / licensing" value={costDraft.operatingBreakdown?.platformLicensing} />
                      <CostLine label="Infrastructure" value={costDraft.operatingBreakdown?.infrastructure} />
                      <CostLine label="Support & maintenance" value={costDraft.operatingBreakdown?.supportMaintenance} />
                      <CostLine label="Other" value={costDraft.operatingBreakdown?.other} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-200/80">
                    <div className="text-xs text-blue-900 font-semibold">Total first-year cost</div>
                    <div className="text-xl font-bold text-blue-900 mt-1">{formatGBP(firstYearCostTotal(costDraft))}</div>
                    <p className="text-[11px] text-blue-800/80 mt-1">Development + first year of operating cost</p>
                  </div>
                  <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-200/80">
                    <div className="text-xs text-blue-900 font-semibold">Recurring annual cost</div>
                    <div className="text-xl font-bold text-blue-900 mt-1">
                      {costDraft.operatingCost !== undefined ? formatGBP(costDraft.operatingCost) : 'Not yet estimated'}
                    </div>
                    <p className="text-[11px] text-blue-800/80 mt-1">What this costs to run every year after year one</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Source or notes: </span>
                  {costDraft.sourceNotes || 'Not provided.'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PURPOSE & OUTCOMES */}
        {activeTab === 'outcomes' && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Purpose & Outcomes</h2>
                <p className="text-xs text-slate-500">
                  Why this exists and what it's meant to achieve - kept lightweight, not a formal business case.
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
                  <div className="grid grid-cols-1 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Intended outcome</label>
                      <input
                        type="text"
                        placeholder="e.g. Reduce Tier-1 support handling time"
                        value={outcomeDraft.name}
                        onChange={(e) => setOutcomeDraft({ ...outcomeDraft, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Description</label>
                      <textarea
                        rows={2}
                        placeholder="What should be true if this succeeds?"
                        value={outcomeDraft.description || ''}
                        onChange={(e) => setOutcomeDraft({ ...outcomeDraft, description: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Success measure (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. % tickets auto-resolved"
                        value={outcomeDraft.measurementUnit || ''}
                        onChange={(e) => setOutcomeDraft({ ...outcomeDraft, measurementUnit: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Benefit estimate (optional)</div>
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
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-xs block mb-1">Business purpose</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{item.description}</p>
                </div>

                <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1">
                    <Target className="w-4 h-4 text-blue-600" />
                    Intended outcome
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {item.outcome?.description || item.outcome?.name || item.intendedOutcome || (
                      <span className="text-slate-400">Not defined yet.</span>
                    )}
                  </p>
                  {item.outcome?.measurementUnit && (
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-blue-100 text-[11px] text-blue-900">
                      <span className="font-semibold">Success measure: {item.outcome.measurementUnit}</span>
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
                      <span className="text-slate-400 block mb-0.5">Benefit estimate</span>
                      <span className="font-bold text-slate-900">
                        {item.valueHypothesis?.estimatedAnnualBenefit !== undefined
                          ? formatGBP(item.valueHypothesis.estimatedAnnualBenefit)
                          : 'Not quantified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Confidence level</span>
                      <ConfidenceBadge level={item.valueHypothesis?.confidenceLevel} />
                    </div>
                  </div>

                  {calculationBasisText(item.valueHypothesis) && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-400 block mb-0.5">Calculation basis</span>
                      <span className="text-slate-700">{calculationBasisText(item.valueHypothesis)}</span>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-200">
                    This is an estimate, not a guaranteed or realised outcome, unless status is "Validated" or "Realised".
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: RELATIONSHIPS */}
        {activeTab === 'relationships' && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Relationships</h2>
              <p className="text-xs text-slate-500">Only meaningful connections are shown. Add or remove links as they become relevant.</p>
            </div>

            <div className="space-y-3 max-w-xl">
              <RelationshipRow
                icon={<Server className="w-3.5 h-3.5 text-blue-600" />}
                label="Built on platform"
                selectedId={item.platformId}
                selectedLabel={item.platformName}
                options={platformOptions}
                onChange={setRelationship('platformId', platformOptions)}
                onView={platformItem ? () => viewPlatform(platformItem.id) : undefined}
              />
              <RelationshipRow
                icon={<Layers className="w-3.5 h-3.5 text-sky-600" />}
                label="Uses application"
                selectedId={item.applicationId}
                selectedLabel={item.applicationName}
                options={applicationOptions}
                onChange={setRelationship('applicationId', applicationOptions)}
                onView={appItem ? () => viewItem(appItem.id) : undefined}
              />
              <RelationshipRow
                icon={<Kanban className="w-3.5 h-3.5 text-purple-600" />}
                label="Part of project or programme"
                selectedId={item.initiativeId}
                selectedLabel={item.initiativeName}
                options={initiativeOptions}
                onChange={setRelationship('initiativeId', initiativeOptions)}
                onView={initiativeItem ? () => viewItem(initiativeItem.id) : undefined}
              />
              <RelationshipRow
                icon={<UsersRound className="w-3.5 h-3.5 text-slate-500" />}
                label="Supported by team"
                selectedId={item.teamId}
                selectedLabel={item.team}
                options={teamOptions}
                onChange={setTeam}
              />

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  <Link2 className="w-3.5 h-3.5 text-slate-500" />
                  Depends on another system
                </label>
                <SearchableSelect
                  value={undefined}
                  onChange={addDependency}
                  options={dependencyOptions}
                  placeholder="Search estate items..."
                  emptyLabel="Add a dependency..."
                />
                {dependsOnItems.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {dependsOnItems.map((dep) => (
                      <span
                        key={dep.id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-[11px] text-slate-700"
                      >
                        <button onClick={() => viewItem(dep.id)} className="hover:text-blue-600 hover:underline">
                          {dep.name}
                        </button>
                        <button onClick={() => removeDependency(dep.id)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">History</h2>
              <p className="text-xs text-slate-500">Meaningful record changes - created, owner changed, lifecycle stage changed, cost updated, status changed.</p>
            </div>

            <div className="space-y-4 text-xs border-l-2 border-slate-200 pl-4 ml-2">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -left-[21px] top-1" />
                <div className="font-semibold text-slate-900">Promoted to Production</div>
                <div className="text-slate-500 text-[11px]">10 Nov 2025 by Elena Rostova</div>
              </div>

              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 absolute -left-[21px] top-1" />
                <div className="font-semibold text-slate-900">Assigned Platform: Azure AI Foundry</div>
                <div className="text-slate-500 text-[11px]">15 Oct 2025 by David Chen</div>
              </div>

              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400 absolute -left-[21px] top-1" />
                <div className="font-semibold text-slate-900">Created</div>
                <div className="text-slate-500 text-[11px]">01 Aug 2025 by Jonathan Vance</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CostLine: React.FC<{ label: string; value?: number }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-slate-500">{label}</span>
    <span className={value === undefined ? 'text-slate-400' : 'font-semibold text-slate-800'}>{formatGBP(value)}</span>
  </div>
);

interface RelationshipRowProps {
  icon: React.ReactNode;
  label: string;
  selectedId?: string;
  selectedLabel?: string;
  options: { id: string; label: string }[];
  onChange: (id: string | undefined) => void;
  onView?: () => void;
}

const RelationshipRow: React.FC<RelationshipRowProps> = ({ icon, label, selectedId, selectedLabel, options, onChange, onView }) => (
  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
    <div className="flex items-center gap-2 w-44 shrink-0">
      {icon}
      <span className="text-[11px] font-semibold text-slate-500">{label}</span>
    </div>
    <div className="flex-1">
      <SearchableSelect value={selectedId} onChange={onChange} options={options} placeholder={`Search...`} emptyLabel="None" />
    </div>
    {onView && selectedLabel && (
      <button onClick={onView} className="text-blue-600 hover:text-blue-700 shrink-0" title={`View ${selectedLabel}`}>
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);
