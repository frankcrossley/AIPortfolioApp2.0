import React, { useState } from 'react';
import { Plus, Pencil, Check, X, Building2, Coins, Tags, ListTree, ClipboardCheck } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Header } from '../components/Header';
import { BusinessUnit, ResourceRate, BenefitCategoryConfig, StrategicObjectiveConfig } from '../types';
import { AI_TYPES, LIFECYCLE_STAGES, ITEM_STATUSES, CONFIDENCE_LEVELS } from '../data/configData';

type SettingsTab = 'business-units' | 'resource-rates' | 'benefit-categories' | 'classifications' | 'required-fields';

const TABS: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'business-units', label: 'Business Units', icon: Building2 },
  { id: 'resource-rates', label: 'Resource Cost Rates', icon: Coins },
  { id: 'benefit-categories', label: 'Benefit Categories', icon: Tags },
  { id: 'classifications', label: 'Portfolio Classifications', icon: ListTree },
  { id: 'required-fields', label: 'Required Fields & Data Quality', icon: ClipboardCheck },
];

export const SettingsView: React.FC = () => {
  const [tab, setTab] = useState<SettingsTab>('business-units');

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-y-auto">
      <Header
        title="Configuration Portal"
        subtitle="Business units, cost rates, benefit categories and data-quality rules that drive the rest of the platform."
        showRegister={false}
      />

      <div className="p-8 max-w-6xl w-full mx-auto space-y-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  tab === t.id ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'business-units' && <BusinessUnitsTab />}
        {tab === 'resource-rates' && <ResourceRatesTab />}
        {tab === 'benefit-categories' && <BenefitCategoriesTab />}
        {tab === 'classifications' && <ClassificationsTab />}
        {tab === 'required-fields' && <RequiredFieldsTab />}
      </div>
    </div>
  );
};

const Card: React.FC<{ title: string; subtitle: string; children: React.ReactNode; action?: React.ReactNode }> = ({
  title,
  subtitle,
  children,
  action,
}) => (
  <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
    <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      {action}
    </div>
    {children}
  </div>
);

