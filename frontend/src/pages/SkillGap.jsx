import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Download,
  Search,
  Filter,
  Layers
} from 'lucide-react';
import { getGap } from '../services/api';

export default function SkillGap({ onSelectTrade }) {
  const [gapRecords, setGapRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterSector, setFilterSector] = useState('ALL');

  const fetchGaps = async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await getGap();
      if (Array.isArray(records)) {
        setGapRecords(records);
      }
    } catch (err) {
      console.error('Failed to load skill gap records:', err);
      setError('Unable to connect to the analytics server to retrieve skill gap data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGaps();
  }, []);

  // Compute KPI overview from fetched backend records
  const totalNetGap = gapRecords.reduce((acc, r) => acc + (r.gap || 0), 0);
  const shortageCount = gapRecords.filter((r) => r.gap_status === 'SHORTAGE').length;
  const balancedCount = gapRecords.filter((r) => r.gap_status === 'BALANCED').length;
  const oversupplyCount = gapRecords.filter((r) => r.gap_status === 'OVERSUPPLY').length;
  const totalCount = gapRecords.length || 1;

  // Filter records
  const filteredRecords = gapRecords.filter((row) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (row.trade && row.trade.toLowerCase().includes(term)) ||
      (row.state && row.state.toLowerCase().includes(term)) ||
      (row.district && row.district.toLowerCase().includes(term)) ||
      (row.sector && row.sector.toLowerCase().includes(term));

    const matchesStatus = filterStatus === 'ALL' || row.gap_status === filterStatus;
    const matchesSector = filterSector === 'ALL' || row.sector === filterSector;

    return matchesSearch && matchesStatus && matchesSector;
  });

  const columns = [
    {
      label: 'State',
      key: 'state',
      render: (val) => <span className="font-bold text-govNavy-900">{val}</span>
    },
    {
      label: 'District',
      key: 'district',
      render: (val) => <span className="text-govSlate-700">{val}</span>
    },
    {
      label: 'Sector',
      key: 'sector',
      render: (val) => <span className="text-govSlate-600">{val}</span>
    },
    {
      label: 'Trade',
      key: 'trade',
      render: (val) => (
        <span
          onClick={() => onSelectTrade && onSelectTrade(val)}
          className="font-semibold text-govNavy-900 hover:text-govCyan-700 cursor-pointer"
        >
          {val}
        </span>
      )
    },
    {
      label: 'Demand',
      key: 'demand',
      render: (val) => <span className="font-mono text-govNavy-900">{val?.toLocaleString()}</span>
    },
    {
      label: 'Supply',
      key: 'supply',
      render: (val) => <span className="font-mono text-govSlate-600">{val?.toLocaleString()}</span>
    },
    {
      label: 'Gap',
      key: 'gap',
      render: (val) => (
        <span className={`font-mono font-bold ${val > 0 ? 'text-govRed-600' : 'text-govEmerald-600'}`}>
          {val > 0 ? `+${val?.toLocaleString()}` : val?.toLocaleString()}
        </span>
      )
    },
    {
      label: 'Gap %',
      key: 'gap_percentage',
      render: (val) => (
        <span className="font-mono font-bold text-govSlate-800">
          {val !== undefined && val !== null ? `${val > 0 ? '+' : ''}${val}%` : 'N/A'}
        </span>
      )
    },
    {
      label: 'Status',
      key: 'gap_status',
      render: (val) => (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
          val === 'SHORTAGE'
            ? 'bg-govRed-50 text-govRed-700 border-govRed-200'
            : val === 'BALANCED'
            ? 'bg-govEmerald-50 text-govEmerald-700 border-govEmerald-200'
            : 'bg-govAmber-50 text-govAmber-700 border-govAmber-200'
        }`}>
          {val}
        </span>
      )
    }
  ];

  if (loading && gapRecords.length === 0) {
    return <LoadingState message="Loading skill gap analysis records from backend API..." />;
  }

  if (error && gapRecords.length === 0) {
    return <ErrorState message={error} onRetry={fetchGaps} />;
  }

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Net Gap"
          value={totalNetGap}
          subtitle="Net candidate deficit"
          badgeText="Shortage Bias"
          badgeVariant="danger"
          icon={Scale}
        />
        <StatCard
          title="Shortage Occupations"
          value={`${shortageCount} Roles`}
          subtitle="Deficit > 10%"
          badgeText={`${((shortageCount / totalCount) * 100).toFixed(0)}% of Trades`}
          badgeVariant="danger"
          icon={AlertTriangle}
        />
        <StatCard
          title="Balanced Occupations"
          value={`${balancedCount} Roles`}
          subtitle="Within ±10% equilibrium"
          badgeText={`${((balancedCount / totalCount) * 100).toFixed(0)}% of Trades`}
          badgeVariant="success"
          icon={CheckCircle2}
        />
        <StatCard
          title="Oversupply Occupations"
          value={`${oversupplyCount} Roles`}
          subtitle="Surplus < -10%"
          badgeText={`${((oversupplyCount / totalCount) * 100).toFixed(0)}% of Trades`}
          badgeVariant="warning"
          icon={Scale}
        />
      </div>

      {/* Equilibrium Distribution Bar */}
      <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-govNavy-900">National Workforce Equilibrium Distribution</span>
          <span className="text-govSlate-500">{gapRecords.length} District-Trade Cohorts Evaluated</span>
        </div>
        <div className="w-full h-4 rounded-full bg-govSlate-100 flex overflow-hidden">
          <div
            className="bg-govRed-500 h-full transition-all"
            style={{ width: `${(shortageCount / totalCount) * 100}%` }}
            title={`Shortage: ${shortageCount}`}
          />
          <div
            className="bg-govEmerald-500 h-full transition-all"
            style={{ width: `${(balancedCount / totalCount) * 100}%` }}
            title={`Balanced: ${balancedCount}`}
          />
          <div
            className="bg-govAmber-500 h-full transition-all"
            style={{ width: `${(oversupplyCount / totalCount) * 100}%` }}
            title={`Oversupply: ${oversupplyCount}`}
          />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-govSlate-600 font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-govRed-500"></span>
            <span>Shortage ({shortageCount} roles)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-govEmerald-500"></span>
            <span>Balanced ({balancedCount} roles)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-govAmber-500"></span>
            <span>Oversupply ({oversupplyCount} roles)</span>
          </div>
        </div>
      </div>

      {/* Controls & Filter Pills */}
      <div className="bg-white rounded-xl border border-govSlate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-govNavy-900 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-govCyan-600" />
            Status Filter:
          </span>
          {['ALL', 'SHORTAGE', 'BALANCED', 'OVERSUPPLY'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-govNavy-900 text-white shadow-sm'
                  : 'bg-govSlate-100 text-govSlate-600 hover:bg-govSlate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-bold text-govNavy-900">Sector:</span>
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-govSlate-300 bg-govSlate-50 text-govNavy-900 font-semibold focus:outline-none focus:border-govCyan-500 text-xs"
          >
            <option value="ALL">All Sectors</option>
            <option value="IT-ITeS">IT-ITeS</option>
            <option value="Automotive">Automotive</option>
            <option value="Electronics & Hardware">Electronics & Hardware</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Construction">Construction</option>
          </select>
        </div>
      </div>

      {/* Master Skill Gap DataTable */}
      <DataTable
        columns={columns}
        data={filteredRecords}
        searchPlaceholder="Filter by trade, state, district..."
        searchKeys={['trade', 'state', 'district', 'sector']}
        pageSize={10}
        emptyMessage="No skill gap records match the selected criteria."
      />
    </div>
  );
}
