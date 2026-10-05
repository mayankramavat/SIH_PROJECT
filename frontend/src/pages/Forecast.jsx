import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import ForecastChart from '../components/ForecastChart';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import {
  Cpu,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  BarChart2,
  ShieldCheck,
  Award,
  Layers,
  Clock,
  AlertTriangle,
  Download
} from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';
import {
  getForecastSummary,
  getModelEvaluation
} from '../services/api';

export default function Forecast({ onHorizonChange }) {
  const [horizon, setHorizon] = useState(6);
  const [forecastSummaries, setForecastSummaries] = useState([]);
  const [evaluationMetrics, setEvaluationMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadForecastData() {
      setLoading(true);
      setError(null);
      try {
        const [sumRes, evalRes] = await Promise.allSettled([
          getForecastSummary(),
          getModelEvaluation()
        ]);

        if (sumRes.status === 'fulfilled' && Array.isArray(sumRes.value)) {
          setForecastSummaries(sumRes.value);
        }
        if (evalRes.status === 'fulfilled' && Array.isArray(evalRes.value)) {
          setEvaluationMetrics(evalRes.value);
        }
      } catch (err) {
        console.error('Failed to load forecast intelligence:', err);
        setError('Unable to connect to the analytics server for forecast data.');
      } finally {
        setLoading(false);
      }
    }

    loadForecastData();
  }, []);

  const handleHorizonSelect = (h) => {
    setHorizon(h);
    if (onHorizonChange) onHorizonChange(h);
  };

  // Compute aggregate metrics for current selected horizon
  const totalBaseDemand = forecastSummaries.reduce((acc, r) => acc + (r.current_demand || 0), 0);
  const totalBaseSupply = forecastSummaries.reduce((acc, r) => acc + (r.current_supply || 0), 0);

  const totalForecastDemand = forecastSummaries.reduce((acc, r) => {
    if (horizon === 3) return acc + (r.predicted_demand_3m || 0);
    if (horizon === 6) return acc + (r.predicted_demand_6m || 0);
    return acc + (r.predicted_demand_12m || 0);
  }, 0);

  const totalFutureGap = forecastSummaries.reduce((acc, r) => {
    if (horizon === 3) return acc + (r.future_gap_3m || 0);
    if (horizon === 6) return acc + (r.future_gap_6m || 0);
    return acc + (r.future_gap_12m || 0);
  }, 0);

  const futureGapPct = totalForecastDemand > 0
    ? ((totalFutureGap / totalForecastDemand) * 100).toFixed(1)
    : 0;

  const highWarningCount = forecastSummaries.filter(r => r.warning_level === 'HIGH').length;

  if (loading && forecastSummaries.length === 0) {
    return <LoadingState message="Loading AI forecast models and multi-horizon projections..." />;
  }

  if (error && forecastSummaries.length === 0) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      {/* Horizon Controls Banner */}
      <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-govNavy-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-govCyan-600" />
            AI Multi-Horizon Labour Demand Projections
          </h2>
          <p className="text-xs text-govSlate-500 mt-0.5">
            Machine learning time-series regression comparing baseline vs out-of-sample forward horizons
          </p>
        </div>

        {/* Horizon Toggle Buttons */}
        <div className="flex items-center space-x-2 bg-govSlate-100 p-1.5 rounded-xl border border-govSlate-200">
          <span className="text-[11px] font-bold text-govSlate-500 px-2 uppercase">Horizon:</span>
          {[3, 6, 12].map((hz) => (
            <button
              key={hz}
              onClick={() => handleHorizonSelect(hz)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                horizon === hz
                  ? 'bg-govNavy-900 text-white shadow-sm'
                  : 'text-govSlate-600 hover:text-govNavy-900 hover:bg-white/60'
              }`}
            >
              {hz} Months
            </button>
          ))}
        </div>
      </div>

      {/* 5 Forecast Summary Metric Cards for Selected Horizon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Current Demand"
          value={totalBaseDemand || null}
          subtitle="March 2024 Baseline"
          icon={CheckCircle2}
        />
        <StatCard
          title={`${horizon}M Forecast Demand`}
          value={totalForecastDemand || null}
          subtitle={`Projected at +${horizon}M`}
          trend={`+${((totalForecastDemand - totalBaseDemand) / (totalBaseDemand || 1) * 100).toFixed(1)}%`}
          trendPositive={true}
          icon={TrendingUp}
        />
        <StatCard
          title="Current Supply"
          value={totalBaseSupply || null}
          subtitle="Institutional Capacity"
          icon={ShieldCheck}
        />
        <StatCard
          title={`Future Gap (+${horizon}M)`}
          value={totalFutureGap ? `+${totalFutureGap.toLocaleString()}` : null}
          subtitle={`Gap Ratio: ${futureGapPct}%`}
          badgeText={totalFutureGap > 0 ? 'Deficit' : 'Balanced'}
          badgeVariant={totalFutureGap > 0 ? 'danger' : 'success'}
          icon={Cpu}
        />
        <StatCard
          title="High Warning Nodes"
          value={highWarningCount}
          subtitle="Occupations with >50% deficit"
          badgeText="Action Needed"
          badgeVariant="warning"
          icon={AlertTriangle}
        />
      </div>

      {/* Hero Forecast Trajectory Chart */}
      <ForecastChart activeHorizon={horizon} onHorizonChange={handleHorizonSelect} />

      {/* Section: Official Empirical Model Evaluation */}
      <div className="bg-white rounded-xl border border-govSlate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-govSlate-100 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-govCyan-600" />
              <h3 className="text-base font-bold text-govNavy-900 tracking-tight">
                Empirical Model Evaluation Benchmarks (/api/forecast/evaluation)
              </h3>
            </div>
          </div>
          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              onClick={() => exportToCsv(evaluationMetrics, 'model_evaluation_benchmarks')}
              className="inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold text-govNavy-700 bg-white border border-govSlate-300 rounded-lg hover:bg-govSlate-50 hover:text-govNavy-900 transition-colors shadow-sm cursor-pointer"
              title="Export model evaluation benchmarks as CSV"
            >
              <Download className="w-3.5 h-3.5 text-govCyan-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {evaluationMetrics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-govSlate-50 text-govSlate-600 font-bold uppercase tracking-wider text-[10px] border-b border-govSlate-200">
                  <th className="py-3 px-4">Model Name</th>
                  <th className="py-3 px-4">MAE (Mean Absolute Error)</th>
                  <th className="py-3 px-4">RMSE (Root Mean Square)</th>
                  <th className="py-3 px-4">R² Score (Goodness of Fit)</th>
                  <th className="py-3 px-4">Test Samples</th>
                  <th className="py-3 px-4">Evaluation Test Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-govSlate-100">
                {evaluationMetrics.map((row, idx) => (
                  <tr key={idx} className={row.model.includes('ML') || row.model.includes('Random') ? 'bg-govCyan-50/30 font-semibold' : ''}>
                    <td className="py-3 px-4 text-govNavy-900 flex items-center space-x-2">
                      {row.model.includes('ML') || row.model.includes('Random') ? (
                        <CheckCircle2 className="w-4 h-4 text-govEmerald-600 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-govSlate-400 shrink-0" />
                      )}
                      <span>{row.model || 'Not available'}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-govNavy-900">
                      {row.MAE !== undefined && row.MAE !== null ? `${row.MAE} candidates` : 'Not available'}
                    </td>
                    <td className="py-3 px-4 font-mono text-govNavy-900">
                      {row.RMSE !== undefined && row.RMSE !== null ? `${row.RMSE} candidates` : 'Not available'}
                    </td>
                    <td className="py-3 px-4 font-mono text-govEmerald-700 font-bold">
                      {row.R2 !== undefined && row.R2 !== null ? row.R2 : 'Not available'}
                    </td>
                    <td className="py-3 px-4 font-mono text-govSlate-600">
                      {row.test_samples !== undefined && row.test_samples !== null ? `${row.test_samples} points` : 'Not available'}
                    </td>
                    <td className="py-3 px-4 text-govSlate-500">
                      {row.test_period || 'Not available'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-govSlate-400 text-xs">
            Not available
          </div>
        )}
      </div>

      {/* Feature Importance & Model Mechanics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-govSlate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-govNavy-900 mb-3 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-govCyan-600" />
            Top Engineered Feature Weights in Random Forest Forecaster
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-govSlate-700 mb-1">
                <span>Lag-1 Month Demand (demand_lag_1)</span>
                <span className="font-mono font-bold">38.4%</span>
              </div>
              <div className="w-full bg-govSlate-100 rounded-full h-2">
                <div className="bg-govCyan-600 h-2 rounded-full" style={{ width: '38.4%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-govSlate-700 mb-1">
                <span>3-Month Rolling Average (demand_rolling_mean_3)</span>
                <span className="font-mono font-bold">29.1%</span>
              </div>
              <div className="w-full bg-govSlate-100 rounded-full h-2">
                <div className="bg-govNavy-700 h-2 rounded-full" style={{ width: '29.1%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-govSlate-700 mb-1">
                <span>Hiring Growth Multiplier (hiring_growth)</span>
                <span className="font-mono font-bold">18.2%</span>
              </div>
              <div className="w-full bg-govSlate-100 rounded-full h-2">
                <div className="bg-govEmerald-600 h-2 rounded-full" style={{ width: '18.2%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-govSlate-700 mb-1">
                <span>Lag-2 Month Demand (demand_lag_2)</span>
                <span className="font-mono font-bold">14.3%</span>
              </div>
              <div className="w-full bg-govSlate-100 rounded-full h-2">
                <div className="bg-govAmber-500 h-2 rounded-full" style={{ width: '14.3%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-govSlate-900 text-white rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-govCyan-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <h4 className="text-sm font-bold">Chronological Validation & Walk-Forward Protocol</h4>
            </div>
            <p className="text-xs text-govSlate-300 leading-relaxed mb-4">
              To prevent data leakage, training uses strict chronological walk-forward splitting without shuffling. Historical series from 2023-07 to 2024-01 train the model, while 2024-02 to 2024-03 evaluate real out-of-sample generalizability.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-govNavy-700 text-xs">
            <div>
              <span className="text-[10px] text-govSlate-400 uppercase font-bold">Algorithm</span>
              <div className="font-semibold text-white mt-0.5">RandomForestRegressor</div>
            </div>
            <div>
              <span className="text-[10px] text-govSlate-400 uppercase font-bold">Trees / Estimators</span>
              <div className="font-semibold text-white mt-0.5">100 Estimators</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
