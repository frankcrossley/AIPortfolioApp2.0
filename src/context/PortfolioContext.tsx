import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import {
  EstateItem,
  Relationship,
  FilterState,
  ActiveNav,
  EstateItemType,
} from '../types';
import { INITIAL_ESTATE_ITEMS, INITIAL_RELATIONSHIPS } from '../data/mockData';
import { db, handleFirestoreError, OperationType, cleanFirestoreData } from '../lib/firebase';
import { useAuth } from './AuthContext';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface PortfolioContextType {
  items: EstateItem[];
  relationships: Relationship[];
  activeNav: ActiveNav;
  setActiveNav: (nav: ActiveNav) => void;
  selectedItemId: string | null;
  selectedPlatformId: string | null;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  applyGapFilter: (gapKey: string) => void;
  viewItem: (id: string) => void;
  viewPlatform: (id: string) => void;
  isRegisterModalOpen: boolean;
  openRegisterModal: (type?: EstateItemType) => void;
  closeRegisterModal: () => void;
  addItem: (
    itemData: Omit<EstateItem, 'id' | 'lastUpdated' | 'lastUpdatedDaysAgo'>,
    relationshipsList?: { targetId: string; type: Relationship['type'] }[]
  ) => Promise<void>;
  updateItem: (id: string, updates: Partial<EstateItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  seedInitialDataToCloud: () => Promise<void>;
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
  };
  gaps: {
    missingOwner: EstateItem[];
    estimatedCostOnly: EstateItem[];
    missingOutcome: EstateItem[];
    noPlatform: EstateItem[];
    notUpdated90Days: EstateItem[];
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
  const [items, setItems] = useState<EstateItem[]>(INITIAL_ESTATE_ITEMS);
  const [relationships, setRelationships] = useState<Relationship[]>(INITIAL_RELATIONSHIPS);
  const [activeNav, setActiveNav] = useState<ActiveNav>('overview');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>('plt-2');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

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

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
  };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  // Synchronize with Firestore when user is authenticated
  useEffect(() => {
    if (!user) {
      setIsCloudSynced(false);
      return;
    }

    setIsSyncing(true);

    const unsubscribeItems = onSnapshot(
      collection(db, 'estateItems'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudItems: EstateItem[] = [];
          snapshot.forEach((docSnap) => {
            cloudItems.push(docSnap.data() as EstateItem);
          });
          setItems(cloudItems);
          setIsCloudSynced(true);
        } else {
          // If Firestore is empty, seed it with initial enterprise catalog!
          seedInitialDataToCloud();
        }
        setIsSyncing(false);
      },
      (error) => {
        setIsSyncing(false);
        handleFirestoreError(error, OperationType.GET, 'estateItems');
      }
    );

    const unsubscribeRels = onSnapshot(
      collection(db, 'relationships'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudRels: Relationship[] = [];
          snapshot.forEach((docSnap) => {
            cloudRels.push(docSnap.data() as Relationship);
          });
          setRelationships(cloudRels);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'relationships');
      }
    );

    return () => {
      unsubscribeItems();
      unsubscribeRels();
    };
  }, [user]);

  // Function to seed initial enterprise data to Cloud Firestore
  const seedInitialDataToCloud = async () => {
    if (!user) return;
    try {
      setIsSyncing(true);
      const batch = writeBatch(db);
      INITIAL_ESTATE_ITEMS.forEach((item) => {
        const docRef = doc(db, 'estateItems', item.id);
        batch.set(
          docRef,
          cleanFirestoreData({
            ...item,
            authorId: user.uid,
          })
        );
      });

      INITIAL_RELATIONSHIPS.forEach((rel) => {
        const docRef = doc(db, 'relationships', rel.id);
        batch.set(
          docRef,
          cleanFirestoreData({
            ...rel,
            authorId: user.uid,
          })
        );
      });

      await batch.commit();
      setIsCloudSynced(true);
      showToast('Cloud Firestore populated with Enterprise Portfolio');
    } catch (err) {
      console.error('Error seeding data:', err);
      handleFirestoreError(err, OperationType.WRITE, 'estateItems');
    } finally {
      setIsSyncing(false);
    }
  };

  const addItem = async (
    itemData: Omit<EstateItem, 'id' | 'lastUpdated' | 'lastUpdatedDaysAgo'>,
    relationshipsList?: { targetId: string; type: Relationship['type'] }[]
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
        await setDoc(
          doc(db, 'estateItems', newId),
          cleanFirestoreData({
            ...newItem,
            authorId: user.uid,
          })
        );

        if (relationshipsList && relationshipsList.length > 0) {
          for (let idx = 0; idx < relationshipsList.length; idx++) {
            const rel = relationshipsList[idx];
            const relId = `rel-${Date.now()}-${idx}`;
            await setDoc(
              doc(db, 'relationships', relId),
              cleanFirestoreData({
                id: relId,
                sourceId: newId,
                targetId: rel.targetId,
                type: rel.type,
                label: rel.type,
                authorId: user.uid,
              })
            );
          }
        }
        showToast(`Saved "${newItem.name}" to Cloud Firestore`);
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
        }));
        setRelationships((prev) => [...prev, ...newRels]);
      }
      showToast(`Registered "${newItem.name}" (sign in to sync to cloud)`);
    }

    closeRegisterModal();
  };

  const updateItem = async (id: string, updates: Partial<EstateItem>) => {
    const existingItem = items.find((i) => i.id === id);
    const updated = {
      ...(existingItem || {}),
      ...updates,
      lastUpdated: 'Today',
      lastUpdatedDaysAgo: 0,
    };

    if (user) {
      try {
        await setDoc(
          doc(db, 'estateItems', id),
          cleanFirestoreData({
            ...updated,
            authorId: user.uid,
          }),
          { merge: true }
        );
        showToast('Changes saved to Cloud Firestore');
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
    const item = items.find((i) => i.id === id);
    if (user) {
      try {
        await deleteDoc(doc(db, 'estateItems', id));
        showToast(`Deleted ${item?.name || 'item'} from Cloud`);
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

  // Filter by gap
  const applyGapFilter = (gapKey: string) => {
    resetFilters();
    setFilters((prev) => ({ ...prev, gapType: gapKey }));
    setSelectedItemId(null);
    setActiveNav('portfolio');
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const totalInitiatives = items.length;
    const totalAnnualCost = items.reduce((acc, curr) => acc + (curr.annualCost || 0), 0);
    const confirmedCost = items
      .filter((i) => !i.isCostEstimated)
      .reduce((acc, curr) => acc + (curr.annualCost || 0), 0);
    const estimatedCost = items
      .filter((i) => i.isCostEstimated)
      .reduce((acc, curr) => acc + (curr.annualCost || 0), 0);
    const productionAgents = items.filter(
      (i) => (i.type === 'Agent' || i.type === 'Embedded AI') && i.lifecycleStage === 'Production'
    ).length;
    const valueEvidenceCount = items.filter(
      (i) => i.valueEvidenceStatus === 'Documented' || i.valueEvidenceStatus === 'Available'
    ).length;

    return {
      totalInitiatives,
      annualEstimatedCost: totalAnnualCost,
      confirmedCost,
      estimatedCost,
      productionAgents,
      valueEvidenceCount,
    };
  }, [items]);

  // Information gaps computation
  const gaps = useMemo(() => {
    const missingOwner = items.filter((i) => !i.businessOwner || i.businessOwner.trim() === '');
    const estimatedCostOnly = items.filter((i) => i.isCostEstimated === true);
    const missingOutcome = items.filter((i) => !i.intendedOutcome || i.intendedOutcome.trim() === '');
    const noPlatform = items.filter(
      (i) => i.type === 'Agent' && !i.platformId && !i.platformName
    );
    const notUpdated90Days = items.filter(
      (i) => (i.lastUpdatedDaysAgo ?? 0) >= 90
    );

    return {
      missingOwner,
      estimatedCostOnly,
      missingOutcome,
      noPlatform,
      notUpdated90Days,
    };
  }, [items]);

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

    items.forEach((item) => {
      if (item.type === 'Platform') counts.Platforms.count += 1;
      else if (item.type === 'Application') counts.Applications.count += 1;
      else if (item.type === 'Agent') counts.Agents.count += 1;
      else if (item.type === 'Embedded AI') counts['Embedded AI'].count += 1;
      else if (item.type === 'Experiment') counts.Experiments.count += 1;
      else counts.Other.count += 1;
    });

    const total = items.length || 1;
    return Object.entries(counts).map(([type, val]) => ({
      type,
      count: val.count,
      percentage: Math.round((val.count / total) * 100),
      color: val.color,
    }));
  }, [items]);

  // Investment by department
  const investmentByDepartment = useMemo(() => {
    const deptMap: Record<string, { cost: number; count: number }> = {};

    items.forEach((item) => {
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
  }, [items]);

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

    items.forEach((i) => {
      if (stages[i.lifecycleStage] !== undefined) {
        stages[i.lifecycleStage] += 1;
      } else {
        stages['In progress'] += 1;
      }
    });

    const total = items.length || 1;
    return Object.entries(stages).map(([stage, count]) => ({
      stage,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }, [items]);

  return (
    <PortfolioContext.Provider
      value={{
        items,
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
        viewItem,
        viewPlatform,
        isRegisterModalOpen,
        openRegisterModal,
        closeRegisterModal,
        addItem,
        updateItem,
        deleteItem,
        seedInitialDataToCloud,
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
