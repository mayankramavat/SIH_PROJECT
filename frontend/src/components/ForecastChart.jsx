import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Cpu, Sparkles } from 'lucide-react';

const FORECAST_SERIES = [
  { month: 'Oct 23', historical: 720, forecast: null, upper: null, lower: null },
  { month: 'Nov 23', historical: 750, forecast: null, upper: null, lower: null },
  { month: 'Dec 23', historical: 780, forecast: null, upper: null, lower: null },
  { month: 'Jan 24', historical: 810, forecast: null, upper: null, lower: null },
  { month: 'Feb 24', historical: 830, forecast: null, upper: null, lower: null },
  { month: 'Mar 24 (Base)', historical: 850, forecast: 850, upper: 850, lower: 850 },
  { month: 'Jun 24 (+3M)', historical: null, forecast: 899, upper: 940, lower: 860 },
  { month: 'Sep 24 (+6M)', historical: null, forecast: 934, upper: 990, lower: 885 },
  { month: 'Mar 25 (+12M)', historical: null, forecast: 1054, upper: 1140, lower: 970 },
];

export default function ForecastChart({ series = FORECAST_SERIES, activeHorizon = 6, onHorizonChange }) {
  const [selectedHorizon, setSelectedHorizon] = useState(activeHorizon);

  const handleSelect = (h) => {
    setSelectedHorizon(h);
    if (onHorizonChange) onHorizonChange(h);
  };

  return (
    <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm">
      {/* Title & Horizon Selector Cards */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-govNavy-900 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-govCyan-600" />
              AI Demand Forecasting & Projection Cone
            </h3>
            <span className="text-[10px] bg-govCyan-50 text-govCyan-700 font-bold px-2 py-0.5 rounded border border-govCyan-200 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              RF Ensemble (R² 0.84)
            </span>
          </div>
        </div>

        {/* 3 Horizon Toggle Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { horizon: 3, label: '3 Months', pred: '899', delta: '+5.8%' },
            { horizon: 6, label: '6 Months', pred: '934', delta: '+9.9%' },
            { horizon: 12, label: '12 Months', pred: '1,054', delta: '+24.0%' },
          ].map((h) => {
            const isSelected = selectedHorizon === h.horizon;
            return (
              <button
                key={h.horizon}
                onClick={() => handleSelect(h.horizon)}
                className={`p-2 rounded-lg text-left border transition-all ${
                  isSelected
                    ? 'border-govCyan-500 bg-govCyan-50/50 shadow-sm ring-1 ring-govCyan-500'
                    : 'border-govSlate-200 hover:border-govSlate-300 bg-govSlate-50'
                }`}
              >
                <div className="text-[10px] font-bold uppercase text-govSlate-500">
                  {h.label}
                </div>
                <div className="text-xs font-bold text-govNavy-900 tabular-nums">
                  {h.pred}
                </div>
                <div className="text-[10px] font-semibold text-govEmerald-600">
                  {h.delta}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tick={{ fill: '#64748B', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tick={{ fill: '#64748B', fontSize: 11 }}
              domain={['dataMin - 100', 'dataMax + 100']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0B192C',
                borderColor: '#1E3E62',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '12px',
              }}
            />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />

            {/* Historical Demand Solid Line */}
            <Line
              type="monotone"
              dataKey="historical"
              name="Historical Demand"
              stroke="#0B192C"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#0B192C' }}
              connectNulls={false}
            />

            {/* Forecast Trajectory Dashed Line */}
            <Line
              type="monotone"
              dataKey="forecast"
              name="ML Demand Forecast"
              stroke="#0EA5E9"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#0EA5E9' }}
              connectNulls={true}
            />

            {/* Confidence Upper Bound */}
            <Area
              type="monotone"
              dataKey="upper"
              name="Confidence Range (95%)"
              stroke="#CBD5E1"
              strokeDasharray="2 2"
              fill="#E0F2FE"
              fillOpacity={0.4}
              connectNulls={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
