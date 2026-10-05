import React, { useState } from 'react';
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
import { GraduationCap, Award, Briefcase } from 'lucide-react';

const DEFAULT_SUPPLY_DATA = [
  { trade: 'Junior Software Dev', enrolled: 420, certified: 360, placed: 310, placementRate: 86 },
  { trade: 'Web Developer', enrolled: 380, certified: 310, placed: 260, placementRate: 84 },
  { trade: 'Auto Service Tech', enrolled: 490, certified: 410, placed: 350, placementRate: 85 },
  { trade: 'CNC Operator', enrolled: 440, certified: 380, placed: 330, placementRate: 87 },
  { trade: 'Solar Technician', enrolled: 280, certified: 230, placed: 190, placementRate: 83 },
  { trade: 'General Duty Asst', enrolled: 320, certified: 280, placed: 240, placementRate: 86 },
];

export default function SupplyChart({ data = DEFAULT_SUPPLY_DATA }) {
  const chartData = data && data.length > 0 ? data : DEFAULT_SUPPLY_DATA;

  return (
    <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-govSlate-100 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-govNavy-900 tracking-tight">
              Workforce Supply & Training Pipeline Outcomes
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-govEmerald-50 text-govEmerald-700 border border-govEmerald-200">
              NSDC & ITI Certified
            </span>
          </div>
          <p className="text-xs text-govSlate-500 mt-0.5">
            Candidates Enrolled vs Certified Cohorts vs Placed Candidates across major qualification trades
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-govNavy-700"></span>
            <span className="text-govSlate-600">Enrolled</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-govCyan-500"></span>
            <span className="text-govSlate-600">Certified</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-govEmerald-500"></span>
            <span className="text-govSlate-600">Placed</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="trade"
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              tick={{ fill: '#64748B', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              tick={{ fill: '#64748B', fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-govNavy-900 text-white p-3 rounded-lg shadow-xl border border-govNavy-700 text-xs">
                      <div className="font-bold border-b border-govNavy-700 pb-1 mb-1.5 text-govCyan-400">
                        {label}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-govSlate-300">Enrolled:</span>
                          <span className="font-mono font-bold text-white">{payload[0]?.value}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-govSlate-300">Certified:</span>
                          <span className="font-mono font-bold text-govCyan-400">{payload[1]?.value}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-govSlate-300">Placed:</span>
                          <span className="font-mono font-bold text-govEmerald-400">{payload[2]?.value}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="enrolled" name="Enrolled" fill="#1E3E62" radius={[4, 4, 0, 0]} maxBarSize={30} />
            <Bar dataKey="certified" name="Certified" fill="#0EA5E9" radius={[4, 4, 0, 0]} maxBarSize={30} />
            <Bar dataKey="placed" name="Placed" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
