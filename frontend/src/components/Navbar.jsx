import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Globe,
  RefreshCw,
  Clock,
  Menu,
  X,
  Shield,
  Activity,
  ChevronRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const PAGE_HEADERS = {
  dashboard: {
    title: 'Labour Market Intelligence Dashboard',
    category: 'Overview',
    subtitle: 'National AI-enabled demand, supply, and skill-gap forecasting platform',
  },
  state: {
    title: 'State Labour Market Analysis',
    category: 'Regional Analytics',
    subtitle: 'State-level aggregation of industry labour demand, training pipeline supply, and district distribution',
  },
  district: {
    title: 'District Labour Market Analysis',
    category: 'Granular Insights',
    subtitle: 'District-level vocational demand, training provider capacity, and multi-quarter deficit projections',
  },
  trade: {
    title: 'Trade & Skill Intelligence',
    category: 'Occupational Profiles',
    subtitle: 'Detailed qualification profiles, industry demand trends, training outcomes, and future workforce projections',
  },
  forecast: {
    title: 'AI Labour Demand Forecast',
    category: 'Predictive Intelligence',
    subtitle: 'Machine-learning based future demand estimation & multi-horizon trajectory modeling',
  },
  gap: {
    title: 'Current & Future Skill Gap Analysis',
    category: 'Deficit Engine',
    subtitle: 'Multi-sector supply-demand mismatch indexing, deficit concentration, and surplus distribution',
  },
  alerts: {
    title: 'Early Warning & Emerging Skill Shortages',
    category: 'Risk Monitoring',
    subtitle: 'Potential future labour-market imbalances detected by the predictive forecasting system',
  },
  methodology: {
    title: 'Data Sources & Methodology',
    category: 'Governance & Provenance',
    subtitle: 'Algorithmic documentation, index formulation, ML pipeline architecture, and data provenance',
  },
};

