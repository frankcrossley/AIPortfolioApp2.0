import { EstateItem } from '../types';

export interface CompletenessResult {
  percent: number; // 0-100, rounded - a prompt, never a gate on saving
  label: string;
  missing: string[]; // human-readable labels of unanswered core questions
}

interface CompletenessCheck {
  key: string;
  label: string;
  applies: (item: EstateItem) => boolean;
  satisfied: (item: EstateItem) => boolean;
}

const isPlatform = (item: EstateItem) => item.type === 'Platform';

/**
 * The record page exists to answer six questions. Each check below maps to
 * one of them; "connections" doesn't apply to Platforms, since a platform's
 * meaningful connections are the things built on it, not something it
 * points outward to itself.
 */
const CHECKS: CompletenessCheck[] = [
  {
    key: 'what',
    label: 'A short description of what this is',
    applies: () => true,
    satisfied: (item) => !!item.description && item.description !== 'No description provided yet.',
  },
  {
    key: 'owner',
    label: 'A business owner',
    applies: () => true,
    satisfied: (item) => !!item.businessOwner,
  },
  {
    key: 'lifecycle',
    label: 'A lifecycle stage',
    applies: () => true,
    satisfied: (item) => !!item.lifecycleStage,
  },
  {
    key: 'cost',
    label: 'A development or operating cost estimate',
    applies: () => true,
    satisfied: (item) =>
      item.costRecord
        ? item.costRecord.developmentCost !== undefined || item.costRecord.operatingCost !== undefined
        : item.annualCost !== undefined,
  },
  {
    key: 'connections',
    label: 'What it connects to or depends on',
    applies: (item) => !isPlatform(item),
    satisfied: (item) =>
      !!item.platformId ||
      !!item.applicationId ||
      !!item.initiativeId ||
      (item.relatedEstateItemIds?.length ?? 0) > 0,
  },
  {
    key: 'purpose',
    label: 'The business purpose it serves',
    applies: () => true,
    satisfied: (item) => !!item.intendedOutcome || !!item.outcome?.description || !!item.outcome?.name,
  },
];

/**
 * Answers "how much do we actually know about this record" as a prompt to
 * fill in gaps over time - not a score to chase and never a reason to
 * block saving an incomplete record.
 */
export function getCompleteness(item: EstateItem): CompletenessResult {
  const applicable = CHECKS.filter((c) => c.applies(item));
  const missing = applicable.filter((c) => !c.satisfied(item));
  const answered = applicable.length - missing.length;
  const percent = applicable.length === 0 ? 100 : Math.round((answered / applicable.length) * 100);

  let label: string;
  if (percent >= 100) label = 'Complete record';
  else if (percent >= 70) label = 'Mostly complete';
  else if (percent >= 40) label = 'Initial record';
  else label = 'Minimal record';

  return { percent, label, missing: missing.map((c) => c.label) };
}
