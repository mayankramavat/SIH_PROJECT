import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import {
  AlertTriangle,
  Clock,
  ShieldAlert,
  CheckCircle,
  FileText,
  ArrowRight,
  Filter,
  Search,
  AlertCircle
} from 'lucide-react';
import { getAlerts } from '../services/api';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAlertsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await getAlerts();
      if (Array.isArray(records)) {
        setAlerts(records);
      }
    } catch (err) {
      console.error('Failed to load early warning alerts:', err);
      setError('Unable to connect to the analytics server to retrieve early warning alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
  }, []);

  // Compute severity counts from backend data
  const highCount = alerts.filter((a) => a.warning_level === 'HIGH').length;
  const mediumCount = alerts.filter((a) => a.warning_level === 'MEDIUM').length;
  const lowCount = alerts.filter((a) => a.warning_level === 'LOW').length;

  const filteredAlerts = alerts.filter((item) => {
    const matchesSeverity = severityFilter === 'ALL' || item.warning_level === severityFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (item.trade && item.trade.toLowerCase().includes(term)) ||
      (item.district && item.district.toLowerCase().includes(term)) ||
      (item.state && item.state.toLowerCase().includes(term)) ||
      (item.sector && item.sector.toLowerCase().includes(term));

    return matchesSeverity && matchesSearch;
  });

  const getAlertReason = (item) => {
    const gapPct = Math.abs(item.future_gap_percentage || 0);
    if (item.warning_level === 'HIGH') {
      return `Critical projected shortage (${gapPct}% deficit). Urgent seat expansion in ITIs & PMKVY.`;
    }
    if (item.warning_level === 'MEDIUM') {
      return `Moderate future imbalance (${gapPct}% variance). Recommend intake capacity adjustment.`;
    }
    if (item.warning_level === 'LOW') {
      return `Emerging pipeline trend (${gapPct}%). Monitor placement absorption in next quarter.`;
    }
    return 'Stable equilibrium trajectory. Routine monitoring.';
  };

  const columns = [
    {
      label: 'Severity',
      key: 'warning_level',
      render: (val) => (
        <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
          val === 'HIGH'
            ? 'bg-govRed-50 text-govRed-700 border-govRed-200'
            : val === 'MEDIUM'
            ? 'bg-govAmber-50 text-govAmber-700 border-govAmber-200'
            : 'bg-govSlate-100 text-govSlate-700 border-govSlate-200'
        }`}>
          <span>{val}</span>
        </span>
      )
    },
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
      render: (val) => <span className="text-govSlate-600">{val || 'Vocational'}</span>
    },
    {
      label: 'Trade',
      key: 'trade',
      render: (val) => <span className="font-semibold text-govNavy-900">{val}</span>
    },
    {
      label: 'Current Gap',
      key: 'future_gap',
      render: (val, row) => (
        <span className="font-mono text-govSlate-700">
          {(row.predicted_demand - row.estimated_supply) > 0
            ? `+${(row.predicted_demand - row.estimated_supply).toLocaleString()}`
            : (row.predicted_demand - row.estimated_supply).toLocaleString()}
        </span>
      )
    },
    {
      label: 'Forecast Gap',
      key: 'future_gap',
      render: (val) => (
        <span className={`font-mono font-bold ${val > 0 ? 'text-govRed-600' : 'text-govEmerald-600'}`}>
          {val > 0 ? `+${val.toLocaleString()}` : val.toLocaleString()}
        </span>
      )
    },
    {
      label: 'Forecast Horizon',
      key: 'forecast_horizon',
      render: (val) => (
        <span className="font-semibold text-govCyan-700 bg-govCyan-50 px-2 py-0.5 rounded">
          +{val || 6} Months
        </span>
      )
    },
    {
      label: 'Reason & Recommended Action',
      key: 'warning_level',
      render: (val, row) => (
        <span className="text-govSlate-700 text-[11px] leading-tight">
          {getAlertReason(row)}
        </span>
      )
    }
  ];

  if (loading && alerts.length === 0) {
    return <LoadingState message="Loading early warning alerts from predictive forecasting engine..." />;
  }

  if (error && alerts.length === 0) {
    return <ErrorState message={error} onRetry={fetchAlertsData} />;
  }

  return (
    <div className="space-y-6">
      {/* 3 Summary Severity Cards (Direct from Backend API) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="HIGH RISK ALERTS"
          value={`${highCount} Signals`}
          subtitle="Critical future deficit (>50%)"
          badgeText="Immediate Action"
          badgeVariant="danger"
          icon={ShieldAlert}
        />
        <StatCard
          title="MEDIUM RISK ALERTS"
          value={`${mediumCount} Signals`}
          subtitle="Moderate deficit (20% to 50%)"
          badgeText="Capacity Review"
          badgeVariant="warning"
          icon={AlertTriangle}
        />
        <StatCard
          title="LOW RISK ALERTS"
          value={`${lowCount} Signals`}
          subtitle="Emerging deficit (10% to 20%)"
          badgeText="Pipeline Watch"
          badgeVariant="default"
          icon={Clock}
        />
      </div>

      {/* Filter and Severity Selector */}
      <div className="bg-white rounded-xl border border-govSlate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-govNavy-900 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-govCyan-600" />
            Severity Filter:
          </span>
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                severityFilter === sev
                  ? 'bg-govNavy-900 text-white shadow-sm'
                  : 'bg-govSlate-100 text-govSlate-600 hover:bg-govSlate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-govSlate-500 font-medium">
          Total Generated Signals: <span className="font-bold text-govNavy-900">{alerts.length}</span>
        </div>
      </div>

      {/* Proactive Alert Registry DataTable */}
      <DataTable
        columns={columns}
        data={filteredAlerts}
        searchPlaceholder="Filter alerts by trade, district, state..."
        searchKeys={['trade', 'district', 'state', 'sector']}
        pageSize={10}
        emptyMessage="No early warning signals found matching criteria."
      />
    </div>
  );
}
