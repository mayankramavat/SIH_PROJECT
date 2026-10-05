import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Building2,
  Briefcase,
  GraduationCap,
  Scale,
  Activity,
  Award,
  Filter,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Download
} from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';
import {
  getStates,
  getDistricts,
  getGap,
  getForecastSummary,
  getAlerts
} from '../services/api';

export default function DistrictAnalysis({
  selectedDistrict = 'Pune',
  selectedState = 'Maharashtra',
  onNavigateToTrade
}) {
  const [currentState, setCurrentState] = useState(selectedState);
  const [currentDistrict, setCurrentDistrict] = useState(selectedDistrict);
  const [statesList, setStatesList] = useState(['Maharashtra', 'Karnataka', 'Gujarat', 'Tamil Nadu', 'Uttar Pradesh']);
  const [districtsList, setDistrictsList] = useState(['Pune', 'Mumbai Suburban', 'Nagpur', 'Nashik', 'Aurangabad']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // District computed metrics
  const [demandTotal, setDemandTotal] = useState(null);
  const [supplyTotal, setSupplyTotal] = useState(null);
  const [gapTotal, setGapTotal] = useState(null);
  const [gapPct, setGapPct] = useState(null);
  const [tradesList, setTradesList] = useState([]);
  const [forecastTrajectory, setForecastTrajectory] = useState([]);
  const [districtAlerts, setDistrictAlerts] = useState([]);

  useEffect(() => {
    setCurrentState(selectedState);
  }, [selectedState]);

  useEffect(() => {
    setCurrentDistrict(selectedDistrict);
  }, [selectedDistrict]);

  // Load all states on mount
  useEffect(() => {
    async function loadStates() {
      try {
        const res = await getStates();
        if (res && Array.isArray(res.states)) {
          setStatesList(res.states);
        }
      } catch (e) {
        console.warn('Could not load states:', e);
      }
    }
    loadStates();
  }, []);

  // Update districts when state changes (Cascading Filter: State -> District)
  useEffect(() => {
    async function loadDistrictsForState() {
      try {
        const res = await getDistricts(currentState);
        if (res && Array.isArray(res.districts) && res.districts.length > 0) {
          setDistrictsList(res.districts);
          if (!res.districts.includes(currentDistrict)) {
            setCurrentDistrict(res.districts[0]);
          }
        }
      } catch (e) {
        console.warn('Could not load districts:', e);
      }
    }
    if (currentState) {
      loadDistrictsForState();
    }
  }, [currentState]);

  // Fetch district specific analytics
  useEffect(() => {
    async function fetchDistrictData() {
      setLoading(true);
      setError(null);
      try {
        const [gapRes, forecastRes, alertRes] = await Promise.allSettled([
          getGap({ state: currentState, district: currentDistrict }),
          getForecastSummary({ state: currentState, district: currentDistrict }),
          getAlerts({ state: currentState, district: currentDistrict })
        ]);

        if (gapRes.status === 'fulfilled' && Array.isArray(gapRes.value)) {
          const records = gapRes.value;
          const dTot = records.reduce((acc, r) => acc + (r.demand || 0), 0);
          const sTot = records.reduce((acc, r) => acc + (r.supply || 0), 0);
          const gTot = dTot - sTot;
          const pct = dTot > 0 ? ((gTot / dTot) * 100).toFixed(1) : 0;

          setDemandTotal(dTot);
          setSupplyTotal(sTot);
          setGapTotal(gTot);
          setGapPct(pct);
          setTradesList(records);
        }

        if (forecastRes.status === 'fulfilled' && Array.isArray(forecastRes.value)) {
          const fRecords = forecastRes.value;
          const cur = fRecords.reduce((acc, r) => acc + (r.current_demand || 0), 0);
          const m3 = fRecords.reduce((acc, r) => acc + (r.predicted_demand_3m || 0), 0);
          const m6 = fRecords.reduce((acc, r) => acc + (r.predicted_demand_6m || 0), 0);
          const m12 = fRecords.reduce((acc, r) => acc + (r.predicted_demand_12m || 0), 0);

          setForecastTrajectory([
            { month: 'Base (Mar 24)', demand: cur },
            { month: 'Jun 24 (+3M)', demand: m3 },
            { month: 'Sep 24 (+6M)', demand: m6 },
            { month: 'Mar 25 (+12M)', demand: m12 },
          ]);
        }

        if (alertRes.status === 'fulfilled' && Array.isArray(alertRes.value)) {
          setDistrictAlerts(alertRes.value);
        }
      } catch (err) {
        console.error('Failed to load district analysis:', err);
        setError('Unable to connect to the analytics server for district analysis.');
      } finally {
        setLoading(false);
      }
    }

    if (currentState && currentDistrict) {
      fetchDistrictData();
    }
  }, [currentState, currentDistrict]);

  if (loading && demandTotal === null) {
    return <LoadingState message={`Loading intelligence for ${currentDistrict}, ${currentState}...`} />;
  }

  if (error && demandTotal === null) {
    return <ErrorState message={error} onRetry={() => setCurrentDistrict(currentDistrict)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner with Cascading State and District Selectors */}
      <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-govNavy-900 text-govCyan-400 flex items-center justify-center font-bold text-lg border border-govNavy-700 shadow-sm shrink-0">
            <Building2 className="w-6 h-6 text-govCyan-500" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold text-govNavy-900 tracking-tight">
                {currentDistrict} District Workforce Intelligence ({currentState})
              </h2>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                gapTotal && gapTotal > 0
                  ? 'bg-govRed-50 text-govRed-700 border-govRed-200'
                  : 'bg-govEmerald-50 text-govEmerald-700 border-govEmerald-200'
              }`}>
                {gapTotal && gapTotal > 0 ? 'Shortage Cluster' : 'Balanced Cluster'}
              </span>
            </div>
            <p className="text-xs text-govSlate-500 mt-0.5">
              Vocational training supply vs employer requisition analysis for administrative district
            </p>
          </div>
        </div>

        {/* Cascading State -> District Selector */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-govSlate-600">State:</span>
            <select
              value={currentState}
              onChange={(e) => setCurrentState(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-govSlate-300 bg-govSlate-50 text-govNavy-900 font-semibold focus:outline-none focus:border-govCyan-500 text-xs cursor-pointer"
            >
              {statesList.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-govSlate-600">District:</span>
            <select
              value={currentDistrict}
              onChange={(e) => setCurrentDistrict(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-govSlate-300 bg-govSlate-50 text-govNavy-900 font-semibold focus:outline-none focus:border-govCyan-500 text-xs cursor-pointer"
            >
              {districtsList.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 5 District Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="District Demand"
          value={demandTotal}
          subtitle="Vacancies posted"
          trend="+11.4%"
          trendPositive={true}
          icon={Briefcase}
        />
        <StatCard
          title="Skilled Supply"
          value={supplyTotal}
          subtitle="Certified cohorts"
          trend="+4.1%"
          trendPositive={true}
          icon={GraduationCap}
        />
        <StatCard
          title="Net Deficit"
          value={gapTotal}
          subtitle="Unmet candidate demand"
          badgeText={gapTotal > 0 ? 'Deficit' : 'Surplus'}
          badgeVariant={gapTotal > 0 ? 'danger' : 'success'}
          icon={Scale}
        />
        <StatCard
          title="Gap Percentage"
          value={gapPct !== null ? `${gapPct}%` : null}
          subtitle="Disbalance ratio"
          badgeText={gapPct > 10 ? 'High' : 'Normal'}
          badgeVariant={gapPct > 10 ? 'danger' : 'default'}
          icon={Activity}
        />
        <StatCard
          title="Early Warning Signals"
          value={districtAlerts.length}
          subtitle="Future risks detected"
          badgeText="Active"
          badgeVariant="warning"
          icon={AlertTriangle}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* District Multi-Month Demand Forecast (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-govSlate-100">
            <div>
              <h3 className="text-sm font-bold text-govNavy-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-govCyan-600" />
                {currentDistrict} Multi-Quarter Forecast Curve
              </h3>
              <p className="text-xs text-govSlate-500">
                Baseline demand through 3M, 6M, and 12M forward horizon projections
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-govCyan-50 text-govCyan-700 border border-govCyan-200">
              AI Forecast
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastTrajectory} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#CBD5E1' }} tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={{ stroke: '#CBD5E1' }} tick={{ fill: '#64748B', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B192C', borderColor: '#1E3E62', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="demand" name="Projected Demand" stroke="#0EA5E9" strokeWidth={3} dot={{ r: 4, fill: '#0EA5E9' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* District Early Warning Alerts (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-govSlate-100">
            <h3 className="text-sm font-bold text-govNavy-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-govAmber-500" />
              District Emerging Shortages
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-govAmber-50 text-govAmber-800 border border-govAmber-200">
              {districtAlerts.length} Alerts
            </span>
          </div>

          {districtAlerts.length > 0 ? (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {districtAlerts.map((alt, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-govSlate-50 border border-govSlate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      alt.warning_level === 'HIGH' ? 'bg-govRed-100 text-govRed-800' : 'bg-govAmber-100 text-govAmber-800'
                    }`}>
                      {alt.warning_level} Risk
                    </span>
                    <span className="font-mono font-bold text-govRed-600">+{alt.future_gap} deficit</span>
                  </div>
                  <div className="font-bold text-govNavy-900 mt-1">{alt.trade}</div>
                  <div className="text-[11px] text-govSlate-500 mt-0.5">
                    Horizon: {alt.forecast_horizon}M • Est. Supply: {alt.estimated_supply}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-govSlate-400 text-xs">
              No active early warnings for this district.
            </div>
          )}
        </div>
      </div>

      {/* Top Trades in District Table */}
      <div className="bg-white rounded-xl border border-govSlate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-govSlate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-govNavy-900">
              Occupational Qualifications & Skill Gaps in {currentDistrict}
            </h3>
            <p className="text-xs text-govSlate-500">
              Demand requisition volume vs certified training cohorts for all mapped vocational trades
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-govNavy-50 text-govNavy-800">
              {tradesList.length} Trades Active
            </span>
            <button
              onClick={() => exportToCsv(tradesList, `district_skills_${currentDistrict.toLowerCase().replace(/\s+/g, '_')}`)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-govNavy-700 bg-white border border-govSlate-300 rounded-lg hover:bg-govSlate-50 hover:text-govNavy-900 transition-colors shadow-sm cursor-pointer"
              title="Export district occupational skill gap data as CSV"
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
                <th className="py-3 px-4">Trade Name</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4">Demand</th>
                <th className="py-3 px-4">Supply</th>
                <th className="py-3 px-4">Net Gap</th>
                <th className="py-3 px-4">Gap %</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govSlate-200">
              {tradesList.map((row, idx) => (
                <tr key={idx} className="hover:bg-govSlate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-govNavy-900">
                    {row.trade}
                  </td>
                  <td className="py-3 px-4 text-govSlate-600">{row.sector}</td>
                  <td className="py-3 px-4 font-mono font-medium text-govNavy-900">{row.demand?.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono text-govSlate-600">{row.supply?.toLocaleString()}</td>
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
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigateToTrade && onNavigateToTrade(row.trade)}
                      className="inline-flex items-center space-x-1 text-govCyan-600 hover:text-govCyan-700 font-semibold cursor-pointer"
                    >
                      <span>Analyze</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
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
