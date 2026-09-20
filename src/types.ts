export type EstateItemType =
  | 'Platform'
  | 'Application'
  | 'Agent'
  | 'Initiative'
  | 'Embedded AI'
  | 'Experiment'
  | 'Other';

// The record types offered when creating a new Estate Item. Initiatives are
// business/delivery efforts and are modeled separately (see `Initiative`) -
// 'Initiative' remains a member of EstateItemType only so that initiatives
// can be adapted into the EstateItem shape for shared display components.
export type EstateRecordType = Exclude<EstateItemType, 'Initiative'>;

export type LifecycleStage =
  | 'Ideation'
  | 'Evaluation'
  | 'Development'
  | 'Pilot'
  | 'Production'
  | 'In progress'
  | 'Retired';

export type ItemStatus =
  | 'Active'
  | 'In progress'
  | 'Planning'
  | 'Under Review'
  | 'On hold'
  | 'Retired';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type DataClassification = 'Public' | 'Internal' | 'Confidential' | 'Restricted';

export type ValueEvidenceStatus =
  | 'Available'
  | 'Documented'
  | 'In progress'
  | 'None'
  | 'Planned';

export type Department =
  | 'Customer Services'
  | 'IT & Digital'
  | 'Finance'
  | 'HR'
  | 'Operations'
  | 'Sales'
  | 'Marketing'
  | 'Other';

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'Built on' | 'Uses' | 'Part of' | 'Depends on' | 'Delivered through' | 'Owned by' | 'Data flow';
  label?: string;
  dataFlowDetails?: {
    direction: 'inbound' | 'outbound' | 'bidirectional';
    dataExchanged: string;
    integrationType: string;
    criticality: 'High' | 'Medium' | 'Low';
  };
}

export interface EstateItem {
  id: string;
  name: string;
  type: EstateItemType;
  subtitle?: string;
  description: string;
  department: string;
  businessOwner?: string;
  technicalOwner?: string;
  team?: string;
  provider?: string;
  platformId?: string;
  platformName?: string;
  applicationId?: string;
  applicationName?: string;
  initiativeId?: string;
  initiativeName?: string;
  lifecycleStage: LifecycleStage;
  status: ItemStatus;
  priority?: Priority;
  annualCost?: number;
  devCost?: number;
  opsCost?: number;
  sharedCost?: number;
  isCostEstimated?: boolean;
  valueEvidenceStatus: ValueEvidenceStatus;
  intendedOutcome?: string;
  dataClassification?: DataClassification;
  businessFunction?: string;
  lastUpdated: string;
  lastUpdatedDaysAgo?: number;
  tags?: string[];
  // Related items convenience names
  dependencies?: string[];

  // Investment & value model extensions
  businessUnitId?: string;
  externalConsultancyCost?: number;
  internalTeamCost?: number;
  costCalculationBasis?: string;
  costRecord?: CostRecord;
  outcome?: IntendedOutcome;
  valueHypothesis?: ValueHypothesis;
  measurement?: MeasurementInfo;

  // Controlled master-data links (denormalized name kept in the legacy
  // string fields above for backward-compatible display; the id links are
  // the source of truth going forward for records created via the drawer).
  businessOwnerId?: string;
  technicalOwnerId?: string;
  teamId?: string;
  supportTeam?: string;
  supportTeamId?: string;
  relatedEstateItemIds?: string[];

  // Platform-specific fields (shown on the record page only when type === 'Platform')
  productName?: string;
  licensingModel?: string;
  contractRenewalDate?: string;

  // Project/Programme-specific fields (shown only for Initiatives)
  sponsor?: string;
  deliveryOwner?: string;
  startDate?: string;
  targetEndDate?: string;
  budget?: number;
}

export interface FilterState {
  search: string;
  type: string;
  department: string;
  lifecycleStage: string;
  status: string;
  owner: string;
  gapType?: string; // for clicking gap cards
  platform?: string; // for filtering by platform
  businessUnit?: string; // for filtering by configured business unit id
}

export type ActiveNav =
  | 'overview'
  | 'map'
  | 'estate-map'
  | 'portfolio'
  | 'item-detail'
  | 'platforms'
  | 'investment'
  | 'value-management'
  | 'measurement'
  | 'settings';

// ============================================================
// VALUE & INVESTMENT MODEL
// ============================================================

export type ConfidenceLevel = 'Low' | 'Medium' | 'High';

export type ValueHypothesisStatus =
  | 'Not defined'
  | 'Hypothesis'
  | 'Estimated'
  | 'Validated'
  | 'Realised';

export type CalculationMethod = 'productivity' | 'cost-reduction' | 'manual';

export interface ProductivityCalculationInputs {
  annualVolume: number;
  timeSavedPerTransactionHours: number;
  costPerHour: number;
}

export interface CostReductionCalculationInputs {
  currentAnnualCost: number;
  expectedFutureAnnualCost: number;
}

