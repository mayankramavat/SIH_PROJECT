import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Building2, 
  Flame, 
  TrendingDown,
  ArrowUpRight,
  Info,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import SummaryCard from '../components/SummaryCard';
import { getOverviewData } from '../services/dataService';

/**
 * Overview Page Component
 * 
 * Layout:
 * - Row 1: 4 cards in one line (Total Job Openings, Top Demanded Sector, Top Skill in Demand, Skill Gap %)
 * - Row 2: Line chart (job demand trend, last 12 months) next to bar chart (top 5 sectors by demand)
 * - Row 3: Full-width table summarizing key national sector demand & distribution
 */
export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await getOverviewData();
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load overview data:', err);
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  if (loading || !data) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-sm text-gray-500 font-medium">Loading Overview Data...</span>
      </div>
    );
  }

  const { summaryCards, demandTrendLast12Months, topSectorsByDemand, nationalSnapshot } = data;

  return (
    <div className="space-y-6">
      {/* Page Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">National Labour Market Overview</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Aggregated intelligence synthesizing NCS vacancy feeds, PLFS surveys, and SIDH institutional passouts
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
          <span>Reporting Period: {nationalSnapshot?.reportingPeriod || 'FY 2023-24 (Q4)'}</span>
        </div>
      </div>

      {/* ========================================================
          ROW 1: 4 Cards in One Line (Responsive Grid)
         ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Job Openings */}
        <SummaryCard
          label={summaryCards.totalJobOpenings.label}
          value={summaryCards.totalJobOpenings.value}
          trend={summaryCards.totalJobOpenings.trend}
          trendPeriod={summaryCards.totalJobOpenings.trendPeriod}
          subtext={summaryCards.totalJobOpenings.subtext}
          icon={Briefcase}
        />

        {/* Card 2: Top Demanded Sector */}
        <SummaryCard
          label={summaryCards.topDemandedSector.label}
          value={summaryCards.topDemandedSector.value}
          badgeText={summaryCards.topDemandedSector.metric}
          badgeColor="blue"
          subtext={summaryCards.topDemandedSector.share}
          icon={Building2}
        />

        {/* Card 3: Top Skill in Demand */}
        <SummaryCard
          label={summaryCards.topSkillInDemand.label}
          value={summaryCards.topSkillInDemand.value}
          trend={summaryCards.topSkillInDemand.growth}
          trendPeriod="YoY surge"
          subtext={summaryCards.topSkillInDemand.metric}
          icon={Flame}
        />

        {/* Card 4: Skill Gap % */}
        <SummaryCard
          label={summaryCards.skillGapPercentage.label}
          value={summaryCards.skillGapPercentage.value}
          badgeText={summaryCards.skillGapPercentage.status}
          badgeColor="red"
          subtext={summaryCards.skillGapPercentage.deficitCount}
          icon={TrendingDown}
        />
      </div>

      {/* ========================================================
          ROW 2: Charts Side by Side (50% / 50%)
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Line Chart (Job Demand Trend, Last 12 Months) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Job Demand & Supply Trajectory</h3>
              <p className="text-xs text-gray-500">12-Month historical trend across registered portals</p>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Monthly Active
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={demandTrendLast12Months} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val, name) => [val.toLocaleString(), name === 'demand' ? 'Demand (Vacancies)' : 'Supply (Graduates)']}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="demand" name="Market Demand" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: '#2563eb' }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="supply" name="Institutional Supply" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Bar Chart (Top 5 Sectors by Demand) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Top 5 Sectors by Vacancy Demand</h3>
              <p className="text-xs text-gray-500">Highest volume industry hiring concentrations</p>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Q4 FY24
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSectorsByDemand} layout="vertical" margin={{ top: 10, right: 30, left: 35, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <YAxis dataKey="sector" type="category" tick={{ fontSize: 11, fill: '#334155' }} axisLine={{ stroke: '#cbd5e1' }} width={120} />
                <Tooltip
                  formatter={(val) => [`${val.toLocaleString()} Vacancies`, 'Demand']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="demand" name="Active Vacancies" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========================================================
          ROW 3: Table Full Width (Sector Breakdown & Coverage)
         ======================================================== */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50/50">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Priority Sector Demand Breakdown</h3>
            <p className="text-xs text-gray-500">Overview of top industry sectors, growth velocities, and institutional alignment</p>
          </div>
          <div className="mt-2 sm:mt-0 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            {nationalSnapshot?.statesMonitored} States • {nationalSnapshot?.districtsCovered} Districts Mapped
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3">Sector Name</th>
                <th scope="col" className="px-6 py-3">Current Active Demand</th>
                <th scope="col" className="px-6 py-3">YoY Growth Velocity</th>
                <th scope="col" className="px-6 py-3">National Share</th>
                <th scope="col" className="px-6 py-3">Key Focus Roles</th>
                <th scope="col" className="px-6 py-3">Recommended Policy Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-gray-700">
              {topSectorsByDemand.map((sec, idx) => {
                const total = topSectorsByDemand.reduce((acc, curr) => acc + curr.demand, 0);
                const sharePercent = ((sec.demand / total) * 100).toFixed(1);
                return (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>{sec.sector}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {sec.demand.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                        {sec.growth}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${sharePercent}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{sharePercent}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {idx === 0 && 'Cloud Eng, Data Analysts, DevOps'}
                      {idx === 1 && 'CNC Operator, EV Technician, Robotic Welder'}
                      {idx === 2 && 'General Duty Assistant, Lab Tech, Dialysis Tech'}
                      {idx === 3 && 'Supply Chain Coord, POS Associate, Merchandiser'}
                      {idx === 4 && 'Drone Agri-Pilot, Cold Chain Mgr, Soil Analyst'}
                    </td>
                    <td className="px-6 py-4 text-xs text-blue-700 font-medium">
                      {idx === 0 && 'Incorporate Cloud Sandbox Credits in ITIs'}
                      {idx === 1 && 'Modernize lathe & CNC workshop infrastructure'}
                      {idx === 2 && 'Expand clinical stipend rotations'}
                      {idx === 3 && 'Align with e-commerce hub logistics'}
                      {idx === 4 && 'Scale KVK drone pilot partnerships'}
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
