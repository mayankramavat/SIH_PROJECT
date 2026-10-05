import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  Lightbulb,
  ShieldAlert,
  CheckCircle2,
  Filter,
  Sparkles
} from 'lucide-react';

export default function AlertCard({ alerts = [], onNavigateToAlerts }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL'); // 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'

  const sampleAlerts = alerts.length > 0 ? alerts : [
    {
      warning_level: 'HIGH',
      trade: 'Junior Software Developer',
      district: 'Pune',
      state: 'Maharashtra',
      forecast_horizon: 3,
      future_gap: 577,
      status: 'Action Required: Expand ITI Cohorts'
    },
    {
      warning_level: 'MEDIUM',
      trade: 'Solar Panel Installation Tech',
      district: 'Nagpur',
      state: 'Maharashtra',
      forecast_horizon: 6,
      future_gap: 120,
      status: 'Targeted PMKVY Training Recommended'
    },
    {
      warning_level: 'LOW',
      trade: 'General Duty Healthcare Assistant',
      district: 'Nashik',
      state: 'Maharashtra',
      forecast_horizon: 12,
      future_gap: 57,
      status: 'Monitor Healthcare Pipeline'
    },
  ];

  const filtered = filterSeverity === 'ALL'
    ? sampleAlerts
    : sampleAlerts.filter(a => a.warning_level === filterSeverity);

  return (
    <div className="space-y-4 text-xs">
      {/* Early Warning Signals Panel */}
      <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-govSlate-100">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-govRed-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-govRed-500"></span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-govNavy-900 leading-none">
                Early Warning Shortages
              </h3>
              <span className="text-[11px] text-govSlate-500 font-medium">Predictive AI Signals</span>
            </div>
          </div>
          <button
            onClick={onNavigateToAlerts}
            className="text-xs text-govCyan-600 hover:text-govNavy-900 font-semibold flex items-center space-x-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center space-x-1 mb-3 bg-govSlate-100 p-1 rounded-lg">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'HIGH', label: 'High' },
            { id: 'MEDIUM', label: 'Medium' },
            { id: 'LOW', label: 'Low' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterSeverity(tab.id)}
              className={`flex-1 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
                filterSeverity === tab.id
                  ? 'bg-white text-govNavy-900 shadow-2xs'
                  : 'text-govSlate-600 hover:text-govNavy-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Alert Cards List */}
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {filtered.slice(0, 4).map((a, idx) => {
            const isHigh = a.warning_level === 'HIGH';
            const isMed = a.warning_level === 'MEDIUM';

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all text-xs ${
                  isHigh
                    ? 'border-l-4 border-l-govRed-500 border-govSlate-200 bg-govRed-50/20'
                    : isMed
                    ? 'border-l-4 border-l-govAmber-500 border-govSlate-200 bg-govAmber-50/20'
                    : 'border-l-4 border-l-govCyan-500 border-govSlate-200 bg-govSlate-50/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isHigh
                      ? 'bg-govRed-100 text-govRed-800'
                      : isMed
                      ? 'bg-govAmber-100 text-govAmber-800'
                      : 'bg-govCyan-100 text-govCyan-800'
                  }`}>
                    {a.warning_level} Risk
                  </span>
                  <div className="flex items-center space-x-1 text-[10px] text-govSlate-500 font-semibold">
                    <Clock className="w-3 h-3 text-govSlate-400" />
                    <span>+{a.forecast_horizon || 3}M Window</span>
                  </div>
                </div>

                <div className="font-bold text-govNavy-900 mt-1.5 truncate">
                  {a.trade}
                </div>
                <div className="text-[11px] text-govSlate-500 mt-0.5 flex items-center justify-between">
                  <span>{a.district}, {a.state}</span>
                  <span className="font-bold text-govRed-600 tabular-nums">+{a.future_gap} deficit</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Labour Market Insights Briefing */}
      <div className="bg-govNavy-900 text-white rounded-xl p-5 border border-govNavy-800 shadow-xs">
        <div className="flex items-center space-x-2 text-govCyan-400 mb-3 pb-2 border-b border-govNavy-800">
          <Lightbulb className="w-4 h-4" />
          <h4 className="text-xs font-bold uppercase tracking-wider">
            Planning Officer Briefing
          </h4>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-govCyan-400"></span>
              Demand Acceleration (+12.4%)
            </div>
            <div className="text-[11px] text-govSlate-300 mt-0.5 pl-3">
              Software development and green energy installation vacancies show rapid quarterly uptick.
            </div>
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-govAmber-400"></span>
              Supply Pipeline Latency
            </div>
            <div className="text-[11px] text-govSlate-300 mt-0.5 pl-3">
              Certified technical output in western corridors lagging behind industry requisitions by 34%.
            </div>
          </div>
          <div className="pt-2 border-t border-govNavy-800/80">
            <div className="font-bold text-govEmerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-govEmerald-400" />
              Target Policy Recommendation
            </div>
            <div className="text-[11px] text-govSlate-300 mt-0.5 pl-5">
              Prioritize short-cycle bridge certifications under PMKVY 4.0 to compress onboarding cycles.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
