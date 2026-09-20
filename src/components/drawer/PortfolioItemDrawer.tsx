import React, { useEffect, useState } from 'react';
import { Info, X, Server, Layers, Kanban, Link2 } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Drawer } from '../Drawer';
import { DrawerSection } from '../DrawerSection';
import { SearchableSelect } from '../SearchableSelect';
import { ValueHypothesisForm } from '../ValueHypothesisForm';
import { CostRecordForm } from '../CostRecordForm';
import { ESTATE_RECORD_TYPES, DRAWER_LIFECYCLE_OPTIONS } from '../../data/configData';
import { CostRecord, EstateRecordType, LifecycleStage, ValueHypothesis } from '../../types';
import { firstYearCostTotal, developmentCostTotal } from '../../lib/valueCalculations';

const emptyCostRecord: CostRecord = {};
const emptyValueHypothesis: ValueHypothesis = { status: 'Not defined' };

const emptyForm = (preset?: EstateRecordType) => ({
  name: '',
  type: (preset || 'Agent') as EstateRecordType,
  description: '',
  businessUnitId: undefined as string | undefined,
  lifecycleStage: 'Ideation' as LifecycleStage,
  businessOwnerId: undefined as string | undefined,
  technicalOwnerId: undefined as string | undefined,
  teamId: undefined as string | undefined,
  supportTeamId: undefined as string | undefined,
  costRecord: emptyCostRecord,
  outcomeName: '',
  outcomeDescription: '',
  valueHypothesis: emptyValueHypothesis,
  platformId: undefined as string | undefined,
  applicationId: undefined as string | undefined,
  initiativeId: undefined as string | undefined,
  dependsOnIds: [] as string[],
  provider: '',
  productName: '',
  licensingModel: '',
  contractRenewalDate: '',
});

