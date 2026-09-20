import React, { useState } from 'react';
import { Sparkles, Building2, KeyRound, LogOut } from 'lucide-react';
import { useOrg } from '../context/OrgContext';
import { useAuth } from '../context/AuthContext';

/**
 * Shown to a signed-in account that doesn't yet belong to an organization.
 * The app is multi-tenant - one shared portfolio per company - so every
 * account must either create a new organization (becoming its first admin)
 * or join an existing one with an invite code before it can see any data.
 */
export const OrgOnboarding: React.FC = () => {
  const { createOrganization, joinOrganization, error, clearError } = useOrg();
  const { user, signOut } = useAuth();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [orgName, setOrgName] = useState('');
  const [joinOrgId, setJoinOrgId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!orgName.trim()) return;
    setSubmitting(true);
    await createOrganization(orgName);
    setSubmitting(false);
  };

  const handleJoin = async () => {
    if (!joinOrgId.trim() || !joinCode.trim()) return;
    setSubmitting(true);
    await joinOrganization(joinOrgId, joinCode);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">AI Portfolio</div>
            <div className="text-[11px] text-slate-400">{user?.email}</div>
          </div>
        </div>

        <h1 className="text-lg font-bold text-slate-900 mt-5">Set up your organization</h1>
        <p className="text-xs text-slate-500 mt-1">
          This is a shared workspace for your company's AI portfolio - everyone in your organization sees the same data.
        </p>

        <div className="flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 mt-5 text-xs font-medium">
          <button
            onClick={() => {
              setMode('create');
              clearError();
            }}
            className={`flex-1 px-3 py-1.5 rounded-md transition-all ${
              mode === 'create' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create new
          </button>
          <button
            onClick={() => {
              setMode('join');
              clearError();
            }}
            className={`flex-1 px-3 py-1.5 rounded-md transition-all ${
              mode === 'join' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Join existing
          </button>
        </div>

        {mode === 'create' ? (
          <div className="mt-5 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Organization name
              </label>
              <input
                id="org-name-input"
                type="text"
                placeholder="e.g. Acme Corporation"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              You'll be the organization's first admin, and can invite teammates afterward from Settings.
            </p>
            <button
              id="btn-create-org"
              onClick={handleCreate}
              disabled={!orgName.trim() || submitting}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {submitting ? 'Creating...' : 'Create organization'}
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Organization ID
              </label>
              <input
                id="join-org-id-input"
                type="text"
                placeholder="Ask your admin for this"
                value={joinOrgId}
                onChange={(e) => setJoinOrgId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                Join code
              </label>
              <input
                id="join-code-input"
                type="text"
                placeholder="e.g. K7M2-QX9P"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 uppercase"
              />
            </div>
            <button
              id="btn-join-org"
              onClick={handleJoin}
              disabled={!joinOrgId.trim() || !joinCode.trim() || submitting}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {submitting ? 'Joining...' : 'Join organization'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700">{error}</div>
        )}

        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-1.5 mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          Sign out
        </button>
      </div>
    </div>
  );
};
