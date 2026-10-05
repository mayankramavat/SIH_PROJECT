import React, { useState } from 'react';
import {
  Map,
  ChevronRight,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Table as TableIcon,
  CheckCircle2,
  AlertOctagon,
  ArrowUpRight
} from 'lucide-react';

const STATE_DATA = {
  'Maharashtra': {
    demand: 18375,
    supply: 11850,
    gap: 6525,
    status: 'SHORTAGE',
    topShortage: 'Junior Software Developer',
    districts: 5,
    certRate: '88.4%',
    growth: '+14.2%'
  },
  'Karnataka': {
    demand: 16500,
    supply: 10200,
    gap: 6300,
    status: 'SHORTAGE',
    topShortage: 'Web Developer',
    districts: 3,
    certRate: '86.1%',
    growth: '+16.5%'
  },
  'Gujarat': {
    demand: 11200,
    supply: 10800,
    gap: 400,
    status: 'BALANCED',
    topShortage: 'CNC Machine Operator',
    districts: 3,
    certRate: '91.2%',
    growth: '+6.1%'
  },
  'Tamil Nadu': {
    demand: 14800,
    supply: 9900,
    gap: 4900,
    status: 'SHORTAGE',
    topShortage: 'Automotive Service Technician',
    districts: 3,
    certRate: '84.9%',
    growth: '+11.8%'
  },
  'Uttar Pradesh': {
    demand: 12500,
    supply: 9100,
    gap: 3400,
    status: 'SHORTAGE',
    topShortage: 'Junior Software Developer',
    districts: 3,
    certRate: '79.5%',
    growth: '+9.4%'
  },
};

