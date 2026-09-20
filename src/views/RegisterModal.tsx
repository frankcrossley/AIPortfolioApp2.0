import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Server,
  Layers,
  Bot,
  Kanban,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  EstateItemType,
  LifecycleStage,
  ItemStatus,
  Priority,
  DataClassification,
  ValueEvidenceStatus,
} from '../types';

export const RegisterModal: React.FC = () => {
  const { isRegisterModalOpen, closeRegisterModal, addItem, items, showToast } = usePortfolio();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'Agent' as EstateItemType,
    lifecycleStage: 'Development' as LifecycleStage,
    status: 'Active' as ItemStatus,
    department: 'Customer Services',
    description: '',
    platformId: 'plt-2',
    applicationId: 'app-1',
    initiativeId: 'ini-1',
    businessOwner: '',
    technicalOwner: '',
    team: '',
    priority: 'High' as Priority,
    dataClassification: 'Internal' as DataClassification,
    annualCost: 120000,
    devCost: 70000,
    opsCost: 35000,
    sharedCost: 15000,
    isCostEstimated: false,
    valueEvidenceStatus: 'In progress' as ValueEvidenceStatus,
    intendedOutcome: '',
    dependencies: 'Knowledge Base API, Identity Service',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isRegisterModalOpen) return null;

  const platforms = items.filter((i) => i.type === 'Platform');
  const applications = items.filter((i) => i.type === 'Application');
  const initiatives = items.filter((i) => i.type === 'Initiative');

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.department) newErrors.department = 'Department is required';
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
    setStep((prev) => Math.min(prev + 1, 4) as 1 | 2 | 3 | 4);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1) as 1 | 2 | 3 | 4);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPlt = platforms.find((p) => p.id === formData.platformId);
    const selectedApp = applications.find((a) => a.id === formData.applicationId);
    const selectedIni = initiatives.find((i) => i.id === formData.initiativeId);

    const rels: { targetId: string; type: 'Built on' | 'Uses' | 'Part of' }[] = [];
    if (formData.platformId) {
      rels.push({ targetId: formData.platformId, type: 'Built on' });
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
        department: formData.department,
        businessOwner: formData.businessOwner,
        technicalOwner: formData.technicalOwner,
        team: formData.team || `${formData.department} Team`,
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
        annualCost: Number(formData.annualCost),
        devCost: Number(formData.devCost),
        opsCost: Number(formData.opsCost),
        sharedCost: Number(formData.sharedCost),
        isCostEstimated: formData.isCostEstimated,
        valueEvidenceStatus: formData.valueEvidenceStatus,
        intendedOutcome: formData.intendedOutcome,
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
        {/* Header matching screenshot 6 */}
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

        {/* Stepper matching screenshot 6 */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs font-medium shrink-0">
          {[
            { num: 1, label: 'Basic details' },
            { num: 2, label: 'Ownership' },
            { num: 3, label: 'Cost & outcomes' },
            { num: 4, label: 'Relationships' },
          ].map((s) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div
                key={s.num}
                className={`flex items-center gap-2 ${
                  isCurrent
                    ? 'text-blue-600 font-bold'
                    : isCompleted
                    ? 'text-slate-700 font-medium'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
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
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Customer Services">Customer Services</option>
                    <option value="IT & Digital">IT & Digital</option>
                    <option value="Finance">Finance</option>
                    <option value="HR">HR</option>
                    <option value="Operations">Operations</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </select>
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
                  <label className="block font-semibold text-slate-700 mb-1">Team / Business Unit</label>
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

          {/* STEP 3: COST & OUTCOMES */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Estimated Annual Cost (£)
                  </label>
                  <input
                    type="number"
                    value={formData.annualCost}
                    onChange={(e) => setFormData({ ...formData, annualCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Value Evidence Status
                  </label>
                  <select
                    value={formData.valueEvidenceStatus}
                    onChange={(e) => setFormData({ ...formData, valueEvidenceStatus: e.target.value as ValueEvidenceStatus })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Documented">Documented Evidence</option>
                    <option value="In progress">In Progress</option>
                    <option value="Planned">Planned</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              {/* Cost Breakdown Details */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg space-y-3">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Cost Breakdown (Optional)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Dev Cost (£)
                    </label>
                    <input
                      type="number"
                      value={formData.devCost}
                      onChange={(e) => setFormData({ ...formData, devCost: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Ops Cost (£)
                    </label>
                    <input
                      type="number"
                      value={formData.opsCost}
                      onChange={(e) => setFormData({ ...formData, opsCost: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Shared Platform (£)
                    </label>
                    <input
                      type="number"
                      value={formData.sharedCost}
                      onChange={(e) => setFormData({ ...formData, sharedCost: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
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
                  Mark as estimated cost only (flagged in Information Gaps if true)
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Intended Business Outcome
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Reduce first-tier ticket escalations by 30% and maintain customer satisfaction > 90%."
                  value={formData.intendedOutcome}
                  onChange={(e) => setFormData({ ...formData, intendedOutcome: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 4: RELATIONSHIPS */}
          {step === 4 && (
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

              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200/80 text-[11px] text-blue-900">
                Registering this item connects it to the AI Estate Map and updates portfolio metrics automatically.
              </div>
            </div>
          )}

          {/* Footer Actions matching screenshot 6 */}
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

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
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
