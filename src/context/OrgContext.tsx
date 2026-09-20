import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, deleteDoc, updateDoc, collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, cleanFirestoreData } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Organization, OrgMember, OrgRole } from '../types';

interface OrgContextType {
  loading: boolean;
  organization: Organization | null;
  role: OrgRole | null;
  members: OrgMember[];
  error: string | null;
  clearError: () => void;
  createOrganization: (name: string) => Promise<boolean>;
  joinOrganization: (orgId: string, joinCode: string) => Promise<boolean>;
  leaveOrganization: () => Promise<void>;
  regenerateJoinCode: () => Promise<void>;
  updateOrganizationName: (name: string) => Promise<void>;
  updateMemberRole: (uid: string, role: OrgRole) => Promise<void>;
  removeMember: (uid: string) => Promise<void>;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

// Short, human-typeable join code (e.g. "K7M2-QX9P") - excludes visually
// ambiguous characters (0/O, 1/I/L).
function randomJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part()}-${part()}`;
}

/**
 * Resolves which organization the signed-in account belongs to, and owns
 * every membership operation (create/join/leave an org, manage members).
 * The app is multi-tenant: everyone in the same organization shares one
 * portfolio (see PortfolioContext, which is scoped by this org's id, not
 * by the individual user's uid). Sits between AuthProvider and
 * PortfolioProvider so the portfolio data layer can depend on it.
 */
export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orgMember, setOrgMember] = useState<OrgMember | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Resolve this account's membership record (which org, which role).
  useEffect(() => {
    if (!user) {
      setOrgMember(null);
      setOrganization(null);
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      doc(db, 'orgMembers', user.uid),
      (snap) => {
        setOrgMember(snap.exists() ? (snap.data() as OrgMember) : null);
        setLoading(false);
      },
      (err) => {
        const message = handleFirestoreError(err, OperationType.GET, `orgMembers/${user.uid}`);
        setError(message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  // Once membership resolves to an org, sync that org's profile + roster.
  useEffect(() => {
    if (!orgMember) {
      setOrganization(null);
      setMembers([]);
      return;
    }
    const unsubOrg = onSnapshot(
      doc(db, 'orgs', orgMember.orgId),
      (snap) => setOrganization(snap.exists() ? ({ ...(snap.data() as Organization), id: snap.id }) : null),
      (err) => setError(handleFirestoreError(err, OperationType.GET, `orgs/${orgMember.orgId}`))
    );
    const unsubMembers = onSnapshot(
      collection(db, 'orgs', orgMember.orgId, 'members'),
      (snap) => setMembers(snap.docs.map((d) => d.data() as OrgMember)),
      (err) => setError(handleFirestoreError(err, OperationType.GET, `orgs/${orgMember.orgId}/members`))
    );
    return () => {
      unsubOrg();
      unsubMembers();
    };
  }, [orgMember?.orgId]);

  const clearError = () => setError(null);

  const createOrganization = async (name: string): Promise<boolean> => {
    if (!user) return false;
    setError(null);
    try {
      const orgId = `org-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const org: Organization = {
        id: orgId,
        name: name.trim() || 'My Organization',
        createdBy: user.uid,
        joinCode: randomJoinCode(),
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'orgs', orgId), cleanFirestoreData(org));

      const member: OrgMember = {
        uid: user.uid,
        orgId,
        role: 'admin',
        email: user.email || undefined,
        displayName: user.displayName || undefined,
        joinedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'orgMembers', user.uid), cleanFirestoreData(member));
      await setDoc(doc(db, 'orgs', orgId, 'members', user.uid), cleanFirestoreData(member));
      return true;
    } catch (err) {
      setError(handleFirestoreError(err, OperationType.CREATE, 'orgs'));
      return false;
    }
  };

  const joinOrganization = async (orgId: string, joinCode: string): Promise<boolean> => {
    if (!user) return false;
    setError(null);
    try {
      const member: OrgMember = {
        uid: user.uid,
        orgId: orgId.trim(),
        role: 'member',
        email: user.email || undefined,
        displayName: user.displayName || undefined,
        joinedAt: new Date().toISOString(),
      };
      // joinCodeUsed is only read by the security rule at write time, to
      // confirm this join is legitimate - it isn't a secret afterward.
      await setDoc(
        doc(db, 'orgMembers', user.uid),
        cleanFirestoreData({ ...member, joinCodeUsed: joinCode.trim() })
      );
      await setDoc(doc(db, 'orgs', member.orgId, 'members', user.uid), cleanFirestoreData(member));
      return true;
    } catch (err) {
      setError('Invalid organization ID or join code.');
      handleFirestoreError(err, OperationType.CREATE, `orgMembers/${user.uid}`);
      return false;
    }
  };

  const leaveOrganization = async () => {
    if (!user || !orgMember) return;
    try {
      await deleteDoc(doc(db, 'orgs', orgMember.orgId, 'members', user.uid));
      await deleteDoc(doc(db, 'orgMembers', user.uid));
    } catch (err) {
      setError(handleFirestoreError(err, OperationType.DELETE, `orgMembers/${user.uid}`));
    }
  };

  const regenerateJoinCode = async () => {
    if (!organization) return;
    try {
      await updateDoc(doc(db, 'orgs', organization.id), { joinCode: randomJoinCode() });
    } catch (err) {
      setError(handleFirestoreError(err, OperationType.UPDATE, `orgs/${organization.id}`));
    }
  };

  const updateOrganizationName = async (name: string) => {
    if (!organization || !name.trim()) return;
    try {
      await updateDoc(doc(db, 'orgs', organization.id), { name: name.trim() });
    } catch (err) {
      setError(handleFirestoreError(err, OperationType.UPDATE, `orgs/${organization.id}`));
    }
  };

  const updateMemberRole = async (uid: string, role: OrgRole) => {
    if (!orgMember) return;
    try {
      await updateDoc(doc(db, 'orgMembers', uid), { role });
      await updateDoc(doc(db, 'orgs', orgMember.orgId, 'members', uid), { role });
    } catch (err) {
      setError(handleFirestoreError(err, OperationType.UPDATE, `orgMembers/${uid}`));
    }
  };

  const removeMember = async (uid: string) => {
    if (!orgMember) return;
    try {
      await deleteDoc(doc(db, 'orgs', orgMember.orgId, 'members', uid));
      await deleteDoc(doc(db, 'orgMembers', uid));
    } catch (err) {
      setError(handleFirestoreError(err, OperationType.DELETE, `orgMembers/${uid}`));
    }
  };

  return (
    <OrgContext.Provider
      value={{
        loading,
        organization,
        role: orgMember?.role ?? null,
        members,
        error,
        clearError,
        createOrganization,
        joinOrganization,
        leaveOrganization,
        regenerateJoinCode,
        updateOrganizationName,
        updateMemberRole,
        removeMember,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
};

export const useOrg = () => {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
};
