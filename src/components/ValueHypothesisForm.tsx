import React from 'react';
import { CalculationMethod, ConfidenceLevel, ValueHypothesis, ValueHypothesisStatus } from '../types';
import {
  calculationBasisText,
  calculationMethodLabel,
  deriveEstimatedAnnualBenefit,
  formatGBP,
} from '../lib/valueCalculations';
import { usePortfolio } from '../context/PortfolioContext';

const STATUS_OPTIONS: ValueHypothesisStatus[] = [
  'Not defined',
  'Hypothesis',
  'Estimated',
  'Validated',
  'Realised',
];

const CONFIDENCE_OPTIONS: ConfidenceLevel[] = ['Low', 'Medium', 'High'];

interface ValueHypothesisFormProps {
  value: ValueHypothesis;
  onChange: (vh: ValueHypothesis) => void;
}

/**
 * Shared calculator for defining a value hypothesis: expected benefit,
 * calculation method (productivity / cost reduction / manual), inputs,
 * and confidence. Reused by the registration workflow and the item
 * detail page's Outcomes tab edit mode, so the calculation logic and
 * transparency requirements stay identical in both places.
 */
export const ValueHypothesisForm: React.FC<ValueHypothesisFormProps> = ({ value, onChange }) => {
  const { benefitCategories } = usePortfolio();
  const activeCategories = benefitCategories.filter((c) => c.status === 'Active');

  const commit = (patch: Partial<ValueHypothesis>) => {
    const next: ValueHypothesis = { ...value, ...patch };
    next.estimatedAnnualBenefit = deriveEstimatedAnnualBenefit(next) ?? next.estimatedAnnualBenefit;
    onChange(next);
  };

  const setMethod = (method: CalculationMethod | '') => {
    if (!method) {
      commit({ calculationMethod: undefined, estimatedAnnualBenefit: undefined });
      return;
    }
    commit({ calculationMethod: method });
  };

  const showMethodInputs = value.status !== 'Not defined' && value.status !== 'Hypothesis';
  const liveEstimate = deriveEstimatedAnnualBenefit(value);
  const basisText = calculationBasisText(value);

  return (
    <div className="space-y-4 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Benefit category</label>
          <select
            value={value.benefitCategory || ''}
            onChange={(e) => commit({ benefitCategory: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="">Not set</option>
            {activeCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Value status</label>
          <select
            value={value.status}
            onChange={(e) => commit({ status: e.target.value as ValueHypothesisStatus })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Expected benefit</label>
        <textarea
          rows={2}
          placeholder="e.g. Reduced average handling time per support ticket"
          value={value.expectedBenefit || ''}
          onChange={(e) => commit({ expectedBenefit: e.target.value })}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
        />
      </div>

      {showMethodInputs && (
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Calculation method</label>
            <select
              value={value.calculationMethod || ''}
              onChange={(e) => setMethod(e.target.value as CalculationMethod | '')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">Not calculated yet</option>
              <option value="productivity">Productivity / time-saving</option>
              <option value="cost-reduction">Cost reduction</option>
              <option value="manual">Manual estimate</option>
            </select>
          </div>

          {value.calculationMethod === 'productivity' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Annual transaction volume</label>
                <input
                  type="number"
                  value={value.productivityInputs?.annualVolume ?? ''}
                  onChange={(e) =>
                    commit({
                      productivityInputs: {
                        annualVolume: Number(e.target.value),
                        timeSavedPerTransactionHours: value.productivityInputs?.timeSavedPerTransactionHours ?? 0,
                        costPerHour: value.productivityInputs?.costPerHour ?? 0,
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Time saved / transaction (hrs)</label>
                <input
                  type="number"
                  step="0.01"
                  value={value.productivityInputs?.timeSavedPerTransactionHours ?? ''}
                  onChange={(e) =>
                    commit({
                      productivityInputs: {
                        annualVolume: value.productivityInputs?.annualVolume ?? 0,
                        timeSavedPerTransactionHours: Number(e.target.value),
                        costPerHour: value.productivityInputs?.costPerHour ?? 0,
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Cost per hour (£)</label>
                <input
                  type="number"
                  value={value.productivityInputs?.costPerHour ?? ''}
                  onChange={(e) =>
                    commit({
                      productivityInputs: {
                        annualVolume: value.productivityInputs?.annualVolume ?? 0,
                        timeSavedPerTransactionHours: value.productivityInputs?.timeSavedPerTransactionHours ?? 0,
                        costPerHour: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>
          )}

          {value.calculationMethod === 'cost-reduction' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Current annual cost (£)</label>
                <input
                  type="number"
                  value={value.costReductionInputs?.currentAnnualCost ?? ''}
                  onChange={(e) =>
                    commit({
                      costReductionInputs: {
                        currentAnnualCost: Number(e.target.value),
                        expectedFutureAnnualCost: value.costReductionInputs?.expectedFutureAnnualCost ?? 0,
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Expected future annual cost (£)</label>
                <input
                  type="number"
                  value={value.costReductionInputs?.expectedFutureAnnualCost ?? ''}
                  onChange={(e) =>
                    commit({
                      costReductionInputs: {
                        currentAnnualCost: value.costReductionInputs?.currentAnnualCost ?? 0,
                        expectedFutureAnnualCost: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>
          )}

          {value.calculationMethod === 'manual' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Explanation</label>
                <textarea
                  rows={2}
                  value={value.manualInputs?.explanation || ''}
                  onChange={(e) => commit({ manualInputs: { explanation: e.target.value } })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Estimated annual benefit (£)</label>
                <input
                  type="number"
                  value={value.estimatedAnnualBenefit ?? ''}
                  onChange={(e) => commit({ estimatedAnnualBenefit: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>
          )}

          {value.calculationMethod && (
            <div className="p-2.5 rounded bg-white border border-slate-200 text-[11px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Calculation method</span>
                <span className="font-semibold text-slate-800">{calculationMethodLabel(value.calculationMethod)}</span>
              </div>
              {basisText && <div className="text-slate-500">{basisText}</div>}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-1">
                <span className="text-slate-500">Estimated annual benefit</span>
                <span className="font-bold text-slate-900">{formatGBP(liveEstimate)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Assumptions</label>
          <textarea
            rows={2}
            placeholder="State the inputs and assumptions behind this figure"
            value={value.assumptions || ''}
            onChange={(e) => commit({ assumptions: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Confidence level</label>
          <select
            value={value.confidenceLevel || ''}
            onChange={(e) => commit({ confidenceLevel: (e.target.value || undefined) as ConfidenceLevel | undefined })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="">Not set</option>
            {CONFIDENCE_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200/80 text-[11px] text-blue-900">
        This figure is an estimate based on the assumptions above, not a guaranteed or realised outcome. Only
        "Validated" or "Realised" status reflects a measured result.
      </div>
    </div>
  );
};
