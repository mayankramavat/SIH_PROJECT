import React, { useState } from 'react';
import HorizontalNavbar from './components/HorizontalNavbar';
import OverviewPage from './pages/OverviewPage';
import DemandSupplyPage from './pages/DemandSupplyPage';
import OccupationExplorerPage from './pages/OccupationExplorerPage';
import ForecastPage from './pages/ForecastPage';
import DataSourcesPage from './pages/DataSourcesPage';
import { getDataSourceMode, setDataSourceMode } from './services/dataService';

/**
 * Main Application Component (SIH 26246 - MSDE)
 * 
 * Strict Architectural Rules:
 * 1. HORIZONTAL ONLY LAYOUT - NO VERTICAL SIDEBAR ANYWHERE.
 * 2. Sticky Top Bar: Project title "Labour Market Intelligence Portal" on left.
 * 3. Horizontal navigation tabs below title bar:
 *    Overview | Skill Demand vs Supply | Occupation Explorer | Forecast | Data Sources
 * 4. Active tab has blue underline (border-b-2 border-blue-600).
 * 5. Full page width content arranged in clean horizontal rows.
 * 6. Responsive: Top nav becomes a horizontally scrollable tab strip on mobile.
 */
export default function App() {
  // Navigation active tab: 'overview' | 'demand-supply' | 'occupations' | 'forecast' | 'data-sources'
  const [activeTab, setActiveTab] = useState('overview');

  // Data mode: 'mock' (local JSON in /src/data) or 'api' (live FastAPI backend)
  const [dataSourceMode, setDataSourceModeState] = useState(getDataSourceMode());

  const handleModeChange = (newMode) => {
    setDataSourceMode(newMode);
    setDataSourceModeState(newMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 antialiased">
      {/* 1. Sticky Top Bar & Horizontal Navigation Tabs (No sidebar) */}
      <HorizontalNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dataSourceMode={dataSourceMode}
        setDataSourceMode={handleModeChange}
      />

      {/* 2. Main Page Content (Full Page Width Container) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && <OverviewPage />}
        {activeTab === 'demand-supply' && <DemandSupplyPage />}
        {activeTab === 'occupations' && <OccupationExplorerPage />}
        {activeTab === 'forecast' && <ForecastPage />}
        {activeTab === 'data-sources' && <DataSourcesPage />}
      </main>

      {/* 3. Footer Bar */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-700">Labour Market Intelligence Portal</span>
            <span>•</span>
            <span>SIH Problem Statement 26246</span>
            <span>•</span>
            <span>MSDE, Government of India</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Data Mode: <strong className="text-gray-700">{dataSourceMode === 'mock' ? 'Local JSON (/src/data)' : 'FastAPI REST Endpoint'}</strong></span>
            <span>•</span>
            <span>NCO 2015 Taxonomy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
