import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Scale,
  MapPin,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Award
} from 'lucide-react';

export default function InsightCards({
  shortages = [],
  oversupplies = [],
  gapRecords = [],
  forecastSummaries = [],
  alerts = []
}) {
  // 1. Highest Current Skill Shortage
  const topShortage = shortages.length > 0
    ? [...shortages].sort((a, b) => (b.gap || 0) - (a.gap || 0))[0]
    : (gapRecords.filter(r => r.gap_status === 'SHORTAGE').sort((a, b) => (b.gap || 0) - (a.gap || 0))[0] || null);

  // 2. Largest Oversupplied Trade
  const topOversupply = oversupplies.length > 0
    ? [...oversupplies].sort((a, b) => (a.gap || 0) - (b.gap || 0))[0]
    : (gapRecords.filter(r => r.gap_status === 'OVERSUPPLY').sort((a, b) => (a.gap || 0) - (b.gap || 0))[0] || null);

  // 3. State with Highest Labour Demand
  const stateDemandMap = {};
  gapRecords.forEach(r => {
    if (r.state) {
      if (!stateDemandMap[r.state]) {
        stateDemandMap[r.state] = { demand: 0, districts: new Set() };
      }
      stateDemandMap[r.state].demand += (r.demand || 0);
      if (r.district) stateDemandMap[r.state].districts.add(r.district);
    }
  });

  const sortedStates = Object.entries(stateDemandMap).sort((a, b) => b[1].demand - a[1].demand);
  const leadingState = sortedStates.length > 0
    ? { state: sortedStates[0][0], demand: sortedStates[0][1].demand, districtsCount: sortedStates[0][1].districts.size }
    : null;

  // 4. Trade with Highest Forecast Growth
  let highestGrowthTrade = null;
  if (forecastSummaries.length > 0) {
    const tradeGrowthMap = {};
    forecastSummaries.forEach(r => {
      const cur = r.current_demand || 0;
      const f12 = r.predicted_demand_12m || 0;
      if (cur > 0 && f12 > cur) {
        const growthPct = ((f12 - cur) / cur) * 100;
        if (!tradeGrowthMap[r.trade] || growthPct > tradeGrowthMap[r.trade].growthPct) {
          tradeGrowthMap[r.trade] = {
            trade: r.trade,
            growthPct,
            cur,
            f12,
            district: r.district,
            state: r.state
          };
        }
      }
    });
    const sortedGrowths = Object.values(tradeGrowthMap).sort((a, b) => b.growthPct - a.growthPct);
    if (sortedGrowths.length > 0) {
      highestGrowthTrade = sortedGrowths[0];
    }
  }

  // 5. Highest-Risk Early Warning Area
  const highRiskAlert = alerts.length > 0
    ? [...alerts].filter(a => a.warning_level === 'HIGH').sort((a, b) => (b.future_gap || 0) - (a.future_gap || 0))[0]
    : null;

  return (
    <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-govSlate-100">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-govCyan-600" />
          <h3 className="text-sm font-bold text-govNavy-900 tracking-tight">
            Automated Factual Intelligence Insights
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 text-xs">
        {/* Card 1: Highest Shortage */}
        <div className="p-3.5 rounded-lg bg-govRed-50/50 border border-govRed-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-govRed-700 font-bold uppercase text-[10px] tracking-wider mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Highest Skill Shortage</span>
            </div>
            {topShortage ? (
              <>
                <div className="font-bold text-govNavy-900 text-sm leading-tight mt-1 line-clamp-1" title={topShortage.trade}>
                  {topShortage.trade}
                </div>
                <div className="text-[11px] text-govSlate-600 mt-1">
                  {topShortage.district}, {topShortage.state}
                </div>
              </>
            ) : (
              <div className="text-govSlate-400 mt-1">No shortage recorded</div>
            )}
          </div>
          {topShortage && (
            <div className="mt-3 pt-2 border-t border-govRed-100/80 flex items-center justify-between">
              <span className="text-[10px] text-govSlate-500">Candidate Deficit:</span>
              <span className="font-mono font-bold text-govRed-700">+{topShortage.gap?.toLocaleString()} ({topShortage.gap_percentage}%)</span>
            </div>
          )}
        </div>

        {/* Card 2: Largest Oversupply */}
        <div className="p-3.5 rounded-lg bg-govAmber-50/50 border border-govAmber-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-govAmber-700 font-bold uppercase text-[10px] tracking-wider mb-1">
              <Scale className="w-3.5 h-3.5" />
              <span>Largest Oversupplied Trade</span>
            </div>
            {topOversupply ? (
              <>
                <div className="font-bold text-govNavy-900 text-sm leading-tight mt-1 line-clamp-1" title={topOversupply.trade}>
                  {topOversupply.trade}
                </div>
                <div className="text-[11px] text-govSlate-600 mt-1">
                  {topOversupply.district}, {topOversupply.state}
                </div>
              </>
            ) : (
              <div className="text-govSlate-400 mt-1">No surplus recorded</div>
            )}
          </div>
          {topOversupply && (
            <div className="mt-3 pt-2 border-t border-govAmber-100/80 flex items-center justify-between">
              <span className="text-[10px] text-govSlate-500">Candidate Surplus:</span>
              <span className="font-mono font-bold text-govAmber-700">{Math.abs(topOversupply.gap)?.toLocaleString()} candidates</span>
            </div>
          )}
        </div>

        {/* Card 3: Leading Demand State */}
        <div className="p-3.5 rounded-lg bg-govNavy-50/60 border border-govNavy-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-govNavy-800 font-bold uppercase text-[10px] tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5 text-govCyan-600" />
              <span>Highest Aggregate Demand</span>
            </div>
            {leadingState ? (
              <>
                <div className="font-bold text-govNavy-900 text-sm leading-tight mt-1">
                  {leadingState.state} State
                </div>
                <div className="text-[11px] text-govSlate-600 mt-1">
                  Across {leadingState.districtsCount} mapped industrial districts
                </div>
              </>
            ) : (
              <div className="text-govSlate-400 mt-1">No state data</div>
            )}
          </div>
          {leadingState && (
            <div className="mt-3 pt-2 border-t border-govNavy-100/80 flex items-center justify-between">
              <span className="text-[10px] text-govSlate-500">Gross Vacancies:</span>
              <span className="font-mono font-bold text-govNavy-900">{leadingState.demand.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Card 4: Highest Forecast Growth */}
        <div className="p-3.5 rounded-lg bg-govEmerald-50/50 border border-govEmerald-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-govEmerald-700 font-bold uppercase text-[10px] tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Highest 12M Demand Growth</span>
            </div>
            {highestGrowthTrade ? (
              <>
                <div className="font-bold text-govNavy-900 text-sm leading-tight mt-1 line-clamp-1" title={highestGrowthTrade.trade}>
                  {highestGrowthTrade.trade}
                </div>
                <div className="text-[11px] text-govSlate-600 mt-1">
                  {highestGrowthTrade.district}, {highestGrowthTrade.state}
                </div>
              </>
            ) : (
              <div className="text-govSlate-400 mt-1">No forecast projection</div>
            )}
          </div>
          {highestGrowthTrade && (
            <div className="mt-3 pt-2 border-t border-govEmerald-100/80 flex items-center justify-between">
              <span className="text-[10px] text-govSlate-500">12M Expansion:</span>
              <span className="font-mono font-bold text-govEmerald-700">+{highestGrowthTrade.growthPct.toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Card 5: Highest-Risk Early Warning */}
        <div className="p-3.5 rounded-lg bg-govRed-50/50 border border-govRed-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-govRed-700 font-bold uppercase text-[10px] tracking-wider mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Priority Early Warning Area</span>
            </div>
            {highRiskAlert ? (
              <>
                <div className="font-bold text-govNavy-900 text-sm leading-tight mt-1 line-clamp-1" title={highRiskAlert.trade}>
                  {highRiskAlert.district}
                </div>
                <div className="text-[11px] text-govSlate-600 mt-1 truncate" title={highRiskAlert.trade}>
                  {highRiskAlert.state} • {highRiskAlert.trade}
                </div>
              </>
            ) : (
              <div className="text-govSlate-400 mt-1">No critical alerts</div>
            )}
          </div>
          {highRiskAlert && (
            <div className="mt-3 pt-2 border-t border-govRed-100/80 flex items-center justify-between">
              <span className="text-[10px] text-govSlate-500">Projected Deficit:</span>
              <span className="font-mono font-bold text-govRed-700">+{highRiskAlert.future_gap?.toLocaleString()} (+{highRiskAlert.forecast_horizon}M)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
