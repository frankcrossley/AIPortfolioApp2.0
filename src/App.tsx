/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrgProvider, useOrg } from './context/OrgContext';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { Sidebar } from './components/Sidebar';
import { OrgOnboarding } from './components/OrgOnboarding';
import { ToastContainer } from './components/Toast';
import { OverviewView } from './views/OverviewView';
import { EstateMapView } from './views/EstateMapView';
import { PortfolioListView } from './views/PortfolioListView';
import { ItemDetailView } from './views/ItemDetailView';
import { PlatformsRollupView } from './views/PlatformsRollupView';
import { PortfolioItemDrawer } from './components/drawer/PortfolioItemDrawer';
import { InitiativeDrawer } from './components/drawer/InitiativeDrawer';
import { ComingSoonView } from './views/ComingSoonView';
import { SettingsView } from './views/SettingsView';

const MainLayout: React.FC = () => {
  const { activeNav, selectedItemId } = usePortfolio();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
      {/* Left Navigation Sidebar matching specification & screenshots */}
      <Sidebar />

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {activeNav === 'overview' && <OverviewView />}
        {(activeNav === 'estate-map' || activeNav === 'map') && <EstateMapView />}
        {activeNav === 'portfolio' && <PortfolioListView />}
        {activeNav === 'item-detail' && (
          <ItemDetailView itemId={selectedItemId || ''} />
        )}
        {activeNav === 'platforms' && <PlatformsRollupView />}
        {activeNav === 'settings' && <SettingsView />}
        {(activeNav === 'investment' ||
          activeNav === 'value-management' ||
          activeNav === 'measurement') && (
          <ComingSoonView viewType={activeNav} />
        )}
      </main>

      {/* Add to Portfolio drawers */}
      <PortfolioItemDrawer />
      <InitiativeDrawer />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

const SplashScreen: React.FC = () => (
  <div className="min-h-screen w-screen flex items-center justify-center bg-[#f8fafc]">
    <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />
  </div>
);

/**
 * Gates the main app behind organization membership. Signed-out visitors
 * get the existing local-only mode (no org needed - see PortfolioContext's
 * local fallback). A signed-in account with no resolved organization must
 * create or join one first, since the app is multi-tenant: everyone in an
 * organization shares one portfolio, not one silo per user.
 */
const AppGate: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { organization, loading: orgLoading } = useOrg();

  if (authLoading || (user && orgLoading)) {
    return <SplashScreen />;
  }

  if (user && !organization) {
    return <OrgOnboarding />;
  }

  return (
    <PortfolioProvider>
      <MainLayout />
    </PortfolioProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <OrgProvider>
        <AppGate />
      </OrgProvider>
    </AuthProvider>
  );
}
