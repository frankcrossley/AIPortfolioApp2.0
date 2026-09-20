import React from 'react';
import { CostRecord } from '../types';
import { firstYearCostTotal, formatGBP } from '../lib/valueCalculations';

interface CostRecordFormProps {
  value: CostRecord;
  onChange: (record: CostRecord) => void;
}

/**
 * Shared editor for the two-bucket cost model: a one-off Development cost
 * (defaults to £0 - most records have no separate build spend) and a
 * recurring Operating cost (never defaulted to zero - shown as "not yet
 * estimated" until a figure is entered). Reused by the Add Estate Item
 * drawer and the record page's Costs tab so both stay identical.
 */
export const CostRecordForm: React.FC<CostRecordFormProps> = ({ value, onChange }) => {
  const commit = (patch: Partial<CostRecord>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-4 text-xs">
      {/* DEVELOPMENT COST */}
      <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            Development cost <span className="font-normal normal-case text-slate-400">· one-off</span>
          </div>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value.developmentConfirmed}
              onChange={(e) => commit({ developmentConfirmed: e.target.checked })}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Confirmed
          </label>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Total development cost (£)</label>
          <input
            type="number"
            placeholder="0"
            value={value.developmentCost ?? ''}
            onChange={(e) => commit({ developmentCost: e.target.value === '' ? undefined : Number(e.target.value) })}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
          />
          <p className="text-[10px] text-slate-400 mt-1">Defaults to £0 - most records have no separate build cost.</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-medium text-slate-500 mb-1">Internal team effort (£)</label>
            <input
              type="number"
              placeholder="Not provided"
              value={value.developmentBreakdown?.internalEffort ?? ''}
              onChange={(e) =>
                commit({
                  developmentBreakdown: {
                    ...value.developmentBreakdown,
                    internalEffort: e.target.value === '' ? undefined : Number(e.target.value),
                  },
                })
              }
              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-[11px]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-500 mb-1">External consultancy (£)</label>
            <input
              type="number"
              placeholder="Not provided"
              value={value.developmentBreakdown?.externalConsultancy ?? ''}
              onChange={(e) =>
                commit({
                  developmentBreakdown: {
                    ...value.developmentBreakdown,
                    externalConsultancy: e.target.value === '' ? undefined : Number(e.target.value),
                  },
                })
              }
              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-[11px]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-500 mb-1">Other (£)</label>
            <input
              type="number"
              placeholder="Not provided"
              value={value.developmentBreakdown?.other ?? ''}
              onChange={(e) =>
                commit({
                  developmentBreakdown: {
                    ...value.developmentBreakdown,
                    other: e.target.value === '' ? undefined : Number(e.target.value),
                  },
                })
              }
              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-[11px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-medium text-slate-500 mb-1">Description or calculation basis</label>
          <textarea
            rows={2}
            placeholder="Optional - where did this figure come from?"
            value={value.developmentBasis || ''}
            onChange={(e) => commit({ developmentBasis: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
          />
        </div>
      </div>

      {/* OPERATING COST */}
      <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            Operating cost <span className="font-normal normal-case text-slate-400">· recurring annual</span>
          </div>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value.operatingConfirmed}
              onChange={(e) => commit({ operatingConfirmed: e.target.checked })}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Confirmed
          </label>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Annual operating cost (£)</label>
          <input
            type="number"
            placeholder="Not yet estimated"
            value={value.operatingCost ?? ''}
            onChange={(e) => commit({ operatingCost: e.target.value === '' ? undefined : Number(e.target.value) })}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
          />
          <p className="text-[10px] text-slate-400 mt-1">Left blank, this shows as "Not yet estimated" - never as £0.</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-medium text-slate-500 mb-1">Platform / licensing (£)</label>
            <input
              type="number"
              placeholder="Not provided"
              value={value.operatingBreakdown?.platformLicensing ?? ''}
              onChange={(e) =>
                commit({
                  operatingBreakdown: {
                    ...value.operatingBreakdown,
                    platformLicensing: e.target.value === '' ? undefined : Number(e.target.value),
                  },
                })
              }
              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-[11px]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-500 mb-1">Infrastructure (£)</label>
            <input
              type="number"
              placeholder="Not provided"
              value={value.operatingBreakdown?.infrastructure ?? ''}
              onChange={(e) =>
                commit({
                  operatingBreakdown: {
                    ...value.operatingBreakdown,
                    infrastructure: e.target.value === '' ? undefined : Number(e.target.value),
                  },
                })
              }
              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-[11px]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-500 mb-1">Support & maintenance (£)</label>
            <input
              type="number"
              placeholder="Not provided"
              value={value.operatingBreakdown?.supportMaintenance ?? ''}
              onChange={(e) =>
                commit({
                  operatingBreakdown: {
                    ...value.operatingBreakdown,
                    supportMaintenance: e.target.value === '' ? undefined : Number(e.target.value),
                  },
                })
              }
              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-[11px]"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Source or notes</label>
        <textarea
          rows={2}
          placeholder="Optional - where did these figures come from?"
          value={value.sourceNotes || ''}
          onChange={(e) => commit({ sourceNotes: e.target.value })}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-2.5 rounded bg-blue-50/60 border border-blue-200/80">
          <div className="text-[10px] text-blue-800 font-semibold uppercase tracking-wide">Total first-year cost</div>
          <div className="text-sm font-bold text-blue-900 mt-0.5">{formatGBP(firstYearCostTotal(value))}</div>
        </div>
        <div className="p-2.5 rounded bg-blue-50/60 border border-blue-200/80">
          <div className="text-[10px] text-blue-800 font-semibold uppercase tracking-wide">Recurring annual cost</div>
          <div className="text-sm font-bold text-blue-900 mt-0.5">
            {value.operatingCost !== undefined ? formatGBP(value.operatingCost) : 'Not yet estimated'}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-slate-400">
        Development cost is a one-off spend; operating cost recurs every year after that.
      </p>
    </div>
  );
};
