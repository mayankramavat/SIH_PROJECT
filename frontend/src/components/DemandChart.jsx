import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const SAMPLE_TREND = [
  { month: 'Apr 23', demand: 14200, supply: 10800, gap: 3400 },
  { month: 'May 23', demand: 14500, supply: 11000, gap: 3500 },
  { month: 'Jun 23', demand: 14800, supply: 11200, gap: 3600 },
  { month: 'Jul 23', demand: 15300, supply: 11400, gap: 3900 },
  { month: 'Aug 23', demand: 15900, supply: 11500, gap: 4400 },
  { month: 'Sep 23', demand: 16400, supply: 11600, gap: 4800 },
  { month: 'Oct 23', demand: 16800, supply: 11700, gap: 5100 },
  { month: 'Nov 23', demand: 17100, supply: 11750, gap: 5350 },
  { month: 'Dec 23', demand: 17400, supply: 11800, gap: 5600 },
  { month: 'Jan 24', demand: 17800, supply: 11820, gap: 5980 },
  { month: 'Feb 24', demand: 18100, supply: 11840, gap: 6260 },
  { month: 'Mar 24', demand: 18375, supply: 11850, gap: 6525 },
];

export default function DemandChart({ data = SAMPLE_TREND }) {
  const [range, setRange] = useState('12M');

  const filteredData = range === '6M' ? data.slice(-6) : data;

  return (
    <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm">
      {/* Header with Title and Range Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-govNavy-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-govCyan-600" />
            Labour Demand vs Skilled Supply Trajectory
          </h3>
          <p className="text-xs text-govSlate-500">
            Monthly registered vacancies vs certified training graduates
          </p>
        </div>

        {/* View Range Tabs */}
        <div className="flex items-center space-x-1 bg-govSlate-100 p-1 rounded-lg text-xs font-semibold self-start sm:self-auto">
          {['6M', '12M', 'All'].map((tab) => (
            <button
              key={tab}
              onClick={() => setRange(tab)}
              className={`px-2.5 py-1 rounded-md transition ${
                range === tab
                  ? 'bg-white text-govNavy-900 shadow-sm'
                  : 'text-govSlate-600 hover:text-govNavy-900'
              }`}
            >
              {tab === 'All' ? 'All Time' : `${tab}`}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0B192C" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0B192C" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
              </linearGradient>
            </defs>

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
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0B192C',
                borderColor: '#1E3E62',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '12px',
              }}
              formatter={(val, name) => [val.toLocaleString(), name === 'demand' ? 'Demand' : 'Supply']}
              labelStyle={{ fontWeight: 'bold', color: '#0EA5E9' }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
            />
            <Area
              type="monotone"
              dataKey="demand"
              name="Labour Demand"
              stroke="#0B192C"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#demandGrad)"
            />
            <Area
              type="monotone"
              dataKey="supply"
              name="Skilled Supply"
              stroke="#0EA5E9"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#supplyGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
