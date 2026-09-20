export type EstateItemType =
  | 'Platform'
  | 'Application'
  | 'Agent'
  | 'Initiative'
  | 'Embedded AI'
  | 'Experiment';

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
  outcome?: IntendedOutcome;
  valueHypothesis?: ValueHypothesis;
  measurement?: MeasurementInfo;
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
  | 'Calculated'
  | 'Being measured'
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
