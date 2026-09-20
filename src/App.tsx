/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { Sidebar } from './components/Sidebar';
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
          <ItemDetailView itemId={selectedItemId || 'agt-1'} />
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

export default function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <MainLayout />
      </PortfolioProvider>
    </AuthProvider>
  );
}
