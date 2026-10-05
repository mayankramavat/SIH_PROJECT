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
  MapPin,
  Briefcase,
  GraduationCap,
  Scale,
  Activity,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Filter,
  Download
} from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';
import {
  getStates,
  getGap,
  getForecastSummary,
  getAlerts
} from '../services/api';

export default function StateAnalysis({
  selectedState = 'Maharashtra',
  onNavigateToDistrict
}) {
  const [currentState, setCurrentState] = useState(selectedState);
  const [statesList, setStatesList] = useState(['Maharashtra', 'Karnataka', 'Gujarat', 'Tamil Nadu', 'Uttar Pradesh']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Computed state metrics
  const [stateDemand, setStateDemand] = useState(null);
  const [stateSupply, setStateSupply] = useState(null);
  const [stateGap, setStateGap] = useState(null);
  const [stateGapPct, setStateGapPct] = useState(null);
  const [districtData, setDistrictData] = useState([]);
  const [shortageTrades, setShortageTrades] = useState([]);
  const [oversupplyTrades, setOversupplyTrades] = useState([]);
  const [forecastTrends, setForecastTrends] = useState([]);
  const [stateAlerts, setStateAlerts] = useState([]);

  useEffect(() => {
    setCurrentState(selectedState);
  }, [selectedState]);

  useEffect(() => {
    async function loadStatesList() {
      try {
        const res = await getStates();
        if (res && Array.isArray(res.states) && res.states.length > 0) {
          setStatesList(res.states);
        }
      } catch (e) {
        console.warn('Could not load states list:', e);
      }
    }
    loadStatesList();
  }, []);

  useEffect(() => {
    async function fetchStateData() {
      setLoading(true);
      setError(null);
      try {
        const [gapRes, forecastRes, alertRes] = await Promise.allSettled([
          getGap({ state: currentState }),
          getForecastSummary({ state: currentState }),
          getAlerts({ state: currentState })
        ]);

        if (gapRes.status === 'fulfilled' && Array.isArray(gapRes.value)) {
          const records = gapRes.value;
          const totDemand = records.reduce((acc, r) => acc + (r.demand || 0), 0);
          const totSupply = records.reduce((acc, r) => acc + (r.supply || 0), 0);
          const totGap = totDemand - totSupply;
          const pct = totDemand > 0 ? ((totGap / totDemand) * 100).toFixed(1) : 0;

          setStateDemand(totDemand);
          setStateSupply(totSupply);
          setStateGap(totGap);
          setStateGapPct(pct);

          // Top shortages and oversupplied trades
          const shortages = records
            .filter((r) => r.gap_status === 'SHORTAGE')
            .sort((a, b) => (b.gap || 0) - (a.gap || 0))
            .slice(0, 5);
          const oversupplies = records
            .filter((r) => r.gap_status === 'OVERSUPPLY')
            .sort((a, b) => (a.gap || 0) - (b.gap || 0))
            .slice(0, 5);

          setShortageTrades(shortages);
          setOversupplyTrades(oversupplies);

          // Group by district for the table
          const distMap = {};
          records.forEach((r) => {
            const dName = r.district || 'Unknown';
            if (!distMap[dName]) {
              distMap[dName] = { district: dName, demand: 0, supply: 0, gap: 0, tradesCount: 0 };
            }
            distMap[dName].demand += r.demand || 0;
            distMap[dName].supply += r.supply || 0;
            distMap[dName].gap += r.gap || 0;
            distMap[dName].tradesCount += 1;
          });

          const distArr = Object.values(distMap).map((d) => ({
            ...d,
            pct: d.demand > 0 ? `${((d.gap / d.demand) * 100).toFixed(1)}%` : '0%',
            status: d.gap > 0 ? 'SHORTAGE' : d.gap < 0 ? 'OVERSUPPLY' : 'BALANCED'
          }));
          setDistrictData(distArr);
        }

        if (forecastRes.status === 'fulfilled' && Array.isArray(forecastRes.value)) {
          const fRecords = forecastRes.value;
          const cur = fRecords.reduce((acc, r) => acc + (r.current_demand || 0), 0);
          const m3 = fRecords.reduce((acc, r) => acc + (r.predicted_demand_3m || 0), 0);
          const m6 = fRecords.reduce((acc, r) => acc + (r.predicted_demand_6m || 0), 0);
          const m12 = fRecords.reduce((acc, r) => acc + (r.predicted_demand_12m || 0), 0);

          setForecastTrends([
            { horizon: 'Base (Mar 24)', demand: cur },
            { horizon: '+3 Months (Jun 24)', demand: m3 },
            { horizon: '+6 Months (Sep 24)', demand: m6 },
            { horizon: '+12 Months (Mar 25)', demand: m12 },
          ]);
        }

        if (alertRes.status === 'fulfilled' && Array.isArray(alertRes.value)) {
          setStateAlerts(alertRes.value.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load state analysis:', err);
        setError('Unable to connect to the analytics server for state analysis.');
      } finally {
        setLoading(false);
      }
    }

    if (currentState) {
      fetchStateData();
    }
  }, [currentState]);

  if (loading && stateDemand === null) {
    return <LoadingState message={`Loading labour market data for ${currentState}...`} />;
  }

  if (error && stateDemand === null) {
    return <ErrorState message={error} onRetry={() => setCurrentState(currentState)} />;
  }

  return (
    <div className="space-y-6">
      {/* State Overview Header Banner with State Selector */}
      <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-govNavy-900 text-govCyan-400 flex items-center justify-center font-bold text-lg border border-govNavy-700 shadow-sm shrink-0">
            <MapPin className="w-6 h-6 text-govCyan-500" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold text-govNavy-900 tracking-tight">
                {currentState} State Labour Market Profile
              </h2>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                stateGap && stateGap > 0
                  ? 'bg-govRed-50 text-govRed-700 border-govRed-200'
                  : 'bg-govEmerald-50 text-govEmerald-700 border-govEmerald-200'
              }`}>
                {stateGap && stateGap > 0 ? 'Deficit Shortage' : 'Balanced Supply'}
              </span>
            </div>
            <p className="text-xs text-govSlate-500 mt-0.5">
              Aggregated across active administrative districts and industrial vocational qualification codes
            </p>
          </div>
        </div>

        {/* State Selector */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-govSlate-500" />
            <span className="font-semibold text-govSlate-700">State:</span>
            <select
              value={currentState}
              onChange={(e) => setCurrentState(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-govSlate-300 bg-govSlate-50 text-govNavy-900 font-semibold focus:bg-white focus:outline-none focus:border-govCyan-500 cursor-pointer text-xs"
            >
              {statesList.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 5 State Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="State Demand"
          value={stateDemand}
          subtitle="Vacancies registered"
          trend="+9.2%"
          trendPositive={true}
          icon={Briefcase}
        />
        <StatCard
          title="Skilled Supply"
          value={stateSupply}
          subtitle="Certified candidates"
          trend="+2.8%"
          trendPositive={true}
          icon={GraduationCap}
        />
        <StatCard
          title="Net Skill Gap"
          value={stateGap}
          subtitle="Overall state deficit"
          badgeText={stateGap > 0 ? 'Deficit' : 'Surplus'}
          badgeVariant={stateGap > 0 ? 'danger' : 'success'}
          icon={Scale}
        />
        <StatCard
          title="Gap Percentage"
          value={stateGapPct !== null ? `${stateGapPct}%` : null}
          subtitle="Relative imbalance"
          badgeText={stateGapPct > 10 ? 'High Deficit' : 'Nominal'}
          badgeVariant={stateGapPct > 10 ? 'danger' : 'default'}
          icon={Activity}
        />
        <StatCard
          title="Early Warnings"
          value={stateAlerts.length}
          subtitle="Active watch signals"
          badgeText="Proactive"
          badgeVariant="warning"
          icon={AlertTriangle}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Shortage Trades in State */}
        <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-govSlate-100">
            <h3 className="text-sm font-bold text-govNavy-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-govRed-500"></span>
              Top Shortage Trades in {currentState}
            </h3>
            <span className="text-[10px] font-bold text-govRed-700 bg-govRed-50 px-2 py-0.5 rounded border border-govRed-200">
              Demand &gt; Supply
            </span>
          </div>

          {shortageTrades.length > 0 ? (
            <div className="space-y-3">
              {shortageTrades.map((t, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-govSlate-50 border border-govSlate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-govNavy-900">{t.trade}</div>
                    <div className="text-[11px] text-govSlate-500">{t.district} • Sector: {t.sector}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-govRed-600">+{t.gap?.toLocaleString()} deficit</div>
                    <div className="text-[10px] text-govSlate-400">Demand: {t.demand} | Supply: {t.supply}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-govSlate-400 text-xs">
              No shortage trades recorded for this state.
            </div>
          )}
        </div>

        {/* Top Oversupplied Trades in State */}
        <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-govSlate-100">
            <h3 className="text-sm font-bold text-govNavy-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-govAmber-500"></span>
              Top Oversupplied Occupations in {currentState}
            </h3>
            <span className="text-[10px] font-bold text-govAmber-700 bg-govAmber-50 px-2 py-0.5 rounded border border-govAmber-200">
              Supply &gt; Demand
            </span>
          </div>

          {oversupplyTrades.length > 0 ? (
            <div className="space-y-3">
              {oversupplyTrades.map((t, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-govSlate-50 border border-govSlate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-govNavy-900">{t.trade}</div>
                    <div className="text-[11px] text-govSlate-500">{t.district} • Sector: {t.sector}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-govAmber-600">{t.gap?.toLocaleString()} surplus</div>
                    <div className="text-[10px] text-govSlate-400">Demand: {t.demand} | Supply: {t.supply}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-govSlate-400 text-xs">
              No oversupplied trades recorded for this state.
            </div>
          )}
        </div>
      </div>

      {/* Forecast & Early Warnings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forecast Trajectory */}
        <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-govSlate-100">
            <h3 className="text-sm font-bold text-govNavy-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-govCyan-600" />
              State Demand Trajectory (3, 6, 12 Month Horizon)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-govCyan-50 text-govCyan-700 border border-govCyan-200">
              AI Forecast
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastTrends} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="horizon" tickLine={false} axisLine={{ stroke: '#CBD5E1' }} tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={{ stroke: '#CBD5E1' }} tick={{ fill: '#64748B', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B192C', borderColor: '#1E3E62', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="demand" name="Predicted Demand" stroke="#0EA5E9" strokeWidth={3} dot={{ r: 4, fill: '#0EA5E9' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* State Early Warnings */}
        <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-govSlate-100">
            <h3 className="text-sm font-bold text-govNavy-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-govAmber-500" />
              Active Early Warnings in {currentState}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-govAmber-50 text-govAmber-800 border border-govAmber-200">
              {stateAlerts.length} Signals
            </span>
          </div>

          {stateAlerts.length > 0 ? (
            <div className="space-y-2.5">
              {stateAlerts.map((alt, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-govSlate-50 border border-govSlate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        alt.warning_level === 'HIGH' ? 'bg-govRed-100 text-govRed-800' : 'bg-govAmber-100 text-govAmber-800'
                      }`}>
                        {alt.warning_level}
                      </span>
                      <span className="font-bold text-govNavy-900">{alt.trade}</span>
                    </div>
                    <div className="text-[11px] text-govSlate-500 mt-0.5">{alt.district} • Horizon: {alt.forecast_horizon}M</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-govRed-600">+{alt.future_gap} deficit</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-govSlate-400 text-xs">
              No active early warnings for this state.
            </div>
          )}
        </div>
      </div>

      {/* District Breakdown Table */}
      <div className="bg-white rounded-xl border border-govSlate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-govSlate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-govNavy-900">
              District Distribution Breakdown ({currentState})
            </h3>
            <p className="text-xs text-govSlate-500">
              Granular vacancy requisitions, training supply, and net gaps by administrative district
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-govNavy-50 text-govNavy-800">
              {districtData.length} Districts Analyzed
            </span>
            <button
              onClick={() => {
                const cols = [
                  { key: 'district', label: 'District' },
                  { key: 'tradesCount', label: 'Active Trades' },
                  { key: 'demand', label: 'Demand' },
                  { key: 'supply', label: 'Supply' },
                  { key: 'gap', label: 'Net Gap' },
                  { key: 'pct', label: 'Gap %' },
                  { key: 'status', label: 'Status' }
                ];
                exportToCsv(`${currentState.toLowerCase()}_district_breakdown`, districtData, cols);
              }}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-govSlate-200 bg-govSlate-50 hover:bg-govSlate-100 text-govSlate-700 text-xs font-semibold shadow-sm transition cursor-pointer"
              title="Export District Table to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-govSlate-50 text-[10px] font-bold uppercase tracking-wider text-govSlate-500 border-b border-govSlate-200">
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Active Trades</th>
                <th className="py-3 px-4">Demand</th>
                <th className="py-3 px-4">Supply</th>
                <th className="py-3 px-4">Net Gap</th>
                <th className="py-3 px-4">Gap %</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-govSlate-200">
              {districtData.map((row, idx) => (
                <tr key={idx} className="hover:bg-govSlate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-govNavy-900 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-govCyan-600" />
                    <span>{row.district}</span>
                  </td>
                  <td className="py-3 px-4 text-govSlate-600">{row.tradesCount} Qualification Roles</td>
                  <td className="py-3 px-4 font-mono font-medium text-govNavy-900">{row.demand.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono text-govSlate-600">{row.supply.toLocaleString()}</td>
                  <td className={`py-3 px-4 font-mono font-bold ${row.gap > 0 ? 'text-govRed-600' : 'text-govEmerald-600'}`}>
                    {row.gap > 0 ? `+${row.gap.toLocaleString()}` : row.gap.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-govSlate-600">{row.pct}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      row.status === 'SHORTAGE'
                        ? 'bg-govRed-50 text-govRed-700 border-govRed-200'
                        : row.status === 'BALANCED'
                        ? 'bg-govEmerald-50 text-govEmerald-700 border-govEmerald-200'
                        : 'bg-govAmber-50 text-govAmber-700 border-govAmber-200'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigateToDistrict && onNavigateToDistrict(row.district)}
                      className="inline-flex items-center space-x-1 text-govCyan-600 hover:text-govCyan-700 font-semibold cursor-pointer"
                    >
                      <span>Drilldown</span>
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
