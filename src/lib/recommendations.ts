import { EstateItem } from '../types';

export type RecommendationTarget = 'overview' | 'cost' | 'outcomes' | 'relationships';

export interface RecommendedAction {
  id: string;
  label: string;
  tab: RecommendationTarget;
  openEdit?: boolean;
  priority: number; // lower surfaces first
}

/**
 * Contextual, record-type and lifecycle-aware follow-up prompts - not a
 * completeness score. Every field carries equal weight nowhere here:
 * a production Agent is pushed harder on ownership, cost, platform and
 * data classification than an early-stage Experiment would be.
 */
export function getRecommendedActions(item: EstateItem): RecommendedAction[] {
  const actions: RecommendedAction[] = [];
  const isTechnical = item.type === 'Agent' || item.type === 'Embedded AI';
  const isProduction = item.lifecycleStage === 'Production';
  const isHighStakes = isTechnical && isProduction;

  const hasCost = item.costRecord
    ? item.costRecord.developmentCost !== undefined || item.costRecord.operatingCost !== undefined
    : item.annualCost !== undefined;

  if (!item.businessOwner) {
    actions.push({ id: 'owner', label: 'Assign a business owner', tab: 'overview', openEdit: true, priority: isHighStakes ? 1 : 3 });
  }
  if (!item.technicalOwner) {
    actions.push({ id: 'tech-owner', label: 'Add a technical owner', tab: 'overview', openEdit: true, priority: isHighStakes ? 2 : 5 });
  }
  if (!hasCost) {
    actions.push({ id: 'cost', label: 'Add an estimated cost', tab: 'cost', openEdit: true, priority: isHighStakes ? 1 : 4 });
  }
  if (isTechnical && !item.platformId && !item.platformName) {
    actions.push({ id: 'platform', label: 'Link a platform', tab: 'relationships', priority: isHighStakes ? 1 : 4 });
  }
  if (!item.valueHypothesis || item.valueHypothesis.status === 'Not defined') {
    actions.push({ id: 'value', label: 'Define the intended value', tab: 'outcomes', priority: 3 });
  }
  if (isHighStakes && !item.dataClassification) {
    actions.push({ id: 'data-classification', label: 'Set a data classification', tab: 'overview', openEdit: true, priority: 1 });
  }
  if (!item.description || item.description === 'No description provided yet.') {
    actions.push({ id: 'description', label: 'Add a description', tab: 'overview', openEdit: true, priority: 2 });
  }

  return actions.sort((a, b) => a.priority - b.priority);
}
