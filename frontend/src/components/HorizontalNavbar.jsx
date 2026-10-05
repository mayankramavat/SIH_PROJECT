import React from 'react';
import { 
  BarChart3, 
  Layers, 
  Briefcase, 
  TrendingUp, 
  Database,
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';

/**
 * HorizontalNavbar Component
 * 
 * Complies with strict HORIZONTAL ONLY layout:
 * - Sticky top bar with title "Labour Market Intelligence Portal" on the left
 * - Horizontal navigation tabs: Overview | Skill Demand vs Supply | Occupation Explorer | Forecast | Data Sources
 * - Active tab has a blue underline (border-b-2 border-blue-600)
 * - Responsive: On mobile, navigation becomes a horizontally scrollable tab strip
 */
export default function HorizontalNavbar({ 
  activeTab, 
  setActiveTab, 
  dataSourceMode, 
  setDataSourceMode 
}) {
  const navTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'demand-supply', label: 'Skill Demand vs Supply', icon: Layers },
    { id: 'occupations', label: 'Occupation Explorer', icon: Briefcase },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'data-sources', label: 'Data Sources', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      {/* 1. Top Bar: Title & Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Project Title & Emblem */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-lg">
              IN
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                  Labour Market Intelligence Portal
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  SIH 26246
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                Ministry of Skill Development & Entrepreneurship (MSDE) • National LMIS
              </p>
            </div>
          </div>

          {/* Right: Data Mode Toggle (Mock JSON vs Live API) & Status */}
          <div className="flex items-center space-x-3">
            {/* Source Toggle Pill */}
            <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs">
              <button
                type="button"
                onClick={() => setDataSourceMode('mock')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  dataSourceMode === 'mock'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Uses local mock JSON files in /src/data"
              >
                Local Mock Data
              </button>
              <button
                type="button"
                onClick={() => setDataSourceMode('api')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center space-x-1 ${
                  dataSourceMode === 'api'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Connects to live FastAPI backend at /api"
              >
                <Cpu className="w-3 h-3" />
                <span>FastAPI Live</span>
              </button>
            </div>

            {/* Portal Operational Status */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Portal Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Horizontal Navigation Tabs (Below Title Bar) */}
      <div className="border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto scrollbar-none py-1 -mb-px">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                    isActive
                      ? 'border-blue-600 text-blue-600 font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
