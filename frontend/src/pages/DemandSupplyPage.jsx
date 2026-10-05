import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  TrendingDown, 
  TrendingUp,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { getDemandSupplyData } from '../services/dataService';

/**
 * Skill Demand vs Supply Page Component
 * 
 * Layout:
 * - Row 1: Horizontal filter row (State, Sector, Year side by side)
 * - Row 2: Grouped bar chart (Demand vs Supply per skill), full width
 * - Row 3: Table below with skill gap (red = shortage, green = surplus)
 */
export default function DemandSupplyPage() {
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [selectedYear, setSelectedYear] = useState('2024 (Current)');

  const [filterOptions, setFilterOptions] = useState({
    states: ['All States'],
    sectors: ['All Sectors'],
    years: ['2024 (Current)']
  });
  const [skillsData, setSkillsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data based on current filters
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const res = await getDemandSupplyData({
          state: selectedState,
          sector: selectedSector,
          year: selectedYear
        });
        if (isMounted) {
          if (res.filters) setFilterOptions(res.filters);
          setSkillsData(res.skillsData || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load demand vs supply data:', err);
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [selectedState, selectedSector, selectedYear]);

  // Aggregate metrics
  const totalDemand = skillsData.reduce((acc, curr) => acc + curr.demand, 0);
  const totalSupply = skillsData.reduce((acc, curr) => acc + curr.supply, 0);
  const netShortage = Math.max(0, totalDemand - totalSupply);
  const shortageCount = skillsData.filter(item => item.status === 'Shortage').length;
  const surplusCount = skillsData.filter(item => item.status === 'Surplus').length;

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Skill Demand vs Institutional Supply</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Compare active industry employer demand against vocational academy and ITI graduate outputs
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-red-50 text-red-700 border border-red-200 font-semibold">
            {shortageCount} Critical Shortages
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
            {surplusCount} Balanced / Surpluses
          </span>
        </div>
      </div>

      {/* ========================================================
          HORIZONTAL FILTERS ROW: State, Sector, Year side by side
         ======================================================== */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
        <div className="flex items-center space-x-2 mb-3">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">Filter Scope</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Filter 1: State */}
          <div>
            <label htmlFor="state-filter" className="block text-xs font-medium text-gray-600 mb-1">State / Region</label>
            <select
              id="state-filter"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {filterOptions.states.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Filter 2: Sector */}
          <div>
            <label htmlFor="sector-filter" className="block text-xs font-medium text-gray-600 mb-1">Industry Sector</label>
            <select
              id="sector-filter"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {filterOptions.sectors.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Filter 3: Year */}
          <div>
            <label htmlFor="year-filter" className="block text-xs font-medium text-gray-600 mb-1">Benchmark Year</label>
            <select
              id="year-filter"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {filterOptions.years.map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================
          ROW 2: Grouped Bar Chart (Demand vs Supply), Full Width
         ======================================================== */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Demand vs Supply by Skill Trade ({selectedSector} • {selectedState})
            </h3>
            <p className="text-xs text-gray-500">
              Blue bars represent active vacancies; green bars represent institutional certified candidates
            </p>
          </div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-4 text-xs font-medium text-gray-600">
            <span className="flex items-center">
              <span className="w-3 h-3 bg-blue-600 rounded-sm mr-1.5"></span>
              Demand: <strong className="ml-1 text-gray-900">{totalDemand.toLocaleString()}</strong>
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm mr-1.5"></span>
              Supply: <strong className="ml-1 text-gray-900">{totalSupply.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {loading ? (
          <div className="h-80 flex justify-center items-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : skillsData.length === 0 ? (
          <div className="h-64 flex flex-col justify-center items-center text-gray-400 text-sm">
            <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
            <p>No skill records match the selected filter combination.</p>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillsData} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="skill" 
                  tick={{ fontSize: 11, fill: '#334155' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  interval={0}
                  tickFormatter={(val) => val.length > 18 ? `${val.substring(0, 16)}...` : val}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }} 
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip
                  formatter={(value, name) => [
                    value.toLocaleString(), 
                    name === 'demand' ? 'Industry Demand (Vacancies)' : 'Institutional Supply (Passouts)'
                  ]}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
                <Bar dataKey="demand" name="Employer Demand" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={22} />
                <Bar dataKey="supply" name="Institutional Supply" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ========================================================
          ROW 3: Table with Skill Gap (Red = Shortage, Green = Surplus)
         ======================================================== */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50/50">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Skill Gap Diagnosis & Recommended Action</h3>
            <p className="text-xs text-gray-500">
              Deficit analysis highlighting where institutional training seats must be scaled or re-allocated
            </p>
          </div>
          <div className="mt-2 sm:mt-0 text-xs text-gray-500 font-medium">
            Showing {skillsData.length} Skill Trades
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3">Skill / Vocational Trade</th>
                <th scope="col" className="px-6 py-3">Sector</th>
                <th scope="col" className="px-6 py-3">State</th>
                <th scope="col" className="px-6 py-3">Demand</th>
                <th scope="col" className="px-6 py-3">Supply</th>
                <th scope="col" className="px-6 py-3">Net Gap</th>
                <th scope="col" className="px-6 py-3">Gap %</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Strategic Action Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-gray-700">
              {skillsData.map((item) => {
                const isShortage = item.status === 'Shortage';
                return (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {item.skill}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                      {item.sector}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {item.state}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.demand.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.supply.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {item.gap.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold text-xs ${isShortage ? 'text-red-600' : 'text-emerald-600'}`}>
                        {item.gapPercentage}%
                      </span>
                    </td>
                    {/* Status Pill: Red = Shortage, Green = Surplus */}
                    <td className="px-6 py-4">
                      {isShortage ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          <AlertTriangle className="w-3 h-3 mr-1 text-red-500" />
                          Shortage
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                          Surplus
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-700">
                      {item.recommendedAction}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