export default function IndiaMap({ onSelectState }) {
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [hoveredState, setHoveredState] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'table'

  const current = STATE_DATA[selectedState] || STATE_DATA['Maharashtra'];

  const getStatusColor = (status, isSelected) => {
    if (status === 'BALANCED') {
      return isSelected ? '#047857' : '#10B981';
    }
    if (status === 'OVERSUPPLY') {
      return isSelected ? '#D97706' : '#F59E0B';
    }
    return isSelected ? '#991B1B' : '#EF4444';
  };

  return (
    <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-govSlate-100 gap-3">
        <div>
          <h3 className="text-sm font-bold text-govNavy-900 flex items-center gap-2">
            <Map className="w-4 h-4 text-govCyan-600" />
            National Labour Market — Regional State Distribution
          </h3>
          <p className="text-xs text-govSlate-500">
            Click any state to inspect demand, supply balance, and top deficit occupations
          </p>
        </div>

        {/* View Switcher & Legend */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Map / Table Toggle */}
          <div className="flex items-center space-x-1 bg-govSlate-100 p-1 rounded-lg font-semibold">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                viewMode === 'map' ? 'bg-white text-govNavy-900 shadow-xs' : 'text-govSlate-600 hover:text-govNavy-900'
              }`}
            >
              <Map className="w-3 h-3" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-govNavy-900 shadow-xs' : 'text-govSlate-600 hover:text-govNavy-900'
              }`}
            >
              <TableIcon className="w-3 h-3" />
              <span>Table</span>
            </button>
          </div>

          {/* Legend */}
          <div className="hidden md:flex items-center space-x-3 text-xs font-medium pl-2 border-l border-govSlate-200">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-govRed-500 shadow-xs"></span>
              <span className="text-govSlate-600">Shortage</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-govEmerald-500 shadow-xs"></span>
              <span className="text-govSlate-600">Balanced</span>
            </div>
          </div>
        </div>
      </div>

      {/* State Quick Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {Object.keys(STATE_DATA).map((stName) => {
          const isSel = selectedState === stName;
          const stInfo = STATE_DATA[stName];
          return (
            <button
              key={stName}
              onClick={() => setSelectedState(stName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 border ${
                isSel
                  ? 'bg-govNavy-900 text-white border-govNavy-900 shadow-xs'
                  : 'bg-govSlate-50 text-govSlate-700 border-govSlate-200 hover:bg-govSlate-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                stInfo.status === 'BALANCED' ? 'bg-govEmerald-400' : 'bg-govRed-400'
              }`} />
              <span>{stName}</span>
            </button>
          );
        })}
      </div>

      {/* View Mode: Map or Table */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Improved Geographic India Map SVG */}
          <div className="lg:col-span-7 bg-gradient-to-b from-govSlate-50/70 to-white rounded-xl p-4 border border-govSlate-200 flex flex-col items-center justify-center relative min-h-[340px]">
            <svg
              viewBox="0 0 450 500"
              className="w-full max-w-[380px] h-auto drop-shadow-xs select-none"
            >
              <defs>
                <pattern id="mapGrid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="0.8" fill="#CBD5E1" opacity="0.6" />
                </pattern>
                <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.35" />
                </filter>
              </defs>

              {/* Dotted Background */}
              <rect width="450" height="500" fill="url(#mapGrid)" rx="8" />

              {/* Contextual Surrounding Indian States */}
              <g fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.2" opacity="0.85">
                <path d="M165,45 L180,20 L210,15 L230,28 L245,55 L240,85 L215,100 L185,90 L160,75 Z" />
                <path d="M185,90 L215,100 L240,85 L255,105 L245,130 L210,120 L185,105 Z" />
                <path d="M150,105 L185,105 L210,120 L195,150 L155,145 L145,120 Z" />
                <path d="M95,145 L155,145 L190,165 L175,225 L125,235 L90,195 Z" />
                <path d="M175,225 L245,215 L275,245 L255,290 L185,285 L165,250 Z" />
                <path d="M275,185 L335,190 L345,240 L315,280 L275,245 Z" />
                <path d="M255,290 L315,280 L305,340 L260,350 L240,315 Z" />
                <path d="M205,325 L260,320 L285,365 L250,425 L210,400 L195,355 Z" />
                <path d="M165,415 L185,420 L175,475 L160,465 Z" />
                <path d="M335,190 L365,180 L400,175 L415,200 L385,225 L345,210 Z" />
              </g>

              {/* 1. UTTAR PRADESH */}
              <g
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setSelectedState('Uttar Pradesh')}
                onMouseEnter={() => setHoveredState('Uttar Pradesh')}
                onMouseLeave={() => setHoveredState(null)}
                filter={selectedState === 'Uttar Pradesh' ? 'url(#activeGlow)' : undefined}
              >
                <path
                  d="M190,150 L255,145 L285,180 L275,215 L230,220 L195,195 L190,165 Z"
                  fill={getStatusColor('SHORTAGE', selectedState === 'Uttar Pradesh')}
                  stroke={selectedState === 'Uttar Pradesh' ? '#FFFFFF' : '#CBD5E1'}
                  strokeWidth={selectedState === 'Uttar Pradesh' ? '2.5' : '1.5'}
                  className="transition-all hover:brightness-110"
                />
                <text x="235" y="185" fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">
                  UP
                </text>
              </g>

              {/* 2. GUJARAT */}
              <g
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setSelectedState('Gujarat')}
                onMouseEnter={() => setHoveredState('Gujarat')}
                onMouseLeave={() => setHoveredState(null)}
                filter={selectedState === 'Gujarat' ? 'url(#activeGlow)' : undefined}
              >
                <path
                  d="M85,195 L130,205 L145,245 L135,275 L115,260 L95,265 L75,245 L70,220 L85,210 Z"
                  fill={getStatusColor('BALANCED', selectedState === 'Gujarat')}
                  stroke={selectedState === 'Gujarat' ? '#FFFFFF' : '#CBD5E1'}
                  strokeWidth={selectedState === 'Gujarat' ? '2.5' : '1.5'}
                  className="transition-all hover:brightness-110"
                />
                <text x="105" y="240" fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">
                  GJ
                </text>
              </g>

              {/* 3. MAHARASHTRA */}
              <g
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setSelectedState('Maharashtra')}
                onMouseEnter={() => setHoveredState('Maharashtra')}
                onMouseLeave={() => setHoveredState(null)}
                filter={selectedState === 'Maharashtra' ? 'url(#activeGlow)' : undefined}
              >
                <path
                  d="M135,275 L185,265 L245,285 L240,325 L190,345 L155,340 L135,320 L130,290 Z"
                  fill={getStatusColor('SHORTAGE', selectedState === 'Maharashtra')}
                  stroke={selectedState === 'Maharashtra' ? '#FFFFFF' : '#CBD5E1'}
                  strokeWidth={selectedState === 'Maharashtra' ? '2.5' : '1.5'}
                  className="transition-all hover:brightness-110"
                />
                <text x="185" y="310" fill="#FFFFFF" fontSize="12" fontWeight="800" textAnchor="middle">
                  MH
                </text>
              </g>

              {/* 4. KARNATAKA */}
              <g
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setSelectedState('Karnataka')}
                onMouseEnter={() => setHoveredState('Karnataka')}
                onMouseLeave={() => setHoveredState(null)}
                filter={selectedState === 'Karnataka' ? 'url(#activeGlow)' : undefined}
              >
                <path
                  d="M145,340 L185,345 L205,370 L195,430 L165,420 L145,385 L140,355 Z"
                  fill={getStatusColor('SHORTAGE', selectedState === 'Karnataka')}
                  stroke={selectedState === 'Karnataka' ? '#FFFFFF' : '#CBD5E1'}
                  strokeWidth={selectedState === 'Karnataka' ? '2.5' : '1.5'}
                  className="transition-all hover:brightness-110"
                />
                <text x="175" y="385" fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">
                  KA
                </text>
              </g>

              {/* 5. TAMIL NADU */}
              <g
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setSelectedState('Tamil Nadu')}
                onMouseEnter={() => setHoveredState('Tamil Nadu')}
                onMouseLeave={() => setHoveredState(null)}
                filter={selectedState === 'Tamil Nadu' ? 'url(#activeGlow)' : undefined}
              >
                <path
                  d="M195,415 L235,410 L230,465 L205,485 L175,475 L180,430 Z"
                  fill={getStatusColor('SHORTAGE', selectedState === 'Tamil Nadu')}
                  stroke={selectedState === 'Tamil Nadu' ? '#FFFFFF' : '#CBD5E1'}
                  strokeWidth={selectedState === 'Tamil Nadu' ? '2.5' : '1.5'}
                  className="transition-all hover:brightness-110"
                />
                <text x="205" y="450" fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">
                  TN
                </text>
              </g>
            </svg>
          </div>

          {/* Selected State Inspection Panel */}
          <div className="lg:col-span-5 bg-govNavy-900 text-white rounded-xl p-5 border border-govNavy-800 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-govNavy-800 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-govCyan-400">
                    Inspected Territory
                  </span>
                  <h4 className="text-xl font-extrabold text-white tracking-tight">
                    {selectedState}
                  </h4>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  current.status === 'SHORTAGE'
                    ? 'bg-govRed-500/20 text-govRed-300 border-govRed-500/40'
                    : 'bg-govEmerald-500/20 text-govEmerald-300 border-govEmerald-500/40'
                }`}>
                  {current.status}
                </span>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-govNavy-800/80 p-3 rounded-lg border border-govNavy-700">
                  <div className="flex items-center space-x-1.5 text-[10px] text-govSlate-400 font-medium mb-1">
                    <Briefcase className="w-3 h-3 text-govCyan-400" />
                    <span>State Demand</span>
                  </div>
                  <div className="text-lg font-extrabold text-white tabular-nums">
                    {current.demand.toLocaleString()}
                  </div>
                </div>

                <div className="bg-govNavy-800/80 p-3 rounded-lg border border-govNavy-700">
                  <div className="flex items-center space-x-1.5 text-[10px] text-govSlate-400 font-medium mb-1">
                    <GraduationCap className="w-3 h-3 text-govEmerald-400" />
                    <span>Skilled Supply</span>
                  </div>
                  <div className="text-lg font-extrabold text-white tabular-nums">
                    {current.supply.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Deficit Trade & Gap Details */}
              <div className="bg-govNavy-800/80 p-3.5 rounded-lg border border-govNavy-700 mb-5">
                <div className="text-xs text-govSlate-400 mb-1">Top Deficit Occupation</div>
                <div className="text-sm font-bold text-govCyan-400">
                  {current.topShortage}
                </div>
                <div className="text-xs text-govSlate-300 mt-2 flex items-center justify-between">
                  <span>Net Gap:</span>
                  <span className="text-govRed-400 font-bold tabular-nums">
                    +{current.gap.toLocaleString()} seats
                  </span>
                </div>
                <div className="w-full bg-govNavy-950 rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div
                    className="bg-govCyan-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((current.supply / current.demand) * 100))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-govSlate-400 mt-1">
                  <span>Institutional Supply Absorption</span>
                  <span>{Math.round((current.supply / current.demand) * 100)}%</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectState && onSelectState(selectedState)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-govCyan-600 hover:bg-govCyan-500 text-white font-bold text-xs transition shadow-xs cursor-pointer active:scale-98"
            >
              <span>View Full {selectedState} Analytics</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Direct Table Comparison View */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-govSlate-100/70 border-b border-govSlate-200 text-[10px] font-bold uppercase tracking-wider text-govSlate-600">
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Demand</th>
                <th className="py-3 px-4">Supply</th>
                <th className="py-3 px-4">Net Gap</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Top Shortage Trade</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govSlate-100">
              {Object.entries(STATE_DATA).map(([stName, stInfo]) => (
                <tr
                  key={stName}
                  onClick={() => setSelectedState(stName)}
                  className={`hover:bg-govSlate-50 transition cursor-pointer ${
                    selectedState === stName ? 'bg-govCyan-50/50 font-semibold' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-govNavy-900 font-bold">{stName}</td>
                  <td className="py-3 px-4 tabular-nums">{stInfo.demand.toLocaleString()}</td>
                  <td className="py-3 px-4 tabular-nums">{stInfo.supply.toLocaleString()}</td>
                  <td className="py-3 px-4 tabular-nums font-bold text-govRed-600">+{stInfo.gap.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      stInfo.status === 'SHORTAGE'
                        ? 'bg-govRed-50 text-govRed-700 border-govRed-200'
                        : 'bg-govEmerald-50 text-govEmerald-700 border-govEmerald-200'
                    }`}>
                      {stInfo.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-govSlate-700">{stInfo.topShortage}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectState) onSelectState(stName);
                      }}
                      className="inline-flex items-center space-x-1 text-govCyan-600 hover:text-govNavy-900 font-semibold text-xs"
                    >
                      <span>Explore</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
