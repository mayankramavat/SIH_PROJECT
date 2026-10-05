import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { AlertOctagon } from 'lucide-react';

const SAMPLE_GAPS = [
  { trade: 'Jr. Software Dev', demand: 850, supply: 320, gap: 530, status: 'SHORTAGE' },
  { trade: 'Web Developer', demand: 1280, supply: 540, gap: 740, status: 'SHORTAGE' },
  { trade: 'Solar Technician', demand: 260, supply: 190, gap: 70, status: 'SHORTAGE' },
  { trade: 'Healthcare Assistant', demand: 310, supply: 250, gap: 60, status: 'SHORTAGE' },
  { trade: 'Automotive Tech', demand: 420, supply: 390, gap: 30, status: 'BALANCED' },
  { trade: 'Data Entry Operator', demand: 320, supply: 360, gap: -40, status: 'OVERSUPPLY' },
];

export default function GapChart({ data = SAMPLE_GAPS }) {
  return (
    <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-govNavy-900 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-govRed-500" />
            Top Skill Gaps & Deficit Comparisons
          </h3>
          <p className="text-xs text-govSlate-500">
            Horizontal comparative review of industry requisitions vs available certified supply
          </p>
        </div>
        <span className="text-[11px] font-semibold bg-govRed-50 text-govRed-800 border border-govRed-200 px-2 py-0.5 rounded">
          Shortage Focus
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="trade"
              tick={{ fill: '#0B192C', fontSize: 11, fontWeight: 500 }}
              width={110}
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
            />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
            <Bar dataKey="demand" name="Industry Demand" fill="#0B192C" radius={[0, 4, 4, 0]} />
            <Bar dataKey="supply" name="Skilled Supply" fill="#0EA5E9" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
