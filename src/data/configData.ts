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

export const INITIAL_BUSINESS_UNITS: BusinessUnit[] = [
  { id: 'bu-cs', name: 'Customer Services', code: 'CS', accountableOwner: 'Elena Rostova', status: 'Active' },
  { id: 'bu-fin', name: 'Finance', code: 'FIN', accountableOwner: 'Rachel Green', status: 'Active' },
  { id: 'bu-hr', name: 'HR', code: 'HR', accountableOwner: 'Sarah Jenkins', status: 'Active' },
  { id: 'bu-it', name: 'IT & Digital', code: 'ITD', accountableOwner: 'Mark Taylor', status: 'Active' },
  { id: 'bu-ops', name: 'Operations', code: 'OPS', accountableOwner: 'Liam Cooper', status: 'Active' },
  { id: 'bu-mktg', name: 'Marketing', code: 'MKT', accountableOwner: 'Marcus Lee', status: 'Active' },
  { id: 'bu-sales', name: 'Sales', code: 'SLS', accountableOwner: 'Elena Rostova', status: 'Active' },
  { id: 'bu-other', name: 'Other', code: 'OTH', parentId: undefined, status: 'Active' },
];

// Maps the legacy free-text `department` field on EstateItem to a
// configured Business Unit id, so existing mock data participates in
// business-unit roll-ups without needing to be re-authored by hand.
export const DEPARTMENT_TO_BUSINESS_UNIT_ID: Record<string, string> = {
  'Customer Services': 'bu-cs',
  Finance: 'bu-fin',
  HR: 'bu-hr',
  'IT & Digital': 'bu-it',
  Operations: 'bu-ops',
  Marketing: 'bu-mktg',
  Sales: 'bu-sales',
  Other: 'bu-other',
};

// ============================================================
// RESOURCE COST RATES
// Illustrative sample data - blended at role level, with a few
// business-unit-level overrides to demonstrate the hierarchy.
// ============================================================

export const INITIAL_RESOURCE_RATES: ResourceRate[] = [
  // Role-level blended rates (apply org-wide unless a business-unit override exists)
  { id: 'rate-1', role: 'Software Engineer', costType: 'Internal', hourlyRate: 65, dailyRate: 480, overheadsIncluded: true, effectiveDate: '2025-04-01', status: 'Active' },
  { id: 'rate-2', role: 'Data Scientist', costType: 'Internal', hourlyRate: 75, dailyRate: 560, overheadsIncluded: true, effectiveDate: '2025-04-01', status: 'Active' },
  { id: 'rate-3', role: 'Product Manager', costType: 'Internal', hourlyRate: 70, dailyRate: 520, overheadsIncluded: true, effectiveDate: '2025-04-01', status: 'Active' },
  { id: 'rate-4', role: 'Business Analyst', costType: 'Internal', hourlyRate: 55, dailyRate: 410, overheadsIncluded: true, effectiveDate: '2025-04-01', status: 'Active' },
  { id: 'rate-5', role: 'Project Manager', costType: 'Internal', hourlyRate: 60, dailyRate: 450, overheadsIncluded: true, effectiveDate: '2025-04-01', status: 'Active' },
  { id: 'rate-6', role: 'Consultant', costType: 'Consultant', hourlyRate: 120, dailyRate: 900, overheadsIncluded: false, effectiveDate: '2025-04-01', status: 'Active' },
  { id: 'rate-7', role: 'Support Engineer', costType: 'Internal', hourlyRate: 32, dailyRate: 240, overheadsIncluded: true, effectiveDate: '2025-04-01', status: 'Active' },

  // Business-unit level overrides (used by benefit calculations for department-specific blended labour cost)
  { id: 'rate-8', role: 'Support Engineer', businessUnitId: 'bu-cs', costType: 'Internal', hourlyRate: 28, dailyRate: 210, overheadsIncluded: true, effectiveDate: '2025-04-01', status: 'Active' },
  { id: 'rate-9', role: 'Business Analyst', businessUnitId: 'bu-fin', costType: 'Internal', hourlyRate: 38, dailyRate: 285, overheadsIncluded: true, effectiveDate: '2025-04-01', status: 'Active' },
  { id: 'rate-10', role: 'Business Analyst', businessUnitId: 'bu-hr', costType: 'Internal', hourlyRate: 32, dailyRate: 240, overheadsIncluded: true, effectiveDate: '2025-04-01', status: 'Active' },
  { id: 'rate-11', role: 'Business Analyst', businessUnitId: 'bu-mktg', costType: 'Internal', hourlyRate: 30, dailyRate: 225, overheadsIncluded: true, effectiveDate: '2025-04-01', status: 'Active' },
  { id: 'rate-12', role: 'Software Engineer', businessUnitId: 'bu-it', costType: 'Internal', hourlyRate: 55, dailyRate: 410, overheadsIncluded: true, effectiveDate: '2025-04-01', status: 'Active' },
];

// ============================================================
// BENEFIT CATEGORIES
// ============================================================

export const INITIAL_BENEFIT_CATEGORIES: BenefitCategoryConfig[] = [
  { id: 'cat-cost', name: 'Cost reduction', status: 'Active' },
  { id: 'cat-prod', name: 'Productivity', status: 'Active' },
  { id: 'cat-rev', name: 'Revenue growth', status: 'Active' },
  { id: 'cat-risk', name: 'Risk reduction', status: 'Active' },
  { id: 'cat-cx', name: 'Customer experience', status: 'Active' },
  { id: 'cat-ex', name: 'Employee experience', status: 'Active' },
  { id: 'cat-comp', name: 'Compliance', status: 'Active' },
  { id: 'cat-qual', name: 'Quality improvement', status: 'Active' },
];

