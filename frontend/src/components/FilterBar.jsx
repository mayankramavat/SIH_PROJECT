import React from 'react';
import { Filter, RotateCcw, X, Sparkles, MapPin, Briefcase } from 'lucide-react';

export default function FilterBar({
  states = [],
  districts = [],
  trades = [],
  selectedState,
  setSelectedState,
  selectedDistrict,
  setSelectedDistrict,
  selectedSector,
  setSelectedSector,
  selectedTrade,
  setSelectedTrade,
  onReset
}) {
  const sectors = ['All Sectors', 'IT-ITeS', 'Automotive', 'Electronics & Hardware', 'Healthcare', 'Construction'];

  // Quick 1-click presets for rapid exploration
  const quickPresets = [
    { label: 'All India', state: '', district: '', sector: '', trade: '' },
    { label: 'Maharashtra (Pune)', state: 'Maharashtra', district: 'Pune', sector: '', trade: '' },
    { label: 'Karnataka (Tech)', state: 'Karnataka', district: 'Bengaluru Urban', sector: 'IT-ITeS', trade: '' },
    { label: 'Gujarat (Automotive)', state: 'Gujarat', district: 'Ahmedabad', sector: 'Automotive', trade: '' },
    { label: 'Tamil Nadu (Auto)', state: 'Tamil Nadu', district: 'Chennai', sector: 'Automotive', trade: '' },
  ];

  const hasActiveFilters = Boolean(selectedState || selectedDistrict || selectedSector || selectedTrade);

  const applyPreset = (preset) => {
    setSelectedState(preset.state);
    setSelectedDistrict(preset.district);
    setSelectedSector(preset.sector);
    if (preset.trade !== undefined) setSelectedTrade(preset.trade);
  };

  return (
    <div className="bg-white rounded-xl border border-govSlate-200 p-4 shadow-xs mb-6 space-y-3 text-xs">
      {/* Upper Row: Dropdown Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center text-govNavy-900 font-bold space-x-1.5 pr-2 border-r border-govSlate-200">
            <Filter className="w-3.5 h-3.5 text-govCyan-600" />
            <span>Scope Filter:</span>
          </div>

          {/* State Selector */}
          <div className="flex flex-col">
            <select
              value={selectedState || 'All States'}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedState(val === 'All States' ? '' : val);
                setSelectedDistrict('');
              }}
              className="px-3 py-1.5 rounded-lg border border-govSlate-300 bg-govSlate-50 text-govSlate-800 font-medium focus:bg-white focus:outline-none focus:border-govCyan-500 focus:ring-1 focus:ring-govCyan-500 cursor-pointer text-xs"
            >
              <option value="All States">All States (National)</option>
              {states.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* District Selector */}
          <div className="flex flex-col">
            <select
              value={selectedDistrict || 'All Districts'}
              onChange={(e) => setSelectedDistrict(e.target.value === 'All Districts' ? '' : e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-govSlate-300 bg-govSlate-50 text-govSlate-800 font-medium focus:bg-white focus:outline-none focus:border-govCyan-500 focus:ring-1 focus:ring-govCyan-500 cursor-pointer disabled:opacity-50 text-xs"
            >
              <option value="All Districts">All Districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Sector Selector */}
          <div className="flex flex-col">
            <select
              value={selectedSector || 'All Sectors'}
              onChange={(e) => setSelectedSector(e.target.value === 'All Sectors' ? '' : e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-govSlate-300 bg-govSlate-50 text-govSlate-800 font-medium focus:bg-white focus:outline-none focus:border-govCyan-500 focus:ring-1 focus:ring-govCyan-500 cursor-pointer text-xs"
            >
              {sectors.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Trade Selector */}
          <div className="flex flex-col">
            <select
              value={selectedTrade || 'All Trades'}
              onChange={(e) => setSelectedTrade(e.target.value === 'All Trades' ? '' : e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-govSlate-300 bg-govSlate-50 text-govSlate-800 font-medium focus:bg-white focus:outline-none focus:border-govCyan-500 focus:ring-1 focus:ring-govCyan-500 cursor-pointer max-w-[220px] truncate text-xs"
            >
              <option value="All Trades">All Trades</option>
              {trades.map((tr) => (
                <option key={tr} value={tr}>{tr}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Action */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-govRed-600 hover:bg-govRed-50 font-semibold border border-govRed-200 transition cursor-pointer"
            title="Reset Filters to National Level"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Lower Row: Quick Preset Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-govSlate-100">
        <span className="text-[11px] font-semibold text-govSlate-500 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-govCyan-600" />
          Quick Focus:
        </span>
        {quickPresets.map((preset, idx) => {
          const isActive =
            (!preset.state && !selectedState) ||
            (preset.state === selectedState && (!preset.district || preset.district === selectedDistrict));

          return (
            <button
              key={idx}
              onClick={() => applyPreset(preset)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer border ${
                isActive
                  ? 'bg-govNavy-900 text-white border-govNavy-900 shadow-xs'
                  : 'bg-govSlate-100 text-govSlate-700 border-govSlate-200 hover:bg-govSlate-200'
              }`}
            >
              {preset.label}
            </button>
          );
        })}

        {/* Active Filter Chips */}
        {selectedState && (
          <span className="inline-flex items-center space-x-1 bg-govCyan-50 text-govCyan-800 border border-govCyan-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <MapPin className="w-2.5 h-2.5 text-govCyan-600" />
            <span>{selectedState}</span>
            <button onClick={() => { setSelectedState(''); setSelectedDistrict(''); }} className="hover:text-govRed-500">
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        )}

        {selectedDistrict && (
          <span className="inline-flex items-center space-x-1 bg-govCyan-50 text-govCyan-800 border border-govCyan-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <span>{selectedDistrict}</span>
            <button onClick={() => setSelectedDistrict('')} className="hover:text-govRed-500">
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        )}

        {selectedTrade && (
          <span className="inline-flex items-center space-x-1 bg-govCyan-50 text-govCyan-800 border border-govCyan-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <Briefcase className="w-2.5 h-2.5 text-govCyan-600" />
            <span className="max-w-[140px] truncate">{selectedTrade}</span>
            <button onClick={() => setSelectedTrade('')} className="hover:text-govRed-500">
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