export const PortfolioItemDrawer: React.FC = () => {
  const {
    isEstateDrawerOpen,
    estateDrawerPreset,
    closeEstateItemDrawer,
    addItem,
    items,
    initiatives,
    businessUnits,
    people,
    teams,
    addPerson,
    addTeam,
    addBusinessUnit,
  } = usePortfolio();

  const [formData, setFormData] = useState(emptyForm());
  const [nameError, setNameError] = useState<string | null>(null);
  const [ownerError, setOwnerError] = useState<string | null>(null);

  useEffect(() => {
    if (isEstateDrawerOpen) {
      setFormData(emptyForm(estateDrawerPreset));
      setNameError(null);
      setOwnerError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEstateDrawerOpen, estateDrawerPreset]);

  if (!isEstateDrawerOpen) return null;

  const activeBusinessUnits = businessUnits.filter((b) => b.status === 'Active');
  const activePeople = people.filter((p) => p.status === 'Active');
  const activeTeams = teams.filter((t) => t.status === 'Active');
  const platforms = items.filter((i) => i.type === 'Platform');
  const applications = items.filter((i) => i.type === 'Application');
  const dependableItems = items.filter((i) => i.type !== 'Platform' || true); // any estate item can be a dependency

  const businessUnitOptions = activeBusinessUnits.map((b) => ({ id: b.id, label: b.name }));
  const peopleOptions = activePeople.map((p) => ({ id: p.id, label: p.name, sublabel: p.roleTitle }));
  const teamOptions = activeTeams.map((t) => ({ id: t.id, label: t.name }));
  const platformOptions = platforms.map((p) => ({ id: p.id, label: p.name, sublabel: p.provider }));
  const applicationOptions = applications.map((a) => ({ id: a.id, label: a.name }));
  const initiativeOptions = initiatives.map((i) => ({ id: i.id, label: i.name }));
  const dependencyOptions = dependableItems
    .filter((i) => i.id !== undefined)
    .map((i) => ({ id: i.id, label: i.name, sublabel: i.type }));

  const handleSave = () => {
    let valid = true;
    if (!formData.name.trim()) {
      setNameError('Name is required');
      valid = false;
    }
    if (!formData.businessOwnerId) {
      setOwnerError('A business owner is required');
      valid = false;
    }
    if (!valid) return;

    const selectedBU = activeBusinessUnits.find((b) => b.id === formData.businessUnitId);
    const selectedOwner = activePeople.find((p) => p.id === formData.businessOwnerId);
    const selectedTechOwner = activePeople.find((p) => p.id === formData.technicalOwnerId);
    const selectedTeam = activeTeams.find((t) => t.id === formData.teamId);
    const selectedSupportTeam = activeTeams.find((t) => t.id === formData.supportTeamId);
    const selectedPlatform = platforms.find((p) => p.id === formData.platformId);
    const selectedApp = applications.find((a) => a.id === formData.applicationId);
    const selectedInitiative = initiatives.find((i) => i.id === formData.initiativeId);

    const rels: { targetId: string; type: 'Built on' | 'Uses' | 'Part of' | 'Depends on' }[] = [];
    if (formData.platformId) rels.push({ targetId: formData.platformId, type: 'Built on' });
    if (formData.applicationId) rels.push({ targetId: formData.applicationId, type: 'Uses' });
    if (formData.initiativeId) rels.push({ targetId: formData.initiativeId, type: 'Part of' });
    formData.dependsOnIds.forEach((depId) => rels.push({ targetId: depId, type: 'Depends on' }));

    addItem(
      {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description || 'No description provided yet.',
        department: selectedBU?.name || 'Other',
        businessUnitId: formData.businessUnitId,
        lifecycleStage: formData.lifecycleStage,
        status: 'Planning',
        businessOwner: selectedOwner?.name,
        businessOwnerId: formData.businessOwnerId,
        technicalOwner: selectedTechOwner?.name,
        technicalOwnerId: formData.technicalOwnerId,
        team: selectedTeam?.name,
        teamId: formData.teamId,
        supportTeam: selectedSupportTeam?.name,
        supportTeamId: formData.supportTeamId,
        annualCost: firstYearCostTotal(formData.costRecord),
        devCost: developmentCostTotal(formData.costRecord),
        opsCost: formData.costRecord.operatingCost,
        sharedCost: formData.costRecord.operatingBreakdown?.platformLicensing,
        externalConsultancyCost: formData.costRecord.developmentBreakdown?.externalConsultancy,
        internalTeamCost: formData.costRecord.developmentBreakdown?.internalEffort,
        isCostEstimated: !(formData.costRecord.developmentConfirmed && formData.costRecord.operatingConfirmed),
        costRecord: formData.costRecord,
        provider: formData.type === 'Platform' ? formData.provider || undefined : undefined,
        productName: formData.type === 'Platform' ? formData.productName || undefined : undefined,
        licensingModel: formData.type === 'Platform' ? formData.licensingModel || undefined : undefined,
        contractRenewalDate: formData.type === 'Platform' ? formData.contractRenewalDate || undefined : undefined,
        valueEvidenceStatus: formData.valueHypothesis.status === 'Not defined' ? 'None' : 'In progress',
        intendedOutcome: formData.outcomeDescription || undefined,
        outcome: formData.outcomeName.trim()
          ? {
              name: formData.outcomeName,
              category: formData.valueHypothesis.benefitCategory || '',
              description: formData.outcomeDescription,
              businessOwner: selectedOwner?.name,
            }
          : undefined,
        valueHypothesis: formData.valueHypothesis,
        platformId: formData.platformId,
        platformName: selectedPlatform?.name,
        applicationId: formData.applicationId,
        applicationName: selectedApp?.name,
        initiativeId: formData.initiativeId,
        initiativeName: selectedInitiative?.name,
        dependencies: [],
      },
      rels
    );
  };

  return (
    <Drawer
      open={isEstateDrawerOpen}
      onClose={closeEstateItemDrawer}
      title="Add portfolio item"
      supportingText="Capture what you know now. Additional information can be added later."
      footer={
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={closeEstateItemDrawer}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Save draft
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Create record
            </button>
          </div>
        </div>
      }
    >
      {/* BASIC DETAILS - expanded by default */}
      <DrawerSection title="Basic details" defaultOpen>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="drawer-name-input"
            type="text"
            placeholder="e.g. Customer Support Agent"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (nameError) setNameError(null);
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
          />
          {nameError && <p className="text-rose-500 text-[11px] mt-1">{nameError}</p>}
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Record type <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as EstateRecordType })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
          >
            {ESTATE_RECORD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Description / purpose</label>
          <textarea
            rows={2}
            placeholder="What does this do, and why does it exist?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Business unit</label>
          <SearchableSelect
            value={formData.businessUnitId}
            onChange={(id) => setFormData({ ...formData, businessUnitId: id })}
            options={businessUnitOptions}
            placeholder="Search business units..."
            emptyLabel="Not assigned"
            addNewLabel="Add new business unit"
            onAddNew={(name) => {
              const created = addBusinessUnit({ name, code: name.slice(0, 3).toUpperCase(), status: 'Active' });
              return created ? { id: created.id, label: created.name } : undefined;
            }}
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Lifecycle stage</label>
          <select
            value={formData.lifecycleStage}
            onChange={(e) => setFormData({ ...formData, lifecycleStage: e.target.value as LifecycleStage })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
          >
            {DRAWER_LIFECYCLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {formData.type === 'Platform' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Provider</label>
                <input
                  type="text"
                  placeholder="e.g. Microsoft"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product name</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Licensing model</label>
                <input
                  type="text"
                  placeholder="e.g. Per-seat subscription"
                  value={formData.licensingModel}
                  onChange={(e) => setFormData({ ...formData, licensingModel: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contract / renewal date</label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={formData.contractRenewalDate}
                  onChange={(e) => setFormData({ ...formData, contractRenewalDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </>
        )}
      </DrawerSection>

      {/* OWNERSHIP - expanded by default since business owner is required */}
      <DrawerSection title="Ownership" description="Who is accountable for this record." defaultOpen>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Business owner <span className="text-rose-500">*</span>
          </label>
          <SearchableSelect
            value={formData.businessOwnerId}
            onChange={(id) => {
              setFormData({ ...formData, businessOwnerId: id });
              if (ownerError) setOwnerError(null);
            }}
            options={peopleOptions}
            placeholder="Search people..."
            emptyLabel="Not assigned"
            addNewLabel="Add new person"
            onAddNew={(name) => {
              const created = addPerson({ name, status: 'Active' });
              return created ? { id: created.id, label: created.name } : undefined;
            }}
          />
          {ownerError && <p className="text-rose-500 text-[11px] mt-1">{ownerError}</p>}
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Technical owner</label>
          <SearchableSelect
            value={formData.technicalOwnerId}
            onChange={(id) => setFormData({ ...formData, technicalOwnerId: id })}
            options={peopleOptions}
            placeholder="Search people..."
            emptyLabel="Not assigned"
            addNewLabel="Add new person"
            onAddNew={(name) => {
              const created = addPerson({ name, status: 'Active' });
              return created ? { id: created.id, label: created.name } : undefined;
            }}
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Delivery team</label>
          <SearchableSelect
            value={formData.teamId}
            onChange={(id) => setFormData({ ...formData, teamId: id })}
            options={teamOptions}
            placeholder="Search teams..."
            emptyLabel="Not assigned"
            addNewLabel="Add new team"
            onAddNew={(name) => {
              const created = addTeam({ name, status: 'Active' });
              return created ? { id: created.id, label: created.name } : undefined;
            }}
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Support team, if known</label>
          <SearchableSelect
            value={formData.supportTeamId}
            onChange={(id) => setFormData({ ...formData, supportTeamId: id })}
            options={teamOptions}
            placeholder="Search teams..."
            emptyLabel="Not assigned"
            addNewLabel="Add new team"
            onAddNew={(name) => {
              const created = addTeam({ name, status: 'Active' });
              return created ? { id: created.id, label: created.name } : undefined;
            }}
          />
        </div>
      </DrawerSection>

      {/* FINANCIALS - collapsed by default */}
      <DrawerSection title="Financials" description="Development cost is one-off; operating cost recurs annually. Nothing is treated as £0 unless you say so.">
        <CostRecordForm
          value={formData.costRecord}
          onChange={(cr) => setFormData({ ...formData, costRecord: cr })}
        />
        <button
          type="button"
          onClick={() => setFormData({ ...formData, costRecord: emptyCostRecord })}
          className="text-[11px] text-slate-400 hover:text-slate-600"
        >
          Clear financial information
        </button>
      </DrawerSection>

      {/* INTENDED VALUE - collapsible */}
      <DrawerSection title="Intended value" description="Plain language, not a formal business case.">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Intended outcome</label>
          <input
            type="text"
            placeholder="e.g. Reduce Tier-1 support handling time"
            value={formData.outcomeName}
            onChange={(e) => setFormData({ ...formData, outcomeName: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Outcome description</label>
          <textarea
            rows={2}
            placeholder="What should be true if this succeeds?"
            value={formData.outcomeDescription}
            onChange={(e) => setFormData({ ...formData, outcomeDescription: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>
        <ValueHypothesisForm
          value={formData.valueHypothesis}
          onChange={(vh) => setFormData({ ...formData, valueHypothesis: vh })}
        />
      </DrawerSection>

      {/* CONNECTIONS - collapsed by default */}
      <DrawerSection title="Connections" description="Link this record to existing entities. Data-flow mapping can be added later.">
        <div>
          <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-blue-600" />
            Built on platform
          </label>
          <SearchableSelect
            value={formData.platformId}
            onChange={(id) => setFormData({ ...formData, platformId: id })}
            options={platformOptions}
            placeholder="Search platforms..."
            emptyLabel="None"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            Uses application
          </label>
          <SearchableSelect
            value={formData.applicationId}
            onChange={(id) => setFormData({ ...formData, applicationId: id })}
            options={applicationOptions}
            placeholder="Search applications..."
            emptyLabel="None"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Kanban className="w-3.5 h-3.5 text-purple-600" />
            Related initiative
          </label>
          <SearchableSelect
            value={formData.initiativeId}
            onChange={(id) => setFormData({ ...formData, initiativeId: id })}
            options={initiativeOptions}
            placeholder="Search initiatives..."
            emptyLabel="None"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-slate-500" />
            Depends on estate item
          </label>
          <SearchableSelect
            value={undefined}
            onChange={(id) => {
              if (id && !formData.dependsOnIds.includes(id)) {
                setFormData({ ...formData, dependsOnIds: [...formData.dependsOnIds, id] });
              }
            }}
            options={dependencyOptions.filter((o) => !formData.dependsOnIds.includes(o.id))}
            placeholder="Search estate items..."
            emptyLabel="Add a dependency..."
          />
          {formData.dependsOnIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {formData.dependsOnIds.map((depId) => {
                const dep = dependableItems.find((i) => i.id === depId);
                if (!dep) return null;
                return (
                  <span
                    key={depId}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-[11px] text-slate-700"
                  >
                    {dep.name}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, dependsOnIds: formData.dependsOnIds.filter((id) => id !== depId) })}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Data-flow details (direction, data exchanged, criticality) can be added from the item's detail page later.</span>
        </div>
      </DrawerSection>
    </Drawer>
  );
};