// ============================================================
// STRATEGIC OBJECTIVES
// ============================================================

export const INITIAL_STRATEGIC_OBJECTIVES: StrategicObjectiveConfig[] = [
  { id: 'obj-1', name: 'Improve operational efficiency', status: 'Active' },
  { id: 'obj-2', name: 'Elevate customer experience', status: 'Active' },
  { id: 'obj-3', name: 'Strengthen compliance & governance', status: 'Active' },
  { id: 'obj-4', name: 'Accelerate revenue growth', status: 'Active' },
  { id: 'obj-5', name: 'Improve employee experience', status: 'Active' },
];

// Fixed scales used consistently across calculations and filters.
// Shown for governance reference in the Configuration Portal.
export const CONFIDENCE_LEVELS = ['Low', 'Medium', 'High'] as const;
export const AI_TYPES = ['Platform', 'Application', 'Agent', 'Initiative', 'Embedded AI', 'Experiment', 'Other'] as const;
export const LIFECYCLE_STAGES = ['Ideation', 'Evaluation', 'Development', 'Pilot', 'Production', 'In progress', 'Retired'] as const;
export const ITEM_STATUSES = ['Active', 'In progress', 'Planning', 'Under Review', 'On hold', 'Retired'] as const;

// ============================================================
// PEOPLE & TEAMS (master data)
// Backs the ownership searchable dropdowns in the Add Estate Item /
// Add Initiative drawers. Deduplicated from the people and teams already
// referenced across the mock estate catalogue.
// ============================================================

export const INITIAL_PEOPLE: Person[] = [
  { id: 'ppl-jvance', name: 'Jonathan Vance', roleTitle: 'Chief Digital Officer', status: 'Active' },
  { id: 'ppl-slin', name: 'Sarah Lin', roleTitle: 'Principal Engineer', status: 'Active' },
  { id: 'ppl-dchen', name: 'David Chen', roleTitle: 'Engineering Lead', status: 'Active' },
  { id: 'ppl-mtaylor', name: 'Mark Taylor', roleTitle: 'Head of IT & Digital', status: 'Active' },
  { id: 'ppl-arivera', name: 'Alex Rivera', roleTitle: 'Solutions Architect', status: 'Active' },
  { id: 'ppl-cbennett', name: 'Chloe Bennett', roleTitle: 'Head of Legal & Risk', status: 'Active' },
  { id: 'ppl-lcooper', name: 'Liam Cooper', roleTitle: 'Head of Operations', status: 'Active' },
  { id: 'ppl-kpatel', name: 'Kiran Patel', roleTitle: 'Operations Engineer', status: 'Active' },
  { id: 'ppl-rgreen', name: 'Rachel Green', roleTitle: 'Head of Finance', status: 'Active' },
  { id: 'ppl-erostova', name: 'Elena Rostova', roleTitle: 'Head of Customer Services', status: 'Active' },
  { id: 'ppl-sjenkins', name: 'Sarah Jenkins', roleTitle: 'Head of HR', status: 'Active' },
  { id: 'ppl-mlee', name: 'Marcus Lee', roleTitle: 'Head of Marketing', status: 'Active' },
];

export const INITIAL_TEAMS: Team[] = [
  { id: 'team-cxops', name: 'Customer Experience Operations', businessUnitId: 'bu-cs', status: 'Active' },
  { id: 'team-fpa', name: 'Financial Planning & Analysis', businessUnitId: 'bu-fin', status: 'Active' },
  { id: 'team-peopleops', name: 'People Operations', businessUnitId: 'bu-hr', status: 'Active' },
  { id: 'team-fieldeng', name: 'Field Engineering', businessUnitId: 'bu-ops', status: 'Active' },
  { id: 'team-corpfin', name: 'Corporate Finance', businessUnitId: 'bu-fin', status: 'Active' },
  { id: 'team-legalcompliance', name: 'Legal & Compliance', status: 'Active' },
  { id: 'team-platformeng', name: 'Platform Engineering', businessUnitId: 'bu-it', status: 'Active' },
  { id: 'team-itenduser', name: 'IT End User Services', businessUnitId: 'bu-it', status: 'Active' },
  { id: 'team-ap', name: 'Accounts Payable', businessUnitId: 'bu-fin', status: 'Active' },
  { id: 'team-revops', name: 'Revenue Operations', businessUnitId: 'bu-sales', status: 'Active' },
  { id: 'team-brandcomms', name: 'Brand & Communications', businessUnitId: 'bu-mktg', status: 'Active' },
  { id: 'team-custops', name: 'Customer Operations', businessUnitId: 'bu-cs', status: 'Active' },
  { id: 'team-globalfin', name: 'Global Finance Centre', businessUnitId: 'bu-fin', status: 'Active' },
  { id: 'team-peopleculture', name: 'People & Culture', businessUnitId: 'bu-hr', status: 'Active' },
  { id: 'team-digitalworkplace', name: 'Digital Workplace', businessUnitId: 'bu-it', status: 'Active' },
  { id: 'team-itinfra', name: 'IT Infrastructure', businessUnitId: 'bu-it', status: 'Active' },
  { id: 'team-supplychain', name: 'Supply Chain Logistics', businessUnitId: 'bu-ops', status: 'Active' },
  { id: 'team-productanalytics', name: 'Product Analytics', businessUnitId: 'bu-cs', status: 'Active' },
  { id: 'team-legalrisk', name: 'Legal & Risk', status: 'Active' },
];

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
