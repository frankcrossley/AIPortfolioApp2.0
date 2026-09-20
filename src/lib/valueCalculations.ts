import {
  CalculationMethod,
  CostRecord,
  CostReductionCalculationInputs,
  ProductivityCalculationInputs,
  ValueHypothesis,
} from '../types';

/**
 * Simple, transparent benefit calculations.
 * Every result must remain traceable to its inputs - no hidden multipliers.
 */

export function calculateProductivityBenefit(inputs: ProductivityCalculationInputs): number {
  const { annualVolume, timeSavedPerTransactionHours, costPerHour } = inputs;
  return Math.max(0, annualVolume) * Math.max(0, timeSavedPerTransactionHours) * Math.max(0, costPerHour);
}

export function calculateCostReductionBenefit(inputs: CostReductionCalculationInputs): number {
  const { currentAnnualCost, expectedFutureAnnualCost } = inputs;
  return Math.max(0, currentAnnualCost - expectedFutureAnnualCost);
}

/**
 * Derives the estimated annual benefit for a value hypothesis from its
 * chosen calculation method. Returns undefined when there isn't enough
 * information to quantify a figure (e.g. status is still 'Hypothesis').
 */
export function deriveEstimatedAnnualBenefit(vh: Pick<ValueHypothesis,
  'calculationMethod' | 'productivityInputs' | 'costReductionInputs' | 'manualInputs' | 'estimatedAnnualBenefit'
>): number | undefined {
  if (vh.calculationMethod === 'productivity' && vh.productivityInputs) {
    return calculateProductivityBenefit(vh.productivityInputs);
  }
  if (vh.calculationMethod === 'cost-reduction' && vh.costReductionInputs) {
    return calculateCostReductionBenefit(vh.costReductionInputs);
  }
  if (vh.calculationMethod === 'manual') {
    return vh.estimatedAnnualBenefit;
  }
  return undefined;
}

export function calculationMethodLabel(method?: CalculationMethod): string {
  switch (method) {
    case 'productivity':
      return 'Productivity / time-saving';
    case 'cost-reduction':
      return 'Cost reduction';
    case 'manual':
      return 'Manual estimate';
    default:
      return 'Not calculated';
  }
}

export function calculationBasisText(vh?: ValueHypothesis | null): string | null {
  if (!vh || !vh.calculationMethod) return null;
  if (vh.calculationMethod === 'productivity' && vh.productivityInputs) {
    const { annualVolume, timeSavedPerTransactionHours, costPerHour } = vh.productivityInputs;
    return `${annualVolume.toLocaleString()} transactions/year × ${timeSavedPerTransactionHours} hrs saved × £${costPerHour}/hr`;
  }
  if (vh.calculationMethod === 'cost-reduction' && vh.costReductionInputs) {
    const { currentAnnualCost, expectedFutureAnnualCost } = vh.costReductionInputs;
    return `£${currentAnnualCost.toLocaleString()} current annual cost − £${expectedFutureAnnualCost.toLocaleString()} expected future annual cost`;
  }
  if (vh.calculationMethod === 'manual') {
    return vh.manualInputs?.explanation || 'Manual estimate';
  }
  return null;
}

/**
 * Whether a value hypothesis status implies a validated (measured) figure
 * rather than a purely estimated one.
 */
export function isValidatedStatus(status?: string): boolean {
  return status === 'Validated' || status === 'Realised';
}

export function isQuantified(vh?: ValueHypothesis | null): boolean {
  return typeof vh?.estimatedAnnualBenefit === 'number' && !Number.isNaN(vh.estimatedAnnualBenefit);
}

export function formatGBP(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return 'Not provided';
  return `£${Math.round(value).toLocaleString()}`;
}

/**
 * Development cost is one-off and defaults to £0 when not broken down
 * further - most records genuinely have no separate build spend.
 */
export function developmentCostTotal(record?: CostRecord | null): number {
  return record?.developmentCost ?? 0;
}

/**
 * Operating cost is recurring and is never defaulted to zero - an unset
 * figure means "not yet estimated", not "no ongoing cost".
 */
export function operatingCostTotal(record?: CostRecord | null): number | undefined {
  return record?.operatingCost;
}

/** Development cost + first year of operating cost (0 if not yet estimated). */
export function firstYearCostTotal(record?: CostRecord | null): number {
  return developmentCostTotal(record) + (operatingCostTotal(record) ?? 0);
}

/** Recurring annual cost from year two onward. */
export function recurringAnnualCostTotal(record?: CostRecord | null): number | undefined {
  return operatingCostTotal(record);
}

/**
 * Total across both cost buckets, for backward-compatible display. Returns
 * undefined only when neither a development nor an operating figure has
 * ever been entered on the record.
 */
export function costRecordTotal(record?: CostRecord | null): number | undefined {
  if (!record) return undefined;
  if (record.developmentCost === undefined && record.operatingCost === undefined) return undefined;
  return firstYearCostTotal(record);
}

export function formatGBPCompact(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return 'Not provided';
  if (Math.abs(value) >= 1000000) return `£${(value / 1000000).toFixed(1)}m`;
  if (Math.abs(value) >= 1000) return `£${Math.round(value / 1000).toLocaleString()}k`;
  return `£${Math.round(value)}`;
}