export interface ManualCalculationInputs {
  explanation: string;
}

export interface IntendedOutcome {
  name: string;
  category: string; // benefit category
  description?: string;
  businessOwner?: string;
  strategicObjective?: string;
  measurementUnit?: string;
  baselineValue?: string;
  targetValue?: string;
  targetDate?: string;
}

export interface ValueHypothesis {
  status: ValueHypothesisStatus;
  benefitCategory?: string;
  expectedBenefit?: string;
  calculationMethod?: CalculationMethod;
  productivityInputs?: ProductivityCalculationInputs;
  costReductionInputs?: CostReductionCalculationInputs;
  manualInputs?: ManualCalculationInputs;
  estimatedAnnualBenefit?: number; // undefined = not quantified
  assumptions?: string;
  confidenceLevel?: ConfidenceLevel;
}

export type EvidenceStatus = 'Not started' | 'In progress' | 'Available' | 'Documented';

export interface MeasurementInfo {
  metricName?: string;
  baseline?: string;
  current?: string;
  target?: string;
  lastMeasuredDate?: string;
  lastMeasuredDaysAgo?: number;
  evidenceStatus?: EvidenceStatus;
}

// ============================================================
// CONFIGURATION PORTAL
// ============================================================

export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  accountableOwner?: string;
  status: 'Active' | 'Inactive';
}

export type ResourceCostType = 'Internal' | 'Consultant' | 'Contractor';

export interface ResourceRate {
  id: string;
  role: string;
  businessUnitId?: string; // blank = role-level blended rate (applies org-wide)
  costType: ResourceCostType;
  hourlyRate: number;
  dailyRate: number;
  overheadsIncluded: boolean;
  effectiveDate: string;
  status: 'Active' | 'Inactive';
}

export interface BenefitCategoryConfig {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
}

export interface StrategicObjectiveConfig {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
}

export interface RequiredFieldsConfig {
  businessOwner: boolean;
  technicalOwner: boolean;
  businessUnit: boolean;
  estimatedAnnualCost: boolean;
  intendedOutcome: boolean;
  valueHypothesis: boolean;
}

export type PortfolioViewMode = 'all' | 'investment' | 'value' | 'quality';

// ============================================================
// COST RECORDS
// Two clearly separated cost categories, matching how the business
// actually thinks about spend:
//  - Development cost is one-off (build/delivery). It defaults to £0 when
//    not broken down further - most tools genuinely have no separate build
//    spend (e.g. off-the-shelf SaaS), so zero is a legitimate default here.
//  - Operating cost is recurring (annual run cost). It is never defaulted
//    to zero - an unset operating cost is shown as "Not yet estimated",
//    since implying no ongoing cost would be misleading.
// A cost is only ever labelled "Confirmed" when the user explicitly marks
// it so; otherwise it stays "Estimated".
// ============================================================

export interface DevelopmentCostBreakdown {
  internalEffort?: number;
  externalConsultancy?: number;
  other?: number;
}

export interface OperatingCostBreakdown {
  platformLicensing?: number;
  infrastructure?: number;
  supportMaintenance?: number;
  other?: number;
}

export interface CostRecord {
  developmentCost?: number; // one-off; treated as £0 when not provided
  developmentBasis?: string; // optional description or calculation basis
  developmentBreakdown?: DevelopmentCostBreakdown;
  developmentConfirmed?: boolean; // false/undefined = Estimated

  operatingCost?: number; // annual recurring; undefined = "Not yet estimated"
  operatingBreakdown?: OperatingCostBreakdown;
  operatingConfirmed?: boolean; // false/undefined = Estimated

  sourceNotes?: string;
  lastUpdated?: string;
}

// ============================================================
// MASTER DATA: PEOPLE & TEAMS
// Controlled records backing the ownership searchable dropdowns, so
// repeated free-text entry can't create duplicate people (e.g. "James
// Smith" vs "J. Smith"). Managed from the Configuration Portal.
// ============================================================

export interface Person {
  id: string;
  name: string;
  email?: string;
  roleTitle?: string;
  status: 'Active' | 'Inactive';
}

export interface Team {
  id: string;
  name: string;
  businessUnitId?: string;
  status: 'Active' | 'Inactive';
}

// ============================================================
// INITIATIVES
// What the organisation is doing or building - a business/delivery effort,
// distinct from the technical/operational Estate Items it may deliver
// through. Shares almost all of EstateItem's shape (ownership, cost, value)
// but drops the technical linking fields that don't apply to a programme
// of work, and gains its own free-form links to the estate items it relates to.
// ============================================================

export interface Initiative
  extends Omit<
    EstateItem,
    | 'type'
    | 'platformId'
    | 'platformName'
    | 'applicationId'
    | 'applicationName'
    | 'initiativeId'
    | 'initiativeName'
    | 'dependencies'
  > {
  relatedEstateItemIds?: string[];
}