export default function Navbar({
  activePage,
  backendOnline,
  onSearch,
  onRefresh,
  lastUpdated = 'Oct 2024 (Live Data)',
  onToggleMobileMenu,
  isMobileMenuOpen,
  tradesList = [],
  statesList = [],
  districtsList = [],
  onSelectSearchResult
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [lang, setLang] = useState('EN');
  const searchContainerRef = useRef(null);

  const current = PAGE_HEADERS[activePage] || PAGE_HEADERS.dashboard;

  const handleRefreshClick = () => {
    setRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setRefreshing(false), 700);
  };

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute search matches
  const filteredTrades = searchQuery.trim()
    ? tradesList.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4)
    : [];

  const filteredStates = searchQuery.trim()
    ? statesList.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  const filteredDistricts = searchQuery.trim()
    ? districtsList.filter(d => d.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  const hasResults = filteredTrades.length > 0 || filteredStates.length > 0 || filteredDistricts.length > 0;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-govSlate-200 shadow-xs">
      {/* Official Government of India Tricolor Ribbon */}
      <div className="gov-tricolor-stripe w-full" />

      {/* Top Ministry Identifier Strip */}
      <div className="bg-govNavy-950 text-white/80 px-4 sm:px-6 py-1 text-[11px] font-medium flex items-center justify-between border-b border-govNavy-800">
        <div className="flex items-center space-x-2">
          <span className="text-white font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-govEmerald-400"></span>
            भारत सरकार | Government of India
          </span>
          <span className="hidden md:inline text-govNavy-600">•</span>
          <span className="hidden md:inline text-slate-300">
            Ministry of Skill Development & Entrepreneurship (MSDE)
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[10px]">
          <span className="text-govCyan-400 font-semibold tracking-wide flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> SIH_26246
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-govSlate-600 hover:text-govNavy-900 hover:bg-govSlate-100 transition cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="truncate">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-govCyan-600 uppercase tracking-wider">
              <span>{current.category}</span>
              <ChevronRight className="w-3 h-3 text-govSlate-400" />
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-govNavy-900 tracking-tight truncate">
              {current.title}
            </h1>
          </div>
        </div>

        {/* Right: Search, Indicators, and Actions */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
          {/* Interactive Global Search with Dropdown */}
          <div className="relative hidden md:block w-64 lg:w-72" ref={searchContainerRef}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                  if (onSearch) onSearch(e.target.value);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="Search trades, districts, states..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-govSlate-300 bg-govSlate-50 text-govSlate-900 placeholder:text-govSlate-400 focus:bg-white focus:outline-none focus:border-govCyan-500 focus:ring-2 focus:ring-govCyan-500/20 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-govSlate-400 absolute left-2.5 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchDropdown(false);
                    if (onSearch) onSearch('');
                  }}
                  className="absolute right-2.5 top-2.5 text-govSlate-400 hover:text-govSlate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Live Search Quick Results Popup */}
            {showSearchDropdown && searchQuery.trim() && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white border border-govSlate-200 rounded-xl shadow-xl p-2 z-50 text-xs">
                {hasResults ? (
                  <div className="space-y-2">
                    {filteredTrades.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase text-govSlate-400 px-2 py-1">Trades</div>
                        {filteredTrades.map(tr => (
                          <button
                            key={tr}
                            onClick={() => {
                              if (onSelectSearchResult) onSelectSearchResult('trade', { trade: tr });
                              setShowSearchDropdown(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-govCyan-50 text-govSlate-800 hover:text-govCyan-800 transition font-medium flex items-center justify-between cursor-pointer"
                          >
                            <span>{tr}</span>
                            <span className="text-[10px] text-govCyan-600 font-semibold">Jump to Trade →</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {filteredStates.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase text-govSlate-400 px-2 py-1">States</div>
                        {filteredStates.map(st => (
                          <button
                            key={st}
                            onClick={() => {
                              if (onSelectSearchResult) onSelectSearchResult('state', { state: st });
                              setShowSearchDropdown(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-govCyan-50 text-govSlate-800 hover:text-govCyan-800 transition font-medium flex items-center justify-between cursor-pointer"
                          >
                            <span>{st}</span>
                            <span className="text-[10px] text-govCyan-600 font-semibold">State Analysis →</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 text-center text-govSlate-400">
                    No matching trade or location found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Backend Health Status Pill */}
          <div
            className={`hidden sm:flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
              backendOnline
                ? 'bg-govEmerald-50 text-govEmerald-800 border-govEmerald-200'
                : 'bg-govAmber-50 text-govAmber-800 border-govAmber-200'
            }`}
            title={backendOnline ? 'FastAPI Analytics Engine Online' : 'Connecting / Standalone Demo Mode'}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                backendOnline ? 'bg-govEmerald-500' : 'bg-govAmber-500'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                backendOnline ? 'bg-govEmerald-500' : 'bg-govAmber-500'
              }`}></span>
            </span>
            <span className="text-[11px]">
              {backendOnline ? 'Live ML Engine' : 'Offline Mode'}
            </span>
          </div>

          {/* Last Updated Timestamp */}
          <div className="hidden xl:flex items-center space-x-1.5 text-[11px] text-govSlate-500 bg-govSlate-100 px-2.5 py-1.5 rounded-lg border border-govSlate-200">
            <Clock className="w-3.5 h-3.5 text-govSlate-400" />
            <span className="tabular-nums">{lastUpdated}</span>
          </div>

          {/* Refresh Action */}
          <button
            onClick={handleRefreshClick}
            className="p-2 rounded-lg border border-govSlate-200 hover:bg-govSlate-100 text-govSlate-600 transition cursor-pointer active:scale-95"
            title="Refresh All Datasets"
          >
            <RefreshCw className={`w-4 h-4 text-govSlate-600 ${refreshing ? 'animate-spin text-govCyan-600' : ''}`} />
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-govSlate-200 hover:bg-govSlate-100 text-xs font-bold text-govSlate-700 transition cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-govSlate-500" />
            <span>{lang === 'EN' ? 'EN | हिन्दी' : 'हिन्दी | EN'}</span>
          </button>

          {/* Officer Profile Badge */}
          <div className="flex items-center space-x-2 pl-2 border-l border-govSlate-200">
            <div className="w-8 h-8 rounded-full bg-govNavy-900 text-govCyan-300 font-bold text-xs flex items-center justify-center border border-govNavy-700 shadow-xs ring-2 ring-govCyan-500/20">
              AV
            </div>
            <div className="hidden 2xl:block text-left">
              <div className="text-xs font-bold text-govNavy-900 leading-tight">Dr. A. Verma</div>
              <div className="text-[10px] text-govSlate-500">Dir. Planning (MSDE)</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
