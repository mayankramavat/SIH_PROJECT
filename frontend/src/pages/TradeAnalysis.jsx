import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Briefcase,
  GraduationCap,
  Scale,
  Award,
  TrendingUp,
  Percent,
  Activity,
  Layers,
  CheckCircle2,
  Filter,
  MapPin,
  Download
} from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';
import {
  getTrades,
  getGap,
  getSupply,
  getForecastSummary
} from '../services/api';

export default function TradeAnalysis({
  selectedTrade = 'Junior Software Developer',
  selectedState = 'Maharashtra',
  selectedDistrict = 'Pune'
}) {
  const [currentTrade, setCurrentTrade] = useState(selectedTrade);
  const [tradesList, setTradesList] = useState([
    'Junior Software Developer',
    'Web Developer',
    'Automotive Service Technician',
    'CNC Machine Operator',
    'Solar Panel Installation Technician',
    'General Duty Assistant'
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Trade metrics
  const [tradeProfile, setTradeProfile] = useState(null);
  const [districtComparison, setDistrictComparison] = useState([]);
  const [forecastTrends, setForecastTrends] = useState([]);

  useEffect(() => {
    setCurrentTrade(selectedTrade);
  }, [selectedTrade]);

  useEffect(() => {
    async function loadTrades() {
      try {
        const res = await getTrades();
        if (res && Array.isArray(res.trades)) {
          setTradesList(res.trades);
        }
      } catch (e) {
        console.warn('Could not load trades:', e);
      }
    }
    loadTrades();
  }, []);

  useEffect(() => {
    async function fetchTradeData() {
      setLoading(true);
      setError(null);
      try {
        const [gapRes, supplyRes, forecastRes] = await Promise.allSettled([
          getGap({ trade: currentTrade }),
          getSupply({ trade: currentTrade }),
          getForecastSummary({ trade: currentTrade })
        ]);

        if (gapRes.status === 'fulfilled' && Array.isArray(gapRes.value) && gapRes.value.length > 0) {
          const gaps = gapRes.value;
          const totDemand = gaps.reduce((acc, r) => acc + (r.demand || 0), 0);
          const totSupply = gaps.reduce((acc, r) => acc + (r.supply || 0), 0);
          const totGap = totDemand - totSupply;
          const avgDemandIndex = gaps.reduce((acc, r) => acc + (r.demand_index || 0), 0) / gaps.length;
          const avgSupplyIndex = gaps.reduce((acc, r) => acc + (r.supply_index || 0), 0) / gaps.length;

          // Find first matching supply record for training metrics
          let placementRate = 82.5;
          let trainingUtil = 88.0;
          if (supplyRes.status === 'fulfilled' && Array.isArray(supplyRes.value) && supplyRes.value.length > 0) {
            const sRec = supplyRes.value[0];
            if (sRec.placement_rate !== null && sRec.placement_rate !== undefined) {
              placementRate = sRec.placement_rate * 100;
            }
            if (sRec.training_utilization !== null && sRec.training_utilization !== undefined) {
              trainingUtil = sRec.training_utilization * 100;
            }
          }

          setTradeProfile({
            trade: currentTrade,
            sector: gaps[0]?.sector || 'IT-ITeS',
            nco_code: gaps[0]?.nco_code || '2512.0101',
            nsqf_level: 'Level 5',
            demand: totDemand,
            supply: totSupply,
            gap: totGap,
            gap_pct: totDemand > 0 ? ((totGap / totDemand) * 100).toFixed(1) : 0,
            demand_index: avgDemandIndex.toFixed(1),
            supply_index: avgSupplyIndex.toFixed(1),
            placement_rate: placementRate.toFixed(1),
            training_utilization: trainingUtil.toFixed(1)
          });

          setDistrictComparison(gaps);
        }

        if (forecastRes.status === 'fulfilled' && Array.isArray(forecastRes.value)) {
          const fRecords = forecastRes.value;
          const cur = fRecords.reduce((acc, r) => acc + (r.current_demand || 0), 0);
          const m3 = fRecords.reduce((acc, r) => acc + (r.predicted_demand_3m || 0), 0);
          const m6 = fRecords.reduce((acc, r) => acc + (r.predicted_demand_6m || 0), 0);
          const m12 = fRecords.reduce((acc, r) => acc + (r.predicted_demand_12m || 0), 0);

          setForecastTrends([
            { month: 'Baseline (Mar 24)', demand: cur },
            { month: '+3 Months (Jun 24)', demand: m3 },
            { month: '+6 Months (Sep 24)', demand: m6 },
            { month: '+12 Months (Mar 25)', demand: m12 },
          ]);
        }
      } catch (err) {
        console.error('Failed to load trade analysis:', err);
        setError('Unable to connect to the analytics server for trade intelligence.');
      } finally {
        setLoading(false);
      }
    }

    if (currentTrade) {
      fetchTradeData();
    }
  }, [currentTrade]);

  if (loading && !tradeProfile) {
    return <LoadingState message={`Loading intelligence for ${currentTrade}...`} />;
  }

  if (error && !tradeProfile) {
    return <ErrorState message={error} onRetry={() => setCurrentTrade(currentTrade)} />;
  }

  return (
    <div className="space-y-6">
      {/* Trade Profile Hero Header */}
      <div className="bg-white rounded-xl border border-govSlate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-govSlate-100 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-govNavy-900 text-white font-mono">
                NCO {tradeProfile?.nco_code || '2512.0101'}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-govCyan-50 text-govCyan-700 border border-govCyan-200">
                NSQF {tradeProfile?.nsqf_level || 'Level 5'}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-govSlate-100 text-govSlate-700">
                Sector: {tradeProfile?.sector || 'IT-ITeS'}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                tradeProfile?.gap > 0
                  ? 'bg-govRed-50 text-govRed-700 border-govRed-200'
                  : 'bg-govEmerald-50 text-govEmerald-700 border-govEmerald-200'
              }`}>
                {tradeProfile?.gap > 0 ? `Deficit (${tradeProfile.gap_pct}%)` : 'Equilibrium Supply'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-govNavy-900 tracking-tight">
              {currentTrade}
            </h2>
            <p className="text-xs text-govSlate-500 mt-0.5">
              Occupational competency standard and national workforce demand-supply equilibrium profile
            </p>
          </div>

          {/* Trade Selector */}
          <div className="flex items-center space-x-2 text-xs shrink-0">
            <Filter className="w-3.5 h-3.5 text-govSlate-400" />
            <span className="font-semibold text-govSlate-600">Select Trade:</span>
            <select
              value={currentTrade}
              onChange={(e) => setCurrentTrade(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-govSlate-300 bg-govSlate-50 text-govNavy-900 font-semibold focus:outline-none focus:border-govCyan-500 text-xs cursor-pointer"
            >
              {tradesList.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 6 Key Trade Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-5">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-govSlate-400">Total Demand</div>
            <div className="text-xl font-black text-govNavy-900 mt-0.5 tabular-nums">
              {tradeProfile?.demand?.toLocaleString() || 'N/A'}
            </div>
            <div className="text-[10px] text-govSlate-500">Industry Vacancies</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-govSlate-400">Skilled Supply</div>
            <div className="text-xl font-black text-govNavy-900 mt-0.5 tabular-nums">
              {tradeProfile?.supply?.toLocaleString() || 'N/A'}
            </div>
            <div className="text-[10px] text-govSlate-500">Certified Cohorts</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-govSlate-400">Demand Index</div>
            <div className="text-xl font-black text-govCyan-600 mt-0.5 tabular-nums">
              {tradeProfile?.demand_index || '0'} / 100
            </div>
            <div className="text-[10px] text-govSlate-500">Hiring Velocity</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-govSlate-400">Supply Index</div>
            <div className="text-xl font-black text-govNavy-700 mt-0.5 tabular-nums">
              {tradeProfile?.supply_index || '0'} / 100
            </div>
            <div className="text-[10px] text-govSlate-500">Training Capacity</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-govSlate-400">Placement Rate</div>
            <div className="text-xl font-black text-govEmerald-600 mt-0.5 tabular-nums">
              {tradeProfile?.placement_rate || '0'}%
            </div>
            <div className="text-[10px] text-govSlate-500">Industry Absorption</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-govSlate-400">Net Skill Gap</div>
            <div className={`text-xl font-black mt-0.5 tabular-nums ${tradeProfile?.gap > 0 ? 'text-govRed-600' : 'text-govEmerald-600'}`}>
              {tradeProfile?.gap > 0 ? `+${tradeProfile.gap.toLocaleString()}` : tradeProfile?.gap?.toLocaleString() || '0'}
            </div>
            <div className="text-[10px] text-govSlate-500">{tradeProfile?.gap > 0 ? 'Candidate Deficit' : 'Candidate Surplus'}</div>
          </div>
        </div>
      </div>

      {/* Multi-Horizon Demand Projections Chart */}
      <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-govSlate-100">
          <div>
            <h3 className="text-sm font-bold text-govNavy-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-govCyan-600" />
              Multi-Quarter Demand Forecast Trajectory for {currentTrade}
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-govCyan-50 text-govCyan-700 border border-govCyan-200">
            ML Forecaster
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastTrends} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#CBD5E1' }} tick={{ fill: '#64748B', fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={{ stroke: '#CBD5E1' }} tick={{ fill: '#64748B', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B192C', borderColor: '#1E3E62', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="demand" name="Predicted Demand" stroke="#0EA5E9" strokeWidth={3} dot={{ r: 4, fill: '#0EA5E9' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Geographic District Comparison Table for this Trade */}
      <div className="bg-white rounded-xl border border-govSlate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-govSlate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-govNavy-900">
              Regional Geographic Comparison across Districts
            </h3>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-govNavy-50 text-govNavy-800">
              {districtComparison.length} Nodes Mapped
            </span>
            <button
              onClick={() => exportToCsv(districtComparison, `trade_geographic_comparison_${currentTrade.toLowerCase().replace(/\s+/g, '_')}`)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-govNavy-700 bg-white border border-govSlate-300 rounded-lg hover:bg-govSlate-50 hover:text-govNavy-900 transition-colors shadow-sm cursor-pointer"
              title="Export regional geographic comparison data as CSV"
            >
              <Download className="w-3.5 h-3.5 text-govCyan-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-govSlate-50 text-[10px] font-bold uppercase tracking-wider text-govSlate-500 border-b border-govSlate-200">
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Demand</th>
                <th className="py-3 px-4">Supply</th>
                <th className="py-3 px-4">Demand Index</th>
                <th className="py-3 px-4">Supply Index</th>
                <th className="py-3 px-4">Net Gap</th>
                <th className="py-3 px-4">Gap %</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govSlate-200">
              {districtComparison.map((row, idx) => (
                <tr key={idx} className="hover:bg-govSlate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-govNavy-900">{row.state}</td>
                  <td className="py-3 px-4 text-govSlate-700">{row.district}</td>
                  <td className="py-3 px-4 font-mono font-medium text-govNavy-900">{row.demand?.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono text-govSlate-600">{row.supply?.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono text-govCyan-700 font-bold">{row.demand_index ?? 'N/A'}</td>
                  <td className="py-3 px-4 font-mono text-govNavy-700 font-bold">{row.supply_index ?? 'N/A'}</td>
                  <td className={`py-3 px-4 font-mono font-bold ${row.gap > 0 ? 'text-govRed-600' : 'text-govEmerald-600'}`}>
                    {row.gap > 0 ? `+${row.gap?.toLocaleString()}` : row.gap?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-govSlate-600">
                    {row.gap_percentage !== undefined && row.gap_percentage !== null
                      ? `${row.gap_percentage > 0 ? '+' : ''}${row.gap_percentage}%`
                      : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      row.gap_status === 'SHORTAGE'
                        ? 'bg-govRed-50 text-govRed-700 border-govRed-200'
                        : row.gap_status === 'BALANCED'
                        ? 'bg-govEmerald-50 text-govEmerald-700 border-govEmerald-200'
                        : 'bg-govAmber-50 text-govAmber-700 border-govAmber-200'
                    }`}>
                      {row.gap_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