const StatusToggle: React.FC<{ status: 'Active' | 'Inactive'; onToggle: () => void }> = ({ status, onToggle }) => (
  <button
    onClick={onToggle}
    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
      status === 'Active'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100'
        : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
    }`}
  >
    {status}
  </button>
);

// ============================================================
// BUSINESS UNITS
// ============================================================

const BusinessUnitsTab: React.FC = () => {
  const { businessUnits, addBusinessUnit, updateBusinessUnit } = usePortfolio();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<BusinessUnit, 'id'>>({
    name: '',
    code: '',
    parentId: undefined,
    accountableOwner: '',
    status: 'Active',
  });

  const startEdit = (bu: BusinessUnit) => {
    setEditingId(bu.id);
    setDraft({ name: bu.name, code: bu.code, parentId: bu.parentId, accountableOwner: bu.accountableOwner, status: bu.status });
  };

  return (
    <Card
      title="Business Units"
      subtitle="Feed portfolio filters, initiative registration, dashboard reporting, and cost/benefit roll-ups."
      action={
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setDraft({ name: '', code: '', parentId: undefined, accountableOwner: '', status: 'Active' });
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md shadow-xs hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Add business unit
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-3">Code</th>
              <th className="py-3 px-3">Parent</th>
              <th className="py-3 px-3">Accountable owner</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isAdding && (
              <tr className="bg-blue-50/30">
                <td className="py-2 px-4">
                  <input
                    autoFocus
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="Name"
                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    value={draft.code}
                    onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                    placeholder="Code"
                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                  />
                </td>
                <td className="py-2 px-3">
                  <select
                    value={draft.parentId || ''}
                    onChange={(e) => setDraft({ ...draft, parentId: e.target.value || undefined })}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                  >
                    <option value="">None</option>
                    {businessUnits.map((bu) => (
                      <option key={bu.id} value={bu.id}>
                        {bu.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-3">
                  <input
                    value={draft.accountableOwner || ''}
                    onChange={(e) => setDraft({ ...draft, accountableOwner: e.target.value })}
                    placeholder="Owner"
                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                  />
                </td>
                <td className="py-2 px-3 text-slate-400">Active</td>
                <td className="py-2 px-4 text-right space-x-1">
                  <button
                    onClick={() => {
                      if (!draft.name.trim()) return;
                      addBusinessUnit(draft);
                      setIsAdding(false);
                    }}
                    className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setIsAdding(false)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            )}
            {businessUnits.map((bu) =>
              editingId === bu.id ? (
                <tr key={bu.id} className="bg-blue-50/30">
                  <td className="py-2 px-4">
                    <input
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      value={draft.code}
                      onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={draft.parentId || ''}
                      onChange={(e) => setDraft({ ...draft, parentId: e.target.value || undefined })}
                      className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                    >
                      <option value="">None</option>
                      {businessUnits.filter((b) => b.id !== bu.id).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    <input
                      value={draft.accountableOwner || ''}
                      onChange={(e) => setDraft({ ...draft, accountableOwner: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                    />
                  </td>
                  <td className="py-2 px-3 text-slate-400">{draft.status}</td>
                  <td className="py-2 px-4 text-right space-x-1">
                    <button
                      onClick={() => {
                        updateBusinessUnit(bu.id, draft);
                        setEditingId(null);
                      }}
                      className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={bu.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{bu.name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{bu.code}</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {businessUnits.find((b) => b.id === bu.parentId)?.name || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{bu.accountableOwner || '—'}</td>
                  <td className="py-2.5 px-3">
                    <StatusToggle
                      status={bu.status}
                      onToggle={() => updateBusinessUnit(bu.id, { status: bu.status === 'Active' ? 'Inactive' : 'Active' })}
                    />
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button onClick={() => startEdit(bu)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// ============================================================
// RESOURCE COST RATES
// ============================================================

const ResourceRatesTab: React.FC = () => {
  const { resourceRates, addResourceRate, updateResourceRate, businessUnits } = usePortfolio();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const emptyDraft: Omit<ResourceRate, 'id'> = {
    role: '',
    businessUnitId: undefined,
    costType: 'Internal',
    hourlyRate: 0,
    dailyRate: 0,
    overheadsIncluded: true,
    effectiveDate: new Date().toISOString().slice(0, 10),
    status: 'Active',
  };
  const [draft, setDraft] = useState<Omit<ResourceRate, 'id'>>(emptyDraft);

  const startEdit = (r: ResourceRate) => {
    setEditingId(r.id);
    setDraft({ ...r });
  };

  const RateForm: React.FC<{ onSave: () => void; onCancel: () => void }> = ({ onSave, onCancel }) => (
    <tr className="bg-blue-50/30">
      <td className="py-2 px-4">
        <input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="Role" className="w-full px-2 py-1 border border-slate-200 rounded text-xs" />
      </td>
      <td className="py-2 px-3">
        <select value={draft.businessUnitId || ''} onChange={(e) => setDraft({ ...draft, businessUnitId: e.target.value || undefined })} className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white">
          <option value="">Role-level (all)</option>
          {businessUnits.map((bu) => (
            <option key={bu.id} value={bu.id}>{bu.name}</option>
          ))}
        </select>
      </td>
      <td className="py-2 px-3">
        <select value={draft.costType} onChange={(e) => setDraft({ ...draft, costType: e.target.value as ResourceRate['costType'] })} className="w-full px-2 py-1 border border-slate-200 rounded text-xs bg-white">
          <option value="Internal">Internal</option>
          <option value="Consultant">Consultant</option>
          <option value="Contractor">Contractor</option>
        </select>
      </td>
      <td className="py-2 px-3">
        <input type="number" value={draft.hourlyRate} onChange={(e) => setDraft({ ...draft, hourlyRate: Number(e.target.value) })} className="w-20 px-2 py-1 border border-slate-200 rounded text-xs" />
      </td>
      <td className="py-2 px-3">
        <input type="number" value={draft.dailyRate} onChange={(e) => setDraft({ ...draft, dailyRate: Number(e.target.value) })} className="w-20 px-2 py-1 border border-slate-200 rounded text-xs" />
      </td>
      <td className="py-2 px-3 text-center">
        <input type="checkbox" checked={draft.overheadsIncluded} onChange={(e) => setDraft({ ...draft, overheadsIncluded: e.target.checked })} />
      </td>
      <td className="py-2 px-4 text-right space-x-1">
        <button onClick={onSave} className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded"><Check className="w-3.5 h-3.5" /></button>
        <button onClick={onCancel} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded"><X className="w-3.5 h-3.5" /></button>
      </td>
    </tr>
  );

  return (
    <Card
      title="Resource Cost Rates"
      subtitle="Illustrative sample data. Supports blended rates at role level, or overridden per business unit."
      action={
        <button
          onClick={() => { setIsAdding(true); setEditingId(null); setDraft(emptyDraft); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md shadow-xs hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Add rate
        </button>
      }
    >
      <div className="px-5 pt-3 text-[11px] text-amber-700 bg-amber-50 border-b border-amber-100 py-2">
        Sample data for illustration only - replace with your organisation's actual blended rates.
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-3">Business unit</th>
              <th className="py-3 px-3">Cost type</th>
              <th className="py-3 px-3">Hourly (£)</th>
              <th className="py-3 px-3">Daily (£)</th>
              <th className="py-3 px-3 text-center">Overheads</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isAdding && (
              <RateForm
                onSave={() => { if (!draft.role.trim()) return; addResourceRate(draft); setIsAdding(false); }}
                onCancel={() => setIsAdding(false)}
              />
            )}
            {resourceRates.map((r) =>
              editingId === r.id ? (
                <RateForm
                  key={r.id}
                  onSave={() => { updateResourceRate(r.id, draft); setEditingId(null); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{r.role}</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {businessUnits.find((bu) => bu.id === r.businessUnitId)?.name || 'Role-level (all)'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{r.costType}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">£{r.hourlyRate}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">£{r.dailyRate}</td>
                  <td className="py-2.5 px-3 text-center">{r.overheadsIncluded ? 'Yes' : 'No'}</td>
                  <td className="py-2.5 px-4 text-right space-x-1">
                    <button onClick={() => startEdit(r)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <StatusToggle status={r.status} onToggle={() => updateResourceRate(r.id, { status: r.status === 'Active' ? 'Inactive' : 'Active' })} />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// ============================================================
// BENEFIT CATEGORIES
// ============================================================

const BenefitCategoriesTab: React.FC = () => {
  const { benefitCategories, addBenefitCategory, updateBenefitCategory } = usePortfolio();
  const [newName, setNewName] = useState('');

  return (
    <Card title="Benefit Categories" subtitle="Selectable when defining an initiative's value hypothesis.">
      <div className="p-5 space-y-2">
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New benefit category"
            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
          />
          <button
            onClick={() => {
              if (!newName.trim()) return;
              addBenefitCategory({ name: newName, status: 'Active' });
              setNewName('');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        <div className="divide-y divide-slate-100 pt-2">
          {benefitCategories.map((cat: BenefitCategoryConfig) => (
            <div key={cat.id} className="flex items-center justify-between py-2.5 text-xs">
              <span className="font-medium text-slate-800">{cat.name}</span>
              <StatusToggle status={cat.status} onToggle={() => updateBenefitCategory(cat.id, { status: cat.status === 'Active' ? 'Inactive' : 'Active' })} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// ============================================================
// PORTFOLIO CLASSIFICATIONS
// ============================================================

const ClassificationsTab: React.FC = () => {
  const { strategicObjectives, addStrategicObjective, updateStrategicObjective } = usePortfolio();
  const [newObjective, setNewObjective] = useState('');

  const ReferenceList: React.FC<{ title: string; items: readonly string[] }> = ({ title, items }) => (
    <div>
      <div className="text-xs font-semibold text-slate-700 mb-2">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((i) => (
          <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
            {i}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card title="Strategic Objectives" subtitle="Editable list, selectable on an initiative's intended outcome.">
        <div className="p-5 space-y-2">
          <div className="flex gap-2">
            <input
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              placeholder="New strategic objective"
              className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
            />
            <button
              onClick={() => {
                if (!newObjective.trim()) return;
                addStrategicObjective({ name: newObjective, status: 'Active' });
                setNewObjective('');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md shadow-xs hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          <div className="divide-y divide-slate-100 pt-2">
            {strategicObjectives.map((obj: StrategicObjectiveConfig) => (
              <div key={obj.id} className="flex items-center justify-between py-2.5 text-xs">
                <span className="font-medium text-slate-800">{obj.name}</span>
                <StatusToggle status={obj.status} onToggle={() => updateStrategicObjective(obj.id, { status: obj.status === 'Active' ? 'Inactive' : 'Active' })} />
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card title="Core Classifications" subtitle="System-defined and used throughout calculations and filters. Shown here for governance reference.">
        <div className="p-5 space-y-5">
          <ReferenceList title="AI types" items={AI_TYPES} />
          <ReferenceList title="Lifecycle stages" items={LIFECYCLE_STAGES} />
          <ReferenceList title="Statuses" items={ITEM_STATUSES} />
          <ReferenceList title="Confidence levels" items={CONFIDENCE_LEVELS} />
        </div>
      </Card>
    </div>
  );
};

// ============================================================
// REQUIRED FIELDS / DATA QUALITY
// ============================================================

const RequiredFieldsTab: React.FC = () => {
  const { requiredFields, updateRequiredFields } = usePortfolio();

  const FIELDS: { key: keyof typeof requiredFields; label: string }[] = [
    { key: 'businessOwner', label: 'Business owner' },
    { key: 'technicalOwner', label: 'Technical owner' },
    { key: 'businessUnit', label: 'Business unit' },
    { key: 'estimatedAnnualCost', label: 'Estimated annual cost' },
    { key: 'intendedOutcome', label: 'Intended outcome' },
    { key: 'valueHypothesis', label: 'Value hypothesis' },
  ];

  return (
    <Card
      title="Required Fields & Data Quality"
      subtitle="Mark which fields matter most - these drive the Information Gaps and Management Attention panels on the Overview dashboard."
    >
      <div className="p-5 divide-y divide-slate-100">
        {FIELDS.map((f) => (
          <div key={f.key} className="flex items-center justify-between py-3 text-xs">
            <span className="font-medium text-slate-800">{f.label}</span>
            <button
              onClick={() => updateRequiredFields({ [f.key]: !requiredFields[f.key] })}
              className={`relative w-9 h-5 rounded-full transition-colors ${requiredFields[f.key] ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  requiredFields[f.key] ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};
