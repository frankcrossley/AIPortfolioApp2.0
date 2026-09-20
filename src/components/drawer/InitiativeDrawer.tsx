import React, { useEffect, useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Drawer } from '../Drawer';
import { DrawerSection } from '../DrawerSection';
import { SearchableSelect } from '../SearchableSelect';
import { DRAWER_LIFECYCLE_OPTIONS } from '../../data/configData';
import { LifecycleStage } from '../../types';

const emptyForm = () => ({
  name: '',
  description: '',
  businessUnitId: undefined as string | undefined,
  lifecycleStage: 'Ideation' as LifecycleStage,
  businessOwnerId: undefined as string | undefined,
  technicalOwnerId: undefined as string | undefined,
  teamId: undefined as string | undefined,
  sponsor: '',
  deliveryOwner: '',
  startDate: '',
  targetEndDate: '',
  budget: undefined as number | undefined,
});

/**
 * A lighter drawer for Initiatives - business/delivery efforts. This
 * iteration covers Basic details and Ownership only; cost, value and
 * connections for initiatives follow the same drawer pattern in a future
 * iteration once the estate-item flow above has settled.
 */
export const InitiativeDrawer: React.FC = () => {
  const {
    isInitiativeDrawerOpen,
    closeInitiativeDrawer,
    addInitiative,
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
    if (isInitiativeDrawerOpen) {
      setFormData(emptyForm());
      setNameError(null);
      setOwnerError(null);
    }
  }, [isInitiativeDrawerOpen]);

  if (!isInitiativeDrawerOpen) return null;

  const activeBusinessUnits = businessUnits.filter((b) => b.status === 'Active');
  const activePeople = people.filter((p) => p.status === 'Active');
  const activeTeams = teams.filter((t) => t.status === 'Active');

  const businessUnitOptions = activeBusinessUnits.map((b) => ({ id: b.id, label: b.name }));
  const peopleOptions = activePeople.map((p) => ({ id: p.id, label: p.name, sublabel: p.roleTitle }));
  const teamOptions = activeTeams.map((t) => ({ id: t.id, label: t.name }));

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

    addInitiative({
      name: formData.name.trim(),
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
      sponsor: formData.sponsor || undefined,
      deliveryOwner: formData.deliveryOwner || undefined,
      startDate: formData.startDate || undefined,
      targetEndDate: formData.targetEndDate || undefined,
      budget: formData.budget,
      valueEvidenceStatus: 'None',
    });
  };

  return (
    <Drawer
      open={isInitiativeDrawerOpen}
      onClose={closeInitiativeDrawer}
      title="Add initiative"
      supportingText="Capture what you know now. Additional information can be added later."
      footer={
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={closeInitiativeDrawer}
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
      <DrawerSection title="Basic details" defaultOpen>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Customer Service AI Transformation"
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
          <label className="block font-semibold text-slate-700 mb-1">Description / purpose</label>
          <textarea
            rows={2}
            placeholder="What is this initiative trying to achieve?"
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
      </DrawerSection>

      <DrawerSection title="Ownership" description="Who is accountable for this initiative." defaultOpen>
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
      </DrawerSection>

      <DrawerSection title="Programme details" description="Optional - add these when known.">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Sponsor</label>
            <input
              type="text"
              value={formData.sponsor}
              onChange={(e) => setFormData({ ...formData, sponsor: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Delivery owner</label>
            <input
              type="text"
              value={formData.deliveryOwner}
              onChange={(e) => setFormData({ ...formData, deliveryOwner: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Start date</label>
            <input
              type="text"
              placeholder="Optional"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target end date</label>
            <input
              type="text"
              placeholder="Optional"
              value={formData.targetEndDate}
              onChange={(e) => setFormData({ ...formData, targetEndDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Budget (£)</label>
          <input
            type="number"
            placeholder="Not provided"
            value={formData.budget ?? ''}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value === '' ? undefined : Number(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>
      </DrawerSection>
    </Drawer>
  );
};
