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
