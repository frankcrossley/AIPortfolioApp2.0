import {
  BenefitCategoryConfig,
  BusinessUnit,
  EstateRecordType,
  LifecycleStage,
  Person,
  RequiredFieldsConfig,
  ResourceRate,
  StrategicObjectiveConfig,
  Team,
} from '../types';

// ============================================================
// BUSINESS UNITS
// Feed portfolio filters, initiative registration, dashboard
// reporting, and cost/benefit roll-ups.
// ============================================================

// No business units are seeded by default - the account starts empty and
// is populated entirely from what the user sets up in Settings or the
// Add to Portfolio drawers.
export const INITIAL_BUSINESS_UNITS: BusinessUnit[] = [];

// ============================================================
// RESOURCE COST RATES
// No rates are seeded by default - added per account in Settings.
// ============================================================

export const INITIAL_RESOURCE_RATES: ResourceRate[] = [];

// ============================================================
// BENEFIT CATEGORIES
// No categories are seeded by default - added per account in Settings.
// ============================================================

export const INITIAL_BENEFIT_CATEGORIES: BenefitCategoryConfig[] = [];

// ============================================================
// STRATEGIC OBJECTIVES
// No objectives are seeded by default - added per account in Settings.
// ============================================================

export const INITIAL_STRATEGIC_OBJECTIVES: StrategicObjectiveConfig[] = [];

// Fixed scales used consistently across calculations and filters.
// Shown for governance reference in the Configuration Portal.
export const CONFIDENCE_LEVELS = ['Low', 'Medium', 'High'] as const;
export const AI_TYPES = ['Platform', 'Application', 'Agent', 'Initiative', 'Embedded AI', 'Experiment', 'Other'] as const;
export const LIFECYCLE_STAGES = ['Ideation', 'Evaluation', 'Development', 'Pilot', 'Production', 'In progress', 'Retired'] as const;
export const ITEM_STATUSES = ['Active', 'In progress', 'Planning', 'Under Review', 'On hold', 'Retired'] as const;

// ============================================================
// PEOPLE & TEAMS (master data)
// Backs the ownership searchable dropdowns in the Add Estate Item /
// Add Initiative drawers. No people or teams are seeded by default -
// added per account via "+ Add new person/team" or Settings.
// ============================================================

export const INITIAL_PEOPLE: Person[] = [];

export const INITIAL_TEAMS: Team[] = [];

// ============================================================
// ADD ESTATE ITEM DRAWER OPTIONS
// ============================================================

export const ESTATE_RECORD_TYPES: EstateRecordType[] = ['Agent', 'Application', 'Platform', 'Embedded AI', 'Experiment', 'Other'];

export const DRAWER_LIFECYCLE_OPTIONS: { value: LifecycleStage; label: string }[] = [
  { value: 'Ideation', label: 'Idea' },
  { value: 'Evaluation', label: 'Evaluation' },
  { value: 'Development', label: 'Development' },
  { value: 'Pilot', label: 'Pilot' },
  { value: 'Production', label: 'Production' },
  { value: 'Retired', label: 'Retired' },
];

// ============================================================
// REQUIRED FIELDS / DATA QUALITY
// Drives the Overview's information gap / management attention calculations.
// ============================================================

export const INITIAL_REQUIRED_FIELDS: RequiredFieldsConfig = {
  businessOwner: true,
  technicalOwner: false,
  businessUnit: true,
  estimatedAnnualCost: true,
  intendedOutcome: true,
  valueHypothesis: true,
};
