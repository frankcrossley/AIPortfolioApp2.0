import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Server,
  Layers,
  Kanban,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ValueHypothesisForm } from '../components/ValueHypothesisForm';
import {
  EstateItemType,
  LifecycleStage,
  ItemStatus,
  Priority,
  DataClassification,
  ValueHypothesis,
  Relationship,
} from '../types';
import { formatGBP } from '../lib/valueCalculations';

const STEPS = [
  { num: 1, label: 'Basic details' },
  { num: 2, label: 'Ownership' },
  { num: 3, label: 'Investment' },
  { num: 4, label: 'Intended outcome' },
  { num: 5, label: 'Relationships' },
] as const;

export const RegisterModal: React.FC = () => {
  const { isRegisterModalOpen, closeRegisterModal, addItem, items, showToast, businessUnits, resourceRates } =
    usePortfolio();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const activeBusinessUnits = businessUnits.filter((b) => b.status === 'Active');
  const activeRoles = Array.from(new Set(resourceRates.filter((r) => r.status === 'Active').map((r) => r.role)));

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: basic details
    name: '',
    type: 'Agent' as EstateItemType,
    lifecycleStage: 'Development' as LifecycleStage,
    status: 'Active' as ItemStatus,
    businessUnitId: activeBusinessUnits.find((b) => b.name === 'Customer Services')?.id || activeBusinessUnits[0]?.id || '',
    description: '',
    // Step 2: ownership
    businessOwner: '',
    technicalOwner: '',
    team: '',
    priority: 'High' as Priority,
    dataClassification: 'Internal' as DataClassification,
    // Step 3: investment
    devCost: 0,
    opsCost: 0,
    sharedCost: 0,
    isCostEstimated: true,
    resourceType: '',
    resourceHours: 0,
    // Step 4: intended outcome
    outcomeName: '',
    outcomeDescription: '',
    // Step 5: relationships
    platformId: 'plt-2',
    applicationId: 'app-1',
    initiativeId: '',
    dependencies: '',
    includeDataFlow: false,
    dataFlowDirection: 'bidirectional' as 'inbound' | 'outbound' | 'bidirectional',
    dataFlowDataExchanged: '',
    dataFlowCriticality: 'Medium' as 'High' | 'Medium' | 'Low',
  });

  const [valueHypothesis, setValueHypothesis] = useState<ValueHypothesis>({ status: 'Not defined' });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isRegisterModalOpen) return null;

  const platforms = items.filter((i) => i.type === 'Platform');
  const applications = items.filter((i) => i.type === 'Application');
  const initiatives = items.filter((i) => i.type === 'Initiative');

  const selectedBusinessUnit = activeBusinessUnits.find((b) => b.id === formData.businessUnitId);

  const matchedRate =
    resourceRates.find(
      (r) => r.role === formData.resourceType && r.businessUnitId === formData.businessUnitId && r.status === 'Active'
    ) || resourceRates.find((r) => r.role === formData.resourceType && !r.businessUnitId && r.status === 'Active');
  const computedLabourCost = matchedRate ? matchedRate.hourlyRate * formData.resourceHours : 0;

  const annualCost = formData.devCost + formData.opsCost + formData.sharedCost;

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.businessUnitId) newErrors.businessUnitId = 'Business unit is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.businessOwner.trim()) newErrors.businessOwner = 'Business owner is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((prev) => Math.min(prev + 1, 5) as 1 | 2 | 3 | 4 | 5);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1) as 1 | 2 | 3 | 4 | 5);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPlt = platforms.find((p) => p.id === formData.platformId);
    const selectedApp = applications.find((a) => a.id === formData.applicationId);
    const selectedIni = initiatives.find((i) => i.id === formData.initiativeId);

    const rels: { targetId: string; type: Relationship['type']; dataFlowDetails?: Relationship['dataFlowDetails'] }[] = [];
    if (formData.platformId) {
      rels.push({
        targetId: formData.platformId,
        type: 'Built on',
        dataFlowDetails:
          formData.includeDataFlow && formData.dataFlowDataExchanged.trim()
            ? {
                direction: formData.dataFlowDirection,
                dataExchanged: formData.dataFlowDataExchanged,
                integrationType: 'Not specified',
                criticality: formData.dataFlowCriticality,
              }
            : undefined,
      });
    }
    if (formData.applicationId) {
      rels.push({ targetId: formData.applicationId, type: 'Uses' });
    }
    if (formData.initiativeId) {
      rels.push({ targetId: formData.initiativeId, type: 'Part of' });
    }

    addItem(
      {
        name: formData.name,
        type: formData.type,
        subtitle: `Enterprise ${formData.type.toLowerCase()}`,
        description: formData.description || 'Newly registered enterprise AI asset.',
        department: selectedBusinessUnit?.name || 'Other',
        businessUnitId: formData.businessUnitId,
        businessOwner: formData.businessOwner,
        technicalOwner: formData.technicalOwner,
        team: formData.team || `${selectedBusinessUnit?.name || 'Enterprise'} Team`,
        lifecycleStage: formData.lifecycleStage,
        status: formData.status,
        priority: formData.priority,
        dataClassification: formData.dataClassification,
        platformId: formData.platformId,
        platformName: selectedPlt?.name,
        applicationId: formData.applicationId,
        applicationName: selectedApp?.name,
        initiativeId: formData.initiativeId,
        initiativeName: selectedIni?.name,
        annualCost,
        devCost: formData.devCost,
        opsCost: formData.opsCost,
        sharedCost: formData.sharedCost,
        isCostEstimated: formData.isCostEstimated,
        costCalculationBasis:
          formData.resourceType && matchedRate
            ? `Includes ${formData.resourceHours} hrs of ${formData.resourceType} time at £${matchedRate.hourlyRate}/hr`
            : undefined,
        valueEvidenceStatus: valueHypothesis.status === 'Not defined' ? 'None' : 'In progress',
        intendedOutcome: formData.outcomeDescription || undefined,
        outcome: formData.outcomeName.trim()
          ? {
              name: formData.outcomeName,
              category: valueHypothesis.benefitCategory || '',
              description: formData.outcomeDescription,
              businessOwner: formData.businessOwner,
            }
          : undefined,
        valueHypothesis,
        dependencies: formData.dependencies ? formData.dependencies.split(',').map((s) => s.trim()) : [],
      },
      rels
    );
  };

  const handleSaveDraft = () => {
    showToast(`Draft for "${formData.name || 'Untitled Initiative'}" saved locally`, 'info');
    closeRegisterModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Add AI Initiative</h2>
            <p className="text-xs text-slate-500 mt-0.5">Create a new record for your AI estate.</p>
          </div>
          <button
            onClick={closeRegisterModal}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs font-medium shrink-0 overflow-x-auto">
          {STEPS.map((s) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div
                key={s.num}
                className={`flex items-center gap-2 shrink-0 ${
                  isCurrent ? 'text-blue-600 font-bold' : isCompleted ? 'text-slate-700 font-medium' : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : s.num}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Step Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* STEP 1: BASIC DETAILS */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="form-name-input"
                  type="text"
                  placeholder="e.g. Customer Support Agent"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
                {errors.name && <p className="text-rose-500 text-[11px] mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    AI type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as EstateItemType })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Agent">Agent</option>
                    <option value="Platform">Platform</option>
                    <option value="Application">Application</option>
                    <option value="Embedded AI">Embedded AI</option>
                    <option value="Initiative">Initiative / Project</option>
                    <option value="Experiment">Experiment / Use Case</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lifecycle stage <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.lifecycleStage}
                    onChange={(e) => setFormData({ ...formData, lifecycleStage: e.target.value as LifecycleStage })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Ideation">Ideation</option>
                    <option value="Evaluation">Evaluation</option>
                    <option value="Development">Development</option>
                    <option value="Pilot">Pilot</option>
                    <option value="Production">Production</option>
                    <option value="In progress">In progress</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Business unit <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.businessUnitId}
                    onChange={(e) => setFormData({ ...formData, businessUnitId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {activeBusinessUnits.map((bu) => (
                      <option key={bu.id} value={bu.id}>
                        {bu.name}
                      </option>
                    ))}
                  </select>
                  {errors.businessUnitId && <p className="text-rose-500 text-[11px] mt-1">{errors.businessUnitId}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ItemStatus })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="In progress">In progress</option>
                    <option value="Planning">Planning</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Add a brief description of the AI capability, scope, and expected usage..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: OWNERSHIP */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Business Owner <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova"
                  value={formData.businessOwner}
                  onChange={(e) => setFormData({ ...formData, businessOwner: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
                {errors.businessOwner && (
                  <p className="text-rose-500 text-[11px] mt-1">{errors.businessOwner}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Technical Owner</label>
                  <input
                    type="text"
                    placeholder="e.g. David Chen"
                    value={formData.technicalOwner}
                    onChange={(e) => setFormData({ ...formData, technicalOwner: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Team</label>
                  <input
                    type="text"
                    placeholder="e.g. Customer Care Automation"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data Classification</label>
                  <select
                    value={formData.dataClassification}
                    onChange={(e) => setFormData({ ...formData, dataClassification: e.target.value as DataClassification })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Internal">Internal</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Restricted">Restricted</option>
                    <option value="Public">Public</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: INVESTMENT */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg space-y-3">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Resource cost calculator (optional)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Resource type</label>
                    <select
                      value={formData.resourceType}
                      onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                    >
                      <option value="">Select role...</option>
                      {activeRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Estimated hours</label>
                    <input
                      type="number"
                      value={formData.resourceHours}
                      onChange={(e) => setFormData({ ...formData, resourceHours: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Cost rate applied</label>
                    <div className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-700 text-xs">
                      {matchedRate ? `£${matchedRate.hourlyRate}/hr` : 'Select a role'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-600">
                    Computed labour cost: <strong className="text-slate-900">{formatGBP(computedLabourCost)}</strong>
                  </span>
                  <button
                    type="button"
                    disabled={!matchedRate || computedLabourCost <= 0}
                    onClick={() => setFormData((prev) => ({ ...prev, devCost: prev.devCost + computedLabourCost }))}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none text-white rounded text-[11px] font-semibold transition-colors"
                  >
                    Add to development cost
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Development cost (£)</label>
                  <input
                    type="number"
                    value={formData.devCost}
                    onChange={(e) => setFormData({ ...formData, devCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Annual operating cost (£)</label>
                  <input
                    type="number"
                    value={formData.opsCost}
                    onChange={(e) => setFormData({ ...formData, opsCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Platform / shared cost (£)</label>
                  <input
                    type="number"
                    value={formData.sharedCost}
                    onChange={(e) => setFormData({ ...formData, sharedCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCostEstimated"
                  checked={formData.isCostEstimated}
                  onChange={(e) => setFormData({ ...formData, isCostEstimated: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isCostEstimated" className="text-slate-700 font-medium">
                  Cost confidence: mark as estimated (flagged in Information Gaps if true)
                </label>
              </div>

              <div className="p-2.5 rounded bg-blue-50/60 border border-blue-200/80 text-[11px] text-blue-900 flex items-center justify-between">
                <span>Total estimated annual cost</span>
                <strong>{formatGBP(annualCost)}</strong>
              </div>
            </div>
          )}

          {/* STEP 4: INTENDED OUTCOME */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Outcome name</label>
                <input
                  type="text"
                  placeholder="e.g. Reduce Tier-1 support handling time"
                  value={formData.outcomeName}
                  onChange={(e) => setFormData({ ...formData, outcomeName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Intended business outcome</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Reduce first-tier ticket escalations by 30% and maintain customer satisfaction > 90%."
                  value={formData.outcomeDescription}
                  onChange={(e) => setFormData({ ...formData, outcomeDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <ValueHypothesisForm value={valueHypothesis} onChange={setValueHypothesis} />
            </div>
          )}

          {/* STEP 5: RELATIONSHIPS */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-blue-600" />
                    Platform (Built on)
                  </label>
                  <select
                    value={formData.platformId}
                    onChange={(e) => setFormData({ ...formData, platformId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">None / Standalone</option>
                    {platforms.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.provider})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-600" />
                    Related Application (Uses)
                  </label>
                  <select
                    value={formData.applicationId}
                    onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">None</option>
                    {applications.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Kanban className="w-3.5 h-3.5 text-purple-600" />
                    Related Initiative (Delivered through)
                  </label>
                  <select
                    value={formData.initiativeId}
                    onChange={(e) => setFormData({ ...formData, initiativeId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">None</option>
                    {initiatives.map((ini) => (
                      <option key={ini.id} value={ini.id}>
                        {ini.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dependencies (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Salesforce Service Cloud, Knowledge Portal, IT Support"
                  value={formData.dependencies}
                  onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {formData.platformId && (
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includeDataFlow"
                      checked={formData.includeDataFlow}
                      onChange={(e) => setFormData({ ...formData, includeDataFlow: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="includeDataFlow" className="text-slate-700 font-semibold">
                      Describe the data flow with this platform (optional)
                    </label>
                  </div>

                  {formData.includeDataFlow && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Data exchanged</label>
                        <input
                          type="text"
                          placeholder="e.g. Customer tickets, contact records"
                          value={formData.dataFlowDataExchanged}
                          onChange={(e) => setFormData({ ...formData, dataFlowDataExchanged: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Direction</label>
                        <select
                          value={formData.dataFlowDirection}
                          onChange={(e) =>
                            setFormData({ ...formData, dataFlowDirection: e.target.value as 'inbound' | 'outbound' | 'bidirectional' })
                          }
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                        >
                          <option value="inbound">Inbound</option>
                          <option value="outbound">Outbound</option>
                          <option value="bidirectional">Bidirectional</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Criticality</label>
                        <select
                          value={formData.dataFlowCriticality}
                          onChange={(e) => setFormData({ ...formData, dataFlowCriticality: e.target.value as 'High' | 'Medium' | 'Low' })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200/80 text-[11px] text-blue-900">
                Registering this item connects it to the AI Estate Map and updates portfolio metrics automatically.
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={closeRegisterModal}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-medium text-xs"
              >
                Save Draft
              </button>

              {step < 5 ? (
                <button
                  key="next-button"
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  key="submit-button"
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>Submit Record</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
