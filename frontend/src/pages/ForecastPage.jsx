import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  BrainCircuit, 
  HelpCircle, 
  ChevronRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import { getForecastData } from '../services/dataService';

/**
 * Forecast Page Component
 * 
 * Layout:
 * - Row 1: Horizontal row: Dropdown to pick sector or skill
 * - Row 2: Full-width line chart with past data (solid) and dotted forecast for the next 12 months
 * - Row 3: "AI Insight" box with 2-3 concise lines describing trend, drivers, and policy recommendations
 */
export default function ForecastPage() {
  const [selectedEntityId, setSelectedEntityId] = useState('sec-it');
  const [forecastOptions, setForecastOptions] = useState([]);
  const [forecastSeries, setForecastSeries] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await getForecastData(selectedEntityId);
        if (isMounted) {
          if (data.options) setForecastOptions(data.options);
          if (data.selectedSeries) setForecastSeries(data.selectedSeries);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load forecast data:', err);
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [selectedEntityId]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">AI Demand Forecasting (Next 12 Months)</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Predictive time-series modeling projecting future labour vacancy volumes across sectors and skills
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium flex items-center">
            <BrainCircuit className="w-3.5 h-3.5 mr-1" />
            Ensemble AI Architecture
          </span>
        </div>
      </div>

      {/* ========================================================
          ROW 1: Horizontal Row - Dropdown to Pick Sector or Skill
         ======================================================== */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <label htmlFor="forecast-select" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Select Sector or Skill for Demand Projection
            </label>
            <select
              id="forecast-select"
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="w-full max-w-xl rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <optgroup label="Sectors">
                {forecastOptions
                  .filter((opt) => opt.type === 'sector')
                  .map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Emerging Skill Competencies">
                {forecastOptions
                  .filter((opt) => opt.type === 'skill')
                  .map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Model Meta Badge */}
          {forecastSeries && (
            <div className="flex flex-wrap sm:flex-col sm:items-end text-xs text-gray-500 gap-2 sm:gap-1">
              <span className="font-semibold text-gray-800">
                Model: <span className="font-normal text-blue-600">{forecastSeries.model}</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                {forecastSeries.growthRate}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          ROW 2: Full-Width Line Chart (Solid Past + Dotted Forecast)
         ======================================================== */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-2 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {forecastSeries?.title || 'Demand Trajectory & Forecast'}
            </h3>
            <p className="text-xs text-gray-500">
              Solid Line: Actual past 12 months • Dotted Line: AI forecast for the next 12 months (Apr 2024 - Mar 2025)
            </p>
          </div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-4 text-xs">
            <span className="flex items-center">
              <span className="w-4 h-0.5 bg-blue-600 mr-1.5"></span>
              Past 12M (Actual)
            </span>
            <span className="flex items-center">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-blue-600 mr-1.5"></span>
              Next 12M (AI Forecast)
            </span>
          </div>
        </div>

        {loading || !forecastSeries ? (
          <div className="h-80 flex justify-center items-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastSeries.timeline} margin={{ top: 15, right: 20, left: 10, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val, name) => [
                    val ? val.toLocaleString() : 'N/A', 
                    name === 'historical' ? 'Historical Demand (Actual)' : 'AI Forecasted Demand'
                  ]}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                
                {/* Vertical Cutoff Separating History from Forecast */}
                <ReferenceLine 
                  x="Mar 24" 
                  stroke="#94a3b8" 
                  strokeDasharray="3 3" 
                  label={{ value: 'Forecast Horizon Start', position: 'top', fill: '#64748b', fontSize: 10 }} 
                />

                {/* Solid Line: Historical Data */}
                <Line
                  type="monotone"
                  dataKey="historical"
                  name="Historical Actuals (12M)"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2563eb' }}
                  activeDot={{ r: 5 }}
                />

                {/* Dotted Line: Next 12 Months Forecast */}
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="AI Projected Forecast (Next 12M)"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: '#60a5fa' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ========================================================
          ROW 3: "AI Insight" Box with 2-3 Placeholder Lines
         ======================================================== */}
      <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-xl border border-blue-200 p-5 shadow-xs">
        <div className="flex items-center space-x-2 text-blue-900 mb-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold">AI Intelligence & Policy Insights</h3>
          <span className="text-xs bg-white text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-semibold">
            Automated Synthesis
          </span>
        </div>

        {forecastSeries?.aiInsights && (
          <ul className="space-y-2 text-sm text-gray-800">
            {forecastSeries.aiInsights.map((insight, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <ChevronRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
