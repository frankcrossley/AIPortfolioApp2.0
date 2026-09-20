import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import {
  EstateItem,
  Relationship,
  FilterState,
  ActiveNav,
  EstateRecordType,
  BusinessUnit,
  ResourceRate,
  BenefitCategoryConfig,
  StrategicObjectiveConfig,
  RequiredFieldsConfig,
  PortfolioViewMode,
  Initiative,
  Person,
  Team,
} from '../types';
import { INITIAL_REQUIRED_FIELDS } from '../data/configData';
import { db, handleFirestoreError, OperationType, cleanFirestoreData } from '../lib/firebase';
import { isQuantified, isValidatedStatus } from '../lib/valueCalculations';
import { useAuth } from './AuthContext';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface PortfolioContextType {
  items: EstateItem[];
  initiatives: Initiative[];
  allRecords: EstateItem[]; // items + initiatives adapted for shared display (table/dashboard) use
  relationships: Relationship[];
  activeNav: ActiveNav;
  setActiveNav: (nav: ActiveNav) => void;
  selectedItemId: string | null;
  selectedPlatformId: string | null;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  applyGapFilter: (gapKey: string) => void;
  portfolioViewMode: PortfolioViewMode;
  setPortfolioViewMode: (v: PortfolioViewMode) => void;
  goToPortfolioView: (v: PortfolioViewMode) => void;
  viewItem: (id: string) => void;
  viewPlatform: (id: string) => void;

  // Add to Portfolio drawers
  isEstateDrawerOpen: boolean;
  estateDrawerPreset?: EstateRecordType;
  openEstateItemDrawer: (preset?: EstateRecordType) => void;
  closeEstateItemDrawer: () => void;
  isInitiativeDrawerOpen: boolean;
  openInitiativeDrawer: () => void;
  closeInitiativeDrawer: () => void;

  addItem: (
    itemData: Omit<EstateItem, 'id' | 'lastUpdated' | 'lastUpdatedDaysAgo'>,
    relationshipsList?: { targetId: string; type: Relationship['type']; dataFlowDetails?: Relationship['dataFlowDetails'] }[]
  ) => Promise<void>;
  updateItem: (id: string, updates: Partial<EstateItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addInitiative: (initiativeData: Omit<Initiative, 'id' | 'lastUpdated' | 'lastUpdatedDaysAgo'>) => Promise<void>;
  updateInitiative: (id: string, updates: Partial<Initiative>) => Promise<void>;
  deleteInitiative: (id: string) => Promise<void>;
  isSyncing: boolean;
  isCloudSynced: boolean;
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  // Computed helpers
  metrics: {
    totalInitiatives: number;
    annualEstimatedCost: number;
    confirmedCost: number;
    estimatedCost: number;
    productionAgents: number;
    valueEvidenceCount: number;
    totalEstimatedAnnualBenefit: number;
    validatedAnnualBenefit: number;
    estimatedOnlyAnnualBenefit: number;
    benefitContributingCount: number;
    initiativesWithValueHypothesis: number;
  };
  gaps: {
    missingOwner: EstateItem[];
    estimatedCostOnly: EstateItem[];
    missingOutcome: EstateItem[];
    noPlatform: EstateItem[];
    notUpdated90Days: EstateItem[];
    noValueHypothesis: EstateItem[];
  };
  compositionByType: {
    type: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  investmentByDepartment: {
    department: string;
    cost: number;
    count: number;
  }[];
  compositionByLifecycle: {
    stage: string;
    count: number;
    percentage: number;
  }[];
  investmentByPlatform: {
    platform: string;
    cost: number;
    count: number;
  }[];
  benefitByCategory: {
    category: string;
    benefit: number;
    count: number;
  }[];
  benefitByDepartment: {
    department: string;
    benefit: number;
    count: number;
  }[];

  // Configuration Portal
  businessUnits: BusinessUnit[];
  addBusinessUnit: (bu: Omit<BusinessUnit, 'id'>) => BusinessUnit;
  updateBusinessUnit: (id: string, updates: Partial<BusinessUnit>) => void;
  resourceRates: ResourceRate[];
  addResourceRate: (rate: Omit<ResourceRate, 'id'>) => void;
  updateResourceRate: (id: string, updates: Partial<ResourceRate>) => void;
  benefitCategories: BenefitCategoryConfig[];
  addBenefitCategory: (cat: Omit<BenefitCategoryConfig, 'id'>) => void;
  updateBenefitCategory: (id: string, updates: Partial<BenefitCategoryConfig>) => void;
  strategicObjectives: StrategicObjectiveConfig[];
  addStrategicObjective: (obj: Omit<StrategicObjectiveConfig, 'id'>) => void;
  updateStrategicObjective: (id: string, updates: Partial<StrategicObjectiveConfig>) => void;
  requiredFields: RequiredFieldsConfig;
  updateRequiredFields: (updates: Partial<RequiredFieldsConfig>) => void;
  people: Person[];
  addPerson: (person: Omit<Person, 'id'>) => Person;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  teams: Team[];
  addTeam: (team: Omit<Team, 'id'>) => Team;
  updateTeam: (id: string, updates: Partial<Team>) => void;
}

const defaultFilters: FilterState = {
  search: '',
  type: '',
  department: '',
  lifecycleStage: '',
  status: '',
  owner: '',
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  // Every collection below starts empty - there is no seeded/demo content.
  // When signed in, these are populated exclusively from that account's own
  // data in Firestore (see the sync effect below); when signed out, they
  // hold only what's been added locally during this session.
  const [items, setItems] = useState<EstateItem[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [activeNav, setActiveNav] = useState<ActiveNav>('overview');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [portfolioViewMode, setPortfolioViewMode] = useState<PortfolioViewMode>('all');
  const [isEstateDrawerOpen, setIsEstateDrawerOpen] = useState(false);
  const [estateDrawerPreset, setEstateDrawerPreset] = useState<EstateRecordType | undefined>(undefined);
  const [isInitiativeDrawerOpen, setIsInitiativeDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Configuration Portal state - synced to Firestore under this account
  // once signed in (see sync effect below); local-only fallback otherwise.
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [resourceRates, setResourceRates] = useState<ResourceRate[]>([]);
  const [benefitCategories, setBenefitCategories] = useState<BenefitCategoryConfig[]>([]);
  const [strategicObjectives, setStrategicObjectives] = useState<StrategicObjectiveConfig[]>([]);
  const [requiredFields, setRequiredFields] = useState<RequiredFieldsConfig>(INITIAL_REQUIRED_FIELDS);
  const [people, setPeople] = useState<Person[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const viewItem = (id: string) => {
    setSelectedItemId(id);
    setActiveNav('item-detail');
  };

  const viewPlatform = (id: string) => {
    setSelectedPlatformId(id);
    setActiveNav('platforms');
  };

  const openEstateItemDrawer = (preset?: EstateRecordType) => {
    setEstateDrawerPreset(preset);
    setIsEstateDrawerOpen(true);
  };

  const closeEstateItemDrawer = () => {
    setIsEstateDrawerOpen(false);
    setEstateDrawerPreset(undefined);
  };

  const openInitiativeDrawer = () => {
    setIsInitiativeDrawerOpen(true);
  };

  const closeInitiativeDrawer = () => {
    setIsInitiativeDrawerOpen(false);
  };

  // Per-account Firestore paths - every collection lives under
  // users/{uid}/<name>, so one account can never see another's data.
  const userCollection = (name: string) => collection(db, 'users', user!.uid, name);
  const userDocRef = (name: string, id: string) => doc(db, 'users', user!.uid, name, id);

  // Synchronize every collection with this account's own Firestore data.
  // Signed out (or no account yet): everything starts and stays empty -
  // there is no seeded/demo content and no other account's data leaks in.
  useEffect(() => {
    if (!user) {
      setItems([]);
      setInitiatives([]);
      setRelationships([]);
      setBusinessUnits([]);
      setResourceRates([]);
      setBenefitCategories([]);
      setStrategicObjectives([]);
      setPeople([]);
      setTeams([]);
      setIsCloudSynced(false);
      setIsSyncing(false);
      return;
    }

    setIsSyncing(true);

    const subscribe = <T,>(name: string, setState: React.Dispatch<React.SetStateAction<T[]>>) =>
      onSnapshot(
        userCollection(name),
        (snapshot) => setState(snapshot.docs.map((d) => d.data() as T)),
        (error) => handleFirestoreError(error, OperationType.GET, name)
      );

    const unsubscribers = [
      subscribe<EstateItem>('estateItems', setItems),
      subscribe<Initiative>('initiatives', setInitiatives),
      subscribe<Relationship>('relationships', setRelationships),
      subscribe<BusinessUnit>('businessUnits', setBusinessUnits),
      subscribe<ResourceRate>('resourceRates', setResourceRates),
      subscribe<BenefitCategoryConfig>('benefitCategories', setBenefitCategories),
      subscribe<StrategicObjectiveConfig>('strategicObjectives', setStrategicObjectives),
      subscribe<Person>('people', setPeople),
      subscribe<Team>('teams', setTeams),
    ];

    setIsSyncing(false);
    setIsCloudSynced(true);

    return () => unsubscribers.forEach((unsub) => unsub());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /**
   * Shared CRUD for the simple "master data" collections (business units,
   * resource rates, benefit categories, strategic objectives, people,
   * teams): write straight to this account's Firestore when signed in
   * (the sync effect above reflects the change back), otherwise fall back
   * to local-only state so the app still works while signed out.
   */
  function makeAccountCrud<T extends { id: string }>(
    name: string,
    setState: React.Dispatch<React.SetStateAction<T[]>>,
    idPrefix: string
  ) {
    const add = (data: Omit<T, 'id'>): T => {
      const record = { ...data, id: `${idPrefix}-${Date.now()}` } as T;
      if (user) {
        setDoc(userDocRef(name, record.id), cleanFirestoreData(record as Record<string, unknown>)).catch((err) =>
          handleFirestoreError(err, OperationType.CREATE, `${name}/${record.id}`)
        );
      } else {
        setState((prev) => [...prev, record]);
      }
      return record;
    };

    const update = (id: string, updates: Partial<T>) => {
      if (user) {
        setDoc(userDocRef(name, id), cleanFirestoreData(updates as Record<string, unknown>), { merge: true }).catch(
          (err) => handleFirestoreError(err, OperationType.UPDATE, `${name}/${id}`)
        );
      } else {
        setState((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
      }
    };

    return { add, update };
  }

  const peopleCrud = makeAccountCrud<Person>('people', setPeople, 'ppl-custom');
  const addPerson = (person: Omit<Person, 'id'>): Person => {
    const created = peopleCrud.add(person);
    showToast(`Added "${person.name}" to People`);
    return created;
  };
  const updatePerson = (id: string, updates: Partial<Person>) => peopleCrud.update(id, updates);

  const teamsCrud = makeAccountCrud<Team>('teams', setTeams, 'team-custom');
  const addTeam = (team: Omit<Team, 'id'>): Team => {
    const created = teamsCrud.add(team);
    showToast(`Added "${team.name}" to Teams`);
    return created;
  };
  const updateTeam = (id: string, updates: Partial<Team>) => teamsCrud.update(id, updates);

  const businessUnitsCrud = makeAccountCrud<BusinessUnit>('businessUnits', setBusinessUnits, 'bu-custom');
  const addBusinessUnit = (bu: Omit<BusinessUnit, 'id'>): BusinessUnit => {
    const created = businessUnitsCrud.add(bu);
    showToast(`Added business unit "${bu.name}"`);
    return created;
  };
  const updateBusinessUnit = (id: string, updates: Partial<BusinessUnit>) => businessUnitsCrud.update(id, updates);

  const resourceRatesCrud = makeAccountCrud<ResourceRate>('resourceRates', setResourceRates, 'rate-custom');
  const addResourceRate = (rate: Omit<ResourceRate, 'id'>) => {
    resourceRatesCrud.add(rate);
    showToast(`Added resource rate for "${rate.role}"`);
  };
  const updateResourceRate = (id: string, updates: Partial<ResourceRate>) => resourceRatesCrud.update(id, updates);

  const benefitCategoriesCrud = makeAccountCrud<BenefitCategoryConfig>('benefitCategories', setBenefitCategories, 'cat-custom');
  const addBenefitCategory = (cat: Omit<BenefitCategoryConfig, 'id'>) => {
    benefitCategoriesCrud.add(cat);
    showToast(`Added benefit category "${cat.name}"`);
  };
  const updateBenefitCategory = (id: string, updates: Partial<BenefitCategoryConfig>) =>
    benefitCategoriesCrud.update(id, updates);

  const strategicObjectivesCrud = makeAccountCrud<StrategicObjectiveConfig>(
    'strategicObjectives',
    setStrategicObjectives,
    'obj-custom'
  );
  const addStrategicObjective = (obj: Omit<StrategicObjectiveConfig, 'id'>) => {
    strategicObjectivesCrud.add(obj);
    showToast(`Added strategic objective "${obj.name}"`);
  };
  const updateStrategicObjective = (id: string, updates: Partial<StrategicObjectiveConfig>) =>
    strategicObjectivesCrud.update(id, updates);

  const updateRequiredFields = (updates: Partial<RequiredFieldsConfig>) => {
    setRequiredFields((prev) => ({ ...prev, ...updates }));
  };

  const addItem = async (
    itemData: Omit<EstateItem, 'id' | 'lastUpdated' | 'lastUpdatedDaysAgo'>,
    relationshipsList?: { targetId: string; type: Relationship['type']; dataFlowDetails?: Relationship['dataFlowDetails'] }[]
  ) => {
    const newId = `custom-${Date.now()}`;
    const newItem: EstateItem = {
      ...itemData,
      id: newId,
      lastUpdated: 'Today',
      lastUpdatedDaysAgo: 0,
    };

    if (user) {
      try {
        await setDoc(userDocRef('estateItems', newId), cleanFirestoreData(newItem));

        if (relationshipsList && relationshipsList.length > 0) {
          for (let idx = 0; idx < relationshipsList.length; idx++) {
            const rel = relationshipsList[idx];
            const relId = `rel-${Date.now()}-${idx}`;
            await setDoc(
              userDocRef('relationships', relId),
              cleanFirestoreData({
                id: relId,
                sourceId: newId,
                targetId: rel.targetId,
                type: rel.type,
                label: rel.type,
                dataFlowDetails: rel.dataFlowDetails,
              })
            );
          }
        }
        showToast(`Saved "${newItem.name}" to your AI Portfolio`);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `estateItems/${newId}`);
      }
    } else {
      // Local fallback
      setItems((prev) => [newItem, ...prev]);
      if (relationshipsList && relationshipsList.length > 0) {
        const newRels: Relationship[] = relationshipsList.map((rel, idx) => ({
          id: `rel-${Date.now()}-${idx}`,
          sourceId: newId,
          targetId: rel.targetId,
          type: rel.type,
          label: rel.type,
          dataFlowDetails: rel.dataFlowDetails,
        }));
        setRelationships((prev) => [...prev, ...newRels]);
      }
      showToast(`Added "${newItem.name}" to your AI Portfolio`);
    }

    closeEstateItemDrawer();
  };

  const updateItem = async (id: string, updates: Partial<EstateItem>) => {
    // Records created via the drawer may actually be Initiatives (they share
    // an id space); route the update to whichever array actually holds it.
    if (!items.some((i) => i.id === id) && initiatives.some((i) => i.id === id)) {
      updateInitiative(id, updates as Partial<Initiative>);
      return;
    }

    const existingItem = items.find((i) => i.id === id);
    const updated = {
      ...(existingItem || {}),
      ...updates,
      lastUpdated: 'Today',
      lastUpdatedDaysAgo: 0,
    };

    if (user) {
      try {
        await setDoc(userDocRef('estateItems', id), cleanFirestoreData(updated), { merge: true });
        showToast('Changes saved');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `estateItems/${id}`);
      }
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ...updates,
                lastUpdated: 'Today',
                lastUpdatedDaysAgo: 0,
              }
            : item
        )
      );
      showToast('Changes saved locally');
    }
  };

  const deleteItem = async (id: string) => {
    if (!items.some((i) => i.id === id) && initiatives.some((i) => i.id === id)) {
      deleteInitiative(id);
      return;
    }

    const item = items.find((i) => i.id === id);
    if (user) {
      try {
        await deleteDoc(userDocRef('estateItems', id));
        showToast(`Deleted ${item?.name || 'item'}`);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `estateItems/${id}`);
      }
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id));
      setRelationships((prev) => prev.filter((r) => r.sourceId !== id && r.targetId !== id));
      showToast(`Deleted ${item?.name || 'item'}`);
    }

    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
  };

  const addInitiative = async (initiativeData: Omit<Initiative, 'id' | 'lastUpdated' | 'lastUpdatedDaysAgo'>) => {
    const newId = `initiative-custom-${Date.now()}`;
    const newInitiative: Initiative = {
      ...initiativeData,
      id: newId,
      lastUpdated: 'Today',
      lastUpdatedDaysAgo: 0,
    };

    if (user) {
      try {
        await setDoc(userDocRef('initiatives', newId), cleanFirestoreData(newInitiative));
        showToast(`Saved "${newInitiative.name}" to your AI Portfolio`);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `initiatives/${newId}`);
      }
    } else {
      setInitiatives((prev) => [newInitiative, ...prev]);
      showToast(`Added "${newInitiative.name}" to your AI Portfolio`);
    }

    closeInitiativeDrawer();
  };

  const updateInitiative = async (id: string, updates: Partial<Initiative>) => {
    const existing = initiatives.find((i) => i.id === id);
    const updated = { ...(existing || {}), ...updates, lastUpdated: 'Today', lastUpdatedDaysAgo: 0 };

    if (user) {
      try {
        await setDoc(userDocRef('initiatives', id), cleanFirestoreData(updated), { merge: true });
        showToast('Changes saved');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `initiatives/${id}`);
      }
    } else {
      setInitiatives((prev) =>
        prev.map((ini) => (ini.id === id ? { ...ini, ...updates, lastUpdated: 'Today', lastUpdatedDaysAgo: 0 } : ini))
      );
      showToast('Changes saved locally');
    }
  };

  const deleteInitiative = async (id: string) => {
    const initiative = initiatives.find((i) => i.id === id);

    if (user) {
      try {
        await deleteDoc(userDocRef('initiatives', id));
        showToast(`Deleted ${initiative?.name || 'initiative'}`);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `initiatives/${id}`);
      }
    } else {
      setInitiatives((prev) => prev.filter((i) => i.id !== id));
      showToast(`Deleted ${initiative?.name || 'initiative'}`);
    }

    setRelationships((prev) => prev.filter((r) => r.sourceId !== id && r.targetId !== id));
    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
  };

  // Filter by gap
  const applyGapFilter = (gapKey: string) => {
    resetFilters();
    setFilters((prev) => ({ ...prev, gapType: gapKey }));
    setSelectedItemId(null);
    setPortfolioViewMode('quality');
    setActiveNav('portfolio');
  };

  // Navigate to the Portfolio table pre-set to a specific view mode (Investment / Value / Data Quality)
  const goToPortfolioView = (v: PortfolioViewMode) => {
    setPortfolioViewMode(v);
    setActiveNav('portfolio');
  };

  // Unified display list: estate items plus initiatives adapted into the
  // same shape, for table/dashboard views that show the whole portfolio.
  // The underlying `items` and `initiatives` arrays remain the source of
  // truth and stay properly separated per the data model.
  const allRecords: EstateItem[] = useMemo(() => {
    const adaptedInitiatives: EstateItem[] = initiatives.map((ini) => ({
      ...ini,
      type: 'Initiative' as const,
      dependencies: [],
    }));
    return [...items, ...adaptedInitiatives];
  }, [items, initiatives]);

  // Metrics computation
  const metrics = useMemo(() => {
    const totalInitiatives = allRecords.length;
    const totalAnnualCost = allRecords.reduce((acc, curr) => acc + (curr.annualCost || 0), 0);
    const confirmedCost = allRecords
      .filter((i) => !i.isCostEstimated)
      .reduce((acc, curr) => acc + (curr.annualCost || 0), 0);
    const estimatedCost = allRecords
      .filter((i) => i.isCostEstimated)
      .reduce((acc, curr) => acc + (curr.annualCost || 0), 0);
    const productionAgents = allRecords.filter(
      (i) => (i.type === 'Agent' || i.type === 'Embedded AI') && i.lifecycleStage === 'Production'
    ).length;
    const valueEvidenceCount = allRecords.filter(
      (i) => i.valueEvidenceStatus === 'Documented' || i.valueEvidenceStatus === 'Available'
    ).length;

    // Estimated annual benefit: only count items with a quantified value hypothesis.
    // A missing or non-numeric estimate is "Not quantified", never treated as £0.
    const quantified = allRecords.filter((i) => isQuantified(i.valueHypothesis));
    const totalEstimatedAnnualBenefit = quantified.reduce(
      (acc, i) => acc + (i.valueHypothesis?.estimatedAnnualBenefit || 0),
      0
    );
    const validatedAnnualBenefit = quantified
      .filter((i) => isValidatedStatus(i.valueHypothesis?.status))
      .reduce((acc, i) => acc + (i.valueHypothesis?.estimatedAnnualBenefit || 0), 0);
    const estimatedOnlyAnnualBenefit = totalEstimatedAnnualBenefit - validatedAnnualBenefit;
    const benefitContributingCount = quantified.length;
    const initiativesWithValueHypothesis = allRecords.filter(
      (i) => i.valueHypothesis && i.valueHypothesis.status !== 'Not defined'
    ).length;

    return {
      totalInitiatives,
      annualEstimatedCost: totalAnnualCost,
      confirmedCost,
      estimatedCost,
      productionAgents,
      valueEvidenceCount,
      totalEstimatedAnnualBenefit,
      validatedAnnualBenefit,
      estimatedOnlyAnnualBenefit,
      benefitContributingCount,
      initiativesWithValueHypothesis,
    };
  }, [allRecords]);

  // Information gaps computation
  const gaps = useMemo(() => {
    const missingOwner = allRecords.filter((i) => !i.businessOwner || i.businessOwner.trim() === '');
    const estimatedCostOnly = allRecords.filter((i) => i.isCostEstimated === true);
    const missingOutcome = allRecords.filter((i) => !i.intendedOutcome || i.intendedOutcome.trim() === '');
    const noValueHypothesis = allRecords.filter(
      (i) => !i.valueHypothesis || i.valueHypothesis.status === 'Not defined'
    );
    const noPlatform = allRecords.filter(
      (i) => i.type === 'Agent' && !i.platformId && !i.platformName
    );
    const notUpdated90Days = allRecords.filter(
      (i) => (i.lastUpdatedDaysAgo ?? 0) >= 90
    );

    return {
      missingOwner,
      estimatedCostOnly,
      missingOutcome,
      noPlatform,
      notUpdated90Days,
      noValueHypothesis,
    };
  }, [allRecords]);

  // Composition by type
  const compositionByType = useMemo(() => {
    const counts: Record<string, { count: number; color: string }> = {
      Platforms: { count: 0, color: '#2563eb' },
      Applications: { count: 0, color: '#38bdf8' },
      Agents: { count: 0, color: '#6366f1' },
      'Embedded AI': { count: 0, color: '#10b981' },
      Experiments: { count: 0, color: '#f59e0b' },
      Other: { count: 0, color: '#94a3b8' },
    };

    allRecords.forEach((item) => {
      if (item.type === 'Platform') counts.Platforms.count += 1;
      else if (item.type === 'Application') counts.Applications.count += 1;
      else if (item.type === 'Agent') counts.Agents.count += 1;
      else if (item.type === 'Embedded AI') counts['Embedded AI'].count += 1;
      else if (item.type === 'Experiment') counts.Experiments.count += 1;
      else counts.Other.count += 1;
    });

    const total = allRecords.length || 1;
    return Object.entries(counts).map(([type, val]) => ({
      type,
      count: val.count,
      percentage: Math.round((val.count / total) * 100),
      color: val.color,
    }));
  }, [allRecords]);

  // Investment by department
  const investmentByDepartment = useMemo(() => {
    const deptMap: Record<string, { cost: number; count: number }> = {};

    allRecords.forEach((item) => {
      const dept = item.department || 'Other';
      if (!deptMap[dept]) {
        deptMap[dept] = { cost: 0, count: 0 };
      }
      deptMap[dept].cost += item.annualCost || 0;
      deptMap[dept].count += 1;
    });

    return Object.entries(deptMap)
      .map(([department, data]) => ({
        department,
        cost: data.cost,
        count: data.count,
      }))
      .sort((a, b) => b.cost - a.cost);
  }, [allRecords]);

  // Composition by lifecycle
  const compositionByLifecycle = useMemo(() => {
    const stages: Record<string, number> = {
      Production: 0,
      Pilot: 0,
      'In progress': 0,
      Development: 0,
      Evaluation: 0,
      Ideation: 0,
    };

    allRecords.forEach((i) => {
      if (stages[i.lifecycleStage] !== undefined) {
        stages[i.lifecycleStage] += 1;
      } else {
        stages['In progress'] += 1;
      }
    });

    const total = allRecords.length || 1;
    return Object.entries(stages).map(([stage, count]) => ({
      stage,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }, [allRecords]);

  // Investment by platform (direct annual cost of items attributed to each platform)
  const investmentByPlatform = useMemo(() => {
    const platformMap: Record<string, { cost: number; count: number }> = {};

    items.forEach((item) => {
      const platformName = item.platformName || (item.type === 'Platform' ? item.name : undefined);
      if (!platformName) return;
      if (!platformMap[platformName]) {
        platformMap[platformName] = { cost: 0, count: 0 };
      }
      platformMap[platformName].cost += item.annualCost || 0;
      platformMap[platformName].count += 1;
    });

    return Object.entries(platformMap)
      .map(([platform, data]) => ({ platform, cost: data.cost, count: data.count }))
      .sort((a, b) => b.cost - a.cost);
  }, [items]);

  // Estimated annual benefit by benefit category (quantified value hypotheses only)
  const benefitByCategory = useMemo(() => {
    const catMap: Record<string, { benefit: number; count: number }> = {};

    allRecords.forEach((item) => {
      if (!isQuantified(item.valueHypothesis)) return;
      const category = item.valueHypothesis?.benefitCategory || 'Uncategorised';
      if (!catMap[category]) catMap[category] = { benefit: 0, count: 0 };
      catMap[category].benefit += item.valueHypothesis?.estimatedAnnualBenefit || 0;
      catMap[category].count += 1;
    });

    return Object.entries(catMap)
      .map(([category, data]) => ({ category, benefit: data.benefit, count: data.count }))
      .sort((a, b) => b.benefit - a.benefit);
  }, [allRecords]);

  // Estimated annual benefit by department (quantified value hypotheses only)
  const benefitByDepartment = useMemo(() => {
    const deptMap: Record<string, { benefit: number; count: number }> = {};

    allRecords.forEach((item) => {
      if (!isQuantified(item.valueHypothesis)) return;
      const dept = item.department || 'Other';
      if (!deptMap[dept]) deptMap[dept] = { benefit: 0, count: 0 };
      deptMap[dept].benefit += item.valueHypothesis?.estimatedAnnualBenefit || 0;
      deptMap[dept].count += 1;
    });

    return Object.entries(deptMap)
      .map(([department, data]) => ({ department, benefit: data.benefit, count: data.count }))
      .sort((a, b) => b.benefit - a.benefit);
  }, [allRecords]);

  return (
    <PortfolioContext.Provider
      value={{
        items,
        initiatives,
        allRecords,
        relationships,
        activeNav,
        setActiveNav: (nav) => {
          setActiveNav(nav);
          if (nav !== 'portfolio') {
            setSelectedItemId(null);
          }
        },
        selectedItemId,
        selectedPlatformId,
        filters,
        setFilters,
        resetFilters,
        applyGapFilter,
        portfolioViewMode,
        setPortfolioViewMode,
        goToPortfolioView,
        viewItem,
        viewPlatform,
        isEstateDrawerOpen,
        estateDrawerPreset,
        openEstateItemDrawer,
        closeEstateItemDrawer,
        isInitiativeDrawerOpen,
        openInitiativeDrawer,
        closeInitiativeDrawer,
        addItem,
        updateItem,
        deleteItem,
        addInitiative,
        updateInitiative,
        deleteInitiative,
        isSyncing,
        isCloudSynced,
        toasts,
        showToast,
        removeToast,
        metrics,
        gaps,
        compositionByType,
        investmentByDepartment,
        compositionByLifecycle,
        investmentByPlatform,
        benefitByCategory,
        benefitByDepartment,
        businessUnits,
        addBusinessUnit,
        updateBusinessUnit,
        resourceRates,
        addResourceRate,
        updateResourceRate,
        benefitCategories,
        addBenefitCategory,
        updateBenefitCategory,
        strategicObjectives,
        addStrategicObjective,
        updateStrategicObjective,
        requiredFields,
        updateRequiredFields,
        people,
        addPerson,
        updatePerson,
        teams,
        addTeam,
        updateTeam,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
